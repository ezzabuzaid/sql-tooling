import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class CallExpression extends Expression {
	public override varient: Varient = "call";
	constructor(public callee: Expression, public args: Expression[] = []) {
		super();
	}

	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
}
