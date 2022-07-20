import { Literal } from "../literal";
import { Varient } from "../varient";

export class NumericLiteral extends Literal {
	public override varient: Varient = "int";
}
