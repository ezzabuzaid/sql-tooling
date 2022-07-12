import { Literal, LiteralVarient } from "./literal";

export class StringLiteral extends Literal {
	public override varient: LiteralVarient = "string";
}
