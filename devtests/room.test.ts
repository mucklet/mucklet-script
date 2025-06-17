export function abortWithString(): void {
	abort("foo error", "room.test.js", 2, 1)
}

export function roomDescribe(): void {
	Room.describe("foo")
}

export function roomListen(expected: boolean, instance: string | null = null): void {
	const returnValue = Room.listen(instance)
	assert(returnValue == expected, `expected return value to be ${expected.toString()}, but got ${returnValue.toString()}.`)
}

export function roomUnlisten(expected: boolean, instance: string | null = null): void {
	const returnValue = Room.unlisten(instance)
	assert(returnValue == expected, `expected return value to be ${expected.toString()}, but got ${returnValue.toString()}.`)
}

export function roomListenCharEvent(expected: boolean, instance: string | null = null): void {
	const returnValue = Room.listenCharEvent(instance)
	assert(returnValue == expected, `expected return value to be ${expected.toString()}, but got ${returnValue.toString()}.`)
}

export function roomUnlistenCharEvent(expected: boolean, instance: string | null = null): void {
	const returnValue = Room.unlistenCharEvent(instance)
	assert(returnValue == expected, `expected return value to be ${expected.toString()}, but got ${returnValue.toString()}.`)
}

export function roomListenExit(expected: boolean, exitId: string | null = null): void {
	const returnValue = Room.listenExit(exitId)
	assert(returnValue == expected, `expected return value to be ${expected.toString()}, but got ${returnValue.toString()}.`)
}

export function roomUnlistenExit(expected: boolean, exitId: string | null = null): void {
	const returnValue = Room.unlistenExit(exitId)
	assert(returnValue == expected, `expected return value to be ${expected.toString()}, but got ${returnValue.toString()}.`)
}
