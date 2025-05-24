import { main } from 'assemblyscript/asc';
import escapeHtml from './escapeHtml.js';

const LF = "\n";
const indent = "&nbsp;&nbsp;&nbsp;&nbsp;";
const spaceIndent = "    ";

const kind = {
	project: 0x1,
	module: 0x2,
	namespace: 0x4,
	enum: 0x8,
	member: 0x10,
	variable: 0x20,
	function: 0x40,
	class: 0x80,
	interface: 0x100,
	constructor: 0x200,
	property: 0x400,
	method: 0x800,
	signature: 0x1000,
	indexSignature: 0x2000,
	constructorSignature: 0x4000,
	parameter: 0x8000,
	typeLiteral: 0x10000,
	typeParam: 0x20000,
	accessor: 0x40000,
	getter: 0x80000,
	setter: 0x100000,
	type: 0x200000,
	reference: 0x400000,
};

const kindName = {
	0x1: 'project',
	0x2: 'module',
	0x4: 'namespace',
	0x8: 'enum',
	0x10: 'member',
	0x20: 'variable',
	0x40: 'function',
	0x80: 'class',
	0x100: 'interface',
	0x200: 'constructor',
	0x400: 'property',
	0x800: 'method',
	0x1000: 'signature',
	0x2000: 'indexsignature',
	0x4000: 'constructorsignature',
	0x8000: 'parameter',
	0x10000: 'typeliteral',
	0x20000: 'typeparam',
	0x40000: 'accessor',
	0x80000: 'getter',
	0x100000: 'setter',
	0x200000: 'type', // type alias
	0x400000: 'ref', // reference
};

const childKinds = {
	[kind.member]: (parentId) => parentId,
	[kind.property]: (parentId) => parentId + '-properties',
	[kind.signature]: (parentId) => parentId,
	[kind.constructor]: (parentId) => parentId,
	[kind.constructorSignatur]: (parentId) => parentId,
}

function compareSymbolName(a, b) {
	return a.name.localeCompare(b.name);
}


export default class DocsConverter {
	/**
	 * Exports json data to markdown.
	 * @param {string} data JSON data
	 * @param {Record<string, string} typeAliases A map of type aliases and what type they represent.
	 * @returns {string} Markdown output
	 */
	constructor(data, typeAliases) {
		this.data = data;
		this.typeAliases = typeAliases;
		this.linkIds = this._resolveLinkIds(this.data, {}, null, null);
	}

	/**
	 * Resolves all the link names for each symbol. If a symbol inherits from
	 * another class, the id will be derived from the last non-inhereriting
	 * heir.
	 * @param {object} symbol
	 * @param {Record<string,string>} ids Links names.
	 * @param {string} parentId ID of parent symbol.
	 * @param {object} heir Last symbol that is not an inheritance.
	 * @returns {Record<string,string>} Links names.
	 */
	_resolveLinkIds(symbol, ids, parentId, heir) {
		const useParent = childKinds[symbol.kind];

		if (symbol.kind) {
			// Enum members uses parent id
			if (useParent) {
				ids[symbol.id] = useParent(ids[parentId]);
			} else {
				let qualifiedName = this._getSymbolName(symbol, heir);
				if (qualifiedName) {
					ids[symbol.id] = kindName[symbol.kind] + '-' + this._stringToId(qualifiedName);
				}
			}
		}
		if (symbol.children) {
			for (let child of symbol.children) {
				this._resolveLinkIds(
					child,
					ids,
					useParent ? parentId : symbol.id,
					symbol.inheritedFrom ? heir : symbol,
				);
			}
		}
		return ids;
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
		overviewLinks.push(`[API references](#api-references)`);

		// Convert root namespace
		let [ content, links ] = this.formatNamespace(visitedSymbolIds, this.data, true);

		// Output
		return `# ${title}` + LF +
			LF +
			this._convertToNamedHeaders("## Overview") + LF +
			LF +
			overviewLinks.join("  \n") + LF +
			LF +
			overview + LF +
			LF +
			this._convertToNamedHeaders("# API references") + LF +
			LF +
			links.join("  \n") + LF +
			LF +
			content.join("\n\n") + LF;
	}

	formatNamespace(visited, root, useNamespaceSectionHeader) {
		root = root || this.data;
		if (visited[root.id]) {
			return [ [], [] ];
		}
		visited[root.id] = true;

		let rootName = root != this.data
			? this._getSymbolName(root)
			: '';
		let rootIdPrefix = rootName ? this._stringToId(rootName) + '-' : '';

		// Enums
		let enumsName = rootName ? `${rootName} enums` : "Enums";
		let [ enums, enumLinks ] = this.formatEnums(visited, root);

		// Type aliases
		let aliasesName = rootName ? `${rootName} type aliases` : "Type aliases";
		let [ aliases, aliasLinks ] = this.formatTypeAliases(visited, root);

		// Functions
		let functionsName = rootName ? `${rootName} functions` : "Functions";
		let [ functions, functionLinks ] = this.formatFunctions(visited, root);

		// Classes
		let classesName = rootName ? `${rootName} classes` : "Classes";
		let [ classes, classLinks ] = this.formatClasses(visited, root);

		// Namespaces
		// let namespacesName = rootName ? `${rootName} namespaces` : "Namespaces";
		let [ namespaces, namespaceLinks ] = this.formatNamespaces(visited, root, useNamespaceSectionHeader);

		return [
			[
				[
					...(aliases.length ? [
						this._convertToNamedHeaders(`## ${aliasesName}`),
						aliases.join("\n\n---\n\n"),
					] : []),
					...(enums.length ? [
						this._convertToNamedHeaders(`## ${enumsName}`),
						enums.join("\n\n---\n\n"),
					] : []),
					...(functions.length ? [
						this._convertToNamedHeaders(`## ${functionsName}`),
						functions.join("\n\n---\n\n"),
					] : []),
					...(classes.length ? [
						this._convertToNamedHeaders(`## ${classesName}`),
						classes.join("\n\n---\n\n"),
					] : []),
					...(namespaces.length ? [
						// this._convertToNamedHeaders(`## ${namespacesName}`),
						namespaces.join("\n\n---\n\n"),
					] : []),
				].join("\n\n"),
			],
			[
				...(aliasLinks.length ? [ `[${aliasesName}](#${rootIdPrefix}type-aliases)` ] : []),
				...aliasLinks,
				...(enumLinks.length ? [ `[${enumsName}](#${rootIdPrefix}enums)` ] : []),
				...enumLinks,
				...(functionLinks.length ? [ `[${functionsName}](#${rootIdPrefix}functions)` ] : []),
				...functionLinks,
				...(classLinks.length ? [ `[${classesName}](#${rootIdPrefix}classes)` ] : []),
				...classLinks,
				// ...(namespaceLinks.length ? [ `[${namespacesName}](#${rootIdPrefix}namespaces)` ] : []),
				...namespaceLinks,
			],
		];
	}

	/**
	 * Formats enums in a namespace.
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @param {object} [root] Root symbol object to look in. Defaults to this.data.
	 * @returns {[Array<string>, Array<string>]} Result.
	 */
	formatEnums(visited, root) {
		const contents = [];
		const links = [];
		for (let o of this._getGroupSymbols("Enumerations", visited, root || this.data).sort(compareSymbolName)) {
			let result = this.formatEnum(o, visited);
			if (result) {
				contents.push(result[0]);
				links.push(result[1]);
			}
		}
		return [ contents, links ];
	}

	/**
	 * Formats an enum.
	 * @param {object} enumSymbol Enum symbol object
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[string, string]} Result or null if symbol is not an enum
	 */
	formatEnum(enumSymbol, visited) {
		// Set enum namespace and type as visited
		visited[enumSymbol.id] = true;

		let qualifiedName = this._getSymbolName(enumSymbol);
		let id = this._getLinkId(enumSymbol.id);
		let longestName = 0;
		enumSymbol.children.forEach(c => {
			// Set const as visited
			visited[c.id] = true;
			// Get longest child name
			longestName = Math.max(longestName, c.name.length);
		});
		let s = `<h3 id="${id}">enum ${escapeHtml(qualifiedName)}</h3>` + LF +
			LF +
			"```ts" + LF +
			`${enumSymbol.flags?.isConst ? 'const ' : ''}enum ${enumSymbol.name} {` + LF +
			enumSymbol.children.sort((a, b) => a.id - b.id).map(c => spaceIndent + c.name + (
				c.type
					? " ".repeat(longestName - c.name.length) + " = " + this._formatType(c.type, false)
					: ''
			) + ',').join("\n") + LF +
			`}` + LF +
			"```" + LF +
			LF +
			this._formatComment(enumSymbol.comment);

		return [s, indent + `[enum ${qualifiedName}](#${id})`];
	}

	/**
	 * Formats functions in a namespace.
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @param {object} [root] Root symbol object to look in. Defaults to this.data.
	 * @returns {[Array<string>, Array<string>]} Result.
	 */
	formatFunctions(visited, root) {
		const contents = [];
		const links = [];
		for (let o of this._getGroupSymbols("Functions", visited, root || this.data).sort(compareSymbolName)) {
			let result = this.formatFunction(o, visited);
			if (result) {
				contents.push(result[0]);
				links.push(result[1]);
			}
		}
		return [ contents, links ];
	}

	/**
	 * Formats a function.
	 * @param {object} functionSymbol Function symbol object
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[string, string]} Result or null if symbol is not a function
	 */
	formatFunction(functionSymbol, visited) {
		if (visited[functionSymbol.id]) return null;

		// Set class namespace and type as visited
		visited[functionSymbol.id] = true;

		const qualifiedName = this._getSymbolName(functionSymbol);
		const id = this._getLinkId(functionSymbol.id);

		const s = `<h3 id="${id}">function ${escapeHtml(qualifiedName)}</h3>` + LF +
			LF +
			this._formatMethod(qualifiedName, functionSymbol);

		return [s, indent + `[function ${qualifiedName}](#${id})`];
	}

	/**
	 * Formats type aliases.
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @param {object} [root] Root symbol object to look in. Defaults to this.data.
	 * @returns {[Array<string>, Array<string>]} Result.
	 */
	formatTypeAliases(visited, root) {
		const contents = [];
		const links = [];
		for (let o of this._getGroupSymbols("Type Aliases", visited, root || this.data).sort(compareSymbolName)) {
			let result = this.formatTypeAlias(o, visited);
			if (result) {
				contents.push(result[0]);
				links.push(result[1]);
			}
		}
		return [ contents, links ];
	}

	/**
	 * Formats an type alias.
	 * @param {object} typeSymbol Type symbol object
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @returns {[string, string]} Result or null if symbol is not an enum
	 */
	formatTypeAlias(typeSymbol, visited) {
		if (visited[typeSymbol.id]) return null;

		// Set enum namespace and type as visited
		visited[typeSymbol.id] = true;

		let qualifiedName = this._getSymbolName(typeSymbol);
		let id = this._getLinkId(typeSymbol.id);
		let s = `<h3 id="${id}">type ${escapeHtml(qualifiedName)}</h3>` + LF +
			LF +
			"```ts" + LF +
			`type ${typeSymbol.name} = ${this.typeAliases?.[typeSymbol.name] || this._formatType(typeSymbol.type)}` + LF +
			"```" + LF +
			LF +
			this._formatComment(typeSymbol.comment);

		return [s, indent + `[type ${qualifiedName}](#${id})`];
	}

	/**
	 * Formats class namespaces.
	 * @param {Record<string,boolean>} visited Record of all previously visited symbols
	 * @param {object} [root] Root symbol object to look in. Defaults to this.data.
	 * @returns {[Array<string>, Array<string>]} Result.
	 */
	formatClasses(visited, root) {
		let contents = [];
		let links = [];
		for (let o of this._getGroupSymbols("Classes", visited, root || this.data).sort(compareSymbolName)) {
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

		let qualifiedName = this._getSymbolName(classSymbol);
		let id = this._getLinkId(classSymbol.id);
		let longestName = 0;
		classSymbol.children.forEach(c => {
			// Set const as visited
			visited[c.id] = true;
			// Get longest child name
			longestName = Math.max(longestName, c.name.length);
		});
		let constructorSymbol = this._findChildByKind(classSymbol, kind.constructor);

		// Constructor
		let mainContent = (`<h3 id="${id}">class ${escapeHtml(qualifiedName)}</h3>` + LF +
			LF +
			this._formatComment(classSymbol.comment) + LF +
			(this._hasSourceCodeSignature(constructorSymbol)
				? LF +
					this._formatMethod(`new ${qualifiedName}`, constructorSymbol, true) + LF
				: ''
			)
		);
		links.push(indent + `[class ${qualifiedName}](#${id})`);

		// Properties
		let propSymbols = this._findChildrenByKind(classSymbol, kind.property);
		if (propSymbols.length) {
			mainContent += LF + `<h4 id="${id}-properties">class ${escapeHtml(qualifiedName)} properties</h4>` + LF +
				LF +
				this._formatProperties(propSymbols) + LF;
		}

		// We include properties in mainContent instead of making it a new
		// section.
		contents.push(mainContent);

		// Methods
		let methodSymbols = this._findChildrenByKind(classSymbol, kind.method);
		for (let methodSymbol of methodSymbols) {
			let methodQualifiedName = this._getSymbolName(methodSymbol, classSymbol);
			let methodId = this._getLinkId(methodSymbol.id)
			contents.push(
				`<h3 id="${methodId}">method ${escapeHtml(methodQualifiedName)}</h3>` + LF +
				LF +
				this._formatMethod(`${methodSymbol.name}`, methodSymbol)
			);
			links.push(indent + indent + `[method ${methodSymbol.name}](#${methodId})`);
		}

		return [ contents, links ];
	}

	formatNamespaces(visited, root, useSectionHeader) {
		let contents = [];
		let links = [];
		for (let namespace of this._getGroupSymbols("Namespaces", visited, root || this.data).sort(compareSymbolName)) {
			// Convert root namespace
			let [ namespaceContents, namespaceLinks ] = this.formatNamespace(visited, namespace, false);
			contents = contents.concat(namespaceContents);
			links = [
				...links,
				...(useSectionHeader ? [ "\n### " + this._getSymbolName(namespace) + " namespace" ] : []),
				...namespaceLinks
			];
		}

		return [ contents, links ];
	}

	/**
	 * Formats a single comment section.
	 * @param {*} comment Comment
	 * @param {*} level
	 * @param {*} prefix
	 * @param {*} headerCallback
	 * @returns
	 */
	_formatComment(comment, level, prefix, headerCallback) {
		let s = [];
		if (comment?.summary) {
			s.push(this._convertToNamedHeaders(this._formatText(comment.summary), level, prefix, headerCallback));
		}
		const seeComments = this._formatSeeComments(comment);
		if (seeComments?.length) {
			s.push(seeComments.map(c => "See also: " + c).join("  \n"));
		}
		return s.join("\n\n");
	}

	/**
	 * Formats a returns comment section.
	 * @param {*} comment Comment
	 * @returns string
	 */
	_formatReturnsComment(comment) {
		let returns = comment?.blockTags?.find(o => o.tag == "@returns");
		if (!returns) {
			return '';
		}
		return this._formatText(returns.content);
	}

	_formatSeeComments(comment) {
		const tags = comment?.blockTags?.filter(o => o.tag == "@see");
		if (tags?.length) {
			return tags.map(t => this._formatText(t.content));
		}
		return null;
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
					if (o.tag == '@link') {
						return this._formatLink(o.text, o.target);
					}
					return escapeHtml(o.text)
				case "code":
					return o.text;

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

	_getLinkId(symbolId) {
		return this.linkIds[symbolId];
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
			.map(id => this._getSymbol(id, this.data.children))
			.filter(o => !o.name.startsWith("_")); // Exclude symbols starting with underscore.
	}

	/**
	 * Returns the qualified name for a symbol. If parentSymbol is provided, any
	 * inherited properties or methods will be prefixed with the parent
	 * qualified name instead of the inherited name.
	 * @param {object} symbol Symbol
	 * @param {object} [parentSymbol] Parent symbol used to hide the inheritance if provided.
	 * @returns {string} Qualified name.
	 */
	_getSymbolName(symbol, parentSymbol) {
		if (parentSymbol && symbol.inheritedFrom) {
			return this._getSymbolName(parentSymbol) + "." + symbol.name;
		}
		let o = this.data.symbolIdMap?.[symbol.id];
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
		let hasComment = false;
		const signature = symbol.signatures?.[0];
		const params = signature?.parameters || [];

		const returnsVoid = signature.type.name == 'void'
		const summary = this._formatComment(signature.comment);
		const returnsComment = this._formatReturnsComment(signature.comment);

		const syntax = "```ts" + LF +
			name + "(" + params.map(p => {
				return `${p.name}: ${this._formatType(p.type, false)}${p.defaultValue ? ' = ' + p.defaultValue : ''}`;
			}).join(", ") + ")" + (
				!noReturnType && signature.type
					? `: ${this._formatType(signature.type, false)}`
					: ''
			) + LF +
		"```"

		const parameters = params.map(p => {
			let comment = this._formatText(p.comment?.summary) || '';
			return "* `" + p.name + "` <i>(" + this._formatType(p.type) + ")</i>" + (
				comment
					? ": " + comment
					: ''
			);
		}).join(LF);

		return  syntax + (
			summary ? "\n\n" + summary : ''
		) + (
			parameters.length
				? "\n\n" +
					`<h4>Parameters</h4>` + LF +
					LF +
					parameters
				: ''
		) + (
			!noReturnType && (returnsComment || !returnsVoid)
				? "\n\n" +
					`<h4>Returns</h4>` + LF +
					LF +
					"* <i>(" + this._formatType(signature.type) + ")</i>" + (
						returnsComment
							? ": " + returnsComment
							: ''
					)
				: ''
		) + LF;
	}

	_formatProperties(symbols) {
		return symbols.map(p => "* `" + p.name + "` <i>(" + this._formatType(p.type) + ")</i>" + (
			p.comment?.summary
				? ": " + this._formatText(p.comment.summary)
				: ''
		)).join(LF);
	}

	/**
	 * Checks if a symbol has a signature with sources. This is used to avoid
	 * rendering constructors for classes that has no actual constructor
	 * defined.
	 * @param {óbject} symbol
	 */
	_hasSourceCodeSignature(symbol) {
		return !!symbol?.signatures?.[0].sources?.length;
	}

	_formatLink(text, target) {
		if (target) {
			let t = typeof target;
			if (t == 'number')  {
				let symbol = this.data.symbolIdMap?.[target];
				let linkId = this._getLinkId(target);
				// Do not link to external package types that are not in a
				// namespace. This applies to things like json-as types: "T",
				// "key", "value", etc.
				if (
					symbol &&
					linkId &&
					(symbol.packageName == 'mucklet-script' || symbol.qualifiedName?.includes('.'))
				) {
					return `[${escapeHtml(symbol.qualifiedName)}](#${linkId})`;
				}
			} else if (t == "string") {
				return `[${escapeHtml(text)}](${escapeHtml(target)})`
			}
		}

		return escapeHtml(text);
	}

	_formatType(o, link = true) {
		// Array
		if (o.type == 'array' ) {
			return 'Array<' + this._formatType(o.elementType, link) + '>';
		}

		// Literal
		if (o.type == 'literal') {
			return escapeHtml(String(o.value));
		}

		// Union
		if (o.type == 'union') {
			// Move literals and null to the end. Keep remaining order.
			o.types.sort((a, b) => {
				if (
					(a.type == 'literal' && b.type != 'literal') ||
					(a.type != 'litera' && b.type == 'literal')
				) {
					return a.type == 'literal' ? 1 : -1;
				}
				// Both are literals
				if (a.type == 'literal') {
					return !a.value
						? 1
						: !b.value
							? -1
							: 0;
				}
				return 0;
			});

			return o.types.map(t => this._formatType(t, link)).join(" | ");
		}

		// Link
		if (link) {
			return this._formatLink(o.name, o.target);
		}

		return escapeHtml(o.name);
	}
}
