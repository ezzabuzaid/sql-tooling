import { Visitor } from "../../interpreter/visitor";
import { Varient } from "../varient";
import { Literal } from "./literal";

export class BooleanLiteral extends Literal {
	public override varient: Varient = "boolean";
	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitBooleanLiteralExpr(this);
	}
	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}
