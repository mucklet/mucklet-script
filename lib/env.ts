// @ts-nocheck
export declare namespace Room {
	@external("env", "room.listen")
	export function listen(instance: string | null): void

	@external("env", "room.unlisten")
	export function unlisten(instance: string | null): void

	@external("env", "room.describe")
	export function describe(msg: string): void

	@external("env", "room.getRoom")
	export function getRoom(): string

	@external("env", "room.setRoom")
	export function setRoom(json: string): void

	@external("env", "room.useProfile")
	export function useProfile(key: string, safe: boolean): void

	@external("env", "room.sweepChar")
	export function sweepChar(charId: string, msg: string | null): void

	@external("env", "room.canEdit")
	export function canEdit(charId: string): boolean
}

export declare namespace Script {
	@external("env", "script.post")
	export function post(addr: string, topic: string, data: string | null, delay: i64): void

	@external("env", "script.listen")
	export function listen(addrs: string[] | null): void

	@external("env", "script.unlisten")
	export function unlisten(addrs: string[] | null): void
}

export declare namespace Store {
	@external("env", "store.setItem")
	export function setItem(key: ArrayBuffer, item: ArrayBuffer | null): void

	@external("env", "store.getItem")
	export function getItem(key: ArrayBuffer): ArrayBuffer | null

	@external("env", "store.totalBytes")
	export function totalBytes(): i64

	@external("env", "store.newIterator")
	export function newIterator(prefix: ArrayBuffer | null, reverse: bool): i32

	@external("env", "store.iteratorClose")
	export function iteratorClose(iterator: i32): void

	@external("env", "store.iteratorSeek")
	export function iteratorSeek(iterator: i32, key: ArrayBuffer | null): void

	@external("env", "store.iteratorNext")
	export function iteratorNext(iterator: i32): void

	@external("env", "store.iteratorValid")
	export function iteratorValid(iterator: i32, prefix: ArrayBuffer | null): boolean

	@external("env", "store.iteratorKey")
	export function iteratorKey(iterator: i32): ArrayBuffer

	@external("env", "store.iteratorItem")
	export function iteratorItem(iterator: i32): ArrayBuffer
}
