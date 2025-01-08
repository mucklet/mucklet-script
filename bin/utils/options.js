import { createInterface } from "readline";
import { stdoutColors } from "./terminal.js";

const TAB = "  ";
const PAD = 20;

/**
 * Generate help from an array of options.
 * @param {Array.<{name: string, flags: Array.<string>, desc: string, positional: boolean}>} options Array of options
 * @param {object} [opts] Optional parameters
 * @param {string} [opts.indent] Indentation for each line. Defaults to "".
 * @param {string} [opts.padding] Padding for flags column. Defaults to 20.
 * @param {string} [opts.noflagIndent] Additional indentation on no flags. Defaults to "    ".
 * @returns {string} Help string
 */
export function help(options, opts) {
	const indent = opts?.indent || TAB;
	const padding = opts.padding || PAD;
	const noflagIndent = opts?.noflagIndent || "    ";
	return options.filter(o => !o.positional).map(o => {
		let s = indent || "";
		if (o.flags?.length) {
			o.flags.forEach(f => s += "-" + f + ", ");
		} else {
			s += noflagIndent;
		}
		s += "--" + o.name;
		s += (" ".repeat(padding - s.length + indent.length)) + o.desc;
		return s;
	}).join("\n");
}

export function printError(msg, showHelp) {
	msg = typeof msg == "string"
		? msg
		: String(msg) || "An error occurred";

	console.log("\n" + stdoutColors.red(msg));
	if (showHelp) {
		showHelp();
	}
	process.exit(1);
}

/**
 * Prints a usage message.
 * @param {string} desc Command description
 * @param {object} [opts] Optional parameters
 * @param {Array.<{cmd: string, desc: string }>} opts.commands Array of commands.
 * @param {Array.<{name: string, flags: Array.<string>, desc: string }>} opts.options Array of options.
 * @param {string} [opts.indent] Indentation for each line. Defaults to "".
 * @param {string} [opts.padding] Padding for flags and commands column, Defaults to 20.
 */
export function printHelp(desc, opts) {
	const indent = opts?.indent || TAB;
	const padding = opts?.padding || PAD;
	console.log("\n" +
		desc +
		(opts.syntax
			? "\n\n" + stdoutColors.white("SYNTAX") + "\n" + indent + opts.syntax
			: "") +
		(opts.commands
			? "\n\n" + stdoutColors.white("COMMANDS") + opts.commands.map(o => "\n" + indent + stdoutColors.cyan(o.cmd) + (" ".repeat(padding - o.cmd.length)) + o.desc).join("")
			: "") +
		(opts.options
			? "\n\n" + stdoutColors.white("OPTIONS") + "\n" + help(opts.options, {
				indent: indent,
				padding: padding,
			})
			: "")
	);
}

/**
 * Asks the question: "Do you want to proceed?" and exits if answer is not empty
 * and not Y or Yes.
 * @param {boolean} forceYes Skip asking the question and assume Yes.
 * @returns {Promise} Promise that resolves on Yes.
 */
export function proceedQuestion(forceYes = false) {
	return new Promise(resolve => {
		if (forceYes) {
			resolve();
		} else {
			const rl = createInterface({
				input: process.stdin,
				output: process.stdout
			});
			return rl.question(stdoutColors.white("Do you want to proceed?") + " [Y/n] ", result => {
				rl.close();
				if (!/^(|y|yes)$/i.test(result)) {
					process.exit(1);
				}
				resolve();
			});
		}
	});
}