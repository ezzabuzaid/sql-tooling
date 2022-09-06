import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class CrossJoin extends Expression {
	public varient: Varient = "join";

	constructor(public source: Expression) {
		super();
	}
	public accept<R>(visitor: Visitor<R>, context?: any): R {
		throw new Error("Method not implemented.");
	}
	public toLiteral(): string {
		throw new Error("Method not implemented.");
	}
}
