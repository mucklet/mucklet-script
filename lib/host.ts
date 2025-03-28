import {
	Room as room_binding,
	Script as script_binding,
	Store as store_binding,
	Iterator as iterator_binding,
	ExitAction as exitaction_binding,
	CmdAction as cmdaction_binding,
} from "./env";
import { JSON } from 'json-as'
export { JSON };

/** ID for in game entities such as characters, rooms, and areas. */
export type ID = string;
/** Timestamp as a UTC timestamp in milliseconds. */
export type Timestamp = i64;
/** Duration in milliseconds. */
export type Duration = i64;
/** Char state */
export namespace CharState {
	export const Asleep = i32(0);
	export const Awake = i32(1)
	export const Dazed = i32(2);
	export const Any = i32(255);
}
export type CharState = i32;
/** Char idle level */
export namespace IdleLevel {
	export const Asleep = i32(0);
	export const Active = i32(1);
	export const Idle = i32(2);
	export const Inactive = i32(3);
}
export type IdleLevel = i32;
/** RP state */
export namespace RPState {
	export const None = i32(0);
	export const LFRP = i32(1);
}
export type RPState = i32;
/** Exit navigation direction */
export namespace ExitNav {
	export const None = i32(0)
	export const North = i32(1)
	export const NorthEast = i32(2)
	export const East = i32(3)
	export const SouthEast = i32(4)
	export const South = i32(5)
	export const SouthWest = i32(6)
	export const West = i32(7)
	export const NorthWest = i32(8)
}
export type ExitNav = i32;
/** Exit navigation icon */
export namespace ExitIcon {
	export const None = i32(0)
	export const North = i32(1)
	export const NorthEast = i32(2)
	export const East = i32(3)
	export const SouthEast = i32(4)
	export const South = i32(5)
	export const SouthWest = i32(6)
	export const West = i32(7)
	export const NorthWest = i32(8)
	export const Up = i32(9)
	export const Down = i32(10)
	export const In = i32(11)
	export const Out = i32(12)
}
export type ExitIcon = i32;

// @ts-expect-error
@inline
function keyToBuffer<T>(key: T): ArrayBuffer {
	if (key instanceof ArrayBuffer) {
		return key
	} else if (isString(key)) {
		return String.UTF8.encode((key as string));
	}
	// @ts-expect-error
	return key;
}

/**
 * ExitAction is an action representing an intercepted use of an exit.
 */
export class ExitAction {
	/** Action ID */
	actionId: i32 = 0;
	/** Character ID */
	charId: ID = "";
	/** Exit ID */
	exitId: ID = "";

	/**
	 * Makes the character use an exit. If exitId is null, the character is sent
	 * through the exit that they originally tried to use.
	 *
	 * The exit may be hidden or inactive.
	 * @param exitId Exit ID or null for the originally used exit.
	 */
	useExit(exitId: ID | null = null): void {
		exitaction_binding.useExit(this.actionId, exitId);
	}

	/**
	 * Cancels a character's attempt to use an exit and shows them an info
	 * message instead. If msg is null, the default exit timeout message will be
	 * shown.
	 * @param msg Info message to show, or default message if null.
	 */
	cancel(msg: string | null = null): void {
		exitaction_binding.cancel(this.actionId, msg);
	}
}

/**
 * CmdAction is a command action triggered by a character.
 */
export class CmdAction {
	/** Action ID */
	actionId: i32 = 0;
	/** Character performing the action */
	char: Event.Char = new Event.Char();
	/** Command keyword */
	keyword: string = "";
	/** Command data in JSON format. */
	data: JSON.Raw = "";

	/**
	 * Responds to the command action with an info message.
	 * @param msg Info message.
	 */
	info(msg: string): void {
		cmdaction_binding.info(this.actionId, msg);
	}

	/**
	 * Responds to the command action with an error message.
	 * @param msg Error message.
	 */
	error(msg: string): void {
		cmdaction_binding.error(this.actionId, msg);
	}
}

/**
 * BaseIterator is an iterator over items with an ID.
 */
class BaseIterator {
	protected iterator: i32;
	/**
	 * Constructor of the Iterator instance.
	 */
	constructor(iterator: i32) {
		this.iterator = iterator;
	}

	/**
	 * Advances the iterator by one. Always check isValid() after a next()
	 * to ensure have not reached the end of the iterator.
	 */
	next(): void {
		iterator_binding.next(this.iterator);
	}

	/**
	 * Rewinds the iterator cursor all the way back to first position, which
	 * would be the smallest key, or greatest key if inReverse() was called.
	 *
	 * Any iterator prefix passed to withPrefix() will be used on rewind.
	 * The iterator is rewound by default.
	 */
	rewind(): void {
		iterator_binding.seek(this.iterator, null);
	}

	/**
	 * Returns the key string of the current key-value pair. It will abort
	 * if the cursor has reached the end of the iterator.
	 */
	getID(): ID {
		return String.UTF8.decode(iterator_binding.key(this.iterator));
	}

	/**
	 * Returns false when the cursor is at the end of the iterator.
	 */
	isValid(): boolean {
		return iterator_binding.valid(this.iterator, null);
	}

	/**
	 * Closes the iterator. Any further calls to the iterator will cause an
	 * error. May be called multiple times.
	 */
	close(): void {
		if (this.iterator >= 0) {
			iterator_binding.close(this.iterator);
		}
		this.iterator = -2;
	}
}

/** Command field type input values. */
export namespace FieldValue {

	@json
	export class Text {
		public value: string = "";
	}

	@json
	export class Keyword {
		public value: string = "";
	}

	@json
	export class Integer {
		public value: i64 = 0;
	}

	@json
	export class Float {
		public value: f64 = 0;
	}

	@json
	export class Bool {
		public value: bool = 0;
	}

	@json
	export class Char {
		/** Character ID. */
		id: string = "";
		/** Character name. */
		name: string = "";
		/** Character surname. */
		surname: string = "";
	}

	@json
	export class List {
		public value: string = "";
	}
}

/** Command field types. */
export namespace Field {

	/**
	 * A text field is used for arbitrary text, such as messages, descriptions, or titles.
	 */
	@json
	export class Text implements CommandField {

		public spanLines: boolean = false;
		public spellCheck: boolean = true;
		public formatText: boolean = false;
		public minLength: u32 = 0;
		public maxLength: u32 = 0;

		constructor(private desc: string = "") {}

		getType(): string {
			return "text";
		}

		getDesc(): string {
			return this.desc;
		}

		getOpts(): string | null {
			return ("{" +
				`"spanLines":` + JSON.stringify(this.spanLines) +
				`,"spellCheck":` + JSON.stringify(this.spellCheck) +
				`,"formatText":` + JSON.stringify(this.formatText) +
				`,"minLength":` + JSON.stringify(this.minLength) +
				`,"maxLength":` + JSON.stringify(this.maxLength) +
			"}");
		}

		/**
		 * Sets span lines flag. Is false by default.
		 * @param spanLines - Flag telling if the text can be spanned across multiple lines.
		 */
		setSpanLines(spanLines: boolean): this {
			this.spanLines = spanLines;
			return this;
		}

		/**
		 * Sets flag to spellCheck text. Is true by default.
		 * @param spellCheck - Flag telling if the text should be checked for spelling errors.
		 */
		setSpellCheck(spellCheck: boolean): this {
			this.spellCheck = spellCheck;
			return this;
		}

		/**
		 * Sets flag to format text while typing. Is false by default.
		 * @param formatText - Flag telling the text should be formatted while typing.
		 */
		setFormatText(formatText: boolean): this {
			this.formatText = formatText;
			return this;
		}

		/**
		 * Sets text min length. Must be smaller or equal to max length unless
		 * max length is set to zero (0).. Is 0 by default.
		 * @param minLength - Min length of text.
		 */
		setMinLength(minLength: u32): this {
			this.minLength = minLength;
			return this;
		}

		/**
		 * Sets text maximum length. Zero (0) means server max length. Is 0 by default.
		 * @param maxLength - Max length of text.
		 */
		setMaxLength(maxLength: u32): this {
			this.maxLength = maxLength;
			return this;
		}
	}

	/**
	 * A keyword field is used for keyword names using a limited set of
	 * characters that will be transformed to lower case. By default, a keyword
	 * allows Letters, Numbers, Spaces, apostrophes ('), and dash/minus (-).
	 */
	@json
	export class Keyword implements CommandField {
		public removeDiacritics: boolean = false;
		public minLength: u32 = 0;
		public maxLength: u32 = 0;

		constructor(private desc: string = "") {}

		getType(): string {
			return "keyword";
		}

		getDesc(): string {
			return this.desc;
		}

		getOpts(): string | null {
			return ("{" +
				`"removeDiacritics":` + JSON.stringify(this.removeDiacritics) +
				// `,"excludeSpace":` + JSON.stringify(this.excludeSpace) +
				`,"minLength":` + JSON.stringify(this.minLength) +
				`,"maxLength":` + JSON.stringify(this.maxLength) +
			"}");
		}

		/**
		 * Sets flag to remove diacritics from the keyword by decomposing the
		 * characters and removing any non-print characters and marker in the Mn
		 * Unicode category. Is false by default.
		 * @param removeDiacritics - Flag telling if diacritics should be removed.
		 */
		setRemoveDiacritics(removeDiacritics: boolean): this {
			this.removeDiacritics = removeDiacritics;
			return this;
		}

		/**
		 * Sets text min length. Must be smaller or equal to max length unless
		 * max length is set to zero (0).. Is 0 by default.
		 * @param minLength - Min length of text.
		 */
		setMinLength(minLength: u32): this {
			this.minLength = minLength;
			return this;
		}

		/**
		 * Sets text maximum length. Zero (0) means server max length. Is 0 by default.
		 * @param maxLength - Max length of text.
		 */
		setMaxLength(maxLength: u32): this {
			this.maxLength = maxLength;
			return this;
		}
	}

	/** An integer field is used for whole numbers. */
	@json
	export class Integer implements CommandField {
		public min: i64 = 0;
		public max: i64 = 0;
		private hasMin: boolean = false;
		private hasMax: boolean = false;

		constructor(private desc: string = "") {}

		getType(): string {
			return "integer";
		}

		getDesc(): string {
			return this.desc;
		}

		getOpts(): string | null {
			let s = "{";
			if (this.hasMin) {
				s += `"min":` + JSON.stringify(this.min)
			}
			if (this.hasMax) {
				if (s.length > 1) {
					s = s + ","
				}
				s += `"max":` + JSON.stringify(this.max)
			}
			return s + "}";
		}

		/**
		 * Sets integer min value. Must be smaller or equal to max value.
		 * @param min - Min value of integer.
		 */
		setMin(min: i64): this {
			this.min = min;
			this.hasMin = true;
			return this;
		}

		/**
		 * Sets integer max value. Must be greater or equal to min value.
		 * @param max - Max value of integer
		 */
		setMax(max: i64): this {
			this.max = max;
			this.hasMax = true;
			return this;
		}
	}

	/** A float field is used for decimal numbers. */
	@json
	export class Float implements CommandField {
		public min: f64 = 0;
		public max: f64 = 0;
		private gtprop: string | null = null;
		private ltprop: string | null = null;

		constructor(private desc: string = "") {}

		getType(): string {
			return "float";
		}

		getDesc(): string {
			return this.desc;
		}

		getOpts(): string | null {
			let s = "{";
			if (this.gtprop != null) {
				s += `"${this.gtprop!}":` + JSON.stringify(this.min)
			}
			if (this.ltprop != null) {
				if (s.length > 1) {
					s = s + ","
				}
				s += `"${this.ltprop!}":` + JSON.stringify(this.max)
			}
			return s + "}";
		}

		/**
		 * Sets float min value. Must be smaller than (or equal if both are inclusive) to max value.
		 * @param min - Min value of float.
		 * @param inclusive - Flag to tell if min value is inclusive (>=) on true, or exclusive (>) on false.
		 */
		setMin(min: f64, inclusive: bool): this {
			this.min = min;
			this.gtprop = inclusive ? "gte" : "gt";
			return this;
		}

		/**
		 * Sets float max value. Must be greater than (or equal if both are inclusive) to min value.
		 * @param max - Max value of float.
		 * @param inclusive - Flag to tell if max value is inclusive (<=) on true, or exclusive (<) on false.
		 */
		setMax(max: f64, inclusive: bool): this {
			this.max = max;
			this.ltprop = inclusive ? "lte" : "lt";
			return this;
		}
	}

	/** An bool field is used for boolean values. */
	@json
	export class Bool implements CommandField {
		constructor(private desc: string = "") {}

		getType(): string {
			return "bool";
		}

		getDesc(): string {
			return this.desc;
		}

		getOpts(): string | null {
			return null;
		}
	}

	/** A char field is used to enter the name of a character. */
	@json
	export class Char implements CommandField {
		public inRoom: boolean = false;
		public state: CharState = CharState.Any;

		constructor(private desc: string = "") {}

		getType(): string {
			return "char";
		}

		getDesc(): string {
			return this.desc;
		}

		getOpts(): string | null {
			let state = "";
			switch (this.state) {
				case CharState.Asleep:
					state = `"asleep"`;
					break;
				case CharState.Awake:
					state = `"awake"`;
					break;
				case CharState.Dazed:
					state = `"dazed"`;
					break;
			}
			return "{" +
				`"inRoom":` + JSON.stringify(this.inRoom) +
				(state == "" ? "" : (`,"state":` + state)) +
			"}";
		}

		/**
		 * Sets inRoom flag, requiring the character to be in the room.
		 */
		setInRoom(): this {
			this.inRoom = true;
			return this;
		}

		/**
		 * Sets state that the character must be in. Default is CharState.Any.
		 */
		setState(state: CharState): this {
			this.state = state;
			return this;
		}
	}

	/**
	 * A list field is used to select between a list of items. Items must be
	 * unique, not containing non-printable or newline characters, and be
	 * trimmed of leading, trailing, and consecutive spaces.
	 *
	 * Items should not contain characters used as delimiters to continue the
	 * command.
	 */
	@json
	export class List implements CommandField {
		public items: Array<string> = new Array<string>();

		constructor(private desc: string = "") {}

		getType(): string {
			return "list";
		}

		getDesc(): string {
			return this.desc;
		}

		getOpts(): string | null {
			return "{" +
				`"items":` + JSON.stringify(this.items) +
			"}";
		}

		/**
		 * Adds a single item to the list.
		 */
		addItem(item: string): this {
			this.items.push(item);
			return this;
		}

		/**
		 * Sets an array of list items, replacing any previously set items.
		 * @param items Array of list items.
		 */
		setItems(items: Array<string>): this {
			this.items = items;
			return this;
		}
	}
}

export interface CommandField {
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
export class Command {
	private fieldDefs: Map<string, string> = new Map<string, string>();
	/**
	 * Constructor of the Command instance.
	 */
	constructor(public pattern: string, public desc: string = "") {}

	/**
	 * Sets the definition for a command field.
	 * @param key - Field <key> as found in command pattern.
	 * @param def - Field definition.
	 */
	field(key: string, def: CommandField): Command {
		assert(!this.fieldDefs.has(key), `command already has definition for field "${key}"`);
		let type = def.getType();
		let desc = def.getDesc();
		let opts = def.getOpts();
		const fieldDef = ("{" +
			`"type":` + JSON.stringify(type) +
			`,"desc":` + JSON.stringify(desc) +
			(opts != null ? `,"opts":` + opts : "") +
		"}");
		this.fieldDefs.set(key, fieldDef);
		return this;
	}

	/**
	 * Converts the command into a JSON structure.
	 */
	json(): string {
		const keys = this.fieldDefs.keys();
		let s = `{"pattern":${JSON.stringify(this.pattern)},"desc":${JSON.stringify(this.desc)}`;
		if (keys.length > 0) {
			s += `,"fields":{`
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				if (i > 0) {
					s += ","
				}
				s += JSON.stringify(key) + ":" + this.fieldDefs.get(key);
			}
			s += `}`;
		}
		return s + `}`;
	}
}


/**
 * Room API functions and types.
 */
export namespace Room {

	/**
	 * Move messages used when entering or leaving a room.
	 */
	@json
	export class MoveMsgs {
		leaveMsg: string = "";
		arriveMsg: string = "";
		travelMsg: string = "";
	}

	/**
	 * Detailed room information.
	 */
	@json
	export class RoomDetails {
		/** Room ID. */
		id: ID = "";
		/** Room name. */
		name: string = "";
		/** Room description. */
		desc: string = "";
		/** Room image ID; */
		imageId: ID = "";

		/** IsDark flags if other character can be seen or whispered to in the room. */
		isDark: boolean = false;
		/** IsQuiet flags if a room is quiet and won't allow communication. */
		isQuiet: boolean = false;
		/** IsHome flags if the room can be set as home by others. */
		isHome: boolean = false;
		/** IsTeleport flags if the room can be added as a teleport node by others. */
		isTeleport: boolean = false;
		/** IsInstance flags if the room creates an instance. */
		isInstance: boolean = false;
		/** Autosweep flags if sleepers in the room should be sent home automatically. */
		autosweep: boolean = false;
		/** AutosweepDelay is the time in milliseconds until a sleeper is swept. */
		autosweepDelay: Duration = 0;
		/** CustomTeleportMsgs flags if the room uses custom teleport messages. */
		customTeleportMsgs: boolean = false;
		/** OverrideCharTeleportMsgs flags if the custom teleport messages should override any set character teleport messages. */
		overrideCharTeleportMsgs: boolean = false;
		/** Custom teleport messages. */
		teleport: MoveMsgs = new MoveMsgs();
		/** Created time. */
		created: Timestamp = 0;
	}

	/**
	 * Room character.
	 */
	@json
	export class Char {
		/** Character ID. */
		id: string = "";
		/** Character name. */
		name: string = "";
		/** Character surname. */
		surname: string = "";
		/** Character avatar. */
		avatar: ID = "";
		/** Character species. */
		species: string = "";
		/** Character gender. */
		gender: string = "";
		/** Character description. */
		desc: string = "";
		/** Character image. */
		image: ID = "";
		/** Character state. */
		state: CharState = CharState.Asleep;
		/** Character idle status. */
		idle: IdleLevel = IdleLevel.Asleep;
		/** Character RP state. */
		rp: RPState = RPState.None;
	}

	/**
	 * Room exit.
	 */
	@json
	export class Exit {
		/** Exit ID. */
		id: string = "";
		/** Exit keys. */
		keys: string[] = [];
		/** Exit name. */
		name: string = "";
		/** Exit icon. */
		icon: ExitIcon = ExitIcon.None;
		/** Exit navigation direction. */
		nav: ExitNav = ExitNav.None;
		/** Leave message. */
		leaveMsg: string = "";
		/** Arrival message. */
		arriveMsg: string = "";
		/** Travel message. */
		travelMsg: string = "";
		/** Target room. */
		targetRoom: ID = "";
		/** Created timestamp. */
		created: Timestamp = 0;
		/** Is hidden flag. */
		hidden: boolean = false;
		/** Is inactive flag. */
		inactive: boolean = false;
		/** Is transparent flag. */
		transparent: boolean = false;
	}

	/**
	 * Starts listening to room events on the current instance. If `instance` is
	 * set, it starts listening for events in that specific instance, or null
	 * for any room instance. Room events will be sent to `onRoomEvent` for the
	 * instance.
	 * @param instance - Instance or null for the non-instance.
	 * @returns True if a new listener was added, otherwise false.
	 */
	export function listen(instance: string | null = null): boolean {
		return room_binding.listen(0 /** room event **/, instance);
	}

	/**
	 * Stops listening to room events on the current instance. If `instance` is
	 * provided, it stops listening for that specific instance, or null for the
	 * non-instance room.
	 * @param instance - Instance or null for the non-instance.
	 * @returns True if a listener existed, otherwise false.
	 */
	export function unlisten(instance: string | null = null): boolean {
		return room_binding.unlisten(0 /** room event **/, instance);
	}

	/**
	 * Starts listening to char events in the room. If `instance` is set, it
	 * starts listening for events in that specific instance, or null for any
	 * room instance. Char events will be sent to `onCharEvent` for the
	 * instance.
	 * @param instance - Instance or null for any instance.
	 * @returns True if a new listener was added, otherwise false.
	 */
	export function listenCharEvent(instance: string | null = null): boolean {
		return room_binding.listen(1 /** char event **/, instance);
	}

	/**
	 * Stops listening to char events in the room. If `instance` is set, it
	 * stops listening for events in that specific instance, or null for any
	 * room instance.
	 * @param instance - Instance or null for any instance.
	 * @returns True if a listener existed, otherwise false.
	 */
	export function unlistenCharEvent(instance: string | null = null): boolean {
		return room_binding.unlisten(1 /** char event **/, instance);
	}

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
	export function listenExit(exitId: string | null = null): boolean {
		return room_binding.listenExit(exitId);
	}

	/**
	 * Stops listening to exit usage in the room. If `exitId` is set, it stops
	 * listening for exit use for that specific exit, or null to stop listening
	 * for the the wildcard listener.
	 * @param exitId - Exit ID or null for any exit.
	 * @returns True if a listener existed, otherwise false.
	 */
	export function unlistenExit(exitId: string | null = null): boolean {
		return room_binding.unlistenExit(exitId);
	}

	/**
	 * Sends a "describe" event to the current room instance.
	 */
	export function describe(msg: string): void {
		room_binding.describe(msg);
	}

	/**
	 * Get detailed room information, such as description and settings.
	 */
	export function getDetails(): RoomDetails  {
		return JSON.parse<RoomDetails>(room_binding.getRoom());
	}

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
	export function setRoom<T>(fields: T): void {
		let dta = JSON.stringify(fields);
		room_binding.setRoom(dta);
	}

	/**
	 * Switches to a stored room profile by profile key.
	 * @param keyword - Keyword for the stored profile.
	 * @param safe - Flag to prevent the room's current profile to be overwritten by the stored profile, if it contains unstored changes.
	 */
	export function useProfile(keyword: string, safe: boolean = false): void  {
		return room_binding.useProfile(keyword, safe);
	}

	/**
	 * Sweep a single character from the room by sending them home.
	 * @param charId - Character ID.
	 * @param msg - Message to show too the room when the character is teleported away. Defaults to other teleport messages.
	 */
	export function sweepChar(charId: ID, msg: string | null): void  {
		return room_binding.sweepChar(charId, msg);
	}

	/**
	 * Checks if a character is the owner of the room, or if the owner shares
	 * the same player as the character. It does not include admins or builders.
	 * @param charId - Character ID.
	 */
	export function canEdit(charId: ID): boolean  {
		return room_binding.canEdit(charId);
	}

	/**
	 * Gets an iterator for the characters in the room that iterates from the
	 * character most recently entering the room.
	 * @param state - State of the characters to iterate over.
	 * @param reverse - Flag to reverse the iteration direction, starting with the character that has been in the room the longest.
	 * @returns Character iterator.
	 */
	export function charIterator(state: CharState = CharState.Any, reverse: boolean = false): CharIterator {
		return new CharIterator(room_binding.charIterator(state, reverse));
	}

	/**
	 * Gets an iterator for the exits in the room. Order is undefined.
	 * @returns Exit iterator.
	 */
	export function exitIterator(): ExitIterator {
		return new ExitIterator(room_binding.exitIterator());
	}


	/**
	 * Gets a character in the room by ID.
	 * @param charId - Character ID.
	 * @returns Char object or null if the character is not found in the room.
	 */
	export function getChar(charId: ID): Char | null {
		const dta = room_binding.getChar(charId)
		if (dta == null) {
			return null
		}
		return JSON.parse<Char>(dta);
	}

	/**
	 * Gets an exit in the room by keyword.
	 * @param exitId - Exit ID.
	 * @returns Exit object or null if the exit is not found in the room.
	 */
	export function getExit(keyword: string): Exit | null {
		const dta = room_binding.getExit(keyword, true)
		if (dta == null) {
			return null
		}
		return JSON.parse<Exit>(dta);
	}

	/**
	 * Gets an exit in the room by ID.
	 * @param exitId - Exit ID.
	 * @returns Exit object or null if the exit is not found in the room.
	 */
	export function getExitById(exitId: ID): Exit | null {
		const dta = room_binding.getExit(exitId, false)
		if (dta == null) {
			return null
		}
		return JSON.parse<Exit>(dta);
	}

	/**
	 * Gets the exit order of visible exits in the room as an array of IDs.
	 * @returns Exit object or null if the exit is not found in the room.
	 */
	export function getExitOrder(): ID[] {
		return room_binding.getExitOrder();
	}

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
	export function setExit<T>(exitId: ID, fields: T): void {
		let dta = JSON.stringify(fields);
		room_binding.setExit(exitId, dta);
	}

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
	export function addCommand(keyword: string, cmd: Command, priority: u32 = 0): void {
		return room_binding.addCommand(keyword, cmd.json(), priority);
	}

	/**
	 * Removes a custom command, added by the script, from the room.
	 * @param keyword - Keyword for the command.
	 */
	export function removeCommand(keyword: string): boolean {
		return room_binding.removeCommand(keyword);
	}

	class CharIterator extends BaseIterator {
		/**
		 * Returns the current char. It will abort if the cursor has reached the
		 * end of the iterator.
		 */
		getChar(): Char {
			// @ts-expect-error
			return JSON.parse<Char>(String.UTF8.decode(iterator_binding.value(super.iterator)));
		}
	}

	class ExitIterator extends BaseIterator {
		/**
		 * Returns the current char. It will abort if the cursor has reached the
		 * end of the iterator.
		 */
		getExit(): Exit {
			// @ts-expect-error
			return JSON.parse<Exit>(String.UTF8.decode(iterator_binding.value(super.iterator)));
		}
	}
}

/**
 * Script API functions.
 */
export namespace Script {

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
	export function listen(addrs: string[] | null = null): void {
		script_binding.listen(addrs);
	}

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
	export function unlisten(addrs: string[] | null = null): void {
		script_binding.unlisten(addrs);
	}

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
	export function post(addr: string, topic: string, data: string | null = null, delay: i64 = 0): ID | null {
		return script_binding.post(addr, topic, data, delay);
	}

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
	export function cancelPost(scheduleId: ID | null): boolean {
		if (scheduleId == null) {
			return false;
		}
		return script_binding.cancelPost(scheduleId);
	}
}

/**
 * Event classes used with JSON.parse to decode room events.
 */
export namespace Event {
	@json
	class BaseType {
		type: string = "";
	}

	/**
	 * Get event type from a json encoded event.
	 */
	export function getType(ev: string): string {
		return JSON.parse<BaseType>(ev).type;
	}

	/**
	 * Base event shared by all events.
	 */
	@json
	export class Base {
		/** Event ID. */
		id: string = "";
		/** Event type. */
		type: string = "";
		/** Unix timestamp (milliseconds). */
		time: Timestamp = 0;
		/** Signature. */
		sig: string = "";
	}

	/**
	 * Base event for message events by a character, such as say, describe,
	 * pose, etc.
	 */
	@json
	export class BaseCharMsg extends Base {
		/** Message. */
		msg: string = "";
		/** Acting character. */
		char: Char = new Char();
		/** Acting puppeteer. */
		@omitnull()
		puppeteer: Char | null = null;
	}

	/**
	 * Base event for message events by a character where a method is included,
	 * such as leave and arrive.
	 */
	@json
	export class BaseCharMethodMsg extends BaseCharMsg {
		/** Method */
		@omitif("!!this.method")
		method: string = "";
	}

	/**
	 * Base event for message events by a character that may optionally be
	 * marked as a pose, such as OOC events.
	 */
	@json
	export class BaseCharPoseMsg extends BaseCharMsg {
		/** Message is a pose. */
		pose: boolean = false;
	}

	/**
	 * Character object with name and ID.
	 */
	@json
	export class Char {
		/** Character ID. */
		id: string = "";
		/** Character name. */
		name: string = "";
		/** Character surname. */
		surname: string = "";
	}

	/**
	 * Action event.
	 */
	@json
	export class Action extends BaseCharMsg {}

	/**
	 * Arrive event.
	 */
	@json
	export class Arrive extends BaseCharMethodMsg {}

	/**
	 * Describe event.
	 */
	@json
	export class Describe extends BaseCharMsg {}

	/**
	 * Leave event.
	 */
	@json
	export class Leave extends BaseCharMethodMsg {}

	/**
	 * OOC event.
	 */
	@json
	export class OOC extends BaseCharPoseMsg {}

	/**
	 * Pose event.
	 */
	@json
	export class Pose extends BaseCharMsg {}

	/**
	 * Results in a roll event.
	 */
	@json
	export class RollResult {
		type: string = "";
		/** Modifier operator. Either "+" or "-". */
		op: string = "";
		/** Dice count. Always 0 on type "mod". */
		count: i32 = 0;
		/** Sides on dice. Always 0 on type "mod" */
		sides: i32 = 0;
		/** Roll value for each die. Always empty slice on type "mod" */
		dice: i32[] = [];
		/** Modifier value. Always 0 on type "std". */
		value: i32 = 0;
	}

	/**
	 * Roll event.
	 */
	@json
	export class Roll extends Base {
		/** Acting character. */
		char: Char = new Char();
		/** Acting puppeteer. */
		@omitnull()
		puppeteer: Char | null = null;
		/** Roll total. */
		total: i32 = 0;
		/** Roll result. */
		result: RollResult[] = [];
		/** Quiet roll. */
		@omitif("!this.quiet")
		quiet: boolean = false;
	}

	/**
	 * Say event.
	 */
	@json
	export class Say extends BaseCharMsg {}

	/**
	 * Sleep event.
	 */
	@json
	export class Sleep extends BaseCharMsg {}

	/**
	 * Wakeup event.
	 */
	@json
	export class Wakeup extends BaseCharMsg {}

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
export namespace Store {

	/**
	 * Sets the database transaction to read-only during the script call,
	 * allowing multiple iterators to be open at the same time.
	 *
	 * Must be called before using the store.
	 */
	export function readOnly(): void {
		store_binding.readOnly();
	}

	/**
	 * Adds a key and a string value to the store, or updates that key's value
	 * if it already exists.
	 * @param {string | ArrayBuffer} key - Stored key.
	 * @param {string} value - Stored string value.
	 */
	export function setString<T>(key: T, value: string): void {
		store_binding.setItem(keyToBuffer(key), String.UTF8.encode(value));
	}

	/**
	 * Returns the stored string value for the key, or null if the key does not
	 * exist.
	 * @param {string | ArrayBuffer} key - Stored key.
	 */
	export function getString<T>(key: T): string | null {
		let value = store_binding.getItem(keyToBuffer(key));
		if (value == null) {
			return null;
		}
		return String.UTF8.decode(value);
	}

	/**
	 * Adds a key and an ArrayBuffer value to the store, or updates that key's
	 * value if it already exists.
	 * @param {string | ArrayBuffer} key - Stored key.
	 * @param {ArrayBuffer} value - Stored value.
	 */
	export function setBuffer<T>(key: T, value: ArrayBuffer): void {
		store_binding.setItem(keyToBuffer(key), value);
	}

	/**
	 * Returns the stored ArrayBuffer value for the key, or null if the key does
	 * not exist.
	 * @param {string | ArrayBuffer} key - Stored key.
	 */
	export function getBuffer<T>(key: T): ArrayBuffer | null {
		return store_binding.getItem(keyToBuffer(key));
	}

	/**
	 * Deletes a key and it's value from the store. If the key does not exist,
	 * this is a no-op.
	 * @param {string | ArrayBuffer} key - Stored key.
	 */
	export function deleteKey<T>(key: T): void {
		store_binding.setItem(keyToBuffer(key), null);
	}

	/**
	 * Returns the total number of bytes used by the store for this script
	 * address.
	 */
	export function totalBytes(): i64 {
		return store_binding.totalBytes();
	}

	/**
	 * Iterator is an object that iterates over a storage.
	 */
	export class Iterator {
		private iterator: i32 = -1; // -1 means not yet created.
		private prefix: ArrayBuffer | null = null;
		private reverse: boolean = false;

		/**
		 * Constructor of the Iterator instance.
		 */
		constructor() {	}

		/**
		 * Sets a prefix to use for calls to seek, rewind, and isValid.
		 *
		 * Must be called before using the iterator.
		 * @param {string | ArrayBuffer} prefix - Key prefix used in seek, rewind, and isValid.
		 * @returns This instance.
		 */
		withPrefix<T>(prefix: T): Iterator {
			assert(this.iterator < 0, "withPrefix must be called before using the iterator");
			this.assertNotClosed();
			this.prefix = keyToBuffer(prefix);
			return this;
		}

		/**
		 * Sets direction of iteration to be in lexiographcially reversed order.
		 *
		 * Must be called before using the iterator.
		 * @returns This instance.
		 */
		inReverse(): Iterator {
			assert(this.iterator < 0, "withReverseIteration must be called before using the iterator");
			this.assertNotClosed();
			this.reverse = true;
			return this;
		}

		/**
		 * Advances the iterator by one. Always check isValid() after a next()
		 * to ensure have not reached the end of the iterator.
		 */
		next(): void {
			this.ensureIterator();
			iterator_binding.next(this.iterator);
		}

		/**
		 * Seeks to the provided key if found. If not found, it would seek to
		 * the next smallest key greater than the provided key if iterating in
		 * the forward direction. Behavior would be reversed if iterating
		 * backwards.
		 *
		 * Any iterator prefix passed to withPrefix() will be prepended to
		 * the key.
		 */
		seek<T>(key: T): void {
			this.ensureIterator();
			iterator_binding.seek(this.iterator, keyToBuffer(key));
		}

		/**
		 * Rewinds the iterator cursor all the way back to first position, which
		 * would be the smallest key, or greatest key if inReverse() was called.
		 *
		 * Any iterator prefix passed to withPrefix() will be used on rewind.
		 * The iterator is rewound by default.
		 */
		rewind(): void {
			this.ensureIterator();
			iterator_binding.seek(this.iterator, null);
		}

		/**
		 * Returns the key string of the current key-value pair. It will abort
		 * if the cursor has reached the end of the iterator.
		 */
		getKeyString(): string {
			this.ensureIterator();
			return String.UTF8.decode(iterator_binding.key(this.iterator));
		}

		/**
		 * Returns the key ArrayBuffer of the current key-value pair. It will
		 * abort if the cursor has reached the end of the iterator.
		 */
		getKeyBuffer(): ArrayBuffer {
			this.ensureIterator();
			return iterator_binding.key(this.iterator);
		}

		/**
		 * Returns the string value of the current key-value pair. It will abort
		 * if the cursor has reached the end of the iterator.
		 */
		getValueString(): string {
			this.ensureIterator();
			return String.UTF8.decode(iterator_binding.value(this.iterator));
		}

		/**
		 * Returns the ArrayBuffer value of the current key-value pair. It will
		 * abort if the cursor has reached the end of the iterator.
		 */
		getValueBuffer(): ArrayBuffer {
			this.ensureIterator();
			return iterator_binding.value(this.iterator);
		}

		/**
		 * Returns false when the cursor is at the end of the iterator.
		 *
		 * Any iterator prefix passed to withPrefix() will be used as prefix.
		 */
		isValid(): boolean {
			this.ensureIterator();
			return iterator_binding.valid(this.iterator, null);
		}

		/**
		 * Returns false when the cursor is at the end of the iterator, or when
		 * the current key is not prefixed by the specified prefix.
		 *
		 * Any iterator prefix passed to withPrefix() will be prepended to the
		 * provided prefix.
		 */
		isValidForPrefix<T>(prefix: T | null): boolean {
			this.ensureIterator();
			return iterator_binding.valid(this.iterator, keyToBuffer(prefix));
		}


		/**
		 * Closes the iterator. Any further calls to the iterator will cause an
		 * error. May be called multiple times.
		 */
		close(): void {
			if (this.iterator >= 0) {
				iterator_binding.close(this.iterator);
			}
			this.iterator = -2;
		}

		private ensureIterator(): void {
			if (this.iterator < 0) {
				this.assertNotClosed();
				this.iterator = store_binding.newIterator(this.prefix, this.reverse);
			}
		}

		private assertNotClosed(): void {
			assert(this.iterator >= -1, "iterator is closed");
		}
	}
}
