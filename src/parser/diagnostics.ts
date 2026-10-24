import { LexerError } from './lexer';
import { ParserError } from './parser';
import { SemanticDiagnostic } from './semanticAnalyzer';
import { ASTNode } from './astTypes';

export type PipelineStage = 'grammar' | 'lexer' | 'parser' | 'semantic' | 'evaluator';

export interface UnifiedDiagnostic {
  id: string;
  stage: PipelineStage;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  startOffset?: number;
  endOffset?: number;
  suggestion?: string;
  node?: ASTNode;
}

export function fromLexerError(err: LexerError, index: number): UnifiedDiagnostic {
  return {
    id: `lexer_err_${index}`,
    stage: 'lexer',
    severity: 'error',
    message: err.message,
    line: err.line,
    column: err.column,
    startOffset: err.startOffset,
    endOffset: err.endOffset,
    suggestion: 'Check for unclosed quotes, invalid characters, or malformed numbers.',
  };
}

export function fromParserError(err: ParserError, index: number): UnifiedDiagnostic {
  return {
    id: `parser_err_${index}`,
    stage: 'parser',
    severity: 'error',
    message: err.message,
    line: err.line,
    column: err.column,
    startOffset: err.startOffset,
    endOffset: err.endOffset,
    suggestion: err.suggestion || "Review the statement syntax against supported grammar rules.",
  };
}

export function fromSemanticDiagnostic(diag: SemanticDiagnostic, index: number): UnifiedDiagnostic {
  return {
    id: `semantic_diag_${index}`,
    stage: 'semantic',
    severity: diag.severity,
    message: diag.message,
    line: diag.line,
    column: diag.column,
    suggestion: diag.suggestion,
    node: diag.node,
  };
}
