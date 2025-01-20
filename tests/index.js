import * as script from '../build/script.js';
import assert from 'assert';
import { describe, it, mock, beforeEach, afterEach } from 'node:test';

beforeEach(() => {
	const room = { id: "c2d1ml0t874bj4eva85g", name: "Carpentry Cabin" };
	const iterator = 0;
	// Mock host binding functions. For functions that returns a value (such as
	// room.getRoom, or store.getItem), you can have tests replace the mock
	// function with another mock function returning a different value.
	global.room = {
		describe: mock.fn((msg) => {}),
		listen: mock.fn((instance) => {}),
		unlisten: mock.fn((instance) => {}),
		getRoom: mock.fn(() => JSON.stringify(room)),
		setRoom: mock.fn((json) => {}),
		useProfile: mock.fn((key, safe) => {}),
		sweepChar: mock.fn((charId, msg) => {}),
		canEdit: mock.fn((charId) => true),
	};
	global.script = {
		post: mock.fn((addr, topic, data, delay) => {}),
		listen: mock.fn((addrs) => {}),
		unlisten: mock.fn((addrs) => {}),
	};
	global.store = {
		setItem: mock.fn((key, item) => {}),
		getItem: mock.fn((key) => null),
		totalBytes: mock.fn(() => 0),
		newIterator: mock.fn((prefix, reverse) => iterator++),
		iteratorClose: mock.fn((iterator) => {}),
		iteratorSeek: mock.fn((iterator, key) => {}),
		iteratorNext: mock.fn((iterator) => {}),
		iteratorValid: mock.fn((iterator, prefix) => false),
		iteratorKey: mock.fn((iterator) => new ArrayBuffer(1)),
		iteratorItem: mock.fn((iterator) => new ArrayBuffer(1)),
	};
});
afterEach(() => {
	// Garbage collect after each test.
	script.__collect();
});

describe('Script onActivate', () => {
	it('calls room describe with greeting', () => {
		assert(typeof script.onActivate == 'function');
		assert.doesNotThrow(() => script.onActivate());
		assert.strictEqual(global.room.describe.mock.callCount(), 1);
		assert.deepStrictEqual(global.room.describe.mock.calls[0].arguments, [ "Hello, world!" ]);
	});
});

describe('Script onRoomEvent', () => {
	it('does not throw an error on say event', () => {
		assert(typeof script.onRoomEvent == 'function');
		assert.doesNotThrow(() => script.onRoomEvent("addr", `{"type":"say","char":{"name":"John","surname":"Doe"},"msg":"Hello!"}`));
	});
});

describe('Script onMessage', () => {
	it('does not throw an error', () => {
		assert(typeof script.onMessage == 'function');
		assert.doesNotThrow(() => script.onMessage("addr", "topic", `{"foo":"bar"}`, "sender"));
	});
});
