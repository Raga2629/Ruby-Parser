import React, { useState } from 'react';
import {
  Terminal,
  Activity,
  ListOrdered,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import { useParser } from '../context/ParserContext';

export const EvaluatorConsole: React.FC = () => {
  const { evaluationResult } = useParser();
  const [subView, setSubView] = useState<'terminal' | 'trace' | 'variables'>('terminal');

  if (!evaluationResult) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <Terminal className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-semibold text-slate-300">No Execution Results</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Parse and evaluate code to inspect standard output and step-by-step runtime execution trace.
        </p>
      </div>
    );
  }

  const { stdout, finalVariables, steps, error, executionNotes } = evaluationResult;
  const varEntries = Object.entries(finalVariables);

  return (
    <div className="flex flex-col h-full bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden text-xs">
      {/* Console Header & Subview Tabs */}
      <div className="flex items-center justify-between p-3 bg-navy-800 border-b border-navy-750">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">
            Safe Expression Evaluator
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-lg border border-navy-700/80 font-mono text-xs">
          <button
            onClick={() => setSubView('terminal')}
            className={`px-2.5 py-1 rounded transition-colors ${
              subView === 'terminal'
                ? 'bg-ruby-500 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terminal ({stdout.length})
          </button>
          <button
            onClick={() => setSubView('trace')}
            className={`px-2.5 py-1 rounded transition-colors ${
              subView === 'trace'
                ? 'bg-ruby-500 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trace ({steps.length})
          </button>
          <button
            onClick={() => setSubView('variables')}
            className={`px-2.5 py-1 rounded transition-colors ${
              subView === 'variables'
                ? 'bg-ruby-500 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Variables ({varEntries.length})
          </button>
        </div>
      </div>

      {/* Educational Note Banner if present */}
      {executionNotes.length > 0 && (
        <div className="px-4 py-2.5 bg-blue-950/30 border-b border-blue-500/20 flex items-start gap-2 text-xs text-blue-200 font-sans">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {executionNotes.map((note, idx) => (
              <p key={idx}>{note}</p>
            ))}
          </div>
        </div>
      )}

      {/* Runtime Error Banner if present */}
      {error && (
        <div className="px-4 py-3 bg-rose-950/40 border-b border-rose-500/30 flex items-start gap-2 text-xs text-rose-300 font-mono">
          <AlertCircle className="w-4 h-4 text-status-error shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Runtime Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Subview Contents */}
      <div className="flex-1 overflow-auto max-h-[500px]">
        {subView === 'terminal' && (
          <div className="p-4 bg-navy-950 font-mono min-h-full">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3 pb-2 border-b border-navy-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 text-slate-400">stdout output stream</span>
            </div>

            {stdout.length === 0 ? (
              <div className="text-slate-500 italic py-6 text-center">
                (No standard output produced. Use `puts` statements to print results.)
              </div>
            ) : (
              <div className="space-y-1">
                {stdout.map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">
                      {i + 1}
                    </span>
                    <span className="text-emerald-400 font-medium selection:bg-ruby-500/30">
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {subView === 'trace' && (
          <div className="p-3 divide-y divide-navy-800 font-mono">
            {steps.length === 0 ? (
              <div className="p-6 text-center text-slate-500 italic">
                No evaluation steps recorded.
              </div>
            ) : (
              steps.map((st) => (
                <div key={st.step} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-slate-300 text-[11px] shrink-0">
                      {st.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-ruby-400 font-semibold">{st.nodeType}</span>
                        <span className="text-[10px] text-slate-500">Line {st.line}</span>
                      </div>
                      <p className="text-slate-300 text-xs mt-0.5">{st.description}</p>
                      {st.output && (
                        <span className="inline-block mt-1 text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                          stdout: "{st.output}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Variables at step */}
                  {Object.keys(st.variables).length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1 text-[10px] max-w-[200px] justify-end">
                      {Object.entries(st.variables).map(([k, v]) => (
                        <span
                          key={k}
                          className="bg-navy-900 px-1.5 py-0.5 rounded text-slate-400 border border-navy-750"
                        >
                          {k}={String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {subView === 'variables' && (
          <div className="p-4 font-mono">
            {varEntries.length === 0 ? (
              <div className="p-6 text-center text-slate-500 italic">
                No environment variables currently defined.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-navy-850 text-slate-400 border-b border-navy-750">
                  <tr>
                    <th className="py-2 px-3">Variable Name</th>
                    <th className="py-2 px-3">Value</th>
                    <th className="py-2 px-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {varEntries.map(([name, val], i) => (
                    <tr key={i} className="hover:bg-navy-800/50">
                      <td className="py-2 px-3 text-cyan-300 font-bold">{name}</td>
                      <td className="py-2 px-3 text-emerald-300 font-medium">
                        {String(val)}
                      </td>
                      <td className="py-2 px-3 text-slate-400 capitalize">
                        {typeof val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
