import { BinaryExpression } from '../classes/binary.expression';
import { CallExpression } from '../classes/call.expression';
import { OrderByColumn } from '../classes/column.identifier';
import { Expression } from '../classes/expression';
import { GroupByExpression } from '../classes/group_expression';
import { GroupingExpression } from '../classes/grouping.expression';
import { Identifier } from '../classes/identifier';
import { LimitExpression } from '../classes/limit.expression';
import { BooleanLiteral } from '../classes/literals/boolean.literal';
import { NullLiteral } from '../classes/literals/null.literal';
import { NumericLiteral } from '../classes/literals/numeric.literal';
import { StringLiteral } from '../classes/literals/string.literal';
import { OrderExpression } from '../classes/order_expression';
import { Statement } from '../classes/statement';
import {
  ColumnDefinition,
  CreateStatement,
  DataType,
} from '../classes/statements/create.statements';
import { SelectStatement } from '../classes/statements/select.statements';
import { UpdateStatement } from '../classes/statements/update.statements';
import { ViewStatement } from '../classes/statements/view.statements';
import { UnaryExpression } from '../classes/unary.expression';
import { TokenType } from '../token';

import { Visitor } from './visitor';

export class GraphQlVisitor extends Visitor<string> {
  public override visitOrderByColumn(expr: OrderByColumn): string {
    throw new Error('Method not implemented.');
  }
  public override visitOrderByExpr(
    expr: OrderExpression,
    context?: any,
  ): string {
    throw new Error('Method not implemented.');
  }
  private _schema: Record<string, string> = {};
  public visitUpdateStmt(stmt: UpdateStatement): string {
    throw new Error('Method not implemented.');
  }
  public visitColumnDefinition(definition: ColumnDefinition): any {
    const type: Record<DataType, string> = {
      [TokenType.INTEGER]: 'Int',
      [TokenType.TEXT]: 'String',
      [TokenType.REAL]: 'Float',
      [TokenType.BOOL]: 'Boolean',
      [TokenType.DATE]: 'String',
    };
    return {
      [definition.name.text]: type[definition.dataType.type],
    };
  }
  public visitCreateStmt(stmt: CreateStatement): any {
    const defs = stmt.columns.reduce(
      (acc, item) => ({ ...acc, ...item.accept(this) }),
      {},
    );
    this._schema = defs;
  }
  public visitLimitExpr(expr: LimitExpression, context?: any): string {
    throw new Error('Method not implemented.');
  }
  public visitCallExpr(expr: CallExpression): string {
    const functionName = expr.callee.accept(this).toLowerCase();
    const args = this._parseColumns(expr.args);
    return `${functionName}(${args})`;
  }
  public visitGroupByExpr(expr: GroupByExpression): string {
    const columns =
      ' ' + expr.columns.map((column) => column.accept(this)).join(', ');
    return `group by${columns}`;
  }
  public visitGroupingExpr(expr: GroupingExpression): string {
    throw new Error('Method not implemented.');
  }
  public visitUnaryExpr(expr: UnaryExpression): string {
    throw new Error('Method not implemented.');
  }
  public visitNumericLiteralExpr(expr: NumericLiteral): string {
    return `${expr.value}`;
  }

  public visitBinaryExpr(expr: BinaryExpression, fromView: boolean): string {
    let operator: string;
    switch (expr.operator.type) {
      case TokenType.EQUAL_EQUAL:
        operator = ':';
        break;
      default:
        throw new Error('Unsupported binary token');
    }
    if (!fromView) {
      const left = expr.left.accept(this);
      const right = expr.right.accept(this);
      return `${left} ${operator} ${right}`;
    }
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    return `${right} ${operator} ${this._schema[left]}`;
  }

  public visitNullLiteralExpr(expr: NullLiteral): string {
    throw new Error('Method not implemented.');
  }
  public visitBooleanLiteralExpr(expr: BooleanLiteral): string {
    throw new Error('Method not implemented.');
  }
  public visitStringLiteralExpr(expr: StringLiteral): string {
    if (expr.value.startsWith('$')) {
      return `${expr.value}`;
    }
    return `"${expr.value}"`;
  }
  public visitIdentifier(expr: Identifier): string {
    return expr.alias ?? expr.text;
  }
  public visitSelectStmt(stmt: SelectStatement, parent?: Statement): string {
    const columns = ' ' + this._parseColumns(stmt.columns);
    const from = this._formatFrom(stmt.from);
    const topLevel = !parent;
    const where = stmt.where ? stmt.where.accept(this, false) : '';

    const query = `${from.accept(this)}(${where}) {
					${columns}
				}`;
    return topLevel ? `query {${query}}` : query;
  }
  public visitViewStmt(stmt: ViewStatement): string {
    const where = stmt.expression.where
      ? stmt.expression.where.accept(this, true)
      : '';
    return `query ${stmt.name.text} (${where}) {
					${stmt.expression.accept(this, stmt)}
				}`;
  }
  public execute(stms: Statement[]): string {
    const createStatementIndex = stms[0];
    if (!(createStatementIndex instanceof CreateStatement)) {
      throw new Error('CREATE statement is absent.');
    }
    createStatementIndex.accept(this);
    return stms.slice(1).reduce((acc, item) => (acc += item.accept(this)), '');
  }

  private _formatFrom(from: SelectStatement['from']) {
    if (!from || from instanceof Expression) {
      throw new Error('FROM have to be identifier');
    }
    return from;
  }

  private _parseColumns(columns: SelectStatement['columns']) {
    return columns
      .map((column) => {
        const value = column.accept(this);
        if (column instanceof SelectStatement) {
          throw new Error('Column name cannot be an expression');
        }
        return value.split('.').at(-1);
      })
      .join('\n');
  }
}

// TODO: with clause = fragments
