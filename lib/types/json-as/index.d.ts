/**
 * JSON Encoder/Decoder for AssemblyScript
 */
declare namespace JSON {
	/**
	 * Enum representing the different types supported by JSON.
	 */
	enum Types {
		Raw = 0,
		U8 = 1,
		U16 = 2,
		U32 = 3,
		U64 = 4,
		F32 = 5,
		F64 = 6,
		Bool = 7,
		String = 8,
		Obj = 8,
		Array = 9
	}
	type Raw = string;

	class Value {
		public type: i32;
		private storage: u64;

		private constructor();
		/**
		 * Creates an JSON.Value instance from a given value.
		 * @param value - The value to be encapsulated.
		 * @returns An instance of JSON.Value.
		 */
		static from<T>(value: T): JSON.Value;

		/**
		 * Sets the value of the JSON.Value instance.
		 * @param value - The value to be set.
		 */
		set<T>(value: T): void;

		/**
		 * Gets the value of the JSON.Value instance.
		 * @returns The encapsulated value.
		 */
		get<T>(): T;

		/**
		 * Converts the JSON.Value to a string representation.
		 * @param useString - If true, treats Buffer as a string.
		 * @returns The string representation of the JSON.Value.
		 */
		toString(): string;
	}

	/**
	 * Stringifies valid JSON data.
	 * ```js
	 * JSON.stringify<T>(data)
	 * ```
	 * @param data T
	 * @returns string
	 */
	export function stringify<T>(data: T): string;

	/**
	 * Parses valid JSON strings into their original format.
	 * ```js
	 * JSON.parse<T>(data)
	 * ```
	 * @param data string
	 * @returns T
	 */
	export function parse<T>(data: string): T;
}
