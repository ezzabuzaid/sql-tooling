import { BinaryExpression } from "../classes/binary.expression";
import { CallExpression } from "../classes/call.expression";
import { Expression } from "../classes/expression";
import { GroupingExpression } from "../classes/grouping.expression";
import { GroupByExpression } from "../classes/group_expression";
import { Identifier } from "../classes/identifier";
import { LimitExpression } from "../classes/limit.expression";
import { BooleanLiteral } from "../classes/literals/boolean.literal";
import { NullLiteral } from "../classes/literals/null.literal";
import { NumericLiteral } from "../classes/literals/numeric.literal";
import { StringLiteral } from "../classes/literals/string.literal";
import { CreateStatement } from "../classes/statements/create.statements";
import { SelectStatement } from "../classes/statements/select.statements";
import { UnaryExpression } from "../classes/unary.expression";
import { Visitor } from "./visitor";

type Node = Record<string, any>;

class WalkVisitor extends Visitor<Node> {
	public visitCreateStmt(stmt: CreateStatement): Node {
		throw new Error("Method not implemented.");
	}
	public visitLimitExpr(expr: LimitExpression, context?: any): Node {
		throw new Error("Method not implemented.");
	}
	public visitCallExpr(expr: CallExpression, row: Record<string, any>): Node {
		throw new Error("Method not implemented.");
	}
	public visitGroupingExpr(expr: GroupingExpression): Node {
		throw new Error("Method not implemented.");
	}
	public visitUnaryExpr(expr: UnaryExpression): Node {
		throw new Error("Method not implemented.");
	}
	public visitNumericLiteralExpr(expr: NumericLiteral): Node {
		throw new Error("Method not implemented.");
	}
	public visitBinaryExpr(expr: BinaryExpression, context: any): Node {
		throw new Error("Method not implemented.");
	}
	public visitNullLiteralExpr(expr: NullLiteral): Node {
		return {
			type: "NullLiteral",
			value: expr.value,
		};
	}
	public visitBooleanLiteralExpr(expr: BooleanLiteral): Node {
		return {
			type: "BooleanLiteral",
			value: expr.value,
		};
	}
	public visitStringLiteralExpr(expr: StringLiteral): Node {
		return {
			type: "StringLiteral",
			value: expr.value,
		};
	}
	public visitIdentifier(expr: Identifier): Node {
		return {
			type: "Identifier",
			name: expr.text,
			alias: expr.alias,
		};
	}
	public visitSelectStmt(stmt: SelectStatement): Node {
		return {
			type: "Statement",
			expressions: [
				stmt.columns.map((column) => column.accept(this)),
				stmt.from?.accept(this),
			],
		};
	}
	public visitGroupByExpr(expr: GroupByExpression): Node {
		throw new Error("Method not implemented.");
	}

	public execute(expr: Expression): Node {
		return {
			type: "Program",
			body: expr.accept(this),
		};
	}
}

interface VisitorEnterGate {
	enter: (arg: any) => void;
	exit?: (arg: any) => void;
}
interface VisitorExitGate {
	enter?: (arg: any) => void;
	exit: (arg: any) => void;
}

export function walk(
	ast: Expression,
	simpleVisitor: Record<string, VisitorEnterGate | VisitorExitGate>
) {
	const visitor = new WalkVisitor();
	const result = visitor.execute(ast);
	traverseNode(result);
	function traverseArray(array: Node[]) {
		array.forEach((child) => {
			traverseNode(child);
		});
	}

	function traverseNode(node: Node) {
		const method = simpleVisitor[node.type];
		if (method) {
			method.enter?.(node);
		}

		switch (node.type) {
			case "Program":
				traverseNode(node.body);
				break;
			case "Statement":
				traverseArray(node.expressions);
				break;

			default:
				break;
		}
		if (method) {
			method.exit?.(node);
		}
	}
}
