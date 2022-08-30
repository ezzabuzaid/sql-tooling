import { TokenType } from "../tokenizer";

export class UnknownTokenType extends Error {
	constructor(type: TokenType) {
		super(`Unknown token - Type: ${type}`);

		Error.captureStackTrace(this, UnknownTokenType);
		this.name = this.constructor.name;
	}
}
