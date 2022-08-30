import { Visitor } from "../../interpreter/visitor";
import { Varient } from "../varient";
import { Literal } from "./literal";

export class NullLiteral extends Literal {
	public override varient: Varient = "string";
	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitNullLiteralExpr(this);
	}
	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}
