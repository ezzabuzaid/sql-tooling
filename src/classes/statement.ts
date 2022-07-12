export type StatementVarient = "select" | "update" | "alter";
export abstract class Statement {
	public type = "statement";
	public abstract varient: StatementVarient;
}
