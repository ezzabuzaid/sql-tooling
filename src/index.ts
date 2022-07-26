import { Factory } from "./factory/factory";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
const program = `
CREATE TABLE tutorial(
   Id INT NOT NULL,
   Name TEXT NOT NULL,
   Age INT NOT NULL,
   Address TEXT,
   Salary REAL
);

--
SELECT Id, Name FROM tutorial as BasicTutorial;
--

--
UPDATE tutorial
SET Name = '?', Age = '?'
WHERE Id = 'CURRENT';
--

CREATE VIEW v_tracks
AS
SELECT
	trackid,
	tracks.name,
	albums.Title AS album,
	media_types.Name AS media,
	genres.Name AS genres
FROM
	tracks;
`;
const ast = getAst(program);
function getAst(program: string) {
	const tokenizer = new Tokenizer(program);
	const tokens = tokenizer.tokenize();
	const parser = new Parser(tokens);
	return parser.parse();
}
// console.log(JSON.stringify(ast, null, 2));
const factory = new Factory();
// const openApi = new OpenApiVisitor().execute(ast, {
// 	title: "SQL Magic",
// 	version: "1.0.0",
// });
// writeFileSync("openapi.g.json", JSON.stringify(openApi), "utf-8");
// writeFileSync(
// 	"output.graphql",
// 	new GraphQlVisitor().execute(
// 		getAst(
// 			`
// 			CREATE TABLE tasks(
// 				id INT NOT NULL,
// 				text Text NOT NULL,
// 				title TEXT NOT NULL,
// 				Primary key (id)
// 			);

// 			select id, title, completed
// 			from tasks as getTask
// 			where id = '0x3';

// 			select username
// 			from tasks as getUser
// 			where username = 'dgraphlabs';

// 			`
// 		)
// 	),
// 	"utf-8"
// );

// walk(
// 	factory.createSelectStatement(
// 		[factory.createColumnIdentifier("price")],
// 		factory.createIdentifier("Product")
// 	),
// 	{
// 		Identifier: {
// 			enter: (node) => {
// 				console.log("enter", node);
// 			},
// 			exit: (node) => {
// 				console.log("exit", node);
// 			},
// 		},
// 		Statement: {
// 			enter: (node) => {
// 				console.log("enter", node);
// 			},
// 			exit: (node) => {
// 				console.log("exit", node);
// 			},
// 		},
// 	}
// );

// console.log(JSON.stringify(ast, null, 4));

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
// const mutateVisitor = new MutateVisitor();
// console.log(mutateVisitor.execute(ast[0]));
// const reverseVisitor = new ReverseVisitor();
// console.log(reverseVisitor.execute(mutateVisitor.execute(ast[0])));

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
export * from "./classes/statements/create.statements";
export * from "./classes/statements/select.statements";
export * from "./interpreter/json.interpreter";
export * from "./interpreter/mutate.visitor";
export * from "./interpreter/openapi";
export * from "./interpreter/reverse.visitor";
export * from "./interpreter/rxjs/rxjs.interpreter";
export * from "./interpreter/visitor";
export * from "./parser";
export * from "./tokenizer";
