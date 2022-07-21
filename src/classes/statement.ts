import { Visitor } from "../interpreter/visitor";
import { Varient } from "./varient";

export abstract class Statement {
	public type = "statement";
	public abstract varient: Varient;

	public abstract accept<R>(visitor: Visitor<R>): R;
}
