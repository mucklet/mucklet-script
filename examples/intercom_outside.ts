/**
 * The intercom_outside.ts is a script that interacts with another room script,
 * intercom_inside.ts, to allow someone in the "inside" room to turn on the
 * intercom and let the characters speak with one another between the two rooms.
 *
 * While the intercom is active, all room events are passed to the inside room.
 */

// Post address to the inside room script. Replace this.
// To get a room script's address, type: roomscript <KEYWORD>
const inside = "room.cccccccccccccccccccc#dddddddddddddddddddd"

// Checks if the intercom is active (turned on).
function isActive(): boolean {
	// Get the stored "active" value to tell if the intercom is active.
	// Null means inactive while anything else means turned active
	return Store.getBuffer("active") != null
}

// onActivate is called when the script (not the intercom) is activated.
export function onActivate(): void {
	// Start listening to the inside room for when intercom status changes.
	Script.listen([inside])
	// Start listening to the room if the intercom is active.
	if (isActive()) {
		Room.listen()
	}
	// Post a request to the inside room to resend the current intercom status
	// just to make sure the rooms are synchronized.
	Script.post(inside, "update")
}

// onMessage is called when the inside room script sends a message to this
// script.
export function onMessage(addr: string, topic: string, dta: string): void {
	// Get the current active state of the intercom.
	const active = isActive()

	// If "on" is received, and the intercom was turned off, turn it on.
	if (topic == "on" && !active) {
		// Store a single byte as a way to tell the intercom is on.
		Store.setBuffer("active", new ArrayBuffer(1))
		// Start listening to events in this room to send to the inside room.
		Room.listen()
		// Send a describe to the room to tell the intercom turned on.
		Room.describe("A static sound is heard from a speaker as a red light turns on, indicating recording. ((Use `say` to speak with anyone inside.))")
	}

	// If "off" is received, and the intercom was turned on, turn it off.
	if (topic == "off" && active) {
		// Delete the stored byte to tell the intercom is turned off.
		Store.deleteKey("active")
		// Stop listening to events in this room.
		Room.unlisten()
		// Send a describe to the room to tell the intercom turned off.
		Room.describe("The speaker goes silent, and the red light fades out.")
	}

	// An "event" is sent from the inside room when someone inside said something.
	// If the intercom is active, show the event message for the room.
	if (topic == "event" && active) {
		// Make sure the data is a "say" event. The inside room script
		// shouldn't send any other event, but just to make sure.
		if (Event.getType(dta) == "say") {
			// Parse the json data into a Event.Say object.
			let say = JSON.parse<Event.Say>(dta)
			// Send a describe to the room with the say message.
			Room.describe(`${say.char.name} says through the speaker, "${say.msg}"`)
		}
	}
}

// onRoomEvent is called when an event occurs in this room while Room.listen is
// called, which is the case when the intercom is active.
export function onRoomEvent(addr: string, evjson: string): void {
	// Send the event to the inside room script.
	Script.post(inside, "event", evjson)
}
