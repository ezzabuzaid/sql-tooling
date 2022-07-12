import { Literal, LiteralVarient } from "./literal";

export class BooleanLiteral extends Literal {
	public override varient: LiteralVarient = "boolean";
}
