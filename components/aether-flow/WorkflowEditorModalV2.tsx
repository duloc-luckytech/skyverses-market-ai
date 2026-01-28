
import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowEditorV2 } from '../../hooks/useWorkflowEditorV2';
import { WorkflowTemplate } from '../../hooks/useAetherFlow';
import { ChevronLeft, X } from 'lucide-react';

// Sub-components
import { V2EditorHeader } from './v2/V2EditorHeader';
import { V2EditorFooter } from './v2/V2EditorFooter';
import { V2EditorCanvas } from './v2/V2EditorCanvas';
import { NodesMapSidebar } from './editor/NodesMapSidebar';
import { TaskListSidebar } from './v2/TaskListSidebar';

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
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  
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
        
        <div className="flex-grow relative flex">
          <V2EditorCanvas 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          />

          {/* TASK LIST TOGGLE BUTTON (Right Edge) */}
          <AnimatePresence>
            {!isTaskListOpen && (
              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onClick={() => setIsTaskListOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-[100] h-32 w-10 bg-white dark:bg-[#1a1b23] border border-r-0 border-black/5 dark:border-white/10 rounded-l-2xl shadow-2xl flex flex-col items-center justify-center gap-2 group transition-all hover:w-12"
              >
                <div className="flex flex-col items-center gap-1.5">
                   <ChevronLeft size={16} className="text-brand-blue group-hover:-translate-x-0.5 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 text-slate-500 dark:text-gray-400 group-hover:text-brand-blue">
                     Task List
                   </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          <TaskListSidebar 
            isOpen={isTaskListOpen} 
            onClose={() => setIsTaskListOpen(false)} 
          />
        </div>
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
