import { Expression } from "./expression";
import { Identifier } from "./identifier";
import { Literal } from "./literal";
import { Varient } from "./varient";

export class BinaryExpression extends Expression {
	public override varient: Varient = "operation";

	constructor(
		public left: Identifier | Expression,
		public operator: Identifier,
		public right: Literal | Expression
	) {
		super();
	}
}
