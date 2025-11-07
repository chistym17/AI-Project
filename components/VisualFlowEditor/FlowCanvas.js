import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ToolNode from './ToolNode';

const nodeTypes = {
  toolNode: ToolNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#10b981',
  },
  style: {
    stroke: '#10b981',
    strokeWidth: 2,
  },
  animated: true,
  labelStyle: { fill: '#9ca3af', fontWeight: 500 },
  labelBgStyle: { fill: '#1f2937', fillOpacity: 0.8 },
};

// Custom connection line style with green
const connectionLineStyle = {
  stroke: '#10b981',
  strokeWidth: 2,
  strokeDasharray: '5 5',
};

// -------------------- Condition Builder (inline, no visual restyle) --------------------
function ConditionRow({ row, onChange, onRemove }) {
  const type = row.when || 'user.contains';
  return (
    <div className="flex items-center gap-2 mb-2">
      <select
        value={type}
        onChange={(e) => onChange({ ...row, when: e.target.value })}
        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
      >
        <option value="user.contains">user.contains</option>
        <option value="user.regex">user.regex</option>
        <option value="intent_is">intent_is</option>
        <option value="tool.ok">tool.ok</option>
        <option value="parameters.has">parameters.has</option>
        <option value="parameters.equals">parameters.equals</option>
        <option value="tool.field_equals">tool.field_equals</option>
      </select>

      {/* Fields by type */}
      {type === 'user.contains' && (
        <input
          placeholder='value'
          value={row.value || ''}
          onChange={(e) => onChange({ ...row, value: e.target.value })}
          className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
        />
      )}

      {type === 'user.regex' && (
        <input
          placeholder='regex'
          value={row.value || ''}
          onChange={(e) => onChange({ ...row, value: e.target.value })}
          className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
        />
      )}

      {type === 'intent_is' && (
        <input
          placeholder='intent name'
          value={row.value || ''}
          onChange={(e) => onChange({ ...row, value: e.target.value })}
          className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
        />
      )}

      {type === 'tool.ok' && (
        <span className="text-xs text-slate-400 px-1">✓ true when tool returns ok: true</span>
      )}

      {type === 'parameters.has' && (
        <input
          placeholder='key'
          value={row.key || ''}
          onChange={(e) => onChange({ ...row, key: e.target.value })}
          className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
        />
      )}

      {type === 'parameters.equals' && (
        <>
          <input
            placeholder='key'
            value={row.key || ''}
            onChange={(e) => onChange({ ...row, key: e.target.value })}
            className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
          />
          <input
            placeholder='value'
            value={row.value ?? ''}
            onChange={(e) => onChange({ ...row, value: e.target.value })}
            className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
          />
        </>
      )}

      {type === 'tool.field_equals' && (
        <>
          <input
            placeholder='path (e.g. data.status)'
            value={row.path || ''}
            onChange={(e) => onChange({ ...row, path: e.target.value })}
            className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
          />
          <input
            placeholder='value'
            value={row.value ?? ''}
            onChange={(e) => onChange({ ...row, value: e.target.value })}
            className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
          />
        </>
      )}

      <button
        onClick={onRemove}
        className="px-2 py-1 text-xs border border-slate-700 rounded text-slate-300 hover:bg-slate-700"
        title="Remove condition"
      >
        Remove
      </button>
    </div>
  );
}

function ConditionModal({ edge, onSave, onClose, onDeleteEdge }) {
  const [mode, setMode] = useState(() => {
    const c = edge?.data?.condition;
    if (!c) return 'single';
    if (c.any) return 'any';
    if (c.all) return 'all';
    if (c.not) return 'not';
    return 'single';
  });

  const [rows, setRows] = useState(() => {
    const c = edge?.data?.condition;
    if (!c) return [{ when: 'user.contains', value: '' }];
    if (c.any) return Array.isArray(c.any) ? c.any.slice() : [{ when: 'user.contains', value: '' }];
    if (c.all) return Array.isArray(c.all) ? c.all.slice() : [{ when: 'user.contains', value: '' }];
    if (c.not) return [c.not];
    return [c];
  });

  const addRow = () => setRows((r) => [...r, { when: 'user.contains', value: '' }]);
  const updateRow = (idx, val) => setRows((r) => r.map((x, i) => (i === idx ? val : x)));
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));

  const buildCondition = () => {
    // Build JSON shape the router expects
    const cleaned = rows.map((r) => {
      const { when } = r;
      if (when === 'tool.ok') return { when: 'tool.ok' };
      if (when === 'parameters.has') return { when: 'parameters.has', key: r.key || '' };
      if (when === 'parameters.equals') return { when: 'parameters.equals', key: r.key || '', value: r.value ?? '' };
      if (when === 'tool.field_equals') return { when: 'tool.field_equals', path: r.path || '', value: r.value ?? '' };
      // user.contains, user.regex, intent_is
      return { when, value: r.value || '' };
    });

    if (mode === 'single') {
      return cleaned[0] || { when: 'user.contains', value: '' };
    }
    if (mode === 'any') {
      return { any: cleaned };
    }
    if (mode === 'all') {
      return { all: cleaned };
    }
    if (mode === 'not') {
      return { not: cleaned[0] || { when: 'user.contains', value: '' } };
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-[520px] max-w-[90vw] p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-200 text-sm font-semibold">
            Edge Condition
          </div>
          <button
            className="px-2 py-1 text-xs border border-slate-700 rounded text-slate-300 hover:bg-slate-700"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="text-xs text-slate-400 mb-2">
          <div><b>Source:</b> {edge?.source?.replace('reactflow_', '')}</div>
          <div><b>Target:</b> {edge?.target?.replace('reactflow_', '')}</div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-slate-300 mr-2">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs"
          >
            <option value="single">Single</option>
            <option value="any">ANY (or)</option>
            <option value="all">ALL (and)</option>
            <option value="not">NOT</option>
          </select>
        </div>

        <div className="max-h-[46vh] overflow-auto pr-1">
          {rows.map((row, idx) => (
            <ConditionRow
              key={idx}
              row={row}
              onChange={(val) => updateRow(idx, val)}
              onRemove={() => removeRow(idx)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={addRow}
            className="px-3 py-1 text-xs border border-slate-700 rounded text-slate-300 hover:bg-slate-700"
          >
            + Add condition
          </button>
          <div className="flex gap-2">
            <button
              onClick={onDeleteEdge}
              className="px-3 py-1 text-xs border border-red-500 text-red-300 rounded hover:bg-red-600/10"
              title="Delete entire edge"
            >
              Delete Edge
            </button>
            <button
              onClick={() => onSave(null)}
              className="px-3 py-1 text-xs border border-slate-700 rounded text-slate-300 hover:bg-slate-700"
              title="Clear"
            >
              Clear
            </button>
            <button
              onClick={() => onSave(buildCondition())}
              className="px-3 py-1 text-xs border border-emerald-500 text-emerald-300 rounded hover:bg-emerald-600/10"
            >
              Save
            </button>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-500">
          Examples: {"{ when:'user.contains', value:'rate' }"}, {"{ any:[...] }"}, {"{ all:[...] }"}, {"{ when:'tool.ok' }"}
        </div>
      </div>
    </div>
  );
}
// --------------------------------------------------------------------------------------

export default function FlowCanvas({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges, 
  selectedNode, 
  setSelectedNode 
}) {
  const [activeEdge, setActiveEdge] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setActiveEdge(null);
    setSelectedEdge(null);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setActiveEdge(null);
    setSelectedEdge(null);
  }, [setSelectedNode]);

  const onNodeDoubleClick = useCallback((event, node) => {
    // Double click to edit
    setSelectedNode(node);
    setActiveEdge(null);
    setSelectedEdge(null);
  }, [setSelectedNode]);

  const onEdgeClick = useCallback((evt, edge) => {
    setActiveEdge(edge);
    setSelectedNode(null);
    setSelectedEdge(edge);
  }, [setSelectedNode]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      let updatedNodes = [...nds];
      
      changes.forEach(change => {
        const nodeIndex = updatedNodes.findIndex(node => node.id === change.id);
        if (nodeIndex === -1) return;
        
        const node = updatedNodes[nodeIndex];
        
        switch (change.type) {
          case 'position':
            if (change.position) {
              updatedNodes[nodeIndex] = {
                ...node,
                position: change.position,
                positionAbsolute: change.positionAbsolute
              };
            }
            break;
          case 'dimensions':
            if (change.dimensions) {
              updatedNodes[nodeIndex] = {
                ...node,
                width: change.dimensions.width,
                height: change.dimensions.height
              };
            }
            break;
          case 'select':
            updatedNodes[nodeIndex] = {
              ...node,
              selected: change.selected
            };
            break;
          case 'remove':
            updatedNodes = updatedNodes.filter(n => n.id !== change.id);
            break;
        }
      });
      
      return updatedNodes;
    });
  }, [setNodes]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      let updatedEdges = [...eds];
      
      changes.forEach(change => {
        const edgeIndex = updatedEdges.findIndex(edge => edge.id === change.id);
        if (edgeIndex === -1) return;
        
        const edge = updatedEdges[edgeIndex];
        
        switch (change.type) {
          case 'select':
            updatedEdges[edgeIndex] = {
              ...edge,
              selected: change.selected
            };
            if (change.selected) {
              setSelectedEdge(edge);
            }
            break;
          case 'remove':
            updatedEdges = updatedEdges.filter(e => e.id !== change.id);
            if (selectedEdge && selectedEdge.id === change.id) {
              setSelectedEdge(null);
              setActiveEdge(null);
            }
            break;
        }
      });
      
      return updatedEdges;
    });
  }, [setEdges, selectedEdge]);

  const onConnect = useCallback((connection) => {
    const newEdge = {
      ...connection,
      id: `edge_${Date.now()}`,
      ...defaultEdgeOptions,
      type: 'smoothstep',
      animated: true,
      data: { condition: null }, // id, source, target first; condition added after click
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const nodesWithSelection = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      selected: selectedNode?.id === node.id,
    }));
  }, [nodes, selectedNode]);

  const edgesWithSelection = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      selected: selectedEdge?.id === edge.id,
      style: {
        ...edge.style,
        stroke: selectedEdge?.id === edge.id ? '#34d399' : edge.style?.stroke || '#10b981',
        strokeWidth: selectedEdge?.id === edge.id ? 3 : edge.style?.strokeWidth || 2,
      }
    }));
  }, [edges, selectedEdge]);

  // Custom styles for dark theme
  const reactFlowStyles = {
    background: '#0f172a',
    height: '100%',
    width: '100%',
  };

  const saveConditionForActive = (cond) => {
    if (!activeEdge) return;
    setEdges((eds) =>
      eds.map((e) =>
        e.id === activeEdge.id
          ? { ...e, data: { ...(e.data || {}), condition: cond || null } }
          : e
      )
    );
    setActiveEdge(null);
  };

  const deleteActiveEdge = () => {
    if (!activeEdge) return;
    setEdges((eds) => eds.filter(e => e.id !== activeEdge.id));
    setActiveEdge(null);
    setSelectedEdge(null);
  };

  return (
    <div className="w-full h-full bg-slate-950">
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edgesWithSelection}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={connectionLineStyle}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.3}
        maxZoom={2.5}
        style={reactFlowStyles}
        selectNodesOnDrag={false}
        panOnDrag={true}
        selectionOnDrag={false}
        multiSelectionKeyCode={null}
        deleteKeyCode="Delete"
        elevateNodesOnSelect={true}
        snapToGrid={true}
        snapGrid={[15, 15]}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="#10b981" 
          gap={60} 
          size={1.5}
          variant="lines"
          style={{ opacity: 0.25 }}
        />
        
        <Controls 
          className="!bg-slate-800 !border-slate-700 !rounded-xl !shadow-2xl"
          showInteractive={false}
          style={{
            button: {
              backgroundColor: '#334155',
              color: '#e2e8f0',
              borderColor: '#475569',
            }
          }}
        />
        
        <MiniMap
          nodeColor={(node) => {
            if (node.selected) return '#10b981';
            return '#475569';
          }}
          className="!bg-slate-800 !border-slate-700 !rounded-xl !shadow-2xl"
          maskColor="rgba(15, 23, 42, 0.7)"
          pannable
          zoomable
          style={{
            backgroundColor: '#1e293b',
            maskColor: 'rgba(15, 23, 42, 0.7)',
          }}
        />

        {/* Zoom indicator */}
        <Panel position="bottom-left" className="!bg-transparent !m-4">
          <div className="bg-slate-800/90 backdrop-blur-sm text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 shadow-xl">
            Nodes: {nodes.length} | Edges: {edges.length}
          </div>
        </Panel>

        {/* Keyboard shortcuts hint */}
        <Panel position="top-right" className="!bg-transparent !m-4">
          <div className="bg-slate-800/90 backdrop-blur-sm text-slate-400 text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Delete</kbd>
                <span>Remove</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Click Edge</kbd>
                <span>Edit Condition</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Drag</kbd>
                <span>Connect</span>
              </span>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {activeEdge && (
        <ConditionModal
          edge={activeEdge}
          onSave={saveConditionForActive}
          onClose={() => setActiveEdge(null)}
          onDeleteEdge={deleteActiveEdge}
        />
      )}
    </div>
  );
}