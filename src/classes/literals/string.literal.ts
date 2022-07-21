import { Visitor } from "../../interpreter/visitor";
import { Literal } from "../literal";
import { Varient } from "../varient";

export class StringLiteral extends Literal {
	public override varient: Varient = "string";
	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
}
