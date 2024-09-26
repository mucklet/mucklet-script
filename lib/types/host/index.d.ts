/** ID for in game entities such as characters, rooms, and areas. */
declare type ID = string;
/** Timestamp as a UTC timestamp in milliseconds. */
declare type Timestamp = i64;
/** Duration in milliseconds. */
declare type Duration = i64;
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
	 * Starts listening to room events on the current instance. If `instance` is
	 * set, it starts listening for that specific instance, or null for the
	 * non-instance room. Room events will be sent to `onRoomEvent` for the
	 * instance.
	 */
	function listen(instance?: string | null): void;
	/**
	 * Stops listening to room events on the current instance. If `instance` is
	 * provided, it stops listening for that specific instance, or null for the
	 * non-instance room.
	 */
	function unlisten(instance?: string | null): void;
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
	 * @param key - Keyword for the stored profile.
	 * @param safe - Flag to prevent the room's current profile to be overwritten by the stored profile, if it contains unstored changes.
	 */
	function useProfile(key: string, safe?: boolean): void;
	/**
	 * Sweep a single character from the room by sending them home.
	 * @param char - Character ID.
	 * @param msg - Message to show too the room when the character is teleported away. Defaults to other teleport messages.
	 */
	function sweepChar(char: ID, msg: string | null): void;
	/**
	 * Checks if a character is the owner of the room, or if the owner shares
	 * the same player as the character. It does not include admins or builders.
	 * @param char - Character ID.
	 */
	function canEdit(char: ID): boolean;
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
	 */
	function post(addr: string, topic: string, data?: string | null, delay?: i64): void;
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
