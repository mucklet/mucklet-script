import { createInterface } from "readline";
import { stdoutColors } from "./terminal.js";

const TAB = "  ";
const PAD = 28;

/**
 * Generate help from an array of options.
 * @param {Array.<{name: string, flags: Array.<string>, desc: string, positional: boolean}>} options Array of options
 * @param {object} [opts] Optional parameters
 * @param {string} [opts.indent] Indentation for each line. Defaults to "".
 * @param {string} [opts.padding] Padding for flags column. Defaults to 28.
 * @param {string} [opts.noflagIndent] Additional indentation on no flags. Defaults to "    ".
 * @returns {string} Help string
 */
export function help(options, opts) {
	const indent = opts?.indent || TAB;
	const padding = opts.padding || PAD;
	const noflagIndent = opts?.noflagIndent || "    ";
	return options.filter(o => !o.positional).map(o => {
		let s = indent || "";
		let l = s.length;
		if (o.flags?.length) {
			o.flags.forEach(f => {
				s += stdoutColors.cyan("-" + f) + ", ";
				l += 3 + f.length;
			});
		} else {
			s += noflagIndent;
			l += noflagIndent.length;
		}
		s += stdoutColors.cyan("--" + o.name);
		l += 2 + o.name.length;
		if (o.value) {
			s += " <" + o.value + ">";
			l += 3 + o.value.length;
		}
		let desc = Array.isArray(o.desc) ? o.desc : [ o.desc ];
		s += (" ".repeat(Math.max(1, padding - l + indent.length))) + desc[0] + desc.slice(1).map(d => "\n" + (" ".repeat(padding + indent.length)) + d).join("");
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
			? "\n\n" + stdoutColors.white("Usage:") + opts.syntax.map(s => "\n" + indent + s).join("")
			: "") +
		(opts.commands
			? "\n\n" + stdoutColors.white("Commands:") + opts.commands.map(o => "\n" + indent + stdoutColors.cyan(o.cmd) + (" ".repeat(padding - o.cmd.length)) + o.desc).join("")
			: "") +
		(opts.options
			? "\n\n" + stdoutColors.white("Options:") + "\n" + help(opts.options, {
				indent: indent,
				padding: padding,
			})
			: ""),
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
				output: process.stdout,
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
