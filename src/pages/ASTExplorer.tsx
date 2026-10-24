import React, { useState } from 'react';
import {
  GitBranch,
  Layers,
  FileJson,
  Share2,
  Info,
  Code2,
  Crosshair,
  SlidersHorizontal,
} from 'lucide-react';
import { useParser } from '../context/ParserContext';
import { ASTTree } from '../components/ASTTree';
import { ASTGraph } from '../components/ASTGraph';
import { ASTJsonView } from '../components/ASTJsonView';

export const ASTExplorer: React.FC = () => {
  const { ast, selectedNode, sourceCode } = useParser();
  const [activeAstView, setActiveAstView] = useState<'tree' | 'graph' | 'json'>('graph');
  const [showMobileInspector, setShowMobileInspector] = useState(false);

  const getSelectedSourceSnippet = () => {
    if (!selectedNode || !selectedNode.loc) return null;
    const lines = sourceCode.split('\n');
    const startLine = selectedNode.loc.start.line - 1;
    const endLine = selectedNode.loc.end.line - 1;

    if (startLine >= 0 && endLine < lines.length) {
      if (startLine === endLine) {
        return lines[startLine];
      }
      return lines.slice(startLine, endLine + 1).join('\n');
    }
    return null;
  };

  const snippet = getSelectedSourceSnippet();

  return (
    <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy-850 p-3.5 sm:p-4 rounded-2xl border border-navy-750 shadow-panel">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-ruby-500 shrink-0" />
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Abstract Syntax Tree Explorer
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Synchronized multi-modal AST inspection: Visual Graph, Hierarchy Tree, and JSON.
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-navy-700/80">
            <button
              onClick={() => setActiveAstView('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeAstView === 'graph'
                  ? 'bg-ruby-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Graph</span>
            </button>

            <button
              onClick={() => setActiveAstView('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeAstView === 'tree'
                  ? 'bg-ruby-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tree</span>
            </button>

            <button
              onClick={() => setActiveAstView('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeAstView === 'json'
                  ? 'bg-ruby-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>

          {/* Mobile Inspector Toggle */}
          <button
            onClick={() => setShowMobileInspector(!showMobileInspector)}
            className="lg:hidden p-2 rounded-xl bg-navy-900 border border-navy-750 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
            title="Toggle Node Inspector"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {selectedNode && <span className="w-2 h-2 rounded-full bg-ruby-500" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer + Node Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* Visualizer Area (8 cols on lg) */}
        <div className="lg:col-span-8 h-[480px] sm:h-[540px] lg:h-[600px] flex flex-col">
          {activeAstView === 'graph' && <ASTGraph />}
          {activeAstView === 'tree' && <ASTTree />}
          {activeAstView === 'json' && <ASTJsonView />}
        </div>

        {/* Node Inspector Panel (4 cols on lg, toggleable or stacked on mobile) */}
        <div
          className={`lg:col-span-4 h-[420px] sm:h-[480px] lg:h-[600px] flex-col bg-navy-850 rounded-2xl border border-navy-750 shadow-panel overflow-hidden ${
            showMobileInspector ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3 bg-navy-800 border-b border-navy-750 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-ruby-400" />
              <span className="font-semibold text-slate-200 text-xs">
                Node Inspector
              </span>
            </div>
            {selectedNode && (
              <span className="text-[10px] bg-ruby-500/15 text-ruby-400 border border-ruby-500/30 px-2 py-0.5 rounded font-mono font-bold truncate max-w-[120px]">
                {selectedNode.type}
              </span>
            )}
          </div>

          <div className="flex-1 p-3.5 overflow-auto space-y-3.5 text-xs font-mono">
            {selectedNode ? (
              <>
                <div className="space-y-1.5 bg-navy-900 p-3 rounded-xl border border-navy-750">
                  <div className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">
                    Node Metadata
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Node ID:</span>
                    <span className="text-slate-200 font-bold">{selectedNode.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AST Type:</span>
                    <span className="text-ruby-400 font-bold">{selectedNode.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Line Range:</span>
                    <span className="text-cyan-300">
                      Ln {selectedNode.loc.start.line}:{selectedNode.loc.start.column} – {selectedNode.loc.end.line}:{selectedNode.loc.end.column}
                    </span>
                  </div>
                </div>

                {snippet && (
                  <div className="space-y-1.5 bg-navy-900 p-3 rounded-xl border border-navy-750">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Source Slice</span>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-navy-950 text-emerald-400 border border-navy-800 text-xs overflow-x-auto whitespace-pre leading-5">
                      {snippet}
                    </pre>
                  </div>
                )}

                <div className="space-y-1.5 bg-navy-900 p-3 rounded-xl border border-navy-750">
                  <div className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">
                    Node Attributes
                  </div>
                  <pre className="p-2.5 rounded-lg bg-navy-950 text-slate-300 border border-navy-800 text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(selectedNode).filter(
                          ([k]) => k !== 'loc' && k !== 'body' && k !== 'consequent'
                        )
                      ),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 font-sans">
                <Info className="w-8 h-8 text-slate-600 mb-2" />
                <h4 className="font-semibold text-slate-300 text-sm">
                  No Node Selected
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Tap or click on any node in the tree or graph visualizer to inspect its coordinates, attributes, and source range.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
