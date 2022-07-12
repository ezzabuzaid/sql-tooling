import { Parser } from "../src/parser";
import { Tokenizer } from "../src/tokenizer";

it("case 1", () => {
	const program = `
					SELECT * FROM Customers
					WHERE Country = 'Mexico' AND customer_id >= 6000 AND (customer >= 6000 OR id = 4)
					GROUP BY foo, bar
					ORDER BY foo DESC, bar DESC

				`;
	const tokenizer = new Tokenizer(program);
	const parser = new Parser(tokenizer.tokenize());
	const ast = parser.parse();

	expect([
		{
			type: "statement",
			varient: "select",
			columns: [
				{
					type: "identifier",
					name: "*",
					alias: "*",
					varient: "column",
				},
			],
			from: {
				type: "identifier",
				name: "Customers",
				varient: "table",
			},
			where: {
				type: "expression",
				operation: "and",
				varient: "operation",
				format: "binary",
				left: {
					type: "expression",
					operation: "and",
					varient: "operation",
					format: "binary",
					left: {
						type: "expression",
						operation: "=",
						varient: "operation",
						format: "binary",
						left: {
							type: "identifier",
							name: "Country",
							alias: "Country",
							varient: "column",
						},
						right: {
							value: "Mexico",
							type: "literal",
							varient: "string",
						},
					},
					right: {
						type: "expression",
						operation: ">=",
						varient: "operation",
						format: "binary",
						left: {
							type: "identifier",
							name: "customer_id",
							alias: "customer_id",
							varient: "column",
						},
						right: {
							value: "6000",
							type: "literal",
							varient: "string",
						},
					},
				},
				right: {
					type: "expression",
					operation: "or",
					varient: "operation",
					format: "binary",
					left: {
						type: "expression",
						operation: ">=",
						varient: "operation",
						format: "binary",
						left: {
							type: "identifier",
							name: "customer",
							alias: "customer",
							varient: "column",
						},
						right: {
							value: "6000",
							type: "literal",
							varient: "string",
						},
					},
					right: {
						type: "expression",
						operation: "=",
						varient: "operation",
						format: "binary",
						left: {
							type: "identifier",
							name: "id",
							alias: "id",
							varient: "column",
						},
						right: {
							value: "4",
							type: "literal",
							varient: "string",
						},
					},
				},
			},
			order: {
				type: "expression",
				varient: "order",
				columns: [
					{
						type: "identifier",
						name: "foo",
						alias: "foo",
						varient: "column",
						direction: "DESC",
					},
					{
						type: "identifier",
						name: "bar",
						alias: "bar",
						varient: "column",
						direction: "DESC",
					},
				],
			},
			group: {
				type: "expression",
				varient: "group",
				columns: [
					{
						type: "identifier",
						name: "foo",
						alias: "foo",
						varient: "column",
					},
					{
						type: "identifier",
						name: "bar",
						alias: "bar",
						varient: "column",
					},
				],
			},
		},
	]).toEqual(ast);
});
