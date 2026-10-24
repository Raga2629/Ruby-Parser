import { describe, it, expect } from 'vitest';
import { Lexer } from '../parser/lexer';
import { Parser } from '../parser/parser';

describe('Parser', () => {
  it('parses correct operator precedence for a + b * 2', () => {
    const tokens = new Lexer('result = a + b * 2').tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    expect(errors).toHaveLength(0);
    expect(ast).not.toBeNull();
    const stmt = ast!.body[0] as any;
    expect(stmt.type).toBe('Assignment');
    expect(stmt.value.type).toBe('BinaryExpression');
    expect(stmt.value.operator).toBe('+');
    expect(stmt.value.right.operator).toBe('*');
  });

  it('parses parenthesized expressions', () => {
    const tokens = new Lexer('result = (2 + 3) * 4').tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    expect(errors).toHaveLength(0);
    const stmt = ast!.body[0] as any;
    expect(stmt.value.operator).toBe('*');
    expect(stmt.value.left.operator).toBe('+');
  });

  it('reports missing end keyword for unclosed if statement', () => {
    const tokens = new Lexer('if x > 1\n  puts x').tokenize().tokens;
    const parser = new Parser(tokens);
    const { errors } = parser.parse();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain("Expected 'end'");
  });

  it('parses method definition with parameters and body', () => {
    const code = `def calculate(a, b)
  a + b
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    expect(errors).toHaveLength(0);
    const method = ast!.body[0] as any;
    expect(method.type).toBe('MethodDefinition');
    expect(method.name).toBe('calculate');
    expect(method.parameters).toHaveLength(2);
  });
});
