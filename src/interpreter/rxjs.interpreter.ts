import { EventEmitter } from "events";
import {
	EMPTY,
	forkJoin,
	from,
	iif,
	map,
	mergeAll,
	mergeMap,
	Observable,
	of,
	switchMap,
	throwError,
	toArray,
	withLatestFrom,
} from "rxjs";
import { ajax } from "rxjs/ajax";
import { Expression } from "../classes/expression";
import { Identifier } from "../classes/identifier";
import { SelectStatement } from "../classes/select_statements";
import { Visitor } from "./visitor";

import { BinaryExpression } from "../classes/binary.expression";
import { CallExpression } from "../classes/call.expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { GroupByExpression } from "../classes/group_expression";
import { BooleanLiteral } from "../classes/literals/boolean.literal";
import { Literal } from "../classes/literals/literal";
import { NullLiteral } from "../classes/literals/null.literal";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { StringLiteral } from "../classes/literals/string.literal";
import { UnaryExpression } from "../classes/unary.expression";
import { TokenType } from "../tokenizer";

export class RxJsInterpreter extends Visitor<Observable<any>> {
	public visitCallExpr(
		expr: CallExpression,
		row: Record<string, any>
	): Observable<any> {
		return expr.callee.accept(this).pipe(
			map((functionName) => functionName.toLowerCase()),
			switchMap((functionName) => {
				const at = (pos: number) => expr.args[pos].accept(this);
				switch (functionName) {
					case "http":
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
					default:
						throw new Error("Unsupported function " + functionName);
				}
			})
		);
	}
	public visitGroupByExpr(stmt: GroupByExpression): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitNumericLiteralExpr(expr: NumericLiteral): Observable<any> {
		throw new Error("Method not implemented.");
	}
	#eventEmitter = new EventEmitter();

	public visitGroupingExpr(expr: GroupingExpression): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitUnaryExpr(expr: UnaryExpression): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitBinaryExpr(
		expr: BinaryExpression,
		row: Record<string, any>
	): Observable<any> {
		return forkJoin([expr.left.accept(this), expr.right.accept(this)]).pipe(
			map(([left, right]) => {
				const operator = expr.operator.type;
				switch (operator) {
					case TokenType.EQUAL_EQUAL:
						return row[left] === right;
					case TokenType.NOT_EQUAL:
						return row[left] !== right;

					default:
						throw new Error("Unsupported binary token");
				}
			})
		);
	}

	public visitLiteralExpr(expr: Literal): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitNullLiteralExpr(expr: NullLiteral): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitBooleanLiteralExpr(expr: BooleanLiteral): Observable<any> {
		return of(expr.value === "true");
	}
	public visitStringLiteralExpr(expr: StringLiteral): Observable<any> {
		return of(expr.value);
	}

	public visitIdentifier(expr: Identifier): Observable<any> {
		return of(expr.alias || expr.text);
	}

	public visitSelectStmt(stmt: SelectStatement): Observable<any> {
		const columns$: Observable<string[]> = from(stmt.columns).pipe(
			mergeMap((item) => {
				if (item instanceof Expression || item instanceof Identifier) {
					return item.accept(this);
				}
				return throwError(() => new Error("unhandled"));
			}),
			toArray()
		);

		const where$ = (row: Record<string, any>) =>
			iif(
				() => !!stmt.where,
				stmt
					.where!.accept(this, row)
					.pipe(switchMap((include) => iif(() => include, of(row), EMPTY))),
				of(row)
			);

		const dataset$ = stmt.from!.accept(this) as Observable<
			Record<string, any>[]
		>;
		return dataset$.pipe(
			mergeAll(),
			mergeMap(where$),
			toArray(),
			withLatestFrom(columns$),
			map(([table, columns]) => {
				const result: Record<string, any>[] = [];
				for (const row of table) {
					if (columns.at(0) === "*") {
						result.push(row);
					} else {
						result.push(
							columns.reduce((acc, column) => {
								acc[column] = row[column];
								return acc;
							}, {} as Record<string, any>)
						);
					}
				}
				return result;
			})
		);
	}

	public execute(expr: Expression) {
		return expr.accept(this);
	}

	public on(eventName: string, callback: () => void) {
		this.#eventEmitter.on(eventName, callback);
	}
}
