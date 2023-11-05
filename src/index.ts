import { Factory } from './factory/factory';
import { ODataVisitor } from './interpreter/odata/odata.visitor';
import { Parser } from './parser';
import { Tokenizer } from './tokenizer';

function getAst(program: string) {
  const tokenizer = new Tokenizer(program);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

const factory = new Factory();

const program = `

SELECT * FROM Employees WHERE FirstName LIKE '_ohn' and LastName LIKE 'S%';

`;

const ast = getAst(program);

const odata = new ODataVisitor();
const uri = odata.execute(ast);

console.log(uri);
