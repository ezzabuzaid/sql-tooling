import { Literal } from "../literal";
import { Varient } from "../varient";

export class BooleanLiteral extends Literal {
	public override varient: Varient = "boolean";
}
