import { CrossJoin } from './classes/CrossJoin';
import { BinaryExpression, BinaryToken } from './classes/binary.expression';
import { CallExpression } from './classes/call.expression';
import { OrderByColumn, OrderByDirection } from './classes/column.identifier';
import { Expression } from './classes/expression';
import { GroupByExpression } from './classes/group_expression';
import { GroupingExpression } from './classes/grouping.expression';
import { Identifier } from './classes/identifier';
import { LimitExpression } from './classes/limit.expression';
import { BooleanLiteral } from './classes/literals/boolean.literal';
import { NullLiteral } from './classes/literals/null.literal';
import { StringLiteral } from './classes/literals/string.literal';
import { OrderExpression } from './classes/order_expression';
import { Statement } from './classes/statement';
import {
  ColumnDefinition,
  DataType,
  PrimaryKey,
} from './classes/statements/create.statements';
import { SelectStatement } from './classes/statements/select.statements';
import { UnknownPrimary } from './errors/unknown_primary.error';
import { UnknownToken } from './errors/unknown_token.error';
import { Factory, getKeyByValue, keywords } from './factory/factory';
import { IToken, TokenType } from './token';

const factory = new Factory();
export class Parser {
  private _current = 0;
  constructor(private _tokens: IToken<TokenType>[]) {}

  parse(): Statement[] {
    const tree: Statement[] = [];
    while (!this._isAtEnd()) {
      let token = this._tokens[this._current];

      switch (token.type) {
        case TokenType.SELECT:
          const selectStatement = this._selectStatement();
          tree.push(selectStatement);
          this._consume(TokenType.SEMICOLON, "Expect ';' after expression.");
          break;
        case TokenType.CREATE:
          this._advance();
          if (this._check(TokenType.VIEW)) {
            let viewStatement = this._createView();
            tree.push(viewStatement);
            this._consume(TokenType.SEMICOLON, "Expect ';' after expression.");
          } else {
            let createStatement = this._createStatement();
            tree.push(createStatement);
            this._consume(TokenType.SEMICOLON, "Expect ';' after expression.");
          }
          break;
        case TokenType.UPDATE:
          let updateStatement = this._updateStatement();
          tree.push(updateStatement);
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

  private _isConstraint() {
    return this._check(TokenType.NOT, TokenType.UNIQUE, TokenType.CHECK);
  }

  private _listConstraint(): PrimaryKey {
    const columns: Identifier[] = [];
    if (this._match(TokenType.LEFT_PAREN)) {
      do {
        columns.push(factory.createIdentifier(this._currentToken.lexeme));
        this._advance();
      } while (this._match(TokenType.COMMA));
      this._consume(TokenType.RIGHT_PAREN, `Primary key missing right paren.`);
    }
    const primaryKey = factory.createConstraint(columns);
    return primaryKey;
  }

  private _columnDefinition(): ColumnDefinition {
    let unique = true;
    let nullable = true;
    let check: Expression | undefined;
    let defaultValue: any;
    const columnNameToken = this._currentToken;
    this._advance();
    const dataTypeToken = this._currentToken as IToken<DataType>;
    this._advance();
    if (this._match(TokenType.PRIMARY)) {
      throw new Error('Primary key is not supported at column level.');
    }

    while (this._isConstraint()) {
      if (this._match(TokenType.NOT)) {
        this._consume(
          TokenType.NULL,
          'Literal NULL is missing after NOT keyword',
        );
        nullable = false;
      } else if (this._match(TokenType.UNIQUE)) {
        unique = false;
      } else if (this._match(TokenType.CHECK)) {
        check = this._expression();
      } else if (this._match(TokenType.DEFAULT)) {
        defaultValue = factory.createIdentifier(this._currentToken.lexeme);
      } else {
        throw new Error(
          'Constraint not supported ' + this._currentToken.lexeme,
        );
      }
    }

    const columnDef = factory.createColumnDefinition(
      factory.createIdentifier(columnNameToken.lexeme),
      dataTypeToken,
      nullable,
      unique,
      check,
      defaultValue,
    );
    return columnDef;
  }

  private _updateStatement(): Statement {
    this._advance();
    const table = this._expression();
    this._consume(TokenType.SET, 'SET keyword is missing.');
    const columns: Expression[] = [];
    let where: Expression | undefined;
    do {
      columns.push(this._expression());
    } while (this._match(TokenType.COMMA));
    if (this._match(TokenType.WHERE)) {
      where = this._expression();
    }
    const statement = factory.createUpdateStatement(
      table,
      columns,
      undefined,
      where,
    );
    return statement;
  }

  private _createView(): Statement {
    this._consume(
      TokenType.VIEW,
      `CREATE keyword should be followed by TABLE or VIEW keyword.`,
    );
    const tableNameToken = this._currentToken;
    this._advance();
    this._consume(
      TokenType.AS,
      `VIEW keyword should be followed by AS keyword.`,
    );
    const statement = factory.createViewStatement(
      factory.createIdentifier(tableNameToken.lexeme),
      this._selectStatement(),
    );
    return statement;
  }

  private _createStatement(): Statement {
    let temp = false;
    this._consume(
      TokenType.TABLE,
      `CREATE keyword should be followed by TABLE or VIEW keyword.`,
    );
    if (this._match(TokenType.TEMP)) {
      temp = true;
    }
    const tableNameToken = this._currentToken;
    this._advance();
    const statement = factory.createCreateStatement(
      factory.createIdentifier(tableNameToken.lexeme),
      temp,
    );
    this._consume(TokenType.LEFT_PAREN, `Missing left paren.`);

    do {
      if (this._match(TokenType.PRIMARY)) {
        this._consume(
          TokenType.KEY,
          'Keyword KEY is missing after PRIMARY keyword',
        );
        statement.primaryKey = this._listConstraint();
      } else if (this._match(TokenType.UNIQUE)) {
        statement.primaryKey = this._listConstraint();
      } else if (this._match(TokenType.CHECK)) {
        statement.check = this._expression();
      } else {
        statement.columns.push(this._columnDefinition());
      }
    } while (this._match(TokenType.COMMA));

    this._consume(TokenType.RIGHT_PAREN, `Missing right paren.`);

    return statement;
  }

  private _selectStatement(): SelectStatement {
    this._advance();
    const statement = factory.createSelectStatement([]);
    if (this._match(TokenType.DISTINCT)) {
      statement.distinct = true;
    } else if (this._match(TokenType.ALL)) {
      statement.all = true;
    }

    // if (this._match(TokenType.STAR)) {
    // 	statement.columns.push(factory.createIdentifier("*"));
    // }
    // if (this._match(TokenType.IDENTIFIER, TokenType.STRING))
    // else {
    do {
      const keyword = getKeyByValue(keywords, this._currentToken.type);
      if (keyword) {
        // allow keywords as column names
        statement.columns.push(
          factory.createIdentifier(this._currentToken.lexeme),
        );
        this._advance();
      } else {
        const columnName = this._expression();
        statement.columns.push(columnName);
      }
    } while (this._match(TokenType.COMMA));
    // }

    const columnsNames = statement.columns.map((node) => node.toLiteral());
    // Handling cases like "select *, id from test;""
    if (statement.columns.length > 1 && columnsNames.includes('*')) {
      throw new Error("Cannot use '*' with other columns");
    }

    if (this._match(TokenType.FROM)) {
      statement.from = this._expression();
      while (this._match(TokenType.COMMA)) {
        statement.joins.push(new CrossJoin(this._expression()));
      }

      if (this._match(TokenType.CROSS)) {
        this._consume(TokenType.JOIN, "Missing 'JOIN' keyword.");
        statement.joins.push(new CrossJoin(this._expression()));
      }
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

    // Handling cases where count(*) with other columns are used by not appearing
    // in group by clause e.g. "select count(*), id from test;" without group by
    // correct version is "select count(*), id from test group by id"
    // const groupByColumnsNames = (statement.group?.columns ?? []).map((node) =>
    // 	node.toLiteral()
    // );
    // if (
    // 	statement.columns.length > 1 &&
    // 	columnsNames.some((item) =>
    // 		AGGREGATE_FUNCTIONS.some((fnName) => item.startsWith(fnName))
    // 	)
    // ) {
    // 	const columnsListInGroupBy = columnsNames
    // 		.filter(
    // 			(node) =>
    // 				!AGGREGATE_FUNCTIONS.some((fnName) => node.startsWith(fnName))
    // 		)
    // 		.every((name) => groupByColumnsNames.includes(name));
    // 	if (!columnsListInGroupBy) {
    // 		throw new Error(
    // 			`Columns names with count(*) should be included in group by clause`
    // 		);
    // 	}
    // }

    // groupByColumnsNames.forEach((name) => {
    // 	if (AGGREGATE_FUNCTIONS.some((aggFn) => name.startsWith(aggFn))) {
    // 		throw new Error("Cannot have aggregate function in group by clause");
    // 	}
    // });

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
          this._orderByColumn(),
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

    if (this._match(TokenType.STAR)) {
      return factory.createIdentifier(token.lexeme);
    }

    // if (this._match(TokenType.DISTINCT)) {
    // 	let expression = this._expression();
    // 	return factory.createIdentifier(token.lexeme);
    // }

    if (this._match(TokenType.IDENTIFIER)) {
      return factory.createIdentifier(token.lexeme);
    }

    if (this._match(TokenType.NUMBER)) {
      return factory.createNumericLiteral(token.lexeme);
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
          let selectStatement = this._selectStatement();
          this._consume(
            TokenType.RIGHT_PAREN,
            "Expect ')' at the end of 'SELECT statement'",
          );
          return selectStatement;
        default:
          let expression = this._expression();
          expression = new GroupingExpression(expression);
          this._consume(TokenType.RIGHT_PAREN, "Expect ')'");
          return expression;
      }
    }

    throw new UnknownPrimary(token);
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
      return factory.createUnaryExpression(this._previous(), right);
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
    while (
      this._match(
        TokenType.SLASH,
        TokenType.STAR,
        TokenType.MODULO,
        TokenType.CONCAT,
      )
    ) {
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
        TokenType.SIMILAR,
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
        TokenType.GREATER_EQUAL,
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
    // 		const operator = factory.createToken(TokenType.IS_NOT); // FIXME: should be created in the tokenizer because of line, start and end to be correct
    // 		expression = new BinaryExpression(expression, operator, right);
    // 	}
    // }

    while (
      this._match(
        TokenType.EQUAL_EQUAL,
        TokenType.NOT_EQUAL,
        TokenType.IS,
        TokenType.IS_NOT,
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
