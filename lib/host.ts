import {
	Room as room_binding,
	Script as script_binding,
	Store as store_binding,
} from "./env";
import { JSON } from 'json-as'
export { JSON };

/** ID for in game entities such as characters, rooms, and areas. */
export type ID = string;
/** Timestamp as a UTC timestamp in milliseconds. */
export type Timestamp = i64;
/** Duration in milliseconds. */
export type Duration = i64;

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
	 * Starts listening to room events on the current instance. If `instance` is
	 * set, it starts listening for that specific instance, or null for the
	 * non-instance room. Room events will be sent to `onRoomEvent` for the
	 * instance.
	 */
	export function listen(instance: string | null = null): void {
		room_binding.listen(instance);
	}

	/**
	 * Stops listening to room events on the current instance. If `instance` is
	 * provided, it stops listening for that specific instance, or null for the
	 * non-instance room.
	 */
	export function unlisten(instance: string | null = null): void {
		room_binding.unlisten(instance);
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
	 * @param key - Keyword for the stored profile.
	 * @param safe - Flag to prevent the room's current profile to be overwritten by the stored profile, if it contains unstored changes.
	 */
	export function useProfile(key: string, safe: boolean = false): void  {
		return room_binding.useProfile(key, safe);
	}

	/**
	 * Sweep a single character from the room by sending them home.
	 * @param char - Character ID.
	 * @param msg - Message to show too the room when the character is teleported away. Defaults to other teleport messages.
	 */
	export function sweepChar(char: ID, msg: string | null): void  {
		return room_binding.sweepChar(char, msg);
	}

	/**
	 * Checks if a character is the owner of the room, or if the owner shares
	 * the same player as the character. It does not include admins or builders.
	 * @param char - Character ID.
	 */
	export function canEdit(char: ID): boolean  {
		return room_binding.canEdit(char);
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
	 * @remark
	 * Posts from the current script does not require listening. A script can
	 * always post to itself.
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
	 */
	export function unlisten(addrs: string[] | null = null): void {
		script_binding.unlisten(addrs);
	}

	/**
	 * Posts a message to another script with the address `addr`.
	 * @param addr - Address of target script. If addr is "#", it will be a post to the current script instance.
	 * @param topic - Message topic. May be any kind of string.
	 * @param data - Additional data. Must be valid JSON.
	 * @param delay - Delay in milliseconds.
	 */
	export function post(addr: string, topic: string, data: string | null = null, delay: i64 = 0): void {
		script_binding.post(addr, topic, data, delay);
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
 */
export namespace Store {

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
			store_binding.iteratorNext(this.iterator);
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
			store_binding.iteratorSeek(this.iterator, keyToBuffer(key));
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
			store_binding.iteratorSeek(this.iterator, null);
		}

		/**
		 * Returns the key string of the current key-value pair. It will abort
		 * if the cursor has reached the end of the iterator.
		 */
		getKeyString(): string {
			this.ensureIterator();
			return String.UTF8.decode(store_binding.iteratorKey(this.iterator));
		}

		/**
		 * Returns the key ArrayBuffer of the current key-value pair. It will
		 * abort if the cursor has reached the end of the iterator.
		 */
		getKeyBuffer(): ArrayBuffer {
			this.ensureIterator();
			return store_binding.iteratorKey(this.iterator);
		}

		/**
		 * Returns the string value of the current key-value pair. It will abort
		 * if the cursor has reached the end of the iterator.
		 */
		getValueString(): string {
			this.ensureIterator();
			return String.UTF8.decode(store_binding.iteratorItem(this.iterator));
		}

		/**
		 * Returns the ArrayBuffer value of the current key-value pair. It will
		 * abort if the cursor has reached the end of the iterator.
		 */
		getValueBuffer(): ArrayBuffer {
			this.ensureIterator();
			return store_binding.iteratorItem(this.iterator);
		}

		/**
		 * Returns false when the cursor is at the end of the iterator.
		 *
		 * Any iterator prefix passed to withPrefix() will be used as prefix.
		 */
		isValid(): boolean {
			this.ensureIterator();
			return store_binding.iteratorValid(this.iterator, null);
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
			return store_binding.iteratorValid(this.iterator, keyToBuffer(prefix));
		}


		/**
		 * Closes the iterator. Any further calls to the iterator will cause an
		 * error. May be called multiple times.
		 */
		close(): void {
			if (this.iterator >= 0) {
				store_binding.iteratorClose(this.iterator);
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