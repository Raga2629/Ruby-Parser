import React from 'react';
import { Database, FolderTree, KeyRound, Check, X, Shield } from 'lucide-react';
import { useParser } from '../context/ParserContext';

export const SymbolTableView: React.FC = () => {
  const { semanticResult } = useParser();

  if (!semanticResult) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <Database className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-semibold text-slate-300">No Semantic Symbols</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Run parsing to inspect the symbol tables, lexical scopes, and declarations.
        </p>
      </div>
    );
  }

  const { allScopes, allSymbols } = semanticResult;

  return (
    <div className="flex flex-col h-full bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-navy-800 border-b border-navy-750">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-ruby-400" />
          <span className="font-semibold text-slate-200">
            Symbol Table & Scope Environment
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <span>{allScopes.length} scope(s)</span>
          <span>•</span>
          <span>{allSymbols.length} symbol(s)</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6 max-h-[500px]">
        {/* Scopes & Symbol Entries */}
        {allScopes.map((scope, sIdx) => {
          const symbols = scope.getAllSymbols();
          const methods = Array.from(scope.methods.values());

          return (
            <div
              key={sIdx}
              className="bg-navy-900 rounded-xl border border-navy-750 overflow-hidden shadow-sm"
            >
              {/* Scope Title */}
              <div className="flex items-center justify-between px-3 py-2 bg-navy-800/80 border-b border-navy-750">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono font-bold text-slate-200">
                    Scope: <span className="text-ruby-400">{scope.name}</span>
                  </span>
                  <span className="text-[10px] bg-navy-750 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                    Depth: {scope.level}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {symbols.length} entries
                </span>
              </div>

              {/* Scope Methods */}
              {methods.length > 0 && (
                <div className="p-3 border-b border-navy-800 bg-navy-850/40">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-2">
                    Registered Methods
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {methods.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="flex items-center justify-between p-2 rounded bg-navy-800 border border-navy-750 font-mono"
                      >
                        <span className="text-purple-300 font-semibold">
                          def {m.name}({m.parameters.join(', ')})
                        </span>
                        <span className="text-[10px] text-slate-500">Line {m.line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Symbols Table */}
              {symbols.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">
                  No variable or parameter symbols in this scope.
                </div>
              ) : (
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead className="bg-navy-850 text-slate-400 border-b border-navy-800 select-none">
                    <tr>
                      <th className="py-2 px-3">Identifier</th>
                      <th className="py-2 px-3">Kind</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Assigned</th>
                      <th className="py-2 px-3">Referenced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    {symbols.map((sym, idx) => (
                      <tr key={idx} className="hover:bg-navy-800/50">
                        <td className="py-2 px-3 font-bold text-slate-200">
                          {sym.name}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                              sym.kind === 'parameter'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}
                          >
                            {sym.kind}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          L{sym.line}:{sym.column}
                        </td>
                        <td className="py-2 px-3">
                          {sym.isAssigned ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                              <Check className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                              <X className="w-3 h-3" /> No
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {sym.isRead ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                              <Check className="w-3 h-3" /> Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                              Unread (Warning)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
