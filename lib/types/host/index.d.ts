/**
 * Mucklet scripts are written in AssemblyScript, a strictly typed
 * TypeScript-like language. For more info on AssemblyScript, its types, and
 * standard library, see:
 *
 * &nbsp;&nbsp;&nbsp;&nbsp;🔗 [AssemblyScript
 * Concepts](https://www.assemblyscript.org/concepts.html)
 *
 * The standard library of AssemblyScript has been extended with classes and
 * functions to interact with Mucklet realms. See the [API
 * references](#api-references) for a complete list of those extensions.
 *
 * # Guides
 *
 * * [Writing scripts - Custom
 *   commands](https://github.com/mucklet/mucklet-script/blob/master/docs/writingscripts-customcommands.md)
 *
 * # Script examples
 *
 * Script file | Description
 * --- | ---
 * [ambience.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/ambience.ts) | A script showing ambient descriptions with random time intervals.
 * [day_and_night.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/day_and_night.ts) | A script cycling between a "day" and "night" room profile based on real time.
 * [intercom_inside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/intercom_inside.ts) | An intercom script allowing communication with another room running the [intercom_outside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/intercom_outside.ts) script.
 * [intercom_outside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/intercom_outside.ts) | An intercom script allowing communication with another room running the [intercom_inside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/intercom_inside.ts) script.
 * [lock_inside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/lock_inside.ts) | A script that locks a door preventing others from using an exit in the room running the [lock_outside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/lock_outside.ts) script.
 * [lock_outside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/lock_outside.ts) | A script that prevents characters from using an exit locked by the [lock_inside.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/lock_inside.ts) script.
 * [secret_exit.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/secret_exit.ts) | A script that reveals a secret passage when the password "tapeworm" is spoken.
 * [vip_list.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/vip_list.ts) | A script that manages a list of VIP characters, requested by another room running the [vip_guard.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/vip_guard.ts) script.
 * [vip_guard.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/vip_guard.ts) | A script that prevents characters from using an exit unless they are listed as VIP character by the [vip_list.ts](https://github.com/mucklet/mucklet-script/blob/master/examples/vip_list.ts) script.
 *
 * # Entry points
 *
 * The script entry points are exported functions that are called on different
 * types of events, such as the script activating, someone entering a room, or a
 * command being called.
 *
 * The only entry point that is required is [onActivate](#onactivate).
 *
 *
 * ## onActivate
 *
 * _onActivate_ is called each time a script is activated or updated. It is
 * primarily used to call {@link Script.listen}, {@link Room.listen}, or
 * {@link Room.addCommand}, to have the script listening for events, messages,
 * or commands.
 *
 * When a script is updated, previous listeners, (e.g. {@link Room.listen}),
 * commands ({@link Room.addCommand}), or scheduled posts ({@link Script.post}
 * with delay), will be removed, and [onActivate](#onactivate) will be called
 * again on the new script version.
 *
 * ### Examples
 *
 * ```ts
 * // Send a describe to the room and log a message to the console on activation.
 * export function onActivate(): void {
 *     Room.describe("Hello, world!");
 *     console.log("Hello, console!");
 * }
 * ```
 *
 * ## onRoomEvent
 *
 * _onRoomEvent_ is called when an event occurs in the room, such as a _say_,
 * _arrive_, or _sleep_. {@link Room.listen} must have been called earlier to
 * start listening to room events, usually in the [onActivate](#onactivate)
 * function.
 *
 * ### Parameters
 *
 * * `addr` _(string)_: Address of this script instance receiving the event.
 * * `ev` _(string)_: Event encoded as a json string.
 *
 * ### Examples
 *
 * ```ts
 * // Check the event type and decode the event.
 * export function onRoomEvent(
 *     addr: string,
 *     ev: string,
 * ): void {
 *     const eventType = Event.getType(ev);
 *     if (eventType == 'say') {
 *         const say = JSON.parse<Event.Say>(ev);
 *         // Handle the say event
 *     }
 * }
 * ```
 *
 * ## onMessage
 *
 * _onMessage_ is called when another script sends a message to this script,
 * using {@link Script.post}. {@link Script.listen} must have been called
 * earlier to start listening to messages, usually in the
 * [onActivate](#onactivate) function.
 *
 * ### Parameters
 *
 * * `addr` _(string)_: Address of this script instance receiving the message.
 * * `topic` _(string)_: Topic of the message. Determined by the sender.
 * * `data` _(string | null)_: JSON encoded data of the message or null.
 *   Determined by the sender.
 * * `sender` _(string)_: Address of the sending script instance.
 *
 * ### Examples
 *
 * ```ts
 * // Receive a message from another script to change room profile
 * export function onMessage(
 *     addr: string,
 *     topic: string,
 *     data: string | null,
 *     sender: string,
 * ): void {
 *     if (topic == "changeProfile") {
 *         Room.setProfile(JSON.parse<string>(data))
 *     }
 * }
 * ```
 *
 * ## onCharEvent
 *
 * _onCharEvent_ is called when a character enters a room, leaves a room, or
 * changes any of its properties while inside the room.
 * {@link Room.listenCharEvent} must have been called earlier to start listening
 * to character events, usually in the [onActivate](#onactivate) function.
 *
 * ### Parameters
 *
 * * `addr` _(string)_: Address of this script instance receiving the event.
 * * `charId` _(string)_: ID of character.
 * * `after` _(string | null)_: Character state after the event encoded as a
 *   json string, or null if the character left the room.
 * * `before` _(string | null)_: Character state before the event encoded as a
 *   json string, or null if the character entered the room.
 *
 * ### Examples
 *
 * ```ts
 * // Output to log when a character arrives or leaves
 * export function onCharEvent(
 *     addr: string,
 *     charId: string,
 *     after: string | null,
 *     before: string | null,
 * ): void {
 *     if (after == null && before != null) {
 *         // If after is null, the character left
 *         const char = JSON.parse<Room.Char>(before);
 *         console.log(`${char.name} left.`)
 *     }
 *     if (before == null && after != null) {
 *         // If before is null, the character arrived
 *         const char = JSON.parse<Room.Char>(after);
 *         console.log(`${char.name} arrived.`)
 *     }
 * }
 * ```
 *
 * ## onExitUse
 *
 * _onExitUse_ is called when a character tries to use an exit.
 * {@link Room.listenExit} must have been called earlier to start listening to
 * exit use, usually in the [onActivate](#onactivate) function. The script
 * should call either {@link ExitAction.cancel} or {@link ExitAction.useExit} to
 * determine what should happen. If neither method is called, the action will
 * timeout after 1 second, automatically canceling the exit use with a default
 * message.
 *
 * ### Parameters
 *
 * * `addr` _(string)_: Address of this script instance receiving the event.
 * * `cmdAction` _({@link ExitAction})_: Exit action object.
 *
 * ### Examples
 *
 * ```ts
 * // Prevent anyone from using an exit
 * export function onExitUse(
 *     addr: string,
 *     exitAction: ExitAction,
 * ): void {
 *     exitAction.cancel("The door seems to be locked.");
 * }
 * ```
 *
 * ## onCommand
 *
 * _onCommand_ is called when a character uses a custom command.
 * {@link Room.addCommand} must have been called earlier to register the
 * command, usually in the [onActivate](#onactivate) function. The script may
 * send a response to the caller using either {@link CmdAction.info},
 * {@link CmdAction.error}, or {@link CmdAction.useExit}, but it is not
 * required. The response must be sent within 1 second from the call.
 *
 * ### Parameters
 *
 * * `addr` _(string)_: Address of this script instance receiving the action.
 * * `cmdAction` _({@link CmdAction})_: Command action object.
 *
 * ### Examples
 *
 * ```ts
 * // Adding a ping command on activation
 * export function onActivate(): void {
 *     Room.addCommand("ping", new Command("send ping", "Sends a ping to the script.");
 * }
 *
 * // Adds a "send ping" command that responds with an info message
 * export function onCommand(
 *     addr: string,         // Address of this script instance receiving the action.
 *     cmdAction: CmdAction, // Command action object.
 * ): void {
 *     cmdAction.info("Pong!");
 * }
 * ```
 *
 * ## onRequest
 *
 * _onRequest_ is called when another script sends a request to this script,
 * using {@link Script.request}. {@link Script.listen} must have been called
 * earlier to start listening to requests, usually in the
 * [onActivate](#onactivate) function.
 *
 * ### Parameters
 *
 * * `addr` _(string)_: Address of this script instance receiving the request.
 * * `request` _({@link Request})_: Request object.
 *
 * ### Examples
 *
 * ```ts
 * // Receive a request from another script and send a response.
 * export function onRequest(
 *     addr: string,
 *     request: Request,
 * ): void {
 *     if (request.topic == "getValue") {
 *         // Parse any data passed as arguments.
 *         const key = request.parseData<string>()
 *         const value = Store.getString(key)
 *         // Send a response to the request
 *         request.reply(value)
 *     }
 * }
 * ```
 *
 * ## onResponse
 *
 * _onResponse_ is called when another script sends a response to a request by
 * calling {@link Request.reply}.
 *
 * ### Parameters
 *
 * * `addr` _(string)_: Address of the script instance receiving the response.
 * * `response` _({@link Response})_: Response object.
 *
 * ### Examples
 *
 * ```ts
 * // Receive a response to an request
 * export function onResponse(
 *     addr: string,
 *     response: Response,
 * ): void {
 *     response obn
 *         // Parse any data passed as arguments.
 *         const key = request.ParseData<string>()
 *         const value = Store.getString(key);
 *         // Send a response to the request
 *         request.reply(value)
 *     }
 * }
 * ```
 *
 * @packageDocumentation
 */
/** ID for in game entities such as characters, rooms, and areas. */
type ID = string;
/** Timestamp as a UTC timestamp in milliseconds. */
type Timestamp = i64;
/** Duration in milliseconds. */
type Duration = i64;
/** States that a character may have. */
declare const enum CharState {
	Asleep = 0,
	Awake = 1,
	Dazed = 2,
	Any = 255
}
/** Idle levels that a character may have. */
declare const enum IdleLevel {
	Asleep = 0,
	Active = 1,
	Idle = 2,
	Inactive = 3
}
/** Roleplaying state that a character may have. */
declare const enum RPState {
	None = 0,
	LFRP = 1
}
/** Exit navigation directions. */
declare const enum ExitNav {
	None = 0,
	North = 1,
	NorthEast = 2,
	East = 3,
	SouthEast = 4,
	South = 5,
	SouthWest = 6,
	West = 7,
	NorthWest = 8
}
/** Exit navigation icon. */
declare const enum ExitIcon {
	None = 0,
	North = 1,
	NorthEast = 2,
	East = 3,
	SouthEast = 4,
	South = 5,
	SouthWest = 6,
	West = 7,
	NorthWest = 8,
	Up = 9,
	Down = 10,
	In = 11,
	Out = 12
}
/** Command flag. */
declare const enum CommandFlag {
	None = 0,
	Restricted = 1,
	Unlisted = 2
}
/**
 * CmdAction is a command action triggered by a character.
 */
declare class CmdAction {
	/** Action ID */
	actionId: i32;
	/** Character performing the action */
	char: Event.Char;
	/** Command keyword */
	keyword: string;
	/** Command data in JSON format. */
	data: string;
	/**
	 * Responds to the command action with an info message.
	 * @param msg Info message. It may be formatted with info formatting and span multiple paragraphs.
	 */
	info(msg: string): void;
	/**
	 * Responds to the command action with an error message.
	 * @param msg Error message. It may be formatted and span multiple paragraphs.
	 */
	error(msg: string): void;
	/**
	 * Responds to the command action by making the character use an exit.
	 *
	 * The exit may be hidden or inactive. May not be used in combination with
	 * info or error.
	 * @param exitId Exit ID.
	 */
	useExit(exitId: ID): void;
}
/**
 * ExitAction is an action representing an intercepted use of an exit.
 *
 * It is passed to [onExitUse](#onexituse) entry point when a character tries to
 * use an exit that is being listen to with {@link Room.listenExit}.
 */
declare class ExitAction {
	/** Action ID */
	actionId: i32;
	/** Character ID */
	charId: ID;
	/** Exit ID */
	exitId: ID;
	/**
	 * Makes the character use an exit. If exitId is null, the character is sent
	 * through the exit that they originally tried to use.
	 *
	 * The exit may be hidden or inactive.
	 * @param exitId Exit ID or null for the originally used exit.
	 */
	useExit(exitId?: ID | null): void;
	/**
	 * Cancels a character's attempt to use an exit and shows them an info
	 * message instead. If msg is null, the default exit timeout message will be
	 * shown.
	 * @param msg Info message to show, or default message if null.
	 */
	cancel(msg?: string | null): void;
}
/**
 * Request is a request sent from another script.
 */
declare class Request {
	/** Action ID */
	actionId: i32;
	/** Request topic */
	topic: string;
	/** Request data encoded as JSON. */
	data: string;
	/** Request sender address. */
	sender: string;
	/**
	 * Parses the data into a value of type T.
	 */
	parseData<T>(): T;
	/**
	 * Responds to the request with a reply containing JSON encoded result.
	 * @param result Reply data encoded as JSON.
	 */
	reply(result?: string | null): void;
	/**
	 * Responds to the request with an error message.
	 * @param msg Error message.
	 */
	error(msg: string): void;
}
/**
 * Response is a response to a request sent by the script.
 */
declare class Response {
	/** Result encoded as JSON. */
	result: string | null;
	/** Error string or null on no error. */
	error: string | null;
	/**
	 * Returns true if it is an error response by checking that the error
	 * property is not a null value.
	 */
	isError(): boolean;
	/**
	 * Parses the result into a value of type T.
	 */
	parseResult<T>(): T;
}
/**
 * BaseIterator is an iterator over items with an ID.
 */
declare class BaseIterator {
	protected iterator: i32;
	/**
	 * Constructor of the Iterator instance.
	 */
	constructor(iterator: i32);
	/**
	 * Advances the iterator by one. Always check isValid() after a next()
	 * to ensure have not reached the end of the iterator.
	 */
	next(): void;
	/**
	 * Rewinds the iterator cursor all the way back to first position, which
	 * would be the smallest key, or greatest key if inReverse() was called.
	 *
	 * Any iterator prefix passed to withPrefix() will be used on rewind.
	 * The iterator is rewound by default.
	 */
	rewind(): void;
	/**
	 * Returns the key string of the current key-value pair. It will abort
	 * if the cursor has reached the end of the iterator.
	 */
	getID(): ID;
	/**
	 * Returns false when the cursor is at the end of the iterator.
	 */
	isValid(): boolean;
	/**
	 * Closes the iterator. Any further calls to the iterator will cause an
	 * error. May be called multiple times.
	 */
	close(): void;
}
/** Command field type input values. */
declare namespace FieldValue {
	class Text {
		value: string;
	}
	class Keyword {
		value: string;
	}
	class Integer {
		value: i64;
	}
	class Float {
		value: f64;
	}
	class Bool {
		value: bool;
	}
	class Char {
		/** Character ID. */
		id: string;
		/** Character name. */
		name: string;
		/** Character surname. */
		surname: string;
	}
	class List {
		value: string;
	}
}
/** Command field types. */
declare namespace Field {
	/**
	 * A text field is used for arbitrary text, such as messages, descriptions, or titles.
	 */
	class Text implements CommandField {
		private desc;
		spanLines: boolean;
		spellCheck: boolean;
		formatText: boolean;
		minLength: u32;
		maxLength: u32;
		constructor(desc?: string);
		getType(): string;
		getDesc(): string;
		getOpts(): string | null;
		/**
		 * Sets span lines flag. Is false by default.
		 * @param spanLines - Flag telling if the text can be spanned across multiple lines.
		 * @returns This instance, allowing method chaining.
		 */
		setSpanLines(spanLines: boolean): this;
		/**
		 * Sets flag to spellCheck text. Is true by default.
		 * @param spellCheck - Flag telling if the text should be checked for spelling errors.
		 * @returns This instance, allowing method chaining.
		 */
		setSpellCheck(spellCheck: boolean): this;
		/**
		 * Sets flag to format text while typing. Is false by default.
		 * @param formatText - Flag telling the text should be formatted while typing.
		 * @returns This instance, allowing method chaining.
		 */
		setFormatText(formatText: boolean): this;
		/**
		 * Sets text min length. Must be smaller or equal to max length unless
		 * max length is set to zero (0).. Is 0 by default.
		 * @param minLength - Min length of text.
		 * @returns This instance, allowing method chaining.
		 */
		setMinLength(minLength: u32): this;
		/**
		 * Sets text maximum length. Zero (0) means server max length. Is 0 by default.
		 * @param maxLength - Max length of text.
		 * @returns This instance, allowing method chaining.
		 */
		setMaxLength(maxLength: u32): this;
	}
	/**
	 * A keyword field is used for keyword names using a limited set of
	 * characters that will be transformed to lower case. By default, a keyword
	 * allows Letters, Numbers, Spaces, apostrophes ('), and dash/minus (-).
	 */
	class Keyword implements CommandField {
		private desc;
		removeDiacritics: boolean;
		minLength: u32;
		maxLength: u32;
		constructor(desc?: string);
		getType(): string;
		getDesc(): string;
		getOpts(): string | null;
		/**
		 * Sets flag to remove diacritics from the keyword by decomposing the
		 * characters and removing any non-print characters and marker in the Mn
		 * Unicode category. Is false by default.
		 * @param removeDiacritics - Flag telling if diacritics should be removed.
		 */
		setRemoveDiacritics(removeDiacritics: boolean): this;
		/**
		 * Sets text min length. Must be smaller or equal to max length unless
		 * max length is set to zero (0).. Is 0 by default.
		 * @param minLength - Min length of text.
		 */
		setMinLength(minLength: u32): this;
		/**
		 * Sets text maximum length. Zero (0) means server max length. Is 0 by default.
		 * @param maxLength - Max length of text.
		 */
		setMaxLength(maxLength: u32): this;
	}
	/** An integer field is used for whole numbers. */
	class Integer implements CommandField {
		private desc;
		min: i64;
		max: i64;
		private hasMin;
		private hasMax;
		constructor(desc?: string);
		getType(): string;
		getDesc(): string;
		getOpts(): string | null;
		/**
		 * Sets integer min value. Must be smaller or equal to max value.
		 * @param min - Min value of integer.
		 * @returns This instance, allowing method chaining.
		 */
		setMin(min: i64): this;
		/**
		 * Sets integer max value. Must be greater or equal to min value.
		 * @param max - Max value of integer
		 * @returns This instance, allowing method chaining.
		 */
		setMax(max: i64): this;
	}
	/** A float field is used for decimal numbers. */
	class Float implements CommandField {
		private desc;
		min: f64;
		max: f64;
		private gtprop;
		private ltprop;
		constructor(desc?: string);
		getType(): string;
		getDesc(): string;
		getOpts(): string | null;
		/**
		 * Sets float min value. Must be smaller than (or equal if both are inclusive) to max value.
		 * @param min - Min value of float.
		 * @param inclusive - Flag to tell if min value is inclusive (>=) on true, or exclusive (>) on false.
		 * @returns This instance, allowing method chaining.
		 */
		setMin(min: f64, inclusive: bool): this;
		/**
		 * Sets float max value. Must be greater than (or equal if both are inclusive) to min value.
		 * @param max - Max value of float.
		 * @param inclusive - Flag to tell if max value is inclusive (<=) on true, or exclusive (<) on false.
		 * @returns This instance, allowing method chaining.
		 */
		setMax(max: f64, inclusive: bool): this;
	}
	/** An bool field is used for boolean values. */
	class Bool implements CommandField {
		private desc;
		constructor(desc?: string);
		getType(): string;
		getDesc(): string;
		getOpts(): string | null;
	}
	/** A char field is used to enter the name of a character. */
	class Char implements CommandField {
		private desc;
		inRoom: boolean;
		state: CharState;
		constructor(desc?: string);
		getType(): string;
		getDesc(): string;
		getOpts(): string | null;
		/**
		 * Sets inRoom flag, requiring the character to be in the room.
		 * @returns This instance, allowing method chaining.
		 */
		setInRoom(): this;
		/**
		 * Sets state that the character must be in. Default is {@link CharState.Any}.
		 * @returns This instance, allowing method chaining.
		 */
		setState(state: CharState): this;
	}
	/**
	 * A list field is used to select between a list of items. Items must be
	 * unique, not containing non-printable or newline characters, and be
	 * trimmed of leading, trailing, and consecutive spaces.
	 *
	 * Items should not contain characters used as delimiters to continue the
	 * command.
	 */
	class List implements CommandField {
		private desc;
		items: Array<string>;
		constructor(desc?: string);
		getType(): string;
		getDesc(): string;
		getOpts(): string | null;
		/**
		 * Adds a single item to the list.
		 * @returns This instance, allowing method chaining.
		 */
		addItem(item: string): this;
		/**
		 * Sets an array of list items, replacing any previously set items.
		 * @param items Array of list items.
		 * @returns This instance, allowing method chaining.
		 */
		setItems(items: Array<string>): this;
	}
}
interface CommandField {
	/** Returns the type of the command field. */
	getType(): string;
	/** Returns the help description of the command field. */
	getDesc(): string;
	/** Returns the options of the command field as a JSON encoded string. */
	getOpts(): string | null;
}
/**
 * Command class is a representation of a custom command, and is used as an
 * argument when calling {@link Room.addCommand}.
 * @see {@link https://github.com/mucklet/mucklet-script/blob/master/docs/writingscripts-customcommands.md | Writing scripts - Custom commands}
 */
declare class Command {
	pattern: string;
	desc: string;
	private fieldDefs;
	priority: u32;
	flags: u32;
	/**
	 * Creates a new instance of the {@link Command} class.
	 */
	constructor(pattern: string, desc?: string);
	/**
	 * Sets the definition for a command field.
	 * @param key - Field <key> as found in command pattern.
	 * @param def - Field definition.
	 * @returns This instance, allowing method chaining.
	 */
	field(key: string, def: CommandField): Command;
	/**
	 * Sets command priority.
	 * @param priority Priority for sort order (descending) and when two or more
	 * commands match the same input. Higher priority is selected first.
	 * @returns This instance, allowing method chaining.
	 */
	setPriority(priority: u32): Command;
	/**
	 * Sets the command as restricted, only accessible to character able to edit
	 * the room.
	 * @returns This instance, allowing method chaining.
	 */
	setRestricted(): Command;
	/**
	 * Sets the command as unlisted, not showing up in the interface. It can
	 * still be used, and will be listed using `list commands`.
	 * @returns This instance, allowing method chaining.
	 */
	setUnlisted(): Command;
	/**
	 * Converts the command into a JSON structure.
	 */
	json(): string;
}
/**
 * Room API functions and types.
 */
declare namespace Room {
	/**
	 * Move messages used when entering or leaving a room.
	 */
	class MoveMsgs {
		leaveMsg: string;
		arriveMsg: string;
		travelMsg: string;
	}
	/**
	 * Detailed room information.
	 */
	class RoomDetails {
		/** Room ID. */
		id: ID;
		/** Room name. */
		name: string;
		/** Room description. */
		desc: string;
		/** Room image ID; */
		imageId: ID;
		/** IsDark flags if other character can be seen or whispered to in the room. */
		isDark: boolean;
		/** IsQuiet flags if a room is quiet and won't allow communication. */
		isQuiet: boolean;
		/** IsHome flags if the room can be set as home by others. */
		isHome: boolean;
		/** IsTeleport flags if the room can be added as a teleport node by others. */
		isTeleport: boolean;
		/** IsInstance flags if the room creates an instance. */
		isInstance: boolean;
		/** Autosweep flags if sleepers in the room should be sent home automatically. */
		autosweep: boolean;
		/** AutosweepDelay is the time in milliseconds until a sleeper is swept. */
		autosweepDelay: Duration;
		/** CustomTeleportMsgs flags if the room uses custom teleport messages. */
		customTeleportMsgs: boolean;
		/** OverrideCharTeleportMsgs flags if the custom teleport messages should override any set character teleport messages. */
		overrideCharTeleportMsgs: boolean;
		/** Custom teleport messages. */
		teleport: MoveMsgs;
		/** Created time. */
		created: Timestamp;
	}
	/**
	 * Room character.
	 */
	class Char {
		/** Character ID. */
		id: ID;
		/** Character name. */
		name: string;
		/** Character surname. */
		surname: string;
		/** Character avatar. */
		avatar: ID;
		/** Character species. */
		species: string;
		/** Character gender. */
		gender: string;
		/** Character description. */
		desc: string;
		/** Character image. */
		image: ID;
		/** Character state. */
		state: CharState;
		/** Character idle status. */
		idle: IdleLevel;
		/** Character RP state. */
		rp: RPState;
	}
	/**
	 * Room exit.
	 */
	class Exit {
		/** Exit ID. */
		id: ID;
		/** Exit keys. */
		keys: string[];
		/** Exit name. */
		name: string;
		/** Exit icon. */
		icon: ExitIcon;
		/** Exit navigation direction. */
		nav: ExitNav;
		/** Leave message. */
		leaveMsg: string;
		/** Arrival message. */
		arriveMsg: string;
		/** Travel message. */
		travelMsg: string;
		/** Target room. */
		targetRoom: ID;
		/** Created timestamp. */
		created: Timestamp;
		/** Is hidden flag. */
		hidden: boolean;
		/** Is inactive flag. */
		inactive: boolean;
		/** Is transparent flag. */
		transparent: boolean;
	}
	/**
	 * Room profile.
	 */
	class Profile {
		/** Profile ID. */
		id: ID;
		/** Profile name. */
		name: string;
		/** Profile key. */
		key: string;
		/** Profile desc. */
		desc: string;
		/** Profile image. */
		image: ID;
	}
	/**
	 * Starts listening to room events on the current instance. If `instance` is
	 * set, it starts listening for events in that specific instance, or null
	 * for any room instance. Room events will be sent to `onRoomEvent` for the
	 * instance.
	 * @param instance - Instance or null for the non-instance.
	 * @returns Returns true if a new listener was added, otherwise false.
	 */
	function listen(instance?: string | null): boolean;
	/**
	 * Stops listening to room events on the current instance. If `instance` is
	 * provided, it stops listening for that specific instance, or null for the
	 * non-instance room.
	 * @param instance - Instance or null for the non-instance.
	 * @returns True if a listener existed, otherwise false.
	 */
	function unlisten(instance?: string | null): boolean;
	/**
	 * Starts listening to char events in the room. If `instance` is set, it
	 * starts listening for events in that specific instance, or null for any
	 * room instance. Char events will be sent to `onCharEvent` for the
	 * instance.
	 * @param instance - Instance or null for any instance.
	 * @returns True if a new listener was added, otherwise false.
	 */
	function listenCharEvent(instance?: string | null): boolean;
	/**
	 * Stops listening to char events in the room. If `instance` is set, it
	 * stops listening for events in that specific instance, or null for any
	 * room instance.
	 * @param instance - Instance or null for any instance.
	 * @returns True if a listener existed, otherwise false.
	 */
	function unlistenCharEvent(instance?: string | null): boolean;
	/**
	 * Starts listening to exit usage in the room, including any instance. If
	 * `exitId` is null, it acts as a wildcard to listen to any exit otherwise
	 * not being listened to specifically. Exit use events will be sent to
	 * `onExitUse`.
	 *
	 * Only one script may listen to a given exit at any time. Only one script
	 * may listen to any exit with the null wildcard at any one time
	 * @param exitId - Exit ID or null for any exit.
	 * @returns True if a new listener was added, otherwise false.
	 */
	function listenExit(exitId?: string | null): boolean;
	/**
	 * Stops listening to exit usage in the room. If `exitId` is set, it stops
	 * listening for exit use for that specific exit, or null to stop listening
	 * for the the wildcard listener.
	 * @param exitId - Exit ID or null for any exit.
	 * @returns True if a listener existed, otherwise false.
	 */
	function unlistenExit(exitId?: string | null): boolean;
	/**
	 * Sends a "describe" event to the current room instance.
	 */
	function describe(msg: string): void;
	/**
	 * Sends a "privateDescribe" event to one or more target characters in the
	 * current room instance. A private describe can only be seen by the
	 * targeted characters.
	 */
	function privateDescribe(msg: string, targetCharIds: ID[]): void;
	/**
	 * Get detailed room information, such as description and settings.
	 */
	function getDetails(): RoomDetails;
	/**
	 * Set room information.
	 *
	 *
	 * The _field_ parameter must an object that can be converted to a json
	 * object string with {@link JSON.stringify}, containing the following
	 * fields. Any other fields will be ignored.
	 *
	 * ```ts
	 * {
	 *     name?:                     string,   // Room name.
	 *     desc?:                     string,   // Room description.
	 *     isDark?:                   boolean,  // IsDark flags if other character can be seen or whispered to in the room.
	 *     isQuiet?:                  boolean,  // IsQuiet flags if a room is quiet and won't allow communication.
	 *     isHome?:                   boolean,  // IsHome flags if the room can be set as home by others.
	 *     isTeleport?:               boolean,  // IsTeleport flags if the room can be added as a teleport node by others.
	 *     isInstance?:               boolean,  // IsInstance flags if the room creates an instance.
	 *     autosweep?:                boolean,  // Autosweep flags if sleepers in the room should be sent home automatically.
	 *     autosweepDelay?:           Duration, // AutosweepDelay is the time in milliseconds until a sleeper is swept.
	 *     customTeleportMsgs?:       boolean,  // CustomTeleportMsgs flags if the room uses custom teleport messages.
	 *     overrideCharTeleportMsgs?: boolean,  // OverrideCharTeleportMsgs flags if the custom teleport messages should override any set character teleport messages.
	 *     teleportLeaveMsg?:         object,   // Custom teleport message shown when someone teleports away from the room.
	 *     teleportArriveMsg?:        object,   // Custom teleport message shown when someone teleports into the room.
	 *     teleportTravelMsg?:        object,   // Custom teleport message shown to the character teleporting into the room.
	 * }
	 * ```
	 *
	 * @example
	 * ```ts
	 * // Setting the room to be dark
	 * Room.setRoom(new Map<string, boolean>().set("isDark", true))
	 * ```
	 *
	 * @param {object} fields Room fields to update as an object that can be stringified to json.
	 */
	function setRoom<T>(fields: T): void;
	/**
	 * Switches to a stored room profile by profile key.
	 * @param keyword - Keyword for the stored profile.
	 * @param safe - Flag to prevent the room's current profile to be overwritten by the stored profile, if it contains unstored changes.
	 */
	function useProfile(keyword: string, safe?: boolean): void;
	/**
	 * Sweep a single character from the room by sending them home.
	 * @param charId - Character ID.
	 * @param msg - Message to show too the room when the character is teleported away. Defaults to other teleport messages.
	 */
	function sweepChar(charId: ID, msg: string | null): void;
	/**
	 * Checks if a character is the owner of the room, or if the owner shares
	 * the same player as the character. It does not include admins or builders.
	 * @param charId - Character ID.
	 */
	function canEdit(charId: ID): boolean;
	/**
	 * Gets an iterator for the characters in the room that iterates from the
	 * character most recently entering the room.
	 * @param state - State of the characters to iterate over.
	 * @param reverse - Flag to reverse the iteration direction, starting with the character that has been in the room the longest.
	 */
	function charIterator(state?: CharState, reverse?: boolean): CharIterator;
	/**
	 * Gets an iterator for the exits in the room. Order is undefined.
	 */
	function exitIterator(): ExitIterator;
	/**
	 * Gets an iterator for the profiles for the room. Order is undefined.
	 */
	function profileIterator(): ProfileIterator;
	/**
	 * Gets a character in the room by ID.
	 * @param charId - Character ID.
	 * @returns {@link Char} object or null if the character is not found in the room.
	 */
	function getChar(charId: ID): Char | null;
	/**
	 * Gets an exit in the room by keyword.
	 * @param keyword - Exit keyword.
	 * @returns {@link Exit} object or null if the exit is not found in the room.
	 */
	function getExit(keyword: string): Exit | null;
	/**
	 * Gets an exit in the room by ID.
	 * @param exitId - Exit ID.
	 * @returns {@link Exit} object or null if the exit is not found in the room.
	 */
	function getExitById(exitId: ID): Exit | null;
	/**
	 * Gets the exit order of visible exits in the room as an array of {@link ID} values.
	 */
	function getExitOrder(): ID[];
	/**
	 * Set exit information.
	 *
	 * The _field_ parameter must an object that can be converted to a json
	 * object string with {@link JSON.stringify}, containing the following
	 * fields. Any other fields will be ignored.
	 *
	 * ```ts
	 * {
	 *     name?:        string,            // Name of the exit.
	 *     keys?:        string[],          // Exit keywords used with the go command.
	 *     leaveMsg?:    boolean,           // Message seen by the origin room. Usually in present tense (eg. "leaves ...").
	 *     arriveMsg?:   boolean,           // Message seen by the arrival room. Usually in present tense (eg. "arrives from ...").
	 *     travelMsg?:   boolean,           // Message seen by the exit user. Usually in present tense (eg. "goes ...").
	 *     icon?:        ExitIcon,          // Icon for the exit.
	 *     nav?:         ExitNav,           // Navigation direction for the exit.
	 *     hidden?:      boolean,           // Flag telling if the exit is hidden, preventing it from being listed.
	 *     inactive?:    boolean,           // Flag telling if the exit is inactive, preventing it from being listed and used.
	 *     transparent?: boolean,           // Flag telling if the exit is transparent, allowing you to see awake characters in the target room.
	 *     order?:       i32|i32u|i64|i64u, // Sort order of the exit with 0 being the first listed. Ignored if the exit is hidden or inactive.
	 * }
	 * ```
	 *
	 * @example
	 * ```ts
	 * // Setting a room exit to be active
	 * Room.setExit(exitId, new Map<string, boolean>().set("inactive", false))
	 * ```
	 *
	 * @param exitId - Exit ID.
	 * @param fields Exit fields to update as an object that can be stringified to json.
	 */
	function setExit<T>(exitId: ID, fields: T): void;
	/**
	 * Adds a custom command to the room.
	 *
	 * Pattern is a string describing the general command structure, and may
	 * contain \<Fields\> parts. Any field defined in the pattern must have a
	 * corresponding field entry.
	 *
	 * @see {@link https://github.com/mucklet/mucklet-script/blob/master/docs/writingscripts-customcommands.md | Writing scripts - Custom commands}
	 *
	 * @param keyword - Keyword for the command.
	 * @param cmd - Command to add.
	 * @param priority - Deprecated: Use Command.setPriority instead.
	 */
	function addCommand(keyword: string, cmd: Command, priority?: u32): void;
	/**
	 * Removes a custom command, added by the script, from the room.
	 * @param keyword - Keyword for the command.
	 */
	function removeCommand(keyword: string): boolean;
	class CharIterator extends BaseIterator {
		/**
		 * Returns the current char. It will abort if the cursor has reached the
		 * end of the iterator.
		 */
		getChar(): Char;
	}
	class ExitIterator extends BaseIterator {
		/**
		 * Returns the current char. It will abort if the cursor has reached the
		 * end of the iterator.
		 */
		getExit(): Exit;
	}
	class ProfileIterator extends BaseIterator {
		/**
		 * Returns the current profile. It will abort if the cursor has reached the
		 * end of the iterator.
		 */
		getProfile(): Profile;
	}
}
/**
 * Script API functions.
 */
declare namespace Script {
	/**
	 * Realm character.
	 */
	class Char {
		/** Character ID. */
		id: string;
		/** Character name. */
		name: string;
		/** Character surname. */
		surname: string;
		/** Character avatar. */
		avatar: ID;
		/** Character species. */
		species: string;
		/** Character gender. */
		gender: string;
		/** Character state. */
		state: CharState;
		/** Character idle status. */
		idle: IdleLevel;
		/** Character RP state. */
		rp: RPState;
	}
	/**
	 * Starts listening for messages and requests, sent with
	 * {@link Script.post}, {@link Script.broadcast}, and
	 * {@link Script.request}, from any of the given `addr` addresses. If an
	 * address is a non-instance room, it will also listen to posted messages
	 * from any instance of that room.
	 *
	 * If no `addr` is provided, the script will listen to posts and requests
	 * from _any_ source, including scripts and bots controlled by other
	 * players, and also listen for broadcasts by scripts in the same room.
	 *
	 * Posts from the current script does not require listening. A script can
	 * always post to itself.
	 *
	 * To get the address of a room script, use the `roomscript` command. For
	 * more info, type:
	 * ```
	 * help roomscript
	 * ```
	 */
	function listen(addrs?: string[] | null): void;
	/**
	 * Starts listening for posted messages from any of the given `addr`
	 * addresses. If an address is a non-instance room, it will also listen to
	 * posted messages from any instance of that room.
	 *
	 * If no `addr` is provided, the script will listen to posts from _any_
	 * source.
	 *
	 * To get the address of a room script, use the `roomscript` command. For
	 * more info, type:
	 * ```
	 * help roomscript
	 * ```
	 */
	function unlisten(addrs?: string[] | null): void;
	/**
	 * Posts a message to another script with the address `addr`. The receiving
	 * script will get the message through the [onMessage](#onmessage) entry
	 * point.
	 *
	 * To get the address of a room script, use the `roomscript` command. For
	 * more info, type:
	 * ```
	 * help roomscript
	 * ```
	 * @param addr - Address of target script. If addr is "#", it will be a post to the current script instance.
	 * @param topic - Message topic. May be any kind of string.
	 * @param data - Additional data. Must be valid JSON.
	 * @param delay - Delay in milliseconds.
	 * @returns Schedule {@link ID} or null if the message was posted without delay of if the receiving script was not listening.
	 */
	function post(addr: string, topic: string, data?: string | null, delay?: i64): ID | null;
	/**
	 * Cancel a message previously scheduled with `Script.post` with a delay.
	 *
	 * The post can only be canceled from the same room instance that sent it.
	 * The method returns true if the post was successfully canceled, or false if
	 * the scheduleId is either null, not sent by the script instance, or if the
	 * post was already sent.
	 * @param scheduleId - Schedule ID returned by script.Post.
	 * @returns True if the post was successfully canceled, otherwise false.
	 */
	function cancelPost(scheduleId: ID | null): boolean;
	/**
	 * Sends a request to another script with the address `addr`. The receiving
	 * script will get the request through the [onRequest](#onrequest) entry
	 * point. The requesting script will wait and block until a response is
	 * received, or a timeout occurs.
	 *
	 * Errors will be returned as part of the response. The script should call
	 * {@link Response.isError} to check if an error was returned. In case of
	 * errors, calling {@link Response.parseResult} will cause the script to
	 * abort. Requests to self, or circular requests (A -> B -> A) will always
	 * return with an error.
	 *
	 *
	 * To get the address of a room script, use the `roomscript` command. For
	 * more info, type:
	 * ```
	 * help roomscript
	 * ```
	 *
	 * @param addr - Address of target script. If addr is "#", it will be a post to the current script instance.
	 * @param topic - Message topic. May be any kind of string.
	 * @param data - Additional data to be sent with the request. Must be valid JSON.
	 * @returns Response to the request.
	 */
	function request(addr: string, topic: string, data?: string | null): Response;
	/**
	 * Broadcasts a message to all scripts listening to this script. Other room
	 * scripts in the same room listening to any message will also receive the
	 * message. The receiving script will get the message through the
	 * [onMessage](#onmessage) entry point.
	 *
	 * To get other scripts to listen for broadcast, see {@link Script.listen}.
	 * @param topic - Message topic. May be any kind of string.
	 * @param data - Additional data. Must be valid JSON.
	 */
	function broadcast(topic: string, data?: string | null): void;
	/**
	 * Gets info on an existing character.
	 *
	 * To get character description or image info use Room.getChar instead.
	 * @param charId - Character ID.
	 * @returns {@link Char} object or null if the character is not found.
	 */
	function getChar(charId: ID): Char | null;
}
/**
 * Event classes used with JSON.parse to decode room events.
 */
declare namespace Event {
	/**
	 * Get event type from a json encoded event.
	 */
	function getType(ev: string): string;
	/**
	 * Base event shared by all events.
	 */
	class Base {
		/** Event ID. */
		id: string;
		/** Event type. */
		type: string;
		/** Unix timestamp (milliseconds). */
		time: Timestamp;
		/** Signature. */
		sig: string;
	}
	/**
	 * Base event for message events by a character, such as say, describe,
	 * pose, etc.
	 */
	class BaseCharMsg extends Base {
		/** Message. */
		msg: string;
		/** Acting character. */
		char: Char;
		/** Acting puppeteer. */
		puppeteer: Char | null;
	}
	/**
	 * Base event for message events by a character where a method is included,
	 * such as leave and arrive.
	 */
	class BaseCharMethodMsg extends BaseCharMsg {
		/** Method */
		method: string;
	}
	/**
	 * Base event for message events by a character that may optionally be
	 * marked as a pose, such as OOC events.
	 */
	class BaseCharPoseMsg extends BaseCharMsg {
		/** Message is a pose. */
		pose: boolean;
	}
	/**
	 * Character object with name and ID.
	 */
	class Char {
		/** Character ID. */
		id: string;
		/** Character name. */
		name: string;
		/** Character surname. */
		surname: string;
	}
	/**
	 * Action event.
	 */
	class Action extends BaseCharMsg {
	}
	/**
	 * Arrive event.
	 */
	class Arrive extends BaseCharMethodMsg {
	}
	/**
	 * Describe event.
	 */
	class Describe extends BaseCharMsg {
	}
	/**
	 * Leave event.
	 */
	class Leave extends BaseCharMethodMsg {
	}
	/**
	 * OOC event.
	 */
	class OOC extends BaseCharPoseMsg {
	}
	/**
	 * Pose event.
	 */
	class Pose extends BaseCharMsg {
	}
	/**
	 * Results in a roll event.
	 */
	class RollResult {
		type: string;
		/** Modifier operator. Either "+" or "-". */
		op: string;
		/** Dice count. Always 0 on type "mod". */
		count: i32;
		/** Sides on dice. Always 0 on type "mod" */
		sides: i32;
		/** Roll value for each die. Always empty slice on type "mod" */
		dice: i32[];
		/** Modifier value. Always 0 on type "std". */
		value: i32;
	}
	/**
	 * Roll event.
	 */
	class Roll extends Base {
		/** Acting character. */
		char: Char;
		/** Acting puppeteer. */
		puppeteer: Char | null;
		/** Roll total. */
		total: i32;
		/** Roll result. */
		result: RollResult[];
		/** Quiet roll. */
		quiet: boolean;
	}
	/**
	 * Say event.
	 */
	class Say extends BaseCharMsg {
	}
	/**
	 * Sleep event.
	 */
	class Sleep extends BaseCharMsg {
	}
	/**
	 * Wakeup event.
	 */
	class Wakeup extends BaseCharMsg {
	}
}
/**
 * Store API function classes to get, set, and iterate over stored key/value
 * entries.
 *
 * @remarks
 * Each script instance has its own store, and does not share this data with
 * other scripts. Any stored data is persisted between calls, and is not deleted
 * unless the script itself is deleted.
 *
 * If a script is deactivated, the stored data will persist, and may be accessed
 * once the script is activated again.
 *
 * Variables should not be used to persist data between calls, as the script's
 * runtime state may be disposed in between calls.
 */
declare namespace Store {
	/**
	 * Sets the database transaction to read-only during the script call,
	 * allowing multiple iterators to be open at the same time.
	 *
	 * Must be called before using the store.
	 */
	function readOnly(): void;
	/**
	 * Adds a key and a string value to the store, or updates that key's value
	 * if it already exists.
	 * @param {string | ArrayBuffer} key - Stored key.
	 * @param {string} value - Stored string value.
	 */
	function setString<T>(key: T, value: string): void;
	/**
	 * Returns the stored string value for the key, or null if the key does not
	 * exist.
	 * @param {string | ArrayBuffer} key - Stored key.
	 */
	function getString<T>(key: T): string | null;
	/**
	 * Adds a key and an ArrayBuffer value to the store, or updates that key's
	 * value if it already exists.
	 * @param {string | ArrayBuffer} key - Stored key.
	 * @param {ArrayBuffer} value - Stored value.
	 */
	function setBuffer<T>(key: T, value: ArrayBuffer): void;
	/**
	 * Returns the stored ArrayBuffer value for the key, or null if the key does
	 * not exist.
	 * @param {string | ArrayBuffer} key - Stored key.
	 */
	function getBuffer<T>(key: T): ArrayBuffer | null;
	/**
	 * Deletes a key and it's value from the store. If the key does not exist,
	 * this is a no-op.
	 * @param {string | ArrayBuffer} key - Stored key.
	 */
	function deleteKey<T>(key: T): void;
	/**
	 * Returns the total number of bytes used by the store for this script
	 * address.
	 */
	function totalBytes(): i64;
	/**
	 * Iterator is an object that iterates over a storage.
	 */
	class Iterator {
		private iterator;
		private prefix;
		private reverse;
		/**
		 * Constructor of the Iterator instance.
		 */
		constructor();
		/**
		 * Sets a prefix to use for calls to seek, rewind, and isValid.
		 *
		 * Must be called before using the iterator.
		 * @param {string | ArrayBuffer} prefix - Key prefix used in seek, rewind, and isValid.
		 * @returns This instance, allowing method chaining.
		 */
		withPrefix<T>(prefix: T): Iterator;
		/**
		 * Sets direction of iteration to be in lexiographcially reversed order.
		 *
		 * Must be called before using the iterator.
		 * @returns This instance, allowing method chaining.
		 */
		inReverse(): Iterator;
		/**
		 * Advances the iterator by one. Always check isValid() after a next()
		 * to ensure have not reached the end of the iterator.
		 */
		next(): void;
		/**
		 * Seeks to the provided key if found. If not found, it would seek to
		 * the next smallest key greater than the provided key if iterating in
		 * the forward direction. Behavior would be reversed if iterating
		 * backwards.
		 *
		 * Any iterator prefix passed to withPrefix() will be prepended to
		 * the key.
		 */
		seek<T>(key: T): void;
		/**
		 * Rewinds the iterator cursor all the way back to first position, which
		 * would be the smallest key, or greatest key if inReverse() was called.
		 *
		 * Any iterator prefix passed to withPrefix() will be used on rewind.
		 * The iterator is rewound by default.
		 */
		rewind(): void;
		/**
		 * Returns the key string of the current key-value pair. It will abort
		 * if the cursor has reached the end of the iterator.
		 */
		getKeyString(): string;
		/**
		 * Returns the key ArrayBuffer of the current key-value pair. It will
		 * abort if the cursor has reached the end of the iterator.
		 */
		getKeyBuffer(): ArrayBuffer;
		/**
		 * Returns the string value of the current key-value pair. It will abort
		 * if the cursor has reached the end of the iterator.
		 */
		getValueString(): string;
		/**
		 * Returns the ArrayBuffer value of the current key-value pair. It will
		 * abort if the cursor has reached the end of the iterator.
		 */
		getValueBuffer(): ArrayBuffer;
		/**
		 * Returns false when the cursor is at the end of the iterator.
		 *
		 * Any iterator prefix passed to withPrefix() will be used as prefix.
		 */
		isValid(): boolean;
		/**
		 * Returns false when the cursor is at the end of the iterator, or when
		 * the current key is not prefixed by the specified prefix.
		 *
		 * Any iterator prefix passed to withPrefix() will be prepended to the
		 * provided prefix.
		 */
		isValidForPrefix<T>(prefix: T | null): boolean;
		/**
		 * Closes the iterator. Any further calls to the iterator will cause an
		 * error. May be called multiple times.
		 */
		close(): void;
		private ensureIterator;
		private assertNotClosed;
	}
}
