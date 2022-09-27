import connect, { sql } from "@databases/sqlite";
import express from "express";
import { Parser, Tokenizer } from "../../src";
const app = express();
app.get("/", (req) => {
	console.log("sql", req.query.sql);
	const tokenizer = new Tokenizer(req.query.sql as string);
	const tokens = tokenizer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	console.log(ast);
	// console.log(await get("name"));
});

app.listen(3000);

const db = connect();

async function prepare() {
	await db.query(sql`
    CREATE TABLE products (
      id VARCHAR NOT NULL PRIMARY KEY,
      name VARCHAR NOT NULL
    );
  `);
}
const prepare$ = prepare();

async function set(id: string, value: string) {
	await prepare$;
	await db.query(sql`
    INSERT INTO products (id, name)
      VALUES (${id}, ${value})
    ON CONFLICT (id) DO UPDATE
      SET value=excluded.value;
  `);
}

async function get(id: string) {
	await prepare$;
	const results = await db.query(sql`
    SELECT value FROM products WHERE id=${id};
  `);
	if (results.length) {
		return results[0].value;
	} else {
		return undefined;
	}
}

async function remove(id: string) {
	await prepare$;
	await db.query(sql`
    DELETE FROM products WHERE id=${id};
  `);
}

async function run() {
	await set("name", "Forbes");
	await set("name", "Lindesay");
}
run().catch((ex) => {
	console.error(ex.stack);
	process.exit(1);
});
