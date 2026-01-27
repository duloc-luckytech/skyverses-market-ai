
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
    <div className="w-full bg-slate-50 dark:bg-[#0c0c0e] rounded-none p-0 flex flex-col h-[88vh] overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none">
      
      {/* TABS HEADER: FLAT BOXES */}
      <div className="bg-slate-200 dark:bg-[#141418] shrink-0 border-b border-black/5 dark:border-none">
        <div className="flex h-16">
          <button 
            onClick={() => setActiveTab('RESULTS')}
            className={`flex-1 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'RESULTS' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.02]'}`}
          >
            <LayoutGrid size={14} /> XEM KẾT QUẢ {results.length > 0 && `(${results.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('TEMPLATES')}
            className={`flex-1 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === 'TEMPLATES' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.02]'}`}
          >
            <Sparkles size={14} /> KHO KỊCH BẢN
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-10 no-scrollbar relative bg-slate-50 dark:bg-[#0c0c0e]">
        <AnimatePresence mode="wait">
          {activeTab === 'RESULTS' ? (
            <motion.div 
              key="results-content"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full"
            >
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center gap-12 text-center">
                  <div className="relative">
                    <div className="w-32 h-32 border-2 border-indigo-500/20 flex items-center justify-center rounded-none">
                      <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-500" size={48} />
                    </div>
                  </div>
                  <p className="text-2xl font-black uppercase tracking-[0.5em] text-indigo-600 dark:text-indigo-500 animate-pulse italic">{statusText}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-10 opacity-10 text-center">
                  <Activity size={80} strokeWidth={1} className="text-slate-900 dark:text-white" />
                  <p className="text-xl font-black uppercase tracking-[0.5em] text-slate-900 dark:text-white">CHƯA CÓ DỮ LIỆU KẾT QUẢ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-32">
                  {results.map((res) => (
                    <div key={res.id} className="group relative bg-white dark:bg-[#14141a] rounded-none overflow-hidden transition-all border border-black/5 dark:border-none hover:ring-1 hover:ring-indigo-600 dark:hover:ring-indigo-500/50">
                      <img src={res.url} className="w-full aspect-square object-cover transition-all duration-1000 group-hover:scale-105" alt="Output" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                        <div className="flex flex-col">
                           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">DỮ LIỆU HOÀN TẤT</span>
                           <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase italic">{res.timestamp}</span>
                        </div>
                        <div className="flex gap-2">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-indigo-600 rounded-none transition-all text-white"><Download size={18} /></a>
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-12 pb-32"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-1">
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-500">
                      <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white leading-none">THƯ VIỆN KỊCH BẢN</h3>
                   </div>
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] leading-none italic">BỘ SƯU TẬP CÔNG NGHIỆP V2</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex-1 sm:flex-none px-8 py-4 bg-slate-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-3 group"
                  >
                    <FileJson size={16} /> NHẬP FILE JSON
                  </button>
                  <button 
                    onClick={() => onOpenVisualEditor(null)}
                    className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/10"
                  >
                    <Plus size={16} strokeWidth={3} /> TỰ THIẾT KẾ
                  </button>
                </div>
              </div>

              {loadingTemplates && page === 1 ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
                  <Loader2 size={48} className="animate-spin text-indigo-600 dark:text-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-900 dark:text-white">ĐANG ĐỒNG BỘ DỮ LIỆU...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                       <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-500" size={32} />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-10 py-6 bg-slate-100 dark:bg-[#08080a] flex items-center justify-between shrink-0 z-30 border-t border-black/5 dark:border-none">
        {activeTab === 'RESULTS' && results.length > 0 && !isGenerating && (
          <button 
            onClick={onClear} 
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-500/60 hover:text-red-700 dark:hover:text-red-500 transition-colors italic"
          >
            XÓA TẤT CẢ KẾT QUẢ
          </button>
        )}
        <div className="ml-auto flex items-center gap-10 text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">
           <span className="flex items-center gap-2.5">SẢN PHẨM ĐÃ TẠO: {results.length}</span>
           <span className="flex items-center gap-2.5 italic">THỜI GIAN CHỜ: {generationTime}s</span>
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
