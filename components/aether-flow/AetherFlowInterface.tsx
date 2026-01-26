
import React, { useState } from 'react';
import { useAetherFlow, WorkflowTemplate } from '../../hooks/useAetherFlow';
import { ConfigPanel } from './ConfigPanel';
import { ResultsPanel } from './ResultsPanel';
import { SettingsDrawer } from './SettingsDrawer';
import { WorkflowEditorModal } from './WorkflowEditorModal';

const AetherFlowInterface: React.FC = () => {
  const flow = useAetherFlow();
  const [showSettings, setShowSettings] = useState(false);
  const [visualEditorTemplate, setVisualEditorTemplate] = useState<WorkflowTemplate | null>(null);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);

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

  const handleSelectTemplate = (tmpl: WorkflowTemplate) => {
    flow.setWorkflowId(tmpl.templateId); // Dùng templateId từ API
    if (tmpl.config) {
      handleImport(tmpl.config);
    } else {
       // Nếu không có config thô, ta chỉ set ID để chạy qua API RunningHub
       flow.setWorkflowId(tmpl.templateId);
    }
  };

  const handleOpenVisualEditor = (tmpl: WorkflowTemplate | null) => {
    setVisualEditorTemplate(tmpl);
    setIsVisualEditorOpen(true);
  };

  const handleCloseVisualEditor = () => {
    setIsVisualEditorOpen(false);
    setVisualEditorTemplate(null);
  };

  return (
    <div className="h-full w-full bg-[#fcfcfd] dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans p-4 md:p-6 lg:p-8 flex items-start justify-center overflow-y-auto no-scrollbar transition-colors duration-500">
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* LEFT PANEL: CONFIGURATION (Occupies 1/4 width) */}
        <div className="md:col-span-1 flex flex-col gap-4">
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
            onImport={handleImport}
            onGenerate={handleGenerate}
          />
        </div>

        {/* RIGHT PANEL: RESULTS & TEMPLATES (Occupies 3/4 width) */}
        <div className="md:col-span-3 h-full">
          <ResultsPanel 
            results={flow.results}
            generationTime={flow.generationTime}
            isGenerating={flow.isGenerating}
            statusText={flow.statusText}
            workflowId={flow.workflowId}
            templates={flow.templates}
            loadingTemplates={flow.loadingTemplates}
            onSelectTemplate={handleSelectTemplate}
            onOpenVisualEditor={handleOpenVisualEditor}
            onClear={() => flow.setResults([])}
          />
        </div>
      </div>

      <WorkflowEditorModal 
        isOpen={isVisualEditorOpen}
        onClose={handleCloseVisualEditor}
        template={visualEditorTemplate}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AetherFlowInterface;
