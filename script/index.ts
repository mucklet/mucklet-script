// Your Mucklet room script file.
// Go ahead and edit it!

/**
 * init is called each time a script is activated or updated. It is primarily
 * used to call `Room.listen` or `Script.listen`, to have the script listening
 * for events or messages.
 *
 * When a script is updated, previous listeners (`Room.listen` or
 * `Script.listen`) or scheduled posts (`Script.post` with delay), will be
 * removed, and init() will be called again on the new script version.
 *
 * Not required. Can be remove if not used.
 */
export function init(): void {
	Room.describe("Hello, world!");
}

/**
 * onRoomEvent is called when an event occurs in the room, such as a 'say',
 * 'arrive', or 'sleep'. It requires that `Room.listen()` has been called
 * earlier, usually in the init() function.
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
export function onRoomEvent(addr: string, ev: string): void {
	// Handle the json encoded event
}

/**
 * onMessage is called when another script sends a message to this script, using
 * Script.post(). It requires that `Script.listen()` has been called earlier,
 * usually in the init() function.
 *
 * Not required. Can be remove if not used.
 *
 * @param addr - Address of this script instance receiving the message.
 * @param topic - Topic of the message. Determined by the sender.
 * @param data - JSON encoded data of the message or null. Determined by the sender.
 * @param sender - Address of the sending script instance.
 */
export function onMessage(addr: string, topic: string, data: string | null, sender: string): void {
	// Handle the message and the JSON encoded data
}
