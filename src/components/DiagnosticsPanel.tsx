import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useParser } from '../context/ParserContext';
import { UnifiedDiagnostic } from '../parser/diagnostics';

export const DiagnosticsPanel: React.FC = () => {
  const { diagnostics, setHighlightRange } = useParser();

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const infos = diagnostics.filter((d) => d.severity === 'info');

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'grammar':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'lexer':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'parser':
        return 'bg-ruby-500/20 text-ruby-400 border-ruby-500/30';
      case 'semantic':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'evaluator':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleDiagnosticClick = (diag: UnifiedDiagnostic) => {
    setHighlightRange({
      startLine: diag.line,
      startCol: diag.column,
      endLine: diag.endLine || diag.line,
      endCol: diag.endColumn || diag.column + 5,
    });
  };

  if (diagnostics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-navy-850 rounded-2xl border border-navy-750">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-status-success" />
        </div>
        <h4 className="font-semibold text-slate-200 text-base">
          No Diagnostic Issues Found
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Source code parsed successfully through all phases with zero lexer, parser, or semantic diagnostics.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden">
      {/* Diagnostics Header */}
      <div className="flex items-center justify-between p-3 bg-navy-800 border-b border-navy-750">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-ruby-400" />
          <span className="text-xs font-semibold text-slate-200">
            Diagnostics & Error Feedback
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {errors.length > 0 && (
            <span className="text-status-error bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {errors.length} error{errors.length > 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-status-warning bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </span>
          )}
          {infos.length > 0 && (
            <span className="text-slate-400 bg-navy-900 px-2 py-0.5 rounded border border-navy-700">
              {infos.length} info
            </span>
          )}
        </div>
      </div>

      {/* Diagnostics List */}
      <div className="flex-1 p-3 overflow-auto space-y-2.5 max-h-[500px]">
        {diagnostics.map((diag) => {
          const isError = diag.severity === 'error';
          const isWarning = diag.severity === 'warning';

          return (
            <div
              key={diag.id}
              onClick={() => handleDiagnosticClick(diag)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isError
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                  : 'bg-navy-900 border-navy-750 hover:border-navy-600'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {isError ? (
                    <AlertCircle className="w-4 h-4 text-status-error shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  )}

                  <span
                    className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${getStageBadgeColor(
                      diag.stage
                    )}`}
                  >
                    {diag.stage}
                  </span>

                  <span
                    className={`text-[11px] font-bold uppercase ${
                      isError
                        ? 'text-status-error'
                        : isWarning
                        ? 'text-status-warning'
                        : 'text-blue-300'
                    }`}
                  >
                    {diag.severity}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-navy-900 px-2 py-0.5 rounded border border-navy-750">
                  <span>Line {diag.line}:{diag.column}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </div>
              </div>

              {/* Message */}
              <p className="text-xs font-mono text-slate-200 mt-1 leading-relaxed">
                {diag.message}
              </p>

              {/* Suggestion / Correction Hint */}
              {diag.suggestion && (
                <div className="mt-2 pt-2 border-t border-navy-800/80 flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{diag.suggestion}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
