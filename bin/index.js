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
	{ cmd: 'logs', desc: "Fetches the logs of published scripts" },
	{ cmd: 'publish', desc: "Publishes scripts to a Mucklet realm" },
];

const options = [
	{ name: "help", flags: ["h"], type: Boolean, stop: true, desc: "Show this message"},
];

const TAB = "  ";

function help() {
	printHelp("Set up and manage a mucklet script project.", {
		syntax: stdoutColors.cyan("mucklet-script") + " COMMAND [OPTIONS]",
		commands: cmds,
		options: options,
	});
}

const cmd = (process.argv[2] || "").toLowerCase();

if (!cmd) {
	help();
	process.exit(0);
}

if (!cmds.find(o => o.cmd == cmd)) {
	if (cmd[0] == '-') {
		try {
			const cli = parse(process.argv.slice(2), options);
		} catch (ex) {
			printError(ex?.message || ex);
		}

		if (cli.help) {
			help();
			process.exit(0);
		}
	}
	printError("unknown mucklet-script command: " + cmd, help);
}

try {
	const cmdFunc = (await import("./" + cmd + ".js")).default;
	await Promise.resolve(cmdFunc(version, process.argv.slice(3)));
} catch (ex) {
	printError(ex?.message || ex);
}
