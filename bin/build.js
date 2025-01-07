import fs from "fs";
import path, { format } from "path";
import { parse } from "tinyargs";
import { fileURLToPath } from "url";
import { stdoutColors } from "./utils/terminal.js";
import { printHelp, printError, proceedQuestion } from "./utils/options.js";
import { formatPath, mergeObjects } from "./utils/tools.js";
import { execSync } from 'child_process';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(dirname, '..');
const cwd = process.cwd();
const defaultOutputDir = ".";
const defaultOutFile = "[name].wasm";
const defaultTextFile = "[name].wat";

const defaultMuckletConfig = {
	output: {
		"path": defaultOutputDir,
		"outFile": defaultOutFile,
		"textFile": defaultTextFile,
	},
};

const options = [
	{ name: "config", flags: ["c"], type: String, desc: "Mucklet script config file", default: "mucklet.config.js" },
	{ name: "file", flags: ["f"], type: String,  desc: "Script file to build" },
	{ name: "help", flags: ["h"], type: Boolean, stop: true, desc: "Show this message" },
];

function help() {
	printHelp("Build a Mucklet script project or single script files.", {
		syntax: stdoutColors.cyan("mucklet-script build") + " [OPTIONS]",
		options: options,
	});
}

export default async function(version, args) {
	const cli = parse(args, options);
	if (cli.help) {
		help();
		process.exit(0);
	}

	const cfg = await loadConfig(version, cli.config || 'mucklet.config.js', !cli.config);

	if (cli.file) {
		cfg.scripts = [{
			name: path.parse(cli.file).name,
			path: cli.file,
		}];
	}

	await buildScripts(cfg);
}

async function loadConfig(version, configFile, defaultOnNotFound) {
	configFile = path.resolve(configFile);

	let cfgDefault;
	if (defaultOnNotFound && !fs.existsSync(configFile)) {
		return Promise.resolve(defaultMuckletConfig);
	}

	try {
		cfgDefault = (await import(formatPath(dirname, configFile))).default;
	} catch(ex) {
		throw "error loading config file: " + (ex?.message || ex);
	}

	return Promise.resolve(typeof cfgDefault == "function"
		? cfgDefault(version)
		: cfgDefault
	);
}

async function buildScripts(cfg) {
	if (!cfg.scripts?.length) {
		printError("no scripts to build", help);
		return;
	}

	let result = [];

	for (const script of cfg.scripts) {
		result.push(await buildScript(cfg, script));
	}

	console.log("\n" + stdoutColors.white("Build result:"));
	console.log(cfg.scripts.map((script, idx) => (
		"  " +
		(result[idx] ? stdoutColors.green("✓ ") : stdoutColors.red("✗ ")) +
		script.name +
		(script.room ? "Room #" + script.room : "")
	)).join("\n"));
}

function escapeExecPath(file) {
	return `"${path.resolve(cwd, file).replace(/"/, '\\"')}"`;
}

function replacePlaceholder(file, script) {
	return file
		.replace(/\[name\]/, script.name)
		.replace(/\[room\]/, script.room || "noroom");
}

async function buildScript(cfg, script) {
	console.log("\nBuilding script " + stdoutColors.cyan(script.path) + " ...");
	const outputDir = replacePlaceholder(cfg.output?.dir || defaultOutputDir, script);
	const outFile = path.join(outputDir, replacePlaceholder(cfg.output?.outFile || defaultOutFile, script));
	const textFile = path.join(outputDir, replacePlaceholder(cfg.output?.textFile || defaultTextFile, script));
	try {
		execSync(
			`npx asc ${escapeExecPath(script.path)} -o ${escapeExecPath(outFile)} -t ${escapeExecPath(textFile)} --runtime minimal --exportRuntime --lib ./lib/host.ts --lib ./lib/env.ts`,
			{
				cwd: rootDir,
				stdio: [ "pipe", "pipe", "pipe" ],
			}
		);
	} catch (err) {
		console.log();
		console.log(stdoutColors.red(err.stderr.toString()));
		return false
	}

	console.log("Outfile: " + stdoutColors.cyan(outFile));
	console.log("TextFile: " + stdoutColors.cyan(textFile));
	return true;
}
