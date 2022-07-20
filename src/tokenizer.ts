import { UnknownChar } from "./errors/unknown_char.error";
export enum TokenType {
	// Single-character tokens.
	SINGLE_CHAR = 1,
	COMMA,
	LEFT_PAREN,
	RIGHT_PAREN,
	DOT,
	SEMICOLON,
	PLUS,
	MINUS,
	STAR,
	SLASH,
	MODULO,

	// One or two character tokens.
	MAYBE_DOUBLE_CHAR = 300,
	BANG,
	NOT_EQUAL,
	EQUAL,
	EQUAL_EQUAL,
	GREATER,
	GREATER_EQUAL,
	LESS,
	LESS_EQUAL,

	// Literals.
	LITERALS = 300 * 2,
	IDENTIFIER,
	STRING,
	NUMBER,
	FALSE,
	TRUE,

	// Keywords.
	KEYWORD = 300 * 3,
	SELECT,
	FROM,
	AS,
	BY,
	ASC,
	DESC,
	WHERE,
	LIKE,
	ILIKE,
	BETWEEN,
	SIMILAR,
	IN,
	DISTINCT,
	LIMIT,
	OFFSET,
	AND,
	OR,
	NOT,
	INSERT,
	VALUES,
	IS,
	NULL,
	ALL,
	EXISTS,

	// Clauses
	CALUSES = 300 * 4,
	ORDER,
	GROUP,
	HAVING,

	// // Functions
	// FUNCTIONS = 300 * 5,
	// COUNT,
	// SUM,

	// Others
	EOF = -1,
}

enum GroupType {
	KEYWORD,
}
const singleChar: Record<string, TokenType> = {
	",": TokenType.COMMA,
	"(": TokenType.LEFT_PAREN,
	")": TokenType.RIGHT_PAREN,
	"+": TokenType.PLUS,
	"-": TokenType.MINUS,
	"*": TokenType.STAR,
	";": TokenType.SEMICOLON,
	".": TokenType.DOT,
	"=": TokenType.EQUAL_EQUAL,
	"==": TokenType.EQUAL_EQUAL,
	"<>": TokenType.NOT_EQUAL,
	"!=": TokenType.NOT_EQUAL,
	"<": TokenType.LESS,
	"<=": TokenType.LESS_EQUAL,
	">": TokenType.GREATER,
	">=": TokenType.GREATER_EQUAL,
	"/": TokenType.SLASH,
	"%": TokenType.MODULO,
};

const keywords: Record<string, TokenType> = {
	as: TokenType.AS,
	by: TokenType.BY,
	select: TokenType.SELECT,
	from: TokenType.FROM,
	desc: TokenType.DESC,
	asc: TokenType.ASC,
	order: TokenType.ORDER,
	group: TokenType.GROUP,
	having: TokenType.HAVING,
	where: TokenType.WHERE,
	and: TokenType.AND,
	or: TokenType.OR,
	not: TokenType.NOT,
	all: TokenType.ALL,
	distinct: TokenType.DISTINCT,
	limit: TokenType.LIMIT,
	offset: TokenType.OFFSET,
	like: TokenType.LIKE,
	ilike: TokenType.ILIKE,
	is: TokenType.IS,
	null: TokenType.NULL,
	in: TokenType.IN,
	similar: TokenType.SIMILAR,
	between: TokenType.BETWEEN,
	true: TokenType.FALSE,
	false: TokenType.TRUE,
	exists: TokenType.EXISTS,
};

export interface IToken {
	type: TokenType;
	groupType?: GroupType;
	start: number;
	end: number;
	line: number;
	lexeme: string;
}

export class Tokenizer {
	private _current = 0;
	constructor(private program: string) {}

	tokenize() {
		const tokens: IToken[] = [];
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
					tokens.push({
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
						tokens.push({
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
					tokens.push({
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
						tokens.push({
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
					tokens.push({
						type: TokenType.STRING,
						line: line,
						start: start,
						end: this._current,
						lexeme: this._extractString(),
					});
					break;
				default:
					if (this._isDigit(char)) {
						tokens.push({
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
						tokens.push({
							type: keyword ?? TokenType.IDENTIFIER,
							// groupType: GroupType.KEYWORD,
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
		tokens.push({
			type: TokenType.EOF,
			start: this._current,
			end: this._current,
			line: line,
			lexeme: "",
		});
		return tokens;
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
		// if (this._isAlpha(this._peek())) {
		// 	this._advance();
		// 	lexeme + this._extractIdentifier();
		// }
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
