import { createRequire } from 'module';
import { errToString } from './tools.js';
const require = createRequire(import.meta.url);
const resclient = require('resclient');
const ResClient = resclient.default;
const WebSocket = require('isomorphic-ws');

export const isResError = resclient.isResError;

class ApiClient extends ResClient {
	constructor(apiUrl, token) {
		super(() => new WebSocket(apiUrl));

		this.authErr = null;

		this.setOnConnect(c => c.authenticate("auth", "authenticate", {
			token,
		}).catch(err => {
			this.authErr = err;
		}));
	}

	async getUser() {
		if (!this._user) {
			try {
				this._user = await this.call("auth", "getUser");
			} catch (err) {
				// Prioritize any authenticate error, since it is more relevant.
				throw this.authErr || err;
			}
		}
		return this._user;
	}
}

export async function createClient(apiUrl, token) {
	// Create instance with a WebSocket factory function
	const client = new ApiClient(apiUrl, token);

	// Try to load user to directly validate the token.
	let user;
	try {
		user = await client.getUser();
	} catch (err) {
		if (err.code == 'system.connectionError') {
			throw "failed to connect to realm api";
		}
		if (err.code == 'system.notFound') {
			throw "api service unavailable";
		}
		throw errToString(err);
	}
	if (isResError(user)) {
		throw "error getting user: " + errToString(err);
	}

	return client;
}

/**
 * Get a room script model by name from the API.
 * @param {ApiClient} client API client.
 * @param {string} room  Room ID.
 * @param {*} name Script name/key
 * @returns {Model}
 */
export async function getRoomScriptByName(client, room, name) {
	name = name.toLowerCase();
	try {
		let roomScripts = await client.get(`core.room.${room}.scripts`);
		for (let roomScript of roomScripts) {
			if (roomScript.key == name) {
				return roomScript;
			}
		}
	} catch (err) {
		if (err?.code == 'system.notFound') {
			throw "room not found";
		}
		throw err;
	}
	return null;
}
