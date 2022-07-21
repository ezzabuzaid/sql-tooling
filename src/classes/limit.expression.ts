import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class LimitExpression extends Expression {
	public override varient: Varient = "limit";
	public offset?: Expression;
	constructor(public expression: Expression) {
		super();
	}
	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
}
