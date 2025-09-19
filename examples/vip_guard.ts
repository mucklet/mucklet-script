/**
 * The vip_guard.ts is a script that prevents characters from using an exit
 * unless they are added to the VIP list that is kept by the vip_list.ts script.
 *
 * When a character tries to use the exit, a request is sent to vip_list.ts to
 * check whether or not they are VIP characters. The vip_guard.ts script and
 * vip_list.ts may (and should) be running in different rooms.
 */

// Post address to the vipList script. Replace this.
// To get a room script's address, type: roomscript <KEYWORD>
const vipListAddr = "room.aaaaaaaaaaaaaaaaaaaa#bbbbbbbbbbbbbbbbbbbb"

// ID of the exit to guard. Replace this.
// To get a room script's address, type: get exit <KEYWORD>
// The leading # should not be included.
const exitId = "aaaaaaaaaaaaaaaaaaaa"

export function onActivate(): void {
	// Always listen and intercept any use of the exit.
	Room.listenExit(exitId)
}

// onExitUse is called when someone tries to use the exit.
export function onExitUse(addr: string, exitAction: ExitAction): void {
	// Send a request to the vip_list.ts script. It waits until we receive a response.
	const response = Script.request(vipListAddr, "isVip", JSON.stringify(exitAction.charId))

	// Assert we didn't get an error response.
	if (response.isError()) {
		// We look the error for debugging purpose
		console.debug("Request error: " + response.error!)
		// We cancel the exit use attempt with a message.
		exitAction.cancel("The guard can't seem to find the VIP list.")
		return
	}

	// Parse the response. The vip_list.ts should have sent a boolean value.
	const isVip = response.parseResult<boolean>()
	if (isVip) {
		// We let the character use the exit.
		exitAction.useExit()
	} else {
		// We cancel the exit use attempt with a message.
		exitAction.cancel("The guard blocks your way as they cannot find you in the VIP list.")
	}
}
