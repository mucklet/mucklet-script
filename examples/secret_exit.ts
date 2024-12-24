/**
 * The script controls a secret exit behind a painting that requires a password
 * to be spoken in order for it to appear. The exit will disappear again 2
 * minutes after the password was spoken.
 *
 * To show the exit:
 * ```
 * say tapeworm
 * ```
 */

// ID of the exit to control. Replace this.
// To get a room script's address, type: get exit <KEYWORD>
// The leading # should not be included.
const exitId = "aaaaaaaaaaaaaaaaaaaa"
// Password that triggers the exit to show.
const password = "tapeworm"
// Duration to keep the exit open since the password was spoken (milliseconds).
const openDuration = 2 * 60 * 1000 // 2 minutes

// The store key used for the schedule ID for when we are to close the exit.
const storeKey = "scheduleId"
// Topic to use for the post message to close the exit.
const postTopic = "close"

// Sets the inactive flag on the exit. When inactive, the exit will be hidden.
function setExitInactive(isInactive: boolean): void {
	Room.setExit(exitId, new Map<string, boolean>().set("inactive", isInactive))
}

export function onActivate(): void {
	// Start listening to any room events to catch someone saying the password.
	Room.listen()

	// When a script is deactivate/updated, any previous scheduled post is
	// automatically removed. For simplicity's sake, we initialize the script by
	// closing the exit and deleting any old remnants from the store.
	setExitInactive(true)
	Store.deleteKey(storeKey)
}

// onRoomEvent is called when an event occurs in this room.
export function onRoomEvent(addr: string, ev: string): void {
	// Quick exit if it isn't a "say" event
	if (Event.getType(ev) != "say") {
		return
	}

	// Parse the say event.
	const say = JSON.parse<Event.Say>(ev)

	// Exit if it isn't the password.
	if (say.msg.toLowerCase() != password) {
		return
	}

	// Get the stored "scheduleId" value to tell if the exit is showing.
	// Null means the exit is not showing.
	let scheduleId = Store.getString(storeKey);

	if (scheduleId != null) {
		// Cancel previously scheduled post in order to reschedule it.
		Script.cancelPost(scheduleId);
		// Send a describe to the room to tell the exit remains open.
		Room.describe("The painting remains open.")
	} else {
		// Send a describe to the room to tell the exit has opened.
		Room.describe("The painting swings open to reveal a passage behind it.")
	}

	// Show the exit.
	setExitInactive(false)
	// Schedule a message to close the exit. It will be handled by onMessage.
	// The "#" is a shortcut for the script instance's own address.
	scheduleId = Script.post("#", postTopic, null, openDuration)
	// Store the scheduleId to allow rescheduling and to indicate exit is open.
	if (scheduleId != null) {
		Store.setString(storeKey, scheduleId!)
	}
}

// onMessage is called when it is time to close the post.
export function onMessage(addr: string, topic: string, dta: string, sender: string): void {
	// No need to validate the topic since we don't listen for post from
	// anywhere else. We can safely assume it is the close message.

	// Remove the scheduled ID from the store.
	Store.deleteKey(storeKey)
	// Close the exit.
	setExitInactive(true)
	// Send a describe to the room to tell the exit has closed.
	Room.describe("The painting closes to hide the passage behind it.")
}
