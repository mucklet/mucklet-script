/**
 * The lock_inside.ts is a script that interacts with another room script,
 * lock_outside.ts, to allow someone in the "inside" room to lock and unlock the
 * door so that the exit leading from the "outside" room to the "inside" room
 * may not be used while locked.
 *
 * The script adds two commands to the room:
 * ```
 * lock door
 * unlock door
 * ```
 *
 * The door will automatically be unlocked when there are no awake characters in
 * the room.
 */

// Post address to the outside room script. Replace this.
// To get a room script's address, type: roomscript <KEYWORD>
const outside = "room.aaaaaaaaaaaaaaaaaaaa#bbbbbbbbbbbbbbbbbbbb"

// Checks if the room is locked.
function isLocked(): boolean {
	// Get the stored "locked" value to tell if the door is locked.
	// Null means unlocked while anything else means locked.
	return Store.getBuffer("locked") != null
}

// Updates the outside room by sending a "locked" or "unlocked" message.
function updateOutside(): void {
	Script.post(outside, isLocked() ? "locked" : "unlocked")
}

// Locks the door.
function lock(): void {
	// Post a "locked" message to the outside room script.
	Script.post(outside, "locked")
	// Store a single byte as a way to tell the door is locked.
	Store.setBuffer("locked", new ArrayBuffer(1))
}

// Unlocks the door.
function unlock(): void {
	// Post an "unlocked" message to the outside room script.
	Script.post(outside, "unlocked")
	// Delete the stored byte to tell the door is unlocked.
	Store.deleteKey("locked")
}

// Checks if the character is awake (or rather not asleep) in the room.
function isCharAwakeInRoom(charJson: string|null): boolean {
	if (charJson == null) {
		return false
	}
	const char = JSON.parse<Room.Char>(charJson)
	return char.state != CharState.Asleep
}

export function onActivate(): void {
	// Add commands to lock or unlock the door.
	Room.addCommand("lock", new Command("lock door", "Locks the door."))
	Room.addCommand("unlock", new Command("unlock door", "Unlocks the door."))
	// Start listening to message from the outside room requesting an update.
	Script.listen([outside])
	// Start listening to character events to check for awake characters.
	Room.listenCharEvent()
	// Update the outside room with the current lock status.
	updateOutside()
}

// onCommand is called when one of commands, added by the script, is used.
export function onCommand(addr: string, cmdAction: CmdAction): void {
	// Get the stored "locked" value to tell if the door is locked.
	const locked = isLocked()

	// Check which command was used
	if (cmdAction.keyword == "lock") {
		if (locked) {
			// If the door is already locked, respond with a message.
			cmdAction.info("The door is already locked.")
		} else {
			// If the door is not locked, lock the door.
			lock()
			// Send a describe to the room to tell the door was locked.
			Room.describe(`${cmdAction.char.name} locks the door.`)
		}
	} else if (cmdAction.keyword == "unlock") {
		if (!locked) {
			// If the door is already unlocked, respond with a message.
			cmdAction.info("The door is already unlocked.")
		} else {
			// If the door is locked, unlock the door.
			unlock()
			// Send a describe to the room to tell the door is unlocked.
			Room.describe(`${cmdAction.char.name} unlocks the door.`)
		}
	}
}

// onMessage is called when the outside room activates and sends a request for
// this script to resend the current lock status.
export function onMessage(addr: string, topic: string, dta: string, sender: string): void {
	// Check if it is the "update" message from the outside room.
	if (topic == "update") {
		// Update the outside room with the current lock status.
		updateOutside()
	}
}

// onCharEvent is called when a character enters a room, leaves a room, or
// changes any of its properties while inside the room.
export function onCharEvent(addr: string, charId: string, after: string|null, before: string|null): void {
	// We want to check if the room is emptied of awake characters. To avoid
	// unnecessary calls to Room.charIterator (and to provide an example of
	// how to check the after and before values), we first validate that we
	// actually have a character leaving the room or falling asleep in it.
	// If not, we make a quick exit.
	if (!isCharAwakeInRoom(before) || isCharAwakeInRoom(after)) {
		return
	}

	// Create an iterator of awake characters in the room.
	const iterator = Room.charIterator(CharState.Awake)
	// If isValid returns true, the cursor is not at the end, which in turn
	// means we still have at least 1 awake character in the room.
	if (iterator.isValid()) {
		return
	}

	// No awake characters, so we unlock the room.
	unlock()
}
