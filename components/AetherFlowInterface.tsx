import React, { useState } from 'react';
import { useAetherFlow, WorkflowTemplate } from '../hooks/useAetherFlow';
import { ConfigPanel } from './aether-flow/ConfigPanel';
import { ResultsPanel } from './aether-flow/ResultsPanel';
import { SettingsDrawer } from './aether-flow/SettingsDrawer';

const AetherFlowInterface: React.FC = () => {
  const flow = useAetherFlow();
  const [showSettings, setShowSettings] = useState(false);

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
    flow.setWorkflowId(tmpl.id);
    if (tmpl.config) {
      handleImport(tmpl.config);
    }
  };

  return (
    <div className="h-full w-full bg-[#fcfcfd] dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans p-4 md:p-6 lg:p-8 flex items-start justify-center overflow-y-auto no-scrollbar transition-colors duration-500">
      <div className="w-full flex flex-col md:flex-row gap-6 items-stretch">
        
        {/* LEFT PANEL: CONFIGURATION */}
        <div className="flex-1 flex flex-col gap-4">
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

        {/* RIGHT PANEL: RESULTS & TEMPLATES */}
        <ResultsPanel 
          results={flow.results}
          generationTime={flow.generationTime}
          isGenerating={flow.isGenerating}
          statusText={flow.statusText}
          workflowId={flow.workflowId}
          onSelectTemplate={handleSelectTemplate}
          onClear={() => flow.setResults([])}
        />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AetherFlowInterface;