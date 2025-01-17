import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ResClient = require('resclient').default;
const WebSocket = require('isomorphic-ws');

class ApiClient extends ResClient {
	constructor(apiUrl, token) {
		super(() => new WebSocket(apiUrl));

		this.authErr = null;

		this.setOnConnect(c => c.authenticate("auth", "authenticate", {
			token,
		}).catch(err => {
			this.authErr = err;
			console.error(err);
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
	await client.getUser();

	return client;
}