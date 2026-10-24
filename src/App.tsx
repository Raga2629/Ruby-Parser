import React, { useState } from 'react';
import { ParserProvider } from './context/ParserContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Workspace } from './pages/Workspace';
import { ASTExplorer } from './pages/ASTExplorer';
import { Examples } from './pages/Examples';
import { Architecture } from './pages/Architecture';
import { BookOpen, Terminal, GitBranch, Code2, Layers, Heart } from 'lucide-react';

export type AppPage = 'home' | 'workspace' | 'ast-explorer' | 'examples' | 'architecture';

export function AppContent() {
  const [activePage, setActivePage] = useState<AppPage>('workspace');

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-ruby-500/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main View Router */}
      <main className="flex-1">
        {activePage === 'home' && <Home onNavigate={setActivePage} />}
        {activePage === 'workspace' && <Workspace />}
        {activePage === 'ast-explorer' && <ASTExplorer />}
        {activePage === 'examples' && <Examples onNavigate={setActivePage} />}
        {activePage === 'architecture' && <Architecture />}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-navy-900 border-t border-navy-800 pt-8 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-ruby-500 flex items-center justify-center text-white font-bold text-xs">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-slate-200">Ruby Parser Visualizer</span>
              <span className="text-slate-500 ml-2">From Syntax to Structure</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>•</span>
            <button
              onClick={() => setActivePage('workspace')}
              className="hover:text-white transition-colors"
            >
              Workspace
            </button>
            <span>•</span>
            <button
              onClick={() => setActivePage('ast-explorer')}
              className="hover:text-white transition-colors"
            >
              AST Explorer
            </button>
            <span>•</span>
            <button
              onClick={() => setActivePage('examples')}
              className="hover:text-white transition-colors"
            >
              Examples
            </button>
            <span>•</span>
            <button
              onClick={() => setActivePage('architecture')}
              className="hover:text-white transition-colors"
            >
              Architecture
            </button>
          </div>

          <div className="text-slate-500 text-[11px] font-mono">
            Pure Browser Engine • No External APIs Required
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ParserProvider>
      <AppContent />
    </ParserProvider>
  );
}
