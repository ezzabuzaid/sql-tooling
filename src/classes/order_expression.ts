import { Visitor } from "../interpreter/visitor";
import { OrderByColumn } from "./column.identifier";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class OrderExpression extends Expression {
	public override varient: Varient = "order";
	public columns: OrderByColumn[] = [];
	public override accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
}
