import * as openapi from "openapi3-ts";
import { SchemaObject, SchemasObject } from "openapi3-ts";
import { BinaryExpression } from "../classes/binary.expression";
import { CallExpression } from "../classes/call.expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { GroupByExpression } from "../classes/group_expression";
import { Identifier } from "../classes/identifier";
import { LimitExpression } from "../classes/limit.expression";
import { BooleanLiteral } from "../classes/literals/boolean.literal";
import { NullLiteral } from "../classes/literals/null.literal";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { StringLiteral } from "../classes/literals/string.literal";
import { Statement } from "../classes/statement";
import {
	ColumnDefinition,
	CreateStatement,
	DataType,
} from "../classes/statements/create.statements";
import { SelectStatement } from "../classes/statements/select.statements";
import { UnaryExpression } from "../classes/unary.expression";
import { TokenType } from "../tokenizer";
import { Visitor } from "./visitor";

type Node = any;

export class OpenApiVisitor extends Visitor<Node> {
	private _schema?: openapi.SchemasObject;
	private _builder?: openapi.OpenApiBuilder;
	public visitCallExpr(expr: CallExpression, row: Record<string, any>): Node {
		throw new Error("Method not implemented.");
	}
	public visitGroupingExpr(expr: GroupingExpression): Node {
		throw new Error("Method not implemented.");
	}
	public visitUnaryExpr(expr: UnaryExpression): Node {
		throw new Error("Method not implemented.");
	}
	public visitNumericLiteralExpr(expr: NumericLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitBinaryExpr(expr: BinaryExpression, context: any): Node {
		throw new Error("Method not implemented.");
	}
	public visitNullLiteralExpr(expr: NullLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitBooleanLiteralExpr(expr: BooleanLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitStringLiteralExpr(expr: StringLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitIdentifier(expr: Identifier): openapi.SchemasObject {
		return {
			[expr.toLiteral()]: this._schema![expr.text],
		};
	}

	public visitColumnDefinition(definition: ColumnDefinition) {
		const type: Record<DataType, string> = {
			[TokenType.INTEGER]: "integer",
			[TokenType.TEXT]: "string",
			[TokenType.REAL]: "number",
			[TokenType.BOOL]: "boolean",
		};
		return {
			[definition.name.text]: {
				type: type[definition.dataType.type],
			} as SchemaObject,
		};
	}

	public visitCreateStmt(stmt: CreateStatement): Node {
		const defs = stmt.columns.reduce(
			(acc, item) => ({ ...acc, ...item.accept(this) }),
			{}
		);
		this._schema = defs;
	}

	public visitSelectStmt(stmt: SelectStatement): openapi.PathItemObject {
		const properties = stmt.columns.reduce(
			(acc, e) => ({ ...acc, ...e.accept(this) }),
			{} as SchemasObject
		);
		return {
			get: {
				responses: {
					"200": {
						description: "",
						content: {
							"application/json": {
								schema: { properties: properties },
							},
						},
					} as openapi.ResponseObject,
				},
			},
		};
	}

	public visitGroupByExpr(expr: GroupByExpression, context?: any): Node {
		throw new Error("Method not implemented.");
	}
	public visitLimitExpr(expr: LimitExpression, context?: any): Node {
		throw new Error("Method not implemented.");
	}

	public execute(stms: Statement[], info: openapi.InfoObject): any {
		const createStatementIndex = stms.findIndex(
			(item) => item instanceof CreateStatement
		);
		stms[createStatementIndex].accept(this);
		if (createStatementIndex !== 0) {
			throw new Error("CREATE statement is absent.");
		}
		const operations = stms.splice(0, stms.length);
		this._builder = new openapi.OpenApiBuilder({
			paths: {
				"/sql": operations.reduce(
					(acc, current) => ({ ...acc, ...current.accept(this) }),
					{}
				),
			},
			openapi: "3.0.0",
			security: [{}],
			components: {
				schemas: {},
			},
			info: info,
		});
		return this._builder.getSpecAsJson();
	}
}
