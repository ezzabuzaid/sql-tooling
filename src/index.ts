global.XMLHttpRequest = require("xhr2");

import { Factory } from "./factory/factory";
import { MutateVisitor } from "./interpreter/mutate.visitor";
import { ReverseVisitor } from "./interpreter/reverse.visitor";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
const program = `
		select test, first from dataset;
`;

const tokenizer = new Tokenizer(program);
const tokens = tokenizer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();

const factory = new Factory();
console.log(JSON.stringify(ast, null, 4));

// const jsonInterpreter = new JsonInterpreter({
// 	products: [
// 		{ name: "apples", category: "fruits" },
// 		{ name: "oranges", category: "fruits" },
// 		{ name: "potatoes", category: "vegetables" },
// 	],
// });
// const result = jsonInterpreter.execute(
// 	(() => {
// 		const tokens = new Tokenizer(
// 			`select category, name from products group by category`
// 		).tokenize();
// 		// const ast = new Parser(tokens).parse();
// 		return ast[0];
// 	})()
// );
// console.log(result);
const mutateVisitor = new MutateVisitor();
console.log(mutateVisitor.execute(ast[0]));
const reverseVisitor = new ReverseVisitor();
console.log(reverseVisitor.execute(mutateVisitor.execute(ast[0])));

// const rxJsInterpreter = new RxJsInterpreter();
// rxJsInterpreter
// 	.execute(
// 		(() => {
// 			const program = `
// 			select title
// 			from HTTP("https://jsonplaceholder.typicode.com/todos") as data
// 			where completed == true
//       `;
// 			const tokens = new Tokenizer(program).tokenize();
// 			const ast = new Parser(tokens).parse();
// 			return ast[0];
// 		})()
// 	)
// 	.subscribe((data) => {
// 		console.log(data.length);
// 	});

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
