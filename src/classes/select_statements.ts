import { ColumnIdentifier } from "./column.identifier";
import { Expression } from "./expression";
import { GroupExpression } from "./group_expression";
import { LimitExpression } from "./limit.expression";
import { OrderExpression } from "./order_expression";
import { Statement, StatementVarient } from "./statement";
import { TableIdentifier } from "./table.identifier";

export class SelectStatement extends Statement {
	public override varient: StatementVarient = "select";
	public columns: (ColumnIdentifier | Expression)[] = [];
	public from!: TableIdentifier;
	public where!: Expression;
	public order!: OrderExpression;
	public group!: GroupExpression;
	public distinct?: boolean = undefined;
	public limit?: LimitExpression;
}
