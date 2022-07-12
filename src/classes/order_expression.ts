import { OrderByColumn } from "./column.identifier";
import { Expression, ExpressionVarient } from "./expression";

export class OrderExpression extends Expression {
	public override varient: ExpressionVarient = "order";
	public columns: OrderByColumn[] = [];
}
