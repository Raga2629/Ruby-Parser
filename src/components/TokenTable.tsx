import React, { useState } from 'react';
import { Search, Eye, Tag } from 'lucide-react';
import { useParser } from '../context/ParserContext';
import { Token, TokenType } from '../parser/tokenTypes';

export const TokenTable: React.FC = () => {
  const { tokens, selectedToken, setSelectedToken } = useParser();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getTokenCategory = (type: TokenType): string => {
    switch (type) {
      case 'DEF':
      case 'END':
      case 'IF':
      case 'ELSE':
      case 'ELSIF':
      case 'TRUE':
      case 'FALSE':
      case 'NIL':
        return 'keyword';
      case 'PUTS':
        return 'builtin';
      case 'INTEGER':
      case 'FLOAT':
      case 'STRING':
        return 'literal';
      case 'PLUS':
      case 'MINUS':
      case 'STAR':
      case 'SLASH':
      case 'PERCENT':
      case 'EQUAL':
      case 'EQUAL_EQUAL':
      case 'BANG_EQUAL':
      case 'LESS':
      case 'LESS_EQUAL':
      case 'GREATER':
      case 'GREATER_EQUAL':
        return 'operator';
      case 'IDENTIFIER':
        return 'identifier';
      case 'LPAREN':
      case 'RPAREN':
      case 'COMMA':
      case 'NEWLINE':
      case 'SEMICOLON':
        return 'delimiter';
      case 'COMMENT':
        return 'comment';
      case 'ERROR':
        return 'error';
      default:
        return 'other';
    }
  };

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'keyword':
        return 'bg-ruby-500/20 text-ruby-400 border-ruby-500/30';
      case 'literal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'builtin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'operator':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'identifier':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'comment':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'error':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
    }
  };

  const filteredTokens = tokens.filter((token) => {
    if (token.type === 'EOF') return false;
    const category = getTokenCategory(token.type);
    if (categoryFilter !== 'all' && category !== categoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        token.type.toLowerCase().includes(q) ||
        token.value.toLowerCase().includes(q) ||
        String(token.line).includes(q)
      );
    }
    return true;
  });

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-slate-400">
        <Tag className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-semibold text-slate-300">No Tokens Available</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Click "Parse Code" in the editor to run the lexer and generate the token stream.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden">
      {/* Controls Bar */}
      <div className="p-2.5 sm:p-3 bg-navy-800 border-b border-navy-750 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ruby-500"
            />
          </div>

          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {filteredTokens.length} tokens
          </span>
        </div>

        {/* Filter Pills - Scrollable horizontally on mobile */}
        <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar pb-0.5">
          {['all', 'keyword', 'identifier', 'literal', 'operator', 'delimiter'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors shrink-0 ${
                categoryFilter === cat
                  ? 'bg-ruby-500 text-white font-medium shadow-sm'
                  : 'bg-navy-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tokens Table */}
      <div className="flex-1 overflow-auto max-h-[500px]">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="sticky top-0 bg-navy-900 text-slate-400 border-b border-navy-750 select-none z-10 text-[11px]">
            <tr>
              <th className="py-2 px-2.5 w-10 font-medium">#</th>
              <th className="py-2 px-2.5 font-medium">Type</th>
              <th className="py-2 px-2.5 font-medium">Lexeme</th>
              <th className="py-2 px-2 font-medium w-12 text-center">Ln</th>
              <th className="py-2 px-2 font-medium w-12 text-center">Col</th>
              <th className="py-2 px-2.5 font-medium w-24 hidden md:table-cell">Offsets</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {filteredTokens.map((token, index) => {
              const category = getTokenCategory(token.type);
              const isSelected =
                selectedToken &&
                selectedToken.line === token.line &&
                selectedToken.column === token.column &&
                selectedToken.value === token.value;

              return (
                <tr
                  key={`${token.line}-${token.column}-${index}`}
                  onClick={() => setSelectedToken(token)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-ruby-500/20 text-white font-semibold'
                      : 'hover:bg-navy-800/80 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-2.5 text-slate-500 text-[11px]">{index + 1}</td>
                  <td className="py-2 px-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold border ${getBadgeStyle(
                        category
                      )}`}
                    >
                      {token.type}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-slate-200 font-bold max-w-[140px] sm:max-w-[200px] truncate">
                    {token.type === 'NEWLINE' ? (
                      <span className="text-slate-500 italic font-normal">\\n</span>
                    ) : token.type === 'STRING' ? (
                      <span className="text-emerald-300">"{token.value}"</span>
                    ) : (
                      token.value
                    )}
                  </td>
                  <td className="py-2 px-2 text-slate-400 text-center">{token.line}</td>
                  <td className="py-2 px-2 text-slate-400 text-center">{token.column}</td>
                  <td className="py-2 px-2.5 text-slate-500 text-[10px] hidden md:table-cell">
                    [{token.startOffset}..{token.endOffset}]
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Token Detail Footer */}
      {selectedToken && (
        <div className="p-2.5 sm:p-3 bg-navy-900 border-t border-navy-750 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <Eye className="w-3.5 h-3.5 text-ruby-400 shrink-0" />
            <span className="text-slate-300">Token:</span>
            <span className="text-ruby-400 font-bold">{selectedToken.type}</span>
            <span className="text-slate-400 truncate">('{selectedToken.value}')</span>
          </div>
          <span className="text-slate-500 shrink-0">
            Ln {selectedToken.line}, Col {selectedToken.column}
          </span>
        </div>
      )}
    </div>
  );
};
