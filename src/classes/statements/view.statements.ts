import { Visitor } from "../../interpreter/visitor";
import { Identifier } from "../identifier";
import { Statement } from "../statement";
import { Varient } from "../varient";
import { SelectStatement } from "./select.statements";

export class ViewStatement extends Statement {
	public override varient: Varient = "create";

	constructor(
		public readonly name: Identifier,
		public readonly expression: SelectStatement
	) {
		super();
	}

	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitViewStmt(this);
	}

	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}
