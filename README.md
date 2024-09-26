<h2 align="center"><b>Mucklet Room Script</b></h2>

A development environment to build and test room scripts for Mucklet.com, a
textual world of roleplay.

# Quick start

Install [Git](https://git-scm.com/downloads) and
[NodeJS](https://nodejs.org/en/download/), and run the following commands:

```text
git clone https://github.com/mucklet/mucklet-script.git
cd mucklet-script
npm install
npm run build
npm test
```

# Examples

Script file | Description
--- | ---
[hello_world.ts](./examples/hello_world.ts) | A Hello world script with informative comments on a scripts entry functions.
[ambience.ts](./examples/ambience.ts) | A script showing ambient descriptions with random time intervals.
[day_and_night.ts](./examples/day_and_night.ts) | A script cycling between a "day" and "night" room profile based on real time.
[intercom_inside.ts](./examples/intercom_inside.ts) | An intercom script allowing communication with another room running the [intercom_outside.ts](./examples/intercom_outside.ts) script.
[intercom_outside.ts](./examples/intercom_outside.ts) | An intercom script allowing communication with another room running the [intercom_inside.ts](./examples/intercom_inside.ts) script.

# About

The Mucklet Script development environment lets you create and test scripts
locally before uploading them to the Mucklet realm.

Scripts are written using [AssemblyScript](https://www.assemblyscript.org/), a
statically typed language similar to TypeScript, sharing many of its features
and standard library functions (including its _.ts_ prefix).

## Standard library

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

## How to use

1. Open this project in an editor that supports TypeScript type checking, such as VSCode.
2. Edit the AssemblyScript file at: [script/index.ts](./script/index.ts)
3. Try to compile the script:
   ```text
   npm run build
   ```
4. Edit the tests in: [tests/index.js](./tests/index.js)
5. Run the tests:
   ```text
   npm test
   ```

## How to deploy to Mucklet Realm

1. Copy the content of [script/index.ts](./script/index.ts).
2. In the Mucklet realm, go to the desired room.
3. To create a new script, type:
   ```text
   create roomscript myscript = <PASTE YOUR SCRIPT HERE>
   ```
   To update an existing script, type:
   ```text
   set roomscript myscript : source = <PASTE YOUR SCRIPT HERE>
   ```
4. To activate the script, type:
   ```text
   set roomscript myscript : active = yes
   ```

For a list of commands available for managing room scripts, type:
```text
help build rooms
```

(Room scripting is a restricted feature, only available to _supporters_ and
_pioneers_. The commands may not be available to everyone.)

## Limitations

This project is currently structured to only support a single room script.
Contribution to improve this repository to allow writing multiple separate room
script files, and test suits for each file, is welcome.