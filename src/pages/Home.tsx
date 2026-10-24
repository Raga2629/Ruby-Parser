import React from 'react';
import {
  Play,
  Code2,
  GitBranch,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  FileCode2,
  Bug,
} from 'lucide-react';

export interface HomeProps {
  onNavigate: (page: 'home' | 'workspace' | 'ast-explorer' | 'examples' | 'architecture') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const pipelineStages = [
    {
      title: 'Source Code',
      badge: 'Input',
      description: 'Raw character stream written in Ruby-like syntax.',
      icon: FileCode2,
    },
    {
      title: 'Lexer',
      badge: 'Tokens',
      description: 'Scans source into typed tokens with exact line & column coordinates.',
      icon: Terminal,
    },
    {
      title: 'Parser',
      badge: 'Syntax',
      description: 'Recursive-descent algorithm enforcing operator precedence.',
      icon: GitBranch,
    },
    {
      title: 'AST Tree',
      badge: 'Hierarchy',
      description: 'Pure structural syntax model devoid of syntactic boilerplate.',
      icon: Layers,
    },
    {
      title: 'Semantics',
      badge: 'Validation',
      description: 'Symbol scopes, variable bindings, and static type checks.',
      icon: ShieldCheck,
    },
  ];

  const features = [
    {
      icon: Terminal,
      title: 'Lexical Analysis',
      description:
        'Breaks raw text into structured tokens (keywords, literals, operators, comments) with precise source offsets.',
    },
    {
      icon: GitBranch,
      title: 'Recursive-Descent Parsing',
      description:
        'Constructs an Abstract Syntax Tree using top-down predictive parsing with documented grammar rules and precedence.',
    },
    {
      icon: Layers,
      title: 'Abstract Syntax Tree (AST)',
      description:
        'Explore the AST through three synchronized perspectives: interactive collapsible tree, SVG node-edge graph, and JSON.',
    },
    {
      icon: ShieldCheck,
      title: 'Semantic Validation',
      description:
        'Maintains lexical symbol tables to identify undeclared identifiers, duplicate parameters, and static zero division.',
    },
    {
      icon: Bug,
      title: 'Actionable Error Reporting',
      description:
        'Plain-language diagnostics with line coordinates and targeted correction hints, without generic failure messages.',
    },
    {
      icon: Cpu,
      title: 'Safe In-Browser Execution',
      description:
        'Lightweight tree-walk interpreter evaluating arithmetic, conditionals, and puts output without insecure eval.',
    },
  ];

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 sm:space-y-16">
      {/* Hero Section */}
      <div className="relative text-center space-y-4 sm:space-y-6 pt-2 sm:pt-6">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-ruby-500/10 border border-ruby-500/30 text-ruby-400 text-[11px] sm:text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Compiler Education Tool
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Ruby Parser <span className="text-ruby-500">Visualizer</span>
        </h1>

        <p className="text-lg sm:text-2xl font-medium text-slate-300 max-w-2xl mx-auto">
          From source code to syntax tree.
        </p>

        <p className="text-xs sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed px-2">
          Demystify how programming languages work under the hood. Inspect the exact step-by-step
          transformation from raw source code into tokens, hierarchical Abstract Syntax Trees, and
          semantic scopes in real time — 100% in your browser.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 max-w-md mx-auto sm:max-w-none">
          <button
            onClick={() => onNavigate('workspace')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ruby-500 hover:bg-ruby-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-ruby-500/30 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <span>Open Parser Workspace</span>
          </button>

          <button
            onClick={() => onNavigate('examples')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-navy-700 transition-all"
          >
            <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <span>Explore Examples & Tests</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            The 5-Stage Compilation Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Following the architecture of the <i>Parser Building Overview</i> reference presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
          {pipelineStages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div
                key={i}
                className="relative bg-navy-850 rounded-2xl border border-navy-750 p-4 flex flex-col justify-between hover:border-ruby-500/40 transition-all shadow-panel group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-navy-800 text-slate-400 border border-navy-700">
                      Step {i + 1}
                    </span>
                    <span className="text-[11px] font-mono text-ruby-400 font-semibold">
                      {stage.badge}
                    </span>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-750 border border-navy-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-ruby-400" />
                  </div>

                  <h3 className="font-bold text-slate-100 text-xs sm:text-sm mb-1">{stage.title}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Key Architectural Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Built as a real browser-based language engine with zero mockups or fake outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-navy-850 rounded-2xl border border-navy-750/90 p-4 sm:p-5 hover:border-navy-650 transition-all shadow-panel space-y-2"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-ruby-500/10 border border-ruby-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-ruby-400" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base">{feat.title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ruby Focus & Educational Purpose Note */}
      <div className="bg-navy-900 rounded-2xl border border-navy-750 p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2 max-w-2xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <BookOpen className="w-5 h-5 text-ruby-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Why Ruby-like Syntax for Learning?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Ruby's elegant syntax — featuring explicit <code className="text-ruby-400 bg-navy-800 px-1 py-0.5 rounded">def ... end</code> blocks, 
            intuitive conditional branches, clean method invocations, and straightforward assignment semantics — 
            provides an ideal educational medium for learning parser construction without getting bogged down in delimiter syntax.
          </p>
        </div>

        <button
          onClick={() => onNavigate('workspace')}
          className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ruby-500 hover:bg-ruby-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
        >
          <span>Launch Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
