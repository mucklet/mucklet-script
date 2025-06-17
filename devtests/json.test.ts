// Event.Char
const charId = "aaaabbbbccccddddeeee"
const charName = "Jane"
const charSurname = "Doe"
const eventCharDta = `{"id":"${charId}","name":"${charName}","surname":"${charSurname}"}`
function assertEventChar(char: Event.Char): void {
	assert(char.id == charId, `expected char.id to be "${charId}", but got "${char.id}".`)
	assert(char.name == charName, `expected char.name to be "${charName}", but got "${char.name}".`)
	assert(char.surname == charSurname, `expected char.surname to be "${charSurname}", but got "${char.surname}".`)
}

// Event.Base
const baseId = "aaaaaaaaaaaaaaaaaaaa"
const baseType = "foo"
const baseTime = 1136210645000
const baseSig = "SIGNATUREAAABBBCCC"
const eventBaseDta = `{"id":"${baseId}","type":"${baseType}","time":${baseTime.toString()},"sig":"${baseSig}"}`
function assertEventBase(base: Event.Base): void  {
	assert(base.id == baseId, `expected base.id to be "${baseId}", but got "${base.id}".`)
	assert(base.type == baseType, `expected base.type to be "${baseType}", but got "${base.type}".`)
	assert(base.time == baseTime, `expected base.time to be ${baseTime.toString()}, but got ${base.time.toString()}.`)
	assert(base.sig == baseSig, `expected base.sig to be "${baseSig}", but got "${base.sig}".`)
}

// Event.BaseCharMsg
const baseMsg = "Lorem ipsum"
const eventBaseCharMsgDta = `{"id":"${baseId}","type":"${baseType}","time":${baseTime.toString()},"sig":"${baseSig}","msg":"${baseMsg}","char":${eventCharDta}}`
const eventBaseCharMsgDtaCharBeforeMsg = `{"char":${eventCharDta},"id":"${baseId}","type":"${baseType}","time":${baseTime.toString()},"sig":"${baseSig}","msg":"${baseMsg}"}`
function assertEventBaseCharMsg(baseCharMsg: Event.BaseCharMsg): void  {
	assertEventBase(baseCharMsg as Event.Base)
	assertEventChar(baseCharMsg.char)
	assert(baseCharMsg.msg == baseMsg, `expected baseCharMsg.msg to be "${baseMsg}", but got "${baseCharMsg.msg}".`)
}


export function jsonParseEventChar(): void {
	// assertEventChar(JSON.parse<Event.Char>(eventCharDta))
}

export function jsonParseEventBase(): void {
	assertEventBase(JSON.parse<Event.Base>(eventBaseDta))
}

export function jsonParseEventBaseCharMsg(): void {
	// assertEventBaseCharMsg(JSON.parse<Event.BaseCharMsg>(eventBaseCharMsgDta))
}

export function jsonParseEventBaseCharMsgCharBeforeMsg(): void {
	// assertEventBaseCharMsg(JSON.parse<Event.BaseCharMsg>(eventBaseCharMsgDtaCharBeforeMsg))
}

export function eventGetTypeBaseCharMsg(): void {
	// const t = Event.getType(eventBaseCharMsgDta)
	// assert(t == baseType, `expected base.type to be "${baseType}", but got "${t}".`)
}

export function jsonParseEventSay(): void {
	// assertEventBaseCharMsg(JSON.parse<Event.Say>(eventBaseCharMsgDtaCharBeforeMsg))
}
