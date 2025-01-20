/**
 * Mucklet script configuration file.
 *
 * The exported default value should be one of the following types:
 * - MuckletConfig
 * - (version: string) => MuckletConfig
 * - (version: string) => Promise.<MuckletConfig>
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
		 * - [name] is replaced with the script name.
		 * - [room] is replaced with the script room ID or "noroom" if unset.
		 * Defaults to "[name].wasm" if not set.
		 */
		outFile: "[name].wasm",

		/**
		 * Name of wat build files. [name] is replaced with the script name.
		 * - [name] is replaced with the script name.
		 * - [room] is replaced with the script room ID or "noroom" if unset.
		 * Defaults to "[name].wat" if not set.
		 */
		textFile: "[name].wat",
	},
	realm: {
		/** URL to the realm API WebSocket endpoint. */
		// apiUrl: "wss://api.test.mucklet.com",

		/**
		 * For security reason, it is not possible to store the token in the config file.
		 *
		 * Instead consider using:
		 * - MUCKLET_TOKEN_FILE environment variable with the path to a file containing the token
		 * - MUCKLET_TOKEN environment variable containing the token
		 * - --tokenfile flag with a path to a file containing the token
		 * - --token flag with the token.
		 */
	},
	scripts: [
		{
			/**
			 * Script name. Is used as keyword when deployed.
			 * Required property.
			 */
			name: "example",

			/**
			 * Path to the script file relative to the config file.
			 * Required property.
			 */
			path: "scripts/index.ts",

			/** Room ID to deploy to. */
			// room: "aaaaaaaaaaaaaaaaaaaa",

			/** Active status. If not set, active status is not changed. */
			// active: true,
		},
	],
};

export default config;
