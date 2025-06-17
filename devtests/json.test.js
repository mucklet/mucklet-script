import { describe, it, afterEach } from 'node:test';
import assert from 'assert';
import { buildScript, resolvePath } from './testutils.js';

const script = await buildScript(resolvePath(import.meta.url, 'json.test.ts'));

await describe('JSON', async () => {

	afterEach(() => {
		// Garbage collect after each test.
		script.__collect();
	});

	it('jsonParseEventChar parses an Event.Char json structure', () => {
		assert.doesNotThrow(() => script.jsonParseEventChar());
	});

	it('jsonParseEventBase parses an Event.Base json structure', () => {
		assert.doesNotThrow(() => script.jsonParseEventBase());
	});

	it('jsonParseEventBaseCharMsg parses an Event.BaseCharMsg json structure', () => {
		assert.doesNotThrow(() => script.jsonParseEventBaseCharMsg());
	});

	it('jsonParseEventBaseCharMsgCharBeforeMsg parses an Event.BaseCharMsg json structure with char appearing before msg', () => {
		assert.doesNotThrow(() => script.jsonParseEventBaseCharMsgCharBeforeMsg());
	});

	it('eventGetTypeBaseCharMsg calls Event.getType on a Event.BaseCharMsg json structure', () => {
		assert.doesNotThrow(() => script.eventGetTypeBaseCharMsg());
	});

	it('jsonParseEventSay parses an Event.Say json structure', () => {
		assert.doesNotThrow(() => script.jsonParseEventSay());
	});

});
