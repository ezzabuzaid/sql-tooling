import { Literal, LiteralVarient } from "./literal";

export class IntLiteral extends Literal {
	public override varient: LiteralVarient = "int";
}
