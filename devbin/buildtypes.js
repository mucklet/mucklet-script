import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { rootDir } from "../bin/utils/tools.js";

exec('tsc lib/host.ts --declaration --emitDeclarationOnly --outDir build/types', {
	cwd: rootDir,
}, (error, stdout, stderr) => {
	// Read file into a string
	let content = fs.readFileSync(path.join(rootDir, 'build', 'types', 'host.d.ts'), 'utf8');

	// Modify file contents
	content = content
		.replace(/^import \{.*\n/gm, "")      // (delete the line)
		.replace(/^export \{.*\n/gm, "")      // (delete the line)
		.replace(/^\s*export \{\};\n/gm, "")  // (delete lines with just `export {};`)
		.replace(/^(\s*)export /gm, "$1")     // (remove the 'export' word)
		.replace(/ {4}/g, "\t");              // (replace spaces with tabs)

	const destFile = path.join(rootDir, 'lib', 'types', 'host', 'index.d.ts');

	fs.writeFileSync(destFile, content, 'utf-8');

	console.log("Completed!");
});
