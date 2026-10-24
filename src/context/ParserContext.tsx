import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Token } from '../parser/tokenTypes';
import { ProgramNode, ASTNode } from '../parser/astTypes';
import { Lexer } from '../parser/lexer';
import { Parser } from '../parser/parser';
import { SemanticAnalyzer, SemanticAnalysisResult } from '../parser/semanticAnalyzer';
import { SafeEvaluator, EvaluationResult } from '../parser/evaluator';
import {
  UnifiedDiagnostic,
  PipelineStage,
  fromLexerError,
  fromParserError,
  fromSemanticDiagnostic,
} from '../parser/diagnostics';
import { DEFAULT_PROGRAM, EXAMPLES } from '../data/defaultExamples';

export type StageStatus = 'waiting' | 'processing' | 'success' | 'error';

export interface StageState {
  grammar: StageStatus;
  lexer: StageStatus;
  parser: StageStatus;
  semantic: StageStatus;
  evaluator: StageStatus;
}

export interface HighlightRange {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
}

export interface ParserContextType {
  sourceCode: string;
  setSourceCode: (code: string) => void;
  activeExampleId: string | null;
  loadExample: (id: string, autoRun?: boolean) => void;
  resetToDefault: () => void;
  clearCode: () => void;
  formatCode: () => void;

  isProcessing: boolean;
  activeStage: PipelineStage;
  stageStatuses: StageState;
  stageTimings: Record<PipelineStage, number>;

  tokens: Token[];
  ast: ProgramNode | null;
  semanticResult: SemanticAnalysisResult | null;
  evaluationResult: EvaluationResult | null;
  diagnostics: UnifiedDiagnostic[];

  selectedToken: Token | null;
  setSelectedToken: (token: Token | null) => void;
  selectedNode: ASTNode | null;
  setSelectedNode: (node: ASTNode | null) => void;
  highlightRange: HighlightRange | null;
  setHighlightRange: (range: HighlightRange | null) => void;

  activeTab: 'tokens' | 'tree' | 'graph' | 'semantics' | 'errors' | 'evaluation';
  setActiveTab: (tab: 'tokens' | 'tree' | 'graph' | 'semantics' | 'errors' | 'evaluation') => void;

  runParser: (options?: { stepDelay?: number }) => Promise<boolean>;
}

const STORAGE_KEY_CODE = 'ruby_parser_source_code_v1';
const STORAGE_KEY_EXAMPLE = 'ruby_parser_example_id_v1';

const initialStageState: StageState = {
  grammar: 'waiting',
  lexer: 'waiting',
  parser: 'waiting',
  semantic: 'waiting',
  evaluator: 'waiting',
};

const initialTimings: Record<PipelineStage, number> = {
  grammar: 0,
  lexer: 0,
  parser: 0,
  semantic: 0,
  evaluator: 0,
};

const ParserContext = createContext<ParserContextType | undefined>(undefined);

export const ParserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sourceCode, setSourceCodeState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CODE);
      return saved !== null ? saved : DEFAULT_PROGRAM;
    } catch {
      return DEFAULT_PROGRAM;
    }
  });

  const [activeExampleId, setActiveExampleId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_EXAMPLE) || 'default-method-and-flow';
    } catch {
      return 'default-method-and-flow';
    }
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<PipelineStage>('grammar');
  const [stageStatuses, setStageStatuses] = useState<StageState>(initialStageState);
  const [stageTimings, setStageTimings] = useState<Record<PipelineStage, number>>(initialTimings);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<ProgramNode | null>(null);
  const [semanticResult, setSemanticResult] = useState<SemanticAnalysisResult | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [diagnostics, setDiagnostics] = useState<UnifiedDiagnostic[]>([]);

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedNode, setSelectedNode] = useState<ASTNode | null>(null);
  const [highlightRange, setHighlightRange] = useState<HighlightRange | null>(null);
  const [activeTab, setActiveTab] = useState<'tokens' | 'tree' | 'graph' | 'semantics' | 'errors' | 'evaluation'>('tokens');

  const setSourceCode = (code: string) => {
    setSourceCodeState(code);
    try {
      localStorage.setItem(STORAGE_KEY_CODE, code);
    } catch {}
  };

  const loadExample = (id: string, autoRun: boolean = true) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (ex) {
      setActiveExampleId(id);
      setSourceCode(ex.code);
      try {
        localStorage.setItem(STORAGE_KEY_EXAMPLE, id);
      } catch {}
      if (autoRun) {
        setTimeout(() => {
          runParserWithSource(ex.code);
        }, 50);
      }
    }
  };

  const resetToDefault = () => {
    loadExample('default-method-and-flow', true);
  };

  const clearCode = () => {
    setSourceCode('');
    setActiveExampleId(null);
    setTokens([]);
    setAst(null);
    setSemanticResult(null);
    setEvaluationResult(null);
    setDiagnostics([]);
    setStageStatuses(initialStageState);
    setSelectedToken(null);
    setSelectedNode(null);
    setHighlightRange(null);
  };

  const formatCode = () => {
    if (!sourceCode.trim()) return;

    const lines = sourceCode.split('\n');
    let indentLevel = 0;
    const indentWidth = 2;
    const formattedLines: string[] = [];

    for (let rawLine of lines) {
      let trimmed = rawLine.trim();

      if (!trimmed) {
        formattedLines.push('');
        continue;
      }

      // Check if line starts with closing or branching keyword: end, else, elsif
      const isDedent =
        trimmed.startsWith('end') ||
        trimmed.startsWith('else') ||
        trimmed.startsWith('elsif');

      const currentIndent = Math.max(0, isDedent ? indentLevel - 1 : indentLevel);
      const indentStr = ' '.repeat(currentIndent * indentWidth);

      formattedLines.push(indentStr + trimmed);

      // Adjust indent level for following lines
      if (trimmed.startsWith('def ') || trimmed.startsWith('if ') || trimmed.startsWith('elsif ') || trimmed.startsWith('else')) {
        indentLevel = isDedent ? currentIndent + 1 : indentLevel + 1;
      } else if (trimmed.startsWith('end')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
    }

    const formatted = formattedLines.join('\n');
    setSourceCode(formatted);
  };

  const runParserWithSource = useCallback(
    async (codeToParse: string, options?: { stepDelay?: number }): Promise<boolean> => {
      const stepDelay = options?.stepDelay ?? 120; // smooth educational visual transition
      setIsProcessing(true);
      setSelectedToken(null);
      setSelectedNode(null);
      setHighlightRange(null);

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      const timings: Record<PipelineStage, number> = { ...initialTimings };
      const allDiags: UnifiedDiagnostic[] = [];

      // Reset statuses
      setStageStatuses({
        grammar: 'processing',
        lexer: 'waiting',
        parser: 'waiting',
        semantic: 'waiting',
        evaluator: 'waiting',
      });
      setActiveStage('grammar');

      // Stage 1: Grammar and Syntax Rules validation
      const t0 = performance.now();
      if (stepDelay > 0) await delay(stepDelay);

      if (!codeToParse.trim()) {
        allDiags.push({
          id: 'diag_empty_code',
          stage: 'grammar',
          severity: 'error',
          message: 'Source code is empty. Please enter Ruby-like code or select an example.',
          line: 1,
          column: 1,
          suggestion: 'Choose one of the sample programs from the dropdown to get started.',
        });
        setDiagnostics(allDiags);
        setStageStatuses({
          grammar: 'error',
          lexer: 'waiting',
          parser: 'waiting',
          semantic: 'waiting',
          evaluator: 'waiting',
        });
        setIsProcessing(false);
        setActiveTab('errors');
        return false;
      }

      timings.grammar = Math.round((performance.now() - t0) * 100) / 100;
      setStageStatuses((prev) => ({ ...prev, grammar: 'success', lexer: 'processing' }));
      setActiveStage('lexer');

      // Stage 2: Lexical Analysis
      const tLexerStart = performance.now();
      if (stepDelay > 0) await delay(stepDelay);

      const lexer = new Lexer(codeToParse);
      const lexerResult = lexer.tokenize();
      setTokens(lexerResult.tokens);

      if (lexerResult.errors.length > 0) {
        lexerResult.errors.forEach((err, idx) => {
          allDiags.push(fromLexerError(err, idx));
        });
      }

      timings.lexer = Math.round((performance.now() - tLexerStart) * 100) / 100;

      const hasLexerError = lexerResult.errors.length > 0;
      if (hasLexerError) {
        setDiagnostics(allDiags);
        setStageStatuses((prev) => ({
          ...prev,
          lexer: 'error',
          parser: 'waiting',
          semantic: 'waiting',
          evaluator: 'waiting',
        }));
        setIsProcessing(false);
        setActiveTab('errors');
        return false;
      }

      setStageStatuses((prev) => ({ ...prev, lexer: 'success', parser: 'processing' }));
      setActiveStage('parser');

      // Stage 3: Parsing (Recursive Descent)
      const tParserStart = performance.now();
      if (stepDelay > 0) await delay(stepDelay);

      const parser = new Parser(lexerResult.tokens);
      const parseResult = parser.parse();
      setAst(parseResult.ast);

      if (parseResult.errors.length > 0) {
        parseResult.errors.forEach((err, idx) => {
          allDiags.push(fromParserError(err, idx));
        });
      }

      timings.parser = Math.round((performance.now() - tParserStart) * 100) / 100;

      const hasParserError = parseResult.errors.length > 0;
      if (hasParserError || !parseResult.ast) {
        setDiagnostics(allDiags);
        setStageStatuses((prev) => ({
          ...prev,
          parser: 'error',
          semantic: 'waiting',
          evaluator: 'waiting',
        }));
        setIsProcessing(false);
        setActiveTab('errors');
        return false;
      }

      setStageStatuses((prev) => ({ ...prev, parser: 'success', semantic: 'processing' }));
      setActiveStage('semantic');

      // Stage 4: Semantic Analysis
      const tSemanticStart = performance.now();
      if (stepDelay > 0) await delay(stepDelay);

      const analyzer = new SemanticAnalyzer();
      const semResult = analyzer.analyze(parseResult.ast);
      setSemanticResult(semResult);

      semResult.diagnostics.forEach((diag, idx) => {
        allDiags.push(fromSemanticDiagnostic(diag, idx));
      });

      timings.semantic = Math.round((performance.now() - tSemanticStart) * 100) / 100;

      const hasSemanticFatalError = semResult.diagnostics.some((d) => d.severity === 'error');
      if (hasSemanticFatalError) {
        setDiagnostics(allDiags);
        setStageStatuses((prev) => ({
          ...prev,
          semantic: 'error',
          evaluator: 'waiting',
        }));
        setIsProcessing(false);
        setActiveTab('errors');
        return false;
      }

      setStageStatuses((prev) => ({ ...prev, semantic: 'success', evaluator: 'processing' }));
      setActiveStage('evaluator');

      // Stage 5: Evaluation & Testing
      const tEvalStart = performance.now();
      if (stepDelay > 0) await delay(stepDelay);

      const evaluator = new SafeEvaluator();
      const evalResult = evaluator.evaluate(parseResult.ast);
      setEvaluationResult(evalResult);

      timings.evaluator = Math.round((performance.now() - tEvalStart) * 100) / 100;
      setStageTimings(timings);
      setDiagnostics(allDiags);

      if (evalResult.error) {
        allDiags.push({
          id: 'eval_runtime_err',
          stage: 'evaluator',
          severity: 'error',
          message: evalResult.error,
          line: 1,
          column: 1,
          suggestion: 'Check expressions for zero division, undefined variables, or invalid arguments.',
        });
        setStageStatuses((prev) => ({ ...prev, evaluator: 'error' }));
      } else {
        setStageStatuses((prev) => ({ ...prev, evaluator: 'success' }));
      }

      setIsProcessing(false);
      return true;
    },
    []
  );

  const runParser = async (options?: { stepDelay?: number }): Promise<boolean> => {
    return runParserWithSource(sourceCode, options);
  };

  // Sync token selection to highlight range
  useEffect(() => {
    if (selectedToken) {
      setHighlightRange({
        startLine: selectedToken.line,
        startCol: selectedToken.column,
        endLine: selectedToken.line,
        endCol: selectedToken.column + (selectedToken.value?.length || 1),
      });
    }
  }, [selectedToken]);

  // Sync AST node selection to highlight range
  useEffect(() => {
    if (selectedNode && selectedNode.loc) {
      setHighlightRange({
        startLine: selectedNode.loc.start.line,
        startCol: selectedNode.loc.start.column,
        endLine: selectedNode.loc.end.line,
        endCol: selectedNode.loc.end.column,
      });
    }
  }, [selectedNode]);

  // Auto-run once on initial mount
  useEffect(() => {
    runParserWithSource(sourceCode, { stepDelay: 0 });
  }, []);

  return (
    <ParserContext.Provider
      value={{
        sourceCode,
        setSourceCode,
        activeExampleId,
        loadExample,
        resetToDefault,
        clearCode,
        formatCode,
        isProcessing,
        activeStage,
        stageStatuses,
        stageTimings,
        tokens,
        ast,
        semanticResult,
        evaluationResult,
        diagnostics,
        selectedToken,
        setSelectedToken,
        selectedNode,
        setSelectedNode,
        highlightRange,
        setHighlightRange,
        activeTab,
        setActiveTab,
        runParser,
      }}
    >
      {children}
    </ParserContext.Provider>
  );
};

export const useParser = (): ParserContextType => {
  const context = useContext(ParserContext);
  if (!context) {
    throw new Error('useParser must be used within a ParserProvider');
  }
  return context;
};
