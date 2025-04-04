/**
 * The lock_outside.ts is a script that interacts with another room script,
 * lock_inside.ts, to allow someone in the "inside" room to lock and unlock the
 * door so that the exit leading from the "outside" room to the "inside" room
 * may not be used while locked.
 */

// Post address to the inside room script. Replace this.
// To get a room script's address, type: roomscript <KEYWORD>
const inside = "room.aaaaaaaaaaaaaaaaaaaa#bbbbbbbbbbbbbbbbbbbb"

// ID of the exit to lock/unlock. Replace this.
// To get a room script's address, type: get exit <KEYWORD>
// The leading # should not be included.
const exitId = "aaaaaaaaaaaaaaaaaaaa"

export function onActivate(): void {
	// Start listening to the inside room for when lock status changes.
	Script.listen([inside])
	// Post a request to the inside room to resend the current locked status.
	Script.post(inside, "update")
}

// onMessage is called when the inside room script sends the current lock
// status. The topic will be either "locked" or "unlocked".
export function onMessage(addr: string, topic: string, dta: string, sender: string): void {
	if (topic == "locked") {
		// When locked, we listen and intercept any use of the exit.
		Room.listenExit(exitId)
	}
	if (topic == "unlocked") {
		// When unlocked, we don't listen and intercept the use of the exit,
		// making it behave like an ordinary exit.
		Room.unlistenExit(exitId)
	}
}

// onExitUse is called when someone tries to use the exit. It will only be
// called if `Room.listenExit` has been called prior to the event.
export function onExitUse(addr: string, exitAction: ExitAction): void {
	// We cancel the exit use attempt with a message.
	exitAction.cancel("The door seems to be locked.")
}
