# Mucklet Script Documentation

<h2 id="overview">Overview</h2>

[Entry points](#entry-points)  
&nbsp;&nbsp;&nbsp;&nbsp;[onActivate](#onactivate)  
&nbsp;&nbsp;&nbsp;&nbsp;[onRoomEvent](#onroomevent)  
&nbsp;&nbsp;&nbsp;&nbsp;[onMessage](#onmessage)  
&nbsp;&nbsp;&nbsp;&nbsp;[onCharEvent](#oncharevent)  
&nbsp;&nbsp;&nbsp;&nbsp;[onExitUse](#onexituse)  
&nbsp;&nbsp;&nbsp;&nbsp;[onCommand](#oncommand)  
[Index](#index)

Mucklet scripts are written in AssemblyScript, a strictly typed
TypeScript-like language. For more info on AssemblyScript, its types, and
standard library, see:

&nbsp;&nbsp;&nbsp;&nbsp;🔗 [AssemblyScript
Concepts](https://www.assemblyscript.org/concepts.html)

The standard library of AssemblyScript has been extended with classes and
functions to interact with Mucklet realms. This documentation covers those
extensions.

<h2 id="entry-points">Entry points</h2>

The script entry points are exported functions that are called on different
types of events, such as the script activating, someone entering a room, or a
command being called.

The only entry point that is required is [onActivate](#onactivate).


<h3 id="onactivate">onActivate</h3>

_onActivate_ is called each time a script is activated or updated. It is
primarily used to call [Script.listen](#script-listen), [Room.listen](#room-listen), or
[Room.addCommand](#room-addcommand), to have the script listening for events, messages,
or commands.

When a script is updated, previous listeners, (e.g. [Room.listen](#room-listen)),
commands ([Room.addCommand](#room-addcommand)), or scheduled posts ([Script.post](#script-post)
with delay), will be removed, and [onActivate](#onactivate) will be called
again on the new script version.

```ts
// Send a describe to the room and log a message to the console on activation.
export function onActivate(): void {
    Room.describe("Hello, world!");
    console.log("Hello, console!");
}
```

<h3 id="onroomevent">onRoomEvent</h3>

_onRoomEvent_ is called when an event occurs in the room, such as a _say_,
_arrive_, or _sleep_. It requires that [Room.listen](#room-listen) has been called
earlier, usually in the [onActivate](#onactivate) function.

```ts
// Check the event type and decode the event.
export function onRoomEvent(
    addr: string, // Address of this script instance receiving the event.
    ev: string,   // Event encoded as a json string.
): void {
    const eventType = Event.getType(ev);
    if (eventType == 'say') {
        const say = JSON.parse<Event.Say>(ev);
        // Handle the say event
    }
}
```

<h3 id="onmessage">onMessage</h3>

_onMessage_ is called when another script sends a message to this script,
using [Script.post](#script-post). It requires that [Script.listen](#script-listen) has been
called earlier, usually in the [onActivate](#onactivate) function.

```ts
// Receive a message from another script to change room profile
export function onMessage(
    addr: string,        // Address of this script instance receiving the message.
    topic: string,       // Topic of the message. Determined by the sender.
    data: string | null, // JSON encoded data of the message or null. Determined by the sender.
    sender: string,      // Address of the sending script instance.
): void {
    if (topic == "changeProfile") {
        Room.setProfile(JSON.parse<string>(data))
    }
}
```

<h3 id="oncharevent">onCharEvent</h3>

_onCharEvent_ is called when a character enters a room, leaves a room, or
changes any of its properties while inside the room. It requires that
[Room.listenCharEvent](#room-listencharevent) has been called earlier, usually in the
[onActivate](#onactivate) function.

```ts
// Output to log when a character arrives or leaves
export function onCharEvent(
    addr: string,          // Address of this script instance receiving the event.
    charId: string,        // ID of character.
    after: string | null,  // Character state after the event encoded as a json string, or null if the character left the room.
    before: string | null, // Character state before the event encoded as a json string, or null if the character entered the room.
): void {
    if (after == null && before != null) {
        // If after is null, the character left
        const char = JSON.parse<Room.Char>(before);
        console.log(`${char.name} left.`)
    }
    if (before == null && after != null) {
        // If before is null, the character arrived
        const char = JSON.parse<Room.Char>(after);
        console.log(`${char.name} arrived.`)
    }
}
```

<h3 id="onexituse">onExitUse</h3>

_onExitUse_ is called when a character tries to use an exit. It requires that
[Room.listenExit](#room-listenexit) has been called earlier, usually in the
[onActivate](#onactivate) function. The script should call either
[ExitAction.cancel](#exitaction-cancel) or [ExitAction.useExit](#exitaction-useexit) to determine what
should happen. If neither method is called, the action will timeout after 1
second, automatically canceling the exit use with a default message.

```ts
// Prevent anyone from using an exit
export function onExitUse(
    addr: string,           // Address of this script instance receiving the event.
    exitAction: ExitAction, // Exit action object.
): void {
    exitAction.cancel("The door seems to be locked.");
}
```

<h3 id="oncommand">onCommand</h3>

_onCommand_ is called when a character uses a custom command. It requires
that [Room.addCommand](#room-addcommand) has been called earlier to register the command,
usually in the [onActivate](#onactivate) function. The script may send a
response to the caller using either [CmdAction.info](#cmdaction-info),
[CmdAction.error](#cmdaction-error), or [CmdAction.useExit](#cmdaction-useexit), but it is not
required. The response must be sent within 1 second from the call.

```ts
// Adding a ping command on activation
export function onActivate(): void {
    Room.addCommand("ping", new Command("send ping", "Sends a ping to the script.");
}

// Adds a "send ping" command that responds with an info message
export function onCommand(
    addr: string,         // Address of this script instance receiving the action.
    cmdAction: CmdAction, // Command action object.
): void {
    cmdAction.info("Pong!");
}
```

<h1 id="index">Index</h1>

[Type aliases](#type-aliases)  
&nbsp;&nbsp;&nbsp;&nbsp;[type Duration](#duration)  
&nbsp;&nbsp;&nbsp;&nbsp;[type ID](#id)  
&nbsp;&nbsp;&nbsp;&nbsp;[type Timestamp](#timestamp)  
[Enums](#enums)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum CharState](#charstate)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum ExitIcon](#exiticon)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum ExitNav](#exitnav)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum IdleLevel](#idlelevel)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum RPState](#rpstate)  
[Classes](#classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class CmdAction](#cmdaction)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[properties](#cmdaction-properties)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method error](#cmdaction-error)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method info](#cmdaction-info)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method useExit](#cmdaction-useexit)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Command](#command)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[properties](#command-properties)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method field](#command-field)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method json](#command-json)  
&nbsp;&nbsp;&nbsp;&nbsp;[class ExitAction](#exitaction)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[properties](#exitaction-properties)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method cancel](#exitaction-cancel)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method useExit](#exitaction-useexit)

<h2 id="type-aliases">Type aliases</h2>

<h3 id="duration">type Duration</h3>

```ts
type Duration = i64
```

Duration in milliseconds.

---

<h3 id="id">type ID</h3>

```ts
type ID = string
```

ID for in game entities such as characters, rooms, and areas.

---

<h3 id="timestamp">type Timestamp</h3>

```ts
type Timestamp = i64
```

Timestamp as a UTC timestamp in milliseconds.

<h2 id="enums">Enums</h2>

<h3 id="charstate">enum CharState</h3>

```ts
type CharState = i32
namespace CharState {
    const Asleep = CharState(0)
    const Awake  = CharState(1)
    const Dazed  = CharState(2)
    const Any    = CharState(255)
}
```

States that a character may have.

---

<h3 id="exiticon">enum ExitIcon</h3>

```ts
type ExitIcon = i32
namespace ExitIcon {
    const None      = ExitIcon(0)
    const North     = ExitIcon(1)
    const NorthEast = ExitIcon(2)
    const East      = ExitIcon(3)
    const SouthEast = ExitIcon(4)
    const South     = ExitIcon(5)
    const SouthWest = ExitIcon(6)
    const West      = ExitIcon(7)
    const NorthWest = ExitIcon(8)
    const Up        = ExitIcon(9)
    const Down      = ExitIcon(10)
    const In        = ExitIcon(11)
    const Out       = ExitIcon(12)
}
```

Exit navigation icon.

---

<h3 id="exitnav">enum ExitNav</h3>

```ts
type ExitNav = i32
namespace ExitNav {
    const None      = ExitNav(0)
    const North     = ExitNav(1)
    const NorthEast = ExitNav(2)
    const East      = ExitNav(3)
    const SouthEast = ExitNav(4)
    const South     = ExitNav(5)
    const SouthWest = ExitNav(6)
    const West      = ExitNav(7)
    const NorthWest = ExitNav(8)
}
```

Exit navigation directions.

---

<h3 id="idlelevel">enum IdleLevel</h3>

```ts
type IdleLevel = i32
namespace IdleLevel {
    const Asleep   = IdleLevel(0)
    const Active   = IdleLevel(1)
    const Idle     = IdleLevel(2)
    const Inactive = IdleLevel(3)
}
```

Idle levels that a character may have.

---

<h3 id="rpstate">enum RPState</h3>

```ts
type RPState = i32
namespace RPState {
    const None = RPState(0)
    const LFRP = RPState(1)
}
```

Roleplaying state that a character may have.

<h2 id="classes">Classes</h2>

<h3 id="cmdaction">class CmdAction</h3>

CmdAction is a command action triggered by a character.

<h4 id="cmdaction-properties">class CmdAction properties</h4>

* `actionId` <i>(i32)</i>: Action ID
* `char` <i>([Char](#event-char))</i>: Character performing the action
* `data` <i>(string)</i>: Command data in JSON format.
* `keyword` <i>(string)</i>: Command keyword


---

<h3 id="cmdaction-error">method CmdAction.error</h3>

```ts
error(msg: string): void
```

Responds to the command action with an error message.

<h4>Parameters</h4>

* `msg` <i>(string)</i>: Error message.


---

<h3 id="cmdaction-info">method CmdAction.info</h3>

```ts
info(msg: string): void
```

Responds to the command action with an info message.

<h4>Parameters</h4>

* `msg` <i>(string)</i>: Info message.


---

<h3 id="cmdaction-useexit">method CmdAction.useExit</h3>

```ts
useExit(exitId: ID): void
```

Responds to the command action by making the character use an exit.

The exit may be hidden or inactive. May not be used in combination with
info or error.

<h4>Parameters</h4>

* `exitId` <i>([ID](#id))</i>: Exit ID.


---

<h3 id="command">class Command</h3>

Command class is a representation of a custom command, and is used when calling
argument to [Room.addCommand](#room-addcommand).

```ts
new Command(pattern: string, desc: string = "")
```

Creates a new instance of the [Command](#command) class.


<h4 id="command-properties">class Command properties</h4>

* `desc` <i>(string)</i>
* `pattern` <i>(string)</i>


---

<h3 id="command-field">method Command.field</h3>

```ts
field(key: string, def: CommandField): Command
```

Sets the definition for a command field.

<h4>Parameters</h4>

* `key` <i>(string)</i>: Field <key> as found in command pattern.
* `def` <i>([CommandField](#commandfield))</i>: Field definition.

<h4>Returns</h4>

* This instance, allowing method chaining.


---

<h3 id="command-json">method Command.json</h3>

```ts
json(): string
```

Converts the command into a JSON structure.


---

<h3 id="exitaction">class ExitAction</h3>

ExitAction is an action representing an intercepted use of an exit.

It is passed to [onExitUse](#onexituse) entry point when a character tries to
use an exit that is being listen to with [Room.listenExit](#room-listenexit).

<h4 id="exitaction-properties">class ExitAction properties</h4>

* `actionId` <i>(i32)</i>: Action ID
* `charId` <i>([ID](#id))</i>: Character ID
* `exitId` <i>([ID](#id))</i>: Exit ID


---

<h3 id="exitaction-cancel">method ExitAction.cancel</h3>

```ts
cancel(msg: string = null): void
```

Cancels a character's attempt to use an exit and shows them an info
message instead. If msg is null, the default exit timeout message will be
shown.

<h4>Parameters</h4>

* `msg` <i>(string)</i>: Info message to show, or default message if null.


---

<h3 id="exitaction-useexit">method ExitAction.useExit</h3>

```ts
useExit(exitId: ID = null): void
```

Makes the character use an exit. If exitId is null, the character is sent
through the exit that they originally tried to use.

The exit may be hidden or inactive.

<h4>Parameters</h4>

* `exitId` <i>([ID](#id))</i>: Exit ID or null for the originally used exit.

