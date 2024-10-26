/**
 * The intercom_inside.ts is a script that interacts with another room script,
 * intercom_outside.ts, to allow someone in the "inside" room to turn on the
 * intercom and let the characters speak with one another between the two rooms.
 *
 * To turn on the intercom:
 * ```
 * say on
 * ```
 *
 * To turn off the intercom:
 * ```
 * say off
 * ```
 *
 * Only "say" events are passed to the outside room. Other events, such as pose
 * or OOC, are ignored.
 */

// Post address to the outside room script. Replace this.
// To get a room script's address, type: roomscript <KEYWORD>
const outside = "room.aaaaaaaaaaaaaaaaaaaa#bbbbbbbbbbbbbbbbbbbb"

export function onActivate(): void {
	// Start listening to any room events to catch "on" or "off" commands.
	Room.listen()
	// Start listening to messages from the outside room script.
	Script.listen([outside])
}

// onRoomEvent is called when an event occurs in this room.
export function onRoomEvent(addr: string, ev: string): void {
	// Quick exit if it isn't a "say" event
	if (Event.getType(ev) != "say") {
		return
	}

	// Get the stored "active" value to tell if the intercom is turned on.
	// Null means turned off while anything else means turned on.
	const active = Store.getBuffer("active") != null;
	// Parse the say event.
	const say = JSON.parse<Event.Say>(ev)

	if (say.msg.toLowerCase() == "on" && !active) {
		// If someone said "on" and the intercom was not active, turn it on.

		// Post an "on" message to the room script outside.
		Script.post(outside, "on")
		// Store a single byte as a way to tell the intercom is on.
		Store.setBuffer("active", new ArrayBuffer(1))
		// Send a describe to the room to tell the intercom turned on.
		Room.describe("The intercom speaker light turns on.")
	} else if (say.msg.toLowerCase() == "off" && active) {
		// If someone said "off" and the intercom was active, turn it off.

		// Post an "off" message to the room script outside.
		Script.post(outside, "off")
		// Delete the stored byte to tell the intercom is turned off.
		Store.deleteKey("active")
		// Send a describe to the room to tell the intercom turned off.
		Room.describe("The intercom turns off.")
	} else if (active) {
		// If the intercom is active, send the event to the outside room script.
		Script.post(outside, "event", ev)
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
		if (Event.getType(dta) == "say" && Store.getBuffer("active") != null) {
			// Parse the json data into a Event.Say object.
			let ev = JSON.parse<Event.Say>(dta)
			// Send a describe to the room with the say message.
			Room.describe(`**${ev.char.name}** says through the speaker, "${ev.msg}"`)
		}
	}
}
