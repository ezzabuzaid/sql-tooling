import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class ColumnIdentifier extends Identifier {
	public override varient: Varient = "column";
	constructor(public override text: string, public alias?: string) {
		super(text);
	}
}

export type OrderByDirection = "ASC" | "DESC";
export class OrderByColumn extends ColumnIdentifier {
	public direction: OrderByDirection = "ASC";
}
