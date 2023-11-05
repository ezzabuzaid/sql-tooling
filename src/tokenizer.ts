import { UnknownChar } from './errors/unknown_char.error';
import { getKeyByValue, keywords, singleChar } from './factory/factory';
import { IToken, TokenType } from './token';

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
        case '/':
        case '(':
        case ')':
        case '+':
        case ',':
        case ';':
        case '*':
        case '%':
          this._advance();
          this._tokens.push({
            type: singleChar[char],
            line: line,
            start: start,
            end: this._current,
            lexeme: this.program.substring(start, this._current),
          });
          break;
        case '<':
          if (this._peek() === '>') {
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
        case '=':
        case '>':
        case '!':
          const isSingleChar = this._peek() !== '=';
          this._advance();
          const lexeme = this.program.substring(
            start,
            isSingleChar ? this._current : this._current + 1,
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

        case '-':
          if (this._peek() === '-') {
            while (this.program[this._current] !== '\n') {
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
        case '|':
          if (this._peek() === '|') {
            this._advance();
            const lexeme = this.program.substring(start, this._current + 1);
            this._tokens.push({
              type: singleChar[lexeme],
              line: line,
              start: start,
              end: this._current,
              lexeme: lexeme,
            });
            break;
          }

        case ' ':
        case '\r':
        case '\t':
          // Ignore whitespace.
          this._advance();
          break;
        case '\n':
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
      lexeme: '',
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
    let lexeme = '';
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
    let lexeme = '';
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
      new RegExp(`^${not}$`, 'ig').test(lexeme ?? '') &&
      new RegExp(`^${is}$`, 'ig').test(this._tokens.at(-1)?.lexeme ?? '')
    ) {
      this._tokens.splice(this._tokens.length - 1, 1);
      return `${is} ${not}`;
    }

    if (
      new RegExp(`^${between}$`, 'ig').test(lexeme ?? '') &&
      new RegExp(`^${not}$`, 'ig').test(this._tokens.at(-1)?.lexeme ?? '')
    ) {
      this._tokens.splice(this._tokens.length - 1, 1);
      return `${not} ${between}`;
    }

    if (
      new RegExp(`^${like}$`, 'ig').test(lexeme ?? '') &&
      new RegExp(`^${not}$`, 'ig').test(this._tokens.at(-1)?.lexeme ?? '')
    ) {
      this._tokens.splice(this._tokens.length - 1, 1);
      return `${not} ${like}`;
    }

    if (
      new RegExp(`^${ilike}$`, 'ig').test(lexeme ?? '') &&
      new RegExp(`^${not}$`, 'ig').test(this._tokens.at(-1)?.lexeme ?? '')
    ) {
      this._tokens.splice(this._tokens.length - 1, 1);
      return `${not} ${ilike}`;
    }

    return lexeme;
  }

  private _extractDigits() {
    let lexeme = '';
    while (this._isDigit(this.program[this._current])) {
      lexeme += this.program[this._current];
      this._advance();
    }
    if (this.program[this._current] === '.') {
      this._advance();
      lexeme += '.';
      lexeme += this._extractDigits();
    }
    return lexeme;
  }

  private _isAlphaNumeric(c: string): boolean {
    return this._isAlpha(c) || this._isDigit(c);
  }

  private _isAlpha(c: string) {
    return (
      (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_' || c == '.'
    );
  }

  private _isDigit(c: string) {
    return c >= '0' && c <= '9';
  }
}
export const AGGREGATE_FUNCTIONS = [
  'count',
  'group_concat',
  'avg',
  'sum',
  'total',
  'max',
  'min',
];
