#!/usr/bin/env node

import { createRequire } from "module";
import { parse } from "tinyargs";
import { stdoutColors } from "./utils/terminal.js";
import { printHelp, printError } from "./utils/options.js";
const require = createRequire(import.meta.url);
const version = require("../package.json").version;

const cmds = [
	{ cmd: 'init', desc: "Sets up a new Mucklet script project or updates an existing one" },
	{ cmd: 'build', desc: "Builds a Mucklet script project or a single script file" },
	{ cmd: 'deploy', desc: "Deploys scripts to a Mucklet realm" },
	{ cmd: 'logs', desc: "Fetches the logs of deployed scripts" },
];

const options = [
	{ name: "help", flags: [ "h" ], type: Boolean, stop: true, desc: "Show this message" },
];

function help() {
	printHelp("Set up and manage a mucklet script project.", {
		syntax: [
			stdoutColors.cyan("mucklet-script") + " COMMAND [OPTIONS]",
			stdoutColors.cyan("mucklet-script help") + " COMMAND",
		],
		commands: cmds,
		options: options,
	});
}

let cmd = (process.argv[2] || "").toLowerCase();

if (!cmd) {
	help();
	process.exit(0);
}

if (cmd[0] == '-') {
	try {
		const cli = parse(process.argv.slice(2), options);
		if (cli.help) {
			help();
			process.exit(0);
		}
	} catch (ex) {
		printError(ex?.message || ex);
	}
}

// Allow "mucklet-script help build" type of help.
let args = process.argv.slice(3);
if (cmd == "help") {
	cmd = (args[0] || "").toLowerCase();
	args[0] = "--help";
}

if (!cmds.find(o => o.cmd == cmd)) {
	printError("unknown mucklet-script command: " + cmd, help);
}

try {
	const cmdFunc = (await import("./" + cmd + ".js")).default;
	await Promise.resolve(cmdFunc(version, args));
} catch (ex) {
	printError(ex?.message || ex);
}

// Ensure we exit and is not kept running due to some client connection
process.exit(0);
