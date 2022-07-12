export type ExpressionVarient =
	| "list"
	| "limit"
	| "call"
	| "where"
	| "group"
	| "order"
	| "operation";
export abstract class Expression {
	public type = "expression";
	public abstract varient: ExpressionVarient;
}
