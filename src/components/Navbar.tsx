import React, { useState } from 'react';
import {
  Code2,
  GitBranch,
  Layers,
  BookOpen,
  Terminal,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';
import { useParser } from '../context/ParserContext';

export interface NavbarProps {
  activePage: 'home' | 'workspace' | 'ast-explorer' | 'examples' | 'architecture';
  setActivePage: (page: 'home' | 'workspace' | 'ast-explorer' | 'examples' | 'architecture') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { runParser, isProcessing, stageStatuses, diagnostics, resetToDefault } = useParser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasErrors =
    stageStatuses.grammar === 'error' ||
    stageStatuses.lexer === 'error' ||
    stageStatuses.parser === 'error' ||
    stageStatuses.semantic === 'error';

  const isAllSuccess =
    stageStatuses.grammar === 'success' &&
    stageStatuses.lexer === 'success' &&
    stageStatuses.parser === 'success' &&
    stageStatuses.semantic === 'success';

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: BookOpen },
    { id: 'workspace' as const, label: 'Workspace', icon: Terminal },
    { id: 'ast-explorer' as const, label: 'AST Explorer', icon: GitBranch },
    { id: 'examples' as const, label: 'Examples & Tests', icon: Code2 },
    { id: 'architecture' as const, label: 'Architecture', icon: Layers },
  ];

  const handleNavClick = (page: typeof activePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur border-b border-navy-700/80 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0 shrink"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-ruby-500 to-ruby-700 flex items-center justify-center shadow-lg shadow-ruby-500/20 group-hover:scale-105 transition-transform shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base lg:text-lg text-slate-100 tracking-tight group-hover:text-white transition-colors truncate">
                Ruby Parser
              </span>
              <span className="hidden xs:inline-block text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-ruby-500/15 text-ruby-400 border border-ruby-500/30 font-medium">
                Visualizer
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden md:block">
              From Syntax to Structure
            </p>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 bg-navy-800/80 p-1 rounded-xl border border-navy-700/60 text-xs sm:text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-ruby-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Status Pill - Hidden on tiny screens */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-navy-800/80 border border-navy-700/80 text-xs">
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span className="text-blue-300 font-mono text-[11px]">Parsing...</span>
              </>
            ) : hasErrors ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-status-error" />
                <span className="text-status-error font-medium text-[11px]">
                  {diagnostics.filter((d) => d.severity === 'error').length} Err
                </span>
              </>
            ) : isAllSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span className="text-status-success font-medium text-[11px]">Valid</span>
              </>
            ) : (
              <span className="text-slate-400 text-[11px]">Ready</span>
            )}
          </div>

          {/* Quick Parse Button */}
          <button
            onClick={() => {
              if (activePage !== 'workspace') setActivePage('workspace');
              runParser();
            }}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-ruby-500 hover:bg-ruby-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-ruby-500/25 active:scale-95 transition-all disabled:opacity-50"
            title="Parse current source code"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span className="inline">Parse</span>
          </button>

          {/* Reset button - desktop */}
          <button
            onClick={resetToDefault}
            className="hidden sm:flex p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-700/60 transition-colors"
            title="Reset code to default example"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-700 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-navy-800 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-ruby-500 text-white shadow-sm'
                      : 'bg-navy-800/90 text-slate-300 hover:bg-navy-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400 px-1">
            <button
              onClick={() => {
                resetToDefault();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 py-1 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Example</span>
            </button>
            <span className="font-mono text-[11px] text-slate-500">v1.0 • Browser Engine</span>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick-Access Bar (Fixed on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur border-t border-navy-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-ruby-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 max-w-[58px] truncate">
                {item.id === 'workspace' ? 'Editor' : item.id === 'ast-explorer' ? 'AST' : item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
