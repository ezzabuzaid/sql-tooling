import { Expression, ExpressionVarient } from "./expression";
import { Literal } from "./literal";

export class LimitExpression extends Expression {
	public override varient: ExpressionVarient = "limit";
	public offset?: Literal;
	constructor(public start: Literal) {
		super();
	}
}
