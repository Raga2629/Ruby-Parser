import React from 'react';
import {
  FileCheck2,
  Binary,
  GitBranch,
  ShieldAlert,
  Loader2,
  Clock,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { useParser, StageStatus } from '../context/ParserContext';
import { PipelineStage } from '../parser/diagnostics';

export const WorkflowStepper: React.FC = () => {
  const { stageStatuses, activeStage, stageTimings, isProcessing, setActiveTab } = useParser();

  const stages: {
    id: PipelineStage;
    number: number;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    targetTab?: 'tokens' | 'tree' | 'semantics' | 'errors' | 'evaluation';
  }[] = [
    {
      id: 'grammar',
      number: 1,
      title: 'Grammar & Syntax Rules',
      subtitle: 'Validates source syntax against supported grammar',
      icon: FileCheck2,
      targetTab: 'errors',
    },
    {
      id: 'lexer',
      number: 2,
      title: 'Lexical Analysis',
      subtitle: 'Scans source stream into typed tokens & positions',
      icon: Binary,
      targetTab: 'tokens',
    },
    {
      id: 'parser',
      number: 3,
      title: 'Parsing (Recursive Descent)',
      subtitle: 'Enforces precedence & builds hierarchical AST',
      icon: GitBranch,
      targetTab: 'tree',
    },
    {
      id: 'semantic',
      number: 4,
      title: 'Semantic Analysis',
      subtitle: 'Tracks symbol scopes, bindings & type sanity',
      icon: ShieldAlert,
      targetTab: 'semantics',
    },
    {
      id: 'evaluator',
      number: 5,
      title: 'Testing & Refinement',
      subtitle: 'Runs safe tree-walk evaluator & traces execution',
      icon: Sparkles,
      targetTab: 'evaluation',
    },
  ];

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'processing':
        return (
          <div className="flex items-center gap-1 text-[10px] text-blue-400 font-medium bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/30 shrink-0">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            <span className="hidden xs:inline">Running</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-1 text-[10px] text-status-success font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
            <Check className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">Passed</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-[10px] text-status-error font-medium bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/30 shrink-0">
            <X className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-navy-800 px-1.5 py-0.5 rounded-full border border-navy-700 shrink-0">
            <span className="hidden xs:inline">Wait</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-navy-850 rounded-2xl border border-navy-750 p-3 sm:p-4 shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-navy-750 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ruby-500 animate-pulse" />
          <h3 className="font-bold uppercase tracking-wider text-slate-300 text-[11px] sm:text-xs">
            Parser Building Pipeline
          </h3>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
          5 Architectural Stages
        </span>
      </div>

      {/* Responsive Layout: horizontal scroll on mobile, responsive grid on sm/md/lg */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar snap-x">
        {stages.map((stage) => {
          const status = stageStatuses[stage.id];
          const isActive = isProcessing && activeStage === stage.id;
          const timing = stageTimings[stage.id];
          const Icon = stage.icon;
          const isClickable = status === 'success' || status === 'error';

          return (
            <div
              key={stage.id}
              onClick={() => {
                if (isClickable && stage.targetTab) {
                  setActiveTab(stage.targetTab);
                }
              }}
              className={`min-w-[170px] sm:min-w-0 snap-start relative flex flex-col p-2.5 sm:p-3 rounded-xl border transition-all duration-200 select-none ${
                isClickable ? 'cursor-pointer hover:border-ruby-500/50 hover:bg-navy-750/70' : 'cursor-default'
              } ${
                status === 'error'
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-sm'
                  : status === 'success'
                  ? 'bg-navy-800/80 border-navy-700/80'
                  : status === 'processing'
                  ? 'bg-navy-750 border-blue-500/60 ring-1 ring-blue-500/30'
                  : 'bg-navy-900/60 border-navy-800/80 opacity-70'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] sm:text-[11px] shrink-0 ${
                      status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : status === 'error'
                        ? 'bg-rose-500/20 text-rose-400'
                        : status === 'processing'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-navy-700 text-slate-400'
                    }`}
                  >
                    {stage.number}
                  </div>
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
                {getStatusBadge(status)}
              </div>

              {/* Title & Description */}
              <h4 className="font-semibold text-[11px] sm:text-xs text-slate-100 line-clamp-1 mb-0.5">
                {stage.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2 leading-snug hidden xs:block">
                {stage.subtitle}
              </p>

              {/* Execution timing */}
              {status === 'success' && timing > 0 && (
                <div className="mt-1.5 pt-1 border-t border-navy-700/50 flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{timing} ms</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
