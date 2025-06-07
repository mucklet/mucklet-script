import { TSConfigReader, Application as TypeDocApplication } from 'typedoc';
import * as ts from 'typescript';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import DocsConverter from './devutils/docsconverter.js'
// import { ProjectParser } from 'typedoc-json-parser';

const entryFile = './lib/host.ts';
const tempEntryFile = './build/host.modified.ts';
const tempTsconfigFile = './build/tsconfig.json';
const jsonFile = './build/docs.json';
const docFile = './docs/documentation.md';

// Modify type aliases to prevent typescript from resolving them.
let typeAliases = {};
let entry = await readFile(resolve(process.cwd(), entryFile), {
	encoding: 'utf8',
});
entry = entry.replace(/^(export type +([^\s=]+)\s*=\s*(string|number|boolean));/gm, (match, all, name, type) => {
	typeAliases[name] = type;
	return all + " & { foo?: never };";
});
await writeFile(resolve(process.cwd(), tempEntryFile), entry, {
	encoding: 'utf8',
});
await writeFile(resolve(process.cwd(), tempTsconfigFile), `{
  "compilerOptions": {
    "strictNullChecks": true
  },
  "files": [ "host.modified.ts" ],
}`, {
	encoding: 'utf8',
});

const app = await TypeDocApplication.bootstrap({
    tsconfig: tempTsconfigFile,
    entryPoints: [ tempEntryFile ],
	sort: ["source-order"],
}, [
	new TSConfigReader(),
]);

const project = app.converter.convert(app.getEntryPoints() ?? []);

await app.generateJson(project, jsonFile);

const data = JSON.parse(await readFile(resolve(process.cwd(), jsonFile), {
	encoding: 'utf8',
}));


await writeFile(resolve(process.cwd(), docFile), new DocsConverter(data, typeAliases).toMarkdown("Mucklet Script Documentation"), {
	encoding: 'utf8',
});
