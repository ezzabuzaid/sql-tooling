import { map, OperatorFunction } from "rxjs";
import { Parser } from "./parser";
import { IToken, Tokenizer } from "./tokenizer";

export function tokenize(): OperatorFunction<string, IToken[]> {
	return (source) =>
		source.pipe(
			map((program) => {
				const tokenizer = new Tokenizer(program);
				return tokenizer.tokenize();
			})
		);
}
export function parse(): OperatorFunction<IToken[], any> {
	return (source) =>
		source.pipe(
			map((tokens) => {
				const parser = new Parser(tokens);
				return parser.parse();
			})
		);
}
