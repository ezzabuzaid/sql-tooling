import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { GroupExpression } from "./group_expression";
import { Identifier } from "./identifier";
import { Statement } from "./statement";
import { Varient } from "./varient";

export class SelectStatement extends Statement {
	public override varient: Varient = "select";
	public columns: (Identifier | Expression)[] = [];
	public from!: Expression;
	public where?: Expression;
	public order?: Expression;
	public group?: GroupExpression; // FIXME maybe list?
	public having?: GroupExpression; // FIXME maybe list?
	public distinct?: boolean = undefined;
	public all?: boolean = undefined;
	public limit?: Expression;

	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
}
