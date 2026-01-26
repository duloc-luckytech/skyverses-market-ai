
import React, { useState } from 'react';
import { useAetherFlow, WorkflowTemplate } from '../../hooks/useAetherFlow';
import { ConfigPanel } from './ConfigPanel';
import { ResultsPanel } from './ResultsPanel';
import { SettingsDrawer } from './SettingsDrawer';
import { WorkflowEditorModal } from './WorkflowEditorModal';
import { WorkflowEditorModalV2 } from './WorkflowEditorModalV2';
import { Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AetherFlowInterface: React.FC = () => {
  const flow = useAetherFlow();
  const [showSettings, setShowSettings] = useState(false);
  const [visualEditorTemplate, setVisualEditorTemplate] = useState<WorkflowTemplate | null>(null);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [isVisualEditorV2Open, setIsVisualEditorV2Open] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const handleSelectTemplate = async (tmpl: WorkflowTemplate) => {
    flow.setWorkflowId(tmpl.templateId);
    setIsFetchingDetail(true);
    try {
      const detail = await flow.fetchWorkflowDetail(tmpl.templateId);
      if (detail) {
        await flow.handleImport(JSON.stringify(detail));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleOpenVisualEditor = async (tmpl: WorkflowTemplate | null) => {
    if (tmpl) {
      setIsFetchingDetail(true);
      try {
        const detail = await flow.fetchWorkflowDetail(tmpl.templateId);
        setVisualEditorTemplate(detail ? { ...tmpl, config: JSON.stringify(detail) } : tmpl);
      } catch (err) {
        setVisualEditorTemplate(tmpl);
      } finally {
        setIsFetchingDetail(false);
      }
    } else {
      setVisualEditorTemplate(null);
    }
    setIsVisualEditorOpen(true);
  };

  const handleOpenVisualEditorV2 = async (tmpl: WorkflowTemplate) => {
    setIsFetchingDetail(true);
    try {
      const detail = await flow.fetchWorkflowDetail(tmpl.templateId);
      setVisualEditorTemplate(detail ? { ...tmpl, config: JSON.stringify(detail) } : tmpl);
      setIsVisualEditorV2Open(true);
    } catch (err) {
      console.error(err);
      setVisualEditorTemplate(tmpl);
      setIsVisualEditorV2Open(true);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#fcfcfd] dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans p-4 md:p-6 lg:p-8 flex items-start justify-center overflow-y-auto no-scrollbar relative transition-colors duration-500">
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1 flex flex-col gap-4">
          <SettingsDrawer 
            isOpen={showSettings} apiKey={flow.apiKey} setApiKey={flow.saveApiKey}
            showApiKey={flow.showApiKey} setShowApiKey={flow.setShowApiKey}
          />
          <ConfigPanel 
            workflowId={flow.workflowId} setWorkflowId={flow.setWorkflowId}
            workflowConfig={flow.workflowConfig} updateConfigValue={flow.updateConfigValue}
            apiKey={flow.apiKey} statusText={flow.statusText} isGenerating={flow.isGenerating}
            isUploadingJson={flow.isUploadingJson} showSettings={showSettings}
            setShowSettings={setShowSettings} onImport={flow.handleImport}
            onGenerate={flow.handleGenerate}
          />
        </div>

        <div className="md:col-span-3 h-full">
          <ResultsPanel 
            results={flow.results} generationTime={flow.generationTime}
            isGenerating={flow.isGenerating} statusText={flow.statusText}
            workflowId={flow.workflowId} templates={flow.templates}
            loadingTemplates={flow.loadingTemplates} page={flow.page}
            hasMore={flow.hasMore} isFetchingMore={flow.isFetchingMore}
            loadMoreTemplates={flow.loadMoreTemplates} onSelectTemplate={handleSelectTemplate}
            onOpenVisualEditor={handleOpenVisualEditor} 
            onOpenVisualEditorV2={handleOpenVisualEditorV2}
            onClear={() => flow.setResults([])}
          />
        </div>
      </div>

      <WorkflowEditorModal 
        isOpen={isVisualEditorOpen} 
        onClose={() => { setIsVisualEditorOpen(false); setVisualEditorTemplate(null); }} 
        template={visualEditorTemplate} 
      />

      <WorkflowEditorModalV2 
        isOpen={isVisualEditorV2Open} 
        onClose={() => { setIsVisualEditorV2Open(false); setVisualEditorTemplate(null); }} 
        template={visualEditorTemplate} 
      />

      <AnimatePresence>
        {isFetchingDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400/30 animate-pulse" size={24} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic animate-pulse">Synchronizing Registry...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AetherFlowInterface;
