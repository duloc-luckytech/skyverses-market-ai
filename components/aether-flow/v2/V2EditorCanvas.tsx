
import React from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import { EditorNode } from '../editor/EditorNode';
import { ViewportToolbar } from '../editor/ViewportToolbar';

const nodeTypes = {
  custom: EditorNode,
};

interface V2EditorCanvasProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
}

export const V2EditorCanvas: React.FC<V2EditorCanvasProps> = ({
  nodes, edges, onNodesChange, onEdgesChange, onConnect
}) => {
  return (
    <div className="flex-grow relative overflow-hidden bg-slate-100 dark:bg-[#050507] transition-colors duration-500">
      <ReactFlow
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange}
        onConnect={onConnect} 
        nodeTypes={nodeTypes} 
        colorMode="system" 
        fitView
        fitViewOptions={{ padding: 0.5, minZoom: 0.08 }}
        minZoom={0.05}
        maxZoom={2}
        onlyRenderVisibleElements={true}
      >
        <Background variant={BackgroundVariant.Lines} color="#8881" gap={40} size={1} />
        <Controls position="bottom-left" className="bg-white dark:bg-[#1a1b23] border border-black/5 dark:border-white/5 p-1 rounded-none shadow-lg" />
        <MiniMap position="bottom-right" className="bg-white dark:bg-[#1a1b23] border border-black/5 dark:border-white/10 rounded-none shadow-2xl" nodeColor="#6366f1" maskColor="rgba(0,0,0,0.1)" />
      </ReactFlow>

      <ViewportToolbar />
    </div>
  );
};
