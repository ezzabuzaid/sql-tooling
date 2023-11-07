import { ODataVisitor } from './interpreter/odata/odata.visitor';
import { Parser } from './parser';
import { Tokenizer } from './tokenizer';

function getAst(program: string) {
  const tokenizer = new Tokenizer(program);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

const ast = getAst(
  `SELECT * FROM Sales WHERE strftime('%m', ShipDate) = '12';`,
);
const oDataVisitor = new ODataVisitor();
console.log(oDataVisitor.execute(ast));

async function client(url: string, sql: string) {
  const oDataVisitor = new ODataVisitor();
  const tokenizer = new Tokenizer(sql);
  const tokens = tokenizer.tokenize();
  console.log({ tokens });
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const uri = oDataVisitor.execute(ast);
  const fullUrl = `${url}${uri}`;
  console.log({ fullUrl });
  const response = await fetch(fullUrl);
  const data = await response.json();
  return data;
}

client(
  'http://localhost:5062',
  `
    SELECT summary
    FROM WeatherForecast
    ORDER BY summary ASC;
  `,
).then((data) => console.log(data));

// import express from 'express';

// const app = express();
// app.get('/', (req, res) => {});
// app.listen(3333, () => console.log('Server running on port 3333'));
