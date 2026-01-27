
import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { motion } from 'framer-motion';
import { useWorkflowEditorV2 } from '../../hooks/useWorkflowEditorV2';
import { WorkflowTemplate } from '../../hooks/useAetherFlow';

// Sub-components
import { V2EditorHeader } from './v2/V2EditorHeader';
import { V2EditorFooter } from './v2/V2EditorFooter';
import { V2EditorCanvas } from './v2/V2EditorCanvas';
import { NodesMapSidebar } from './editor/NodesMapSidebar';

interface WorkflowEditorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  template: WorkflowTemplate | null;
}

const V2EditorContent: React.FC<{ 
  template: WorkflowTemplate | null; 
  onClose: () => void;
}> = ({ template, onClose }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    toggleNodeVisibility,
  } = useWorkflowEditorV2(template);

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden h-full">
      <V2EditorHeader 
        template={template} 
        nodeCount={nodes.length} 
        onClose={onClose} 
      />
      
      <div className="flex-grow flex flex-row relative h-full">
        <NodesMapSidebar 
          nodes={nodes} 
          onToggleVisibility={toggleNodeVisibility} 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        <V2EditorCanvas 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </div>
      
      <V2EditorFooter onClose={onClose} />
    </div>
  );
};

export const WorkflowEditorModalV2: React.FC<WorkflowEditorModalV2Props> = ({ isOpen, onClose, template }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 overflow-hidden">
      {/* Background Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/40 dark:bg-black/98 backdrop-blur-3xl" 
        onClick={onClose} 
      />
      
      {/* Main Studio Container - FULL WIDTH/HEIGHT - NO BORDER - NO RADIUS */}
      <motion.div 
        initial={{ scale: 1.02, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 1.02, opacity: 0 }} 
        className="relative w-full h-full bg-white dark:bg-[#050507] shadow-none flex flex-col transition-colors duration-500 overflow-hidden"
      >
        <ReactFlowProvider>
          <V2EditorContent template={template} onClose={onClose} />
        </ReactFlowProvider>
      </motion.div>
    </div>
  );
};
