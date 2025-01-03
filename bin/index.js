#!/usr/bin/env node

import { createRequire } from "module";
import { stdoutColors } from "./utils/terminal.js";
const require = createRequire(import.meta.url);
const version = require("../package.json").version;

const cmds = [
	{ cmd: 'init', desc: "Sets up a new Mucklet script project or updates an existing one" },
	{ cmd: 'logs', desc: "Fetches the logs of published scripts" },
	{ cmd: 'publish', desc: "Publishes scripts to a Mucklet realm" },
];

const TAB = "  ";

function printHelp() {
	console.log([
		"",
		"Set up and manage a mucklet script project.",
		"",
		stdoutColors.white("SYNTAX"),
		TAB + stdoutColors.cyan("mucklet-script") + " [OPTIONS] COMMAND",
		"",
		stdoutColors.white("COMMANDS"),
		...cmds.map(o => TAB + stdoutColors.cyan(o.cmd) + ("         ").slice(o.cmd.length) + o.desc),
		"",
		stdoutColors.white("OPTIONS"),
		// optionsUtil.help(globalOptions, { noCategories: true })
	].join("\n"));
}

function printError(msg, showHelp = true) {
	msg = typeof msg == "string"
		? msg
		: String(msg) || "An error occurred";

	console.log("\n" + stdoutColors.red(msg) + (showHelp ? "" : "\n"));
	if (showHelp) {
		printHelp();
	}
	process.exit(1);
}

const cmd = (process.argv[2] || "").toLowerCase();

if (!cmd) {
	printHelp();
	process.exit(0);
}

if (!cmds.find(o => o.cmd == cmd)) {
	printError("Unknown mucklet-script command: " + cmd);
}

try {
	const cmdFunc = require("./" + cmd + ".js").default;
	cmdFunc(version, process.argv.slice(3));
} catch (ex) {
	printError(ex?.message | ex | "An error occurred", false);
}
