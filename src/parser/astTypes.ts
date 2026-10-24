import { SourceLocation } from './tokenTypes';

export type ASTNodeType =
  | 'Program'
  | 'MethodDefinition'
  | 'ParameterList'
  | 'Assignment'
  | 'Identifier'
  | 'NumberLiteral'
  | 'StringLiteral'
  | 'BooleanLiteral'
  | 'NilLiteral'
  | 'BinaryExpression'
  | 'ComparisonExpression'
  | 'UnaryExpression'
  | 'MethodCall'
  | 'IfStatement'
  | 'ElsifBranch'
  | 'ElseBranch'
  | 'PutsStatement'
  | 'ExpressionStatement';

export interface BaseASTNode {
  id: string;
  type: ASTNodeType;
  loc: SourceLocation;
}

export interface ProgramNode extends BaseASTNode {
  type: 'Program';
  body: StatementNode[];
}

export interface IdentifierNode extends BaseASTNode {
  type: 'Identifier';
  name: string;
}

export interface ParameterListNode extends BaseASTNode {
  type: 'ParameterList';
  parameters: IdentifierNode[];
}

export interface MethodDefinitionNode extends BaseASTNode {
  type: 'MethodDefinition';
  name: string;
  parameters: IdentifierNode[];
  body: StatementNode[];
}

export interface AssignmentNode extends BaseASTNode {
  type: 'Assignment';
  identifier: IdentifierNode;
  value: ExpressionNode;
}

export interface NumberLiteralNode extends BaseASTNode {
  type: 'NumberLiteral';
  value: number;
  raw: string;
  isFloat: boolean;
}

export interface StringLiteralNode extends BaseASTNode {
  type: 'StringLiteral';
  value: string;
  raw: string;
}

export interface BooleanLiteralNode extends BaseASTNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface NilLiteralNode extends BaseASTNode {
  type: 'NilLiteral';
}

export interface BinaryExpressionNode extends BaseASTNode {
  type: 'BinaryExpression';
  operator: '+' | '-' | '*' | '/' | '%';
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface ComparisonExpressionNode extends BaseASTNode {
  type: 'ComparisonExpression';
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=';
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface UnaryExpressionNode extends BaseASTNode {
  type: 'UnaryExpression';
  operator: '+' | '-';
  argument: ExpressionNode;
}

export interface MethodCallNode extends BaseASTNode {
  type: 'MethodCall';
  callee: string;
  arguments: ExpressionNode[];
}

export interface PutsStatementNode extends BaseASTNode {
  type: 'PutsStatement';
  arguments: ExpressionNode[];
}

export interface ElsifBranchNode extends BaseASTNode {
  type: 'ElsifBranch';
  condition: ExpressionNode;
  body: StatementNode[];
}

export interface ElseBranchNode extends BaseASTNode {
  type: 'ElseBranch';
  body: StatementNode[];
}

export interface IfStatementNode extends BaseASTNode {
  type: 'IfStatement';
  condition: ExpressionNode;
  consequent: StatementNode[];
  elsifBranches: ElsifBranchNode[];
  alternate?: ElseBranchNode;
}

export interface ExpressionStatementNode extends BaseASTNode {
  type: 'ExpressionStatement';
  expression: ExpressionNode;
}

export type ExpressionNode =
  | IdentifierNode
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | NilLiteralNode
  | BinaryExpressionNode
  | ComparisonExpressionNode
  | UnaryExpressionNode
  | MethodCallNode;

export type StatementNode =
  | MethodDefinitionNode
  | IfStatementNode
  | AssignmentNode
  | PutsStatementNode
  | ExpressionStatementNode;

export type ASTNode =
  | ProgramNode
  | StatementNode
  | ExpressionNode
  | ParameterListNode
  | ElsifBranchNode
  | ElseBranchNode;
