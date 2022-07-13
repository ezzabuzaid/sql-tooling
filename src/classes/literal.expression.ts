import { Expression } from "./expression";
import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class LiteralExpression extends Expression {
	public override varient: Varient = "operation";
	public format = "literal";

	constructor(public operator: Identifier) {
		super();
	}
}
