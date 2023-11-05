import { BinaryExpression, BinaryToken } from '../classes/binary.expression';
import {
  ColumnIdentifier,
  OrderByColumn,
  OrderByDirection,
} from '../classes/column.identifier';
import { CrossJoin } from '../classes/CrossJoin';
import { Expression } from '../classes/expression';
import { GroupingExpression } from '../classes/grouping.expression';
import { Identifier } from '../classes/identifier';
import { LimitExpression } from '../classes/limit.expression';
import { BooleanLiteral } from '../classes/literals/boolean.literal';
import { Literal } from '../classes/literals/literal';
import { NullLiteral } from '../classes/literals/null.literal';
import { NumericLiteral } from '../classes/literals/numeric.literal';
import { StringLiteral } from '../classes/literals/string.literal';
import { OrderExpression } from '../classes/order_expression';
import {
  ColumnDefinition,
  Constraint,
  CreateStatement,
  DataType,
  PrimaryKey,
} from '../classes/statements/create.statements';
import { SelectStatement } from '../classes/statements/select.statements';
import { UpdateStatement } from '../classes/statements/update.statements';
import { ViewStatement } from '../classes/statements/view.statements';
import { UnaryExpression, UnaryToken } from '../classes/unary.expression';
import { UnknownTokenType } from '../errors/unknown_token_type.error';
import { IToken, TokenType } from '../token';

export const singleChar: Record<string, TokenType> = {
  ',': TokenType.COMMA,
  '(': TokenType.LEFT_PAREN,
  ')': TokenType.RIGHT_PAREN,
  '+': TokenType.PLUS,
  '-': TokenType.MINUS,
  '*': TokenType.STAR,
  ';': TokenType.SEMICOLON,
  '.': TokenType.DOT,
  '=': TokenType.EQUAL_EQUAL,
  '==': TokenType.EQUAL_EQUAL,
  '<>': TokenType.NOT_EQUAL,
  '!=': TokenType.NOT_EQUAL,
  '<': TokenType.LESS,
  '<=': TokenType.LESS_EQUAL,
  '>': TokenType.GREATER,
  '>=': TokenType.GREATER_EQUAL,
  '/': TokenType.SLASH,
  '%': TokenType.MODULO,
  '||': TokenType.CONCAT,
};

export const keywords: Record<string, TokenType> = {
  as: TokenType.AS,
  by: TokenType.BY,
  select: TokenType.SELECT,
  view: TokenType.VIEW,
  create: TokenType.CREATE,
  table: TokenType.TABLE,
  integer: TokenType.INTEGER,
  int: TokenType.INTEGER,
  text: TokenType.TEXT,
  real: TokenType.REAL,
  bool: TokenType.BOOL,
  boolean: TokenType.BOOL,
  date: TokenType.DATE,
  blob: TokenType.BLOB,
  unique: TokenType.UNIQUE,
  primary: TokenType.PRIMARY,
  key: TokenType.KEY,
  temp: TokenType.TEMP,
  temporary: TokenType.TEMP,
  check: TokenType.CHECK,
  default: TokenType.DEFAULT,
  from: TokenType.FROM,
  desc: TokenType.DESC,
  asc: TokenType.ASC,
  order: TokenType.ORDER,
  group: TokenType.GROUP,
  having: TokenType.HAVING,
  where: TokenType.WHERE,
  and: TokenType.AND,
  or: TokenType.OR,
  is: TokenType.IS,
  not: TokenType.NOT,
  'is not': TokenType.IS_NOT,
  'not between': TokenType.NOT_BETWEEN,
  'not ilike': TokenType.NOT_ILIKE,
  'not like': TokenType.NOT_LIKE,
  all: TokenType.ALL,
  distinct: TokenType.DISTINCT,
  limit: TokenType.LIMIT,
  offset: TokenType.OFFSET,
  like: TokenType.LIKE,
  ilike: TokenType.ILIKE,
  null: TokenType.NULL,
  in: TokenType.IN,
  similar: TokenType.SIMILAR,
  between: TokenType.BETWEEN,
  true: TokenType.FALSE,
  false: TokenType.TRUE,
  exists: TokenType.EXISTS,
  join: TokenType.JOIN,
  cross: TokenType.CROSS,
  update: TokenType.UPDATE,
  set: TokenType.SET,
};

export class Factory {
  public createBinaryExpression(
    left: Expression,
    operator: IToken<BinaryToken>,
    right: Expression,
    alias?: string,
  ): Expression {
    const expression = new BinaryExpression(left, operator, right);
    expression.alias = alias;
    return expression;
  }
  public createUnaryExpression(
    operator: IToken<UnaryToken>,
    right: Expression,
  ): Expression {
    const expression = new UnaryExpression(operator, right);
    return expression;
  }

  public createViewStatement(
    name: Identifier,
    selectStatement: SelectStatement,
  ): ViewStatement {
    const statement = new ViewStatement(name, selectStatement);
    return statement;
  }

  public createCreateStatement(
    name: Identifier,
    temp?: boolean,
    primaryKey?: PrimaryKey,
  ): CreateStatement {
    const statement = new CreateStatement();
    statement.name = name;
    statement.temp = temp;
    statement.primaryKey = primaryKey;
    return statement;
  }

  public createUpdateStatement(
    table: Expression | Identifier,
    columns: (Expression | Identifier)[],
    from?: Expression,
    where?: Expression,
  ): UpdateStatement {
    const statement = new UpdateStatement();
    statement.table = table;
    statement.columns = columns;
    statement.from = from;
    statement.where = where;
    return statement;
  }

  public createSelectStatement(
    columns: (Expression | Identifier)[],
    from?: Expression,
    where?: Expression,
    order?: Expression,
    limit?: Expression,
  ): SelectStatement {
    const statement = new SelectStatement();
    statement.columns = columns;
    statement.from = from;
    statement.where = where;
    statement.order = order;
    statement.limit = limit;
    return statement;
  }

  public createConstraint(columns: Identifier[]): Constraint {
    const key = new Constraint();
    key.columns = columns;
    return key;
  }

  // public createPrimaryKey(columns: Identifier[]): PrimaryKey {
  // 	const key = new PrimaryKey();
  // 	key.columns = columns;
  // 	return key;
  // }

  public createIdentifier(name: string, alias?: string): Identifier {
    return new Identifier(name, alias);
  }

  public createCrossJoin(expression: Expression): CrossJoin {
    return new CrossJoin(expression);
  }

  public createColumnIdentifier(name: string, alias?: string): Identifier {
    return new ColumnIdentifier(name, alias);
  }

  public createColumnDefinition(
    name: Identifier,
    dataType: IToken<DataType>,
    nullable?: boolean,
    unique?: boolean,
    check?: Expression,
    defaultValue?: Identifier,
  ): ColumnDefinition {
    const columnDef = new ColumnDefinition();
    columnDef.name = name;
    columnDef.dataType = dataType;
    columnDef.nullable = nullable;
    columnDef.unique = unique;
    columnDef.check = check;
    columnDef.default = defaultValue;
    return columnDef;
  }

  public createFromIdentifier(name: string): Identifier {
    return new ColumnIdentifier(name);
  }

  public createNumericLiteral(name: string): Literal {
    return new NumericLiteral(name);
  }

  public createStringLiteral(name: string): Literal {
    return new StringLiteral(name);
  }

  public createNullLiteral(name: string): Literal {
    return new NullLiteral(name);
  }

  public createBooleanLiteral(name: string): Literal {
    return new BooleanLiteral(name);
  }

  public createLimitExpression(literal: Literal): Expression {
    return new LimitExpression(literal);
  }

  public createGroupingExpression(expression: Expression): Expression {
    return new GroupingExpression(expression);
  }

  public createOrderExpression(columns: OrderByColumn[]): Expression {
    const expression = new OrderExpression();
    expression.columns = columns;
    return expression;
  }

  public createOrderColumn(
    identifier: Identifier,
    direction: OrderByDirection,
  ): OrderByColumn {
    const column = new OrderByColumn(identifier);
    column.direction = direction;
    return column;
  }

  public createToken<T extends TokenType>(type: T): IToken<T> {
    const lexeme =
      getKeyByValue(singleChar, type) ?? getKeyByValue(keywords, type);
    if (!lexeme) {
      throw new UnknownTokenType(type);
    }
    return {
      type: type,
      lexeme: lexeme,
    };
  }
}

export function getKeyByValue(object: Record<string, any>, value: TokenType) {
  return Object.keys(object).find((key) => object[key] === value);
}
