import { BinaryExpression } from "./classes/binary.expression";
import { CallExpression, NameIdentifier } from "./classes/call.expression";
import {
	ColumnIdentifier,
	OrderByColumn,
	OrderByDirection,
} from "./classes/column.identifier";
import { Expression } from "./classes/expression";
import { GroupingExpression } from "./classes/grouping.expression";
import { GroupExpression } from "./classes/group_expression";
import { LimitExpression } from "./classes/limit.expression";
import { ListExpression } from "./classes/list.expression";
import { LiteralExpression } from "./classes/literal.expression";
import { NumericLiteral } from "./classes/numeric.literal";
import { OrderExpression } from "./classes/order_expression";
import { SelectStatement } from "./classes/select_statements";
import { TableIdentifier } from "./classes/table.identifier";
import { UnaryExpression } from "./classes/unary.expression";
import { UnknownToken } from "./errors/unknown_token.error";
import { IToken, TokenType } from "./tokenizer";

export class Parser {
	private _current = 0;
	constructor(private _tokens: IToken[]) {}
	parse() {
		const tree = [];
		while (!this._isAtEnd()) {
			let token = this._tokens[this._current];
			switch (token.type) {
				case TokenType.SELECT:
					const statement = this._parseSelect();
					tree.push(statement);
					break;
				case TokenType.SEMICOLON:
				case TokenType.EOF:
					this._advance();
					break;
				default:
					throw new UnknownToken(token);
			}
		}
		return tree;
	}

	private _advance() {
		// if (this._peak().type === TokenType.EOF) {
		// 	return this._tokens[this._current];
		// }
		return this._tokens[++this._current];
	}

	private _parseSelect() {
		// Another way to parse identifiers without checking the belongee is
		// to have variable tells which main keyword was the last one and base on that in
		// the IDENTIFIER case you pick the right array to push to
		// CODE: var mainKeyword = undefined;
		// if, for instance, ORDER case matched then CODE: mainKeyword = 'order';
		// and so on, in the IDENTIFIER case you pick the array of that keyword and push to it.
		const selectStatement = new SelectStatement();
		selectStatement.group = new GroupExpression();
		selectStatement.order = new OrderExpression();
		let token = this._advance(); // move out of "SELECT" token

		selectWhile: while (!this._isAtEnd()) {
			token = this._advance();
			switch (token.type) {
				case TokenType.OFFSET:
					token = this._advance();
					if (selectStatement.limit) {
						selectStatement.limit.offset = new NumericLiteral(token.lexeme);
					}
					break;
				// throw an error if not found
				case TokenType.LIMIT:
					token = this._advance();
					selectStatement.limit = new LimitExpression(
						new NumericLiteral(token.lexeme)
					);
					break;
				case TokenType.DISTINCT:
					selectStatement.distinct = true;
					break;
				case TokenType.FROM:
					token = this._advance(); // move out of "FROM" token
					selectStatement.from = new TableIdentifier(token.lexeme);
					break;
				case TokenType.COUNT:
				case TokenType.SUM:
				case TokenType.STAR:
				case TokenType.IDENTIFIER:
					let cursor = this._current - 1;
					while (
						![
							TokenType.GROUP,
							TokenType.ORDER,
							TokenType.SELECT,
							TokenType.WHERE,
						].includes(this._tokens[cursor].type)
					) {
						cursor--;
					}
					const clause = this._tokens[cursor]; // the token that the main token (IDENTIFIER) belongs to
					switch (clause.type) {
						case TokenType.SELECT:
							let columnName: ColumnIdentifier;
							if (
								token.type === TokenType.COUNT ||
								token.type === TokenType.SUM
							) {
								const callExpression = this._parseFunction();
								selectStatement.columns.push(callExpression);
								columnName = callExpression.name;
							} else {
								const column = new ColumnIdentifier(token.lexeme);
								selectStatement.columns.push(column);
								columnName = column;
							}
							if (this._peak().type === TokenType.AS) {
								token = this._advance(); // this is "AS" token
								token = this._advance(); // this is "AS" token identifier
								columnName.alias = token.lexeme;
							}
							break;
						case TokenType.GROUP:
							const column = new ColumnIdentifier(token.lexeme);
							selectStatement.group.columns.push(column);
							break;
						case TokenType.ORDER:
							const orderByColumn = new OrderByColumn(token.lexeme);
							selectStatement.order.columns.push(orderByColumn);
							break;
						case TokenType.WHERE:
							selectStatement.where = this._expression();
							break;
					}
					break;
				case TokenType.ASC:
				case TokenType.DESC:
					const lastOrderColumn = selectStatement.order.columns.at(-1)!;
					lastOrderColumn.direction =
						token.lexeme as unknown as OrderByDirection;
					token = this._advance();
					break;
				case TokenType.NUMBER:
				case TokenType.STRING:
				case TokenType.MINUS:
				case TokenType.BANG:
					selectStatement.where = this._expression();
				case TokenType.COMMA:
				case TokenType.ORDER:
				case TokenType.GROUP:
				case TokenType.BY:
				case TokenType.WHERE:
					break;
				default:
					break selectWhile;
			}
		}
		return selectStatement;
	}

	private _parseFunction(): CallExpression {
		let token = this._tokens[this._current];
		const expression = new CallExpression();
		expression.name = new NameIdentifier(token.lexeme);
		this._advance(); // move out of function name token
		token = this._advance(); // move out of "(" token
		while (token.type !== TokenType.RIGHT_PAREN) {
			expression.arguments.push(new ColumnIdentifier(token.lexeme));
			token = this._advance();
		}
		return expression;
	}

	private _primary(): Expression {
		const token = this._tokens[this._current];

		switch (token.type) {
			case TokenType.NUMBER:
			case TokenType.STRING:
			case TokenType.IDENTIFIER:
			case TokenType.NULL:
				this._advance();
				return new LiteralExpression(new NameIdentifier(token.lexeme));
			case TokenType.LEFT_PAREN:
				if (this._previous().type === TokenType.IN) {
					const ex = new ListExpression();
					this._advance();
					ex.expressions.push(this._expression());
					while (this._match(TokenType.COMMA)) {
						this._advance();
						ex.expressions.push(this._expression());
					}
					return ex;
				} else {
					this._advance();
					const expression = this._expression();
					return new GroupingExpression(expression);
				}
			default:
				throw new Error(`invalid primary ${token.lexeme}`);
		}
	}

	private _unary(): Expression {
		if (this._match(TokenType.NOT, TokenType.MINUS)) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._unary();
			return new UnaryExpression(new NameIdentifier(operator.lexeme), right);
		}
		return this._primary();
	}

	private _factor(): Expression {
		let expression = this._unary();
		while (this._match(TokenType.SLASH, TokenType.STAR, TokenType.MODULO)) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._unary();
			expression = new BinaryExpression(
				expression,
				new NameIdentifier(operator.lexeme),
				right
			);
		}
		return expression;
	}

	private _term(): Expression {
		let expression = this._factor();
		while (this._match(TokenType.PLUS, TokenType.MINUS)) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._factor();
			expression = new BinaryExpression(
				expression,
				new NameIdentifier(operator.lexeme),
				right
			);
		}
		return expression;
	}

	private _rangeContainment(): Expression {
		let expression = this._term();
		if (
			this._match(
				TokenType.BETWEEN,
				TokenType.IN,
				TokenType.LIKE,
				TokenType.ILIKE,
				TokenType.SIMILAR
			)
		) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._term();
			expression = new BinaryExpression(
				expression,
				new NameIdentifier(operator.lexeme),
				right
			);
		}
		return expression;
	}

	private _comparison(): Expression {
		let expression = this._rangeContainment();
		while (
			this._match(
				TokenType.LESS,
				TokenType.LESS_EQUAL,
				TokenType.GREATER,
				TokenType.GREATER_EQUAL
			)
		) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._rangeContainment();
			expression = new BinaryExpression(
				expression,
				new NameIdentifier(operator.lexeme),
				right
			);
		}
		return expression;
	}

	private _equality(): Expression {
		let expression: Expression = this._comparison();
		while (
			this._match(TokenType.EQUAL_EQUAL, TokenType.NOT_EQUAL, TokenType.IS)
		) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._comparison();
			expression = new BinaryExpression(
				expression,
				new NameIdentifier(operator.lexeme),
				right
			);
		}
		return expression;
	}

	private _andConditions(): Expression {
		let expression: Expression = this._equality();
		while (this._match(TokenType.AND)) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._equality();
			expression = new BinaryExpression(
				expression,
				new NameIdentifier(operator.lexeme),
				right
			);
		}
		return expression;
	}

	private _orCondition(): Expression {
		let expression: Expression = this._andConditions();
		while (this._match(TokenType.OR)) {
			const operator = this._tokens[this._current];
			this._advance();
			const right = this._andConditions();
			expression = new BinaryExpression(
				expression,
				new NameIdentifier(operator.lexeme),
				right
			);
		}
		return expression;
	}

	private _expression(): Expression {
		return this._orCondition();
	}

	private _isAtEnd() {
		const token = this._tokens[this._current];
		return token.type === TokenType.EOF;
	}

	private _peak() {
		return this._tokens[1 + this._current];
	}

	private _peakNext() {
		return this._tokens[2 + this._current];
	}

	private _previous() {
		return this._tokens[this._current - 1];
	}

	private _match(...tokens: TokenType[]) {
		const token = this._tokens[this._current];
		return tokens.includes(token.type);
	}
}

function orderByArchivedLogic() {
	// const orderExpression = new OrderExpression();
	// orderWhile: while (!this._isAtEnd()) {
	// 	const column = new OrderByColumn(token.lexeme);
	// 	orderExpression.columns.push(column);
	// 	token = this._advance(); // move out of order by column "IDENTIFIER" token
	// 	if (this._isAtEnd()) {
	// 		// in case there was nothing after the "ORDER BY 'column name'" then set default
	// 		// direction and break the loop
	// 		column.direction = "ASC";
	// 		break orderWhile;
	// 	} else {
	// 		column.direction = token.lexeme as unknown as OrderByDirection;
	// 	}
	// 	token = this._advance(); // move out of order by direction "IDENTIFIER" token
	// 	if (this._isAtEnd()) {
	// 		break orderWhile;
	// 	}
	// 	// if we still haven't reached the "EOF" that means there's comma token
	// 	// because the order by is always the last statement
	// 	token = this._advance(); // move out of "COMMA" token
	// 	// TODO: add token validation that must have comma
	// }
	// selectStatement.order = orderExpression;
}
