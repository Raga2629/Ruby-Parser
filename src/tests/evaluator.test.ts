import { describe, it, expect } from 'vitest';
import { Lexer } from '../parser/lexer';
import { Parser } from '../parser/parser';
import { SafeEvaluator } from '../parser/evaluator';

describe('SafeEvaluator', () => {
  it('evaluates arithmetic and records stdout for puts statement', () => {
    const code = `x = 10
y = 20
puts x + y`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const evaluator = new SafeEvaluator();
    const result = evaluator.evaluate(ast!);

    expect(result.stdout).toEqual(['30']);
    expect(result.finalVariables['x']).toBe(10);
    expect(result.finalVariables['y']).toBe(20);
    expect(result.error).toBeUndefined();
  });

  it('evaluates conditionals correctly', () => {
    const code = `score = 15
if score > 10
  puts "greater"
else
  puts "lesser"
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const evaluator = new SafeEvaluator();
    const result = evaluator.evaluate(ast!);

    expect(result.stdout).toEqual(['greater']);
  });

  it('defines and invokes custom method', () => {
    const code = `def square(n)
  n * n
end
val = square(5)
puts val`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const evaluator = new SafeEvaluator();
    const result = evaluator.evaluate(ast!);

    expect(result.stdout).toEqual(['25']);
    expect(result.finalVariables['val']).toBe(25);
  });

  it('handles division by zero runtime error safely', () => {
    const code = `a = 10
b = 0
puts a / b`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const evaluator = new SafeEvaluator();
    const result = evaluator.evaluate(ast!);

    expect(result.error).toContain('ZeroDivisionError');
  });
});
