import { describe, it, expect } from 'vitest';
import { Lexer } from '../parser/lexer';

describe('Lexer', () => {
  it('tokenizes keywords and identifiers', () => {
    const lexer = new Lexer('def add(a, b) end');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);
    expect(tokens.map((t) => t.type)).toEqual([
      'DEF',
      'IDENTIFIER',
      'LPAREN',
      'IDENTIFIER',
      'COMMA',
      'IDENTIFIER',
      'RPAREN',
      'END',
      'EOF',
    ]);
  });

  it('tokenizes string and number literals', () => {
    const lexer = new Lexer('val = 123.45 + "test"');
    const { tokens, errors } = lexer.tokenize();
    expect(errors).toHaveLength(0);
    expect(tokens[2].type).toBe('FLOAT');
    expect(tokens[2].value).toBe('123.45');
    expect(tokens[4].type).toBe('STRING');
    expect(tokens[4].value).toBe('test');
  });

  it('catches unterminated strings', () => {
    const lexer = new Lexer('"unclosed string');
    const { errors } = lexer.tokenize();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Unterminated string literal');
  });

  it('handles comments correctly', () => {
    const lexer = new Lexer('x = 10 # assign ten\ny = 20');
    const { tokens } = lexer.tokenize();
    const commentToken = tokens.find((t) => t.type === 'COMMENT');
    expect(commentToken).toBeDefined();
    expect(commentToken?.value).toBe('# assign ten');
  });
});
