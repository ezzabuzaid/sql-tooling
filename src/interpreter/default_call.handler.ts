import { map, mergeMap, Observable } from "rxjs";
import { ajax } from "rxjs/ajax";
import { CallExpression } from "../classes/call.expression";
import { Visitor } from "./visitor";

export default {
	http: (expr: CallExpression, visitor: Visitor<Observable<any>>) => {
		const at = (pos: number) => expr.args[pos].accept(visitor);
		return at(0).pipe(
			mergeMap((url) =>
				ajax<any[]>({
					method: "GET",
					url: url,
					responseType: "json",
				})
			),
			map((response) => response.response)
		);
	},
	cache: () => {},

	upper: () => {},
	lower: () => {},
	substring: () => {},
	trim: () => {},
} as const as Record<
	string,
	(expr: CallExpression, visitor: Visitor<any>) => any
>;
