import { Visitor } from '../interpreter/visitor';
import { IToken, TokenType } from '../token';
import { Expression } from './expression';
import { Varient } from './varient';

export type UnaryToken = TokenType.MINUS | TokenType.NOT;

export class UnaryExpression extends Expression {
  public override varient: Varient = 'operation';

  constructor(
    public operator: IToken<UnaryToken>,
    public right: Expression,
  ) {
    super();
  }
  public override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
  public override toLiteral<R>(): string {
    throw new Error('Method not implemented.');
  }
}
