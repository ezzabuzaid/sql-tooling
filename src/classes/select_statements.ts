import { Expression } from "./expression";
import { GroupExpression } from "./group_expression";
import { Identifier } from "./identifier";
import { LimitExpression } from "./limit.expression";
import { OrderExpression } from "./order_expression";
import { Statement } from "./statement";
import { Varient } from "./varient";

export class SelectStatement extends Statement {
	public override varient: Varient = "select";
	public columns: (Identifier | Expression)[] = [];
	public from!: Identifier;
	public where?: Expression;
	public order?: OrderExpression;
	public group?: GroupExpression;
	public distinct?: boolean = undefined;
	public limit?: LimitExpression;
}
