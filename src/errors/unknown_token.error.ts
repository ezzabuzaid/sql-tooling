import { IToken, TokenType } from '../token';

export class UnknownToken extends Error {
  constructor(token: IToken<TokenType>) {
    super(
      `Unknown token - Type: ${token.type} - Type Name: ${
        TokenType[token.type]
      } - Lexeme: ${token.lexeme}`,
    );

    Error.captureStackTrace(this, UnknownToken);
    this.name = this.constructor.name;
  }
}
