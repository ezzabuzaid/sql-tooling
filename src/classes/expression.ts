import { Varient } from "./varient";

export abstract class Expression {
	public type = "expression";
	public abstract varient: Varient;
}
