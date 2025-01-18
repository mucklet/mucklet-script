import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();

export const rootDir = path.join(dirname, '../..');

export function formatPath(from, to) {
	return './' + path.relative(from, to).replace(/\\/g, '/');
}

export function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Merge two objects.
 */
export function mergeObjects(target, ...sources) {
	if (!sources.length) {
		return target;
	}
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			const v = source[key];
			if (isObject(v)) {
				if (!target[key]) {
					target[key] = {};
				}
				mergeObjects(target[key], v);
			} else if (typeof v != 'undefined') {
				target[key] = v;
			}
		}
	}
	return mergeObjects(target, ...sources);
}

export function getToken(token, tokenFile) {
	if (tokenFile) {
		return fs.readFileSync(tokenFile, "utf8");
	}
	if (token) {
		return token;
	}
	if (process.env.MUCKLET_TOKEN_FILE) {
		return fs.readFileSync(process.env.MUCKLET_TOKEN_FILE, "utf8");
	}
	if (process.env.MUCKLET_TOKEN) {
		return process.env.MUCKLET_TOKEN;
	}

	return "";
}

export async function loadConfig(version, configFile, defaultOnNotFound) {
	configFile = path.resolve(configFile);

	let cfg;
	if (defaultOnNotFound && !fs.existsSync(configFile)) {
		return Promise.resolve(defaultOnNotFound);
	}

	try {
		cfg = (await import(formatPath(dirname, configFile))).default;
	} catch(ex) {
		throw "error loading config file: " + (ex?.message || ex);
	}

	return Promise.resolve(typeof cfg == "function"
		? cfg(version)
		: cfg
	);
}

function escapeExecPath(file) {
	return `"${path.resolve(cwd, file).replace(/"/, '\\"')}"`;
}

export function compileScript(path, outFile, textFile) {
	execSync(
		`npx asc ${escapeExecPath(path)} -o ${escapeExecPath(outFile)}${textFile ? " -t " + escapeExecPath(textFile) : ""} --runtime minimal --exportRuntime --lib ./lib/host.ts --lib ./lib/env.ts`,
		{
			cwd: rootDir,
			stdio: [ "pipe", "pipe", "pipe" ],
		}
	);
}

export function errToString(err) {
	if (!err) {
		return "";
	}
	let t = typeof err;
	if (t == "string") {
		return err;
	}
	if (t != "object") {
		return String(t);
	}

	if (err.toString && !err.code) {
		return err.toString();
	}

	let s = err.message || err.code;
	let params = err.data || {};

	return s.replace(/{([^}]+)}/g, function (match, idx) {
		return typeof params[idx] != 'undefined' ?
			params[idx] :
			'???';
	});
}
