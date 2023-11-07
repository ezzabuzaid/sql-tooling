import { Visitor } from '../interpreter/visitor';
import { Expression } from './expression';
import { Identifier } from './identifier';
import { Varient } from './varient';

export class ColumnIdentifier extends Identifier {
  public override varient: Varient = 'column';
  constructor(text: string, alias?: string) {
    super(text, alias);
  }
}

export type OrderByDirection = 'ASC' | 'DESC';
export class OrderByColumn extends Expression {
  public varient: Varient = 'operation';
  public direction: OrderByDirection = 'ASC';

  constructor(public expression: Expression) {
    super();
  }

  public override accept<R>(visitor: Visitor<R>): R {
    return visitor.visitOrderByColumn(this);
  }

  public override toLiteral<R>(): string {
    throw new Error('Method not implemented.');
  }
}
