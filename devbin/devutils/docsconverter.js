import { main } from 'assemblyscript/asc';
import escapeHtml from './escapeHtml.js';

const LF = "\n";
const indent = "&nbsp;&nbsp;&nbsp;&nbsp;";
const spaceIndent = "    ";

const kind = {
	class: 128,
	constructor: 512,
	property: 1024,
	method: 2048,
};


export default class DocsConverter {
	/**
	 * Exports json data to markdown.
	 * @param {string} data JSON data
	 * @returns {string} Markdown output
	 */
	constructor(data) {
		this.data = data;
		this.visited = null;
	}

	/**
	 * Exports json data to markdown.
	 * @returns {string} Markdown output
	 */
	toMarkdown(title) {
		const visitedSymbolIds = {};

		// Overview
		const overviewLinks = [];
		const overview = this._formatComment(this.data.comment, 1, '', (title, level, id) => {
			if (level <= 2) {
				overviewLinks.push(indent.repeat(level - 1) + `[${title}](#${id})`);
			}
		});
		overviewLinks.push(`[Index](#index)`);

		// Enums
		let [ enums, enumLinks ] = this.formatEnums(visitedSymbolIds);

		// Type aliases
		let [ aliases, aliasLinks ] = this.formatTypeAliases(visitedSymbolIds);

		// Classes
		let [ classes, classLinks ] = this.formatClasses(visitedSymbolIds);

		// Output
		return `# ${title}` + LF +
			LF +
			this._convertToNamedHeaders("## Overview") + LF +
			LF +
			overviewLinks.join("  \n") + LF +
			LF +
			overview + LF +
			LF +
			this._convertToNamedHeaders("# Index") + LF +
			LF +
			[
				`[Type aliases](#type-aliases)`,
				...aliasLinks,
				`[Enums](#enums)`,
				...enumLinks,
				`[Classes](#classes)`,
				...classLinks,
			].join("  \n") + LF +
			LF +
			this._convertToNamedHeaders("## Type aliases") + LF +
			LF +
			aliases.join("\n\n---\n\n") + LF +
			LF +
			this._convertToNamedHeaders("## Enums") + LF +
			LF +
			enums.join("\n\n---\n\n") + LF +
			LF +
			this._convertToNamedHeaders("## Classes") + LF +
			LF +
			classes.join("\n\n---\n\n") + LF +
			LF;
	}

	/**
	 * Formats enums namespaces.
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[Array<string>, Array<string>]} Result.
	 */
	formatEnums(visited) {
		const contents = [];
		const links = [];
		for (let o of this._getGroupSymbols("Namespaces", visited)) {
			// Enums has a type named the same as the namespace
			let t = this._getTypeAliasbyName(o.name);
			if (!t) {
				continue;
			}

			let result = this.formatEnum(o, t, visited);
			if (result) {
				contents.push(result[0]);
				links.push(result[1]);
			}
		}
		return [ contents, links ];
	}

	/**
	 * Formats an enum namespace.
	 * @param {object} namespaceSymbol Namespace symbol object
	 * @param {object} typeSymbol Type symbol object
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[string, string]} Result or null if symbol is not an enum
	 */
	formatEnum(namespaceSymbol, typeSymbol, visited) {
		// Set enum namespace and type as visited
		visited[namespaceSymbol.id] = true;
		visited[typeSymbol.id] = true;


		let id = this._getSymbolId(namespaceSymbol.id);
		let longestName = 0;
		namespaceSymbol.children.forEach(c => {
			// Set const as visited
			visited[c.id] = true;
			// Get longest child name
			longestName = Math.max(longestName, c.name.length);
		});
		let s = `<h3 id="${id}">enum ${escapeHtml(namespaceSymbol.name)}</h3>` + LF +
			LF +
			"```ts" + LF +
			`type ${typeSymbol.name} = ${typeSymbol.type.name}` + LF +
			`namespace ${namespaceSymbol.name} {` + LF +
			namespaceSymbol.children.sort((a, b) => a.id - b.id).map(c => spaceIndent + `const ${c.name}${" ".repeat(longestName - c.name.length)} = ${typeSymbol.name}(${c.defaultValue})`).join("\n") + LF +
			`}` + LF +
			"```" + LF +
			LF +
			this._formatComment(namespaceSymbol.comment);

		return [s, indent + `[enum ${namespaceSymbol.name}](#${id})`];
	}

	/**
	 * Formats type aliases.
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[Array<string>, Array<string>]} Result.
	 */
	formatTypeAliases(visited) {
		let longestAlias = 0;
		const aliasSymbols = this._getGroupSymbols("Type Aliases").filter(o => {
			if (visited[o.id]) return false;
			visited[o.id] = true;
			longestAlias = Math.max(longestAlias, o.name.length + o.type.name.length);
			return true;
		});
		return aliasSymbols.length
			? [
				[
					"```ts" + LF +
						aliasSymbols.map(o => `type ${o.name} = ${o.type.name} ${" ".repeat(longestAlias - o.name.length - o.type.name.length )}// ${this._formatComment(o.comment)}`)
							.join("\n") + LF +
						"```",
				],
				[],
			]
			: [ [], [] ];
	}

	/**
	 * Formats class namespaces.
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[Array<string>, Array<string>]} Result.
	 */
	formatClasses(visited) {
		let contents = [];
		let links = [];
		for (let o of this._getGroupSymbols("Classes", visited)) {
			let result = this.formatClass(o, visited);
			if (result) {
				contents = contents.concat(result[0]);
				links = links.concat(result[1]);
			}
		}
		return [ contents, links ];
	}

	/**
	 * Formats a class.
	 * @param {object} classSymbol Namespace symbol object
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[Array<string>, Array<string>]} Result or null if symbol is not an class
	 */
	formatClass(classSymbol, visited) {
		if (visited[classSymbol.id]) return null;

		const contents = [];
		const links = [];

		// Set class namespace and type as visited
		visited[classSymbol.id] = true;

		let id = this._getSymbolId(classSymbol.id);
		let longestName = 0;
		classSymbol.children.forEach(c => {
			// Set const as visited
			visited[c.id] = true;
			// Get longest child name
			longestName = Math.max(longestName, c.name.length);
		});
		let constructorSymbol = this._findChildByKind(classSymbol, kind.constructor);

		// Constructor
		let mainContent = (`<h3 id="${id}">class ${escapeHtml(classSymbol.name)}</h3>` + LF +
			LF +
			this._formatComment(classSymbol.comment) + LF +
			(this._hasSourceCodeSignature(constructorSymbol)
				? LF +
					this._formatMethod(`new ${classSymbol.name}`, constructorSymbol, true) + LF
				: ''
			)
		);
		links.push(indent + `[class ${classSymbol.name}](#${id})`);

		// Properties
		let propSymbols = this._findChildrenByKind(classSymbol, kind.property);
		if (propSymbols.length) {
			mainContent += LF + `<h4 id="${id}-properties">class ${escapeHtml(classSymbol.name)} properties</h4>` + LF +
				LF +
				this._formatProperties(propSymbols) + LF;
			links.push(indent + indent + `[properties](#${id}-properties)`);
		}

		// We include properties in mainContent instead of making it a new
		// section.
		contents.push(mainContent);

		// Methods
		let methodSymbols = this._findChildrenByKind(classSymbol, kind.method);
		for (let methodSymbol of methodSymbols) {
			let methodId = this._getSymbolId(methodSymbol.id)
			contents.push(
				`<h3 id="${methodId}">method ${escapeHtml(classSymbol.name + "." + methodSymbol.name)}</h3>` + LF +
				LF +
				this._formatMethod(`${methodSymbol.name}`, methodSymbol)
			);
			links.push(indent + indent + `[method ${methodSymbol.name}](#${methodId})`);
		}

		return [ contents, links ];
	}

	formatConstructor

	/**
	 * Formats a single comment section.
	 * @param {*} comment Comment
	 * @param {*} level
	 * @param {*} prefix
	 * @param {*} headerCallback
	 * @returns
	 */
	_formatComment(comment, level, prefix, headerCallback) {
		if (!comment) {
			return '';
		}

		if (!comment.summary) {
			return '';
		}

		return this._convertToNamedHeaders(this._formatText(comment.summary), level, prefix, headerCallback);
	}

	_ifNotVisited(id, cb) {

	}

	/**
	 * Formats a text array.
	 * @param {Array<{kind:string, text: string}} textArray Array of text objects.
	 * @returns {string} Markdown output
	 */
	_formatText(textArray) {
		if (!textArray) {
			return '';
		}
		return textArray.map(o => {
			switch (o.kind) {
				case "inline-tag":
					let id = this._getSymbolId(o.target);
					if (!id) {
						throw new Error("@link to unknown symbol: " + o.text);
					}
					return `[${o.text}](#${id})`;

				default:
					return o.text;
			}
		}).join('');
	}

	/**
	 * Replaces markdown headers with named headers that may be linked to.
	 * @param {string} text Markdown to convert.
	 * @param {number} [level] Level to add to headers. If 0, # turns to <h1>. If 1, # turns to <h2>. Defaults to 0.
	 * @param {string} [idPrefix] Prefix to add to id. Will be separated with dash.
	 * @param {(title: string, level: number, id: string) => void} [headerCallback] Callback called on each found header. Level is the original level.
	 * @return {string} Converted markdown.
	 */
	_convertToNamedHeaders(text, level = 0, idPrefix, headerCallback) {
		return text.replace(/^(#+)\s*(.*)/gm, (match, hashes, title) => {
			title = title.trim();
			const l = level + hashes.length;
			const id = this._stringToId(title, idPrefix);
			headerCallback?.(title, hashes.length, id);
			return `<h${l} id="${id}">${escapeHtml(title)}</h${l}>`;
		});
	}

	_stringToId(s, prefix) {
		return (prefix ? prefix + '-' : '') + s.toLowerCase()
			.replace(/[^a-z0-9\s\-.]/g, '') // Remove marks
			.replace(/[\s\-.]+/g, '-');
	}

	_getSymbolId(symbolId) {
		let o = this.data.symbolIdMap?.[symbolId];
		return (o && this._stringToId(o.qualifiedName)) || '';
	}

	/**
	 * Get symbol ids for a group
	 * @param {string} title Group title.
	 * @param {Record<string,boolean>} [exclude] Visited symbols that should be excluded.
	 * @param {object} [root] Root symbol object to look in. Defaults to this.data.
	 * @returns {Array<number>} Symbol ids.
	 */
	_getGroupIds(title, exclude, root) {
		return (root || this.data).groups
			?.find(g => g.title == title)
			?.children
			?.filter(id => !(exclude?.[id])) || [];
	}

	/**
	 * Get symbol objects for a
	 * @param {string} title Group title.
	 * @param {Record<string,boolean>} [exclude] Visited symbols that should be excluded.
	 * @param {object} [root] Root symbol object to look in. Defaults to this.data.
	 * @returns {Array<object>} Symbol objects.
	 */
	_getGroupSymbols(title, exclude, root) {
		return this._getGroupIds(title, exclude, root)
			.map(id => this._getSymbol(id, this.data.children));
	}

	_getSymbolName(symbolId) {
		let o = this.data.symbolIdMap?.[symbolId];
		return o.qualifiedName || '';
	}

	/**
	 * Traverses the children to find the symbol with the given symbolId.
	 * @param {string} symbolId Symbol ID.
	 * @param {Array<{id: string, children?:any}>} children Children to traverse.
	 */
	_getSymbol(symbolId, children) {
		if (!children) {
			return null;
		}

		for (let child of children) {
			if (child.id == symbolId) {
				return child;
			}

			const symbol = this._getSymbol(symbolId, child.children);
			if (symbol) {
				return symbol;
			}
		}
	}

	/**
	 * Returns true if a namespace symbol only contains children that are
	 * constants, and there is a type alias with the same name as the namespace.
	 * @param {any} symbol Symbol
	 * @returns {boolean} True if enum, otherwise false.
	 */
	_isEnum(symbol) {
		if (!symbol.children) {
			return false;
		}
		for (let child of symbol.children) {
			if (!child.flags?.isConst) {
				return false;
			}
		}
		for (let o of this._getGroupSymbols("Type Aliases")) {
			if (o.name == symbol.name) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns the type alias symbol by name, if it exists.
	 * @param {*} name
	 * @returns
	 */
	_getTypeAliasbyName(name) {
		for (let symbolId of this._getGroupIds("Type Aliases")) {
			if (this.data.symbolIdMap?.[symbolId]?.qualifiedName == name) {
				return this._getSymbol(symbolId, this.data.children);
			}
		}
		return null;
	}

	_findChildByKind(symbol, kind) {
		return symbol?.children?.find(o => o.kind == kind);
	}

	_findChildrenByKind(symbol, kind) {
		return symbol?.children?.filter(o => o.kind == kind);
	}

	_formatMethod(name, symbol, noReturnType) {
		let longestParam = 0;
		let hasComment = false;
		const signature = symbol.signatures?.[0];
		const params = signature?.parameters?.map(p => {
			let field = `${p.name}: ${p.type.name}${p.defaultValue ? ' = ' + p.defaultValue : ''}`;
			let comment = this._formatText(p.comment?.summary) || '';
			hasComment = hasComment || !!comment;
			longestParam = Math.max(longestParam, field.length);
			return { field, comment };
		});

		let summary = this._formatComment(signature.comment);

		return "```ts" + LF +
			name + "(" + (
				params?.length
					? hasComment
						? LF + params.map(p => spaceIndent + p.field + "," + (
							p.comment
								? " ".repeat(longestParam - p.field.length + 1) + "// " + p.comment
								: ''
						) + LF).join("")
						: params.map(p => p.field).join(", ")
					: ''
				) + ")" + (
					!noReturnType && signature.type
						? `: ${signature.type.name}`
						: ''
				) + LF +
			"```" + (
				summary ? "\n\n" + summary : ''
			);
	}

	_formatProperties(symbols) {
		let longestProp = 0;
		const props = symbols.map(p => {
			let field = `public ${p.name}: ${p.type.name}`;
			let comment = this._formatText(p.comment?.summary) || '';
			longestProp = Math.max(longestProp, field.length);
			return { field, comment };
		});

		return "```ts" + LF +
			props.map(p => p.field +
				(
					p.comment
						? " ".repeat(longestProp - p.field.length + 1) + "// " + p.comment
						: ''
				)
			).join(LF) + LF +
			"```";
	}

	/**
	 * Checks if a symbol has a signature with sources. This is used to avoid
	 * rendering constructors for classes that has no actual constructor
	 * defined.
	 * @param {óbject} symbol
	 */
	_hasSourceCodeSignature(symbol) {
		return !!symbol.signatures?.[0].sources?.length;
	}
}
