# Custom Commands

Room scripts may add custom commands that can be used by characters in that room.

**Example adding a custom command and responding to use:**

```typescript
export function onActivate(): void {
	// Add a command, "push button", with keyword "pushButton".
	Room.addCommand("pushButton", new Command("push button"))
}

export function onCommand(addr: string, cmdAction: CmdAction): void {
	// Check if the keyword matches the command (in case we have added multiple commands).
	if (cmdAction.keyword == "pushButton") {
		Room.describe(cmdAction.char.name + " pushed the button!")
	}
}
```

## Command pattern
A command _pattern_ is the text string passed to the `Command` constructor:
```typescript
new Command("this is a pattern")
```

The pattern may contain:
* Words - Strings consisting of letters (a-z) or numbers (0-9). Consequtive words are separated with space. Words are lower cased.
* Symbols - Any ascii character that is not a letter or number. Reserved symbols must be escaped with backslash (e.g. `\<`).
* Field tags - A section inside `<` and `>` characters (e.g. `<Message>`)

The pattern may NOT contain:
* Any non-ascii character. All code points must within the range 32 to 126.
* Any reserved symbol: `(`, `)`, `{`, `}`, `<`, `>`, `[`, `]`, `\`, `/`, `|`, `&`

The pattern may NOT start with:
* A field tag - e.g. `<Character> rules`
* A symbol - e.g. `! <Message>`

Examples:

**Good** ✅
```text
push button
whitelist <Character>
add bulletin <Keyword> : <Title> = <Message>
```
**Bad** ❌
```json
välj rödräv  // Non-ascii characters
<Msg> this   // Starts with a tag
?<Question>  // Starts with a symbol
```

> ### Note
>
> It is allowed to use patterns matching existing client commands. However, the client will require that the player prefixes the commands with the word `do` to prevent conflict.
>
> For the following command:
> ```typescript
> Room.addCommand("mySay", new Command("say hi"))
> ```
> The user must type:
> ```text
> do say hi
> ```


## Field types

Each `<Field>` must have a field definition, explaining what type of field it is:
```typescript
new Command("send <Message>", "Sends a message to all rooms in the area.")
	.field("Message", new Field.Text("The message to send.")
		.setSpanLines(true)
		.setMaxLength(200)
	)
```

There existing types are:
Field type | Description
--- | ---
`Field.Bool`    | Boolean value. May be either _yes_ (true) or _no_ (false).
`Field.Char`    | Character name. May be configured to specify if there character must be awake/asleep and/or in the room.
`Field.Float`   | Decimal number. May be configured with a min/max range.
`Field.Integer` | Whole number. May be configured with min and max value.
`Field.Keyword` | A keyword that uses a limited set of characters that is lower cased. May be configured to exclude space or remove diacritics.
`Field.List`    | A predefined list of texts which the character must enter one from.
`Field.Text`    | Text field. May be configured to span multiple lines and use formatted text.


For more info on each type, use an IDE that can show type/parameter info for Typescript or Assemblyscript code (such as VSCode).

### Parsing field type values

When a command is used by a character, the values for the command fields will be included as _JSON_ data to the `onCommand` function, in the `CmdAction.data` property.

**Example getting a message from a Text field**
```typescript
export function onActivate(): void {
	// Adding our command on script activation
	Room.addCommand("send", new Command("send <Message>")
		.field("Message", new Field.Text("The message to send.")), 10)
}

// A class to use when parsing the command arguments.
// The class should match the field types used when creating the command.
@json
class SendArgs {
	@alias("Message") // Name of the field
	message: FieldValue.Text = new FieldValue.Text()
}

export function onCommand(addr: string, cmdAction: CmdAction): void {
	if (cmdAction.keyword == "send") {
		// Here we parse the command data.
		const args = JSON.parse<SendArgs>(cmdAction.data)
		Room.describe(`The message is: "${args.message.value}"`)
	}
}
```

The JSON structure in `CmdAction.data` is an object with the keys being the
field names, and the values depending on the field type of each field. The JSON
for the example above could look like:
```json
{
	"Message": {
		"value": "Hello, world!"
	}
}
```


## Command priority

When you type commands, more than one command may be (fully or partially) valid for that input. In general, the client will try to find the best match. But in cases where multiple commands match equally well, the client selects the command with the highest _priority_ value passed to the `new Command` constructor.

**Example**
```typescript
Room.addCommand("sendEmpty", new Command("send empty"), 20)
Room.addCommand("sendText", new Command("send <Text>")
	.field("Text", new Field.Text("The text to send.")), 10)
```

Input | Description
--- | ---
`send empty` |  Both commands fully matches the text `send empty`, but the `"sendEmpty"` will be used because its priority value (20) is higher than that of `"sendText"` (10).
`send Hello` |  Since `"sendText"` fully matches the input, it will be used. Priority is ignored.

## Command delimiters

The client will automatically detect if space or a symbol is used to delimit a field from the remaining parts of the command.

When using `Field.Char`, it is always a good idea to delimit with a symbol.

**Examples**

```typescript
// Because no symbol is used between "<Color>" and "button", the client will
// automatically filter out colors containing space.
Room.addCommand("pushColorButton", new Command("push <Color> button")
	.field("Color", new Field.List("Color of the button.")
		.addItem("red")
		.addItem("green")
		.addItem("dark blue") // Contains space and will not be shown
	)
)

// Using a symbol (:) as a delimiter allows the use of space amongst list items.
Room.addCommand("pullColorLever", new Command("pull <Color> : lever")
	.field("Color", new Field.List("Color of the lever.")
		.addItem("candy pink")
		.addItem("deep saffron")
	)
)
```
