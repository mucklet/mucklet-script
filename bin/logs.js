import { parse } from "tinyargs";
import { stdoutColors } from "./utils/terminal.js";
import { printHelp, printError } from "./utils/options.js";
import { getToken, loadConfig, errToString, formatTime } from "./utils/tools.js";
import { createClient, getRoomScriptByName, isResError } from "./utils/client.js";

const options = [
	{ name: "config", flags: [ "c" ], type: String, default: "mucklet.config.js", value: "file", desc: "Mucklet script project config file" },
	{ name: "follow", flags: [ "f" ], type: Boolean, desc: "Follow log output" },
	{ name: "tail", flags: [ "n" ], type: String, value: "number", desc: "Number of lines to show per script from the end of the logs" },
	{ name: "name", type: String, value: "keyword", desc: "Name of project script(s) to show logs for" },
	{ name: "room", type: String, value: "room id", desc: "Room ID of project script(s) to show logs for" },
	{ name: "apiurl", flags: [ "a" ], type: String, value: "url", desc: "Realm API WebSocket URL (eg. wss://api.test.mucklet.com)" },
	{ name: "token", flags: [ "t" ], type: String, value: "string", desc: [
		"Manager token (generated in realm under Player Settings)",
		"Overrides the MUCKLET_TOKEN environment variable",
	] },
	{ name: "tokenfile", flags: [ "T" ], type: String, value: "file", desc: [
		"File containing the manager token",
		"Overrides the MUCKLET_TOKEN_FILE environment variable",
	] },
	{ name: "help", flags: [ "h" ], type: Boolean, stop: true, desc: "Show this message" },
	{ name: "scriptids", type: String, positional: true, multiple: true, optionalValue: true },
];

const logLvl = {
	log: { color: s => s, tag: "[LOG]" },
	debug: { color: s => stdoutColors.gray(s), tag: "[DBG]" },
	info: { color: s => stdoutColors.white(s), tag: "[INF]" },
	warn: { color: s => stdoutColors.yellow(s), tag: "[WRN]" },
	error: { color: s => stdoutColors.red(s), tag: "[ERR]" },
};

function help() {
	printHelp("Fetch scripts logs.", {
		syntax: [ stdoutColors.cyan("mucklet-script logs") + " [options] [script id ...]" ],
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
	if (cli.scriptids) {
		if (cli.name) {
			printError("cannot filter by name when fetching logs by script ID", help);
		}
		if (cli.room) {
			printError("cannot filter by room ID when fetching logs by script ID", help);
		}
		cfg.scripts = cli.scriptids.map(scriptId => ({
			id: scriptId.trim().replace(/^#/, ''),
		}));
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

	// Verify tail is a number
	var tail = "all";
	if (cli.tail && cli.tail.toLowerCase() != "all") {
		tail = Number(cli.tail);
		if (isNaN(tail)) {
			throw 'tail must be a number or "all"';
		}
		if (tail < 0) {
			throw "tail must be a positive number";
		}
	}

	// Validate config
	if (!token) {
		throw "missing realm manager token";
	}
	if (!cfg.realm?.apiUrl) {
		throw "missing realm api url";
	}

	await showLogs(cfg, token, cli.follow, cli.tail);
}


function skipMsg(msg) {
	console.log("  Skipping: " + stdoutColors.yellow(msg));
}

function hasDuplicateKey(roomScripts) {
	let rsNames = {};
	for (let rs of roomScripts) {
		if (rsNames[rs.key]) {
			return true;
		}
		rsNames[rs.key] = true;
	}
	return false;
}

function validateLog(prefix, log) {
	if (isResError(log)) {
		console.log(prefix + stdoutColors.red("Error getting entry " + log.getResourceId() + ": " + errToString(log)));
		return false;
	}
	return true;
}

async function showLogs(cfg, token, follow, tail) {
	if (!cfg.scripts?.length) {
		printError("no scripts to show logs for", help);
		return;
	}

	console.log("\nConnecting to " + stdoutColors.cyan(cfg.realm.apiUrl) + " ...");

	const client = await createClient(cfg.realm.apiUrl, token);

	try {
		const roomScripts = [];

		console.log("Getting room scripts ...");

		for (const script of cfg.scripts) {
			try {
				let rs = await getRoomScriptDetails(script, client);
				if (rs) {
					rs.on();
					roomScripts.push(rs);
				}
			} catch (err) {
				console.log("  " + stdoutColors.red(errToString(err)));
				if (typeof err != 'string') {
					console.error(err);
				}
			}
		}

		if (!roomScripts.length) {
			printError("no scripts to show logs for");
			return;
		}

		let hasDuplicates = hasDuplicateKey(roomScripts);
		let names = {};
		let maxLen = 0;
		for (let rs of roomScripts) {
			const s = rs.key + (hasDuplicates ? '#' + rs.id : '');
			maxLen = Math.max(maxLen, s.length);
			names[rs.id] = s;
		}

		let logs = [];
		let i = 0;
		let colors = [ 'green', 'blue', 'yellow', 'magenta', 'cyan', 'red' ];
		for (let rs of roomScripts) {
			let name = names[rs.id];
			let prefix = roomScripts.length > 1
				? stdoutColors[colors[i]](name + (" ".repeat(maxLen - name.length)) + "  | ")
				: '';
			i = (i + 1) % colors.length;
			// Validate log entries and output errors.
			let rslogs = rs.logs.toArray().filter(log => validateLog(prefix, log));
			if (tail != "all" && rslogs.length > tail) {
				rslogs.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
				rslogs = rslogs.slice(rslogs.length - tail);
			}
			logs = logs.concat(rslogs.map(log => ({ prefix, log })));
			if (follow) {
				rs.logs.on('add', (ev) => onLogAdd(prefix, ev.item));
			} else {
				rs.off();
			}
		}

		console.log();

		// Sort all log entries and display them.
		logs.sort((a, b) => a.log.time - b.log.time || a.log?.id?.localeCompare(b.log?.id));
		for (let l of logs) {
			onLogAdd(l.prefix, l.log);
		}

		if (follow) {
			await waitForCtrlC();
		}
	} finally {
		client.disconnect();
	}
}

function onLogAdd(prefix, log) {
	if (validateLog(prefix, log)) {
		const lvl = logLvl[log.lvl] || { color: s => s, tag: "[???]" };
		console.log(prefix + stdoutColors.white(formatTime(log.time)) + " " + lvl.color(lvl.tag + " " + log.msg));
	}
}

/**
 * Fetches logs for a single script.
 * @param {ScriptConfig} script Script configuration object.
 * @param {ApiClient*} client API client.
 */
async function getRoomScriptDetails(script, client) {
	const room = (script.room || "").trim().replace(/^#/, '');

	console.log("Fetching " + (script.id && !script.name
		? +" ID " + stdoutColors.cyan("#" + script.id)
		: stdoutColors.cyan(script.name) + (room ? " - Room #" + room : '')
	));
	let scriptId = script.id;
	if (scriptId) {
		if (!room.match(/^[a-vA-V0-9]{20,20}$/)) {
			throw "invalid script ID";
		}
	} else {
		if (!room) {
			return skipMsg("missing room");
		}
		if (!script.name) {
			return skipMsg("missing name");
		}
		if (!room.match(/^[a-vA-V0-9]{20,20}$/)) {
			throw "invalid room ID";
		}

		const roomScript = await getRoomScriptByName(client, room, script.name);
		if (!roomScript) {
			return skipMsg("script not deployed to room");
		}
		scriptId = roomScript.id;
	}

	return await client.get(`core.roomscript.${scriptId}.details`);
}

function waitForCtrlC() {
	return new Promise(resolve => {
		const cb = () => {
			console.log("Disconnecting ...");
			resolve();
		};
		process.on('SIGINT', cb);
		process.on('SIGTERM', cb);
	});
}
