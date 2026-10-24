import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Maximize2,
  Minimize2,
  Box,
} from 'lucide-react';
import { useParser } from '../context/ParserContext';
import { ASTNode } from '../parser/astTypes';

interface ASTTreeNodeProps {
  node: ASTNode;
  name?: string;
  depth?: number;
  expandedMap: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  selectedNodeId?: string;
  onSelectNode: (node: ASTNode) => void;
}

const getNodeBadgeColor = (type: string) => {
  switch (type) {
    case 'Program':
      return 'bg-slate-700/60 text-slate-200 border-slate-600';
    case 'MethodDefinition':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    case 'IfStatement':
    case 'ElsifBranch':
    case 'ElseBranch':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'Assignment':
      return 'bg-ruby-500/20 text-ruby-400 border-ruby-500/40';
    case 'BinaryExpression':
    case 'ComparisonExpression':
    case 'UnaryExpression':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    case 'NumberLiteral':
    case 'StringLiteral':
    case 'BooleanLiteral':
    case 'NilLiteral':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'Identifier':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    case 'PutsStatement':
      return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
    default:
      return 'bg-navy-700 text-slate-300 border-navy-600';
  }
};

const ASTTreeNode: React.FC<ASTTreeNodeProps> = ({
  node,
  name,
  depth = 0,
  expandedMap,
  toggleExpand,
  selectedNodeId,
  onSelectNode,
}) => {
  if (!node) return null;

  const isExpanded = expandedMap[node.id] !== false;
  const isSelected = selectedNodeId === node.id;

  const children: { label: string; node: ASTNode }[] = [];

  switch (node.type) {
    case 'Program':
      node.body.forEach((child, i) => children.push({ label: `stmt[${i}]`, node: child }));
      break;
    case 'MethodDefinition':
      node.parameters.forEach((param, i) =>
        children.push({ label: `param[${i}]`, node: param })
      );
      node.body.forEach((child, i) => children.push({ label: `body[${i}]`, node: child }));
      break;
    case 'IfStatement':
      children.push({ label: 'condition', node: node.condition });
      node.consequent.forEach((child, i) =>
        children.push({ label: `then[${i}]`, node: child })
      );
      node.elsifBranches.forEach((child, i) =>
        children.push({ label: `elsif[${i}]`, node: child })
      );
      if (node.alternate) {
        children.push({ label: 'else', node: node.alternate });
      }
      break;
    case 'ElsifBranch':
      children.push({ label: 'condition', node: node.condition });
      node.body.forEach((child, i) => children.push({ label: `body[${i}]`, node: child }));
      break;
    case 'ElseBranch':
      node.body.forEach((child, i) => children.push({ label: `body[${i}]`, node: child }));
      break;
    case 'Assignment':
      children.push({ label: 'target', node: node.identifier });
      children.push({ label: 'value', node: node.value });
      break;
    case 'BinaryExpression':
    case 'ComparisonExpression':
      children.push({ label: 'left', node: node.left });
      children.push({ label: 'right', node: node.right });
      break;
    case 'UnaryExpression':
      children.push({ label: 'argument', node: node.argument });
      break;
    case 'MethodCall':
      node.arguments.forEach((arg, i) => children.push({ label: `arg[${i}]`, node: arg }));
      break;
    case 'PutsStatement':
      node.arguments.forEach((arg, i) => children.push({ label: `arg[${i}]`, node: arg }));
      break;
    case 'ExpressionStatement':
      children.push({ label: 'expr', node: node.expression });
      break;
  }

  const hasChildren = children.length > 0;

  let summary = '';
  if (node.type === 'Identifier') summary = node.name;
  else if (node.type === 'NumberLiteral') summary = String(node.value);
  else if (node.type === 'StringLiteral') summary = `"${node.value}"`;
  else if (node.type === 'BooleanLiteral') summary = String(node.value);
  else if (node.type === 'NilLiteral') summary = 'nil';
  else if (node.type === 'BinaryExpression' || node.type === 'ComparisonExpression')
    summary = `op: '${node.operator}'`;
  else if (node.type === 'UnaryExpression') summary = `op: '${node.operator}'`;
  else if (node.type === 'MethodDefinition') summary = `name: '${node.name}'`;
  else if (node.type === 'MethodCall') summary = `callee: '${node.callee}'`;

  return (
    <div className="flex flex-col">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node);
        }}
        className={`flex items-center gap-1.5 py-1 px-1.5 sm:px-2 rounded-lg cursor-pointer transition-colors text-xs font-mono group min-w-max ${
          isSelected
            ? 'bg-ruby-500/25 border border-ruby-500/60 text-white font-semibold'
            : 'hover:bg-navy-800 text-slate-300'
        }`}
        style={{ marginLeft: `${depth * 14}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-4 h-4 shrink-0" />
        )}

        {name && (
          <span className="text-slate-500 font-sans text-[10px] sm:text-[11px] mr-1 shrink-0">{name}:</span>
        )}

        <span
          className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold border shrink-0 ${getNodeBadgeColor(
            node.type
          )}`}
        >
          {node.type}
        </span>

        {summary && (
          <span className="text-amber-200 bg-navy-900 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] border border-navy-750 truncate max-w-[140px] sm:max-w-none">
            {summary}
          </span>
        )}

        {node.loc && (
          <span className="text-slate-500 text-[9px] sm:text-[10px] ml-auto pl-2 hidden xs:inline shrink-0">
            L{node.loc.start.line}:{node.loc.start.column}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col border-l border-navy-750 ml-3.5 pl-1">
          {children.map((child, idx) => (
            <ASTTreeNode
              key={`${child.node.id || idx}`}
              node={child.node}
              name={child.label}
              depth={depth + 1}
              expandedMap={expandedMap}
              toggleExpand={toggleExpand}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ASTTree: React.FC = () => {
  const { ast, selectedNode, setSelectedNode } = useParser();
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const expandAll = () => {
    setExpandedMap({});
  };

  const collapseAll = () => {
    if (!ast) return;
    const collapsed: Record<string, boolean> = {};
    const traverse = (node: ASTNode) => {
      collapsed[node.id] = false;
    };
    traverse(ast);
    setExpandedMap(collapsed);
  };

  if (!ast) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-slate-400">
        <Layers className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-semibold text-slate-300">No AST Generated</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Run the parser to construct the hierarchical Abstract Syntax Tree.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden">
      {/* Tree Toolbar */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-navy-800 border-b border-navy-750 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <Box className="w-4 h-4 text-ruby-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            AST Hierarchy Tree
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={expandAll}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 text-[11px] sm:text-xs border border-navy-700 transition-colors"
            title="Expand All Nodes"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden xs:inline">Expand All</span>
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 text-[11px] sm:text-xs border border-navy-700 transition-colors"
            title="Collapse All Nodes"
          >
            <Minimize2 className="w-3 h-3" />
            <span className="hidden xs:inline">Collapse</span>
          </button>
        </div>
      </div>

      {/* Tree Container */}
      <div className="flex-1 p-2.5 sm:p-3 overflow-auto max-h-[500px]">
        <ASTTreeNode
          node={ast}
          expandedMap={expandedMap}
          toggleExpand={toggleExpand}
          selectedNodeId={selectedNode?.id}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      </div>

      {/* Selected Node Details Bar */}
      {selectedNode && (
        <div className="p-2.5 sm:p-3 bg-navy-900 border-t border-navy-750 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-400">Node:</span>
            <span className="text-ruby-400 font-bold">{selectedNode.type}</span>
            <span className="text-slate-500 hidden xs:inline">({selectedNode.id})</span>
          </div>
          <span className="text-slate-400 shrink-0 text-[10px] sm:text-xs">
            L{selectedNode.loc.start.line}:{selectedNode.loc.start.column} – L{selectedNode.loc.end.line}:{selectedNode.loc.end.column}
          </span>
        </div>
      )}
    </div>
  );
};
