import { BinaryExpression } from "../classes/binary.expression";
import { CallExpression } from "../classes/call.expression";
import { Expression } from "../classes/expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { GroupByExpression } from "../classes/group_expression";
import { Identifier } from "../classes/identifier";
import { LimitExpression } from "../classes/limit.expression";
import { BooleanLiteral } from "../classes/literals/boolean.literal";
import { NullLiteral } from "../classes/literals/null.literal";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { StringLiteral } from "../classes/literals/string.literal";
import { SelectStatement } from "../classes/select_statements";
import { UnaryExpression } from "../classes/unary.expression";
import { TokenType } from "../tokenizer";
import { Visitor } from "./visitor";

export class JsonInterpreter extends Visitor<any> {
	public visitLimitExpr(expr: LimitExpression, context?: any) {
		throw new Error("Method not implemented.");
	}
	constructor(public dataset: Record<string, any[]>) {
		super();
	}

	public visitCallExpr(expr: CallExpression, row: Record<string, any>) {
		const functionName = expr.callee.accept(this).toLowerCase();
		const at: (pos: number) => any = (pos: number) =>
			expr.args[pos].accept(this);
		switch (functionName) {
			case "upper":
				return row[at(0)].toUpperCase();
			case "lower":
				return row[at(0)].toLowerCase();
			default:
				throw new Error("Unsupported function " + functionName);
		}
	}

	public visitGroupByExpr(stmt: GroupByExpression) {
		throw new Error("Method not implemented.");
	}

	public visitNumericLiteralExpr(expr: NumericLiteral) {
		return Number(expr.value);
	}

	public visitGroupingExpr(expr: GroupingExpression) {
		expr.expression.accept(this);
	}

	public visitNullLiteralExpr(expr: NullLiteral) {
		return expr.value;
	}

	public visitStringLiteralExpr(expr: StringLiteral) {
		return expr.value;
	}

	public visitSelectStmt(stmt: SelectStatement): any {
		if (!stmt.from) {
			return this._parseSimpleSelect(stmt);
		}
		const from = stmt.from.accept(this);
		const table = this.dataset[from];
		let result: Record<string, any>[] = [];
		for (const row of table) {
			if (stmt.where) {
				const include = stmt.where?.accept(this, row);
				if (!include) {
					continue;
				}
			}
			const record: Record<string, any> = {};
			for (const column of stmt.columns) {
				let columnName: string;
				let columnValue: any;
				if (column instanceof Identifier) {
					columnName = column.accept(this);
					columnValue = row[columnName];
					record[columnName] = columnValue;
					continue;
				}
				if (column instanceof Expression) {
					columnName = column.toLiteral();
					columnValue = column.accept(this, row);
					record[columnName] = columnValue;
					continue;
				}
			}
			result.push(record);
		}

		if (stmt.distinct) {
			result = removeDuplicate(result);
		}

		return result;
	}

	public visitUnaryExpr(expr: UnaryExpression): any {
		const right = expr.right.accept(this);
		const operator = expr.operator.type;
		switch (operator) {
			case TokenType.MINUS:
				return -right;
			case TokenType.NOT:
				throw new Error("Method not implemented.");
			default:
				throw new Error("Unsupported unary token");
		}
	}

	public visitBooleanLiteralExpr(expr: BooleanLiteral): boolean {
		return !!expr.value;
	}

	public visitIdentifier(expr: Identifier): string {
		return expr.alias || expr.text;
	}

	public execute(expr: Expression) {
		return expr.accept(this);
	}

	public visitBinaryExpr(
		expr: BinaryExpression,
		row: Record<string, any>
	): any {
		const left = expr.left.accept(this);
		const right = expr.right.accept(this);
		const leftOperand = row?.[left] ?? left;
		const operator = expr.operator.type;
		switch (operator) {
			case TokenType.EQUAL_EQUAL:
				return leftOperand === right;
			case TokenType.NOT_EQUAL:
				return leftOperand !== right;
			case TokenType.PLUS:
				return leftOperand + right;
			case TokenType.MINUS:
				return leftOperand - right;
			case TokenType.SLASH:
				return leftOperand / right;
			case TokenType.STAR:
				return leftOperand * right;

			default:
				throw new Error("Unsupported binary token");
		}
	}

	private _parseSimpleSelect(stmt: SelectStatement) {
		return stmt.columns.reduce((acc, column) => {
			if (column instanceof Expression || column instanceof Identifier) {
				acc[column.toLiteral()] = column.accept(this);
			}
			return acc;
		}, {} as Record<string, any>);
	}
}

function removeDuplicate(array: Record<string, any>[]) {
	return array.filter((item, pos) => {
		return (
			array.findIndex((i) => JSON.stringify(i) === JSON.stringify(item)) == pos
		);
	});
}
