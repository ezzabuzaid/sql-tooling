import { Varient } from "./varient";

export abstract class Statement {
	public type = "statement";
	public abstract varient: Varient;
}
