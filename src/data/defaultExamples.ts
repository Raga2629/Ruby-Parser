export interface ExampleProgram {
  id: string;
  title: string;
  category: 'valid' | 'syntax_error' | 'semantic_error';
  description: string;
  code: string;
  expectedBehavior: string;
  expectedOutput?: string;
  expectedStage: 'success' | 'lexer_error' | 'parser_error' | 'semantic_error';
}

export const DEFAULT_PROGRAM = `def add(a, b)
  result = a + b

  if result > 10
    puts result
  else
    puts 10
  end
end`;

export const EXAMPLES: ExampleProgram[] = [
  {
    id: 'default-method-and-flow',
    title: 'Method Definition & Control Flow',
    category: 'valid',
    description: 'The standard project showcase: a method with parameters, local assignment, arithmetic, and conditional puts branch.',
    code: DEFAULT_PROGRAM,
    expectedBehavior: 'Lexes keywords and identifiers, constructs MethodDefinition with ParameterList, Assignment, and IfStatement AST branches. Semantics confirm variables result and parameters a, b are correctly scoped.',
    expectedOutput: 'AST generated with MethodDefinition node "add". Note: method is registered; call add(a, b) to invoke.',
    expectedStage: 'success',
  },
  {
    id: 'hello-world',
    title: '1. Hello World',
    category: 'valid',
    description: 'Basic invocation of the puts statement with a string literal.',
    code: `puts "Hello, World!"`,
    expectedBehavior: 'Lexes PUTS keyword and STRING literal. Parses into PutsStatement node. Evaluator outputs "Hello, World!".',
    expectedOutput: 'Hello, World!',
    expectedStage: 'success',
  },
  {
    id: 'arithmetic-expressions',
    title: '2. Arithmetic Expressions & Precedence',
    category: 'valid',
    description: 'Demonstrates operator precedence where multiplication (* 2) binds tighter than addition (+).',
    code: `a = 10
b = 5
result = a + b * 2
puts result`,
    expectedBehavior: 'AST parses a + (b * 2) showing BinaryExpression(*) nested under BinaryExpression(+). Evaluator outputs 20 (10 + 10).',
    expectedOutput: '20',
    expectedStage: 'success',
  },
  {
    id: 'conditional-statements',
    title: '3. Conditional Statements',
    category: 'valid',
    description: 'Comparison operator in an if/else/end branching block.',
    code: `score = 15

if score > 10
  puts score
else
  puts 10
end`,
    expectedBehavior: 'Parses IfStatement with condition ComparisonExpression(score > 10), consequent branch puts score, and else branch. Evaluates to true, printing 15.',
    expectedOutput: '15',
    expectedStage: 'success',
  },
  {
    id: 'method-definition',
    title: '4. Method Definition',
    category: 'valid',
    description: 'Clean method definition with formal parameters returning an arithmetic sum.',
    code: `def add(a, b)
  a + b
end`,
    expectedBehavior: 'Creates MethodDefinition AST with name "add", parameters [a, b], and body containing BinaryExpression(a + b). Semantic analysis confirms valid local parameter scope.',
    expectedOutput: 'Method "add" registered in symbol table.',
    expectedStage: 'success',
  },
  {
    id: 'nested-expressions',
    title: '5. Nested Parenthesized Expressions',
    category: 'valid',
    description: 'Parentheses override default operator precedence.',
    code: `result = (2 + 3) * (4 + 1)
puts result`,
    expectedBehavior: 'AST places both parenthesized additions as children of the root multiplication node. Evaluator calculates 5 * 5 = 25.',
    expectedOutput: '25',
    expectedStage: 'success',
  },
  {
    id: 'missing-end',
    title: '6. Missing end Keyword (Syntax Error)',
    category: 'syntax_error',
    description: 'Demonstrates parser error reporting when an unclosed if statement is encountered before EOF.',
    code: `if score > 10
  puts score`,
    expectedBehavior: 'Parser detects unexpected EOF and pinpoints the missing "end" keyword with line, column, and corrective hint.',
    expectedOutput: 'Parser Error: Expected \'end\' to close the conditional block starting at line 1.',
    expectedStage: 'parser_error',
  },
  {
    id: 'undefined-variable',
    title: '7. Undefined Variable (Semantic Error)',
    category: 'semantic_error',
    description: 'Demonstrates static symbol table inspection catching unassigned identifier references before execution.',
    code: `result = missing_value + 1`,
    expectedBehavior: 'Lexer and Parser succeed in generating the AST. The Semantic Analyzer checks the symbol table and flags "missing_value" as undefined with suggested fix.',
    expectedOutput: 'Semantic Error: Undefined variable \'missing_value\' at line 1, column 10.',
    expectedStage: 'semantic_error',
  },
  {
    id: 'invalid-syntax',
    title: '8. Invalid Syntax (Dangling Operator)',
    category: 'syntax_error',
    description: 'Demonstrates parser error when an operator is missing its right-hand operand.',
    code: `result = 10 +`,
    expectedBehavior: 'Parser reaches EOF expecting an expression following the \'+\' operator and reports clear syntax error.',
    expectedOutput: 'Parser Error: Unexpected end of file. Expected an expression after \'+\'.',
    expectedStage: 'parser_error',
  },
  {
    id: 'method-invocation',
    title: 'Bonus: Method Invocation & Evaluation',
    category: 'valid',
    description: 'Defines and immediately invokes a user method to compute and print the result.',
    code: `def multiply(x, y)
  x * y
end

total = multiply(6, 7)
puts total`,
    expectedBehavior: 'Evaluator registers "multiply", evaluates arguments 6 and 7 in child environment, and outputs 42.',
    expectedOutput: '42',
    expectedStage: 'success',
  },
];
