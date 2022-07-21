import { BinaryExpression } from "../classes/binary.expression";
import { Expression } from "../classes/expression";
import { Identifier } from "../classes/identifier";
import { Literal } from "../classes/literal";
import { UnaryExpression } from "../classes/unary.expression";
import { Visitor } from "./visitor";

export class PrintInterpreter extends Visitor<string> {
	public visitSelectStmt(expr: Identifier): string {}
	public visitUnaryExpr(expr: UnaryExpression): string {}
	public visitIdentifier(expr: Identifier): string {
		return expr.text;
	}

	public visitLiteralExpr(expr: Literal): string {
		return expr.value;
	}

	public print(expression: Expression) {
		return expression.accept(this);
	}

	public visitBinaryExpr(expr: BinaryExpression): string {}
}
