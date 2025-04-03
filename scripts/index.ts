// Your Mucklet room script file.
// Go ahead and edit it!

/**
 * onActivate is called each time a script is activated or updated. It is
 * primarily used to call `Room.listen` or `Script.listen`, to have the script
 * listening for events or messages.
 *
 * When a script is updated, previous listeners (e.g. `Room.listen` or
 * `Script.listen`) or scheduled posts (`Script.post` with delay), will be
 * removed, and `onActivate()` will be called again on the new script version.
 *
 * Not required. Can be remove if not used.
 */
export function onActivate(): void {
	Room.describe("Hello, world!");
	console.log("Hello, console!");
}

/**
 * onRoomEvent is called when an event occurs in the room, such as a 'say',
 * 'arrive', or 'sleep'. It requires that `Room.listen()` has been called
 * earlier, usually in the `onActivate()` function.
 *
 * Not required. Can be remove if not used.
 *
 * @example
 * Check the event type and decode the event:
 * ```
 * export function onRoomEvent(addr: string, ev: string): void {
 *     const eventType = Event.getType(ev);
 *     if (eventType == 'say') {
 *         const say = JSON.parse<Event.Say>(ev);
 *         // Handle the say event
 *     }
 * }
 * ```
 *
 * @param addr - Address of this script instance receiving the event.
 * @param ev - Event encoded as a json string.
 */
export function onRoomEvent(
	addr: string,
	ev: string,
): void {
	// Handle the json encoded event
}

/**
 * onMessage is called when another script sends a message to this script, using
 * `Script.post()`. It requires that `Script.listen()` has been called earlier,
 * usually in the `onActivate()` function.
 *
 * Not required. Can be remove if not used.
 *
 * @param addr - Address of this script instance receiving the message.
 * @param topic - Topic of the message. Determined by the sender.
 * @param data - JSON encoded data of the message or null. Determined by the sender.
 * @param sender - Address of the sending script instance.
 */
export function onMessage(
	addr: string,
	topic: string,
	data: string | null,
	sender: string,
): void {
	// Handle the message and the JSON encoded data
}

/**
 * onCharEvent is called when a character enters a room, leaves a room, or
 * changes any of its properties while inside the room. It requires that
 * `Room.listenCharEvent()` has been called earlier, usually in the
 * `onActivate()` function.
 *
 * Not required. Can be remove if not used.
 *
 * @example
 * Output to log when a character arrives or leaves:
 * ```
 * export function onCharEvent(addr: string, charId: string, after: string|null, before: string|null): void {
 *     if (after == null && before != null) {
 *         // If after is null, the character left
 *         const char = JSON.parse<Room.Char>(before);
 *         console.log(`${char.name} left.`)
 *     }
 *     if (before == null && after != null) {
 *         // If before is null, the character arrived
 *         const char = JSON.parse<Room.Char>(after);
 *         console.log(`${char.name} arrived.`)
 *     }
 * }
 * ```
 *
 * @param addr - Address of this script instance receiving the event.
 * @param charId - ID of character.
 * @param after - Character state after the event encoded as a json string, or
 * null if the character left the room.
 * @param before - Character state before the event encoded as a json string, or
 * null if the character entered the room.
 */
export function onCharEvent(
	addr: string,
	charId: string,
	after: string | null,
	before: string | null,
): void {
	// Handle the json encoded event
}

/**
 * onExitUse is called when a character tries to use an exit. It requires that
 * `Room.listenExit()` has been called earlier, usually in the `onActivate()`
 * function. The script should call either `exitAction.cancel` or
 * `exitAction.useExit` to determine what should happen. If neither method is
 * called, the action will timeout after 1 second, automatically canceling the
 * exit use with a default message.
 *
 * Not required. Can be remove if not used.
 *
 * @example
 * Prevent anyone from using an exit:
 * ```
 * export function onExitUse(addr: string, exitAction: ExitAction): void {
 *     exitAction.cancel("The door seems to be locked.");
 * }
 * ```
 *
 * @param addr - Address of this script instance receiving the event.
 * @param exitAction - Exit action object.
 */
export function onExitUse(
	addr: string,
	exitAction: ExitAction,
): void {
	// Handle the intercepted exit action
}

/**
 * onCommand is called when a character uses a custom command. It requires that
 * `Room.addCommand` has been called earlier to register the command, usually in
 * the `onActivate()` function. The script may send a response to the caller
 * using either `cmdAction.info` or `cmdAction.error`, but it is not
 * required. The response must be sent within 1 second from the call.
 *
 * Not required. Can be remove if not used.
 *
 * @example
 * Adds a "send ping" command that responds with an info message:
 * ```
 * export function onActivate(): void {
 *     Room.addCommand("ping", new Command("send ping", "Sends a ping to the script.");
 * }
 *
 * export function onCommand(addr: string, cmdAction: CmdAction): void {
 *     cmdAction.info("Pong!");
 * }
 * ```
 *
 * @param addr - Address of this script instance receiving the action.
 * @param cmdAction - Command action object.
 */
export function onCommand(
	addr: string,
	cmdAction: CmdAction,
): void {
	// Handle the command
}
