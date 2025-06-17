
import path from 'path';
import { mock } from 'node:test';
import { rootDir, compileScript } from '../bin/utils/tools.js';
import { fileURLToPath, pathToFileURL} from "url";

const buildDir = path.join(rootDir, 'build');

/**
 * Resolves a full path from a import.meta.url to a file in posix format.
 * @param {string} url Import meta url to resolve from
 * @param {string} filePath File path (with posix separators is used)
 */
export function resolvePath(url, filePath) {
	return path.join(path.dirname(fileURLToPath(url)), filePath.replaceAll(path.posix.sep, path.sep));
}

export async function buildScript(scriptPath) {
	const filename = path.parse(scriptPath).name;
	const outFile = path.join(buildDir, filename + '.wasm');
	const textFile = path.join(buildDir, filename + '.wat');
	const scriptFile = path.join(buildDir, filename + '.js');

	try {
		compileScript(scriptPath, outFile, textFile);
	} catch (err) {
		let errMsg = err?.stderr?.toString
			? err.stderr.toString()
			: err;
		throw errMsg;
	}

	const script = await import(pathToFileURL(scriptFile));

	return script;
}

export function mockGlobal(global) {
	global.room = {
		describe: mock.fn((msg) => {}),
		listen: mock.fn((instance) => {}),
		unlisten: mock.fn((instance) => {}),
		getRoom: mock.fn(() => JSON.stringify(room)),
		setRoom: mock.fn((json) => {}),
		useProfile: mock.fn((key, safe) => {}),
		sweepChar: mock.fn((charId, msg) => {}),
		canEdit: mock.fn((charId) => true),
	};
	global.script = {
		post: mock.fn((addr, topic, data, delay) => {}),
		listen: mock.fn((addrs) => {}),
		unlisten: mock.fn((addrs) => {}),
	};
	global.store = {
		setItem: mock.fn((key, item) => {}),
		getItem: mock.fn((key) => null),
		totalBytes: mock.fn(() => 0),
		newIterator: mock.fn((prefix, reverse) => iterator++),
		iteratorClose: mock.fn((iterator) => {}),
		iteratorSeek: mock.fn((iterator, key) => {}),
		iteratorNext: mock.fn((iterator) => {}),
		iteratorValid: mock.fn((iterator, prefix) => false),
		iteratorKey: mock.fn((iterator) => new ArrayBuffer(1)),
		iteratorItem: mock.fn((iterator) => new ArrayBuffer(1)),
	};
}
