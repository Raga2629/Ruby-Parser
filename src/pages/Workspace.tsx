import React, { useState } from 'react';
import {
  Binary,
  GitBranch,
  ShieldAlert,
  AlertCircle,
  Terminal,
  Share2,
  Code2,
  SlidersHorizontal,
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { TokenTable } from '../components/TokenTable';
import { ASTTree } from '../components/ASTTree';
import { ASTGraph } from '../components/ASTGraph';
import { SymbolTableView } from '../components/SymbolTableView';
import { DiagnosticsPanel } from '../components/DiagnosticsPanel';
import { EvaluatorConsole } from '../components/EvaluatorConsole';
import { useParser } from '../context/ParserContext';

export const Workspace: React.FC = () => {
  const { activeTab, setActiveTab, diagnostics, tokens } = useParser();
  const [mobileView, setMobileView] = useState<'editor' | 'results'>('editor');

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;

  const tabs = [
    { id: 'tokens' as const, label: 'Tokens', icon: Binary, count: tokens.length },
    { id: 'tree' as const, label: 'Tree', icon: GitBranch },
    { id: 'graph' as const, label: 'Graph', icon: Share2 },
    { id: 'semantics' as const, label: 'Semantics', icon: ShieldAlert },
    { id: 'errors' as const, label: 'Diagnostics', icon: AlertCircle, count: errorCount, isErrorBadge: true },
    { id: 'evaluation' as const, label: 'Evaluation', icon: Terminal },
  ];

  return (
    <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* 5-Stage Compilation Stepper */}
      <WorkflowStepper />

      {/* Mobile View Toggle Switch (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center p-1 bg-navy-850 rounded-xl border border-navy-750 shadow-sm">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            mobileView === 'editor'
              ? 'bg-ruby-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Source Editor</span>
        </button>

        <button
          onClick={() => setMobileView('results')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            mobileView === 'results'
              ? 'bg-ruby-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Results & Inspector</span>
          {errorCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-status-error" />
          )}
        </button>
      </div>

      {/* Main Workspace Grid: Dual-column on lg+, toggle or responsive stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* Left Column: Source Code Editor */}
        <div
          className={`lg:col-span-5 h-[520px] sm:h-[580px] lg:h-[620px] flex flex-col ${
            mobileView === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <CodeEditor />
        </div>

        {/* Right Column: Results & Inspector Tabs */}
        <div
          className={`lg:col-span-7 h-[520px] sm:h-[580px] lg:h-[620px] flex flex-col bg-navy-850 rounded-2xl border border-navy-750 shadow-panel overflow-hidden ${
            mobileView === 'results' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Tab Navigation Bar - Scrollable on mobile */}
          <div className="flex items-center border-b border-navy-750 bg-navy-800 px-2 sm:px-3 pt-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-ruby-500 text-white bg-navy-850'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-navy-750'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          tab.isErrorBadge
                            ? 'bg-rose-500 text-white'
                            : 'bg-navy-700 text-slate-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Content Area */}
          <div className="flex-1 overflow-hidden p-2.5 sm:p-3 bg-navy-850">
            {activeTab === 'tokens' && <TokenTable />}
            {activeTab === 'tree' && <ASTTree />}
            {activeTab === 'graph' && <ASTGraph />}
            {activeTab === 'semantics' && <SymbolTableView />}
            {activeTab === 'errors' && <DiagnosticsPanel />}
            {activeTab === 'evaluation' && <EvaluatorConsole />}
          </div>
        </div>
      </div>
    </div>
  );
};
