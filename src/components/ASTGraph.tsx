import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Move,
  GitBranch,
} from 'lucide-react';
import { useParser } from '../context/ParserContext';
import { ASTNode } from '../parser/astTypes';

interface GraphLayoutNode {
  id: string;
  astNode: ASTNode;
  label: string;
  type: string;
  summary: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: GraphLayoutNode[];
}

interface Edge {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
}

export const ASTGraph: React.FC = () => {
  const { ast, selectedNode, setSelectedNode } = useParser();

  const [scale, setScale] = useState<number>(0.9);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Build Layout Graph
  const { layoutTree, edges, bounds } = useMemo(() => {
    if (!ast) return { layoutTree: null, edges: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };

    const NODE_WIDTH = 140;
    const NODE_HEIGHT = 58;
    const HORIZONTAL_GAP = 24;
    const VERTICAL_GAP = 80;

    let leafIndex = 0;

    const getNodeSummary = (node: ASTNode): string => {
      if (node.type === 'Identifier') return node.name;
      if (node.type === 'NumberLiteral') return String(node.value);
      if (node.type === 'StringLiteral') return `"${node.value}"`;
      if (node.type === 'BooleanLiteral') return String(node.value);
      if (node.type === 'NilLiteral') return 'nil';
      if (node.type === 'BinaryExpression' || node.type === 'ComparisonExpression')
        return `op: ${node.operator}`;
      if (node.type === 'UnaryExpression') return `op: ${node.operator}`;
      if (node.type === 'MethodDefinition') return `def ${node.name}`;
      if (node.type === 'MethodCall') return `${node.callee}()`;
      if (node.type === 'Assignment') return '=';
      return '';
    };

    const getChildren = (node: ASTNode): ASTNode[] => {
      const list: ASTNode[] = [];
      switch (node.type) {
        case 'Program':
          return node.body;
        case 'MethodDefinition':
          return [...node.parameters, ...node.body];
        case 'IfStatement': {
          const arr: ASTNode[] = [node.condition, ...node.consequent, ...node.elsifBranches];
          if (node.alternate) arr.push(node.alternate);
          return arr;
        }
        case 'ElsifBranch':
          return [node.condition, ...node.body];
        case 'ElseBranch':
          return node.body;
        case 'Assignment':
          return [node.identifier, node.value];
        case 'BinaryExpression':
        case 'ComparisonExpression':
          return [node.left, node.right];
        case 'UnaryExpression':
          return [node.argument];
        case 'MethodCall':
        case 'PutsStatement':
          return node.arguments;
        case 'ExpressionStatement':
          return [node.expression];
      }
      return list;
    };

    const buildLayoutNode = (node: ASTNode, depth: number): GraphLayoutNode => {
      const rawChildren = getChildren(node);
      const childLayouts = rawChildren.map((c) => buildLayoutNode(c, depth + 1));

      let x = 0;
      if (childLayouts.length === 0) {
        x = leafIndex * (NODE_WIDTH + HORIZONTAL_GAP);
        leafIndex++;
      } else {
        const first = childLayouts[0].x;
        const last = childLayouts[childLayouts.length - 1].x;
        x = (first + last) / 2;
      }

      const y = depth * (NODE_HEIGHT + VERTICAL_GAP) + 30;

      return {
        id: node.id,
        astNode: node,
        label: node.type,
        type: node.type,
        summary: getNodeSummary(node),
        x,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        children: childLayouts,
      };
    };

    const root = buildLayoutNode(ast, 0);

    const edgeList: Edge[] = [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const traverseCollect = (n: GraphLayoutNode) => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x + n.width);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y + n.height);

      for (const child of n.children) {
        edgeList.push({
          from: { x: n.x + n.width / 2, y: n.y + n.height },
          to: { x: child.x + child.width / 2, y: child.y },
        });
        traverseCollect(child);
      }
    };

    traverseCollect(root);

    return {
      layoutTree: root,
      edges: edgeList,
      bounds: { minX, maxX, minY, maxY },
    };
  }, [ast]);

  // Mouse Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Pan handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setScale(0.9);
    setOffset({ x: 20, y: 20 });
  };

  const handleFit = () => {
    if (!containerRef.current || !bounds) return;
    const containerW = containerRef.current.clientWidth || 600;
    const containerH = containerRef.current.clientHeight || 400;
    const graphW = bounds.maxX - bounds.minX + 60;
    const graphH = bounds.maxY - bounds.minY + 60;

    const s = Math.min(1.2, Math.max(0.25, Math.min(containerW / graphW, containerH / graphH)));
    setScale(s);
    setOffset({
      x: (containerW - graphW * s) / 2 - bounds.minX * s,
      y: 15,
    });
  };

  const getNodeColor = (type: string, isSelected: boolean) => {
    if (isSelected) {
      return {
        bg: '#F04452',
        border: '#F87171',
        text: '#FFFFFF',
      };
    }
    switch (type) {
      case 'Program':
        return { bg: '#202C40', border: '#3D5276', text: '#F8FAFC' };
      case 'MethodDefinition':
        return { bg: '#2D1B4E', border: '#8B5CF6', text: '#E9D5FF' };
      case 'IfStatement':
      case 'ElsifBranch':
      case 'ElseBranch':
        return { bg: '#3C2812', border: '#F59E0B', text: '#FDE68A' };
      case 'Assignment':
        return { bg: '#3B1720', border: '#F43F5E', text: '#FECDD3' };
      case 'BinaryExpression':
      case 'ComparisonExpression':
      case 'UnaryExpression':
        return { bg: '#172554', border: '#3B82F6', text: '#BFDBFE' };
      case 'NumberLiteral':
      case 'StringLiteral':
      case 'BooleanLiteral':
      case 'NilLiteral':
        return { bg: '#064E3B', border: '#10B981', text: '#A7F3D0' };
      case 'Identifier':
        return { bg: '#164E63', border: '#06B6D4', text: '#CFFAFE' };
      default:
        return { bg: '#182235', border: '#2A3B57', text: '#F8FAFC' };
    }
  };

  const renderNodes = (node: GraphLayoutNode): React.ReactNode => {
    const isSelected = selectedNode?.id === node.id;
    const colors = getNodeColor(node.type, isSelected);

    return (
      <React.Fragment key={node.id}>
        <g
          transform={`translate(${node.x}, ${node.y})`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNode(node.astNode);
          }}
          className="cursor-pointer group select-none transition-transform"
        >
          <rect
            width={node.width}
            height={node.height}
            rx={8}
            fill={colors.bg}
            stroke={colors.border}
            strokeWidth={isSelected ? 2.5 : 1.5}
            className="filter drop-shadow group-hover:brightness-125 transition-all"
          />

          <text
            x={10}
            y={22}
            fill={colors.text}
            fontSize={11}
            fontWeight="bold"
            fontFamily="monospace"
            className="pointer-events-none"
          >
            {node.type.length > 14 ? node.type.slice(0, 13) + '…' : node.type}
          </text>

          {node.summary && (
            <text
              x={10}
              y={40}
              fill="#FBBF24"
              fontSize={10}
              fontFamily="monospace"
              fontWeight="500"
              className="pointer-events-none"
            >
              {node.summary.length > 15 ? node.summary.slice(0, 14) + '…' : node.summary}
            </text>
          )}

          <text
            x={node.width - 8}
            y={node.height - 8}
            fill="#94A3B8"
            fontSize={8}
            fontFamily="monospace"
            textAnchor="end"
            className="pointer-events-none opacity-80"
          >
            L{node.astNode.loc.start.line}
          </text>
        </g>

        {node.children.map((child) => renderNodes(child))}
      </React.Fragment>
    );
  };

  if (!ast || !layoutTree) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-slate-400">
        <GitBranch className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="font-semibold text-slate-300">No Graph Diagram Available</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Parse code to construct the visual node-and-edge syntax graph.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-navy-850 rounded-2xl border border-navy-750 overflow-hidden select-none">
      {/* Graph Toolbar */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-navy-800 border-b border-navy-750 z-10 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <GitBranch className="w-4 h-4 text-ruby-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            AST Visual Graph
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
            className="p-1 sm:p-1.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.2, s - 0.15))}
            className="p-1 sm:p-1.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1 sm:p-1.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
            title="Fit to Screen"
            aria-label="Fit to Screen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 sm:p-1.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-slate-400 ml-1 hidden xs:inline">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 min-h-[300px] sm:min-h-[400px] bg-navy-950 overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      >
        <svg
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(42, 59, 87, 0.25) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <defs>
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#F04452" />
            </marker>
          </defs>

          <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {edges.map((edge, i) => {
              const deltaY = edge.to.y - edge.from.y;
              const pathD = `M ${edge.from.x} ${edge.from.y} C ${edge.from.x} ${
                edge.from.y + deltaY * 0.5
              }, ${edge.to.x} ${edge.to.y - deltaY * 0.5}, ${edge.to.x} ${edge.to.y}`;

              return (
                <path
                  key={i}
                  d={pathD}
                  fill="none"
                  stroke="#3D5276"
                  strokeWidth="1.5"
                  markerEnd="url(#graph-arrow)"
                />
              );
            })}

            {renderNodes(layoutTree)}
          </g>
        </svg>

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-navy-900/90 border border-navy-750 text-[10px] text-slate-400 font-mono pointer-events-none">
          <Move className="w-3 h-3" />
          <span>Drag to pan • Tap node to inspect</span>
        </div>
      </div>
    </div>
  );
};
