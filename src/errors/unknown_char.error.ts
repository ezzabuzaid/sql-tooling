export class UnknownChar extends Error {
	constructor(char: string) {
		super(`Unknown Char - Char: ${char}`);
		Error.captureStackTrace(this, UnknownChar);
		this.name = this.constructor.name;
	}
}
