import { describe, it, expect } from 'vitest';
import { Lexer } from '../parser/lexer';
import { Parser } from '../parser/parser';
import { SemanticAnalyzer } from '../parser/semanticAnalyzer';

describe('SemanticAnalyzer', () => {
  it('flags undefined variables', () => {
    const tokens = new Lexer('result = missing + 1').tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const undef = diagnostics.find((d) => d.severity === 'error' && d.identifier === 'missing');
    expect(undef).toBeDefined();
    expect(undef?.message).toContain("Undefined variable 'missing'");
  });

  it('validates method parameters inside method body without flagging as undefined', () => {
    const code = `def add(a, b)
  a + b
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const undefErrors = diagnostics.filter((d) => d.severity === 'error' && d.message.includes('Undefined'));
    expect(undefErrors).toHaveLength(0);
  });

  it('flags duplicate parameter names in method definition', () => {
    const code = `def foo(x, x)\n  x\nend`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const dup = diagnostics.find((d) => d.severity === 'error' && d.message.includes('Duplicate parameter'));
    expect(dup).toBeDefined();
  });

  it('flags static division by literal zero', () => {
    const tokens = new Lexer('num = 5 / 0').tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const divZero = diagnostics.find((d) => d.severity === 'error' && d.message.includes('division by literal zero'));
    expect(divZero).toBeDefined();
  });
});
