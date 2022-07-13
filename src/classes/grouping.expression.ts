import { Expression } from "./expression";
import { Varient } from "./varient";

export class GroupingExpression extends Expression {
	public override varient: Varient = "operation";
	public format = "grouping";

	constructor(public expression: Expression) {
		super();
	}
}
