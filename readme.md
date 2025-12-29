# sql-tooling

A TypeScript SQL parser and transpiler that converts SQL statements into OData, GraphQL, OpenAPI, JSON, RxJS, and back to SQL.

## Installation

```bash
npm install
```

## Usage

```typescript
import { Tokenizer } from './src/tokenizer';
import { Parser } from './src/parser';
import { ODataVisitor } from './src/interpreter/odata/odata.visitor';

const sql = `SELECT * FROM Products WHERE Price > 100 ORDER BY Name ASC`;

const tokenizer = new Tokenizer(sql);
const tokens = tokenizer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();

const odata = new ODataVisitor();
console.log(odata.execute(ast));
// Output: /Products?$filter=Price gt 100&$orderby=Name asc
```

## API Reference

### Tokenizer

Tokenizes a SQL string into an array of tokens.

```typescript
const tokenizer = new Tokenizer(sql: string);
const tokens = tokenizer.tokenize(): Token[];
```

### Parser

Parses tokens into an Abstract Syntax Tree (AST).

```typescript
const parser = new Parser(tokens: Token[]);
const ast = parser.parse(): Statement;
```

### Visitors

| Visitor | Import | Description |
|---------|--------|-------------|
| `ODataVisitor` | `./src/interpreter/odata/odata.visitor` | Converts SQL to OData URI |
| `GraphQLVisitor` | `./src/interpreter/graphql` | Converts SQL to GraphQL query |
| `OpenAPIVisitor` | `./src/interpreter/openapi` | Generates OpenAPI schema from CREATE TABLE |
| `JsonInterpreter` | `./src/interpreter/json.interpreter` | Executes SQL against in-memory JSON data |
| `RxJSInterpreter` | `./src/interpreter/rxjs/rxjs.interpreter` | Generates RxJS Observable chains |
| `ReverseVisitor` | `./src/interpreter/reverse/reverse.visitor` | Converts AST back to SQL |

Each visitor implements an `execute(ast)` method that transforms the AST into its target format.

## Visitor Examples

### ODataVisitor

```typescript
import { ODataVisitor } from './src/interpreter/odata/odata.visitor';

const sql = `SELECT * FROM Products WHERE Price > 100 ORDER BY Name ASC`;
const ast = parse(sql);

const visitor = new ODataVisitor();
console.log(visitor.execute(ast));
// Output: /Products?$filter=Price gt 100&$orderby=Name asc
```

### GraphQLVisitor

```typescript
import { GraphQlVisitor } from './src/interpreter/graphql';

const sql = `
  CREATE TABLE Users (id INTEGER, name TEXT);
  SELECT id, name FROM Users WHERE id = 1;
`;
const ast = parse(sql);

const visitor = new GraphQlVisitor();
console.log(visitor.execute(ast));
// Output: query { Users(id : Int) { id name } }
```

### OpenAPIVisitor

```typescript
import { OpenApiVisitor } from './src/interpreter/openapi';

const sql = `
  CREATE TABLE Users (id INTEGER, name TEXT, email TEXT);
  SELECT id, name FROM Users;
`;
const ast = parse(sql);

const visitor = new OpenApiVisitor();
const spec = visitor.execute(ast, { title: 'My API', version: '1.0.0' });
// Returns OpenAPI 3.0 specification object
```

### JsonInterpreter

```typescript
import { JsonInterpreter } from './src/interpreter/json.interpreter';

const data = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
};

const sql = `SELECT name FROM users WHERE id = 1`;
const ast = parse(sql);

const interpreter = new JsonInterpreter(data);
console.log(interpreter.execute(ast));
// Output: [{ name: 'Alice' }]
```

### ReverseVisitor

```typescript
import { ReverseVisitor } from './src/interpreter/reverse/reverse.visitor';

const sql = `SELECT id, name FROM users WHERE active = true`;
const ast = parse(sql);

const visitor = new ReverseVisitor();
console.log(visitor.execute(ast));
// Output: select id, name from users where active = true;
```

### RxJSInterpreter

```typescript
import { RxJsInterpreter } from './src/interpreter/rxjs/rxjs.interpreter';

const sql = `SELECT name FROM users WHERE active = true`;
const ast = parse(sql);

const interpreter = new RxJsInterpreter();
interpreter.execute(ast).subscribe(console.log);
// Emits filtered results as Observable
```
