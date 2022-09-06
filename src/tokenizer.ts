import { UnknownChar } from "./errors/unknown_char.error";
import { getKeyByValue, keywords, singleChar } from "./factory/factory";
export enum TokenType {
	// Single-character tokens.
	SINGLE_CHAR = 1,
	COMMA = 2,
	LEFT_PAREN = 3,
	RIGHT_PAREN = 4,
	DOT = 5,
	SEMICOLON = 6,
	PLUS = 7,
	MINUS = 8,
	STAR = 9,
	SLASH = 10,
	MODULO = 11,

	// One or two character tokens.
	MAYBE_DOUBLE_CHAR = 300,
	BANG = 301,
	NOT_EQUAL = 302,
	EQUAL_EQUAL = 303,
	GREATER = 304,
	GREATER_EQUAL = 305,
	LESS = 306,
	LESS_EQUAL = 307,

	// Literals.
	IDENTIFIER = 601,
	STRING = 602,
	NUMBER = 603,
	FALSE = 604,
	TRUE = 605,

	// Keywords.
	SELECT = 901,
	FROM = 902,
	AS = 903,
	BY = 904,
	ASC = 905,
	DESC = 906,
	WHERE = 907,
	LIKE = 908,
	ILIKE = 909,
	BETWEEN = 910,
	SIMILAR = 911,
	IN = 912,
	DISTINCT = 913,
	LIMIT = 914,
	OFFSET = 915,
	AND = 916,
	OR = 917,
	NOT = 918,
	NOT_BETWEEN = 919,
	IS_NOT = 920,
	NOT_ILIKE = 921,
	NOT_LIKE = 922,
	INSERT = 919,
	VALUES = 920,
	IS = 921,
	NULL = 922,
	ALL = 923,
	EXISTS = 924,
	JOIN = 925,
	CROSS = 926,

	// Clauses
	ORDER = 1201,
	GROUP = 1202,
	HAVING = 1203,

	// Others
	EOF = -1,
}

export interface IToken<T extends TokenType> {
	type: T;
	lexeme: string;
	start?: number;
	end?: number;
	line?: number;
}

export class Tokenizer {
	private _current = 0;
	private _tokens: IToken<TokenType>[] = [];
	constructor(private program: string) {}

	tokenize() {
		let line = 0;
		while (this.program.length > this._current) {
			const char = this.program[this._current];
			let start = this._current;
			switch (char) {
				case "/":
				case "(":
				case ")":
				case "+":
				case ",":
				case ";":
				case "*":
				case "%":
					this._advance();
					this._tokens.push({
						type: singleChar[char],
						line: line,
						start: start,
						end: this._current,
						lexeme: this.program.substring(start, this._current),
					});
					break;
				case "<":
					if (this._peek() === ">") {
						// not operator
						this._advance();
						const lexeme = this.program.substring(start, this._current + 1);
						this._tokens.push({
							type: singleChar[lexeme],
							line: line,
							start: start,
							end: this._current,
							lexeme: lexeme,
						});
						this._advance();
						break;
					}
				// it is comparison then
				case "=":
				case ">":
				case "!":
					const isSingleChar = this._peek() !== "=";
					this._advance();
					const lexeme = this.program.substring(
						start,
						isSingleChar ? this._current : this._current + 1
					);
					this._tokens.push({
						type: singleChar[lexeme],
						line: line,
						start: start,
						end: this._current,
						lexeme: lexeme,
					});
					this._advance();
					break;

				case "-":
					if (this._peek() === "-") {
						while (this.program[this._current] !== "\n") {
							this._advance();
						}
						// ignore comments
						break;
					} else {
						this._advance();
						this._tokens.push({
							type: TokenType.MINUS,
							line: line,
							start: start,
							end: this._current,
							lexeme: this.program.substring(start, this._current),
						});
						break;
					}
				case " ":
				case "\r":
				case "\t":
					// Ignore whitespace.
					this._advance();
					break;
				case "\n":
					line++;
					this._advance();
					break;
				case "'":
				case '"':
					this._tokens.push({
						type: TokenType.STRING,
						line: line,
						start: start,
						end: this._current,
						lexeme: this._extractString(),
					});
					break;
				default:
					if (this._isDigit(char)) {
						this._tokens.push({
							type: TokenType.NUMBER,
							line: line,
							start: start,
							end: this._current,
							lexeme: this._extractDigits(),
						});
						break;
					} else if (this._isAlpha(char)) {
						const lexeme = this._extractIdentifier();
						const keyword = keywords[lexeme.toLowerCase()];
						this._tokens.push({
							type: keyword ?? TokenType.IDENTIFIER,
							line: line,
							start: start,
							end: this._current,
							lexeme: lexeme,
						});
						break;
					}
					throw new UnknownChar(char);
			}
		}
		this._tokens.push({
			type: TokenType.EOF,
			start: this._current,
			end: this._current,
			line: line,
			lexeme: "",
		});
		return this._tokens;
	}

	private _advance() {
		this._current++;
	}

	private _peek() {
		return this.program[1 + this._current];
	}

	private _peekNext() {
		return this.program[2 + this._current];
	}

	private _extractString() {
		let lexeme = "";
		this._advance(); // move to the next position because the current is the quote char
		while (
			this.program[this._current] !== `'` &&
			this.program[this._current] !== `"`
		) {
			lexeme += this.program[this._current];
			this._advance();
		}
		this._advance(); // move to the next position because the current is the quote char
		return lexeme;
	}

	private _extractIdentifier() {
		let lexeme = "";
		while (this._isAlphaNumeric(this.program[this._current])) {
			lexeme += this.program[this._current];
			this._advance();
		}

		const not = getKeyByValue(keywords, TokenType.NOT);
		const is = getKeyByValue(keywords, TokenType.IS);
		const between = getKeyByValue(keywords, TokenType.BETWEEN);
		const like = getKeyByValue(keywords, TokenType.LIKE);
		const ilike = getKeyByValue(keywords, TokenType.ILIKE);

		if (
			new RegExp(`^${not}$`, "ig").test(lexeme ?? "") &&
			new RegExp(`^${is}$`, "ig").test(this._tokens.at(-1)?.lexeme ?? "")
		) {
			this._tokens.splice(this._tokens.length - 1, 1);
			return `${is} ${not}`;
		}

		if (
			new RegExp(`^${between}$`, "ig").test(lexeme ?? "") &&
			new RegExp(`^${not}$`, "ig").test(this._tokens.at(-1)?.lexeme ?? "")
		) {
			this._tokens.splice(this._tokens.length - 1, 1);
			return `${not} ${between}`;
		}

		if (
			new RegExp(`^${like}$`, "ig").test(lexeme ?? "") &&
			new RegExp(`^${not}$`, "ig").test(this._tokens.at(-1)?.lexeme ?? "")
		) {
			this._tokens.splice(this._tokens.length - 1, 1);
			return `${not} ${like}`;
		}

		if (
			new RegExp(`^${ilike}$`, "ig").test(lexeme ?? "") &&
			new RegExp(`^${not}$`, "ig").test(this._tokens.at(-1)?.lexeme ?? "")
		) {
			this._tokens.splice(this._tokens.length - 1, 1);
			return `${not} ${ilike}`;
		}

		return lexeme;
	}

	private _extractDigits() {
		let lexeme = "";
		while (this._isDigit(this.program[this._current])) {
			lexeme += this.program[this._current];
			this._advance();
		}
		if (this.program[this._current] === ".") {
			this._advance();
			lexeme += ".";
			lexeme += this._extractDigits();
		}
		return lexeme;
	}

	private _isAlphaNumeric(c: string): boolean {
		return this._isAlpha(c) || this._isDigit(c);
	}

	private _isAlpha(c: string) {
		return (
			(c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_" || c == "."
		);
	}

	private _isDigit(c: string) {
		return c >= "0" && c <= "9";
	}
}
