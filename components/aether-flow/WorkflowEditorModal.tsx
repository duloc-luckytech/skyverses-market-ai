
import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
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
import { WorkflowContextMenu } from './editor/WorkflowContextMenu';
import { NodeEditorToolbar } from './editor/NodeEditorToolbar';

interface WorkflowEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: WorkflowTemplate | null;
}

const nodeTypes = {
  custom: EditorNode,
};

const EditorContent: React.FC<{ 
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
    addNode,
    toggleNodeVisibility,
  } = useWorkflowEditor(template);

  const { screenToFlowPosition } = useReactFlow();
  const [menu, setMenu] = useState<{ x: number; y: number; flowX: number; flowY: number } | null>(null);

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setMenu({
        x: event.clientX,
        y: event.clientY,
        flowX: position.x,
        flowY: position.y,
      });
    },
    [screenToFlowPosition]
  );

  const onPaneClick = useCallback(() => setMenu(null), []);

  return (
    <div className="flex-grow flex flex-row relative bg-[#111114]">
      <NodesMapSidebar 
        nodes={nodes} 
        onToggleVisibility={toggleNodeVisibility} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-grow relative overflow-hidden flex flex-col">
          <NodeEditorToolbar onClose={onClose} />
          
          <div className="flex-grow relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onPaneContextMenu={onPaneContextMenu}
              onPaneClick={onPaneClick}
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
          </div>

          <EditorHUD />
          <ViewportToolbar />

          <AnimatePresence>
            {menu && (
              <WorkflowContextMenu 
                x={menu.x} 
                y={menu.y} 
                onClose={() => setMenu(null)}
                onAddNode={() => addNode('Logic', { x: menu.flowX, y: menu.flowY })}
                onAddGroup={() => addNode('Group', { x: menu.flowX, y: menu.flowY })}
              />
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = ({ isOpen, onClose, template }) => {
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
            nodeCount={0} 
            onClose={onClose} 
          />

          <ReactFlowProvider>
            <EditorContent 
              template={template} 
              onClose={onClose}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </ReactFlowProvider>

          <EditorBottomBar onClose={onClose} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
