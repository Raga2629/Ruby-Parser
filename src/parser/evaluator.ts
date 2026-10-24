import {
  ASTNode,
  ProgramNode,
  StatementNode,
  ExpressionNode,
  MethodDefinitionNode,
  AssignmentNode,
  IdentifierNode,
  BinaryExpressionNode,
  ComparisonExpressionNode,
  UnaryExpressionNode,
  MethodCallNode,
  IfStatementNode,
  PutsStatementNode,
  ExpressionStatementNode,
} from './astTypes';

export interface ExecutionStep {
  step: number;
  nodeType: string;
  description: string;
  line: number;
  variables: Record<string, any>;
  output?: string;
}

export interface EvaluationResult {
  stdout: string[];
  finalVariables: Record<string, any>;
  steps: ExecutionStep[];
  error?: string;
  evaluatedNodesCount: number;
  executionNotes: string[];
}

interface MethodEntry {
  parameters: string[];
  body: StatementNode[];
}

class Environment {
  private values: Map<string, any> = new Map();
  public parent?: Environment;

  constructor(parent?: Environment) {
    this.parent = parent;
  }

  public get(name: string): any {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    return undefined;
  }

  public set(name: string, value: any): void {
    // If already in parent or local, update where it exists
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    if (this.parent && this.parent.has(name)) {
      this.parent.set(name, value);
      return;
    }
    this.values.set(name, value);
  }

  public has(name: string): boolean {
    if (this.values.has(name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }

  public getAllBindings(): Record<string, any> {
    const res: Record<string, any> = {};
    if (this.parent) {
      Object.assign(res, this.parent.getAllBindings());
    }
    for (const [k, v] of this.values.entries()) {
      res[k] = v;
    }
    return res;
  }
}

export class SafeEvaluator {
  private stdout: string[] = [];
  private steps: ExecutionStep[] = [];
  private stepCount: number = 0;
  private maxSteps: number = 500;
  private methods: Map<string, MethodEntry> = new Map();
  private notes: string[] = [];

  public evaluate(program: ProgramNode): EvaluationResult {
    this.stdout = [];
    this.steps = [];
    this.stepCount = 0;
    this.methods.clear();
    this.notes = [];

    const globalEnv = new Environment();

    try {
      for (const stmt of program.body) {
        if (this.stepCount >= this.maxSteps) {
          throw new Error(`Execution exceeded maximum allowable step limit (${this.maxSteps} steps).`);
        }
        this.executeStatement(stmt, globalEnv);
      }
    } catch (err: any) {
      return {
        stdout: this.stdout,
        finalVariables: globalEnv.getAllBindings(),
        steps: this.steps,
        error: err.message || String(err),
        evaluatedNodesCount: this.stepCount,
        executionNotes: this.notes,
      };
    }

    if (program.body.length === 0) {
      this.notes.push('Program is empty. No statements were executed.');
    } else {
      const methodCount = this.methods.size;
      if (methodCount > 0 && this.stdout.length === 0 && Object.keys(globalEnv.getAllBindings()).length === 0) {
        this.notes.push(
          `${methodCount} method(s) defined. In Ruby, defining a method registers it without executing its body. Call the method (e.g. puts add(1, 2)) to evaluate it.`
        );
      }
    }

    return {
      stdout: this.stdout,
      finalVariables: globalEnv.getAllBindings(),
      steps: this.steps,
      evaluatedNodesCount: this.stepCount,
      executionNotes: this.notes,
    };
  }

  private recordStep(node: ASTNode, description: string, env: Environment, output?: string): void {
    this.stepCount++;
    this.steps.push({
      step: this.stepCount,
      nodeType: node.type,
      description,
      line: node.loc.start.line,
      variables: { ...env.getAllBindings() },
      output,
    });
  }

  private executeStatement(stmt: StatementNode, env: Environment): any {
    switch (stmt.type) {
      case 'MethodDefinition': {
        const paramNames = stmt.parameters.map((p) => p.name);
        this.methods.set(stmt.name, {
          parameters: paramNames,
          body: stmt.body,
        });
        this.recordStep(
          stmt,
          `Defined method '${stmt.name}(${paramNames.join(', ')})'`,
          env
        );
        this.notes.push(`Registered method '${stmt.name}' with parameters [${paramNames.join(', ')}].`);
        return null;
      }

      case 'Assignment': {
        const value = this.evaluateExpression(stmt.value, env);
        env.set(stmt.identifier.name, value);
        this.recordStep(
          stmt,
          `Assigned ${stmt.identifier.name} = ${this.formatValue(value)}`,
          env
        );
        return value;
      }

      case 'PutsStatement': {
        const outputs: string[] = [];
        if (stmt.arguments.length === 0) {
          this.stdout.push('');
          outputs.push('');
        } else {
          for (const arg of stmt.arguments) {
            const val = this.evaluateExpression(arg, env);
            const strVal = this.formatValue(val);
            this.stdout.push(strVal);
            outputs.push(strVal);
          }
        }
        const combined = outputs.join(' ');
        this.recordStep(stmt, `Executed puts: "${combined}"`, env, combined);
        return null;
      }

      case 'IfStatement': {
        const condVal = this.evaluateExpression(stmt.condition, env);
        this.recordStep(
          stmt,
          `Evaluated if condition: ${this.isTruthy(condVal) ? 'true' : 'false'}`,
          env
        );

        if (this.isTruthy(condVal)) {
          let lastVal = null;
          for (const s of stmt.consequent) {
            lastVal = this.executeStatement(s, env);
          }
          return lastVal;
        }

        // Try Elsif branches
        for (const branch of stmt.elsifBranches) {
          const elsifCond = this.evaluateExpression(branch.condition, env);
          this.recordStep(
            branch,
            `Evaluated elsif condition: ${this.isTruthy(elsifCond) ? 'true' : 'false'}`,
            env
          );
          if (this.isTruthy(elsifCond)) {
            let lastVal = null;
            for (const s of branch.body) {
              lastVal = this.executeStatement(s, env);
            }
            return lastVal;
          }
        }

        // Try Else branch
        if (stmt.alternate) {
          this.recordStep(stmt.alternate, 'Entering else branch', env);
          let lastVal = null;
          for (const s of stmt.alternate.body) {
            lastVal = this.executeStatement(s, env);
          }
          return lastVal;
        }

        return null;
      }

      case 'ExpressionStatement': {
        const val = this.evaluateExpression(stmt.expression, env);
        this.recordStep(stmt, `Evaluated expression: ${this.formatValue(val)}`, env);
        return val;
      }
    }
  }

  private evaluateExpression(expr: ExpressionNode, env: Environment): any {
    switch (expr.type) {
      case 'NumberLiteral':
        return expr.value;

      case 'StringLiteral':
        return expr.value;

      case 'BooleanLiteral':
        return expr.value;

      case 'NilLiteral':
        return null;

      case 'Identifier': {
        const val = env.get(expr.name);
        if (val === undefined) {
          throw new Error(`Undefined variable '${expr.name}' at runtime (line ${expr.loc.start.line}).`);
        }
        return val;
      }

      case 'UnaryExpression': {
        const arg = this.evaluateExpression(expr.argument, env);
        if (expr.operator === '-') return -arg;
        if (expr.operator === '+') return +arg;
        return arg;
      }

      case 'BinaryExpression': {
        const left = this.evaluateExpression(expr.left, env);
        const right = this.evaluateExpression(expr.right, env);

        switch (expr.operator) {
          case '+':
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            if (right === 0) {
              throw new Error(`ZeroDivisionError: divided by 0 at line ${expr.loc.start.line}.`);
            }
            return Math.floor(left / right);
          case '%':
            if (right === 0) {
              throw new Error(`ZeroDivisionError: modulo by 0 at line ${expr.loc.start.line}.`);
            }
            return left % right;
        }
        break;
      }

      case 'ComparisonExpression': {
        const left = this.evaluateExpression(expr.left, env);
        const right = this.evaluateExpression(expr.right, env);

        switch (expr.operator) {
          case '==':
            return left === right;
          case '!=':
            return left !== right;
          case '<':
            return left < right;
          case '<=':
            return left <= right;
          case '>':
            return left > right;
          case '>=':
            return left >= right;
        }
        break;
      }

      case 'MethodCall': {
        const method = this.methods.get(expr.callee);
        if (!method) {
          throw new Error(
            `Method '${expr.callee}' is not defined. (line ${expr.loc.start.line})`
          );
        }

        if (expr.arguments.length !== method.parameters.length) {
          throw new Error(
            `Wrong number of arguments for '${expr.callee}': expected ${method.parameters.length}, given ${expr.arguments.length}.`
          );
        }

        // Evaluate argument expressions in current environment
        const argValues = expr.arguments.map((arg) => this.evaluateExpression(arg, env));

        // Create new child environment for method invocation
        const methodEnv = new Environment(env);
        for (let i = 0; i < method.parameters.length; i++) {
          methodEnv.set(method.parameters[i], argValues[i]);
        }

        this.recordStep(
          expr,
          `Invoking method '${expr.callee}' with arguments (${argValues.join(', ')})`,
          methodEnv
        );

        let returnVal = null;
        for (const s of method.body) {
          returnVal = this.executeStatement(s, methodEnv);
        }
        return returnVal;
      }
    }

    return null;
  }

  private isTruthy(val: any): boolean {
    return val !== false && val !== null && val !== undefined;
  }

  private formatValue(val: any): string {
    if (val === null || val === undefined) return 'nil';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'string') return val;
    return String(val);
  }
}
