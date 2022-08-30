import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class ListExpression extends Expression {
	public override varient: Varient = "list";
	public expressions: Expression[] = [];

	constructor() {
		super();
	}

	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}

	public toLiteral(): string {
		throw new Error("Method not implemented.");
	}
}
