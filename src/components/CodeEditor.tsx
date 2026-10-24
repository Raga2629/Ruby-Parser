import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  AlignLeft,
  ChevronDown,
  FileCode,
} from 'lucide-react';
import { useParser } from '../context/ParserContext';
import { EXAMPLES } from '../data/defaultExamples';

export const CodeEditor: React.FC = () => {
  const {
    sourceCode,
    setSourceCode,
    activeExampleId,
    loadExample,
    resetToDefault,
    clearCode,
    formatCode,
    runParser,
    isProcessing,
    highlightRange,
    diagnostics,
  } = useParser();

  const [copied, setCopied] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = sourceCode.split('\n');

  const errorLines = new Set<number>(
    diagnostics.filter((d) => d.severity === 'error').map((d) => d.line)
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleTextareaScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSelectOrKeyUp = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = sourceCode.substring(0, pos);
    const line = textBefore.split('\n').length;
    const col = pos - textBefore.lastIndexOf('\n');
    setCursorPos({ line, col });
  };

  useEffect(() => {
    handleTextareaScroll();
  }, [sourceCode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart ?? 0;
      const end = textareaRef.current?.selectionEnd ?? 0;
      const newCode = sourceCode.substring(0, start) + '  ' + sourceCode.substring(end);
      setSourceCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runParser();
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy-800 rounded-2xl border border-navy-700/80 shadow-panel overflow-hidden">
      {/* Editor Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-navy-850 border-b border-navy-700/70">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[180px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 shrink-0">
            <FileCode className="w-4 h-4 text-ruby-500" />
            <span className="hidden xs:inline">Source</span>
          </div>

          {/* Example Selector Dropdown */}
          <div className="relative flex-1 max-w-[240px]">
            <select
              value={activeExampleId || ''}
              onChange={(e) => {
                if (e.target.value) {
                  loadExample(e.target.value, true);
                }
              }}
              className="w-full appearance-none bg-navy-900 border border-navy-700 hover:border-ruby-500/50 text-slate-200 text-xs rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-ruby-500 cursor-pointer font-medium truncate"
            >
              <option value="" disabled>
                Select Example...
              </option>
              {EXAMPLES.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={formatCode}
            className="p-1.5 rounded-lg bg-navy-750 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-650 transition-colors"
            title="Format Code (Indent)"
            aria-label="Format Code"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-navy-750 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-650 transition-colors"
            title="Copy Source Code"
            aria-label="Copy Source Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={clearCode}
            className="p-1.5 rounded-lg bg-navy-750 hover:bg-navy-700 text-slate-300 hover:text-status-error border border-navy-650 transition-colors"
            title="Clear Code"
            aria-label="Clear Code"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetToDefault}
            className="p-1.5 rounded-lg bg-navy-750 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-650 transition-colors"
            title="Reset to Default"
            aria-label="Reset to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => runParser()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ruby-500 hover:bg-ruby-600 text-white font-medium text-xs shadow-sm shadow-ruby-500/20 active:scale-95 transition-all disabled:opacity-50"
            title="Parse Code (Ctrl+Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Parse</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex min-h-[280px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden bg-navy-950 font-mono text-xs sm:text-sm leading-6">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="select-none py-3 px-2 sm:px-3 bg-navy-900/60 border-r border-navy-800 text-right text-slate-500 font-mono text-[11px] sm:text-xs w-10 sm:w-12 overflow-hidden flex flex-col shrink-0"
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isError = errorLines.has(lineNum);
            const isHighlighted =
              highlightRange &&
              lineNum >= highlightRange.startLine &&
              lineNum <= highlightRange.endLine;

            return (
              <div
                key={i}
                className={`h-6 leading-6 transition-colors ${
                  isError
                    ? 'text-status-error font-bold'
                    : isHighlighted
                    ? 'text-ruby-400 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input */}
        <div className="relative flex-1 h-full overflow-hidden">
          {highlightRange && (
            <div
              className="absolute left-0 right-0 pointer-events-none bg-ruby-500/10 border-l-2 border-ruby-500 z-0 transition-all duration-150"
              style={{
                top: `${(highlightRange.startLine - 1) * 24 + 12}px`,
                height: `${(highlightRange.endLine - highlightRange.startLine + 1) * 24}px`,
              }}
            />
          )}

          <textarea
            ref={textareaRef}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            onScroll={handleTextareaScroll}
            onSelect={handleSelectOrKeyUp}
            onKeyUp={handleSelectOrKeyUp}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="# Enter Ruby code here...&#10;def add(a, b)&#10;  a + b&#10;end"
            className="ruby-editor-textarea relative z-10 w-full h-full p-2.5 sm:p-3 bg-transparent text-slate-100 resize-none focus:outline-none overflow-auto font-mono text-xs sm:text-sm leading-6 selection:bg-ruby-500/30 whitespace-pre"
          />
        </div>
      </div>

      {/* Editor Status Footer */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-3 sm:px-4 py-2 bg-navy-900 border-t border-navy-750 text-[11px] sm:text-xs text-slate-400 font-mono select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <span>
            Ln <span className="text-slate-200">{cursorPos.line}</span>, Col{' '}
            <span className="text-slate-200">{cursorPos.col}</span>
          </span>
          <span className="text-navy-600">|</span>
          <span>{lines.length} lines</span>
          <span className="text-navy-600 hidden xs:inline">|</span>
          <span className="hidden xs:inline">{sourceCode.length} chars</span>
        </div>

        <div className="flex items-center gap-1.5">
          {highlightRange && (
            <span className="text-ruby-400 bg-ruby-500/10 px-1.5 py-0.5 rounded border border-ruby-500/20 text-[10px] sm:text-[11px] truncate max-w-[180px]">
              L{highlightRange.startLine}:{highlightRange.startCol}–L{highlightRange.endLine}:{highlightRange.endCol}
            </span>
          )}
          <span className="text-slate-500 hidden sm:inline">Ruby</span>
        </div>
      </div>
    </div>
  );
};
