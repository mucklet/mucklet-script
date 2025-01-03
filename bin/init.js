import { stdoutColors } from "./utils/terminal.js";

export default function(version, args) {
	console.log(stdoutColors.cyan("Running version: " + version));
	console.log(stdoutColors.blue(args.join(' ')));
}
