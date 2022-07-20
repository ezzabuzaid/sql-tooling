import { Expression } from "./expression";
import { Varient } from "./varient";

export class ListExpression extends Expression {
	public override varient: Varient = "list";
	public expressions: Expression[] = [];

	constructor() {
		super();
	}
}
