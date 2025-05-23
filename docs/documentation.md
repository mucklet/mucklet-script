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
primarily used to call [Script.listen](#function-script-listen), [Room.listen](#function-room-listen), or
[Room.addCommand](#function-room-addcommand), to have the script listening for events, messages,
or commands.

When a script is updated, previous listeners, (e.g. [Room.listen](#function-room-listen)),
commands ([Room.addCommand](#function-room-addcommand)), or scheduled posts ([Script.post](#function-script-post)
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
_arrive_, or _sleep_. It requires that [Room.listen](#function-room-listen) has been called
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
using [Script.post](#function-script-post). It requires that [Script.listen](#function-script-listen) has been
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
[Room.listenCharEvent](#function-room-listencharevent) has been called earlier, usually in the
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
[Room.listenExit](#function-room-listenexit) has been called earlier, usually in the
[onActivate](#onactivate) function. The script should call either
[ExitAction.cancel](#method-exitaction-cancel) or [ExitAction.useExit](#method-exitaction-useexit) to determine what
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
that [Room.addCommand](#function-room-addcommand) has been called earlier to register the command,
usually in the [onActivate](#onactivate) function. The script may send a
response to the caller using either [CmdAction.info](#method-cmdaction-info),
[CmdAction.error](#method-cmdaction-error), or [CmdAction.useExit](#method-cmdaction-useexit), but it is not
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
&nbsp;&nbsp;&nbsp;&nbsp;[type Duration](#type-duration)  
&nbsp;&nbsp;&nbsp;&nbsp;[type ID](#type-id)  
&nbsp;&nbsp;&nbsp;&nbsp;[type Timestamp](#type-timestamp)  
[Enums](#enums)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum CharState](#enum-charstate)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum ExitIcon](#enum-exiticon)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum ExitNav](#enum-exitnav)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum IdleLevel](#enum-idlelevel)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum RPState](#enum-rpstate)  
[Classes](#classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class CmdAction](#class-cmdaction)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method info](#method-cmdaction-info)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method error](#method-cmdaction-error)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method useExit](#method-cmdaction-useexit)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Command](#class-command)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method field](#method-command-field)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method json](#method-command-json)  
&nbsp;&nbsp;&nbsp;&nbsp;[class ExitAction](#class-exitaction)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method useExit](#method-exitaction-useexit)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method cancel](#method-exitaction-cancel)  
[Namespaces](#namespaces)  
[Event functions](#event-functions)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Event.getType](#function-event-gettype)  
[Event classes](#event-classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Action](#class-event-action)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Arrive](#class-event-arrive)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Base](#class-event-base)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.BaseCharMethodMsg](#class-event-basecharmethodmsg)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.BaseCharMsg](#class-event-basecharmsg)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.BaseCharPoseMsg](#class-event-basecharposemsg)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Char](#class-event-char)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Describe](#class-event-describe)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Leave](#class-event-leave)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.OOC](#class-event-ooc)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Pose](#class-event-pose)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Roll](#class-event-roll)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.RollResult](#class-event-rollresult)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Say](#class-event-say)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Sleep](#class-event-sleep)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Event.Wakeup](#class-event-wakeup)  
[Field classes](#field-classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Field.Bool](#class-field-bool)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getType](#method-field-bool-gettype)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getDesc](#method-field-bool-getdesc)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getOpts](#method-field-bool-getopts)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Field.Char](#class-field-char)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getType](#method-field-char-gettype)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getDesc](#method-field-char-getdesc)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getOpts](#method-field-char-getopts)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setInRoom](#method-field-char-setinroom)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setState](#method-field-char-setstate)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Field.Float](#class-field-float)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getType](#method-field-float-gettype)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getDesc](#method-field-float-getdesc)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getOpts](#method-field-float-getopts)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMin](#method-field-float-setmin)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMax](#method-field-float-setmax)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Field.Integer](#class-field-integer)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getType](#method-field-integer-gettype)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getDesc](#method-field-integer-getdesc)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getOpts](#method-field-integer-getopts)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMin](#method-field-integer-setmin)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMax](#method-field-integer-setmax)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Field.Keyword](#class-field-keyword)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getType](#method-field-keyword-gettype)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getDesc](#method-field-keyword-getdesc)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getOpts](#method-field-keyword-getopts)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setRemoveDiacritics](#method-field-keyword-setremovediacritics)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMinLength](#method-field-keyword-setminlength)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMaxLength](#method-field-keyword-setmaxlength)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Field.List](#class-field-list)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getType](#method-field-list-gettype)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getDesc](#method-field-list-getdesc)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getOpts](#method-field-list-getopts)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method addItem](#method-field-list-additem)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setItems](#method-field-list-setitems)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Field.Text](#class-field-text)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getType](#method-field-text-gettype)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getDesc](#method-field-text-getdesc)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getOpts](#method-field-text-getopts)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setSpanLines](#method-field-text-setspanlines)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setSpellCheck](#method-field-text-setspellcheck)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setFormatText](#method-field-text-setformattext)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMinLength](#method-field-text-setminlength)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method setMaxLength](#method-field-text-setmaxlength)  
[FieldValue classes](#fieldvalue-classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class FieldValue.Bool](#class-fieldvalue-bool)  
&nbsp;&nbsp;&nbsp;&nbsp;[class FieldValue.Char](#class-fieldvalue-char)  
&nbsp;&nbsp;&nbsp;&nbsp;[class FieldValue.Float](#class-fieldvalue-float)  
&nbsp;&nbsp;&nbsp;&nbsp;[class FieldValue.Integer](#class-fieldvalue-integer)  
&nbsp;&nbsp;&nbsp;&nbsp;[class FieldValue.Keyword](#class-fieldvalue-keyword)  
&nbsp;&nbsp;&nbsp;&nbsp;[class FieldValue.List](#class-fieldvalue-list)  
&nbsp;&nbsp;&nbsp;&nbsp;[class FieldValue.Text](#class-fieldvalue-text)  
[JSON enums](#json-enums)  
&nbsp;&nbsp;&nbsp;&nbsp;[enum JSON.Types](#enum-json-types)  
[JSON functions](#json-functions)  
&nbsp;&nbsp;&nbsp;&nbsp;[function JSON.parse](#function-json-parse)  
&nbsp;&nbsp;&nbsp;&nbsp;[function JSON.stringify](#function-json-stringify)  
[JSON classes](#json-classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class JSON.Box](#class-json-box)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method set](#method-json-box-set)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method from](#method-json-box-from)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method toString](#method-json-box-tostring)  
&nbsp;&nbsp;&nbsp;&nbsp;[class JSON.Obj](#class-json-obj)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method set](#method-json-obj-set)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method get](#method-json-obj-get)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method has](#method-json-obj-has)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method delete](#method-json-obj-delete)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method keys](#method-json-obj-keys)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method values](#method-json-obj-values)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method toString](#method-json-obj-tostring)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method from](#method-json-obj-from)  
&nbsp;&nbsp;&nbsp;&nbsp;[class JSON.Raw](#class-json-raw)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method set](#method-json-raw-set)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method toString](#method-json-raw-tostring)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method from](#method-json-raw-from)  
&nbsp;&nbsp;&nbsp;&nbsp;[class JSON.Value](#class-json-value)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method empty](#method-json-value-empty)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method from](#method-json-value-from)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method set](#method-json-value-set)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method get](#method-json-value-get)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method toString](#method-json-value-tostring)  
[JSON namespaces](#json-namespaces)  
[JSON.Memory functions](#json-memory-functions)  
&nbsp;&nbsp;&nbsp;&nbsp;[function JSON.Memory.shrink](#function-json-memory-shrink)  
[Room functions](#room-functions)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.addCommand](#function-room-addcommand)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.canEdit](#function-room-canedit)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.charIterator](#function-room-chariterator)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.describe](#function-room-describe)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.exitIterator](#function-room-exititerator)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.getChar](#function-room-getchar)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.getDetails](#function-room-getdetails)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.getExit](#function-room-getexit)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.getExitById](#function-room-getexitbyid)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.getExitOrder](#function-room-getexitorder)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.listen](#function-room-listen)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.listenCharEvent](#function-room-listencharevent)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.listenExit](#function-room-listenexit)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.privateDescribe](#function-room-privatedescribe)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.removeCommand](#function-room-removecommand)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.setExit](#function-room-setexit)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.setRoom](#function-room-setroom)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.sweepChar](#function-room-sweepchar)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.unlisten](#function-room-unlisten)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.unlistenCharEvent](#function-room-unlistencharevent)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.unlistenExit](#function-room-unlistenexit)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Room.useProfile](#function-room-useprofile)  
[Room classes](#room-classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Room.Char](#class-room-char)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Room.CharIterator](#class-room-chariterator)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method next](#method-room-chariterator-next)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method rewind](#method-room-chariterator-rewind)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getID](#method-room-chariterator-getid)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method isValid](#method-room-chariterator-isvalid)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method close](#method-room-chariterator-close)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getChar](#method-room-chariterator-getchar)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Room.Exit](#class-room-exit)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Room.ExitIterator](#class-room-exititerator)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method next](#method-room-exititerator-next)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method rewind](#method-room-exititerator-rewind)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getID](#method-room-exititerator-getid)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method isValid](#method-room-exititerator-isvalid)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method close](#method-room-exititerator-close)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getExit](#method-room-exititerator-getexit)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Room.MoveMsgs](#class-room-movemsgs)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Room.RoomDetails](#class-room-roomdetails)  
[Script functions](#script-functions)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Script.cancelPost](#function-script-cancelpost)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Script.getChar](#function-script-getchar)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Script.listen](#function-script-listen)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Script.post](#function-script-post)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Script.unlisten](#function-script-unlisten)  
[Script classes](#script-classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Script.Char](#class-script-char)  
[Store functions](#store-functions)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Store.deleteKey](#function-store-deletekey)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Store.getBuffer](#function-store-getbuffer)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Store.getString](#function-store-getstring)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Store.readOnly](#function-store-readonly)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Store.setBuffer](#function-store-setbuffer)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Store.setString](#function-store-setstring)  
&nbsp;&nbsp;&nbsp;&nbsp;[function Store.totalBytes](#function-store-totalbytes)  
[Store classes](#store-classes)  
&nbsp;&nbsp;&nbsp;&nbsp;[class Store.Iterator](#class-store-iterator)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method withPrefix](#method-store-iterator-withprefix)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method inReverse](#method-store-iterator-inreverse)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method next](#method-store-iterator-next)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method seek](#method-store-iterator-seek)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method rewind](#method-store-iterator-rewind)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getKeyString](#method-store-iterator-getkeystring)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getKeyBuffer](#method-store-iterator-getkeybuffer)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getValueString](#method-store-iterator-getvaluestring)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method getValueBuffer](#method-store-iterator-getvaluebuffer)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method isValid](#method-store-iterator-isvalid)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method isValidForPrefix](#method-store-iterator-isvalidforprefix)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[method close](#method-store-iterator-close)

<h2 id="type-aliases">Type aliases</h2>

<h3 id="type-duration">type Duration</h3>

```ts
type Duration = i64
```

Duration in milliseconds.

---

<h3 id="type-id">type ID</h3>

```ts
type ID = string
```

ID for in game entities such as characters, rooms, and areas.

---

<h3 id="type-timestamp">type Timestamp</h3>

```ts
type Timestamp = i64
```

Timestamp as a UTC timestamp in milliseconds.

<h2 id="enums">Enums</h2>

<h3 id="enum-charstate">enum CharState</h3>

```ts
const enum CharState {
    Asleep = 0,
    Awake  = 1,
    Dazed  = 2,
    Any    = 255,
}
```

States that a character may have.

---

<h3 id="enum-exiticon">enum ExitIcon</h3>

```ts
const enum ExitIcon {
    None      = 0,
    North     = 1,
    NorthEast = 2,
    East      = 3,
    SouthEast = 4,
    South     = 5,
    SouthWest = 6,
    West      = 7,
    NorthWest = 8,
    Up        = 9,
    Down      = 10,
    In        = 11,
    Out       = 12,
}
```

Exit navigation icon.

---

<h3 id="enum-exitnav">enum ExitNav</h3>

```ts
const enum ExitNav {
    None      = 0,
    North     = 1,
    NorthEast = 2,
    East      = 3,
    SouthEast = 4,
    South     = 5,
    SouthWest = 6,
    West      = 7,
    NorthWest = 8,
}
```

Exit navigation directions.

---

<h3 id="enum-idlelevel">enum IdleLevel</h3>

```ts
const enum IdleLevel {
    Asleep   = 0,
    Active   = 1,
    Idle     = 2,
    Inactive = 3,
}
```

Idle levels that a character may have.

---

<h3 id="enum-rpstate">enum RPState</h3>

```ts
const enum RPState {
    None = 0,
    LFRP = 1,
}
```

Roleplaying state that a character may have.

<h2 id="classes">Classes</h2>

<h3 id="class-cmdaction">class CmdAction</h3>

CmdAction is a command action triggered by a character.

<h4 id="class-cmdaction-properties">class CmdAction properties</h4>

* `actionId` <i>(i32)</i>: Action ID
* `char` <i>([Event.Char](#class-event-char))</i>: Character performing the action
* `keyword` <i>(string)</i>: Command keyword
* `data` <i>(string)</i>: Command data in JSON format.


---

<h3 id="method-cmdaction-info">method CmdAction.info</h3>

```ts
info(msg: string): void
```

Responds to the command action with an info message.

<h4>Parameters</h4>

* `msg` <i>(string)</i>: Info message.


---

<h3 id="method-cmdaction-error">method CmdAction.error</h3>

```ts
error(msg: string): void
```

Responds to the command action with an error message.

<h4>Parameters</h4>

* `msg` <i>(string)</i>: Error message.


---

<h3 id="method-cmdaction-useexit">method CmdAction.useExit</h3>

```ts
useExit(exitId: ID): void
```

Responds to the command action by making the character use an exit.

The exit may be hidden or inactive. May not be used in combination with
info or error.

<h4>Parameters</h4>

* `exitId` <i>([ID](#type-id))</i>: Exit ID.


---

<h3 id="class-command">class Command</h3>

Command class is a representation of a custom command, and is used as an
argument when calling [Room.addCommand](#function-room-addcommand).

```ts
new Command(pattern: string, desc: string = "")
```

Creates a new instance of the [Command](#class-command) class.

<h4>Parameters</h4>

* `pattern` <i>(string)</i>
* `desc` <i>(string)</i>


<h4 id="class-command-properties">class Command properties</h4>

* `pattern` <i>(string)</i>
* `desc` <i>(string)</i>


---

<h3 id="method-command-field">method Command.field</h3>

```ts
field(key: string, def: CommandField): Command
```

Sets the definition for a command field.

<h4>Parameters</h4>

* `key` <i>(string)</i>: Field <key> as found in command pattern.
* `def` <i>([CommandField](#interface-commandfield))</i>: Field definition.

<h4>Returns</h4>

* <i>([Command](#class-command))</i>: This instance, allowing method chaining.


---

<h3 id="method-command-json">method Command.json</h3>

```ts
json(): string
```

Converts the command into a JSON structure.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="class-exitaction">class ExitAction</h3>

ExitAction is an action representing an intercepted use of an exit.

It is passed to [onExitUse](#onexituse) entry point when a character tries to
use an exit that is being listen to with [Room.listenExit](#function-room-listenexit).

<h4 id="class-exitaction-properties">class ExitAction properties</h4>

* `actionId` <i>(i32)</i>: Action ID
* `charId` <i>([ID](#type-id))</i>: Character ID
* `exitId` <i>([ID](#type-id))</i>: Exit ID


---

<h3 id="method-exitaction-useexit">method ExitAction.useExit</h3>

```ts
useExit(exitId: ID | null = null): void
```

Makes the character use an exit. If exitId is null, the character is sent
through the exit that they originally tried to use.

The exit may be hidden or inactive.

<h4>Parameters</h4>

* `exitId` <i>([ID](#type-id) | null)</i>: Exit ID or null for the originally used exit.


---

<h3 id="method-exitaction-cancel">method ExitAction.cancel</h3>

```ts
cancel(msg: string | null = null): void
```

Cancels a character's attempt to use an exit and shows them an info
message instead. If msg is null, the default exit timeout message will be
shown.

<h4>Parameters</h4>

* `msg` <i>(string | null)</i>: Info message to show, or default message if null.


<h2 id="namespaces">Namespaces</h2>

<h2 id="event-functions">Event functions</h2>

<h3 id="function-event-gettype">function Event.getType</h3>

```ts
Event.getType(ev: string): string
```

Get event type from a json encoded event.

<h4>Parameters</h4>

* `ev` <i>(string)</i>

<h4>Returns</h4>

* <i>(string)</i>


<h2 id="event-classes">Event classes</h2>

<h3 id="class-event-action">class Event.Action</h3>

Action event.

<h4 id="class-event-action-properties">class Event.Action properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.


---

<h3 id="class-event-arrive">class Event.Arrive</h3>

Arrive event.

<h4 id="class-event-arrive-properties">class Event.Arrive properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.
* `method` <i>(string)</i>: Method


---

<h3 id="class-event-base">class Event.Base</h3>

Base event shared by all events.

<h4 id="class-event-base-properties">class Event.Base properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.


---

<h3 id="class-event-basecharmethodmsg">class Event.BaseCharMethodMsg</h3>

Base event for message events by a character where a method is included,
such as leave and arrive.

<h4 id="class-event-basecharmethodmsg-properties">class Event.BaseCharMethodMsg properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.
* `method` <i>(string)</i>: Method


---

<h3 id="class-event-basecharmsg">class Event.BaseCharMsg</h3>

Base event for message events by a character, such as say, describe,
pose, etc.

<h4 id="class-event-basecharmsg-properties">class Event.BaseCharMsg properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.


---

<h3 id="class-event-basecharposemsg">class Event.BaseCharPoseMsg</h3>

Base event for message events by a character that may optionally be
marked as a pose, such as OOC events.

<h4 id="class-event-basecharposemsg-properties">class Event.BaseCharPoseMsg properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.
* `pose` <i>(boolean)</i>: Message is a pose.


---

<h3 id="class-event-char">class Event.Char</h3>

Character object with name and ID.

<h4 id="class-event-char-properties">class Event.Char properties</h4>

* `id` <i>(string)</i>: Character ID.
* `name` <i>(string)</i>: Character name.
* `surname` <i>(string)</i>: Character surname.


---

<h3 id="class-event-describe">class Event.Describe</h3>

Describe event.

<h4 id="class-event-describe-properties">class Event.Describe properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.


---

<h3 id="class-event-leave">class Event.Leave</h3>

Leave event.

<h4 id="class-event-leave-properties">class Event.Leave properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.
* `method` <i>(string)</i>: Method


---

<h3 id="class-event-ooc">class Event.OOC</h3>

OOC event.

<h4 id="class-event-ooc-properties">class Event.OOC properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.
* `pose` <i>(boolean)</i>: Message is a pose.


---

<h3 id="class-event-pose">class Event.Pose</h3>

Pose event.

<h4 id="class-event-pose-properties">class Event.Pose properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.


---

<h3 id="class-event-roll">class Event.Roll</h3>

Roll event.

<h4 id="class-event-roll-properties">class Event.Roll properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.
* `total` <i>(i32)</i>: Roll total.
* `result` <i>(Array<[Event.RollResult](#class-event-rollresult)>)</i>: Roll result.
* `quiet` <i>(boolean)</i>: Quiet roll.


---

<h3 id="class-event-rollresult">class Event.RollResult</h3>

Results in a roll event.

<h4 id="class-event-rollresult-properties">class Event.RollResult properties</h4>

* `type` <i>(string)</i>
* `op` <i>(string)</i>: Modifier operator. Either "+" or "-".
* `count` <i>(i32)</i>: Dice count. Always 0 on type "mod".
* `sides` <i>(i32)</i>: Sides on dice. Always 0 on type "mod"
* `dice` <i>(Array<i32>)</i>: Roll value for each die. Always empty slice on type "mod"
* `value` <i>(i32)</i>: Modifier value. Always 0 on type "std".


---

<h3 id="class-event-say">class Event.Say</h3>

Say event.

<h4 id="class-event-say-properties">class Event.Say properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.


---

<h3 id="class-event-sleep">class Event.Sleep</h3>

Sleep event.

<h4 id="class-event-sleep-properties">class Event.Sleep properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.


---

<h3 id="class-event-wakeup">class Event.Wakeup</h3>

Wakeup event.

<h4 id="class-event-wakeup-properties">class Event.Wakeup properties</h4>

* `id` <i>(string)</i>: Event ID.
* `type` <i>(string)</i>: Event type.
* `time` <i>(i64)</i>: Unix timestamp (milliseconds).
* `sig` <i>(string)</i>: Signature.
* `msg` <i>(string)</i>: Message.
* `char` <i>([Event.Char](#class-event-char))</i>: Acting character.
* `puppeteer` <i>([Event.Char](#class-event-char) | null)</i>: Acting puppeteer.


---

<h2 id="field-classes">Field classes</h2>

<h3 id="class-field-bool">class Field.Bool</h3>

An bool field is used for boolean values.

```ts
new Field.Bool(desc: string = "")
```

<h4>Parameters</h4>

* `desc` <i>(string)</i>



---

<h3 id="method-field-bool-gettype">method Field.Bool.getType</h3>

```ts
getType(): string
```

Returns the type of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-bool-getdesc">method Field.Bool.getDesc</h3>

```ts
getDesc(): string
```

Returns the help description of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-bool-getopts">method Field.Bool.getOpts</h3>

```ts
getOpts(): string | null
```

Returns the options of the command field as a JSON encoded string.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="class-field-char">class Field.Char</h3>

A char field is used to enter the name of a character.

```ts
new Field.Char(desc: string = "")
```

<h4>Parameters</h4>

* `desc` <i>(string)</i>


<h4 id="class-field-char-properties">class Field.Char properties</h4>

* `inRoom` <i>(boolean)</i>
* `state` <i>([CharState](#enum-charstate))</i>


---

<h3 id="method-field-char-gettype">method Field.Char.getType</h3>

```ts
getType(): string
```

Returns the type of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-char-getdesc">method Field.Char.getDesc</h3>

```ts
getDesc(): string
```

Returns the help description of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-char-getopts">method Field.Char.getOpts</h3>

```ts
getOpts(): string | null
```

Returns the options of the command field as a JSON encoded string.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="method-field-char-setinroom">method Field.Char.setInRoom</h3>

```ts
setInRoom(): this
```

Sets inRoom flag, requiring the character to be in the room.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-char-setstate">method Field.Char.setState</h3>

```ts
setState(state: CharState): this
```

Sets state that the character must be in. Default is [CharState.Any](#enum-charstate).

<h4>Parameters</h4>

* `state` <i>([CharState](#enum-charstate))</i>

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="class-field-float">class Field.Float</h3>

A float field is used for decimal numbers.

```ts
new Field.Float(desc: string = "")
```

<h4>Parameters</h4>

* `desc` <i>(string)</i>


<h4 id="class-field-float-properties">class Field.Float properties</h4>

* `min` <i>(f64)</i>
* `max` <i>(f64)</i>


---

<h3 id="method-field-float-gettype">method Field.Float.getType</h3>

```ts
getType(): string
```

Returns the type of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-float-getdesc">method Field.Float.getDesc</h3>

```ts
getDesc(): string
```

Returns the help description of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-float-getopts">method Field.Float.getOpts</h3>

```ts
getOpts(): string | null
```

Returns the options of the command field as a JSON encoded string.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="method-field-float-setmin">method Field.Float.setMin</h3>

```ts
setMin(min: f64, inclusive: bool): this
```

Sets float min value. Must be smaller than (or equal if both are inclusive) to max value.

<h4>Parameters</h4>

* `min` <i>(f64)</i>: Min value of float.
* `inclusive` <i>(bool)</i>: Flag to tell if min value is inclusive (>=) on true, or exclusive (>) on false.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-float-setmax">method Field.Float.setMax</h3>

```ts
setMax(max: f64, inclusive: bool): this
```

Sets float max value. Must be greater than (or equal if both are inclusive) to min value.

<h4>Parameters</h4>

* `max` <i>(f64)</i>: Max value of float.
* `inclusive` <i>(bool)</i>: Flag to tell if max value is inclusive (<=) on true, or exclusive (<) on false.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="class-field-integer">class Field.Integer</h3>

An integer field is used for whole numbers.

```ts
new Field.Integer(desc: string = "")
```

<h4>Parameters</h4>

* `desc` <i>(string)</i>


<h4 id="class-field-integer-properties">class Field.Integer properties</h4>

* `min` <i>(i64)</i>
* `max` <i>(i64)</i>


---

<h3 id="method-field-integer-gettype">method Field.Integer.getType</h3>

```ts
getType(): string
```

Returns the type of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-integer-getdesc">method Field.Integer.getDesc</h3>

```ts
getDesc(): string
```

Returns the help description of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-integer-getopts">method Field.Integer.getOpts</h3>

```ts
getOpts(): string | null
```

Returns the options of the command field as a JSON encoded string.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="method-field-integer-setmin">method Field.Integer.setMin</h3>

```ts
setMin(min: i64): this
```

Sets integer min value. Must be smaller or equal to max value.

<h4>Parameters</h4>

* `min` <i>(i64)</i>: Min value of integer.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-integer-setmax">method Field.Integer.setMax</h3>

```ts
setMax(max: i64): this
```

Sets integer max value. Must be greater or equal to min value.

<h4>Parameters</h4>

* `max` <i>(i64)</i>: Max value of integer

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="class-field-keyword">class Field.Keyword</h3>

A keyword field is used for keyword names using a limited set of
characters that will be transformed to lower case. By default, a keyword
allows Letters, Numbers, Spaces, apostrophes ('), and dash/minus (-).

```ts
new Field.Keyword(desc: string = "")
```

<h4>Parameters</h4>

* `desc` <i>(string)</i>


<h4 id="class-field-keyword-properties">class Field.Keyword properties</h4>

* `removeDiacritics` <i>(boolean)</i>
* `minLength` <i>(u32)</i>
* `maxLength` <i>(u32)</i>


---

<h3 id="method-field-keyword-gettype">method Field.Keyword.getType</h3>

```ts
getType(): string
```

Returns the type of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-keyword-getdesc">method Field.Keyword.getDesc</h3>

```ts
getDesc(): string
```

Returns the help description of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-keyword-getopts">method Field.Keyword.getOpts</h3>

```ts
getOpts(): string | null
```

Returns the options of the command field as a JSON encoded string.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="method-field-keyword-setremovediacritics">method Field.Keyword.setRemoveDiacritics</h3>

```ts
setRemoveDiacritics(removeDiacritics: boolean): this
```

Sets flag to remove diacritics from the keyword by decomposing the
characters and removing any non-print characters and marker in the Mn
Unicode category. Is false by default.

<h4>Parameters</h4>

* `removeDiacritics` <i>(boolean)</i>: Flag telling if diacritics should be removed.

<h4>Returns</h4>

* <i>(this)</i>


---

<h3 id="method-field-keyword-setminlength">method Field.Keyword.setMinLength</h3>

```ts
setMinLength(minLength: u32): this
```

Sets text min length. Must be smaller or equal to max length unless
max length is set to zero (0).. Is 0 by default.

<h4>Parameters</h4>

* `minLength` <i>(u32)</i>: Min length of text.

<h4>Returns</h4>

* <i>(this)</i>


---

<h3 id="method-field-keyword-setmaxlength">method Field.Keyword.setMaxLength</h3>

```ts
setMaxLength(maxLength: u32): this
```

Sets text maximum length. Zero (0) means server max length. Is 0 by default.

<h4>Parameters</h4>

* `maxLength` <i>(u32)</i>: Max length of text.

<h4>Returns</h4>

* <i>(this)</i>


---

<h3 id="class-field-list">class Field.List</h3>

A list field is used to select between a list of items. Items must be
unique, not containing non-printable or newline characters, and be
trimmed of leading, trailing, and consecutive spaces.

Items should not contain characters used as delimiters to continue the
command.

```ts
new Field.List(desc: string = "")
```

<h4>Parameters</h4>

* `desc` <i>(string)</i>


<h4 id="class-field-list-properties">class Field.List properties</h4>

* `items` <i>(Array<string>)</i>


---

<h3 id="method-field-list-gettype">method Field.List.getType</h3>

```ts
getType(): string
```

Returns the type of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-list-getdesc">method Field.List.getDesc</h3>

```ts
getDesc(): string
```

Returns the help description of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-list-getopts">method Field.List.getOpts</h3>

```ts
getOpts(): string | null
```

Returns the options of the command field as a JSON encoded string.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="method-field-list-additem">method Field.List.addItem</h3>

```ts
addItem(item: string): this
```

Adds a single item to the list.

<h4>Parameters</h4>

* `item` <i>(string)</i>

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-list-setitems">method Field.List.setItems</h3>

```ts
setItems(items: Array<string>): this
```

Sets an array of list items, replacing any previously set items.

<h4>Parameters</h4>

* `items` <i>(Array<string>)</i>: Array of list items.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="class-field-text">class Field.Text</h3>

A text field is used for arbitrary text, such as messages, descriptions, or titles.

```ts
new Field.Text(desc: string = "")
```

<h4>Parameters</h4>

* `desc` <i>(string)</i>


<h4 id="class-field-text-properties">class Field.Text properties</h4>

* `spanLines` <i>(boolean)</i>
* `spellCheck` <i>(boolean)</i>
* `formatText` <i>(boolean)</i>
* `minLength` <i>(u32)</i>
* `maxLength` <i>(u32)</i>


---

<h3 id="method-field-text-gettype">method Field.Text.getType</h3>

```ts
getType(): string
```

Returns the type of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-text-getdesc">method Field.Text.getDesc</h3>

```ts
getDesc(): string
```

Returns the help description of the command field.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-field-text-getopts">method Field.Text.getOpts</h3>

```ts
getOpts(): string | null
```

Returns the options of the command field as a JSON encoded string.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="method-field-text-setspanlines">method Field.Text.setSpanLines</h3>

```ts
setSpanLines(spanLines: boolean): this
```

Sets span lines flag. Is false by default.

<h4>Parameters</h4>

* `spanLines` <i>(boolean)</i>: Flag telling if the text can be spanned across multiple lines.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-text-setspellcheck">method Field.Text.setSpellCheck</h3>

```ts
setSpellCheck(spellCheck: boolean): this
```

Sets flag to spellCheck text. Is true by default.

<h4>Parameters</h4>

* `spellCheck` <i>(boolean)</i>: Flag telling if the text should be checked for spelling errors.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-text-setformattext">method Field.Text.setFormatText</h3>

```ts
setFormatText(formatText: boolean): this
```

Sets flag to format text while typing. Is false by default.

<h4>Parameters</h4>

* `formatText` <i>(boolean)</i>: Flag telling the text should be formatted while typing.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-text-setminlength">method Field.Text.setMinLength</h3>

```ts
setMinLength(minLength: u32): this
```

Sets text min length. Must be smaller or equal to max length unless
max length is set to zero (0).. Is 0 by default.

<h4>Parameters</h4>

* `minLength` <i>(u32)</i>: Min length of text.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h3 id="method-field-text-setmaxlength">method Field.Text.setMaxLength</h3>

```ts
setMaxLength(maxLength: u32): this
```

Sets text maximum length. Zero (0) means server max length. Is 0 by default.

<h4>Parameters</h4>

* `maxLength` <i>(u32)</i>: Max length of text.

<h4>Returns</h4>

* <i>(this)</i>: This instance, allowing method chaining.


---

<h2 id="fieldvalue-classes">FieldValue classes</h2>

<h3 id="class-fieldvalue-bool">class FieldValue.Bool</h3>



<h4 id="class-fieldvalue-bool-properties">class FieldValue.Bool properties</h4>

* `value` <i>(bool)</i>


---

<h3 id="class-fieldvalue-char">class FieldValue.Char</h3>



<h4 id="class-fieldvalue-char-properties">class FieldValue.Char properties</h4>

* `id` <i>(string)</i>: Character ID.
* `name` <i>(string)</i>: Character name.
* `surname` <i>(string)</i>: Character surname.


---

<h3 id="class-fieldvalue-float">class FieldValue.Float</h3>



<h4 id="class-fieldvalue-float-properties">class FieldValue.Float properties</h4>

* `value` <i>(f64)</i>


---

<h3 id="class-fieldvalue-integer">class FieldValue.Integer</h3>



<h4 id="class-fieldvalue-integer-properties">class FieldValue.Integer properties</h4>

* `value` <i>(i64)</i>


---

<h3 id="class-fieldvalue-keyword">class FieldValue.Keyword</h3>



<h4 id="class-fieldvalue-keyword-properties">class FieldValue.Keyword properties</h4>

* `value` <i>(string)</i>


---

<h3 id="class-fieldvalue-list">class FieldValue.List</h3>



<h4 id="class-fieldvalue-list-properties">class FieldValue.List properties</h4>

* `value` <i>(string)</i>


---

<h3 id="class-fieldvalue-text">class FieldValue.Text</h3>



<h4 id="class-fieldvalue-text-properties">class FieldValue.Text properties</h4>

* `value` <i>(string)</i>


---

<h2 id="json-enums">JSON enums</h2>

<h3 id="enum-json-types">enum JSON.Types</h3>

```ts
enum Types {
    Raw    = 0,
    U8     = 1,
    U16    = 2,
    U32    = 3,
    U64    = 4,
    F32    = 5,
    F64    = 6,
    Null   = 7,
    Bool   = 8,
    String = 9,
    Object = 10,
    Array  = 12,
    Struct = 13,
}
```

Enum representing the different types supported by JSON.

<h2 id="json-functions">JSON functions</h2>

<h3 id="function-json-parse">function JSON.parse</h3>

```ts
JSON.parse(data: string): T
```

Parses valid JSON strings into their original format
```js
JSON.parse<T>(data)
```

<h4>Parameters</h4>

* `data` <i>(string)</i>: string

<h4>Returns</h4>

* <i>(T)</i>: T


---

<h3 id="function-json-stringify">function JSON.stringify</h3>

```ts
JSON.stringify(data: T, out: string | null = null): string
```

Serializes valid JSON data
```js
JSON.stringify<T>(data)
```

<h4>Parameters</h4>

* `data` <i>(T)</i>: T
* `out` <i>(string | null)</i>

<h4>Returns</h4>

* <i>(string)</i>: string


<h2 id="json-classes">JSON classes</h2>

<h3 id="class-json-box">class JSON.Box</h3>

Box for primitive types

```ts
new JSON.Box(value: T)
```

<h4>Parameters</h4>

* `value` <i>(T)</i>


<h4 id="class-json-box-properties">class JSON.Box properties</h4>

* `value` <i>(T)</i>


---

<h3 id="method-json-box-set">method JSON.Box.set</h3>

```ts
set(value: T): Box
```

Set the internal value of Box to new value

<h4>Parameters</h4>

* `value` <i>(T)</i>: T

<h4>Returns</h4>

* <i>([JSON.Box](#class-json-box))</i>: this


---

<h3 id="method-json-box-from">method JSON.Box.from</h3>

```ts
from(value: T): Box
```

Creates a reference to a primitive type
This means that it can create a nullable primitive
```js
JSON.stringify<Box<i32> | null>(null);
// null
```

<h4>Parameters</h4>

* `value` <i>(T)</i>

<h4>Returns</h4>

* <i>([JSON.Box](#class-json-box))</i>: Box<T>


---

<h3 id="method-json-box-tostring">method JSON.Box.toString</h3>

```ts
toString(): string
```

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="class-json-obj">class JSON.Obj</h3>



```ts
new JSON.Obj()
```



---

<h3 id="method-json-obj-set">method JSON.Obj.set</h3>

```ts
set(key: string, value: T): void
```

<h4>Parameters</h4>

* `key` <i>(string)</i>
* `value` <i>(T)</i>


---

<h3 id="method-json-obj-get">method JSON.Obj.get</h3>

```ts
get(key: string): Value | null
```

<h4>Parameters</h4>

* `key` <i>(string)</i>

<h4>Returns</h4>

* <i>([JSON.Value](#class-json-value) | null)</i>


---

<h3 id="method-json-obj-has">method JSON.Obj.has</h3>

```ts
has(key: string): bool
```

<h4>Parameters</h4>

* `key` <i>(string)</i>

<h4>Returns</h4>

* <i>(bool)</i>


---

<h3 id="method-json-obj-delete">method JSON.Obj.delete</h3>

```ts
delete(key: string): bool
```

<h4>Parameters</h4>

* `key` <i>(string)</i>

<h4>Returns</h4>

* <i>(bool)</i>


---

<h3 id="method-json-obj-keys">method JSON.Obj.keys</h3>

```ts
keys(): Array<string>
```

<h4>Returns</h4>

* <i>(Array<string>)</i>


---

<h3 id="method-json-obj-values">method JSON.Obj.values</h3>

```ts
values(): Array<Value>
```

<h4>Returns</h4>

* <i>(Array<[JSON.Value](#class-json-value)>)</i>


---

<h3 id="method-json-obj-tostring">method JSON.Obj.toString</h3>

```ts
toString(): string
```

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-json-obj-from">method JSON.Obj.from</h3>

```ts
from(value: T): Obj
```

<h4>Parameters</h4>

* `value` <i>(T)</i>

<h4>Returns</h4>

* <i>([JSON.Obj](#class-json-obj))</i>


---

<h3 id="class-json-raw">class JSON.Raw</h3>



```ts
new JSON.Raw(data: string)
```

<h4>Parameters</h4>

* `data` <i>(string)</i>


<h4 id="class-json-raw-properties">class JSON.Raw properties</h4>

* `data` <i>(string)</i>


---

<h3 id="method-json-raw-set">method JSON.Raw.set</h3>

```ts
set(data: string): void
```

<h4>Parameters</h4>

* `data` <i>(string)</i>


---

<h3 id="method-json-raw-tostring">method JSON.Raw.toString</h3>

```ts
toString(): string
```

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-json-raw-from">method JSON.Raw.from</h3>

```ts
from(data: string): Raw
```

<h4>Parameters</h4>

* `data` <i>(string)</i>

<h4>Returns</h4>

* <i>([JSON.Raw](#class-json-raw))</i>


---

<h3 id="class-json-value">class JSON.Value</h3>



<h4 id="class-json-value-properties">class JSON.Value properties</h4>

* `METHODS` <i>(Map)</i>
* `type` <i>(i32)</i>


---

<h3 id="method-json-value-empty">method JSON.Value.empty</h3>

```ts
empty(): Value
```

Creates an JSON.Value instance with no set value.

<h4>Returns</h4>

* <i>([JSON.Value](#class-json-value))</i>: An instance of JSON.Value.


---

<h3 id="method-json-value-from">method JSON.Value.from</h3>

```ts
from(value: T): Value
```

Creates an JSON.Value instance from a given value.

<h4>Parameters</h4>

* `value` <i>(T)</i>: The value to be encapsulated.

<h4>Returns</h4>

* <i>([JSON.Value](#class-json-value))</i>: An instance of JSON.Value.


---

<h3 id="method-json-value-set">method JSON.Value.set</h3>

```ts
set(value: T): void
```

Sets the value of the JSON.Value instance.

<h4>Parameters</h4>

* `value` <i>(T)</i>: The value to be set.


---

<h3 id="method-json-value-get">method JSON.Value.get</h3>

```ts
get(): T
```

Gets the value of the JSON.Value instance.

<h4>Returns</h4>

* <i>(T)</i>: The encapsulated value.


---

<h3 id="method-json-value-tostring">method JSON.Value.toString</h3>

```ts
toString(): string
```

Converts the JSON.Value to a string representation.

<h4>Returns</h4>

* <i>(string)</i>: The string representation of the JSON.Value.


<h2 id="json-namespaces">JSON namespaces</h2>

<h2 id="json-memory-functions">JSON.Memory functions</h2>

<h3 id="function-json-memory-shrink">function JSON.Memory.shrink</h3>

```ts
JSON.Memory.shrink(): void
```


---

<h2 id="room-functions">Room functions</h2>

<h3 id="function-room-addcommand">function Room.addCommand</h3>

```ts
Room.addCommand(keyword: string, cmd: Command, priority: u32 = 0): void
```

Adds a custom command to the room.

Pattern is a string describing the general command structure, and may
contain <Fields> and [optional] parts.

Any field defined in the pattern must have a corresponding field entry.

<h4>Parameters</h4>

* `keyword` <i>(string)</i>: Keyword for the command.
* `cmd` <i>([Command](#class-command))</i>: Command to add.
* `priority` <i>(u32)</i>: Priority for sort order (descending) and when two or more commands match the same input. Higher priority is selected first.


---

<h3 id="function-room-canedit">function Room.canEdit</h3>

```ts
Room.canEdit(charId: ID): boolean
```

Checks if a character is the owner of the room, or if the owner shares
the same player as the character. It does not include admins or builders.

<h4>Parameters</h4>

* `charId` <i>([ID](#type-id))</i>: Character ID.

<h4>Returns</h4>

* <i>(boolean)</i>


---

<h3 id="function-room-chariterator">function Room.charIterator</h3>

```ts
Room.charIterator(state: CharState = CharState.Any, reverse: boolean = false): CharIterator
```

Gets an iterator for the characters in the room that iterates from the
character most recently entering the room.

<h4>Parameters</h4>

* `state` <i>([CharState](#enum-charstate))</i>: State of the characters to iterate over.
* `reverse` <i>(boolean)</i>: Flag to reverse the iteration direction, starting with the character that has been in the room the longest.

<h4>Returns</h4>

* <i>([Room.CharIterator](#class-room-chariterator))</i>


---

<h3 id="function-room-describe">function Room.describe</h3>

```ts
Room.describe(msg: string): void
```

Sends a "describe" event to the current room instance.

<h4>Parameters</h4>

* `msg` <i>(string)</i>


---

<h3 id="function-room-exititerator">function Room.exitIterator</h3>

```ts
Room.exitIterator(): ExitIterator
```

Gets an iterator for the exits in the room. Order is undefined.

<h4>Returns</h4>

* <i>([Room.ExitIterator](#class-room-exititerator))</i>


---

<h3 id="function-room-getchar">function Room.getChar</h3>

```ts
Room.getChar(charId: ID): Char | null
```

Gets a character in the room by ID.

<h4>Parameters</h4>

* `charId` <i>([ID](#type-id))</i>: Character ID.

<h4>Returns</h4>

* <i>([Room.Char](#class-room-char) | null)</i>: [Room.Char](#class-room-char) object or null if the character is not found in the room.


---

<h3 id="function-room-getdetails">function Room.getDetails</h3>

```ts
Room.getDetails(): RoomDetails
```

Get detailed room information, such as description and settings.

<h4>Returns</h4>

* <i>([Room.RoomDetails](#class-room-roomdetails))</i>


---

<h3 id="function-room-getexit">function Room.getExit</h3>

```ts
Room.getExit(keyword: string): Exit | null
```

Gets an exit in the room by keyword.

<h4>Parameters</h4>

* `keyword` <i>(string)</i>

<h4>Returns</h4>

* <i>([Room.Exit](#class-room-exit) | null)</i>: [Room.Exit](#class-room-exit) object or null if the exit is not found in the room.


---

<h3 id="function-room-getexitbyid">function Room.getExitById</h3>

```ts
Room.getExitById(exitId: ID): Exit | null
```

Gets an exit in the room by ID.

<h4>Parameters</h4>

* `exitId` <i>([ID](#type-id))</i>: Exit ID.

<h4>Returns</h4>

* <i>([Room.Exit](#class-room-exit) | null)</i>: [Room.Exit](#class-room-exit) object or null if the exit is not found in the room.


---

<h3 id="function-room-getexitorder">function Room.getExitOrder</h3>

```ts
Room.getExitOrder(): Array<ID>
```

Gets the exit order of visible exits in the room as an array of [ID](#type-id) values.

<h4>Returns</h4>

* <i>(Array<[ID](#type-id)>)</i>


---

<h3 id="function-room-listen">function Room.listen</h3>

```ts
Room.listen(instance: string | null = null): boolean
```

Starts listening to room events on the current instance. If `instance` is
set, it starts listening for events in that specific instance, or null
for any room instance. Room events will be sent to `onRoomEvent` for the
instance.

<h4>Parameters</h4>

* `instance` <i>(string | null)</i>: Instance or null for the non-instance.

<h4>Returns</h4>

* <i>(boolean)</i>: Returns true if a new listener was added, otherwise false.


---

<h3 id="function-room-listencharevent">function Room.listenCharEvent</h3>

```ts
Room.listenCharEvent(instance: string | null = null): boolean
```

Starts listening to char events in the room. If `instance` is set, it
starts listening for events in that specific instance, or null for any
room instance. Char events will be sent to `onCharEvent` for the
instance.

<h4>Parameters</h4>

* `instance` <i>(string | null)</i>: Instance or null for any instance.

<h4>Returns</h4>

* <i>(boolean)</i>: True if a new listener was added, otherwise false.


---

<h3 id="function-room-listenexit">function Room.listenExit</h3>

```ts
Room.listenExit(exitId: string | null = null): boolean
```

Starts listening to exit usage in the room, including any instance. If
`exitId` is null, it acts as a wildcard to listen to any exit otherwise
not being listened to specifically. Exit use events will be sent to
`onExitUse`.

Only one script may listen to a given exit at any time. Only one script
may listen to any exit with the null wildcard at any one time

<h4>Parameters</h4>

* `exitId` <i>(string | null)</i>: Exit ID or null for any exit.

<h4>Returns</h4>

* <i>(boolean)</i>: True if a new listener was added, otherwise false.


---

<h3 id="function-room-privatedescribe">function Room.privateDescribe</h3>

```ts
Room.privateDescribe(msg: string, targetCharIds: Array<ID>): void
```

Sends a "privateDescribe" event to one or more target characters in the
current room instance. A private describe can only be seen by the
targeted characters.

<h4>Parameters</h4>

* `msg` <i>(string)</i>
* `targetCharIds` <i>(Array<[ID](#type-id)>)</i>


---

<h3 id="function-room-removecommand">function Room.removeCommand</h3>

```ts
Room.removeCommand(keyword: string): boolean
```

Removes a custom command, added by the script, from the room.

<h4>Parameters</h4>

* `keyword` <i>(string)</i>: Keyword for the command.

<h4>Returns</h4>

* <i>(boolean)</i>


---

<h3 id="function-room-setexit">function Room.setExit</h3>

```ts
Room.setExit(exitId: ID, fields: T): void
```

Set exit information.

The parameters must be an object that may be converted to json with the
following paramters. Any other fields will be ignored.

<h4>Parameters</h4>

* `exitId` <i>([ID](#type-id))</i>: Exit ID.
* `fields` <i>(T)</i>: Exit fields to update.


---

<h3 id="function-room-setroom">function Room.setRoom</h3>

```ts
Room.setRoom(fields: T): void
```

Set room information.

The parameters must be an object that may be converted to json with the
following paramters. Any other fields will be ignored.

<h4>Parameters</h4>

* `fields` <i>(T)</i>: Room fields to update.


---

<h3 id="function-room-sweepchar">function Room.sweepChar</h3>

```ts
Room.sweepChar(charId: ID, msg: string | null): void
```

Sweep a single character from the room by sending them home.

<h4>Parameters</h4>

* `charId` <i>([ID](#type-id))</i>: Character ID.
* `msg` <i>(string | null)</i>: Message to show too the room when the character is teleported away. Defaults to other teleport messages.


---

<h3 id="function-room-unlisten">function Room.unlisten</h3>

```ts
Room.unlisten(instance: string | null = null): boolean
```

Stops listening to room events on the current instance. If `instance` is
provided, it stops listening for that specific instance, or null for the
non-instance room.

<h4>Parameters</h4>

* `instance` <i>(string | null)</i>: Instance or null for the non-instance.

<h4>Returns</h4>

* <i>(boolean)</i>: True if a listener existed, otherwise false.


---

<h3 id="function-room-unlistencharevent">function Room.unlistenCharEvent</h3>

```ts
Room.unlistenCharEvent(instance: string | null = null): boolean
```

Stops listening to char events in the room. If `instance` is set, it
stops listening for events in that specific instance, or null for any
room instance.

<h4>Parameters</h4>

* `instance` <i>(string | null)</i>: Instance or null for any instance.

<h4>Returns</h4>

* <i>(boolean)</i>: True if a listener existed, otherwise false.


---

<h3 id="function-room-unlistenexit">function Room.unlistenExit</h3>

```ts
Room.unlistenExit(exitId: string | null = null): boolean
```

Stops listening to exit usage in the room. If `exitId` is set, it stops
listening for exit use for that specific exit, or null to stop listening
for the the wildcard listener.

<h4>Parameters</h4>

* `exitId` <i>(string | null)</i>: Exit ID or null for any exit.

<h4>Returns</h4>

* <i>(boolean)</i>: True if a listener existed, otherwise false.


---

<h3 id="function-room-useprofile">function Room.useProfile</h3>

```ts
Room.useProfile(keyword: string, safe: boolean = false): void
```

Switches to a stored room profile by profile key.

<h4>Parameters</h4>

* `keyword` <i>(string)</i>: Keyword for the stored profile.
* `safe` <i>(boolean)</i>: Flag to prevent the room's current profile to be overwritten by the stored profile, if it contains unstored changes.


<h2 id="room-classes">Room classes</h2>

<h3 id="class-room-char">class Room.Char</h3>

Room character.

<h4 id="class-room-char-properties">class Room.Char properties</h4>

* `id` <i>(string)</i>: Character ID.
* `name` <i>(string)</i>: Character name.
* `surname` <i>(string)</i>: Character surname.
* `avatar` <i>([ID](#type-id))</i>: Character avatar.
* `species` <i>(string)</i>: Character species.
* `gender` <i>(string)</i>: Character gender.
* `desc` <i>(string)</i>: Character description.
* `image` <i>([ID](#type-id))</i>: Character image.
* `state` <i>([CharState](#enum-charstate))</i>: Character state.
* `idle` <i>([IdleLevel](#enum-idlelevel))</i>: Character idle status.
* `rp` <i>([RPState](#enum-rpstate))</i>: Character RP state.


---

<h3 id="class-room-chariterator">class Room.CharIterator</h3>



```ts
new Room.CharIterator(iterator: i32)
```

Constructor of the Iterator instance.

<h4>Parameters</h4>

* `iterator` <i>(i32)</i>


<h4 id="class-room-chariterator-properties">class Room.CharIterator properties</h4>

* `iterator` <i>(i32)</i>


---

<h3 id="method-room-chariterator-next">method Room.CharIterator.next</h3>

```ts
next(): void
```

Advances the iterator by one. Always check isValid() after a next()
to ensure have not reached the end of the iterator.


---

<h3 id="method-room-chariterator-rewind">method Room.CharIterator.rewind</h3>

```ts
rewind(): void
```

Rewinds the iterator cursor all the way back to first position, which
would be the smallest key, or greatest key if inReverse() was called.

Any iterator prefix passed to withPrefix() will be used on rewind.
The iterator is rewound by default.


---

<h3 id="method-room-chariterator-getid">method Room.CharIterator.getID</h3>

```ts
getID(): ID
```

Returns the key string of the current key-value pair. It will abort
if the cursor has reached the end of the iterator.

<h4>Returns</h4>

* <i>([ID](#type-id))</i>


---

<h3 id="method-room-chariterator-isvalid">method Room.CharIterator.isValid</h3>

```ts
isValid(): boolean
```

Returns false when the cursor is at the end of the iterator.

<h4>Returns</h4>

* <i>(boolean)</i>


---

<h3 id="method-room-chariterator-close">method Room.CharIterator.close</h3>

```ts
close(): void
```

Closes the iterator. Any further calls to the iterator will cause an
error. May be called multiple times.


---

<h3 id="method-room-chariterator-getchar">method Room.CharIterator.getChar</h3>

```ts
getChar(): Char
```

Returns the current char. It will abort if the cursor has reached the
end of the iterator.

<h4>Returns</h4>

* <i>([Room.Char](#class-room-char))</i>


---

<h3 id="class-room-exit">class Room.Exit</h3>

Room exit.

<h4 id="class-room-exit-properties">class Room.Exit properties</h4>

* `id` <i>(string)</i>: Exit ID.
* `keys` <i>(Array<string>)</i>: Exit keys.
* `name` <i>(string)</i>: Exit name.
* `icon` <i>([ExitIcon](#enum-exiticon))</i>: Exit icon.
* `nav` <i>([ExitNav](#enum-exitnav))</i>: Exit navigation direction.
* `leaveMsg` <i>(string)</i>: Leave message.
* `arriveMsg` <i>(string)</i>: Arrival message.
* `travelMsg` <i>(string)</i>: Travel message.
* `targetRoom` <i>([ID](#type-id))</i>: Target room.
* `created` <i>(i64)</i>: Created timestamp.
* `hidden` <i>(boolean)</i>: Is hidden flag.
* `inactive` <i>(boolean)</i>: Is inactive flag.
* `transparent` <i>(boolean)</i>: Is transparent flag.


---

<h3 id="class-room-exititerator">class Room.ExitIterator</h3>



```ts
new Room.ExitIterator(iterator: i32)
```

Constructor of the Iterator instance.

<h4>Parameters</h4>

* `iterator` <i>(i32)</i>


<h4 id="class-room-exititerator-properties">class Room.ExitIterator properties</h4>

* `iterator` <i>(i32)</i>


---

<h3 id="method-room-exititerator-next">method Room.ExitIterator.next</h3>

```ts
next(): void
```

Advances the iterator by one. Always check isValid() after a next()
to ensure have not reached the end of the iterator.


---

<h3 id="method-room-exititerator-rewind">method Room.ExitIterator.rewind</h3>

```ts
rewind(): void
```

Rewinds the iterator cursor all the way back to first position, which
would be the smallest key, or greatest key if inReverse() was called.

Any iterator prefix passed to withPrefix() will be used on rewind.
The iterator is rewound by default.


---

<h3 id="method-room-exititerator-getid">method Room.ExitIterator.getID</h3>

```ts
getID(): ID
```

Returns the key string of the current key-value pair. It will abort
if the cursor has reached the end of the iterator.

<h4>Returns</h4>

* <i>([ID](#type-id))</i>


---

<h3 id="method-room-exititerator-isvalid">method Room.ExitIterator.isValid</h3>

```ts
isValid(): boolean
```

Returns false when the cursor is at the end of the iterator.

<h4>Returns</h4>

* <i>(boolean)</i>


---

<h3 id="method-room-exititerator-close">method Room.ExitIterator.close</h3>

```ts
close(): void
```

Closes the iterator. Any further calls to the iterator will cause an
error. May be called multiple times.


---

<h3 id="method-room-exititerator-getexit">method Room.ExitIterator.getExit</h3>

```ts
getExit(): Exit
```

Returns the current char. It will abort if the cursor has reached the
end of the iterator.

<h4>Returns</h4>

* <i>([Room.Exit](#class-room-exit))</i>


---

<h3 id="class-room-movemsgs">class Room.MoveMsgs</h3>

Move messages used when entering or leaving a room.

<h4 id="class-room-movemsgs-properties">class Room.MoveMsgs properties</h4>

* `leaveMsg` <i>(string)</i>
* `arriveMsg` <i>(string)</i>
* `travelMsg` <i>(string)</i>


---

<h3 id="class-room-roomdetails">class Room.RoomDetails</h3>

Detailed room information.

<h4 id="class-room-roomdetails-properties">class Room.RoomDetails properties</h4>

* `id` <i>([ID](#type-id))</i>: Room ID.
* `name` <i>(string)</i>: Room name.
* `desc` <i>(string)</i>: Room description.
* `imageId` <i>([ID](#type-id))</i>: Room image ID;
* `isDark` <i>(boolean)</i>: IsDark flags if other character can be seen or whispered to in the room.
* `isQuiet` <i>(boolean)</i>: IsQuiet flags if a room is quiet and won't allow communication.
* `isHome` <i>(boolean)</i>: IsHome flags if the room can be set as home by others.
* `isTeleport` <i>(boolean)</i>: IsTeleport flags if the room can be added as a teleport node by others.
* `isInstance` <i>(boolean)</i>: IsInstance flags if the room creates an instance.
* `autosweep` <i>(boolean)</i>: Autosweep flags if sleepers in the room should be sent home automatically.
* `autosweepDelay` <i>(i64)</i>: AutosweepDelay is the time in milliseconds until a sleeper is swept.
* `customTeleportMsgs` <i>(boolean)</i>: CustomTeleportMsgs flags if the room uses custom teleport messages.
* `overrideCharTeleportMsgs` <i>(boolean)</i>: OverrideCharTeleportMsgs flags if the custom teleport messages should override any set character teleport messages.
* `teleport` <i>([Room.MoveMsgs](#class-room-movemsgs))</i>: Custom teleport messages.
* `created` <i>(i64)</i>: Created time.


---

<h2 id="script-functions">Script functions</h2>

<h3 id="function-script-cancelpost">function Script.cancelPost</h3>

```ts
Script.cancelPost(scheduleId: ID | null): boolean
```

Cancel a message previously scheduled with `Script.post` with a delay.

The post can only be canceled from the same room instance that sent it.
The method returns true if the post was successfully canceled, or false if
the scheduleId is either null, not sent by the script instance, or if the
post was already sent.

<h4>Parameters</h4>

* `scheduleId` <i>([ID](#type-id) | null)</i>: Schedule ID returned by script.Post.

<h4>Returns</h4>

* <i>(boolean)</i>: True if the post was successfully canceled, otherwise false.


---

<h3 id="function-script-getchar">function Script.getChar</h3>

```ts
Script.getChar(charId: ID): Char | null
```

Gets info on an existing character.

To get character description or image info use Room.getChar instead.

<h4>Parameters</h4>

* `charId` <i>([ID](#type-id))</i>: Character ID.

<h4>Returns</h4>

* <i>([Script.Char](#class-script-char) | null)</i>: [Script.Char](#class-script-char) object or null if the character is not found.


---

<h3 id="function-script-listen">function Script.listen</h3>

```ts
Script.listen(addrs: Array<string> | null = null): void
```

Starts listening for posted messages from any of the given `addr`
addresses. If an address is a non-instance room, it will also listen to
posted messages from any instance of that room.

If no `addr` is provided, the script will listen to posts from _any_
source, including scripts and bots controlled by other players.

Posts from the current script does not require listening. A script can
always post to itself.

To get the address of a room script, use the `roomscript` command. For
more info, type:
```
help roomscript
```

<h4>Parameters</h4>

* `addrs` <i>(Array<string> | null)</i>


---

<h3 id="function-script-post">function Script.post</h3>

```ts
Script.post(addr: string, topic: string, data: string | null = null, delay: i64 = 0): ID | null
```

Posts a message to another script with the address `addr`.

To get the address of a room script, use the `roomscript` command. For
more info, type:
```
help roomscript
```

<h4>Parameters</h4>

* `addr` <i>(string)</i>: Address of target script. If addr is "#", it will be a post to the current script instance.
* `topic` <i>(string)</i>: Message topic. May be any kind of string.
* `data` <i>(string | null)</i>: Additional data. Must be valid JSON.
* `delay` <i>(i64)</i>: Delay in milliseconds.

<h4>Returns</h4>

* <i>([ID](#type-id) | null)</i>: Schedule [ID](#type-id) or null if the message was posted without delay of if the receiving script was not listening.


---

<h3 id="function-script-unlisten">function Script.unlisten</h3>

```ts
Script.unlisten(addrs: Array<string> | null = null): void
```

Starts listening for posted messages from any of the given `addr`
addresses. If an address is a non-instance room, it will also listen to
posted messages from any instance of that room.

If no `addr` is provided, the script will listen to posts from _any_
source.

To get the address of a room script, use the `roomscript` command. For
more info, type:
```
help roomscript
```

<h4>Parameters</h4>

* `addrs` <i>(Array<string> | null)</i>


<h2 id="script-classes">Script classes</h2>

<h3 id="class-script-char">class Script.Char</h3>

Realm character.

<h4 id="class-script-char-properties">class Script.Char properties</h4>

* `id` <i>(string)</i>: Character ID.
* `name` <i>(string)</i>: Character name.
* `surname` <i>(string)</i>: Character surname.
* `avatar` <i>([ID](#type-id))</i>: Character avatar.
* `species` <i>(string)</i>: Character species.
* `gender` <i>(string)</i>: Character gender.
* `state` <i>([CharState](#enum-charstate))</i>: Character state.
* `idle` <i>([IdleLevel](#enum-idlelevel))</i>: Character idle status.
* `rp` <i>([RPState](#enum-rpstate))</i>: Character RP state.


---

<h2 id="store-functions">Store functions</h2>

<h3 id="function-store-deletekey">function Store.deleteKey</h3>

```ts
Store.deleteKey(key: T): void
```

Deletes a key and it's value from the store. If the key does not exist,
this is a no-op.

<h4>Parameters</h4>

* `key` <i>(T)</i>: Stored key.


---

<h3 id="function-store-getbuffer">function Store.getBuffer</h3>

```ts
Store.getBuffer(key: T): ArrayBuffer | null
```

Returns the stored ArrayBuffer value for the key, or null if the key does
not exist.

<h4>Parameters</h4>

* `key` <i>(T)</i>: Stored key.

<h4>Returns</h4>

* <i>(ArrayBuffer | null)</i>


---

<h3 id="function-store-getstring">function Store.getString</h3>

```ts
Store.getString(key: T): string | null
```

Returns the stored string value for the key, or null if the key does not
exist.

<h4>Parameters</h4>

* `key` <i>(T)</i>: Stored key.

<h4>Returns</h4>

* <i>(string | null)</i>


---

<h3 id="function-store-readonly">function Store.readOnly</h3>

```ts
Store.readOnly(): void
```

Sets the database transaction to read-only during the script call,
allowing multiple iterators to be open at the same time.

Must be called before using the store.


---

<h3 id="function-store-setbuffer">function Store.setBuffer</h3>

```ts
Store.setBuffer(key: T, value: ArrayBuffer): void
```

Adds a key and an ArrayBuffer value to the store, or updates that key's
value if it already exists.

<h4>Parameters</h4>

* `key` <i>(T)</i>: Stored key.
* `value` <i>(ArrayBuffer)</i>: Stored value.


---

<h3 id="function-store-setstring">function Store.setString</h3>

```ts
Store.setString(key: T, value: string): void
```

Adds a key and a string value to the store, or updates that key's value
if it already exists.

<h4>Parameters</h4>

* `key` <i>(T)</i>: Stored key.
* `value` <i>(string)</i>: Stored string value.


---

<h3 id="function-store-totalbytes">function Store.totalBytes</h3>

```ts
Store.totalBytes(): i64
```

Returns the total number of bytes used by the store for this script
address.

<h4>Returns</h4>

* <i>(i64)</i>


<h2 id="store-classes">Store classes</h2>

<h3 id="class-store-iterator">class Store.Iterator</h3>

Iterator is an object that iterates over a storage.

```ts
new Store.Iterator()
```

Constructor of the Iterator instance.



---

<h3 id="method-store-iterator-withprefix">method Store.Iterator.withPrefix</h3>

```ts
withPrefix(prefix: T): Iterator
```

Sets a prefix to use for calls to seek, rewind, and isValid.

Must be called before using the iterator.

<h4>Parameters</h4>

* `prefix` <i>(T)</i>: Key prefix used in seek, rewind, and isValid.

<h4>Returns</h4>

* <i>([Store.Iterator](#class-store-iterator))</i>: This instance, allowing method chaining.


---

<h3 id="method-store-iterator-inreverse">method Store.Iterator.inReverse</h3>

```ts
inReverse(): Iterator
```

Sets direction of iteration to be in lexiographcially reversed order.

Must be called before using the iterator.

<h4>Returns</h4>

* <i>([Store.Iterator](#class-store-iterator))</i>: This instance, allowing method chaining.


---

<h3 id="method-store-iterator-next">method Store.Iterator.next</h3>

```ts
next(): void
```

Advances the iterator by one. Always check isValid() after a next()
to ensure have not reached the end of the iterator.


---

<h3 id="method-store-iterator-seek">method Store.Iterator.seek</h3>

```ts
seek(key: T): void
```

Seeks to the provided key if found. If not found, it would seek to
the next smallest key greater than the provided key if iterating in
the forward direction. Behavior would be reversed if iterating
backwards.

Any iterator prefix passed to withPrefix() will be prepended to
the key.

<h4>Parameters</h4>

* `key` <i>(T)</i>


---

<h3 id="method-store-iterator-rewind">method Store.Iterator.rewind</h3>

```ts
rewind(): void
```

Rewinds the iterator cursor all the way back to first position, which
would be the smallest key, or greatest key if inReverse() was called.

Any iterator prefix passed to withPrefix() will be used on rewind.
The iterator is rewound by default.


---

<h3 id="method-store-iterator-getkeystring">method Store.Iterator.getKeyString</h3>

```ts
getKeyString(): string
```

Returns the key string of the current key-value pair. It will abort
if the cursor has reached the end of the iterator.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-store-iterator-getkeybuffer">method Store.Iterator.getKeyBuffer</h3>

```ts
getKeyBuffer(): ArrayBuffer
```

Returns the key ArrayBuffer of the current key-value pair. It will
abort if the cursor has reached the end of the iterator.

<h4>Returns</h4>

* <i>(ArrayBuffer)</i>


---

<h3 id="method-store-iterator-getvaluestring">method Store.Iterator.getValueString</h3>

```ts
getValueString(): string
```

Returns the string value of the current key-value pair. It will abort
if the cursor has reached the end of the iterator.

<h4>Returns</h4>

* <i>(string)</i>


---

<h3 id="method-store-iterator-getvaluebuffer">method Store.Iterator.getValueBuffer</h3>

```ts
getValueBuffer(): ArrayBuffer
```

Returns the ArrayBuffer value of the current key-value pair. It will
abort if the cursor has reached the end of the iterator.

<h4>Returns</h4>

* <i>(ArrayBuffer)</i>


---

<h3 id="method-store-iterator-isvalid">method Store.Iterator.isValid</h3>

```ts
isValid(): boolean
```

Returns false when the cursor is at the end of the iterator.

Any iterator prefix passed to withPrefix() will be used as prefix.

<h4>Returns</h4>

* <i>(boolean)</i>


---

<h3 id="method-store-iterator-isvalidforprefix">method Store.Iterator.isValidForPrefix</h3>

```ts
isValidForPrefix(prefix: T | null): boolean
```

Returns false when the cursor is at the end of the iterator, or when
the current key is not prefixed by the specified prefix.

Any iterator prefix passed to withPrefix() will be prepended to the
provided prefix.

<h4>Parameters</h4>

* `prefix` <i>(T | null)</i>

<h4>Returns</h4>

* <i>(boolean)</i>


---

<h3 id="method-store-iterator-close">method Store.Iterator.close</h3>

```ts
close(): void
```

Closes the iterator. Any further calls to the iterator will cause an
error. May be called multiple times.

