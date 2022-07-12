import { Identifier, IdentifierVarient } from "./identifier";

export class TableIdentifier extends Identifier {
	public override varient: IdentifierVarient = "table";
	constructor(public name: string) {
		super();
	}
}
