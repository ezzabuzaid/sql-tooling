import { IToken } from '../token';

export class UnknownPrimary extends Error {
  constructor(public token: IToken<any>) {
    super(`Invalid primary: ${token.type} - ${token.lexeme}`);
    Error.captureStackTrace(this, UnknownPrimary);
    this.name = this.constructor.name;
  }
}
