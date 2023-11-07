import { BinaryExpression } from '../../classes/binary.expression';
import { CallExpression } from '../../classes/call.expression';
import { OrderByColumn } from '../../classes/column.identifier';
import { GroupByExpression } from '../../classes/group_expression';
import { GroupingExpression } from '../../classes/grouping.expression';
import { Identifier } from '../../classes/identifier';
import { LimitExpression } from '../../classes/limit.expression';
import { BooleanLiteral } from '../../classes/literals/boolean.literal';
import { NullLiteral } from '../../classes/literals/null.literal';
import { NumericLiteral } from '../../classes/literals/numeric.literal';
import { StringLiteral } from '../../classes/literals/string.literal';
import { OrderExpression } from '../../classes/order_expression';
import { Statement } from '../../classes/statement';
import {
  ColumnDefinition,
  CreateStatement,
} from '../../classes/statements/create.statements';
import { SelectStatement } from '../../classes/statements/select.statements';
import { UpdateStatement } from '../../classes/statements/update.statements';
import { ViewStatement } from '../../classes/statements/view.statements';
import { UnaryExpression } from '../../classes/unary.expression';
import { TokenType } from '../../token';
import { Visitor } from '../visitor';

export class ODataVisitor extends Visitor<string> {
  public override visitCallExpr(
    expr: CallExpression,
    context: Record<string, any>,
  ): string {
    const fn = expr.callee.accept(this).toLowerCase();
    const args = expr.args.map((item) => item.accept(this));
    switch (fn) {
      case 'substring':
        const start = +args[1] - 1;
        const length = +args[2];
        return `${fn}(${args[0]}, ${start}, ${length})`;
      case 'length':
        return `length(${args[0]})`;
      case 'upper':
        return `toupper(${args[0]})`;
      case 'lower':
        return `tolower(${args[0]})`;
      case 'trim':
        return `trim(${args[0]})`;
      case 'replace':
        return `replace(${args[0]}, ${args[1]}, ${args[2]})`;
      case 'instr':
        return `indexof(${args[0]}, ${args[1]})`;
      case 'strftime': {
        const map: Record<string, string> = {
          "'%d'": 'day',
          "'%m'": 'month',
          "'%Y'": 'year',
          "'%H'": 'hour',
          "'%M'": 'minute',
          "'%S'": 'second',
          "'%H:%M:%S'": 'time',
          "'%Y-%m-%d'": 'date',
        };
        const fn = map[args[0]];
        if (!fn) {
          throw new Error(`Function ${fn} not implemented.`);
        }
        const arg = args[1];
        return `${fn}(${arg})`;
      }
      default:
        throw new Error(`Function ${fn} not implemented.`);
    }
  }
  public override visitGroupingExpr(expr: GroupingExpression): string {
    const value = expr.expression.accept(this);
    return `(${value})`;
  }
  public override visitUnaryExpr(expr: UnaryExpression): string {
    const right = expr.right.accept(this);

    return `not ${right}`;
  }
  public override visitNumericLiteralExpr(expr: NumericLiteral): string {
    return expr.value.toString();
  }
  public override visitBinaryExpr(
    expr: BinaryExpression,
    context: any,
  ): string {
    const left = expr.left.accept(this, {
      ...context,
      parent: {
        operator: expr.operator,
        value: null,
      },
    });
    const right = expr.right.accept(this, {
      ...context,
      parent: {
        operator: expr.operator,
        value: left,
      },
    });
    switch (expr.operator.type) {
      case TokenType.EQUAL_EQUAL:
        return `${left} eq ${right}`;
      case TokenType.NOT_EQUAL:
        return `${left} ne ${right}`;
      case TokenType.AND:
        if (context?.parent.operator.type === TokenType.BETWEEN) {
          return `${context.parent.value} ge ${left} and ${context.parent.value} le ${right}`;
        }
        return `${left} and ${right}`;
      case TokenType.OR:
        return `${left} or ${right}`;
      case TokenType.GREATER:
        let operator = 'gt';
        let operand: string | number = right;
        if (left.startsWith('indexof')) {
          operator = 'ge';
          operand = +right + 1;
        }
        return `${left} ${operator} ${operand}`;
      case TokenType.GREATER_EQUAL:
        return `${left} ge ${right}`;
      case TokenType.LESS:
        return `${left} lt ${right}`;
      case TokenType.LESS_EQUAL:
        return `${left} le ${right}`;
      case TokenType.BETWEEN:
        return `${right}`;
      case TokenType.STAR:
        return `${left} mul ${right}`;
      case TokenType.SLASH:
        return `${left} div ${right}`;
      case TokenType.PLUS:
        return `${left} add ${right}`;
      case TokenType.MINUS:
        return `${left} sub ${right}`;
      case TokenType.MODULO:
        return `${left} mod ${right}`;
      case TokenType.CONCAT:
        return `concat(${left}, ${right})`;

      case TokenType.LIKE:
        let unstring = right.replace(/'/g, '');
        switch (true) {
          case unstring.startsWith('%') && unstring.endsWith('%'):
            unstring = unstring.replace(/^%/, '').replace(/%$/, '');
            return `contains(${left}, '${unstring}')`;
          case unstring.endsWith('%'):
            unstring = unstring.replace(/%$/, '');
            return `startswith(${left}, '${unstring}')`;
          case unstring.startsWith('%'):
            unstring = unstring.replace(/^%/, '');
            return `endswith(${left}, '${unstring}')`;
          case unstring.includes('%'):
            const [start, end] = unstring.split('%');
            return `startswith(${left}, '${start}') and endswith(${left}, '${end}')`;
          case unstring.startsWith('_'):
            const length = unstring.length;
            unstring = unstring.replace(/^_/, '');
            return `length(${left}) eq ${length} and endswith(${left}, '${unstring}')`;
          default:
            throw new Error(
              `${unstring} is not a valid value for ${
                TokenType[expr.operator.type]
              }`,
            );
        }

      default:
        throw new Error(
          `Operator ${TokenType[expr.operator.type]} not implemented.`,
        );
    }
  }
  public override visitNullLiteralExpr(expr: NullLiteral): string {
    throw new Error('Method not implemented.');
  }
  public override visitBooleanLiteralExpr(expr: BooleanLiteral): string {
    throw new Error('Method not implemented.');
  }
  public override visitStringLiteralExpr(expr: StringLiteral): string {
    return `'${expr.value}'`;
  }
  public override visitIdentifier(expr: Identifier): string {
    return expr.text;
  }
  public override visitSelectStmt(
    stmt: SelectStatement,
    context?: any,
  ): string {
    const columns = stmt.columns.map((item) => item.accept(this));
    const $select = columns[0] !== '*' ? `$select=${columns.join(',')}` : '';
    let $filter = '';
    if (stmt.where) {
      const where = stmt.where.accept(this);
      $filter = `$filter=${where}`;
    }
    if (!stmt.from) throw new Error('No resource specified');
    let $top = '';
    if (stmt.limit) {
      $top = stmt.limit.accept(this);
    }

    let $orderby = '';
    if (stmt.order) {
      $orderby = `$orderby=${stmt.order.accept(this)}`;
    }

    const resource = stmt.from.accept(this);

    return `/${resource}?${[
      $select,
      $filter,
      $top,
      $orderby,
      // $count,
    ]
      .filter((item) => item)
      .join('&')}`;
  }
  public override visitCreateStmt(stmt: CreateStatement): string {
    throw new Error('Method not implemented.');
  }
  public override visitViewStmt(stmt: ViewStatement): string {
    throw new Error('Method not implemented.');
  }
  public override visitUpdateStmt(stmt: UpdateStatement): string {
    throw new Error('Method not implemented.');
  }
  public override visitColumnDefinition(definition: ColumnDefinition): string {
    throw new Error('Method not implemented.');
  }
  public override visitGroupByExpr(
    expr: GroupByExpression,
    context?: any,
  ): string {
    throw new Error('Method not implemented.');
  }
  public override visitLimitExpr(expr: LimitExpression, context?: any): string {
    const limit = expr.expression.accept(this);
    const offset = expr.offset?.accept(this) ?? '';
    return `$top=${limit}&${offset ? `$skip=${offset}` : ''}`;
  }
  public override visitOrderByExpr(
    expr: OrderExpression,
    context?: any,
  ): string {
    const columns = expr.columns.map((item) => item.accept(this));
    return columns.join(',');
  }

  public override visitOrderByColumn(expr: OrderByColumn): string {
    const column = expr.expression.accept(this);
    return `${column} ${expr.direction}`;
  }

  public execute(stmts: Statement[]) {
    const select = stmts.find((item) => item instanceof SelectStatement);
    if (!select) {
      throw new Error();
    }
    return select.accept(this);
  }
}
