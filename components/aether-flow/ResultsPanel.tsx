
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ImageIcon, Sparkles, Download, Share2, Loader2, 
  Activity, LayoutGrid, Plus, Heart, Play, FileJson, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedResult, WorkflowTemplate } from '../../hooks/useAetherFlow';
import { TemplateCard } from './TemplateCard';
import { ImportWorkflowModal } from './ImportWorkflowModal';

interface ResultsPanelProps {
  results: GeneratedResult[];
  generationTime: number;
  isGenerating: boolean; 
  isUploadingJson: boolean;
  statusText: string;
  workflowId: string;
  templates: WorkflowTemplate[];
  loadingTemplates: boolean;
  page: number;
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMoreTemplates: () => void;
  onSelectTemplate: (tmpl: WorkflowTemplate) => void;
  onOpenVisualEditor: (tmpl: WorkflowTemplate | null) => void;
  onOpenVisualEditorV2: (tmpl: WorkflowTemplate) => void;
  onClear: () => void;
  onImport: (input: File | string) => Promise<any>;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  results, 
  generationTime, 
  isGenerating, 
  isUploadingJson,
  statusText,
  workflowId,
  templates,
  loadingTemplates,
  page,
  hasMore,
  isFetchingMore,
  loadMoreTemplates,
  onSelectTemplate,
  onOpenVisualEditor,
  onOpenVisualEditorV2,
  onClear,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'TEMPLATES'>('TEMPLATES');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTemplateRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingTemplates || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTemplates();
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingTemplates, isFetchingMore, hasMore, loadMoreTemplates]);

  useEffect(() => {
    if (isGenerating) setActiveTab('RESULTS');
  }, [isGenerating]);

  return (
    <div className="w-full bg-white dark:bg-[#0c0c12] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-0 flex flex-col shadow-3xl overflow-hidden transition-all duration-500 h-[88vh]">
      
      {/* TABS HEADER */}
      <div className="border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0">
        <div className="flex h-16">
          <button 
            onClick={() => setActiveTab('RESULTS')}
            className={`flex-1 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'RESULTS' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
          >
            <LayoutGrid size={14} /> Output Results {results.length > 0 && `(${results.length})`}
            {activeTab === 'RESULTS' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />}
          </button>
          <button 
            onClick={() => setActiveTab('TEMPLATES')}
            className={`flex-1 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'TEMPLATES' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
          >
            <Sparkles size={14} /> Workflow Library
            {activeTab === 'TEMPLATES' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar relative transition-colors bg-white dark:bg-[#0c0c12]">
        <AnimatePresence mode="wait">
          {activeTab === 'RESULTS' ? (
            <motion.div 
              key="results-content"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center gap-12 text-center">
                  <div className="relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-28 h-28 md:w-40 md:h-40 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center shadow-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity size={48} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xl md:text-3xl font-black uppercase tracking-[0.6em] text-indigo-500 dark:text-indigo-400 animate-pulse italic">{statusText.toUpperCase()}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-10 opacity-20 text-center select-none">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                     <Activity size={60} strokeWidth={1} />
                  </div>
                  <p className="text-xl font-black text-slate-800 dark:text-gray-400 uppercase tracking-[0.5em] italic">Viewport Offline</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                  {results.map((res) => (
                    <div key={res.id} className="group relative bg-slate-50 dark:bg-[#14141a] border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30">
                      <img src={res.url} className="w-full aspect-square object-cover transition-all duration-1000 group-hover:scale-105" alt="Output" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Render Sequence Completed</span>
                           <span className="text-[10px] font-bold text-white uppercase italic opacity-60">{res.timestamp}</span>
                        </div>
                        <div className="flex gap-2">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 hover:bg-brand-blue rounded-full backdrop-blur-md transition-all text-white"><Download size={18} /></a>
                          <button className="p-3 bg-white/20 hover:bg-brand-blue rounded-full backdrop-blur-md transition-all text-white"><Share2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="templates-content"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-12 pb-32"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-1">
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-indigo-500">
                      <Sparkles size={24} />
                      <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white leading-none">Workflow Registry</h3>
                   </div>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] leading-none italic">KHO QUY TRÌNH KIẾN TRÚC SƯ</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsImportModalOpen(true)}
                    disabled={isUploadingJson || isGenerating}
                    className="flex-1 sm:flex-none px-8 py-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-3 shadow-sm italic group"
                  >
                    {isUploadingJson ? <Loader2 size={16} className="animate-spin" /> : <FileJson size={16} />}
                    <span className="hidden xs:inline">Import JSON</span>
                  </button>
                  <button 
                    onClick={() => onOpenVisualEditor(null)}
                    className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all italic group"
                  >
                    <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
                    Custom Workflow
                  </button>
                </div>
              </div>

              {loadingTemplates && page === 1 ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
                  <Loader2 size={60} className="animate-spin text-indigo-500" />
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] animate-pulse">Synchronizing Registry...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {templates.map((tmpl, idx) => {
                      const isLast = idx === templates.length - 1;
                      return (
                        <div key={tmpl._id} ref={isLast ? lastTemplateRef : null}>
                          <TemplateCard 
                            tmpl={tmpl}
                            isActive={workflowId === tmpl.templateId}
                            onSelect={onSelectTemplate}
                            onOpenVisualEditor={onOpenVisualEditor}
                            onOpenVisualEditorV2={onOpenVisualEditorV2}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  {isFetchingMore && (
                    <div className="flex justify-center py-16">
                       <Loader2 className="animate-spin text-indigo-500" size={40} />
                    </div>
                  )}

                  {!hasMore && templates.length > 0 && (
                    <div className="text-center py-20 opacity-20 italic">
                      <p className="text-[12px] font-black uppercase tracking-[0.8em]">End of Registry Manifest</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-10 py-6 bg-slate-50 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 transition-colors z-30">
        {activeTab === 'RESULTS' && results.length > 0 && !isGenerating && (
          <button 
            onClick={onClear} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors italic group"
          >
            <Trash2 size={14} className="group-hover:rotate-12 transition-transform" /> Purge operational output
          </button>
        )}
        <div className="ml-auto flex items-center gap-10 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
           <span className="flex items-center gap-2.5"><ImageIcon size={14} className="text-brand-blue" /> {results.length} Artifacts Synced</span>
           <span className="flex items-center gap-2.5 italic"><Activity size={14} className="text-brand-blue animate-pulse" /> {generationTime}s Operational cycle</span>
        </div>
      </div>

      <ImportWorkflowModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImport}
      />
    </div>
  );
};
