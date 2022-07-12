import { Identifier, IdentifierVarient } from "./identifier";

export class ColumnIdentifier extends Identifier {
	public override varient: IdentifierVarient = "column";
	constructor(public name: string, public alias?: string) {
		super();
	}
}

export type OrderByDirection = "ASC" | "DESC";
export class OrderByColumn extends ColumnIdentifier {
	public direction: OrderByDirection = "ASC";
}
