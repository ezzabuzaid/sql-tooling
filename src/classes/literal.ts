import { Expression } from "./expression";
import { Varient } from "./varient";

export abstract class Literal extends Expression {
	public override type = "literal";
	public abstract override varient: Varient;

	constructor(public value: string) {
		super();
	}
}
