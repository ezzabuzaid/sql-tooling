import { ColumnIdentifier } from "./column.identifier";
import { Expression } from "./expression";
import { Varient } from "./varient";

export class GroupExpression extends Expression {
	public override varient: Varient = "group";
	public columns: ColumnIdentifier[] = [];
}
