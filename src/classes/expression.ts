import { Varient } from "./varient";

export abstract class Expression {
	public abstract varient: Varient;
	public alias?: string;
}
