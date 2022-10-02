import { Visitor } from "../../interpreter/visitor";
import { Expression } from "../expression";
import { Identifier } from "../identifier";
import { Statement } from "../statement";
import { Varient } from "../varient";

export class UpdateStatement extends Statement {
	public override varient: Varient = "update";
	public columns: (Identifier | Expression)[] = [];
	public table?: Expression;
	public from?: Expression;
	public where?: Expression;

	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitUpdateStmt(this);
	}
	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}
