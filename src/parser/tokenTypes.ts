export type TokenType =
  // Keywords
  | 'DEF'
  | 'END'
  | 'IF'
  | 'ELSE'
  | 'ELSIF'
  | 'TRUE'
  | 'FALSE'
  | 'NIL'
  // Built-in functions
  | 'PUTS'
  // Identifiers & Literals
  | 'IDENTIFIER'
  | 'INTEGER'
  | 'FLOAT'
  | 'STRING'
  // Operators
  | 'PLUS'          // +
  | 'MINUS'         // -
  | 'STAR'          // *
  | 'SLASH'         // /
  | 'PERCENT'       // %
  | 'EQUAL'         // =
  | 'EQUAL_EQUAL'   // ==
  | 'BANG_EQUAL'    // !=
  | 'LESS'          // <
  | 'LESS_EQUAL'    // <=
  | 'GREATER'       // >
  | 'GREATER_EQUAL' // >=
  // Delimiters & Punctuation
  | 'LPAREN'        // (
  | 'RPAREN'        // )
  | 'COMMA'         // ,
  | 'NEWLINE'       // \n
  | 'SEMICOLON'     // ;
  | 'COMMENT'       // # comment
  // Special
  | 'EOF'
  | 'ERROR';

export interface SourcePosition {
  line: number;
  column: number;
  offset: number;
}

export interface SourceLocation {
  start: SourcePosition;
  end: SourcePosition;
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  startOffset: number;
  endOffset: number;
  errorMessage?: string;
}

export const KEYWORDS: Record<string, TokenType> = {
  def: 'DEF',
  end: 'END',
  if: 'IF',
  else: 'ELSE',
  elsif: 'ELSIF',
  true: 'TRUE',
  false: 'FALSE',
  nil: 'NIL',
  puts: 'PUTS',
};
