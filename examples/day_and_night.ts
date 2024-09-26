/**
 * This script switches between a "day" and "night" profile when the UTC date
 * passes past two set hour constants, `daybreak` and `nightfall`.
 *
 * Once the profile is set, the script posts a delayed message to itself for
 * next time the profile should be changed.
 */

const daybreak = 8 // 08:00 UTC time
const nightfall = 20 // 20:00 UTC time

export function init(): void {
	setProfile()
}

export function onMessage(addr: string, topic: string, data: string | null, sender: string): void {
	// When the "change" message is received, call setProfile() again to change
	// the profile and create a new delayed post.
	if (topic == "change") {
		setProfile()
	}
}

/**
 * Uses the profile "day" or "night" depending on the current time, and then
 * makes a delayed Script.post for next time the profile should be changed.
 */
function setProfile(): void {
	// Get current time as a UNIX timestamp in milliseconds.
	const now = Date.now()
	// Use the profile based on if the current time is during the day or night.
	Room.useProfile(isDay(now, daybreak, nightfall) ? "day" : "night")
	// Calculate next time the profile should be changed.
	const next = nextChange(now, daybreak, nightfall)
	// Create a post to self ("#" is a shortcut for the script instance's own
	// address), and delay it till next profile change.
	// Self-posts does not require a call to Script.listen - a script can always
	// post to itself.
	Script.post("#", "change", null, next - now)
}

/**
 * isDay returns true if the time is between the dayHour and nightHour.
 * @param time - The time to base calculations on.
 * @param dayHour - The hour (0-23) when night switches to day. Must be smaller than nightHour.
 * @param nightHour - The hour (0-23) when day switches to night. Must be greather than dayHour.
 */
function isDay(time: i64, dayHour: i32, nightHour: i32): bool {
	const hours = new Date(time).getUTCHours()
	return hours >= dayHour && hours < nightHour
}

/**
 * nextChange calculates when the next switch to day or night might be.
 * @param time - The time to base calculations on.
 * @param dayHour - The hour (0-23) when night switches to day. Must be smaller than nightHour.
 * @param nightHour - The hour (0-23) when day switches to night. Must be greather than dayHour.
 */
function nextChange(time: i64, dayHour: i32, nightHour: i32): i64 {
	const t = new Date(time)
	let date = t.getUTCDate()
	let hours = t.getUTCHours()

	// Keep it as day between 08:00 - 22:00 UTC time
	if (hours >= dayHour && hours < nightHour) {
		hours = nightHour;
	} else {
		// If we haven't passed midnight, the next day will be the next day.
		if (hours >= nightHour) {
			date++;
		}
		hours = dayHour;
	}

	return Date.UTC(
		t.getUTCFullYear(),
		t.getUTCMonth(),
		date,
		hours,
		0, // Minutes
		0, // Seconds
		0, // Milliseconds
	)
}
