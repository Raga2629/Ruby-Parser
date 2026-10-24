import { Lexer } from '../parser/lexer';
import { Parser } from '../parser/parser';
import { SemanticAnalyzer } from '../parser/semanticAnalyzer';
import { SafeEvaluator } from '../parser/evaluator';

export interface TestCaseResult {
  id: string;
  category: 'Lexer' | 'Parser' | 'Semantic' | 'Evaluator';
  name: string;
  description: string;
  passed: boolean;
  durationMs: number;
  assertionCount: number;
  error?: string;
  details?: {
    expected: string;
    actual: string;
  };
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestCaseResult[];
}

export function runInBrowserTestSuite(): TestSuiteSummary {
  const startTime = performance.now();
  const results: TestCaseResult[] = [];

  function test(
    category: TestCaseResult['category'],
    name: string,
    description: string,
    fn: (assert: (cond: boolean, msg: string, exp?: any, act?: any) => void) => void
  ) {
    const tStart = performance.now();
    let assertionCount = 0;
    let failedError: string | undefined;
    let details: { expected: string; actual: string } | undefined;

    const assert = (cond: boolean, msg: string, exp?: any, act?: any) => {
      assertionCount++;
      if (!cond) {
        const err = `Assertion failed: ${msg}`;
        if (exp !== undefined || act !== undefined) {
          details = {
            expected: JSON.stringify(exp ?? 'truthy'),
            actual: JSON.stringify(act ?? 'falsy'),
          };
        }
        throw new Error(err);
      }
    };

    try {
      fn(assert);
      results.push({
        id: `test_${results.length + 1}`,
        category,
        name,
        description,
        passed: true,
        durationMs: Math.round((performance.now() - tStart) * 100) / 100,
        assertionCount,
      });
    } catch (e: any) {
      results.push({
        id: `test_${results.length + 1}`,
        category,
        name,
        description,
        passed: false,
        durationMs: Math.round((performance.now() - tStart) * 100) / 100,
        assertionCount,
        error: e.message || String(e),
        details,
      });
    }
  }

  // --- 1. LEXER TESTS ---
  test('Lexer', 'Tokenize Keywords and Built-in', 'Should tokenize def, end, if, else, elsif, true, false, nil, and puts', (assert) => {
    const code = 'def end if else elsif true false nil puts';
    const lexer = new Lexer(code);
    const { tokens, errors } = lexer.tokenize();
    assert(errors.length === 0, 'No lexer errors for valid keywords', 0, errors.length);
    const types = tokens.filter((t) => t.type !== 'EOF').map((t) => t.type);
    assert(
      JSON.stringify(types) ===
        JSON.stringify(['DEF', 'END', 'IF', 'ELSE', 'ELSIF', 'TRUE', 'FALSE', 'NIL', 'PUTS']),
      'Keywords matched expected token types',
      ['DEF', 'END', 'IF', 'ELSE', 'ELSIF', 'TRUE', 'FALSE', 'NIL', 'PUTS'],
      types
    );
  });

  test('Lexer', 'Tokenize Numeric and String Literals', 'Should tokenize integers, floats, and strings with escape chars', (assert) => {
    const code = '42 3.14 "hello world" \'single quote\'';
    const lexer = new Lexer(code);
    const { tokens, errors } = lexer.tokenize();
    assert(errors.length === 0, 'No lexer errors for valid literals', 0, errors.length);
    assert(tokens[0].type === 'INTEGER' && tokens[0].value === '42', 'Parsed integer 42');
    assert(tokens[1].type === 'FLOAT' && tokens[1].value === '3.14', 'Parsed float 3.14');
    assert(tokens[2].type === 'STRING' && tokens[2].value === 'hello world', 'Parsed double-quoted string');
    assert(tokens[3].type === 'STRING' && tokens[3].value === 'single quote', 'Parsed single-quoted string');
  });

  test('Lexer', 'Detect Unterminated String Error', 'Should report informative error for unclosed string literal', (assert) => {
    const code = '"unterminated string';
    const lexer = new Lexer(code);
    const { errors } = lexer.tokenize();
    assert(errors.length > 0, 'Lexer reported unterminated string error', '>0', errors.length);
    assert(errors[0].message.includes('Unterminated string literal'), 'Error message identifies unterminated string');
  });

  test('Lexer', 'Detect Invalid Characters', 'Should flag unrecognized character tokens', (assert) => {
    const code = 'x = @value ^ 2';
    const lexer = new Lexer(code);
    const { errors, tokens } = lexer.tokenize();
    assert(errors.length >= 2, 'Lexer reported unknown characters @ and ^', '>=2', errors.length);
    const errTokens = tokens.filter((t) => t.type === 'ERROR');
    assert(errTokens.length >= 2, 'Error tokens created');
  });

  test('Lexer', 'Empty Input Handling', 'Should gracefully produce only EOF token for empty source', (assert) => {
    const lexer = new Lexer('');
    const { tokens, errors } = lexer.tokenize();
    assert(errors.length === 0, 'No errors on empty source');
    assert(tokens.length === 1 && tokens[0].type === 'EOF', 'Contains single EOF token');
  });

  // --- 2. PARSER TESTS ---
  test('Parser', 'Expression Precedence (a + b * 2)', 'Multiplication must bind tighter than addition', (assert) => {
    const tokens = new Lexer('result = a + b * 2').tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    assert(errors.length === 0, 'No parse errors', 0, errors.length);
    assert(ast !== null, 'AST generated');
    const assign = ast!.body[0] as any;
    assert(assign.type === 'Assignment', 'Root statement is Assignment');
    assert(assign.value.type === 'BinaryExpression', 'Value is BinaryExpression');
    assert(assign.value.operator === '+', 'Top operator is +');
    assert(assign.value.right.type === 'BinaryExpression', 'Right child is BinaryExpression');
    assert(assign.value.right.operator === '*', 'Right operator is *');
  });

  test('Parser', 'Parenthesized Precedence Override', '(2 + 3) * (4 + 1) parses multiplication at root', (assert) => {
    const tokens = new Lexer('(2 + 3) * (4 + 1)').tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    assert(errors.length === 0, 'No parse errors');
    const exprStmt = ast!.body[0] as any;
    const bin = exprStmt.expression;
    assert(bin.type === 'BinaryExpression' && bin.operator === '*', 'Root is multiplication');
    assert(bin.left.operator === '+' && bin.right.operator === '+', 'Both operands are additions');
  });

  test('Parser', 'Method Definition and Parameter List', 'Parses def add(a, b) with parameter identifiers', (assert) => {
    const code = `def add(a, b)
  a + b
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    assert(errors.length === 0, 'No parse errors');
    const method = ast!.body[0] as any;
    assert(method.type === 'MethodDefinition', 'Is MethodDefinition node');
    assert(method.name === 'add', 'Method name is add');
    assert(method.parameters.length === 2, 'Has 2 parameters');
    assert(method.parameters[0].name === 'a' && method.parameters[1].name === 'b', 'Parameter names are a and b');
    assert(method.body.length === 1, 'Body has 1 statement');
  });

  test('Parser', 'Nested Conditional Statements (if / elsif / else / end)', 'Parses complete conditional structure', (assert) => {
    const code = `if score > 90
  puts "A"
elsif score > 80
  puts "B"
else
  puts "C"
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    assert(errors.length === 0, 'No parse errors');
    const ifNode = ast!.body[0] as any;
    assert(ifNode.type === 'IfStatement', 'Is IfStatement node');
    assert(ifNode.elsifBranches.length === 1, 'Has 1 elsif branch');
    assert(ifNode.alternate !== undefined, 'Has else branch');
  });

  test('Parser', 'Missing end Keyword Detection', 'Should report expected end keyword on unclosed block', (assert) => {
    const code = `if score > 10
  puts score`;
    const tokens = new Lexer(code).tokenize().tokens;
    const parser = new Parser(tokens);
    const { errors } = parser.parse();
    assert(errors.length > 0, 'Parser reported missing end error', '>0', errors.length);
    assert(errors[0].message.includes("Expected 'end'"), 'Error message mentions missing end keyword');
  });

  test('Parser', 'Dangling Operator Error', 'Should detect missing operand after + operator', (assert) => {
    const tokens = new Lexer('result = 10 +').tokenize().tokens;
    const parser = new Parser(tokens);
    const { errors } = parser.parse();
    assert(errors.length > 0, 'Parser reported dangling operator error', '>0', errors.length);
  });

  test('Parser', 'Multiple Top-Level Statements', 'Parses multiple assignments and outputs in sequence', (assert) => {
    const code = `x = 5
y = 10
puts x + y`;
    const tokens = new Lexer(code).tokenize().tokens;
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();
    assert(errors.length === 0, 'No parse errors');
    assert(ast!.body.length === 3, 'Contains 3 top-level statements');
  });

  // --- 3. SEMANTIC ANALYZER TESTS ---
  test('Semantic', 'Detect Undefined Variable Reference', 'Flags unassigned identifier on RHS', (assert) => {
    const tokens = new Lexer('result = missing_value + 1').tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const err = diagnostics.find((d) => d.severity === 'error' && d.identifier === 'missing_value');
    assert(err !== undefined, 'Flagged missing_value as undefined variable error');
  });

  test('Semantic', 'Do Not Flag Valid Method Parameters as Undefined', 'Method parameters must be valid in method scope', (assert) => {
    const code = `def add(a, b)
  result = a + b
  result
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const undefinedErrors = diagnostics.filter((d) => d.severity === 'error' && d.message.includes('Undefined'));
    assert(undefinedErrors.length === 0, 'No undefined variable errors for valid parameters a, b and local result', 0, undefinedErrors.length);
  });

  test('Semantic', 'Detect Duplicate Method Parameter Names', 'def foo(a, a) must produce semantic error', (assert) => {
    const code = `def foo(a, a)
  a
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const dupErr = diagnostics.find((d) => d.severity === 'error' && d.message.includes('Duplicate parameter'));
    assert(dupErr !== undefined, 'Detected duplicate parameter name error');
  });

  test('Semantic', 'Detect Division by Literal Zero', 'Flags static division by zero', (assert) => {
    const code = 'x = 10 / 0';
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const analyzer = new SemanticAnalyzer();
    const { diagnostics } = analyzer.analyze(ast!);
    const divErr = diagnostics.find((d) => d.severity === 'error' && d.message.includes('division by literal zero'));
    assert(divErr !== undefined, 'Reported static division by literal zero');
  });

  // --- 4. EVALUATOR TESTS ---
  test('Evaluator', 'Arithmetic and Puts Execution', 'Evaluates expressions and captures stdout', (assert) => {
    const code = `x = 5
y = 7
puts x + y`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const evaluator = new SafeEvaluator();
    const result = evaluator.evaluate(ast!);
    assert(result.stdout.length === 1, 'Captured 1 stdout line');
    assert(result.stdout[0] === '12', 'Output is 12', '12', result.stdout[0]);
    assert(result.finalVariables['x'] === 5, 'Variable x is 5');
    assert(result.finalVariables['y'] === 7, 'Variable y is 7');
  });

  test('Evaluator', 'Conditional Branching Evaluation', 'Executes correct if-branch based on condition', (assert) => {
    const code = `score = 15
if score > 10
  puts "passed"
else
  puts "failed"
end`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const evaluator = new SafeEvaluator();
    const result = evaluator.evaluate(ast!);
    assert(result.stdout.length === 1 && result.stdout[0] === 'passed', 'Took the passed branch');
  });

  test('Evaluator', 'User Method Definition and Invocation', 'Invokes defined method with parameter bindings', (assert) => {
    const code = `def multiply(a, b)
  a * b
end
ans = multiply(6, 7)
puts ans`;
    const tokens = new Lexer(code).tokenize().tokens;
    const { ast } = new Parser(tokens).parse();
    const evaluator = new SafeEvaluator();
    const result = evaluator.evaluate(ast!);
    assert(result.stdout.length === 1 && result.stdout[0] === '42', 'Evaluated multiply(6, 7) to 42');
  });

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    durationMs,
    results,
  };
}
