import { Expression, ExpressionVarient } from "./expression";
import { Identifier, IdentifierVarient } from "./identifier";

export class NameIdentifier extends Identifier {
	public override varient: IdentifierVarient = "name";
	constructor(public name: string) {
		super();
	}
}

export class CallExpression extends Expression {
	public override varient: ExpressionVarient = "call";
	public name!: NameIdentifier;
	public arguments: Identifier[] = [];
}
