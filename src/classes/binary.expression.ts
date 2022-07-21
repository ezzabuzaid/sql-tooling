import { Visitor } from "../interpreter/visitor";
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

	public accept<R>(visitor: Visitor<R>): R {
		return visitor.visitBinaryExpr(this);
	}
}
