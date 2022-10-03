import {
	combineLatest,
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
	tap,
	toArray,
} from "rxjs";
import { Expression } from "../../classes/expression";
import { Identifier } from "../../classes/identifier";
import { SelectStatement } from "../../classes/statements/select.statements";
import { Visitor } from "../visitor";

import { BinaryExpression } from "../../classes/binary.expression";
import { CallExpression } from "../../classes/call.expression";
import { GroupingExpression } from "../../classes/grouping.expression";
import { GroupByExpression } from "../../classes/group_expression";
import { LimitExpression } from "../../classes/limit.expression";
import { BooleanLiteral } from "../../classes/literals/boolean.literal";
import { NullLiteral } from "../../classes/literals/null.literal";
import { NumericLiteral } from "../../classes/literals/numeric.literal";
import { StringLiteral } from "../../classes/literals/string.literal";
import { Statement } from "../../classes/statement";
import {
	ColumnDefinition,
	CreateStatement,
} from "../../classes/statements/create.statements";
import { UpdateStatement } from "../../classes/statements/update.statements";
import { ViewStatement } from "../../classes/statements/view.statements";
import { UnaryExpression } from "../../classes/unary.expression";
import { AGGREGATE_FUNCTIONS, TokenType } from "../../tokenizer";
import default_callHandler from "./default_call.handler";

export class RxJsInterpreter extends Visitor<Observable<any>> {
	public visitViewStmt(stmt: ViewStatement): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitUpdateStmt(stmt: UpdateStatement): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitColumnDefinition(definition: ColumnDefinition): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public visitCreateStmt(stmt: CreateStatement): Observable<any> {
		throw new Error("Method not implemented.");
	}
	public aggregateFns: Record<string, CallExpression> = {};
	public handlers: ((
		table: Record<string, any>[],
		columns: Expression[]
	) => Record<string, any>[])[] = [
		(table, columns) => {
			const result: Record<string, any>[] = [];
			for (const row of table) {
				if (columns.map((item) => item.toLiteral()).at(0) === "*") {
					result.push(row);
				} else {
					const acc: Record<string, any> = {};
					for (const column of columns) {
						if (column instanceof Expression) {
							column.accept(this, row).subscribe((value) => {
								acc[column.toLiteral()] = value;
							});
						}

						if (column instanceof Identifier) {
							column.accept(this).subscribe((columnName) => {
								acc[column.toLiteral()] = row[columnName];
							});
						}
					}
					result.push(acc);
				}
			}
			return result;
		},
	];

	constructor() {
		super();
		if (typeof window === "undefined") {
			global.XMLHttpRequest = require("xhr2");
		}
	}

	// public visitAggregateCallExpr(expr: CallExpression): Observable<any> {
	// 	throw new Error("Method not implemented.");
	// }

	public visitCallExpr(
		expr: CallExpression,
		row: Record<string, any>
	): Observable<any> {
		return expr.callee.accept(this).pipe(
			map((functionName) => functionName.toLowerCase()),
			switchMap((functionName) => {
				if (AGGREGATE_FUNCTIONS.includes(functionName)) {
					this.aggregateFns[expr.toLiteral()] = expr;
				}
				const handler = default_callHandler[functionName];
				if (!handler) {
					throw new Error("Unsupported function " + functionName);
				} else {
					return handler(expr, this, row);
				}
			})
		);
	}

	public visitNumericLiteralExpr(expr: NumericLiteral): Observable<any> {
		return of(+expr.value);
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
		return of(expr.toLiteral());
	}

	public visitSelectStmt(stmt: SelectStatement): Observable<any> {
		const columns = this._visitColumns(stmt.columns);

		const where$ = (row: Record<string, any>) =>
			!!stmt.where
				? stmt
						.where!.accept(this, row)
						.pipe(switchMap((include) => iif(() => include, of(row), EMPTY)))
				: of(row);
		const dataset$ = stmt.from!.accept(this) as Observable<
			Record<string, any>[]
		>;
		return dataset$.pipe(
			tap((value) => {
				if (!Array.isArray(value)) {
					throw new Error("dataset has to be iterable");
				}
			}),
			mergeAll(),
			mergeMap(where$),
			toArray(),
			map((table) => {
				return this.handlers.reduce(
					(acc, handler) => handler(acc, columns),
					table
				);
			}),
			mergeMap((result) => stmt.group?.accept(this, result) ?? of([result])),
			mergeAll(),
			map((result: any) => {
				let aggregateFns: ((
					list: Record<string, any>[]
				) => Record<string, any>[])[] = [(list) => list];
				Object.entries(this.aggregateFns).forEach(([key, callExpr]) => {
					let functionName!: string;
					callExpr.callee.accept(this).subscribe((value) => {
						functionName = value.toLowerCase();
					});

					if (functionName === "avg") {
						aggregateFns.push((list) => this.handleAvg(list, key));
					}

					if (functionName === "sum") {
						aggregateFns.push((list) => this.handleSum(list, key));
					}

					if (functionName === "count") {
						aggregateFns.push((list) => this.handleCount(list, key));
					}
				});
				return aggregateFns.map((item) => item(result)).at(-1);
			}),
			toArray(),
			mergeMap((list) =>
				stmt.limit ? stmt.limit?.accept(this, list) : of(list)
			),
			map((list) => this.result(list)),
			tap(console.log)
		);
	}

	public _visitColumns(
		columns: (Identifier | Expression)[]
	): (Identifier | Expression)[] {
		return columns.map((item) => {
			if (item instanceof Expression || item instanceof Identifier) {
				return item;
			}
			throw new Error("Unhandled column type");
		});
	}

	public visitLimitExpr(expr: LimitExpression, list: any[]): Observable<any> {
		return combineLatest([
			expr.expression.accept(this),
			expr.offset?.accept(this) ?? of(0),
		]).pipe(
			map(([limit, offset]) => {
				return list.slice(offset, limit + offset);
			})
		);
	}

	public visitGroupByExpr(
		stmt: GroupByExpression,
		context: Record<string, any>[]
	): Observable<any> {
		const columns = this._visitColumns(stmt.columns);
		const result: Record<string, Record<string, any>[]> = {};
		for (const row of context) {
			from(columns)
				.pipe(
					mergeMap((node) => node.accept(this)),
					map((column) => row[column]),
					toArray(),
					map((values) => values.join(","))
				)
				.subscribe((uniqueKey) => {
					if (!result[uniqueKey]) {
						result[uniqueKey] = [];
					}
					result[uniqueKey].push(row);
				});
		}
		// const groupedResult = Object.entries(result).reduce(
		// 	(acc, [uniqueKey, groupedResult]) => {
		// 		groupedResult.forEach((groupedRow, index) => {
		// 			Object.entries(groupedRow)
		// 				.filter(([, value]) => value instanceof Function)
		// 				.forEach(([key, value]) => {
		// 					const prev = groupedResult[index - 1];
		// 					groupedRow[key] = value(prev ? prev[key] : 0);
		// 				});
		// 		});
		// 		acc.push(groupedResult.at(-1)!);
		// 		return acc;
		// 	},
		// 	[] as Record<string, any>[]
		// );
		return of(Object.values(result));
	}

	public visitGroupingExpr(expr: GroupingExpression): Observable<any> {
		throw new Error("Method not implemented.");
	}

	public execute(stmts: Statement[]) {
		const select = stmts.find((item) => item instanceof SelectStatement);
		if (!select) {
			throw new Error();
		}
		return select.accept(this);
	}

	public result(list: Record<string, any>[]): Record<string, any>[] {
		return list.flat();
	}

	public handleAvg(
		list: Record<string, any>[],
		columnName: string
	): Record<string, any>[] {
		list[0][columnName] =
			list.reduce((acc: number, item: any) => {
				return (acc += item[columnName]);
			}, 0) / list.length;
		return [list[0]];
	}

	public handleSum(
		list: Record<string, any>[],
		columnName: string
	): Record<string, any>[] {
		list[0][columnName] = list.reduce((acc: number, item: any) => {
			return (acc += item[columnName]);
		}, 0);
		return [list[0]];
	}

	public handleCount(
		list: Record<string, any>[],
		columnName: string
	): Record<string, any>[] {
		list[0][columnName] = list.length;
		return [list[0]];
	}
}
