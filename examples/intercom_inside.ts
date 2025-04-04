/**
 * The intercom_inside.ts is a script that interacts with another room script,
 * intercom_outside.ts, to allow someone in the "inside" room to turn on the
 * intercom and let the characters speak with one another between the two rooms.
 *
 * The script adds two commands to the room:
 * ```
 * turn on intercom
 * turn off intercom
 * ```
 *
 * Only "say" events are passed to the outside room. Other events, such as pose
 * or OOC, are ignored.
 */

// Post address to the outside room script. Replace this.
// To get a room script's address, type: roomscript <KEYWORD>
const outside = "room.aaaaaaaaaaaaaaaaaaaa#bbbbbbbbbbbbbbbbbbbb"

const onHelp = "Turns on the intercom to let you speak with characters outside.\nThe intercom only relays `say` messages."
const offHelp = "Turns off the intercom."

// Checks if the intercom is active (turned on).
function isActive(): boolean {
	// Get the stored "active" value to tell if the intercom is active.
	// Null means inactive while anything else means turned active
	return Store.getBuffer("active") != null
}

// Updates the outside room by sending an "on" or "off" message.
function updateOutside(): void {
	Script.post(outside, isActive() ? "on" : "off")
}

// onActivate is called when the script (not the intercom) is activated.
export function onActivate(): void {
	// Add the "turn on intercom" and "turn off intercom" commands.
	// Priority (20 and 10) is used to sort "on" before "off".
	Room.addCommand("on", new Command("turn on intercom", onHelp), 20)
	Room.addCommand("off", new Command("turn off intercom", offHelp), 10)
	// Start listening to messages from the outside room script.
	Script.listen([outside])
	// Update the outside room with the current intercom status.
	updateOutside()
	// If intercom is active, start listening to room events.
	if (isActive()) {
		Room.listen()
	}
}

// onRoomEvent is called when an event occurs in this room.
export function onRoomEvent(addr: string, ev: string): void {
	// Post "say" events to the outside room. We only listen to room events when
	// the intercom is active.
	if (Event.getType(ev) == "say") {
		Script.post(outside, "event", ev)
	}
}

// onCommand is called when a characters uses a script command.
export function onCommand(addr: string, cmdAction: CmdAction): void {
	// Get the current active state of the intercom.
	const active = isActive()

	// Check which command was used
	if (cmdAction.keyword == "on") {
		if (active) {
			// If the intercom is already activated, respond with a message.
			cmdAction.info("The intercom is already turned on.")
		} else {
			// Start listening to the room.
			Room.listen()
			// Post an "on" message to the room script outside.
			Script.post(outside, "on")
			// Store a single byte as a way to tell the intercom is active.
			Store.setBuffer("active", new ArrayBuffer(1))
			// Send a describe to the room to tell the intercom was activated.
			Room.describe(`${cmdAction.char.name} turns on the intercom. The red speaker indicator lights up.`)
		}
	} else if (cmdAction.keyword == "off") {
		if (!active) {
			// If the intercom is already deactivated, respond with a message.
			cmdAction.info("The intercom is already turned off.")
		} else {
			// Stop listening to the room.
			Room.unlisten()
			// Post an "off" message to the room script outside.
			Script.post(outside, "off")
			// Delete the stored byte to tell the intercom is not active.
			Store.deleteKey("active")
			// Send a describe to the room to tell the intercom was deactivated.
			Room.describe(`${cmdAction.char.name} turns off the intercom and the red light fades out.`)
		}
	}
}

// onMessage is called when the outside room script sends a message to this
// script.
export function onMessage(addr: string, topic: string, dta: string, sender: string): void {
	// If received an event from the outside room.
	if (topic == "event") {
		// If the received event is a "say", and the intercom is active. The
		// outside room may send event other too, but we are currently just
		// handling "say". But it can be extended to show a different message on
		// "pose" or similar.
		if (Event.getType(dta) == "say" && isActive()) {
			// Parse the json data into a Event.Say object.
			let ev = JSON.parse<Event.Say>(dta)
			// Send a describe to the room with the say message.
			Room.describe(`${ev.char.name} says through the speaker, "${ev.msg}"`)
		}
	}

	// Check if it is the "update" message from the outside room.
	if (topic == "update") {
		// Update the outside room with the current intercom status.
		updateOutside()
	}
}
