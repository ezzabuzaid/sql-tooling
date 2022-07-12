import { ColumnIdentifier } from "./column.identifier";
import { Expression, ExpressionVarient } from "./expression";

export class GroupExpression extends Expression {
	public override varient: ExpressionVarient = "group";
	public columns: ColumnIdentifier[] = [];
}
