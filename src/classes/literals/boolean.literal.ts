import { Visitor } from "../../interpreter/visitor";
import { Literal } from "../literal";
import { Varient } from "../varient";

export class BooleanLiteral extends Literal {
	public override varient: Varient = "boolean";
	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
}
