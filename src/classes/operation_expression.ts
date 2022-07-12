import { Expression, ExpressionVarient } from "./expression";
import { Identifier } from "./identifier";
import { Literal } from "./literal";

export type Operation =
	| "and"
	| "or"
	| "not"
	| "group_start"
	| "group_end"
	| "<>"
	| "=="
	| "="
	| "<"
	| ">"
	| "<="
	| "+"
	| "-"
	| "/"
	| "*"
	| ">=";

export class BinaryExpression extends Expression {
	public override varient: ExpressionVarient = "operation";
	public format = "binary";

	constructor(
		public left: Identifier | Expression,
		public operator: Identifier,
		public right: Literal | Expression
	) {
		super();
	}
}
export class UnaryExpression extends Expression {
	public override varient: ExpressionVarient = "operation";
	public format = "unary";

	constructor(public operator: Identifier, public right: Literal | Expression) {
		super();
	}
}
export class LiteralExpression extends Expression {
	public override varient: ExpressionVarient = "operation";
	public format = "literal";

	constructor(public operator: Identifier) {
		super();
	}
}
export class GroupingExpression extends Expression {
	public override varient: ExpressionVarient = "operation";
	public format = "grouping";

	constructor(public expression: Expression) {
		super();
	}
}

export class ListExpression extends Expression {
	public override varient: ExpressionVarient = "list";
	public format = "in";
	public expressions: Expression[] = [];

	constructor() {
		super();
	}
}
