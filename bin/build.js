import path from "path";
import { parse } from "tinyargs";
import { stat } from "fs/promises";
import { stdoutColors } from "./utils/terminal.js";
import { printHelp, printError } from "./utils/options.js";
import { loadConfig, compileScript, formatByteSize } from "./utils/tools.js";

const defaultOutputDir = ".";
const defaultOutFile = "[name].wasm";
const defaultTextFile = "[name].wat";
const defaultMaxPages = 8;

const defaultMuckletConfig = {
	output: {
		"path": defaultOutputDir,
		"outFile": defaultOutFile,
		"textFile": defaultTextFile,
		"maxPages": defaultMaxPages,
	},
};

const options = [
	{ name: "config", flags: [ "c" ], type: String, desc: "Mucklet script project config file", default: "mucklet.config.js", value: "file" },
	{ name: "name", type: String, desc: "Name of project script(s) to build", value: "keyword" },
	{ name: "room", type: String, desc: "Room ID of project script(s) to build", value: "room id" },
	{ name: "outdir", type: String, desc: "Output directory for build files", value: "directory" },
	{ name: "outfile", type: String, desc: "Output wasm file name", value: "file name" },
	{ name: "textfile", type: String, desc: "Output wasm text file name", value: "file name" },
	{ name: "maxpages", type: Number, desc: "Maximum memory pages", value: 8},
	{ name: "rawoutput", type: Boolean, desc: "Show raw asc output only", value: false },
	{ name: "help", flags: [ "h" ], type: Boolean, stop: true, desc: "Show this message" },
	{ name: "files", type: String, positional: true, multiple: true, optionalValue: true },
];

function help() {
	printHelp("Build a Mucklet script project or single script files.", {
		syntax: [ stdoutColors.cyan("mucklet-script build") + " [options] [file ...]" ],
		options: options,
	});
}

export default async function(version, args) {
	const cli = parse(args, options);
	if (cli.help) {
		help();
		process.exit(0);
	}

	const cfg = await loadConfig(version, cli.config || 'mucklet.config.js', !cli.config && defaultMuckletConfig);

	if (cli.files) {
		if (cli.name) {
			printError("cannot filter by name when building single script files", help);
		}
		if (cli.room) {
			printError("cannot filter by room ID when building single script files", help);
		}
		cfg.scripts = cli.files.map(file => ({
			name: path.parse(file).name,
			path: file,
		}));
	}


	// Output configuration
	if (cli.outdir) {
		cfg.output = Object.assign({}, cfg.output, { dir: cli.outdir });
	}
	if (cli.outfile) {
		cfg.output = Object.assign({}, cfg.output, { outFile: cli.outfile });
	}
	if (cli.textfile) {
		cfg.output = Object.assign({}, cfg.output, { textFile: cli.textfile });
	}
	if (cli.maxpages) {
		cfg.output = Object.assign({}, cfg.output, { maxPages: cli.maxpages });
	}
	if (cli.rawoutput) {
		cfg.output = Object.assign({}, cfg.output, { rawOutput: cli.rawoutput });
	}

	// Filter by name
	if (cli.name && cfg.scripts) {
		cfg.scripts = cfg.scripts.filter(script => script.name == cli.name);
	}

	// Filter by room ID
	if (cli.room && cfg.scripts) {
		cfg.scripts = cfg.scripts.filter(script => script.room == cli.room || ("#" + script.room) == cli.room);
	}

	await buildScripts(cfg);
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
		(result[idx] ? stdoutColors.green("Success") : stdoutColors.red("Failure")) +
		" - " + stdoutColors.cyan(script.name) +
		(script.room ? " - Room #" + script.room : "")
	)).join("\n"));
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
		compileScript(script.path, outFile, textFile);
	} catch (err) {
		let errMsg = err?.stderr?.toString
			? stdoutColors.red(err.stderr.toString())
			: err;
		if (cfg.output?.rawOutput) {
			process.stderr.write(errMsg);
			process.exit(err?.status || 1);
		}
		console.log();
		console.log(errMsg);
		return false;
	}
	var outfileSize = (await stat(outFile)).size;
	var textfileSize = (await stat(textFile)).size;
	console.log("Outfile: " + stdoutColors.cyan(outFile) + stdoutColors.gray(" (" + formatByteSize(outfileSize) + ")"));
	console.log("TextFile: " + stdoutColors.cyan(textFile) + stdoutColors.gray(" (" + formatByteSize(textfileSize) + ")"));
	return true;
}
