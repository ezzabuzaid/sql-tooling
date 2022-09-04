import { BinaryExpression, BinaryToken } from "./classes/binary.expression";
import { CallExpression } from "./classes/call.expression";
import { OrderByColumn, OrderByDirection } from "./classes/column.identifier";
import { Expression } from "./classes/expression";
import { GroupingExpression } from "./classes/grouping.expression";
import { GroupByExpression } from "./classes/group_expression";
import { Identifier } from "./classes/identifier";
import { LimitExpression } from "./classes/limit.expression";
import { BooleanLiteral } from "./classes/literals/boolean.literal";
import { NullLiteral } from "./classes/literals/null.literal";
import { NumericLiteral } from "./classes/literals/numeric.literal";
import { StringLiteral } from "./classes/literals/string.literal";
import { OrderExpression } from "./classes/order_expression";
import { SelectStatement } from "./classes/select_statements";
import { Statement } from "./classes/statement";
import { UnknownToken } from "./errors/unknown_token.error";
import { Factory } from "./factory/factory";
import { IToken, TokenType } from "./tokenizer";

export class Parser {
	private _current = 0;
	private _factory = new Factory();
	constructor(private _tokens: IToken<TokenType>[]) {}

	parse() {
		const tree: Statement[] = [];
		while (!this._isAtEnd()) {
			let token = this._tokens[this._current];

			switch (token.type) {
				case TokenType.SELECT:
					const statement = this._selectStatement();
					tree.push(statement);
					this._consume(TokenType.SEMICOLON, "Expect ';' after expression.");
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

	private get _currentToken() {
		return this._tokens[this._current];
	}

	private _selectStatement() {
		this._advance();
		const statement = new SelectStatement();
		if (this._match(TokenType.DISTINCT)) {
			statement.distinct = true;
		} else if (this._match(TokenType.ALL)) {
			statement.all = true;
		}

		if (this._match(TokenType.STAR)) {
			statement.columns.push(this._factory.createIdentifier("*"));
		}
		// if (this._match(TokenType.IDENTIFIER, TokenType.STRING))
		else {
			do {
				statement.columns.push(this._expression());
			} while (this._match(TokenType.COMMA));
		}

		if (this._match(TokenType.FROM)) {
			statement.from = this._expression();
			// TODO: handle mulitple from table names (CROSS JOIN)
			// do {
			// 	statement.columns.push(this._expression());
			// } while (this._match(TokenType.COMMA));
		}

		if (this._match(TokenType.WHERE)) {
			statement.where = this._expression();
		}

		// TODO: Handle Joins
		// TODO: Handle IN operator
		// TODO: Handle EXISTS operator
		// TODO: Add unit test
		if (this._match(TokenType.GROUP)) {
			this._consume(TokenType.BY, "Expect 'BY' after GROUP keyword.");
			statement.group = new GroupByExpression();
			do {
				statement.group.columns.push(this._expression());
			} while (this._match(TokenType.COMMA));
		}

		if (this._match(TokenType.HAVING)) {
			this._consume(TokenType.BY, "Expect 'BY' after HAVING keyword.");
			statement.having = new GroupByExpression();
			do {
				statement.having.columns.push(this._expression());
			} while (this._match(TokenType.COMMA));
		}

		if (this._match(TokenType.ORDER)) {
			this._consume(TokenType.BY, "Expect 'BY' after ORDER keyword.");
			statement.order = new OrderExpression();
			do {
				(statement.order as OrderExpression).columns.push(
					this._orderByColumn()
				);
			} while (this._match(TokenType.COMMA));
		}

		if (this._match(TokenType.LIMIT)) {
			statement.limit = new LimitExpression(this._expression());
			if (this._match(TokenType.COMMA, TokenType.OFFSET)) {
				(statement.limit as LimitExpression).offset = this._expression();
			}
		}
		return statement;
	}

	private _advance() {
		return this._tokens[++this._current];
	}

	private _retreat() {
		return this._tokens[--this._current];
	}

	private _orderByColumn() {
		const orderColumn = new OrderByColumn(this._expression());
		if (this._match(TokenType.DESC, TokenType.ASC)) {
			orderColumn.direction = this._previous()
				.lexeme as unknown as OrderByDirection;
		}
		return orderColumn;
	}

	private _primary(): Expression {
		const token = this._currentToken;

		if (this._match(TokenType.IDENTIFIER)) {
			return new Identifier(token.lexeme);
		}

		if (this._match(TokenType.NUMBER)) {
			return new NumericLiteral(token.lexeme);
		}

		if (this._match(TokenType.FALSE, TokenType.TRUE)) {
			return new BooleanLiteral(token.lexeme);
		}

		if (this._match(TokenType.STRING)) {
			return new StringLiteral(token.lexeme);
		}

		if (this._match(TokenType.NULL)) {
			return new NullLiteral(token.lexeme);
		}

		if (this._match(TokenType.LEFT_PAREN)) {
			// if (this._previous().type === TokenType.IN) {
			// 	this._advance();
			// 	const listExpression = new ListExpression();
			// 	do {
			// 		listExpression.expressions.push(this._expression());
			// 	} while (this._match(TokenType.COMMA));
			// 	return listExpression;
			// } else {
			// }
			// this._advance();
			switch (this._currentToken.type) {
				case TokenType.SELECT:
					let statement = this._selectStatement();
					this._consume(
						TokenType.RIGHT_PAREN,
						"Expect ')' at the end of 'SELECT statement'"
					);
					return statement;
				default:
					let expression = this._expression();
					expression = new GroupingExpression(expression);
					this._consume(TokenType.RIGHT_PAREN, "Expect ')'");
					return expression;
			}
		}

		throw new Error(`Invalid primary ${token.lexeme}`);
	}

	private _finishCall(callee: Expression): Expression {
		const args: Expression[] = [];
		if (!this._match(TokenType.RIGHT_PAREN)) {
			do {
				args.push(this._expression());
			} while (this._match(TokenType.COMMA));
		}
		this._consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

		return new CallExpression(callee, args);
	}

	private _call(): Expression {
		let expression = this._primary();
		while (true) {
			if (this._match(TokenType.LEFT_PAREN)) {
				expression = this._finishCall(expression);
			} else {
				break;
			}
		}
		return expression;
	}

	private _unary(): Expression {
		if (this._match(TokenType.NOT, TokenType.MINUS, TokenType.EXISTS)) {
			const right = this._unary();
			return this._factory.createUnaryExpression(this._previous(), right);
		}

		// if (this._match(TokenType.EXISTS)) {
		// 	this._advance();
		// 	this._consume(TokenType.LEFT_PAREN, "Expect '(' after 'EXISTS'");
		// 	const statement = this._selectStatement();
		// 	this._consume(TokenType.RIGHT_PAREN, "Expect ')' at the end of 'EXISTS'");
		// 	return new UnaryExpression(new Identifier(operator.lexeme), statement);
		// }

		return this._call();
	}

	private _factor(): Expression {
		let expression = this._unary();
		while (this._match(TokenType.SLASH, TokenType.STAR, TokenType.MODULO)) {
			const operator = this._previous<BinaryToken>();
			const right = this._unary();
			expression = new BinaryExpression(expression, operator, right);
		}
		return expression;
	}

	private _term(): Expression {
		let expression = this._factor();
		while (this._match(TokenType.PLUS, TokenType.MINUS)) {
			const operator = this._previous<BinaryToken>();
			const right = this._factor();
			expression = new BinaryExpression(expression, operator, right);
		}
		return expression;
	}

	// WHERE year = 2013
	// AND year_rank  BETWEEN 2 AND 3

	private _rangeContainment(): Expression {
		let expression = this._term();
		if (this._match(TokenType.NOT_BETWEEN, TokenType.BETWEEN)) {
			const operator = this._previous<BinaryToken>();
			const right = this._andConditions();
			expression = new BinaryExpression(expression, operator, right);
			return expression;
		}

		if (
			this._match(
				TokenType.NOT_ILIKE,
				TokenType.NOT_LIKE,
				TokenType.IN,
				TokenType.LIKE,
				TokenType.ILIKE,
				TokenType.SIMILAR
			)
		) {
			const operator = this._previous<BinaryToken>();
			const right = this._term();
			expression = new BinaryExpression(expression, operator, right);
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
			const operator = this._previous<BinaryToken>();
			const right = this._rangeContainment();
			expression = new BinaryExpression(expression, operator, right);
		}
		return expression;
	}

	private _equality(): Expression {
		let expression: Expression = this._comparison();

		// if (this._match(TokenType.IS)) {
		// 	if (this._match(TokenType.NOT)) {
		// 		const right = this._comparison();
		// 		const operator = this._factory.createToken(TokenType.IS_NOT); // FIXME: should be created in the tokenizer because of line, start and end to be correct
		// 		expression = new BinaryExpression(expression, operator, right);
		// 	}
		// }

		while (
			this._match(
				TokenType.EQUAL_EQUAL,
				TokenType.NOT_EQUAL,
				TokenType.IS,
				TokenType.IS_NOT
			)
		) {
			const operator = this._previous<BinaryToken>();
			const right = this._comparison();
			expression = new BinaryExpression(expression, operator, right);
		}
		return expression;
	}

	private _andConditions(): Expression {
		let expression: Expression = this._equality();
		while (this._match(TokenType.AND)) {
			const operator = this._previous<BinaryToken>();
			const right = this._equality();
			expression = new BinaryExpression(expression, operator, right);
		}
		return expression;
	}

	private _orCondition(): Expression {
		let expression: Expression = this._andConditions();
		while (this._match(TokenType.OR)) {
			const operator = this._previous<BinaryToken>();
			const right = this._andConditions();
			expression = new BinaryExpression(expression, operator, right);
		}
		return expression;
	}

	private _expression(): Expression {
		const expression = this._orCondition();
		if (this._match(TokenType.AS)) {
			expression.alias = this._currentToken.lexeme;
			this._advance();
		}
		return expression;
	}

	private _isAtEnd() {
		const token = this._tokens[this._current];
		return token.type === TokenType.EOF;
	}

	private _peak() {
		return this._tokens[1 + this._current];
	}

	private _previous<T extends TokenType>() {
		return this._tokens[this._current - 1] as IToken<T>;
	}

	private _match(...tokens: TokenType[]) {
		if (this._check(...tokens)) {
			this._advance();
			return true;
		}
		return false;
	}

	private _consume(type: TokenType, message: string) {
		if (this._check(type)) return this._advance();
		const error = new Error(message);
		Error.captureStackTrace(error, this._consume);
		throw error;
	}

	private _check(...tokens: TokenType[]): boolean {
		return tokens.includes(this._currentToken.type);
	}
}
