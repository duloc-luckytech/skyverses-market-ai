
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ImageIcon, Sparkles, Download, Share2, Loader2, 
  Activity, LayoutGrid, Plus, Heart, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedResult, WorkflowTemplate } from '../../hooks/useAetherFlow';
import { TemplateCard } from './TemplateCard';

interface ResultsPanelProps {
  results: GeneratedResult[];
  generationTime: number;
  isGenerating: boolean; 
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
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  results, 
  generationTime, 
  isGenerating, 
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
  onClear 
}) => {
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'TEMPLATES'>('TEMPLATES');
  
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
    <div className="w-full bg-white dark:bg-[#0c0c12] border border-black/5 dark:border-white/5 rounded-2xl p-0 flex flex-col shadow-2xl overflow-hidden transition-all duration-500 h-[85vh]">
      <div className="border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('RESULTS')}
            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'RESULTS' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <LayoutGrid size={14} /> Output Results {results.length > 0 && `(${results.length})`}
            </div>
            {activeTab === 'RESULTS' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
          </button>
          <button 
            onClick={() => setActiveTab('TEMPLATES')}
            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'TEMPLATES' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={14} /> Workflow Library
            </div>
            {activeTab === 'TEMPLATES' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 md:p-8 no-scrollbar relative transition-colors bg-white dark:bg-[#0c0c12]">
        <AnimatePresence mode="wait">
          {activeTab === 'RESULTS' ? (
            <motion.div 
              key="results-content"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center gap-10 text-center">
                  <div className="relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-indigo-500/20 border-t-indigo-500 flex items-center justify-center" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity size={32} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-lg md:text-xl font-black uppercase tracking-[0.6em] text-indigo-500 dark:text-indigo-400 animate-pulse italic">{statusText.toUpperCase()}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30 text-center select-none">
                  <Activity size={80} strokeWidth={1} className="text-indigo-400 animate-pulse" />
                  <p className="text-lg font-bold text-slate-800 dark:text-gray-400 uppercase tracking-widest">No Active Sessions</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20">
                  {results.map((res) => (
                    <div key={res.id} className="group relative bg-slate-50 dark:bg-[#1c1c24] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-all">
                      <img src={res.url} className="w-full aspect-square object-cover" alt="Output" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-[10px] font-bold text-white uppercase italic">{res.timestamp}</span>
                        <div className="flex gap-2">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-md transition-colors text-white"><Download size={16} /></a>
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
              className="space-y-10 pb-20"
            >
              <div className="flex justify-between items-end px-1">
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Workflow Registry</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Cửa ngõ kịch bản RunningHub Pro</p>
                </div>
                <button 
                  onClick={() => onOpenVisualEditor(null)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all italic group"
                >
                  <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
                  Custom Workflow
                </button>
              </div>

              {loadingTemplates && page === 1 ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
                  <Loader2 size={48} className="animate-spin text-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Đang đồng bộ Registry...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                    <div className="flex justify-center py-10">
                       <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-indigo-500" size={32} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading more nodes...</span>
                       </div>
                    </div>
                  )}

                  {!hasMore && templates.length > 0 && (
                    <div className="text-center py-10 opacity-20 italic">
                      <p className="text-[10px] font-black uppercase tracking-[0.6em]">End of Registry</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-8 py-5 bg-slate-50 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 transition-colors">
        {activeTab === 'RESULTS' && results.length > 0 && !isGenerating && (
          <button onClick={onClear} className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 hover:text-red-500 transition-colors italic">Purge operational output</button>
        )}
        <div className="ml-auto flex items-center gap-6 text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
           <span className="flex items-center gap-1.5"><ImageIcon size={10} /> {results.length} images</span>
           <span className="flex items-center gap-1.5 italic underline decoration-indigo-500/30">{generationTime}s total</span>
        </div>
      </div>
    </div>
  );
};
