import {
  ASTNode,
  ProgramNode,
  StatementNode,
  ExpressionNode,
  MethodDefinitionNode,
  AssignmentNode,
  IdentifierNode,
  BinaryExpressionNode,
  MethodCallNode,
  IfStatementNode,
  PutsStatementNode,
  ExpressionStatementNode,
} from './astTypes';
import { Scope, SymbolEntry, MethodSignature } from './symbolTable';

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface SemanticDiagnostic {
  severity: DiagnosticSeverity;
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  node?: ASTNode;
  identifier?: string;
  suggestion?: string;
  stage: 'semantic';
}

export interface SemanticAnalysisResult {
  diagnostics: SemanticDiagnostic[];
  globalScope: Scope;
  allScopes: Scope[];
  allSymbols: SymbolEntry[];
}

export class SemanticAnalyzer {
  private diagnostics: SemanticDiagnostic[] = [];
  private currentScope: Scope;
  private allScopes: Scope[] = [];

  constructor() {
    this.currentScope = new Scope('global', 0);
    this.allScopes = [this.currentScope];
  }

  public analyze(program: ProgramNode): SemanticAnalysisResult {
    this.diagnostics = [];
    this.currentScope = new Scope('global', 0);
    this.allScopes = [this.currentScope];

    // First pass: register all method signatures at top-level
    for (const stmt of program.body) {
      if (stmt.type === 'MethodDefinition') {
        const paramNames = stmt.parameters.map((p) => p.name);
        this.currentScope.defineMethod(
          stmt.name,
          paramNames,
          stmt.loc.start.line,
          stmt.loc.start.column
        );
      }
    }

    // Second pass: full traversal
    for (const stmt of program.body) {
      this.analyzeStatement(stmt);
    }

    // Check for unused variables in scopes
    this.checkUnusedVariables();

    // Flatten all symbols
    const allSymbols: SymbolEntry[] = [];
    for (const sc of this.allScopes) {
      allSymbols.push(...sc.getAllSymbols());
    }

    return {
      diagnostics: this.diagnostics,
      globalScope: this.allScopes[0],
      allScopes: this.allScopes,
      allSymbols,
    };
  }

  private analyzeStatement(stmt: StatementNode): void {
    switch (stmt.type) {
      case 'MethodDefinition':
        this.analyzeMethodDefinition(stmt);
        break;
      case 'IfStatement':
        this.analyzeIfStatement(stmt);
        break;
      case 'Assignment':
        this.analyzeAssignment(stmt);
        break;
      case 'PutsStatement':
        this.analyzePutsStatement(stmt);
        break;
      case 'ExpressionStatement':
        this.analyzeExpression(stmt.expression);
        break;
    }
  }

  private analyzeMethodDefinition(node: MethodDefinitionNode): void {
    // Create new scope for method
    const methodScope = new Scope(`method:${node.name}`, this.currentScope.level + 1, this.currentScope);
    this.allScopes.push(methodScope);
    const prevScope = this.currentScope;
    this.currentScope = methodScope;

    // Check duplicate parameters
    const paramNames = new Set<string>();
    for (const param of node.parameters) {
      if (paramNames.has(param.name)) {
        this.diagnostics.push({
          severity: 'error',
          message: `Duplicate parameter name '${param.name}' in method definition '${node.name}'.`,
          line: param.loc.start.line,
          column: param.loc.start.column,
          node: param,
          identifier: param.name,
          suggestion: `Rename parameter '${param.name}' to a unique parameter identifier.`,
          stage: 'semantic',
        });
      } else {
        paramNames.add(param.name);
      }

      // Define in method scope
      this.currentScope.define(
        param.name,
        'parameter',
        param.loc.start.line,
        param.loc.start.column,
        true
      );
    }

    // Check empty body
    if (node.body.length === 0) {
      this.diagnostics.push({
        severity: 'info',
        message: `Method '${node.name}' has an empty body.`,
        line: node.loc.start.line,
        column: node.loc.start.column,
        node,
        suggestion: `Add expressions or operations to the body of method '${node.name}'.`,
        stage: 'semantic',
      });
    }

    // Analyze body statements
    for (const bodyStmt of node.body) {
      this.analyzeStatement(bodyStmt);
    }

    // Restore previous scope
    this.currentScope = prevScope;
  }

  private analyzeIfStatement(node: IfStatementNode): void {
    this.analyzeExpression(node.condition);

    if (node.consequent.length === 0) {
      this.diagnostics.push({
        severity: 'warning',
        message: "Conditional 'if' block has an empty body.",
        line: node.loc.start.line,
        column: node.loc.start.column,
        node,
        suggestion: "Add statements inside the 'if' block or remove the conditional.",
        stage: 'semantic',
      });
    } else {
      for (const stmt of node.consequent) {
        this.analyzeStatement(stmt);
      }
    }

    for (const branch of node.elsifBranches) {
      this.analyzeExpression(branch.condition);
      for (const stmt of branch.body) {
        this.analyzeStatement(stmt);
      }
    }

    if (node.alternate) {
      for (const stmt of node.alternate.body) {
        this.analyzeStatement(stmt);
      }
    }
  }

  private analyzeAssignment(node: AssignmentNode): void {
    // First analyze RHS expression
    this.analyzeExpression(node.value);

    // Then define/mark assigned in current scope
    this.currentScope.define(
      node.identifier.name,
      'variable',
      node.identifier.loc.start.line,
      node.identifier.loc.start.column,
      true
    );
  }

  private analyzePutsStatement(node: PutsStatementNode): void {
    for (const arg of node.arguments) {
      this.analyzeExpression(arg);
    }
  }

  private analyzeExpression(expr: ExpressionNode): void {
    switch (expr.type) {
      case 'Identifier':
        this.analyzeIdentifier(expr);
        break;
      case 'BinaryExpression':
      case 'ComparisonExpression':
        this.analyzeBinaryExpression(expr);
        break;
      case 'UnaryExpression':
        this.analyzeExpression(expr.argument);
        break;
      case 'MethodCall':
        this.analyzeMethodCall(expr);
        break;
      case 'NumberLiteral':
      case 'StringLiteral':
      case 'BooleanLiteral':
      case 'NilLiteral':
        // Literals are semantically valid
        break;
    }
  }

  private analyzeIdentifier(node: IdentifierNode): void {
    const symbol = this.currentScope.lookup(node.name);

    if (!symbol) {
      this.diagnostics.push({
        severity: 'error',
        message: `Undefined variable '${node.name}' at line ${node.loc.start.line}, column ${node.loc.start.column}.`,
        line: node.loc.start.line,
        column: node.loc.start.column,
        node,
        identifier: node.name,
        suggestion: `Assign a value to '${node.name} = ...' before referencing it, or check for typos.`,
        stage: 'semantic',
      });
    } else {
      this.currentScope.markRead(node.name);
    }
  }

  private analyzeBinaryExpression(node: BinaryExpressionNode | any): void {
    this.analyzeExpression(node.left);
    this.analyzeExpression(node.right);

    // Division by literal zero check
    if ((node.operator === '/' || node.operator === '%') && node.right.type === 'NumberLiteral') {
      if (node.right.value === 0) {
        this.diagnostics.push({
          severity: 'error',
          message: `Static division by literal zero at line ${node.right.loc.start.line}, column ${node.right.loc.start.column}.`,
          line: node.right.loc.start.line,
          column: node.right.loc.start.column,
          node: node.right,
          suggestion: 'Division by zero is undefined and causes a runtime ZeroDivisionError.',
          stage: 'semantic',
        });
      }
    }
  }

  private analyzeMethodCall(node: MethodCallNode): void {
    for (const arg of node.arguments) {
      this.analyzeExpression(arg);
    }

    const method = this.currentScope.lookupMethod(node.callee);
    if (method) {
      if (node.arguments.length !== method.paramCount) {
        this.diagnostics.push({
          severity: 'warning',
          message: `Method '${node.callee}' expects ${method.paramCount} argument(s), but received ${node.arguments.length}.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          node,
          suggestion: `Ensure call matches '${node.callee}(${method.parameters.join(', ')})'.`,
          stage: 'semantic',
        });
      }
    } else {
      // If not defined and not built-in puts
      if (node.callee !== 'puts') {
        this.diagnostics.push({
          severity: 'warning',
          message: `Call to unrecognized or forward-declared method '${node.callee}'.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          node,
          suggestion: `Ensure method 'def ${node.callee}(...)' is declared in the script.`,
          stage: 'semantic',
        });
      }
    }
  }

  private checkUnusedVariables(): void {
    for (const sc of this.allScopes) {
      for (const [, sym] of sc.symbols) {
        if (sym.kind === 'variable' && !sym.isRead) {
          this.diagnostics.push({
            severity: 'warning',
            message: `Variable '${sym.name}' is assigned at line ${sym.line}, column ${sym.column} but never read.`,
            line: sym.line,
            column: sym.column,
            identifier: sym.name,
            suggestion: `Use '${sym.name}' in an expression or puts statement, or remove it if redundant.`,
            stage: 'semantic',
          });
        }
      }
    }
  }
}
