
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
        // Tự động phân tích các node để tạo form ở cột trái
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
    <div className="h-full w-full bg-[#fcfcfd] dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans p-4 md:p-6 lg:p-8 flex items-start justify-center overflow-y-auto no-scrollbar transition-colors duration-500 relative">
      {/* Cấu trúc Grid 12 cột: Cột trái chiếm 4, cột phải chiếm 8 */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: CONFIGURATION (4/12 width) */}
        <div className="md:col-span-4 flex flex-col gap-4">
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

        {/* RIGHT PANEL: RESULTS & TEMPLATES (8/12 width) */}
        <div className="md:col-span-8">
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
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-brand-blue animate-spin" strokeWidth={1.5} />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/30 animate-pulse" size={24} />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white animate-pulse italic">Synchronizing Mesh Lattice</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic text-center">Fetching workflow configuration detail...</p>
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
