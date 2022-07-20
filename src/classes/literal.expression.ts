import { Expression } from "./expression";
import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class LiteralExpression extends Expression {
	public override varient: Varient = "operation";

	constructor(public operator: Identifier) {
		super();
	}
}
