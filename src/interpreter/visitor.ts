import { BinaryExpression } from "../classes/binary.expression";
import { CallExpression } from "../classes/call.expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { GroupByExpression } from "../classes/group_expression";
import { Identifier } from "../classes/identifier";
import { BooleanLiteral } from "../classes/literals/boolean.literal";
import { NullLiteral } from "../classes/literals/null.literal";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { StringLiteral } from "../classes/literals/string.literal";
import { SelectStatement } from "../classes/select_statements";
import { UnaryExpression } from "../classes/unary.expression";

export abstract class Visitor<R> {
	public abstract visitCallExpr(
		expr: CallExpression,
		row: Record<string, any>
	): R;
	public abstract visitGroupingExpr(expr: GroupingExpression): R;
	public abstract visitUnaryExpr(expr: UnaryExpression): R;
	public abstract visitNumericLiteralExpr(expr: NumericLiteral): R;
	public abstract visitBinaryExpr(expr: BinaryExpression, context: any): R;
	public abstract visitNullLiteralExpr(expr: NullLiteral): R;
	public abstract visitBooleanLiteralExpr(expr: BooleanLiteral): R;
	public abstract visitStringLiteralExpr(expr: StringLiteral): R;
	public abstract visitIdentifier(expr: Identifier): R;
	public abstract visitSelectStmt(stmt: SelectStatement): R;
	public abstract visitGroupByExpr(expr: GroupByExpression): R;
}
