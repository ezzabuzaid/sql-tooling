import { Visitor } from "../interpreter/visitor";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class GroupByExpression extends Expression {
	public override varient: Varient = "group";
	public columns: Expression[] = [];

	public override accept<R>(visitor: Visitor<R>, context?: any): R {
		return visitor.visitGroupByExpr(this, context);
	}
	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}
