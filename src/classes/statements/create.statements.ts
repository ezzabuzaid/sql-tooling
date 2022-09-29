import { Visitor } from "../../interpreter/visitor";
import { Expression } from "../expression";
import { Identifier } from "../identifier";
import { Statement } from "../statement";
import { Varient } from "../varient";

export class CreateStatement extends Statement {
	public override varient: Varient = "create";
	public check?: Expression;
	public primaryKey?: Constraint;
	public unique?: Constraint;
	public name?: Identifier;
	public temp?: boolean;
	public columns: ColumnDefinition[] = [];

	constructor() {
		super();
	}

	public override accept<R>(visitor: Visitor<R>): R {
		return visitor.visitCreateStmt(this);
	}
	public override toLiteral<R>(): string {
		throw new Error("Method not implemented.");
	}
}

export abstract class Definition {
	public abstract accept<R>(visitor: Visitor<R>): R;
	public abstract toLiteral(): string;
}

export class PrimaryKey extends Definition {
	public columns: Identifier[] = [];

	public accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
	public toLiteral(): string {
		throw new Error("Method not implemented.");
	}
}

export class Constraint extends Definition {
	public columns: Identifier[] = [];

	public accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}
	public toLiteral(): string {
		throw new Error("Method not implemented.");
	}
}

export class ColumnDefinition extends Definition {
	public nullable?: boolean;
	public unique?: boolean;
	public name?: Identifier;
	public dataType?: Identifier;
	public check?: Expression;
	public default?: Identifier;
	constructor() {
		super();
	}

	public accept<R>(visitor: Visitor<R>): R {
		throw new Error("Method not implemented.");
	}

	public toLiteral(): string {
		throw new Error("Method not implemented.");
	}
}
