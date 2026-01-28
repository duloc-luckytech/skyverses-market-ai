import React, { useState } from 'react';
import { useAetherFlow, WorkflowTemplate } from '../hooks/useAetherFlow';
import { ConfigPanel } from './aether-flow/ConfigPanel';
import { ResultsPanel } from './aether-flow/ResultsPanel';
import { SettingsDrawer } from './aether-flow/SettingsDrawer';
import { WorkflowEditorModalV2 } from './aether-flow/WorkflowEditorModalV2';
import { Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AetherFlowInterface: React.FC = () => {
  const flow = useAetherFlow();
  const [showSettings, setShowSettings] = useState(false);
  const [visualEditorTemplate, setVisualEditorTemplate] = useState<WorkflowTemplate | null>(null);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const handleGenerate = async () => {
    try {
      await flow.handleGenerate();
    } catch (error: any) {
      if (error.message.includes('API Key')) {
        setShowSettings(true);
      }
      alert(error.message);
    }
  };

  const handleImport = async (input: File | string) => {
    try {
      await flow.handleImport(input);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSelectTemplate = async (tmpl: WorkflowTemplate) => {
    flow.setWorkflowId(tmpl.templateId);
    setIsFetchingDetail(true);
    try {
      const detail = await flow.fetchWorkflowDetail(tmpl.templateId);
      if (detail) {
        await flow.handleImport(JSON.stringify(detail));
      }
    } catch (err) {
      console.error("Detail Fetch Error", err);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleOpenVisualEditorV2 = async (tmpl: WorkflowTemplate) => {
    setIsFetchingDetail(true);
    try {
      const detail = await flow.fetchWorkflowDetail(tmpl.templateId);
      setVisualEditorTemplate(detail ? { ...tmpl, config: JSON.stringify(detail) } : tmpl);
      setIsVisualEditorOpen(true);
    } catch (err) {
      console.error("Detail Fetch Error", err);
      setVisualEditorTemplate(tmpl);
      setIsVisualEditorOpen(true);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleOpenVisualEditorEmpty = () => {
    setVisualEditorTemplate(null);
    setIsVisualEditorOpen(true);
  };

  const handleCloseVisualEditor = () => {
    setIsVisualEditorOpen(false);
    setVisualEditorTemplate(null);
  };

  return (
    <div className="h-full w-full bg-[#f4f7f9] dark:bg-[#050507] text-slate-700 dark:text-zinc-300 font-sans p-0 flex flex-col transition-all duration-500 relative overflow-hidden">
      {/* 12-Column Industrial Grid - Ép chiều cao h-full để độc lập vùng cuộn */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-0 flex-grow overflow-hidden">
        
        {/* LEFT PANEL: CONFIGURATION (4/12 width) - Cố định và có vùng cuộn riêng */}
        <div className="md:col-span-4 flex flex-col h-full bg-white dark:bg-[#111114] border-r border-black/5 dark:border-white/5 overflow-hidden">
          <SettingsDrawer 
            isOpen={showSettings}
            apiKey={flow.apiKey}
            setApiKey={flow.saveApiKey}
            showApiKey={flow.showApiKey}
            setShowApiKey={flow.setShowApiKey}
          />
          
          <ConfigPanel 
            workflowId={flow.workflowId}
            setWorkflowId={flow.setWorkflowId}
            workflowConfig={flow.workflowConfig}
            updateConfigValue={flow.updateConfigValue}
            apiKey={flow.apiKey}
            statusText={flow.statusText}
            isGenerating={flow.isGenerating}
            isUploadingJson={flow.isUploadingJson}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onGenerate={handleGenerate}
          />
        </div>

        {/* RIGHT PANEL: RESULTS & TEMPLATES (8/12 width) - Cuộn độc lập */}
        <div className="md:col-span-8 h-full bg-slate-50 dark:bg-[#0c0c0e] overflow-hidden">
          <ResultsPanel 
            results={flow.results}
            generationTime={flow.generationTime}
            isGenerating={flow.isGenerating}
            isUploadingJson={flow.isUploadingJson}
            statusText={flow.statusText}
            workflowId={flow.workflowId}
            templates={flow.templates}
            loadingTemplates={flow.loadingTemplates}
            page={flow.page}
            hasMore={flow.hasMore}
            isFetchingMore={flow.isFetchingMore}
            loadMoreTemplates={flow.loadMoreTemplates}
            onSelectTemplate={handleSelectTemplate}
            onOpenVisualEditor={handleOpenVisualEditorEmpty}
            onOpenVisualEditorV2={handleOpenVisualEditorV2}
            onClear={() => flow.setResults([])}
            onImport={handleImport}
          />
        </div>
      </div>

      <WorkflowEditorModalV2 
        isOpen={isVisualEditorOpen}
        onClose={handleCloseVisualEditor}
        template={visualEditorTemplate}
      />

      <AnimatePresence>
        {isFetchingDetail && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 border-2 border-indigo-600/20 dark:border-indigo-500/20 border-t-indigo-600 dark:border-t-indigo-500 rounded-none animate-spin"></div>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white animate-pulse italic">ĐANG ĐỒNG BỘ HỆ THỐNG...</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AetherFlowInterface;