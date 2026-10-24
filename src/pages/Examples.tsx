import React, { useState } from 'react';
import {
  Code2,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Check,
  X,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { EXAMPLES } from '../data/defaultExamples';
import { useParser } from '../context/ParserContext';
import { runInBrowserTestSuite, TestSuiteSummary } from '../tests/testSuite';

export interface ExamplesProps {
  onNavigate: (page: 'home' | 'workspace' | 'ast-explorer' | 'examples' | 'architecture') => void;
}

export const Examples: React.FC<ExamplesProps> = ({ onNavigate }) => {
  const { loadExample } = useParser();
  const [activeTab, setActiveTab] = useState<'gallery' | 'tests'>('gallery');
  const [filterCategory, setFilterCategory] = useState<'all' | 'valid' | 'syntax_error' | 'semantic_error'>('all');

  const [testSummary, setTestSummary] = useState<TestSuiteSummary>(() => runInBrowserTestSuite());
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testFilterCategory, setTestFilterCategory] = useState<string>('all');

  const handleRunAllTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const summary = runInBrowserTestSuite();
      setTestSummary(summary);
      setIsRunningTests(false);
    }, 150);
  };

  const filteredExamples = EXAMPLES.filter((ex) => {
    if (filterCategory === 'all') return true;
    return ex.category === filterCategory;
  });

  const filteredTests = testSummary.results.filter((t) => {
    if (testFilterCategory === 'all') return true;
    return t.category.toLowerCase() === testFilterCategory.toLowerCase();
  });

  return (
    <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy-850 p-3.5 sm:p-4 rounded-2xl border border-navy-750 shadow-panel">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-ruby-500 shrink-0" />
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Examples & Interactive Test Suite
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Curated programs demonstrating parser rules, syntax errors, and in-browser assertion testing.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-navy-700/80 shrink-0">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'gallery'
                ? 'bg-ruby-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Programs ({EXAMPLES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tests'
                ? 'bg-ruby-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Test Runner ({testSummary.total})</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: EXAMPLES GALLERY --- */}
      {activeTab === 'gallery' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Category Filter Pills - Scrollable horizontally on small screens */}
          <div className="flex items-center gap-1.5 text-xs font-medium overflow-x-auto no-scrollbar pb-1">
            <span className="text-slate-400 flex items-center gap-1 shrink-0 mr-1 text-[11px] sm:text-xs">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${
                filterCategory === 'all'
                  ? 'bg-ruby-500/20 text-ruby-400 border-ruby-500/50 font-bold'
                  : 'bg-navy-850 text-slate-400 border-navy-750 hover:text-white'
              }`}
            >
              All ({EXAMPLES.length})
            </button>
            <button
              onClick={() => setFilterCategory('valid')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${
                filterCategory === 'valid'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                  : 'bg-navy-850 text-slate-400 border-navy-750 hover:text-white'
              }`}
            >
              Valid Syntax
            </button>
            <button
              onClick={() => setFilterCategory('syntax_error')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${
                filterCategory === 'syntax_error'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 font-bold'
                  : 'bg-navy-850 text-slate-400 border-navy-750 hover:text-white'
              }`}
            >
              Syntax Errors
            </button>
            <button
              onClick={() => setFilterCategory('semantic_error')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${
                filterCategory === 'semantic_error'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                  : 'bg-navy-850 text-slate-400 border-navy-750 hover:text-white'
              }`}
            >
              Semantic Errors
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExamples.map((ex) => {
              const isSyntaxErr = ex.category === 'syntax_error';
              const isSemanticErr = ex.category === 'semantic_error';

              return (
                <div
                  key={ex.id}
                  className="bg-navy-850 rounded-2xl border border-navy-750 p-4 sm:p-5 flex flex-col justify-between hover:border-navy-650 transition-all shadow-panel space-y-3 sm:space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-100 text-xs sm:text-sm truncate">{ex.title}</h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                          {ex.description}
                        </p>
                      </div>

                      <span
                        className={`text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${
                          isSyntaxErr
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : isSemanticErr
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {ex.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Code Snippet Box */}
                    <div className="rounded-xl bg-navy-950 p-2.5 sm:p-3 border border-navy-800 font-mono text-[11px] sm:text-xs overflow-x-auto text-slate-200">
                      <pre className="whitespace-pre leading-5">{ex.code}</pre>
                    </div>

                    {/* Expected Behavior */}
                    <div className="bg-navy-900/80 rounded-xl p-2.5 sm:p-3 border border-navy-750 space-y-1 text-xs">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Expected Behavior
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans text-[11px] sm:text-xs">
                        {ex.expectedBehavior}
                      </p>
                      {ex.expectedOutput && (
                        <div className="mt-1 pt-1 border-t border-navy-800 text-[10px] sm:text-[11px] font-mono text-emerald-400 truncate">
                          Output: {ex.expectedOutput}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-navy-750">
                    <button
                      onClick={() => {
                        loadExample(ex.id, false);
                        onNavigate('workspace');
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 text-xs font-semibold border border-navy-700 transition-colors"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        loadExample(ex.id, true);
                        onNavigate('workspace');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ruby-500 hover:bg-ruby-600 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: TEST SUITE RUNNER --- */}
      {activeTab === 'tests' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Banner: 2 cols on mobile, 4 on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-navy-850 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-navy-750 flex items-center justify-between shadow-panel">
              <div>
                <span className="text-[11px] sm:text-xs text-slate-400 block">Total</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  {testSummary.total}
                </span>
              </div>
              <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 opacity-80" />
            </div>

            <div className="bg-navy-850 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-navy-750 flex items-center justify-between shadow-panel">
              <div>
                <span className="text-[11px] sm:text-xs text-slate-400 block">Passed</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                  {testSummary.passed}
                </span>
              </div>
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 opacity-80" />
            </div>

            <div className="bg-navy-850 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-navy-750 flex items-center justify-between shadow-panel">
              <div>
                <span className="text-[11px] sm:text-xs text-slate-400 block">Failed</span>
                <span className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono">
                  {testSummary.failed}
                </span>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400 opacity-80" />
            </div>

            <div className="bg-navy-850 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-navy-750 flex items-center justify-between shadow-panel">
              <div>
                <span className="text-[11px] sm:text-xs text-slate-400 block">Duration</span>
                <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
                  {testSummary.durationMs} ms
                </span>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 opacity-80" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-navy-850 p-3 rounded-2xl border border-navy-750">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium shrink-0 mr-1">Filter:</span>
              {['all', 'lexer', 'parser', 'semantic', 'evaluator'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTestFilterCategory(cat)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors shrink-0 ${
                    testFilterCategory === cat
                      ? 'bg-ruby-500 text-white'
                      : 'bg-navy-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunAllTests}
              disabled={isRunningTests}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-ruby-500 hover:bg-ruby-600 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>Run All Tests Live</span>
            </button>
          </div>

          {/* Test Cases List */}
          <div className="space-y-2.5">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  test.passed
                    ? 'bg-navy-850/80 border-navy-750'
                    : 'bg-rose-950/20 border-rose-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        test.passed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {test.passed ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700 shrink-0">
                          {test.category}
                        </span>
                        <h4 className="font-bold text-slate-200 text-xs sm:text-sm truncate">
                          {test.name}
                        </h4>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {test.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 text-[11px] sm:text-xs font-mono text-slate-400 shrink-0">
                    <span className="text-[10px] sm:text-xs">{test.durationMs} ms</span>
                    <span
                      className={`font-bold px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] ${
                        test.passed
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {test.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {test.error && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs font-mono text-rose-300">
                    <div className="font-bold mb-1">Error: {test.error}</div>
                    {test.details && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-rose-500/20 text-[10px] sm:text-[11px]">
                        <div>Expected: {test.details.expected}</div>
                        <div>Actual: {test.details.actual}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
