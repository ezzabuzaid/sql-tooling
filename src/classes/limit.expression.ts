import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class LimitExpression extends Expression {
	public override varient: Varient = "limit";
	public offset?: Expression;
	constructor(public expression: Expression) {
		super();
	}
	public override accept<R>(visitor: Visitor<R>, context: any): R {
		return visitor.visitLimitExpr(this, context);
	}
	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}
