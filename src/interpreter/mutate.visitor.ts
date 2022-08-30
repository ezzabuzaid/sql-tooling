import { BinaryExpression } from "../classes/binary.expression";
import { CallExpression } from "../classes/call.expression";
import { Expression } from "../classes/expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { GroupByExpression } from "../classes/group_expression";
import { Identifier } from "../classes/identifier";
import { BooleanLiteral } from "../classes/literals/boolean.literal";
import { Literal } from "../classes/literals/literal";
import { NullLiteral } from "../classes/literals/null.literal";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { StringLiteral } from "../classes/literals/string.literal";
import { SelectStatement } from "../classes/select_statements";
import { Statement } from "../classes/statement";
import { UnaryExpression } from "../classes/unary.expression";
import { Factory } from "../factory/factory";
import { Visitor } from "./visitor";
const factory = new Factory();

type Node = Expression | Statement | Identifier;
export class MutateVisitor extends Visitor<Node> {
	public visitCallExpr(expr: CallExpression, row: Record<string, any>): Node {
		throw new Error("Method not implemented.");
	}
	public visitGroupingExpr(expr: GroupingExpression): Node {
		throw new Error("Method not implemented.");
	}
	public visitUnaryExpr(expr: UnaryExpression): Node {
		throw new Error("Method not implemented.");
	}
	public visitNumericLiteralExpr(expr: NumericLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitBinaryExpr(expr: BinaryExpression, context: any): Node {
		throw new Error("Method not implemented.");
	}
	public visitLiteralExpr(expr: Literal): Node {
		throw new Error("Method not implemented.");
	}
	public visitNullLiteralExpr(expr: NullLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitBooleanLiteralExpr(expr: BooleanLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitStringLiteralExpr(expr: StringLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitIdentifier(expr: Identifier): Node {
		throw new Error("Method not implemented.");
	}
	public visitSelectStmt(stmt: SelectStatement): Node {
		return factory.createSelectStatement(
			(() => {
				const [f] = stmt.columns;
				if (f instanceof Identifier) {
					f.text;
				}
				return [];
			})(),
			stmt.from,
			stmt.where,
			stmt.order,
			stmt.limit
		);
	}
	public visitGroupByExpr(expr: GroupByExpression): Node {
		throw new Error("Method not implemented.");
	}
	public execute(expr: Expression): Node {
		return expr.accept(this);
	}
}