import { Factory } from "../src/factory/factory";
import { Parser } from "../src/parser";
import { Tokenizer } from "../src/tokenizer";

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
				factory.createIdentifier("="),
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
				factory.createIdentifier(">"),
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
				factory.createIdentifier("!="),
				factory.createIdentifier("January")
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
				factory.createIdentifier("<>"),
				factory.createIdentifier("January")
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
					factory.createIdentifier("+"),
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
						factory.createIdentifier("+"),
						factory.createIdentifier("south")
					),
					factory.createIdentifier("-"),
					factory.createBinaryExpression(
						factory.createNumericLiteral("4"),
						factory.createIdentifier("*"),
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
							factory.createIdentifier("+"),
							factory.createIdentifier("south")
						)
					),
					factory.createIdentifier("/"),
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
				factory.createIdentifier("group"),
				factory.createIdentifier("LIKE"),
				factory.createIdentifier("Snoop%")
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
				factory.createIdentifier("group"),
				factory.createIdentifier("ILIKE"),
				factory.createIdentifier("Snoop%")
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
				factory.createIdentifier("ILIKE"),
				factory.createIdentifier("dr_ke")
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
				factory.createBinaryExpression(
					factory.createIdentifier("year_rank"),
					factory.createIdentifier("BETWEEN"),
					factory.createNumericLiteral("5")
				),
				factory.createIdentifier("AND"),
				factory.createNumericLiteral("10")
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
					factory.createIdentifier(">="),
					factory.createNumericLiteral("5")
				),
				factory.createIdentifier("AND"),
				factory.createBinaryExpression(
					factory.createIdentifier("year_rank"),
					factory.createIdentifier("<="),
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
				factory.createIdentifier("IS"),
				factory.createIdentifier("NULL")
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
						factory.createIdentifier("="),
						factory.createNumericLiteral("2012")
					),
					factory.createIdentifier("AND"),
					factory.createBinaryExpression(
						factory.createIdentifier("year_rank"),
						factory.createIdentifier("<="),
						factory.createNumericLiteral("10")
					)
				),
				factory.createIdentifier("AND"),
				factory.createBinaryExpression(
					factory.createIdentifier("group"),
					factory.createIdentifier("ILIKE"),
					factory.createIdentifier("%feat%")
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
					factory.createIdentifier("="),
					factory.createNumericLiteral("5")
				),
				factory.createIdentifier("OR"),
				factory.createBinaryExpression(
					factory.createIdentifier("artist"),
					factory.createIdentifier("="),
					factory.createIdentifier("Gotye")
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
					factory.createIdentifier("="),
					factory.createNumericLiteral("2013")
				),
				factory.createIdentifier("AND"),
				factory.createGroupingExpression(
					factory.createBinaryExpression(
						factory.createBinaryExpression(
							factory.createIdentifier("group"),
							factory.createIdentifier("ILIKE"),
							factory.createIdentifier("%macklemore%")
						),
						factory.createIdentifier("OR"),
						factory.createBinaryExpression(
							factory.createIdentifier("group"),
							factory.createIdentifier("ILIKE"),
							factory.createIdentifier("%timberlake%")
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
					factory.createIdentifier("="),
					factory.createNumericLiteral("2013")
				),
				factory.createIdentifier("AND"),
				factory.createBinaryExpression(
					factory.createIdentifier("year_rank"),
					factory.createIdentifier("NOT BETWEEN"),
					factory.createBinaryExpression(
						factory.createNumericLiteral("2"),
						factory.createIdentifier("AND"),
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
					factory.createIdentifier("="),
					factory.createNumericLiteral("2013")
				),
				factory.createIdentifier("AND"),
				factory.createBinaryExpression(
					factory.createIdentifier("group"),
					factory.createIdentifier("NOT ILIKE"),
					factory.createIdentifier("%macklemore%")
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
					factory.createIdentifier("="),
					factory.createNumericLiteral("2013")
				),
				factory.createIdentifier("AND"),
				factory.createBinaryExpression(
					factory.createIdentifier("artist"),
					factory.createIdentifier("IS"),
					factory.createUnaryExpression(
						factory.createIdentifier("NOT"),
						factory.createIdentifier("NULL")
					)
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
			expect(parser.parse()).toEqual([item.ast]);
		});
	});
});

describe("Order", () => {
	order.forEach((item) => {
		it(item.sql, () => {
			const tokenizer = new Tokenizer(item.sql);
			const parser = new Parser(tokenizer.tokenize());
			expect(parser.parse()).toEqual([item.ast]);
		});
	});
});
