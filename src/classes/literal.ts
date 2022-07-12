export type LiteralVarient =
	| "string"
	| "double"
	| "int"
	| "float"
	| "decimal"
	| "boolean";
export abstract class Literal {
	public type = "literal";
	public abstract varient: LiteralVarient;

	constructor(public value: string) {}
}
