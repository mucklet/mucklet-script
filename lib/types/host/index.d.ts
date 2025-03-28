/** ID for in game entities such as characters, rooms, and areas. */
type ID = string;
/** Timestamp as a UTC timestamp in milliseconds. */
type Timestamp = i64;
/** Duration in milliseconds. */
type Duration = i64;
/** Char state */
declare namespace CharState {
	const Asleep: any;
	const Awake: any;
	const Dazed: any;
	const Any: any;
}
type CharState = i32;
/** Char idle level */
declare namespace IdleLevel {
	const Asleep: any;
	const Active: any;
	const Idle: any;
	const Inactive: any;
}
type IdleLevel = i32;
/** RP state */
declare namespace RPState {
	const None: any;
	const LFRP: any;
}
type RPState = i32;
/** Exit navigation direction */
declare namespace ExitNav {
	const None: any;
	const North: any;
	const NorthEast: any;
	const East: any;
	const SouthEast: any;
	const South: any;
	const SouthWest: any;
	const West: any;
	const NorthWest: any;
}
type ExitNav = i32;
/** Exit navigation icon */
declare namespace ExitIcon {
	const None: any;
	const North: any;
	const NorthEast: any;
	const East: any;
	const SouthEast: any;
	const South: any;
	const SouthWest: any;
	const West: any;
	const NorthWest: any;
	const Up: any;
	const Down: any;
	const In: any;
	const Out: any;
}
type ExitIcon = i32;
/**
 * ExitAction is an action representing an intercepted use of an exit.
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
	data: JSON.Raw;
	/**
	 * Responds to the command action with an info message.
	 * @param msg Info message.
	 */
	info(msg: string): void;
	/**
	 * Responds to the command action with an error message.
	 * @param msg Error message.
	 */
	error(msg: string): void;
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
		 */
		setSpanLines(spanLines: boolean): this;
		/**
		 * Sets flag to spellCheck text. Is true by default.
		 * @param spellCheck - Flag telling if the text should be checked for spelling errors.
		 */
		setSpellCheck(spellCheck: boolean): this;
		/**
		 * Sets flag to format text while typing. Is false by default.
		 * @param formatText - Flag telling the text should be formatted while typing.
		 */
		setFormatText(formatText: boolean): this;
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
		 */
		setMin(min: i64): this;
		/**
		 * Sets integer max value. Must be greater or equal to min value.
		 * @param max - Max value of integer
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
		 */
		setMin(min: f64, inclusive: bool): this;
		/**
		 * Sets float max value. Must be greater than (or equal if both are inclusive) to min value.
		 * @param max - Max value of float.
		 * @param inclusive - Flag to tell if max value is inclusive (<=) on true, or exclusive (<) on false.
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
		 */
		setInRoom(): this;
		/**
		 * Sets state that the character must be in. Default is CharState.Any.
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
		 */
		addItem(item: string): this;
		/**
		 * Sets an array of list items, replacing any previously set items.
		 * @param items Array of list items.
		 */
		setItems(items: Array<string>): this;
	}
}
interface CommandField {
	/** Returns the type of the command field. */
	getType(): string;
	/** Returns the help description of the command field. */
	getDesc(): string;
	/** Returns the options of the command field as a JSOn encoded string. */
	getOpts(): string | null;
}
/**
 * Command is an object that represents a custom command.
 */
declare class Command {
	pattern: string;
	desc: string;
	private fieldDefs;
	/**
	 * Constructor of the Command instance.
	 */
	constructor(pattern: string, desc?: string);
	/**
	 * Sets the definition for a command field.
	 * @param key - Field <key> as found in command pattern.
	 * @param def - Field definition.
	 */
	field(key: string, def: CommandField): Command;
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
		id: string;
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
	 * Starts listening to room events on the current instance. If `instance` is
	 * set, it starts listening for events in that specific instance, or null
	 * for any room instance. Room events will be sent to `onRoomEvent` for the
	 * instance.
	 * @param instance - Instance or null for the non-instance.
	 * @returns True if a new listener was added, otherwise false.
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
	 * Get detailed room information, such as description and settings.
	 */
	function getDetails(): RoomDetails;
	/**
	 * Set room information.
	 *
	 * The parameters must be an object that may be converted to json with the
	 * following paramters. Any other fields will be ignored.
	 * @param {object} [fields] Room fields to update.
	 * @param {string} [fields.name] Room name.
	 * @param {string} [fields.desc]  Room description.
	 * @param {boolean} [fields.isDark] IsDark flags if other character can be seen or whispered to in the room.
	 * @param {boolean} [fields.isQuiet] IsQuiet flags if a room is quiet and won't allow communication.
	 * @param {boolean} [fields.isHome] IsHome flags if the room can be set as home by others.
	 * @param {boolean} [fields.isTeleport] IsTeleport flags if the room can be added as a teleport node by others.
	 * @param {boolean} [fields.isInstance] IsInstance flags if the room creates an instance.
	 * @param {boolean} [fields.autosweep] Autosweep flags if sleepers in the room should be sent home automatically.
	 * @param {Duration} [fields.autosweepDelay] AutosweepDelay is the time in milliseconds until a sleeper is swept.
	 * @param {boolean} [fields.customTeleportMsgs] CustomTeleportMsgs flags if the room uses custom teleport messages.
	 * @param {boolean} [fields.overrideCharTeleportMsgs] OverrideCharTeleportMsgs flags if the custom teleport messages should override any set character teleport messages.
	 * @param {object} [fields.teleportLeaveMsg] // Custom teleport message shown when someone teleports away from the room.
	 * @param {object} [fields.teleportArriveMsg] // Custom teleport message shown when someone teleports into the room.
	 * @param {object} [fields.teleportTravelMsg] // Custom teleport message shown to the character teleporting into the room.
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
	 * @returns Character iterator.
	 */
	function charIterator(state?: CharState, reverse?: boolean): CharIterator;
	/**
	 * Gets an iterator for the exits in the room. Order is undefined.
	 * @returns Exit iterator.
	 */
	function exitIterator(): ExitIterator;
	/**
	 * Gets a character in the room by ID.
	 * @param charId - Character ID.
	 * @returns Char object or null if the character is not found in the room.
	 */
	function getChar(charId: ID): Char | null;
	/**
	 * Gets an exit in the room by keyword.
	 * @param exitId - Exit ID.
	 * @returns Exit object or null if the exit is not found in the room.
	 */
	function getExit(keyword: string): Exit | null;
	/**
	 * Gets an exit in the room by ID.
	 * @param exitId - Exit ID.
	 * @returns Exit object or null if the exit is not found in the room.
	 */
	function getExitById(exitId: ID): Exit | null;
	/**
	 * Gets the exit order of visible exits in the room as an array of IDs.
	 * @returns Exit object or null if the exit is not found in the room.
	 */
	function getExitOrder(): ID[];
	/**
	 * Set exit information.
	 *
	 * The parameters must be an object that may be converted to json with the
	 * following paramters. Any other fields will be ignored.
	 * @param exitId - Exit ID.
	 * @param {object} [fields] Exit fields to update.
	 * @param {string} [fields.name] Name of the exit.
	 * @param {string[]} [fields.keys] Exit keywords used with the go command.
	 * @param {boolean} [fields.leaveMsg] Message seen by the origin room. Usually in present tense (eg. "leaves ...").
	 * @param {boolean} [fields.arriveMsg] Message seen by the arrival room. Usually in present tense (eg. "arrives from ...").
	 * @param {boolean} [fields.travelMsg] 	Message seen by the exit user. Usually in present tense (eg. "goes ...").
	 * @param {ExitIcon} [fields.icon] Icon for the exit.
	 * @param {ExitNav} [fields.nav] Navigation direction for the exit.
	 * @param {boolean} [fields.hidden] Flag telling if the exit is hidden, preventing it from being listed.
	 * @param {boolean} [fields.inactive] Flag telling if the exit is inactive, preventing it from being listed and used.
	 * @param {boolean} [fields.transparent] Flag telling if the exit is transparent, allowing you to see awake characters in the target room.
	 * @param {i32|i32u|i64|i64u} [fields.order] Sort order of the exit with 0 being the first listed. Ignored if the exit is hidden or inactive.
	 */
	function setExit<T>(exitId: ID, fields: T): void;
	/**
	 * Adds a custom command to the room.
	 *
	 * Pattern is a string describing the general command structure, and may
	 * contain <Fields> and [optional] parts.
	 *
	 * Any field defined in the pattern must have a corresponding field entry.
	 *
	 * @param keyword - Keyword for the command.
	 * @param cmd - Command to add.
	 * @param priority - Priority for sort order (descending) and when two or more commands match the same input. Higher priority is selected first.
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
}
/**
 * Script API functions.
 */
declare namespace Script {
	/**
	 * Starts listening for posted messages from any of the given `addr`
	 * addresses. If an address is a non-instance room, it will also listen to
	 * posted messages from any instance of that room.
	 *
	 * If no `addr` is provided, the script will listen to posts from _any_
	 * source, including scripts and bots controlled by other players.
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
	 * Posts a message to another script with the address `addr`.
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
	 * @returns Schedule ID or null if the message was posted without delay of if the receiving script was not listening.
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
		 * @returns This instance.
		 */
		withPrefix<T>(prefix: T): Iterator;
		/**
		 * Sets direction of iteration to be in lexiographcially reversed order.
		 *
		 * Must be called before using the iterator.
		 * @returns This instance.
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
