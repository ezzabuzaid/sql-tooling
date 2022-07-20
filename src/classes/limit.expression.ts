import { Expression } from "./expression";
import { Varient } from "./varient";

export class LimitExpression extends Expression {
	public override varient: Varient = "limit";
	public offset?: Expression;
	constructor(public expression: Expression) {
		super();
	}
}
