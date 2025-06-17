import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'assert';
import { buildScript, resolvePath, mockGlobal } from './testutils.js';

const script = await buildScript(resolvePath(import.meta.url, 'room.test.ts'));

await describe('Room', async () => {

	beforeEach(() => {
		mockGlobal(global);
	});

	afterEach(() => {
		// Garbage collect after each test.
		script.__collect();
	});

	it('abortWithString aborts and throws error', () => {
		assert.throws(() => script.abortWithString());
	});

	it('roomDescribe calls room.describe', () => {
		assert.doesNotThrow(() => script.roomDescribe());
		assert.strictEqual(global.room.describe.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.describe.mock.calls[0].arguments, [ "foo" ]);
	});

	it('roomListen without arguments calls room.listen', () => {
		global.room.listen = mock.fn((instance) => true);
		assert.doesNotThrow(() => script.roomListen(true, null));
		assert.strictEqual(global.room.listen.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.listen.mock.calls[0].arguments, [ 0, null ]);
	});

	it('roomListen with instance calls room.listen', () => {
		global.room.listen = mock.fn((instance) => false);
		assert.doesNotThrow(() => script.roomListen(false, "instance"));
		assert.strictEqual(global.room.listen.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.listen.mock.calls[0].arguments, [ 0, 'instance' ]);
	});

	it('roomUnlisten without arguments calls room.unlisten', () => {
		global.room.unlisten = mock.fn((instance) => true);
		assert.doesNotThrow(() => script.roomUnlisten(true, null));
		assert.strictEqual(global.room.unlisten.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.unlisten.mock.calls[0].arguments, [ 0, null ]);
	});

	it('roomUnlisten with instance calls room.unlisten', () => {
		global.room.unlisten = mock.fn((instance) => false);
		assert.doesNotThrow(() => script.roomUnlisten(false, "instance"));
		assert.strictEqual(global.room.unlisten.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.unlisten.mock.calls[0].arguments, [ 0, 'instance' ]);
	});

	it('roomListenCharEvent without arguments calls room.listen', () => {
		global.room.listen = mock.fn((instance) => true);
		assert.doesNotThrow(() => script.roomListenCharEvent(true, null));
		assert.strictEqual(global.room.listen.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.listen.mock.calls[0].arguments, [ 1, null ]);
	});

	it('roomListenCharEvent with instance calls room.listen', () => {
		global.room.listen = mock.fn((instance) => false);
		assert.doesNotThrow(() => script.roomListenCharEvent(false, "instance"));
		assert.strictEqual(global.room.listen.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.listen.mock.calls[0].arguments, [ 1, 'instance' ]);
	});

	it('roomUnlistenCharEvent without arguments calls room.unlisten', () => {
		global.room.unlisten = mock.fn((instance) => true);
		assert.doesNotThrow(() => script.roomUnlistenCharEvent(true, null));
		assert.strictEqual(global.room.unlisten.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.unlisten.mock.calls[0].arguments, [ 1, null ]);
	});

	it('roomUnlistenCharEvent with instance calls room.unlisten', () => {
		global.room.unlisten = mock.fn((instance) => false);
		assert.doesNotThrow(() => script.roomUnlistenCharEvent(false, "instance"));
		assert.strictEqual(global.room.unlisten.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.unlisten.mock.calls[0].arguments, [ 1, 'instance' ]);
	});

	it('roomListenExit without arguments calls room.listenExit', () => {
		global.room.listenExit = mock.fn((instance) => true);
		assert.doesNotThrow(() => script.roomListenExit(true, null));
		assert.strictEqual(global.room.listenExit.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.listenExit.mock.calls[0].arguments, [ null ]);
	});

	it('roomListenExit with instance calls room.listenExit', () => {
		global.room.listenExit = mock.fn((instance) => false);
		assert.doesNotThrow(() => script.roomListenExit(false, "exitId"));
		assert.strictEqual(global.room.listenExit.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.listenExit.mock.calls[0].arguments, [ 'exitId' ]);
	});

	it('roomUnlistenExit without arguments calls room.unlistenExit', () => {
		global.room.unlistenExit = mock.fn((instance) => true);
		assert.doesNotThrow(() => script.roomUnlistenExit(true, null));
		assert.strictEqual(global.room.unlistenExit.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.unlistenExit.mock.calls[0].arguments, [ null ]);
	});

	it('roomUnlistenExit with instance calls room.unlistenExit', () => {
		global.room.unlistenExit = mock.fn((instance) => false);
		assert.doesNotThrow(() => script.roomUnlistenExit(false, "exitid"));
		assert.strictEqual(global.room.unlistenExit.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.unlistenExit.mock.calls[0].arguments, [ 'exitid' ]);
	});

});
