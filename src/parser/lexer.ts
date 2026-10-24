import { Token, TokenType, KEYWORDS } from './tokenTypes';

export interface LexerError {
  message: string;
  line: number;
  column: number;
  startOffset: number;
  endOffset: number;
}

export interface LexerResult {
  tokens: Token[];
  errors: LexerError[];
}

export class Lexer {
  private source: string;
  private length: number;
  private cursor: number = 0;
  private line: number = 1;
  private column: number = 1;
  private errors: LexerError[] = [];
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
    this.length = source.length;
  }

  public tokenize(): LexerResult {
    this.cursor = 0;
    this.line = 1;
    this.column = 1;
    this.errors = [];
    this.tokens = [];

    while (!this.isAtEnd()) {
      const char = this.peek();

      // Skip whitespace except newlines
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
        continue;
      }

      // Handle newlines
      if (char === '\n') {
        const startOffset = this.cursor;
        const line = this.line;
        const col = this.column;
        this.advance();
        this.tokens.push({
          type: 'NEWLINE',
          value: '\\n',
          line,
          column: col,
          startOffset,
          endOffset: this.cursor,
        });
        continue;
      }

      // Comments (# up to end of line)
      if (char === '#') {
        this.scanComment();
        continue;
      }

      // Semicolon
      if (char === ';') {
        const startOffset = this.cursor;
        const line = this.line;
        const col = this.column;
        this.advance();
        this.tokens.push({
          type: 'SEMICOLON',
          value: ';',
          line,
          column: col,
          startOffset,
          endOffset: this.cursor,
        });
        continue;
      }

      // Parentheses & Punctuation
      if (char === '(') {
        this.addSingleCharToken('LPAREN', '(');
        continue;
      }
      if (char === ')') {
        this.addSingleCharToken('RPAREN', ')');
        continue;
      }
      if (char === ',') {
        this.addSingleCharToken('COMMA', ',');
        continue;
      }

      // Operators: ==, !=, <=, >=, =, <, >, +, -, *, /, %
      if (char === '=') {
        const startOffset = this.cursor;
        const line = this.line;
        const col = this.column;
        this.advance();
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push({
            type: 'EQUAL_EQUAL',
            value: '==',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          });
        } else {
          this.tokens.push({
            type: 'EQUAL',
            value: '=',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          });
        }
        continue;
      }

      if (char === '!') {
        const startOffset = this.cursor;
        const line = this.line;
        const col = this.column;
        this.advance();
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push({
            type: 'BANG_EQUAL',
            value: '!=',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          });
        } else {
          const err: LexerError = {
            message: `Unexpected character '!' at line ${line}, column ${col}. Did you mean '!='?`,
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          };
          this.errors.push(err);
          this.tokens.push({
            type: 'ERROR',
            value: '!',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
            errorMessage: err.message,
          });
        }
        continue;
      }

      if (char === '<') {
        const startOffset = this.cursor;
        const line = this.line;
        const col = this.column;
        this.advance();
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push({
            type: 'LESS_EQUAL',
            value: '<=',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          });
        } else {
          this.tokens.push({
            type: 'LESS',
            value: '<',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          });
        }
        continue;
      }

      if (char === '>') {
        const startOffset = this.cursor;
        const line = this.line;
        const col = this.column;
        this.advance();
        if (this.peek() === '=') {
          this.advance();
          this.tokens.push({
            type: 'GREATER_EQUAL',
            value: '>=',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          });
        } else {
          this.tokens.push({
            type: 'GREATER',
            value: '>',
            line,
            column: col,
            startOffset,
            endOffset: this.cursor,
          });
        }
        continue;
      }

      if (char === '+') {
        this.addSingleCharToken('PLUS', '+');
        continue;
      }
      if (char === '-') {
        this.addSingleCharToken('MINUS', '-');
        continue;
      }
      if (char === '*') {
        this.addSingleCharToken('STAR', '*');
        continue;
      }
      if (char === '/') {
        this.addSingleCharToken('SLASH', '/');
        continue;
      }
      if (char === '%') {
        this.addSingleCharToken('PERCENT', '%');
        continue;
      }

      // Strings ('...' or "...")
      if (char === '"' || char === "'") {
        this.scanString(char);
        continue;
      }

      // Numbers (integers and floats)
      if (this.isDigit(char)) {
        this.scanNumber();
        continue;
      }

      // Identifiers and Keywords
      if (this.isAlpha(char) || char === '_') {
        this.scanIdentifier();
        continue;
      }

      // Unrecognized character
      const startOffset = this.cursor;
      const line = this.line;
      const col = this.column;
      const unknownChar = this.advance();
      const err: LexerError = {
        message: `Unexpected character '${unknownChar}' at line ${line}, column ${col}.`,
        line,
        column: col,
        startOffset,
        endOffset: this.cursor,
      };
      this.errors.push(err);
      this.tokens.push({
        type: 'ERROR',
        value: unknownChar,
        line,
        column: col,
        startOffset,
        endOffset: this.cursor,
        errorMessage: err.message,
      });
    }

    // Append EOF token
    this.tokens.push({
      type: 'EOF',
      value: '',
      line: this.line,
      column: this.column,
      startOffset: this.cursor,
      endOffset: this.cursor,
    });

    return {
      tokens: this.tokens,
      errors: this.errors,
    };
  }

  private scanComment(): void {
    const startOffset = this.cursor;
    const line = this.line;
    const col = this.column;
    let value = '';

    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance();
    }

    this.tokens.push({
      type: 'COMMENT',
      value,
      line,
      column: col,
      startOffset,
      endOffset: this.cursor,
    });
  }

  private scanString(quoteChar: string): void {
    const startOffset = this.cursor;
    const line = this.line;
    const col = this.column;
    this.advance(); // consume opening quote

    let strValue = '';
    let isTerminated = false;

    while (!this.isAtEnd()) {
      const c = this.peek();
      if (c === '\n') {
        // Unterminated multiline string in standard single/double quote
        break;
      }
      if (c === '\\') {
        this.advance(); // consume backslash
        if (this.isAtEnd()) break;
        const next = this.advance();
        switch (next) {
          case 'n': strValue += '\n'; break;
          case 't': strValue += '\t'; break;
          case 'r': strValue += '\r'; break;
          case '\\': strValue += '\\'; break;
          case '"': strValue += '"'; break;
          case "'": strValue += "'"; break;
          default: strValue += '\\' + next; break;
        }
        continue;
      }
      if (c === quoteChar) {
        this.advance(); // consume closing quote
        isTerminated = true;
        break;
      }
      strValue += this.advance();
    }

    if (!isTerminated) {
      const err: LexerError = {
        message: `Unterminated string literal starting at line ${line}, column ${col}. Expected closing ${quoteChar}.`,
        line,
        column: col,
        startOffset,
        endOffset: this.cursor,
      };
      this.errors.push(err);
      this.tokens.push({
        type: 'ERROR',
        value: this.source.slice(startOffset, this.cursor),
        line,
        column: col,
        startOffset,
        endOffset: this.cursor,
        errorMessage: err.message,
      });
      return;
    }

    this.tokens.push({
      type: 'STRING',
      value: strValue,
      line,
      column: col,
      startOffset,
      endOffset: this.cursor,
    });
  }

  private scanNumber(): void {
    const startOffset = this.cursor;
    const line = this.line;
    const col = this.column;
    let isFloat = false;

    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      this.advance();
    }

    // Check for fractional part
    if (!this.isAtEnd() && this.peek() === '.' && this.isDigit(this.peekNext())) {
      isFloat = true;
      this.advance(); // consume '.'
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const lexeme = this.source.slice(startOffset, this.cursor);
    this.tokens.push({
      type: isFloat ? 'FLOAT' : 'INTEGER',
      value: lexeme,
      line,
      column: col,
      startOffset,
      endOffset: this.cursor,
    });
  }

  private scanIdentifier(): void {
    const startOffset = this.cursor;
    const line = this.line;
    const col = this.column;

    while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_')) {
      this.advance();
    }

    // Ruby identifiers can sometimes end with ? or ! for method calls (e.g. valid?, save!)
    if (!this.isAtEnd() && (this.peek() === '?' || this.peek() === '!')) {
      this.advance();
    }

    const lexeme = this.source.slice(startOffset, this.cursor);
    const keywordType = KEYWORDS[lexeme];

    if (keywordType) {
      this.tokens.push({
        type: keywordType,
        value: lexeme,
        line,
        column: col,
        startOffset,
        endOffset: this.cursor,
      });
    } else {
      this.tokens.push({
        type: 'IDENTIFIER',
        value: lexeme,
        line,
        column: col,
        startOffset,
        endOffset: this.cursor,
      });
    }
  }

  private addSingleCharToken(type: TokenType, value: string): void {
    const startOffset = this.cursor;
    const line = this.line;
    const col = this.column;
    this.advance();
    this.tokens.push({
      type,
      value,
      line,
      column: col,
      startOffset,
      endOffset: this.cursor,
    });
  }

  private advance(): string {
    const c = this.source[this.cursor];
    this.cursor++;
    if (c === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return c;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.cursor];
  }

  private peekNext(): string {
    if (this.cursor + 1 >= this.length) return '\0';
    return this.source[this.cursor + 1];
  }

  private isAtEnd(): boolean {
    return this.cursor >= this.length;
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
