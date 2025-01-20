// ./types.js

/**
 * Mucklet configuration object.
 * @typedef {object} MuckletConfig
 * @property {OutputConfig} output Output configuration.
 * @property {RealmConfig} realm Realm configuration.
 * @property {Array<ScriptConfig>} scripts Script configurations.
 */

/**
 * Output configuration object.
 * @typedef {object} OutputConfig
 * @property {string} dir Directory to put build artifacts relative to the config file.
 * Defaults to ./ if not set.
 * @property {string} outFile Name of wasm build files. Available placeholders:
 * - [name] is replaced with the script name.
 * - [room] is replaced with the script room ID or "noroom" if unset.
 * Defaults to "[name].wasm" if not set.
 * @property {string} textFile Name of wat build files. Available placeholders:
 * - [name] is replaced with the script name.
 * - [room] is replaced with the script room ID or "noroom" if unset.
 * Defaults to "[name].wat" if not set.
 */

/**
 * Realm configuration object.
 * @typedef {object} RealmConfig
 * @property {string} apiUrl URL to the realm API WebSocket endpoint, including scheme.
 * E.g. "wss://api.test.mucklet.com"
 */

/**
 * Script configuration object.
 * @typedef {object} ScriptConfig
 * @property {string} name Script name. Is used as keyword on deploy.
 * @property {string} path Path to the script file relative to the config file.
 * @property {string} [room] Room ID to deploy to.
 * @property {boolean} [active] Active status. If not set, active status is not changed.
 * @property {string} [testPath] Path to the script test file.
 */
