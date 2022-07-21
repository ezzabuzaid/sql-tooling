import { BinaryExpression } from "../classes/binary.expression";
import { Identifier } from "../classes/identifier";
import { Literal } from "../classes/literal";
import { UnaryExpression } from "../classes/unary.expression";

export abstract class Visitor<R> {
	public abstract visitUnaryExpr(expr: UnaryExpression): R;
	public abstract visitBinaryExpr(expr: BinaryExpression): R;
	public abstract visitLiteralExpr(expr: Literal): R;
	public abstract visitIdentifier(expr: Identifier): R;
	public abstract visitSelectStmt(expr: Identifier): R;
}
