/**
 * Mucklet script configuration file.
 *
 * The exported default value should be one of the following types:
 * * MuckletConfig
 * * (version: string) => MuckletConfig
 * * (version: string) => Promise.<MuckletConfig>
 */

/**
 * @typedef {typeof config} MuckletConfig
 */

/**
 * Mucklet configuration object.
 */
const config = {
	output: {
		/**
		 * Directory to put build artifacts relative to the config file.
		 * Defaults to ./ if not set.
		 */
		dir: "build",

		/**
		 * Name of wasm build files. Available placeholders:
		 * * [name] - is replaced with the script name.
		 * * [room] - is replaced with the script room ID or "noroom" if unset.
		 * Defaults to "[name].wasm" if not set.
		 */
		outFile: "[name].wasm",

		/**
		 * Name of wat build files. [name] is replaced with the script name.
		 * * [name] - is replaced with the script name.
		 * * [room] - is replaced with the script room ID or "noroom" if unset.
		 * Defaults to "[name].wat]" if not set.
		 */
		textFile: "[name].wat",
	},
	realm: {
		/** URL to the realm API WebSocket endpoint. */
		// apiUrl: "wss://api.test.mucklet.com"
	},
	scripts: [
		{
			/**
			 * Script name. Is used as keyword on publish.
			 * Required property.
			 */
			name: "example",

			/** Room ID to publish to. */
			// room: "aaaaaaaaaaaaaaaaaaaa",

			/**
			 * Path to the script file relative to the config file.
			 * Required property.
			 */
			path: "scripts/index.ts",

			/** Path to the script test file. */
			test: "tests/index.js",
		}
	],
};

export default config;
