import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class TableIdentifier extends Identifier {
	public override varient: Varient = "table";
	constructor(public text: string) {
		super();
	}
}
