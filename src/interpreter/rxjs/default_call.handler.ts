import { map, mergeMap, Observable } from "rxjs";
import { ajax } from "rxjs/ajax";
import { CallExpression } from "../../classes/call.expression";
import { Visitor } from "../visitor";
import { RxJsInterpreter } from "./rxjs.interpreter";

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
	count: (
		expr: CallExpression,
		visitor: RxJsInterpreter,
		context: any
	): Observable<any> => {
		const at = (pos: number) => expr.args[pos].accept(visitor);
		return at(0).pipe(
			map((columnName) => {
				return (prevValue: number) => {
					return prevValue + 1;
				};
			})
		);
	},
	sum: (
		expr: CallExpression,
		visitor: RxJsInterpreter,
		context: any
	): Observable<any> => {
		const at = (pos: number) => expr.args[pos].accept(visitor);
		return at(0).pipe(
			map((columnName) => {
				return context[columnName];
				// return (prevValue: number) => {
				// 	return context[columnName] + prevValue;
				// };
			})
		);
	},
	avg: (
		expr: CallExpression,
		visitor: RxJsInterpreter,
		context: any
	): Observable<any> => {
		const at = (pos: number) => expr.args[pos].accept(visitor);
		return at(0).pipe(
			map((columnName) => {
				return context[columnName];
				// return (prevValue: number) => {
				// 	return context[columnName] + prevValue;
				// };
			})
		);
	},
	cache: () => {},
	upper: (
		expr: CallExpression,
		visitor: Visitor<Observable<any>>,
		context: any
	): Observable<string> => {
		const at = (pos: number) => expr.args[pos].accept(visitor);
		return at(0).pipe(map((columnName) => context[columnName].toUpperCase()));
	},
	lower: (
		expr: CallExpression,
		visitor: Visitor<Observable<any>>,
		context: any
	): Observable<string> => {
		const at = (pos: number) => expr.args[pos].accept(visitor);
		return at(0).pipe(map((columnName) => context[columnName].toLowerCase()));
	},
	substring: () => {},
	trim: () => {},
} as const as Record<
	string,
	(expr: CallExpression, visitor: RxJsInterpreter, row: any) => any
>;

// class Evaluation {
// 	constructor
// }
export const sum = (list: Record<string, any>, key: string) => {
	list[0][key] = list.reduce((acc: number, item: any) => {
		return (acc += item[key]);
	}, 0);
	return [list[0]];
};
