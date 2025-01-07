import path from "path";

export function formatPath(from, to) {
	return './' + path.relative(from, to).replace(/\\/g, '/');
}

export function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Merge two objects.
 */
export function mergeObjects(target, ...sources) {
	if (!sources.length) {
		return target;
	}
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			const v = source[key];
			if (isObject(v)) {
				if (!target[key]) {
					target[key] = {};
				}
				mergeObjects(target[key], v);
			} else if (typeof v != 'undefined') {
				target[key] = v;
			}
		}
	}
	return mergeObjects(target, ...sources);
}