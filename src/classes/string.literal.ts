import { Literal } from "./literal";
import { Varient } from "./varient";

export class StringLiteral extends Literal {
	public override varient: Varient = "string";
}
