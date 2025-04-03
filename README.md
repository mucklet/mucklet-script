<h2 align="center"><b>Mucklet Script</b></h2>

A development cli tool used to build, test, and deploy room scripts for
Mucklet.com, a textual world of roleplay.

## Quick start

Install [NodeJS](https://nodejs.org/en/download/), and run the following commands:

```text
npx mucklet-script init myproject
cd myproject
npm install
npm run build
```

## Usage

For full usage, run:
```
npx mucklet-script
```

## Documentation

* [Configuration](docs/configuration.md)
* [Writing scripts - Custom commands](docs/writingscripts-customcommands.md)

## Script examples

Script file | Description
--- | ---
[hello_world.ts](./examples/hello_world.ts) | A Hello world script with informative comments on a script's entry functions.
[ambience.ts](./examples/ambience.ts) | A script showing ambient descriptions with random time intervals.
[day_and_night.ts](./examples/day_and_night.ts) | A script cycling between a "day" and "night" room profile based on real time.
[intercom_inside.ts](./examples/intercom_inside.ts) | An intercom script allowing communication with another room running the [intercom_outside.ts](./examples/intercom_outside.ts) script.
[intercom_outside.ts](./examples/intercom_outside.ts) | An intercom script allowing communication with another room running the [intercom_inside.ts](./examples/intercom_inside.ts) script.
[lock_inside.ts](./examples/lock_inside.ts) | A script that locks a door preventing others from using an exit in the room running the [lock_outside.ts](./examples/lock_outside.ts) script.
[lock_outside.ts](./examples/lock_outside.ts) | A script that prevents characters from using an exit locked by the script running the [lock_inside.ts](./examples/lock_inside.ts) script.
[secret_exit.ts](./examples/secret_exit.ts) | A script that reveals a secret passage when the password "tapeworm" is spoken.

## About

The _mucklet-script_ cli tool lets you:
* create and initialize new script projects
* build and test scripts
* deploy scripts to a Mucklet realm
* fetch and display script console logs

Scripts are written using [AssemblyScript](https://www.assemblyscript.org/), a
statically typed language similar to TypeScript, sharing many of its features
and standard library functions (including its _.ts_ suffix).

### Standard library

In addition to the [AssemblyScript's standard
library](https://www.assemblyscript.org/stdlib/globals.html), Mucklet room
scripts also includes [json-as](https://github.com/JairusSW/as-json) available
through the `JSON` namespace:
```typescript
JSON.stringify("Hello, world!")
```

The `Room` namespace provides functions for interacting with the room:
```typescript
Room.describe("A bird is chirping from a nearby tree.")
```

The `Script` namespace provides functions for sending and receiving messages
from other scripts.
```typescript
Script.post(destAddr, "newVisitor")
```

The `Store` namespace provides functions for setting, getting, and iterating
over data from a persistent key/value store.
```typescript
Store.setString("foo", "bar")
let str = Store.getString("foo")
```

(Room scripting is a restricted feature, only available to _supporters_ and
_pioneers_. Deploying scripts may not be available to everyone.)
