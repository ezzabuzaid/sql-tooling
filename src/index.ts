import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
const program = `
SELECT *
  FROM tutorial.billboard_top_100_year_end
 WHERE year_rank BETWEEN 5 AND 10
`;

const tokenizer = new Tokenizer(program);
const tokens = tokenizer.tokenize();
console.log(tokens);

const parser = new Parser(tokens);
const ast = parser.parse();
console.log(JSON.stringify(ast, null, 2));

// expression   → equality;
// equality     → comparison ( ( "!=" | "==" ) comparison )* ;
// comparison   → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
// term         → factor ( ( "-" | "+" ) factor )* ;
// factor       → unary ( ( "/" | "*" ) unary )* ;
// unary        → ( "!" | "-" ) unary | primary ;
// primary      → NUMBER | STRING | "true" | "false"
//              | "(" expression ")" ;
