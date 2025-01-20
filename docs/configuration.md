## Configuration

Out of the box, _mucklet-script_ won't require you to use a config file, but
will look for a `mucklet.config.js` file in the root of the project.

You can also change the configuration file using the `--config` flag:

**package.json**
```json
"scripts": {
	"build:castle": "mucklet-script build --config=castle.config.js"
}
```

The configuration file should be a Javascript ES6 module with a default export of either:
* An object of type: [MuckletConfig](#muckletconfig--object)
* A function of type: (version: string) => [MuckletConfig](#muckletconfig--object)
* A function of type: (version: string) => Promise<[MuckletConfig](#muckletconfig--object)>

**mucklet.config.js**
```javascript
const config = {
	output: {
		dir: "build",
		outFile: "[name].wasm",
		textFile: "[name].wat",
	},
	realm: {
		apiUrl: "wss://api.test.mucklet.com",
	},
	scripts: [
		{
			name: "example",
			path: "scripts/index.ts",
			room: "c2d1ml0t874bj4eva85g",
			active: true,
		},
	],
};
export default config;
```

> ### Tip
>
> You can set up a new project with a default configuration using:
> ```bash
> mucklet-script init myproject
> ```


<a name="MuckletConfig" id="MuckletConfig"></a>

## MuckletConfig : <code>object</code>
Mucklet configuration object.

| Property | Type | Description |
| --- | --- | --- |
| output | [<code>OutputConfig</code>](#OutputConfig) | Output configuration. |
| realm | [<code>RealmConfig</code>](#RealmConfig) | Realm configuration. |
| scripts | [<code>Array.&lt;ScriptConfig&gt;</code>](#ScriptConfig) | Script configurations. |

<a name="OutputConfig" id="OutputConfig"></a>

## OutputConfig : <code>object</code>
Output configuration object.

| Property | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | Directory to put build artifacts relative to the config file. Defaults to ./ if not set. |
| outFile | <code>string</code> | Name of wasm build files. Available placeholders:<br>- [name] is replaced with the script name.<br>- [room] is replaced with the script room ID or "noroom" if unset.<br>Defaults to "[name].wasm" if not set. |
| textFile | <code>string</code> | Name of wat build files. Available placeholders:<br>- [name] is replaced with the script name.<br>- [room] is replaced with the script room ID or "noroom" if unset.<br>Defaults to "[name].wat" if not set. |

<a name="RealmConfig" id="RealmConfig"></a>

## RealmConfig : <code>object</code>
Realm configuration object.

| Property | Type | Description |
| --- | --- | --- |
| apiUrl | <code>string</code> | URL to the realm API WebSocket endpoint, including scheme. E.g. "wss://api.test.mucklet.com" |

<a name="ScriptConfig" id="ScriptConfig"></a>

## ScriptConfig : <code>object</code>
Script configuration object.

| Property | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Script name. Is used as keyword on deploy. |
| path | <code>string</code> | Path to the script file relative to the config file. |
| [room] | <code>string</code> | Room ID to deploy to. |
| [active] | <code>boolean</code> | Active status. If not set, active status is not changed. |
| [testPath] | <code>string</code> | Path to the script test file. |

