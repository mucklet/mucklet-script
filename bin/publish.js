import { readFile } from "fs/promises";
import path from "path";
import { parse } from "tinyargs";
import { stdoutColors } from "./utils/terminal.js";
import { printHelp, printError } from "./utils/options.js";
import { getToken, loadConfig, compileScript, errToString, sha256File } from "./utils/tools.js";
import { createClient } from "./utils/client.js";

const defaultOutputDir = ".";
const defaultOutFile = "[name].wasm";

const options = [
	{ name: "config", flags: [ "c" ], type: String, default: "mucklet.config.js", value: "file", desc: "Mucklet script project config file" },
	{ name: "name", type: String, value: "keyword", desc: "Name of project script(s) to publish" },
	{ name: "room", type: String, value: "room id", desc: "Room ID of project script(s) to publish" },
	{ name: "apiurl", flags: [ "a" ], type: String, value: "url", desc: "Realm API WebSocket URL (eg. wss://api.test.mucklet.com)" },
	{ name: "token", flags: [ "t" ], type: String, value: "string", desc: [
		"Manager token (generated in realm under Player Settings)",
		"Overrides the MUCKLET_TOKEN environment variable",
	] },
	{ name: "tokenfile", flags: [ "T" ], type: String, value: "file", desc: [
		"File containing the manager token",
		"Overrides the MUCKLET_TOKEN_FILE environment variable",
	] },
	{ name: "outdir", type: String, desc: "Output directory for build files", value: "directory" },
	{ name: "outfile", type: String, desc: "Output wasm file name", value: "file name" },
	{ name: "help", flags: [ "h" ], type: Boolean, stop: true, desc: "Show this message" },
	{ name: "file", type: String, positional: true, optionalValue: true },
];

function help() {
	printHelp("Publish scripts to a Mucklet realm.", {
		syntax: [ stdoutColors.cyan("mucklet-script publish") + " [options] [file]" ],
		options: options,
	});
}

export default async function(version, args) {
	const cli = parse(args, options);
	if (cli.help) {
		help();
		process.exit(0);
	}

	const cfg = await loadConfig(version, cli.config || 'mucklet.config.js', {});

	// File uses room and name from cli flags
	if (cli.file) {
		cfg.scripts = [{
			name: cli.name || path.parse(cli.file).name,
			room: cli.room,
			path: cli.file,
		}];
	}

	// Output configuration
	if (cli.outDir) {
		cfg.output = Object.assign({}, cfg.output, { dir: cli.outDir });
	}
	if (cli.outFile) {
		cfg.output = Object.assign({}, cfg.output, { outFile: cli.outFile });
	}

	// Realm configuration
	if (cli.apiurl) {
		cfg.realm = Object.assign({}, cfg.realm, { apiUrl: cli.apiurl });
	}

	// Get token from cli or from environment variables
	const token = getToken(cli.token, cli.tokenFile);

	// Filter by name
	if (cli.name && cfg.scripts) {
		cfg.scripts = cfg.scripts.filter(script => script.name == cli.name);
	}

	// Filter by room ID
	if (cli.room && cfg.scripts) {
		cfg.scripts = cfg.scripts.filter(script => script.room == cli.room || ("#" + script.room) == cli.room);
	}

	// Validate config
	if (!token) {
		throw "missing realm manager token";
	}
	if (!cfg.realm?.apiUrl) {
		throw "missing realm api url";
	}

	await publishScripts(cfg, token, version);
}

async function publishScripts(cfg, token, version) {
	if (!cfg.scripts?.length) {
		printError("no scripts to publish", help);
		return;
	}

	console.log("\nConnecting to " + stdoutColors.cyan(cfg.realm.apiUrl) + " ...");

	const client = await createClient(cfg.realm.apiUrl, token);

	try {

		let result = [];

		for (const script of cfg.scripts) {
			result.push(await publishScript(cfg, script, client, version));
		}

		console.log("\n\n" + stdoutColors.white("Publish result:"));
		console.log(cfg.scripts.map((script, idx) => {
			let name = " - " + stdoutColors.cyan(script.name) + (script.room ? " - Room #" + script.room : "");
			let o = result[idx];
			const space = "\n    ";
			return "\n  " +
				(o?.errors
					? stdoutColors.red("Failed") + name + (o.errors.map(s => space + s).join("") || '')
					: o?.skipped
						? stdoutColors.yellow("Skipped") + name + (o.skipped.map(s => space + s).join("") || '')
						: stdoutColors.green("Success") + name
				) + (o?.result?.map(s => space + s).join("") || '');
		}).join("\n"));
	} finally {
		client.disconnect();
	}
}

function replacePlaceholder(file, script) {
	return file
		.replace(/\[name\]/, script.name)
		.replace(/\[room\]/, script.room || "noroom");
}

function skipWithMessage(msg, result) {
	console.log("  Skipping: " + stdoutColors.yellow(msg));
	return { skipped: [ msg ], result };
}

function errorMsg(msg, err) {
	err = errToString(err);
	console.log();
	console.log("  " + stdoutColors.red(err));
	return { errors: [ stdoutColors.red(msg + ": " + err) ] };
}

/**
 * Publishes a single script.
 * @param {MuckletConfig} cfg Mucklet configuration object.
 * @param {*} script Script configuration object.
 * @param {ApiClient*} client API client-
 * @param {string} version Version in the format "1.X.Y".
 * @returns {{ result?: string, skipped?: string, error?: any }} Publish result.
 */
async function publishScript(cfg, script, client, version) {
	const room = (script.room || "").trim().replace(/^#/, '');

	console.log("\nPublishing script " + stdoutColors.cyan(script.name) + (room ? " - Room #" + room : ''));

	if (!room) {
		return skipWithMessage("missing room");
	}
	if (!room.match(/^[a-vA-V0-9]{20,20}$/)) {
		return errorMsg("invalid room ID");
	}

	const outputDir = replacePlaceholder(cfg.output?.dir || defaultOutputDir, script);
	const outFile = path.join(outputDir, replacePlaceholder(cfg.output?.outFile || defaultOutFile, script));

	console.log("  Building script " + stdoutColors.cyan(script.path) + " ...");

	try {
		compileScript(script.path, outFile);
	} catch (err) {
		console.log();
		console.log(err?.stderr?.toString
			? stdoutColors.red(err.stderr.toString())
			: err,
		);
		return { errors: [ stdoutColors.red("build error") ] };
	}

	console.log("  Reading output file " + stdoutColors.cyan(outFile) + " ...");

	const contents = await readFile(outFile, { encoding: 'base64' });

	console.log("  Getting existing room script ...");

	let roomScript;
	try {
		roomScript = await getRoomScriptByName(client, room, script.name);
	} catch (err) {
		return errorMsg("error getting room", err);
	}

	if (roomScript) {

		// Check if it is identical.
		const roomScriptDetails = await client.get(`core.roomscript.${roomScript.id}.details`);
		let params = {
			key: script.name.toLowerCase() != roomScript.key ? script.name.toLowerCase() : undefined,
			target: version != roomScriptDetails.target ? version : undefined,
			active: typeof script.active == "boolean" && script.active != roomScript.active ? script.active : undefined,
			binary: contents,
		};
		if (roomScriptDetails.binary?.sha256) {
			const hash = await sha256File(outFile);
			if (roomScriptDetails.binary.sha256 == hash) {
				delete params.binary;
			}
		}
		if (!Object.keys(params).find(k => typeof params[k] !== "undefined")) {
			return skipWithMessage("Unchanged", [
				`Script ID   #${roomScript.id}`,
				`Active      ${roomScript.active ? "Yes" : "No"}`,
			]);
		}

		console.log(`  Updating room script #${roomScript.id} ...`);
		try {
			await roomScript.call('set', params);
		} catch (err) {
			return errorMsg("error updating room script", err);
		}
	} else {
		console.log("  Creating room script ...");
		try {
			roomScript = await client.call(`core.room.${room}.scripts`, 'create', {
				key: script.name,
				binary: contents,
				target: version,
				active: typeof script.active == "boolean" ? script.active : undefined,
			});
		} catch (err) {
			return errorMsg("error creating room script", err);
		}
	}

	return { result: [
		`Script ID   #${roomScript.id}`,
		`Active      ${roomScript.active ? "Yes" : "No"}`,
	] };
}

/**
 * Get a room script model by name from the API.
 * @param {ApiClient} client API client.
 * @param {string} room  Room ID.
 * @param {*} name Script name/key
 * @returns {Model}
 */
async function getRoomScriptByName(client, room, name) {
	name = name.toLowerCase();
	let roomScripts = await client.get(`core.room.${room}.scripts`);
	for (let roomScript of roomScripts) {
		if (roomScript.key == name) {
			return roomScript;
		}
	}
	return null;
}
