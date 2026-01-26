
import React, { useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { useWorkflowEditorV2 } from '../../hooks/useWorkflowEditorV2';
import { WorkflowTemplate } from '../../hooks/useAetherFlow';
import { EditorNode } from './editor/EditorNode';
import { EditorHeader } from './editor/EditorHeader';
import { EditorBottomBar } from './editor/EditorBottomBar';
import { NodesMapSidebar } from './editor/NodesMapSidebar';
import { ViewportToolbar } from './editor/ViewportToolbar';

interface WorkflowEditorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  template: WorkflowTemplate | null;
}

const nodeTypes = {
  custom: EditorNode,
};

const V2EditorContent: React.FC<{ 
  template: WorkflowTemplate | null; 
  onClose: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
}> = ({ template, onClose, isSidebarOpen, setIsSidebarOpen }) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    toggleNodeVisibility,
  } = useWorkflowEditorV2(template);

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden bg-[#050507]">
      <EditorHeader template={template} nodeCount={nodes.length} onClose={onClose} />
      
      <div className="flex-grow flex flex-row relative">
        <NodesMapSidebar 
          nodes={nodes} 
          onToggleVisibility={toggleNodeVisibility} 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        <div className="flex-grow relative overflow-hidden">
          <ReactFlow
            nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} nodeTypes={nodeTypes} colorMode="dark" fitView
          >
            <Background variant={BackgroundVariant.Lines} color="#ffffff05" gap={40} size={1} />
            <Controls position="bottom-left" className="bg-[#1a1b23] border-white/5 p-1 rounded-xl" />
            <MiniMap position="bottom-right" className="bg-[#1a1b23] border border-white/10 rounded-2xl" nodeColor="#6366f1" maskColor="rgba(0,0,0,0.8)" />
          </ReactFlow>

          <ViewportToolbar />
          
          <div className="absolute top-6 left-6 p-4 bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-xl rounded-xl z-50">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Advanced_Orchestrator_V2</span>
             </div>
          </div>
        </div>
      </div>
      
      <EditorBottomBar onClose={onClose} />
    </div>
  );
};

export const WorkflowEditorModalV2: React.FC<WorkflowEditorModalV2Props> = ({ isOpen, onClose, template }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 30 }} className="relative w-full h-full bg-[#050507] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col">
        <ReactFlowProvider>
          <V2EditorContent template={template} onClose={onClose} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </ReactFlowProvider>
      </motion.div>
    </div>
  );
};
