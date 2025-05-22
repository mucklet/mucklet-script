import { TSConfigReader, Application as TypeDocApplication } from 'typedoc';
import * as ts from 'typescript';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import DocsConverter from './devutils/docsconverter.js'
// import { ProjectParser } from 'typedoc-json-parser';

const jsonFile = './build/docs.json';
const docFile = './docs/documentation.md';

const app = await TypeDocApplication.bootstrap({
    tsconfig: './lib/tsconfig.json',
    entryPoints: [ './lib/host.ts' ],
}, [
	new TSConfigReader(),
]);

const program = ts.createProgram(
    app.options.getFileNames(),
    app.options.getCompilerOptions()
);

const project = app.converter.convert(app.getEntryPoints() ?? []);

await app.generateJson(project, jsonFile);

const data = JSON.parse(await readFile(resolve(process.cwd(), jsonFile), {
	encoding: 'utf8',
}));


await writeFile(resolve(process.cwd(), docFile), new DocsConverter(data).toMarkdown("Mucklet Script Documentation"), {
	encoding: 'utf8',
});
