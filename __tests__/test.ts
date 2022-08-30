import { BinaryExpression } from "../src/classes/binary.expression";
import { Identifier } from "../src/classes/identifier";
import { BooleanLiteral } from "../src/classes/literals/boolean.literal";
import { Literal } from "../src/classes/literals/literal";
import { SelectStatement } from "../src/classes/select_statements";
import { UnaryExpression } from "../src/classes/unary.expression";
import { Factory } from "../src/factory/factory";
import { Visitor } from "../src/interpreter/visitor";
import { Parser } from "../src/parser";
import { Tokenizer, TokenType } from "../src/tokenizer";

const factory = new Factory();
const basic = [
	{
		sql: "select * from product",
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("product")
		),
	},
	{
		sql: `
			SELECT year, month, west
			FROM tutorial.us_housing_units
			  `,
		ast: factory.createSelectStatement(
			[
				factory.createIdentifier("year"),
				factory.createIdentifier("month"),
				factory.createIdentifier("west"),
			],
			factory.createIdentifier("tutorial.us_housing_units")
		),
	},
	{
		sql: `
			SELECT west AS West_Region, south AS South_Region
  			FROM tutorial
			`,
		ast: factory.createSelectStatement(
			[
				factory.createIdentifier("west", "West_Region"),
				factory.createIdentifier("south", "South_Region"),
			],
			factory.createIdentifier("tutorial")
		),
	},
];

const limits = [
	{
		sql: `
			SELECT west AS West_Region, south AS South_Region
			FROM tutorial.us_housing_units
			LIMIT 10
		  `,
		ast: factory.createSelectStatement(
			[
				factory.createIdentifier("west", "West_Region"),
				factory.createIdentifier("south", "South_Region"),
			],
			factory.createIdentifier("tutorial.us_housing_units"),
			undefined,
			undefined,
			factory.createLimitExpression(factory.createNumericLiteral("10"))
		),
	},
];

const where = [
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE month = 1
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createIdentifier("month"),
				factory.createToken(TokenType.EQUAL_EQUAL),
				factory.createNumericLiteral("1")
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE west > 30
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createIdentifier("west"),
				factory.createToken(TokenType.GREATER),
				factory.createNumericLiteral("30")
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE month_name != 'January'
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createIdentifier("month_name"),
				factory.createToken(TokenType.NOT_EQUAL),
				factory.createStringLiteral("January")
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE month_name <> 'January'
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createIdentifier("month_name"),
				factory.createToken(TokenType.NOT_EQUAL),
				factory.createStringLiteral("January")
			)
		),
	},
	{
		sql: `
			SELECT year, month, west, south, west + south AS south_plus_west
			FROM tutorial
		  `,
		ast: factory.createSelectStatement(
			[
				factory.createIdentifier("year"),
				factory.createIdentifier("month"),
				factory.createIdentifier("west"),
				factory.createIdentifier("south"),
				factory.createBinaryExpression(
					factory.createIdentifier("west"),
					factory.createToken(TokenType.PLUS),
					factory.createIdentifier("south"),
					"south_plus_west"
				),
			],
			factory.createIdentifier("tutorial")
		),
	},
	{
		sql: `
			SELECT year, month, west, south, west + south - 4 * year AS nonsense_column
			FROM tutorial
		  `,
		ast: factory.createSelectStatement(
			[
				factory.createIdentifier("year"),
				factory.createIdentifier("month"),
				factory.createIdentifier("west"),
				factory.createIdentifier("south"),
				factory.createBinaryExpression(
					factory.createBinaryExpression(
						factory.createIdentifier("west"),
						factory.createToken(TokenType.PLUS),
						factory.createIdentifier("south")
					),
					factory.createToken(TokenType.MINUS),
					factory.createBinaryExpression(
						factory.createNumericLiteral("4"),
						factory.createToken(TokenType.STAR),
						factory.createIdentifier("year")
					),
					"nonsense_column"
				),
			],
			factory.createIdentifier("tutorial")
		),
	},
	{
		sql: `
			SELECT year, month, west, south, (west + south) / 2 AS south_west_avg
			FROM tutorial
		  `,
		ast: factory.createSelectStatement(
			[
				factory.createIdentifier("year"),
				factory.createIdentifier("month"),
				factory.createIdentifier("west"),
				factory.createIdentifier("south"),
				factory.createBinaryExpression(
					factory.createGroupingExpression(
						factory.createBinaryExpression(
							factory.createIdentifier("west"),
							factory.createToken(TokenType.PLUS),
							factory.createIdentifier("south")
						)
					),
					factory.createToken(TokenType.SLASH),
					factory.createNumericLiteral("2"),
					"south_west_avg"
				),
			],
			factory.createIdentifier("tutorial")
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE "group" LIKE 'Snoop%'
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createStringLiteral("group"),
				factory.createToken(TokenType.LIKE),
				factory.createStringLiteral("Snoop%")
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE "group" ILIKE 'Snoop%'
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createStringLiteral("group"),
				factory.createToken(TokenType.ILIKE),
				factory.createStringLiteral("Snoop%")
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE artist ILIKE 'dr_ke'
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createIdentifier("artist"),
				factory.createToken(TokenType.ILIKE),
				factory.createStringLiteral("dr_ke")
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE year_rank BETWEEN 5 AND 10
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createIdentifier("year_rank"),
				factory.createToken(TokenType.BETWEEN),
				factory.createBinaryExpression(
					factory.createNumericLiteral("5"),
					factory.createToken(TokenType.AND),
					factory.createNumericLiteral("10")
				)
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE year_rank >= 5 AND year_rank <= 10
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createBinaryExpression(
					factory.createIdentifier("year_rank"),
					factory.createToken(TokenType.GREATER_EQUAL),
					factory.createNumericLiteral("5")
				),
				factory.createToken(TokenType.AND),
				factory.createBinaryExpression(
					factory.createIdentifier("year_rank"),
					factory.createToken(TokenType.LESS_EQUAL),
					factory.createNumericLiteral("10")
				)
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE artist IS NULL
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createIdentifier("artist"),
				factory.createToken(TokenType.IS),
				factory.createNullLiteral("NULL")
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE year = 2012
			AND year_rank <= 10
			AND "group" ILIKE '%feat%'
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createBinaryExpression(
					factory.createBinaryExpression(
						factory.createIdentifier("year"),
						factory.createToken(TokenType.EQUAL_EQUAL),
						factory.createNumericLiteral("2012")
					),
					factory.createToken(TokenType.AND),
					factory.createBinaryExpression(
						factory.createIdentifier("year_rank"),
						factory.createToken(TokenType.LESS_EQUAL),
						factory.createNumericLiteral("10")
					)
				),
				factory.createToken(TokenType.AND),
				factory.createBinaryExpression(
					factory.createStringLiteral("group"),
					factory.createToken(TokenType.ILIKE),
					factory.createStringLiteral("%feat%")
				)
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE year_rank = 5 OR artist = 'Gotye'
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createBinaryExpression(
					factory.createIdentifier("year_rank"),
					factory.createToken(TokenType.EQUAL_EQUAL),
					factory.createNumericLiteral("5")
				),
				factory.createToken(TokenType.OR),
				factory.createBinaryExpression(
					factory.createIdentifier("artist"),
					factory.createToken(TokenType.EQUAL_EQUAL),
					factory.createStringLiteral("Gotye")
				)
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE year = 2013
			AND ("group" ILIKE '%macklemore%' OR "group" ILIKE '%timberlake%')
		  `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createBinaryExpression(
					factory.createIdentifier("year"),
					factory.createToken(TokenType.EQUAL_EQUAL),
					factory.createNumericLiteral("2013")
				),
				factory.createToken(TokenType.AND),
				factory.createGroupingExpression(
					factory.createBinaryExpression(
						factory.createBinaryExpression(
							factory.createStringLiteral("group"),
							factory.createToken(TokenType.ILIKE),
							factory.createStringLiteral("%macklemore%")
						),
						factory.createToken(TokenType.OR),
						factory.createBinaryExpression(
							factory.createStringLiteral("group"),
							factory.createToken(TokenType.ILIKE),
							factory.createStringLiteral("%timberlake%")
						)
					)
				)
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE year = 2013
			AND year_rank NOT BETWEEN 2 AND 3
   `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createBinaryExpression(
					factory.createIdentifier("year"),
					factory.createToken(TokenType.EQUAL_EQUAL),
					factory.createNumericLiteral("2013")
				),
				factory.createToken(TokenType.AND),
				factory.createBinaryExpression(
					factory.createIdentifier("year_rank"),
					factory.createToken(TokenType.NOT_BETWEEN),
					factory.createBinaryExpression(
						factory.createNumericLiteral("2"),
						factory.createToken(TokenType.AND),
						factory.createNumericLiteral("3")
					)
				)
			)
		),
	},
	{
		sql: `
		SELECT *
		FROM tutorial
		WHERE year = 2013
		AND "group" NOT ILIKE '%macklemore%'
   `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createBinaryExpression(
					factory.createIdentifier("year"),
					factory.createToken(TokenType.EQUAL_EQUAL),
					factory.createNumericLiteral("2013")
				),
				factory.createToken(TokenType.AND),
				factory.createBinaryExpression(
					factory.createStringLiteral("group"),
					factory.createToken(TokenType.NOT_ILIKE),
					factory.createStringLiteral("%macklemore%")
				)
			)
		),
	},
	{
		sql: `
			SELECT *
			FROM tutorial
			WHERE year = 2013
			AND artist IS NOT NULL
   `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			factory.createBinaryExpression(
				factory.createBinaryExpression(
					factory.createIdentifier("year"),
					factory.createToken(TokenType.EQUAL_EQUAL),
					factory.createNumericLiteral("2013")
				),
				factory.createToken(TokenType.AND),
				factory.createBinaryExpression(
					factory.createIdentifier("artist"),
					factory.createToken(TokenType.IS_NOT),
					factory.createNullLiteral("NULL")
				)
			)
		),
	},
];

const order = [
	{
		sql: `
			SELECT *
			FROM tutorial
			ORDER BY year DESC, year_rank
 `,
		ast: factory.createSelectStatement(
			[factory.createIdentifier("*")],
			factory.createIdentifier("tutorial"),
			undefined,
			factory.createOrderExpression([
				factory.createOrderColumn(factory.createIdentifier("year"), "DESC"),
				factory.createOrderColumn(factory.createIdentifier("year_rank"), "ASC"),
			])
		),
	},
];

describe("Basic", () => {
	basic.forEach((item) => {
		it(item.sql, () => {
			const tokenizer = new Tokenizer(item.sql);
			const parser = new Parser(tokenizer.tokenize());
			expect(parser.parse()).toEqual([item.ast]);
		});
	});
});

describe("Limit", () => {
	limits.forEach((item) => {
		it(item.sql, () => {
			const tokenizer = new Tokenizer(item.sql);
			const parser = new Parser(tokenizer.tokenize());
			expect(parser.parse()).toEqual([item.ast]);
		});
	});
});

describe("Where", () => {
	where.forEach((item) => {
		it(item.sql, () => {
			const tokenizer = new Tokenizer(item.sql);
			const parser = new Parser(tokenizer.tokenize());
			const actualAst = parser.parse();
			new TestVisitor(actualAst[0]).execute();
			expect(actualAst).toEqual([item.ast]);
		});
	});
});

// describe("Order", () => {
// 	order.forEach((item) => {
// 		it(item.sql, () => {
// 			const tokenizer = new Tokenizer(item.sql);
// 			const parser = new Parser(tokenizer.tokenize());
// 			expect(parser.parse()).toEqual([item.ast]);
// 		});
// 	});
// });

class TestVisitor extends Visitor<Expression> {
	public visitNumericLiteralExpr(expr: NumericLiteral): Expression {
		throw new Error("Method not implemented.");
	}
	public visitGroupByExpr(expr: GroupByExpression): Expression {
		throw new Error("Method not implemented.");
	}
	public visitGroupingExpr(expr: GroupingExpression): Expression {
		expr.expression.accept(this);
		return expr;
	}
	public visitNullLiteralExpr(expr: NullLiteral): Expression {
		return expr;
	}
	public visitStringLiteralExpr(expr: StringLiteral): Expression {
		return expr;
	}
	public visitUnaryExpr(expr: UnaryExpression): Expression {
		expr.right.accept(this);
		return expr;
	}
	public visitBinaryExpr(expr: BinaryExpression, context: any) {
		expr.left.accept(this, context);
		expr.right.accept(this, context);
		// delete expr.operator.end;
		// delete expr.operator.start;
		// delete expr.operator.line;
		expr.operator = factory.createToken(expr.operator.type);
		return expr;
	}
	public visitLiteralExpr(expr: Literal) {
		return expr;
	}
	public visitBooleanLiteralExpr(expr: BooleanLiteral) {
		return expr;
	}
	public visitIdentifier(expr: Identifier) {
		return expr;
	}
	public visitSelectStmt(stmt: SelectStatement) {
		stmt.where?.accept?.(this);
		stmt.having?.accept?.(this);
		stmt.group?.accept?.(this);
		stmt.order?.accept?.(this);
		stmt.limit?.accept?.(this);
		stmt.from?.accept?.(this);
		stmt.columns.forEach((column) => column.accept(this));
		return stmt;
	}

	public visitNode(node: Expression) {
		return node;
	}

	constructor(private _ast: Expression) {
		super();
	}
	public execute() {
		this._ast.accept(this);
	}
}

import { Expression } from "../src/classes/expression";
import { GroupingExpression } from "../src/classes/grouping.expression";
import { GroupByExpression } from "../src/classes/group_expression";
import { NullLiteral } from "../src/classes/literals/null.literal";
import { NumericLiteral } from "../src/classes/literals/numeric.literal";
import { StringLiteral } from "../src/classes/literals/string.literal";
