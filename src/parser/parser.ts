import { Token, TokenType, SourceLocation, SourcePosition } from './tokenTypes';
import {
  ASTNode,
  ProgramNode,
  StatementNode,
  ExpressionNode,
  MethodDefinitionNode,
  ParameterListNode,
  AssignmentNode,
  IdentifierNode,
  NumberLiteralNode,
  StringLiteralNode,
  BooleanLiteralNode,
  NilLiteralNode,
  BinaryExpressionNode,
  ComparisonExpressionNode,
  UnaryExpressionNode,
  MethodCallNode,
  PutsStatementNode,
  IfStatementNode,
  ElsifBranchNode,
  ElseBranchNode,
  ExpressionStatementNode,
} from './astTypes';
import { UNSUPPORTED_RUBY_KEYWORDS } from './grammar';

export interface ParserError {
  message: string;
  line: number;
  column: number;
  startOffset: number;
  endOffset: number;
  suggestion?: string;
  token?: Token;
}

export interface ParserResult {
  ast: ProgramNode | null;
  errors: ParserError[];
}

export class Parser {
  private tokens: Token[];
  private current: number = 0;
  private errors: ParserError[] = [];
  private nodeIdCounter: number = 0;

  constructor(tokens: Token[]) {
    // Filter out comments from syntax parsing, but keep error tokens to report or skip
    this.tokens = tokens.filter((t) => t.type !== 'COMMENT');
  }

  private generateId(prefix: string): string {
    this.nodeIdCounter++;
    return `${prefix}_${this.nodeIdCounter}`;
  }

  public parse(): ParserResult {
    this.current = 0;
    this.errors = [];
    this.nodeIdCounter = 0;

    const startPos = this.getPosition();
    const statements: StatementNode[] = [];

    this.skipSeparators();

    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (err) {
        // Synchronize to the next statement delimiter
        this.synchronize();
      }
      this.skipSeparators();
    }

    const endPos = this.getPosition();
    const loc: SourceLocation = { start: startPos, end: endPos };

    const programNode: ProgramNode = {
      id: this.generateId('program'),
      type: 'Program',
      body: statements,
      loc,
    };

    return {
      ast: programNode,
      errors: this.errors,
    };
  }

  private parseStatement(): StatementNode | null {
    this.skipSeparators();
    if (this.isAtEnd()) return null;

    const token = this.peek();

    // Check for unsupported Ruby keywords
    if (token.type === 'IDENTIFIER' && UNSUPPORTED_RUBY_KEYWORDS[token.value]) {
      const hint = UNSUPPORTED_RUBY_KEYWORDS[token.value];
      this.reportError(
        `Unsupported Ruby syntax '${token.value}' at line ${token.line}, column ${token.column}.`,
        token,
        hint
      );
      this.advance();
      return null;
    }

    // Method Definition: def ... end
    if (this.match('DEF')) {
      return this.parseMethodDefinition();
    }

    // If Statement: if ... [elsif ...] [else ...] end
    if (this.match('IF')) {
      return this.parseIfStatement();
    }

    // Puts Statement: puts ...
    if (this.match('PUTS')) {
      return this.parsePutsStatement();
    }

    // Assignment: identifier = expression
    if (this.isAssignment()) {
      return this.parseAssignment();
    }

    // Expression Statement
    return this.parseExpressionStatement();
  }

  private isAssignment(): boolean {
    if (this.peek().type === 'IDENTIFIER') {
      const nextToken = this.peekNext();
      return nextToken.type === 'EQUAL';
    }
    return false;
  }

  private parseMethodDefinition(): MethodDefinitionNode {
    const defToken = this.previous();
    const startPos = this.tokenStart(defToken);

    // Method Name
    if (!this.check('IDENTIFIER')) {
      this.reportError(
        `Expected method name after 'def' at line ${this.peek().line}, column ${this.peek().column}.`,
        this.peek(),
        "Provide a valid method identifier, e.g., 'def calculate(x)'."
      );
      throw new Error('Parse error');
    }

    const nameToken = this.advance();
    const methodName = nameToken.value;

    // Optional parameters: (a, b) or without parens
    const parameters: IdentifierNode[] = [];
    if (this.match('LPAREN')) {
      if (!this.check('RPAREN')) {
        do {
          this.skipSeparators();
          if (this.check('IDENTIFIER')) {
            const paramToken = this.advance();
            parameters.push({
              id: this.generateId('param'),
              type: 'Identifier',
              name: paramToken.value,
              loc: this.tokenLocation(paramToken),
            });
          } else {
            this.reportError(
              `Expected parameter name at line ${this.peek().line}, column ${this.peek().column}.`,
              this.peek(),
              'Method parameters must be valid identifiers.'
            );
            break;
          }
        } while (this.match('COMMA'));
      }
      this.consume('RPAREN', `Expected ')' after method parameters in '${methodName}'.`);
    } else if (this.check('IDENTIFIER') && !this.isSeparator(this.peek())) {
      // ruby style: def foo a, b
      do {
        if (this.check('IDENTIFIER')) {
          const paramToken = this.advance();
          parameters.push({
            id: this.generateId('param'),
            type: 'Identifier',
            name: paramToken.value,
            loc: this.tokenLocation(paramToken),
          });
        } else {
          break;
        }
      } while (this.match('COMMA'));
    }

    // Expect newline or semicolon after def header
    this.requireSeparator("Expected newline or semicolon after method definition header.");

    // Method Body
    const body: StatementNode[] = [];
    while (!this.check('END') && !this.isAtEnd()) {
      this.skipSeparators();
      if (this.check('END') || this.isAtEnd()) break;
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
      this.skipSeparators();
    }

    if (this.isAtEnd()) {
      this.reportError(
        `Expected 'end' to close method definition '${methodName}' starting at line ${defToken.line}, column ${defToken.column}.`,
        this.peek(),
        `Add 'end' to close the '${methodName}' method block.`
      );
      throw new Error('Parse error');
    }

    const endToken = this.consume('END', `Expected 'end' to close method definition '${methodName}'.`);
    const loc: SourceLocation = {
      start: startPos,
      end: this.tokenEnd(endToken),
    };

    return {
      id: this.generateId('method_def'),
      type: 'MethodDefinition',
      name: methodName,
      parameters,
      body,
      loc,
    };
  }

  private parseIfStatement(): IfStatementNode {
    const ifToken = this.previous();
    const startPos = this.tokenStart(ifToken);

    // Condition
    const condition = this.parseExpression();

    // Require newline or semicolon after condition
    this.requireSeparator("Expected newline after 'if' condition.");

    // Consequent statements
    const consequent: StatementNode[] = [];
    while (!this.check('ELSIF') && !this.check('ELSE') && !this.check('END') && !this.isAtEnd()) {
      this.skipSeparators();
      if (this.check('ELSIF') || this.check('ELSE') || this.check('END') || this.isAtEnd()) break;
      const stmt = this.parseStatement();
      if (stmt) {
        consequent.push(stmt);
      }
      this.skipSeparators();
    }

    // Optional Elsif branches
    const elsifBranches: ElsifBranchNode[] = [];
    while (this.match('ELSIF')) {
      const elsifToken = this.previous();
      const elsifStart = this.tokenStart(elsifToken);
      const elsifCond = this.parseExpression();
      this.requireSeparator("Expected newline after 'elsif' condition.");

      const elsifBody: StatementNode[] = [];
      while (!this.check('ELSIF') && !this.check('ELSE') && !this.check('END') && !this.isAtEnd()) {
        this.skipSeparators();
        if (this.check('ELSIF') || this.check('ELSE') || this.check('END') || this.isAtEnd()) break;
        const stmt = this.parseStatement();
        if (stmt) {
          elsifBody.push(stmt);
        }
        this.skipSeparators();
      }

      elsifBranches.push({
        id: this.generateId('elsif_branch'),
        type: 'ElsifBranch',
        condition: elsifCond,
        body: elsifBody,
        loc: {
          start: elsifStart,
          end: this.getPosition(),
        },
      });
    }

    // Optional Else branch
    let alternate: ElseBranchNode | undefined;
    if (this.match('ELSE')) {
      const elseToken = this.previous();
      const elseStart = this.tokenStart(elseToken);
      this.requireSeparator("Expected newline after 'else'.");

      const elseBody: StatementNode[] = [];
      while (!this.check('END') && !this.isAtEnd()) {
        this.skipSeparators();
        if (this.check('END') || this.isAtEnd()) break;
        const stmt = this.parseStatement();
        if (stmt) {
          elseBody.push(stmt);
        }
        this.skipSeparators();
      }

      alternate = {
        id: this.generateId('else_branch'),
        type: 'ElseBranch',
        body: elseBody,
        loc: {
          start: elseStart,
          end: this.getPosition(),
        },
      };
    }

    if (this.isAtEnd()) {
      this.reportError(
        `Expected 'end' to close the conditional block starting at line ${ifToken.line}, column ${ifToken.column}.`,
        this.peek(),
        "Add 'end' to terminate the 'if' statement."
      );
      throw new Error('Parse error');
    }

    const endToken = this.consume('END', "Expected 'end' to close conditional block.");
    const loc: SourceLocation = {
      start: startPos,
      end: this.tokenEnd(endToken),
    };

    return {
      id: this.generateId('if_stmt'),
      type: 'IfStatement',
      condition,
      consequent,
      elsifBranches,
      alternate,
      loc,
    };
  }

  private parseAssignment(): AssignmentNode {
    const identToken = this.advance();
    const identNode: IdentifierNode = {
      id: this.generateId('ident'),
      type: 'Identifier',
      name: identToken.value,
      loc: this.tokenLocation(identToken),
    };

    this.consume('EQUAL', "Expected '=' in assignment.");
    const valueExpr = this.parseExpression();

    const loc: SourceLocation = {
      start: this.tokenStart(identToken),
      end: valueExpr.loc.end,
    };

    return {
      id: this.generateId('assign'),
      type: 'Assignment',
      identifier: identNode,
      value: valueExpr,
      loc,
    };
  }

  private parsePutsStatement(): PutsStatementNode {
    const putsToken = this.previous();
    const startPos = this.tokenStart(putsToken);
    const args: ExpressionNode[] = [];

    // puts might have parens puts(...) or space puts ...
    if (this.match('LPAREN')) {
      if (!this.check('RPAREN')) {
        do {
          this.skipSeparators();
          args.push(this.parseExpression());
          this.skipSeparators();
        } while (this.match('COMMA'));
      }
      this.consume('RPAREN', "Expected ')' after puts arguments.");
    } else {
      // Read expressions until newline, semicolon, or EOF
      if (!this.isSeparator(this.peek()) && !this.isAtEnd()) {
        do {
          args.push(this.parseExpression());
        } while (this.match('COMMA'));
      }
    }

    const endPos = args.length > 0 ? args[args.length - 1].loc.end : this.tokenEnd(putsToken);

    return {
      id: this.generateId('puts_stmt'),
      type: 'PutsStatement',
      arguments: args,
      loc: { start: startPos, end: endPos },
    };
  }

  private parseExpressionStatement(): ExpressionStatementNode {
    const expr = this.parseExpression();
    return {
      id: this.generateId('expr_stmt'),
      type: 'ExpressionStatement',
      expression: expr,
      loc: expr.loc,
    };
  }

  // --- EXPRESSION PARSING (Operator Precedence) ---

  public parseExpression(): ExpressionNode {
    return this.parseComparison();
  }

  private parseComparison(): ExpressionNode {
    let expr = this.parseAdditive();

    while (
      this.match('EQUAL_EQUAL') ||
      this.match('BANG_EQUAL') ||
      this.match('LESS') ||
      this.match('LESS_EQUAL') ||
      this.match('GREATER') ||
      this.match('GREATER_EQUAL')
    ) {
      const opToken = this.previous();
      const operator = opToken.value as '==' | '!=' | '<' | '<=' | '>' | '>=';
      const right = this.parseAdditive();
      expr = {
        id: this.generateId('comp_expr'),
        type: 'ComparisonExpression',
        operator,
        left: expr,
        right,
        loc: {
          start: expr.loc.start,
          end: right.loc.end,
        },
      };
    }

    return expr;
  }

  private parseAdditive(): ExpressionNode {
    let expr = this.parseMultiplicative();

    while (this.match('PLUS') || this.match('MINUS')) {
      const opToken = this.previous();
      const operator = opToken.value as '+' | '-';
      const right = this.parseMultiplicative();
      expr = {
        id: this.generateId('bin_expr'),
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        loc: {
          start: expr.loc.start,
          end: right.loc.end,
        },
      };
    }

    return expr;
  }

  private parseMultiplicative(): ExpressionNode {
    let expr = this.parseUnary();

    while (this.match('STAR') || this.match('SLASH') || this.match('PERCENT')) {
      const opToken = this.previous();
      const operator = opToken.value as '*' | '/' | '%';
      const right = this.parseUnary();
      expr = {
        id: this.generateId('bin_expr'),
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        loc: {
          start: expr.loc.start,
          end: right.loc.end,
        },
      };
    }

    return expr;
  }

  private parseUnary(): ExpressionNode {
    if (this.match('MINUS') || this.match('PLUS')) {
      const opToken = this.previous();
      const operator = opToken.value as '+' | '-';
      const argument = this.parseUnary();
      return {
        id: this.generateId('unary_expr'),
        type: 'UnaryExpression',
        operator,
        argument,
        loc: {
          start: this.tokenStart(opToken),
          end: argument.loc.end,
        },
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionNode {
    const token = this.peek();

    // Integer or Float Literal
    if (this.match('INTEGER') || this.match('FLOAT')) {
      const numToken = this.previous();
      const isFloat = numToken.type === 'FLOAT';
      const value = isFloat ? parseFloat(numToken.value) : parseInt(numToken.value, 10);
      return {
        id: this.generateId('num_lit'),
        type: 'NumberLiteral',
        value,
        raw: numToken.value,
        isFloat,
        loc: this.tokenLocation(numToken),
      };
    }

    // String Literal
    if (this.match('STRING')) {
      const strToken = this.previous();
      return {
        id: this.generateId('str_lit'),
        type: 'StringLiteral',
        value: strToken.value,
        raw: strToken.value,
        loc: this.tokenLocation(strToken),
      };
    }

    // Boolean Literal
    if (this.match('TRUE')) {
      return {
        id: this.generateId('bool_lit'),
        type: 'BooleanLiteral',
        value: true,
        loc: this.tokenLocation(this.previous()),
      };
    }
    if (this.match('FALSE')) {
      return {
        id: this.generateId('bool_lit'),
        type: 'BooleanLiteral',
        value: false,
        loc: this.tokenLocation(this.previous()),
      };
    }

    // Nil Literal
    if (this.match('NIL')) {
      return {
        id: this.generateId('nil_lit'),
        type: 'NilLiteral',
        loc: this.tokenLocation(this.previous()),
      };
    }

    // Parenthesized expression: ( expr )
    if (this.match('LPAREN')) {
      const openToken = this.previous();
      const expr = this.parseExpression();
      if (!this.check('RPAREN')) {
        this.reportError(
          `Missing closing ')' for parenthesized expression starting at line ${openToken.line}, column ${openToken.column}.`,
          this.peek(),
          "Add ')' to close the expression."
        );
        throw new Error('Parse error');
      }
      const closeToken = this.consume('RPAREN', "Expected ')' after expression.");
      return {
        ...expr,
        loc: {
          start: this.tokenStart(openToken),
          end: this.tokenEnd(closeToken),
        },
      };
    }

    // Identifier or Method Call: foo or foo(...)
    if (this.match('IDENTIFIER')) {
      const identToken = this.previous();

      // Check if it's a method call: foo(...)
      if (this.match('LPAREN')) {
        const args: ExpressionNode[] = [];
        if (!this.check('RPAREN')) {
          do {
            this.skipSeparators();
            args.push(this.parseExpression());
            this.skipSeparators();
          } while (this.match('COMMA'));
        }
        const closeToken = this.consume('RPAREN', `Expected ')' after argument list in call to '${identToken.value}'.`);
        return {
          id: this.generateId('method_call'),
          type: 'MethodCall',
          callee: identToken.value,
          arguments: args,
          loc: {
            start: this.tokenStart(identToken),
            end: this.tokenEnd(closeToken),
          },
        };
      }

      // Plain Identifier / variable reference
      return {
        id: this.generateId('ident'),
        type: 'Identifier',
        name: identToken.value,
        loc: this.tokenLocation(identToken),
      };
    }

    // Lexer Error Token passed through
    if (this.check('ERROR')) {
      const errToken = this.advance();
      this.reportError(
        errToken.errorMessage || `Syntax error at '${errToken.value}' (line ${errToken.line}, col ${errToken.column}).`,
        errToken
      );
      throw new Error('Parse error');
    }

    // If unexpected token
    const unexpectedToken = this.peek();
    const message = unexpectedToken.type === 'EOF'
      ? `Unexpected end of file. Expected an expression at line ${unexpectedToken.line}, column ${unexpectedToken.column}.`
      : `Unexpected token '${unexpectedToken.value}' at line ${unexpectedToken.line}, column ${unexpectedToken.column}.`;

    this.reportError(
      message,
      unexpectedToken,
      `Check syntax around line ${unexpectedToken.line}. Make sure expressions have valid operands and matching delimiters.`
    );
    throw new Error('Parse error');
  }

  // --- HELPER METHODS ---

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return type === 'EOF';
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private peek(): Token {
    return this.tokens[this.current] || {
      type: 'EOF',
      value: '',
      line: 1,
      column: 1,
      startOffset: 0,
      endOffset: 0,
    };
  }

  private peekNext(): Token {
    if (this.current + 1 >= this.tokens.length) {
      return {
        type: 'EOF',
        value: '',
        line: 1,
        column: 1,
        startOffset: 0,
        endOffset: 0,
      };
    }
    return this.tokens[this.current + 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, errorMessage: string): Token {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    this.reportError(
      `${errorMessage} (found '${token.value || token.type}' at line ${token.line}, column ${token.column})`,
      token
    );
    throw new Error('Parse error');
  }

  private requireSeparator(errorMessage: string): void {
    if (this.check('NEWLINE') || this.check('SEMICOLON')) {
      this.skipSeparators();
      return;
    }
    if (this.check('EOF') || this.check('END') || this.check('ELSE') || this.check('ELSIF')) {
      return;
    }
    const token = this.peek();
    this.reportError(
      `${errorMessage} (found '${token.value}' at line ${token.line}, column ${token.column})`,
      token,
      "Ensure statements or block definitions are on separate lines or separated by semicolons ';'."
    );
    throw new Error('Parse error');
  }

  private skipSeparators(): void {
    while (!this.isAtEnd() && (this.peek().type === 'NEWLINE' || this.peek().type === 'SEMICOLON')) {
      this.advance();
    }
  }

  private isSeparator(token: Token): boolean {
    return token.type === 'NEWLINE' || token.type === 'SEMICOLON' || token.type === 'EOF';
  }

  private synchronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type === 'NEWLINE' || this.previous().type === 'SEMICOLON') return;
      switch (this.peek().type) {
        case 'DEF':
        case 'IF':
        case 'PUTS':
        case 'END':
        case 'ELSE':
        case 'ELSIF':
          return;
      }
      this.advance();
    }
  }

  private reportError(message: string, token: Token, suggestion?: string): void {
    // Avoid duplicate error on same location
    const alreadyExists = this.errors.some(
      (e) => e.line === token.line && e.column === token.column && e.message === message
    );
    if (alreadyExists) return;

    this.errors.push({
      message,
      line: token.line,
      column: token.column,
      startOffset: token.startOffset,
      endOffset: token.endOffset,
      suggestion,
      token,
    });
  }

  private tokenLocation(token: Token): SourceLocation {
    return {
      start: this.tokenStart(token),
      end: this.tokenEnd(token),
    };
  }

  private tokenStart(token: Token): SourcePosition {
    return {
      line: token.line,
      column: token.column,
      offset: token.startOffset,
    };
  }

  private tokenEnd(token: Token): SourcePosition {
    return {
      line: token.line,
      column: token.column + token.value.length,
      offset: token.endOffset,
    };
  }

  private getPosition(): SourcePosition {
    const t = this.peek();
    return {
      line: t.line,
      column: t.column,
      offset: t.startOffset,
    };
  }
}
