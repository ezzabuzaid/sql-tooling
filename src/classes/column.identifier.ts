import { Expression } from "./expression";
import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class ColumnIdentifier extends Identifier {
	public override varient: Varient = "column";
	constructor(text: string, alias?: string) {
		super(text, alias);
	}
}

export type OrderByDirection = "ASC" | "DESC";
export class OrderByColumn extends Expression {
	public varient: Varient = "operation";
	public direction: OrderByDirection = "ASC";

	constructor(public expression: Expression) {
		super();
	}
}
