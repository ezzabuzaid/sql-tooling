import { Visitor } from "../../interpreter/visitor";
import { Literal } from "../literal";
import { Varient } from "../varient";

export class NumericLiteral extends Literal {
	public override varient: Varient = "int";
	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitLiteralExpr(this);
	}
}
