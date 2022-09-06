import { BinaryExpression } from "../classes/binary.expression";
import { CallExpression } from "../classes/call.expression";
import { Expression } from "../classes/expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { GroupByExpression } from "../classes/group_expression";
import { Identifier } from "../classes/identifier";
import { BooleanLiteral } from "../classes/literals/boolean.literal";
import { NullLiteral } from "../classes/literals/null.literal";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { StringLiteral } from "../classes/literals/string.literal";
import { SelectStatement } from "../classes/select_statements";
import { UnaryExpression } from "../classes/unary.expression";
import { Visitor } from "./visitor";

export class ReverseVisitor extends Visitor<string> {
	public visitCallExpr(expr: CallExpression): string {
		const functionName = expr.callee.accept(this).toLowerCase();
		const args = this._parseColumns(expr.args);
		return `${functionName}(${args})`;
	}
	public visitGroupByExpr(expr: GroupByExpression): string {
		const columns =
			" " + expr.columns.map((column) => column.accept(this)).join(", ");
		return `group by${columns}`;
	}
	public visitGroupingExpr(expr: GroupingExpression): string {
		throw new Error("Method not implemented.");
	}
	public visitUnaryExpr(expr: UnaryExpression): string {
		throw new Error("Method not implemented.");
	}
	public visitNumericLiteralExpr(expr: NumericLiteral): string {
		return `${expr.value}`;
	}
	public visitBinaryExpr(expr: BinaryExpression, context: any): string {
		const left = expr.left.accept(this);
		const right = expr.right.accept(this);
		return `${left} ${expr.operator.lexeme} ${right}`;
	}

	public visitNullLiteralExpr(expr: NullLiteral): string {
		throw new Error("Method not implemented.");
	}
	public visitBooleanLiteralExpr(expr: BooleanLiteral): string {
		throw new Error("Method not implemented.");
	}
	public visitStringLiteralExpr(expr: StringLiteral): string {
		return `'${expr.value}'`;
	}
	public visitIdentifier(expr: Identifier): string {
		const alias = expr.alias ? ` as ${expr.alias}` : "";
		return `${expr.text}${alias}`;
	}
	public visitSelectStmt(stmt: SelectStatement): string {
		const columns = " " + this._parseColumns(stmt.columns);
		const from = this._formatFrom(stmt.from);
		const distinct = stmt.distinct ? " distinct" : "";
		const groupBy = stmt.group?.accept(this) ?? "";
		const where = stmt.where ? `where ${stmt.where?.accept(this)}` : "";
		return (
			`select${distinct}${columns} ${from} ${where}${groupBy}`.trim() + ";"
		);
	}

	public execute(expr: Expression) {
		return expr.accept(this);
	}

	private _formatFrom(from: SelectStatement["from"]) {
		if (from) {
			if (from instanceof Identifier) {
				return `from ${from.accept(this)}`;
			}
			return `from (${from.accept(this)})`;
		}
		return "";
	}

	private _parseColumns(columns: SelectStatement["columns"]) {
		return columns
			.map((column) => {
				const value = column.accept(this);
				if (column instanceof SelectStatement) {
					return `(${value})`;
				}
				return value;
			})
			.join(", ");
	}
}
