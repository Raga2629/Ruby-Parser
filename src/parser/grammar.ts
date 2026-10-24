export interface GrammarRule {
  name: string;
  ebnf: string;
  description: string;
}

export const SUPPORTED_GRAMMAR_RULES: GrammarRule[] = [
  {
    name: 'Program',
    ebnf: 'Program ::= StatementList',
    description: 'The root node containing an ordered sequence of top-level statements separated by newlines or semicolons.',
  },
  {
    name: 'StatementList',
    ebnf: 'StatementList ::= (Statement (Newline | \';\')*)*',
    description: 'A sequence of statements optionally separated and delimited by newlines or semicolons.',
  },
  {
    name: 'Statement',
    ebnf: 'Statement ::= MethodDefinition | IfStatement | Assignment | PutsStatement | ExpressionStatement',
    description: 'A discrete syntactical unit representing an action, binding, control structure, or expression.',
  },
  {
    name: 'MethodDefinition',
    ebnf: 'MethodDefinition ::= \'def\' IDENTIFIER (\'(\' ParameterList? \')\')? Newline StatementList \'end\'',
    description: 'Defines a named callable routine with optional formal parameters and an enclosed body terminating with \'end\'.',
  },
  {
    name: 'ParameterList',
    ebnf: 'ParameterList ::= IDENTIFIER (\',\' IDENTIFIER)*',
    description: 'A comma-separated list of formal parameter identifiers for a method definition.',
  },
  {
    name: 'IfStatement',
    ebnf: 'IfStatement ::= \'if\' Expression Newline StatementList (ElsifBranch)* (ElseBranch)? \'end\'',
    description: 'Conditional branching control structure with condition, consequent statements, optional elsif branches, and optional else branch.',
  },
  {
    name: 'ElsifBranch',
    ebnf: 'ElsifBranch ::= \'elsif\' Expression Newline StatementList',
    description: 'Secondary conditional branch tested if previous conditions evaluate to falsy.',
  },
  {
    name: 'ElseBranch',
    ebnf: 'ElseBranch ::= \'else\' Newline StatementList',
    description: 'Default fallback branch executed when all if and elsif conditions are falsy.',
  },
  {
    name: 'Assignment',
    ebnf: 'Assignment ::= IDENTIFIER \'=\' Expression',
    description: 'Binds the evaluation of an expression to a local variable identifier.',
  },
  {
    name: 'PutsStatement',
    ebnf: 'PutsStatement ::= \'puts\' (Expression (\',\' Expression)*)?',
    description: 'Outputs one or more evaluated expressions to standard output with trailing newlines.',
  },
  {
    name: 'Expression',
    ebnf: 'Expression ::= Comparison',
    description: 'Top-level expression rule delegating to comparison precedence.',
  },
  {
    name: 'Comparison',
    ebnf: 'Comparison ::= Additive ((\'==\' | \'!=\' | \'<\' | \'<=\' | \'>\' | \'>=\') Additive)*',
    description: 'Relational and equality operators evaluated with left associativity.',
  },
  {
    name: 'Additive',
    ebnf: 'Additive ::= Multiplicative ((\'+\' | \'-\') Multiplicative)*',
    description: 'Addition, subtraction, and string concatenation operations with left associativity.',
  },
  {
    name: 'Multiplicative',
    ebnf: 'Multiplicative ::= Unary ((\'*\' | \'/\' | \'%\') Unary)*',
    description: 'Multiplication, division, and modulo operations with higher precedence than additive.',
  },
  {
    name: 'Unary',
    ebnf: 'Unary ::= (\'+\' | \'-\') Unary | Primary',
    description: 'Unary positive or negation prefix operations.',
  },
  {
    name: 'Primary',
    ebnf: 'Primary ::= NumberLiteral | StringLiteral | BooleanLiteral | NilLiteral | MethodCall | Identifier | \'(\' Expression \')\'',
    description: 'Atomic expressions: literals, variable references, parenthesized groupings, and invocations.',
  },
  {
    name: 'MethodCall',
    ebnf: 'MethodCall ::= IDENTIFIER \'(\' (Expression (\',\' Expression)*)? \')\'',
    description: 'Invocation of a method with positional actual arguments enclosed in parentheses.',
  },
];

export const UNSUPPORTED_RUBY_KEYWORDS: Record<string, string> = {
  class: 'Classes and object-oriented inheritance are planned for future phases.',
  module: 'Modules and mixins are planned for future phases.',
  while: 'While loops are not currently supported in this educational subset. Use method recursion or sequential flow.',
  until: 'Until loops are not currently supported in this educational subset.',
  for: 'For loops are not currently supported in this educational subset.',
  loop: 'Loop blocks are not currently supported in this educational subset.',
  case: 'Case/when statements are not currently supported in this educational subset. Use if/elsif/else.',
  when: 'When clauses are only valid within case statements.',
  unless: 'Unless statements are not supported; use \'if !(condition)\' or standard if statements.',
  return: 'Explicit return keywords are not strictly needed; Ruby methods return the last expression evaluated.',
  yield: 'Blocks, procs, and yield statements are planned for future extensions.',
  super: 'Super calls require class inheritance, which is planned for future phases.',
  rescue: 'Exception handling (begin/rescue/ensure) is planned for future extensions.',
  ensure: 'Exception handling (ensure) is planned for future extensions.',
  retry: 'Retry statements are not supported.',
  redo: 'Redo statements are not supported.',
  break: 'Break statements are not supported in this subset.',
  next: 'Next statements are not supported in this subset.',
};
