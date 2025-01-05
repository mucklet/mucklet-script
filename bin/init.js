import { stdoutColors } from "./utils/terminal.js";
import { printHelp, printError } from "./utils/options.js";
import { parse } from "tinyargs";

const options = [
	{ name: "help", flags: ["h"], type: Boolean, stop: true, desc: "Show this message"},
];

function help() {
	printHelp("Set up a new Mucklet script project or update an existing one.", {
		syntax: stdoutColors.cyan("mucklet-script init") + " [OPTIONS]",
		options: options,
	});
}

export default function(version, args) {
	const cli = parse(args, options);
	if (cli.help) {
		help();
		process.exit(0);
	}
	console.log(stdoutColors.cyan("Running version: " + version));
	console.log(stdoutColors.blue(args.join(' ')));
}
