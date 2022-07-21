import { Factory } from "./factory/factory";
import { PrintInterpreter } from "./interpreter/print.interpreter";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
const program = `
			SELECT *
			FROM tutorial
			WHERE year = 2013
			AND artist IS NOT NULL
      `;
const tokenizer = new Tokenizer(program);
const tokens = tokenizer.tokenize();
// console.log(tokens);

const parser = new Parser(tokens);
const ast = parser.parse();
const print = new PrintInterpreter();
const factory = new Factory();
console.log(
	print.print(
		factory.createBinaryExpression(
			factory.createBinaryExpression(
				factory.createIdentifier("year_rank"),
				factory.createIdentifier(">="),
				factory.createNumericLiteral("5")
			),
			factory.createIdentifier("and"),
			factory.createUnaryExpression(
				factory.createIdentifier("-"),
				factory.createNumericLiteral("10")
			)
		)
	)
);
// console.log(JSON.stringify(ast, null, 2));
// expression   → equality;
// equality     → comparison ( ( "!=" | "==" ) comparison )* ;
// comparison   → range ( ( ">" | ">=" | "<" | "<=" ) range )* ;
// range        → term ( ( "NOT BETWEEN" | "IN" | "LIKE" | "ILIKE" | "SIMILAR" ) term )* ;
// term         → factor ( ( "-" | "+" ) factor )* ;
// factor       → unary ( ( "/" | "*" ) unary )* ;
// unary        → ( "NOT" | "-" ) unary | call;
// call         → primary ( "(" (arguments?) ")" )*;
// primary      → IDENTIFIER | NUMBER | STRING | NULL | "true" | "false" | "(" expression ")";
// arguments    → expression | ("," expression)*
