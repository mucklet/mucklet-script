import fs from "fs";
import path from "path";
import { parse } from "tinyargs";
import { fileURLToPath } from "url";
import { stdoutColors } from "./utils/terminal.js";
import { printHelp, proceedQuestion } from "./utils/options.js";
import { formatPath, mergeObjects } from "./utils/tools.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const options = [
	{ name: "help", flags: ["h"], type: Boolean, stop: true, desc: "Show this message" },
	{ name: "directory", type: String, positional: true, when: (cli) => !cli.help },
];

function help() {
	printHelp("Set up a new Mucklet script project or update an existing one.", {
		syntax: stdoutColors.cyan("mucklet-script init") + " [OPTIONS] DIRECTORY",
		options: options,
	});
}

export default async function(version, args) {
	const cli = parse(args, options);
	if (cli.help) {
		help();
		process.exit(0);
	}

	const rootDir = path.join(dirname, '..');
	const projectDir = path.resolve(cli.directory);
	const scriptsDir = path.join(projectDir, 'scripts');
	const tsconfigFile = path.join(scriptsDir, 'tsconfig.json');
	const entryFile = path.join(scriptsDir, 'index.ts');
	const buildDir = path.join(projectDir, 'build');
	const buildgitignoreFile = path.join(buildDir, '.gitignore');
	const testsDir = path.join(projectDir, 'tests');
	const testsIndexFile = path.join(testsDir, 'index.js');
	const packageFile = path.join(projectDir, 'package.json');
	const muckletConfigFile = path.join(projectDir, 'mucklet.config.js');
	const gitignoreFile = path.join(projectDir, '.gitignore');

	const projectDirExists = fs.existsSync(projectDir);
	const scriptsDirExists = fs.existsSync(scriptsDir);
	const tsconfigFileExists = fs.existsSync(tsconfigFile);
	const entryFileExists = fs.existsSync(entryFile);
	const buildDirExists = fs.existsSync(buildDir);
	const buildgitignoreFileExists = fs.existsSync(buildgitignoreFile);
	const testsDirExists = fs.existsSync(testsDir);
	const testsIndexFileExists = fs.existsSync(testsIndexFile);
	const packageFileExists = fs.existsSync(packageFile);
	const muckletConfigFileExists = fs.existsSync(muckletConfigFile);
	const gitignoreFileExists = fs.existsSync(gitignoreFile);

	const paths = {
		rootDir,
		projectDir,
		scriptsDir,
		tsconfigFile,
		entryFile,
		buildDir,
		buildgitignoreFile,
		testsDir,
		testsIndexFile,
		packageFile,
		muckletConfigFile,
		gitignoreFile,
	};

	const creates = [
		[ scriptsDir, "Directory holding the Mucklet script files.", !scriptsDirExists ],
		[ entryFile, "Example entry room script file to get you started.", !entryFileExists ],
		[ tsconfigFile, "TypeScript configuration for IDE code completion and hover information.", !tsconfigFileExists],
		[ buildDir, "Build artifact directory where compiled script files are stored.", !buildDirExists],
		[ buildgitignoreFile, "Git configuration that excludes compiled binaries from source control.", !buildgitignoreFileExists ],
		[ testsIndexFile, "Example test to check that the script is functioning.", !testsIndexFileExists ],
		[ packageFile, "Package info containing the necessary commands to compile Mucklet scripts.", !packageFileExists],
		[ muckletConfigFile, "Mucklet script configuration.", !muckletConfigFileExists ],
		[ gitignoreFile, "Git configuration that excludes node_modules and other generated files.", !gitignoreFileExists ],
	].filter(v => v[2])

	const updates = [
		[ 'package.json', packageFileExists ],
		[ 'tsconfig.json', tsconfigFileExists ],
	].filter(v => v[1]);

	console.log(
		"Version: " + version + "\n" +
		(creates.length
			? "\n" + stdoutColors.white("This command will create the following files in the directory:") +
				"\n" + stdoutColors.cyan(projectDir) + "\n\n"
			: "") +
		(creates.map(([filePath, description]) => "  " + stdoutColors.cyan(formatPath(projectDir, filePath)) + "\n  " + description + "\n").join("\n")) +
		(updates.length
			? "\nThe command will try to update existing " + (updates.map(([ name ]) => stdoutColors.cyan(name)).join(" and ")) + " to match the latest version.\n"
			: "")
	  );

	await proceedQuestion();
	createProject(version, paths, cli);
}

function createProject(version, paths, cli) {
	ensureDirectory("project", paths.projectDir);
	// Script
	ensureDirectory("'" + stdoutColors.cyan("scripts") + "'", paths.scriptsDir);
	ensureFile("'" + stdoutColors.cyan("scripts/index.ts") + "'", paths.entryFile, path.join(paths.rootDir, 'scripts', 'index.ts'));
	ensureJsonFile(
		"'" + stdoutColors.cyan("scripts/tsconfig.json") + "'",
		paths.tsconfigFile,
		{
			"include": [
				"./**/*.ts"
			],
		},
		{
			"extends": "../node_modules/mucklet-script/tsconfig.json",
		},
	);
	// Build
	ensureDirectory("'" + stdoutColors.cyan("build") + "'", paths.buildDir);
	ensureFile("'" + stdoutColors.cyan("build/.gitignore") + "'", paths.buildgitignoreFile, path.join(paths.rootDir, 'build', '.gitignore'));
	// Tests
	ensureDirectory("'" + stdoutColors.cyan("tests") + "'", paths.testsDir);
	ensureFile("'" + stdoutColors.cyan("scripts/index.ts") + "'", paths.testsIndexFile, path.join(paths.rootDir, 'tests', 'index.js'));
	// Config
	ensureJsonFile(
		"'" + stdoutColors.cyan("package.json") + "'",
		paths.packageFile,
		{
			"name": "mucklet-script-project",
			"scripts": {
			  "test": "node tests",
			  "build": "mucklet-script build scripts/index.ts"
			},
		},
		{
			"type": "module",
			"dependencies": {
				"mucklet-script": "^" + version
			}
		},
	);
	ensureFile("'" + stdoutColors.cyan("mucklet.config.js") + "'", paths.muckletConfigFile, path.join(paths.rootDir, 'mucklet.config.js'));
	ensureFile("'" + stdoutColors.cyan(".gitignore") + "'", paths.gitignoreFile, path.join(paths.rootDir, '.gitignore'));
}

function ensureDirectory(name, dir) {
	console.log("Ensuring " + name + " directory exists...");
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
		console.log(stdoutColors.green("  Created: ") + dir);
	} else {
		console.log(stdoutColors.yellow("  Exists: ") + dir);
	}
	console.log();
}

function ensureFile(name, dstPath, srcPath) {
	console.log("Ensuring " + name + " exists...");
	if (!fs.existsSync(dstPath)) {
		fs.copyFileSync(srcPath, dstPath);
		console.log(stdoutColors.green("  Created: ") + dstPath);
	} else {
		console.log(stdoutColors.yellow("  Exists: ") + dstPath);
	}
	console.log();
}

function ensureJsonFile(name, path, createProps, updateProps) {
	console.log("Ensuring " + name + " is set up...");
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify(mergeObjects({}, createProps, updateProps), null, 2));
		console.log(stdoutColors.green("  Created: ") + path);
	} else {
		let dta = JSON.parse(fs.readFileSync(path, "utf8"));
		fs.writeFileSync(path, JSON.stringify(mergeObjects({}, createProps, dta, updateProps), null, 2));
		console.log(stdoutColors.green("  Updated: ") + path);
	}
	console.log();
}
