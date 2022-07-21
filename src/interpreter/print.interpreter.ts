import { BinaryExpression } from "../classes/binary.expression";
import { Expression } from "../classes/expression";
import { Identifier } from "../classes/identifier";
import { Literal } from "../classes/literal";
import { UnaryExpression } from "../classes/unary.expression";
import { Visitor } from "./visitor";

export class PrintInterpreter extends Visitor<string> {
	public visitSelectStmt(expr: Identifier): string {
		throw new Error("Method not implemented.");
	}
	public visitUnaryExpr(expr: UnaryExpression): string {
		return this.parenthesize(expr.operator.text, expr.right);
	}
	public visitIdentifier(expr: Identifier): string {
		return expr.text;
	}
	public visitLiteralExpr(expr: Literal): string {
		return expr.value;
	}

	public print(expression: Expression) {
		return expression.accept(this);
	}

	public visitBinaryExpr(expr: BinaryExpression): string {
		return this.parenthesize(expr.operator.text, expr.left, expr.right);
	}

	private parenthesize(name: string, ...exprs: Expression[]) {
		let builder = `(${name}`;
		for (const expr of exprs) {
			builder += " ";
			builder += expr.accept(this);
		}
		builder += ")";
		return builder;
	}
}
