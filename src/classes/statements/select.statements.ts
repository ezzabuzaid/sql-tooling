import { Visitor } from "../../interpreter/visitor";
import { Expression } from "../expression";
import { GroupByExpression } from "../group_expression";
import { Identifier } from "../identifier";
import { Statement } from "../statement";
import { Varient } from "../varient";

export class SelectStatement extends Statement {
	public override varient: Varient = "select";
	public joins: Expression[] = [];
	public columns: (Identifier | Expression)[] = [];
	public from?: Expression;
	public where?: Expression;
	public order?: Expression;
	public group?: GroupByExpression; // FIXME maybe list?
	public having?: GroupByExpression; // FIXME maybe list?
	public distinct?: boolean = undefined;
	public all?: boolean = undefined;
	public limit?: Expression;

	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitSelectStmt(this);
	}
	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}
