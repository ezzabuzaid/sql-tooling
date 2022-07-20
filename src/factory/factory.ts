import { BinaryExpression } from "../classes/binary.expression";
import {
	ColumnIdentifier,
	OrderByColumn,
	OrderByDirection,
} from "../classes/column.identifier";
import { Expression } from "../classes/expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { Identifier } from "../classes/identifier";
import { LimitExpression } from "../classes/limit.expression";
import { Literal } from "../classes/literal";
import { LiteralExpression } from "../classes/literal.expression";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { OrderExpression } from "../classes/order_expression";
import { SelectStatement } from "../classes/select_statements";
import { UnaryExpression } from "../classes/unary.expression";

export class Factory {
	public createBinaryExpression(
		left: Expression,
		operator: Identifier,
		right: Expression,
		alias?: string
	): Expression {
		const expression = new BinaryExpression(left, operator, right);
		expression.alias = alias;
		return expression;
	}
	public createUnaryExpression(
		operator: Identifier,
		right: Expression
	): Expression {
		const expression = new UnaryExpression(operator, right);
		return expression;
	}
	public createSelectStatement(
		columns: Expression[],
		from: Expression,
		where?: Expression,
		order?: Expression,
		limit?: Expression
	): SelectStatement {
		const statement = new SelectStatement();
		statement.columns = columns;
		statement.from = from;
		statement.where = where;
		statement.order = order;
		statement.limit = limit;
		return statement;
	}

	public createIdentifier(name: string, alias?: string): Identifier {
		return new Identifier(name, alias);
	}

	public createColumnIdentifier(name: string, alias?: string): Identifier {
		return new ColumnIdentifier(name, alias);
	}

	public createFromIdentifier(name: string): Identifier {
		return new ColumnIdentifier(name);
	}

	public createNumericLiteral(name: string): Literal {
		return new NumericLiteral(name);
	}

	public createLiteralExpression(identifier: Identifier): Expression {
		return new LiteralExpression(identifier);
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
		direction: OrderByDirection
	): OrderByColumn {
		const column = new OrderByColumn(identifier);
		column.direction = direction;
		return column;
	}
}
