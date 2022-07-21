import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class GroupExpression extends Expression {
	public override varient: Varient = "group";
	public columns: Expression[] = [];
	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
}
