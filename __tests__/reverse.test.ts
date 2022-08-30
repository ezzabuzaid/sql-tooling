import { ReverseVisitor } from "../src/interpreter/reverse.visitor";
import { Parser } from "../src/parser";
import { Tokenizer } from "../src/tokenizer";

const statmeents = [
	`select category from products`,
	`select distinct category, name from products group by category;`,
	`SELECT * FROM Member WHERE MemberType = 'Senior'`,
	"SELECT LastName, FirstName, Phone FROM Member",
	`SELECT LastName, FirstName, Phone FROM Member WHERE MemberType = 'Senior'`,
	`SELECT Member.LastName, Member.FirstName, Member.Phone FROM Member WHERE Member.MemberType = 'Senior'`,
	`SELECT * FROM Member as m WHERE m.MemberType = 'Junior' AND m.Gender = 'F'`,
	`SELECT UPPER(MemberType) FROM Member`,
];

describe("Reverse AST", () => {
	statmeents.forEach((stmt) => {
		it(stmt, () => {
			const tokenizer = new Tokenizer(stmt);
			const parser = new Parser(tokenizer.tokenize());
			const [ast] = parser.parse();
			const reverseVisitor = new ReverseVisitor();
			expect(stmt.toLowerCase().trim()).toEqual(
				reverseVisitor.execute(ast).toLowerCase().trim()
			);
		});
	});
});
