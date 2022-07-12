export type IdentifierVarient = "column" | "table" | "name";
export abstract class Identifier {
	public type = "identifier";
	public abstract varient: IdentifierVarient;
}
