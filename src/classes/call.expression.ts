import { Expression } from "./expression";
import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class NameIdentifier extends Identifier {
	public override varient: Varient = "name";
	constructor(public text: string) {
		super();
	}
}

export class CallExpression extends Expression {
	public override varient: Varient = "call";
	public name!: NameIdentifier;
	public arguments: Identifier[] = [];
}
