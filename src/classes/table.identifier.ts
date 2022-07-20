import { Identifier } from "./identifier";
import { Varient } from "./varient";

export class TableIdentifier extends Identifier {
	public override varient: Varient = "table";
	constructor(text: string) {
		super(text);
	}
}
