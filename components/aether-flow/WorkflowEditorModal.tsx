
import React, { useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor';
import { WorkflowTemplate } from '../../hooks/useAetherFlow';
import { EditorNode } from './editor/EditorNode';
import { EditorHeader } from './editor/EditorHeader';
import { EditorBottomBar } from './editor/EditorBottomBar';
import { EditorHUD } from './editor/EditorHUD';
import { NodesMapSidebar } from './editor/NodesMapSidebar';
import { ViewportToolbar } from './editor/ViewportToolbar';

interface WorkflowEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: WorkflowTemplate | null;
}

const nodeTypes = {
  custom: EditorNode,
};

export const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = ({ isOpen, onClose, template }) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    toggleNodeVisibility,
  } = useWorkflowEditor(template);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 50 }}
          className="relative w-full h-full bg-[#0d0d10] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl flex flex-col transition-colors duration-500"
        >
          <EditorHeader 
            template={template} 
            nodeCount={nodes.length} 
            onClose={onClose} 
          />

          <div className="flex-grow flex flex-row relative bg-[#111114]">
             <ReactFlowProvider>
                <NodesMapSidebar 
                  nodes={nodes} 
                  onToggleVisibility={toggleNodeVisibility} 
                  isOpen={isSidebarOpen}
                  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <div className="flex-grow relative overflow-hidden">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      nodeTypes={nodeTypes}
                      colorMode="dark"
                      fitView
                    >
                      <Background variant={BackgroundVariant.Lines} color="#1c1c22" gap={40} size={1} />
                      <Controls position="bottom-left" className="bg-[#1a1b23] border-white/5 p-1 rounded-xl" />
                      <MiniMap 
                        position="bottom-right" 
                        className="bg-[#1a1b23] border border-white/10 rounded-2xl overflow-hidden shadow-2xl" 
                        nodeColor={(node) => (node.data as any).headerColor === 'bg-amber-900' ? '#f59e0b' : '#0090ff'}
                        maskColor="rgba(0,0,0,0.6)"
                      />
                    </ReactFlow>

                    <EditorHUD />
                    <ViewportToolbar />
                </div>
             </ReactFlowProvider>
          </div>

          <EditorBottomBar onClose={onClose} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
