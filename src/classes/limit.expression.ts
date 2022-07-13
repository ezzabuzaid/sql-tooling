import { Expression } from "./expression";
import { Literal } from "./literal";
import { Varient } from "./varient";

export class LimitExpression extends Expression {
	public override varient: Varient = "limit";
	public offset?: Literal;
	constructor(public start: Literal) {
		super();
	}
}
