import React, { useState } from 'react';
import { Copy, Check, Download, FileJson, Code } from 'lucide-react';
import { useParser } from '../context/ParserContext';

export const ASTJsonView: React.FC = () => {
  const { ast } = useParser();
  const [copied, setCopied] = useState(false);

  if (!ast) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <FileJson className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-semibold text-slate-300">No AST to Serialize</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Parse valid Ruby source code to inspect the generated JSON AST.
        </p>
      </div>
    );
  }

  const jsonString = JSON.stringify(ast, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ruby-ast.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting for JSON string
  const formatJsonColored = (json: string) => {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-blue-300'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-ruby-400 font-semibold'; // key
          } else {
            cls = 'text-emerald-300'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-amber-400'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-slate-500'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden font-mono text-xs">
      {/* JSON Toolbar */}
      <div className="flex items-center justify-between p-3 bg-navy-800 border-b border-navy-750">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-ruby-400" />
          <span className="text-xs font-semibold text-slate-200">
            AST JSON Representation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
            title="Copy AST JSON"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-status-success" />
                <span className="text-status-success">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
            title="Download JSON File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* JSON Content with syntax styling */}
      <div className="flex-1 p-4 bg-navy-950 overflow-auto max-h-[500px]">
        <pre
          className="leading-5 whitespace-pre selection:bg-ruby-500/30"
          dangerouslySetInnerHTML={{ __html: formatJsonColored(jsonString) }}
        />
      </div>
    </div>
  );
};
