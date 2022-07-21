import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class UnaryExpression extends Expression {
	public override varient: Varient = "operation";

	constructor(public operator: Identifier, public right: Expression) {
		super();
	}
	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitUnaryExpr(this);
	}
}
