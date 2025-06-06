<h2 align="center"><b>Mucklet Script</b></h2>

A development cli tool used to build, test, and deploy room scripts for
[Mucklet.com](https://mucklet.com) realms, creating textual worlds of roleplay.

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
* [Mucklet Script Documentation](docs/documentation.md)

## Guides

* [Writing scripts - Custom commands](docs/writingscripts-customcommands.md)

## Script examples

Script file | Description
--- | ---
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

See the [Mucklet Script Documentation](docs/documentation.md) for guides, examples,
and API references.
