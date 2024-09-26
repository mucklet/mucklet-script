/**
 * This script shows some ambient room descriptions at a random intervals
 * between the `minDelay` and `maxDelay` constants.
 */

const minDelay = 5 * 60 * 1000 // 5 minutes in milliseconds
const maxDelay = 30 * 60 * 1000 // 30 minutes in milliseconds

const messages = [
	"A bird chirps from a nearby tree.",
	"A gentle breeze makes some leaves twirl across the path.",
	"The leaves of the trees rustle soothingly.",
]

export function init(): void {
	// Initialize the script by scheduling the first message. On script update
	// or deactivation, any previous scheduled postsare deleted.
	scheduleNext()
}

export function onMessage(addr: string, topic: string, data: string | null, sender: string): void {
	// The topic will always be "showMessage" since we listen to no other
	// script. But we still check it for good measure.
	if (topic == "showMessage") {
		// Randomly select one of the messages.
		const msg = messages[i32(Math.floor(Math.random() * messages.length))]
		// Show the message to the room.
		Room.describe(msg)
		// Schedule a post for next time to show a message.
		scheduleNext()
	}
}

/**
 * Schedules a message to be posted in a duration between `minDelay` and
 * `maxDelay`.
 */
function scheduleNext(): void {
	// Randomize a delay value between between minDelay and maxDelay.
	const delay = i64(Math.floor(Math.random() * (maxDelay - minDelay))) + minDelay
	// Create a post to self ("#" is a shortcut for the script instance's own
	// address), using the calculated delay.
	// Self-posts does not require a call to Script.listen - a script can always
	// post to itself.
	Script.post("#", "showMessage", null, delay)
}
