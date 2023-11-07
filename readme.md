# Types SQL Query Parser

Hi, this project that meant to be used in my side projects, the soul purpose of it

1. Remove the need to create simple API endpoints.
2. Handle custom query from the frontend without having the API to change.
3. Meant as replacement of GraphQL.
4. I always wanted to build Tree Walker interpreter.

The project will do the following tasks mainly:

1. Validate the client query doesn't abuse the server.
2. Ensure the query is valid "at Compile time" - regulary pulling database info to validate against - (useful as CI task)

Example

```sql
SELECT name, price FROM Products
Where price > 25;
```

This query is synaticaly valid, however, this can pull huge amount of rows, therefore the server would refuse any query that doesn't limit the count of returned data.

## Guide

### Custom Keywords

1. HTTP
2. CACHE
3. Pagination (Maybe)

## ODataVisitor

```ts
const oDataVisitor = new ODataVisitor();

const sql = `SELECT * FROM Sales WHERE strftime('%m', ShipDate) = '12';`;
const tokenizer = new Tokenizer(sql);
const tokens = tokenizer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();
console.log(oDataVisitor.execute(ast));
// /Sales?$filter=month(ShipDate) eq '12'
```
