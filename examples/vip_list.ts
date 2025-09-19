/**
 * The vip_list.ts is a script that keeps a list of VIP characters, with
 * commands to add, remove, and list them. Other scripts, such as vip_guard.ts,
 * may send requests to ask whether a character is a VIP, using
 * `Script.request`:
 * ```
 * const response = Script.request(vipListAddr, "isVip", JSON.stringify(charId))
 * ```
 *
 * The vip_guard.ts script sends requests to this scripts to only let VIP
 * characters use an exit.
 *
 * The script adds three commands to the room:
 * ```
 * add vip <Character>
 * remove vip <Character>
 * list vip
 * ```
 */

// onActivate is called when the script is activated.
export function onActivate(): void {
	// Add commands for managing the VIP list
	Room.addCommand(
		"add",
		new Command("add vip <Character>", "Add a character to the VIP list.")
			.field("Character", new Field.Char("Character to add.")),
	)
	Room.addCommand(
		"remove",
		new Command("remove vip <Character>", "Remove a character from the VIP list.")
			.field("Character", new Field.Char("Character to remove.")),
	)
	Room.addCommand(
		"list",
		new Command("list vip", "List all VIP characters."),
	)
	// Listen for script requests.
	Script.listen()
}

// Command arguments class. Used by both the "add" and "remove" command.
@json
class Args {
	@alias("Character")
	char: FieldValue.Char = new FieldValue.Char();
}

// onCommand is called when a character uses a script command.
export function onCommand(addr: string, cmdAction: CmdAction): void {
	// Handle add command
	if (cmdAction.keyword == "add") {
		const args = JSON.parse<Args>(cmdAction.data)
		// Check if the character is already added.
		if (Store.getString(args.char.id) == null) {
			// Add the character to the store. As value, we store the timestamp
			// when the character was added. This value currently not used in
			// this script.
			Store.setString(args.char.id, Date.now().toString())
			cmdAction.info(`**${args.char.name} ${args.char.surname}** was added to the VIP list.`)
		} else {
			cmdAction.info(`**${args.char.name} ${args.char.surname}** was already in the VIP list.`)
		}
		return
	}

	// Handle remove command
	if (cmdAction.keyword == "remove") {
		const args = JSON.parse<Args>(cmdAction.data)
		// Check if the character is not already removed.
		if (Store.getString(args.char.id) != null) {
			// Remove the character from the store.
			Store.deleteKey(args.char.id)
			cmdAction.info(`**${args.char.name} ${args.char.surname}** was removed from the VIP list.`)
		} else {
			cmdAction.info(`**${args.char.name} ${args.char.surname}** was not found in the VIP list.`)
		}
		return
	}

	// Handle list command
	if (cmdAction.keyword == "list") {
		let chars = new Array<Script.Char>()
		// Iterate over all characters stored in the list
		for (const iter = new Store.Iterator(); iter.isValid(); iter.next()) {
			// Get the store key which is the character ID.
			const charId = iter.getKeyString()
			// Get character info.
			const char = Script.getChar(charId)
			// Verify that the character is found.
			if (char != null) {
				chars.push(char)
			} else {
				// The character is probably deleted.
				// We prune our VIP list by deleting them there as well.
				console.debug("Pruned " + charId)
				Store.deleteKey(charId)
			}
		}

		// Check if the list is empty. If so, show a simple message.
		if (chars.length == 0) {
			cmdAction.info("_List is empty_")
			return
		}

		// Sort the characters by name and surname.
		chars.sort((a: Script.Char, b: Script.Char) => a.name.localeCompare(b.name) || a.surname.localeCompare(b.surname))
		// Concatenate the names into a string with line breaks between each character.
		const list = chars
			.map((char: Script.Char, i: i32, chars: Script.Char[]) => char.name + " " + char.surname)
			.join("\n")
		// Show the list with a header "VIP list". For help on how to format
		// text, see: `help format info`
		cmdAction.info("## VIP list\n" + list)
		return
	}
}

// onRequest is called when another script sends a request to this script.
export function onRequest(addr: string, request: Request): void {
	if (request.topic == "isVip") {
		// Parse the data passed as arguments. It should be the charId.
		const charId = request.parseData<string>()
		// If the charId exists in the store, the character is a VIP.
		const isVip = Store.getString(charId) != null
		// Send a response to the request. It must be JSON encoded.
		request.reply(JSON.stringify(isVip))
	}
}
