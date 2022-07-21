import { Visitor } from "../interpreter/visitor";
import { Varient } from "./varient";

export abstract class Expression {
	public abstract varient: Varient;
	public alias?: string;

	public abstract accept<R>(visitor: Visitor<R>): R;
}
