import React from 'react';
import {
  Layers,
  ArrowRight,
  BookOpen,
  Terminal,
  GitBranch,
  ShieldCheck,
  Cpu,
  Workflow,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { SUPPORTED_GRAMMAR_RULES } from '../parser/grammar';

export const Architecture: React.FC = () => {
  const modules = [
    {
      name: 'Lexer (Tokenizer)',
      role: 'Lexical Analysis',
      icon: Terminal,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      description:
        'Converts the raw character stream into a sequence of discrete, typed tokens (keywords, literals, operators, comments). Tracks source lines, columns, and absolute byte offsets for precise downstream error reporting.',
    },
    {
      name: 'Recursive-Descent Parser',
      role: 'Syntactic Analysis',
      icon: GitBranch,
      color: 'text-ruby-400 border-ruby-500/30 bg-ruby-500/10',
      description:
        'Enforces the language grammar using top-down predictive recursive descent. Evaluates binary and comparison operator precedence, manages statement lists, and constructs the strongly typed Abstract Syntax Tree (AST).',
    },
    {
      name: 'Abstract Syntax Tree (AST)',
      role: 'Intermediate Representation',
      icon: Layers,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description:
        'Hierarchical tree representation capturing purely semantic relationships without syntactic noise like parentheses or commas. Each node contains a unique ID, type discriminator, source location range, and child node references.',
    },
    {
      name: 'Semantic Analyzer',
      role: 'Static Scope Validation',
      icon: ShieldCheck,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description:
        'Performs multi-pass scope inspection using lexical Symbol Tables. Validates variable bindings, flags undeclared identifiers on RHS, enforces unique parameter signatures, and statically detects division by literal zero.',
    },
    {
      name: 'Safe Expression Evaluator',
      role: 'Lightweight Execution & Trace',
      icon: Cpu,
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      description:
        'Safe tree-walking interpreter for the supported subset (integers, strings, booleans, conditionals, variables, user methods, puts statements). Records step-by-step variable environments without arbitrary code execution.',
    },
  ];

  const workflowSteps = [
    {
      step: 1,
      title: 'Define Grammar & Syntax Rules',
      summary:
        'Establish unambiguous EBNF production rules defining language statements, expressions, precedence levels, and lexical tokens.',
    },
    {
      step: 2,
      title: 'Perform Lexical Analysis',
      summary:
        'Scan source characters, identify keywords and literals, strip non-semantic whitespace, and report unterminated strings or illegal characters.',
    },
    {
      step: 3,
      title: 'Build Parse Trees or ASTs',
      summary:
        'Apply recursive-descent parsing with controlled lookahead to eliminate syntactic delimiters and construct hierarchical AST nodes.',
    },
    {
      step: 4,
      title: 'Validate & Interpret Parse Results',
      summary:
        'Traverse the AST to build scoped symbol tables, check variable lifetimes, ensure parameter consistency, and evaluate expressions.',
    },
    {
      step: 5,
      title: 'Test & Iteratively Refine',
      summary:
        'Execute automated test suites covering positive syntax, invalid edge cases, error recoveries, and execution correctness.',
    },
  ];

  return (
    <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Page Title */}
      <div className="bg-navy-850 p-4 sm:p-6 rounded-2xl border border-navy-750 shadow-panel space-y-2">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 sm:w-6 sm:h-6 text-ruby-500 shrink-0" />
          <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            System Architecture & Parser Design
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
          Comprehensive overview of the modular architecture, parsing workflow, documented grammar,
          and compiler design principles based on the <i>Parser Building Overview</i> reference presentation.
        </p>
      </div>

      {/* Visual Pipeline Flow Diagram */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-ruby-400" />
          Data Transformation Pipeline
        </h2>

        <div className="bg-navy-850 p-4 sm:p-6 rounded-2xl border border-navy-750 shadow-panel overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[680px] gap-2">
            {[
              { label: 'Source Input', sub: 'Ruby Code' },
              { label: 'Lexer', sub: 'Token Stream' },
              { label: 'Parser', sub: 'Syntax Check' },
              { label: 'AST Node Tree', sub: 'Hierarchy' },
              { label: 'Semantic Analyzer', sub: 'Symbol Tables' },
              { label: 'Evaluator / Output', sub: 'Trace & stdout' },
            ].map((node, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center justify-center p-3 bg-navy-900 rounded-xl border border-navy-700 min-w-[110px] sm:min-w-[125px] text-center shadow-sm">
                  <span className="text-[11px] sm:text-xs font-bold text-white font-mono">{node.label}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{node.sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ruby-500 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Module Responsibilities */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-ruby-400" />
          Core Module Responsibilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={i}
                className="bg-navy-850 rounded-2xl border border-navy-750 p-4 sm:p-5 space-y-2.5 sm:space-y-3 shadow-panel hover:border-navy-650 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${m.color}`}>
                    {m.role}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-100 text-xs sm:text-sm">{m.name}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{m.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Stage Parser Building Workflow */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <Workflow className="w-4 h-4 sm:w-5 sm:h-5 text-ruby-400" />
          The 5-Stage Parser-Building Workflow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {workflowSteps.map((wf) => (
            <div
              key={wf.step}
              className="bg-navy-850 p-3.5 sm:p-4 rounded-2xl border border-navy-750 flex flex-col justify-between shadow-panel space-y-2"
            >
              <div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-ruby-500/20 text-ruby-400 font-bold flex items-center justify-center text-xs mb-2.5 border border-ruby-500/30">
                  {wf.step}
                </div>
                <h4 className="font-bold text-slate-200 text-xs mb-1">{wf.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">{wf.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documented EBNF Grammar Specification */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-ruby-400" />
            Supported EBNF Grammar Specification
          </h2>
          <span className="text-[11px] sm:text-xs font-mono text-slate-400">
            {SUPPORTED_GRAMMAR_RULES.length} Rules
          </span>
        </div>

        <div className="bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-navy-800 text-slate-300 font-mono border-b border-navy-750 select-none text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4 w-32 sm:w-40 font-semibold">Non-Terminal</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold">EBNF Production Rule</th>
                  <th className="py-2.5 px-3 sm:px-4 font-semibold hidden md:table-cell">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 font-mono text-[11px] sm:text-xs">
                {SUPPORTED_GRAMMAR_RULES.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 text-ruby-400 font-bold whitespace-nowrap">{rule.name}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-emerald-300 whitespace-nowrap">
                      {rule.ebnf}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-slate-400 font-sans text-xs hidden md:table-cell">
                      {rule.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Current Implementation vs Future Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-navy-850 rounded-2xl border border-navy-750 p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-panel">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Currently Implemented Features
            </h3>
          </div>
          <ul className="space-y-2 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Full lexical scanner supporting keywords, integers, floats, escape strings, and operators.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Operator precedence expression parsing with binary, unary, and comparison binding.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Named method definitions with formal parameter lists and scoped bodies.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Conditional structures supporting if, elsif chains, and else branches.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Multi-modal AST inspection: Interactive Collapsible Tree, SVG Graph, and JSON.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Lexical symbol tables detecting undefined variables, duplicate parameters, and zero division.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Safe in-browser expression evaluator and step-by-step execution tracer without eval.</span>
            </li>
          </ul>
        </div>

        <div className="bg-navy-850 rounded-2xl border border-navy-750 p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-panel">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ruby-400 shrink-0" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Planned Future Scope (From Presentation)
            </h3>
          </div>
          <ul className="space-y-2 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ruby-400 mt-1.5 shrink-0" />
              <span><b>Object-Oriented Constructs:</b> Support class declarations, instance variables (@var), and inheritance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ruby-400 mt-1.5 shrink-0" />
              <span><b>Iteration & Loops:</b> While, until, and each block iterators with break and next control statements.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ruby-400 mt-1.5 shrink-0" />
              <span><b>Ruby Blocks & Procs:</b> First-class closures, do...end block arguments, and yield statements.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ruby-400 mt-1.5 shrink-0" />
              <span><b>Compiler Integration:</b> Bytecode generation and compilation to register-based or stack-based virtual machines.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ruby-400 mt-1.5 shrink-0" />
              <span><b>Enhanced Error Recovery:</b> Advanced panic-mode recovery and fuzzy spelling suggestions for variables.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
