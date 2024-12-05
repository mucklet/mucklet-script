// @ts-nocheck
export declare namespace Room {

	@external("env", "room.listen")
	export function listen(type: i32, instance: string | null): void

	@external("env", "room.unlisten")
	export function unlisten(type: i32, instance: string | null): void

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

	@external("env", "room.charIterator")
	export function charIterator(state: i32, reverse: boolean): i32

	@external("env", "room.getChar")
	export function getChar(charId: string): string | null

	@external("env", "room.exitIterator")
	export function exitIterator(): i32

	@external("env", "room.getExit")
	export function getExit(exit: string, byKey: boolean): string | null

	@external("env", "room.getExitOrder")
	export function getExitOrder(): string[]

	@external("env", "room.setExit")
	export function setExit(exitId: string, json: string): void
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
	@external("env", "store.readOnly")
	export function readOnly(): void

	@external("env", "store.setItem")
	export function setItem(key: ArrayBuffer, item: ArrayBuffer | null): void

	@external("env", "store.getItem")
	export function getItem(key: ArrayBuffer): ArrayBuffer | null

	@external("env", "store.totalBytes")
	export function totalBytes(): i64

	@external("env", "store.newIterator")
	export function newIterator(prefix: ArrayBuffer | null, reverse: bool): i32
}

export declare namespace Iterator {
	@external("env", "iterator.close")
	export function close(iterator: i32): void

	@external("env", "iterator.seek")
	export function seek(iterator: i32, key: ArrayBuffer | null): void

	@external("env", "iterator.next")
	export function next(iterator: i32): void

	@external("env", "iterator.valid")
	export function valid(iterator: i32, prefix: ArrayBuffer | null): boolean

	@external("env", "iterator.key")
	export function key(iterator: i32): ArrayBuffer

	@external("env", "iterator.value")
	export function value(iterator: i32): ArrayBuffer
}
