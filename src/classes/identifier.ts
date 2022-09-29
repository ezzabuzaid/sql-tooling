import { Visitor } from "../interpreter/visitor";
import { Varient } from "./varient";

export class Identifier {
	public varient!: Varient;
	constructor(public text: string, public alias?: string) {}

	public accept<R>(visitor: Visitor<R>): R {
		return visitor.visitIdentifier(this);
	}
	public toLiteral(): string {
		return this.alias || this.text;
	}
}
