
import React, { useState, useEffect } from 'react';
import { ImageIcon, Sparkles, Download, Share2, Loader2, Activity, LayoutGrid, Film, Box, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedResult, WORKFLOW_TEMPLATES, WorkflowTemplate } from '../../hooks/useAetherFlow';

interface ResultsPanelProps {
  results: GeneratedResult[];
  generationTime: number;
  isGenerating: boolean;
  statusText: string;
  workflowId: string;
  onSelectTemplate: (tmpl: WorkflowTemplate) => void;
  onClear: () => void;
}

const TemplateIcon = ({ type }: { type: WorkflowTemplate['iconType'] }) => {
  switch (type) {
    case 'Cinematic': return <Film size={20} />;
    case 'Anime': return <Sparkles size={20} />;
    case 'Product': return <Box size={20} />;
    case 'Portrait': return <User size={20} />;
    default: return <ImageIcon size={20} />;
  }
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  results, 
  generationTime, 
  isGenerating, 
  statusText,
  workflowId,
  onSelectTemplate,
  onClear 
}) => {
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'TEMPLATES'>('TEMPLATES');

  // Tự động chuyển tab sang RESULTS khi bắt đầu tạo hình
  useEffect(() => {
    if (isGenerating) {
      setActiveTab('RESULTS');
    }
  }, [isGenerating]);

  // Nếu đã có kết quả thì mặc định tab RESULTS, ngược lại TEMPLATES
  useEffect(() => {
    if (results.length > 0 && !isGenerating) {
      setActiveTab('RESULTS');
    } else if (results.length === 0 && !isGenerating) {
      setActiveTab('TEMPLATES');
    }
  }, [results.length]);

  return (
    <div className="flex-[1.5] bg-white dark:bg-[#0c0c12] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-500 h-[85vh]">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center gap-10 text-center">
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-indigo-500/20 border-t-indigo-500 flex items-center justify-center"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity size={32} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg md:text-xl font-black uppercase tracking-[0.6em] text-indigo-500 dark:text-indigo-400 animate-pulse italic">
                      {statusText.toUpperCase()}
                    </p>
                    <div className="w-48 md:w-64 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mx-auto">
                       <motion.div 
                         initial={{ x: '-100%' }}
                         animate={{ x: '100%' }}
                         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                       />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest leading-relaxed px-4">
                      Hệ thống đang điều phối tài nguyên H100 GPU <br /> để thực thi quy trình kịch bản.
                    </p>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30 text-center select-none">
                  <Activity size={80} strokeWidth={1} className="text-indigo-400 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-800 dark:text-gray-400 uppercase tracking-widest">No Active Sessions</p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400 uppercase">Khởi tạo kịch bản từ thư viện để bắt đầu</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20">
                  {results.map((res) => (
                    <div key={res.id} className="group relative bg-slate-50 dark:bg-[#1c1c24] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-all hover:border-indigo-500/50">
                      <img src={res.url} className="w-full aspect-square object-cover" alt="Output" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-[10px] font-bold text-white uppercase italic">{res.timestamp}</span>
                        <div className="flex gap-2">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-md transition-colors shadow-lg text-white">
                            <Download size={16} />
                          </a>
                          <button className="p-2 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-md transition-colors shadow-lg text-white">
                            <Share2 size={16} />
                          </button>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20"
            >
              {WORKFLOW_TEMPLATES.map((tmpl) => {
                const isActive = workflowId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => onSelectTemplate(tmpl)}
                    className={`relative p-6 md:p-8 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-6 group overflow-hidden ${isActive ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'bg-slate-50 dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-indigo-500/20'}`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-indigo-500 text-white shadow-xl scale-110' : 'bg-white dark:bg-white/5 text-slate-400 dark:text-gray-500 group-hover:text-indigo-500 shadow-sm'}`}>
                        <TemplateIcon type={tmpl.iconType} />
                      </div>
                      {isActive && (
                        <div className="px-4 py-1.5 bg-indigo-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg flex items-center gap-2">
                           <CheckCircle2 size={12} /> Active Node
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 relative z-10">
                      <h4 className={`text-lg md:text-xl font-black uppercase italic tracking-tighter transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{tmpl.name}</h4>
                      <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest leading-relaxed">"{tmpl.description}"</p>
                    </div>

                    <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-600 relative z-10">
                       <span>Workflow Config</span>
                       <span className={isActive ? 'text-indigo-500 dark:text-indigo-400' : ''}>{isActive ? 'Selected' : 'Use Preset'}</span>
                    </div>

                    {/* Gradient Ambient Background */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-indigo-500/10 to-transparent`}></div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-8 py-5 bg-slate-50 dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 transition-colors">
        {activeTab === 'RESULTS' && results.length > 0 && !isGenerating && (
          <button 
            onClick={onClear}
            className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 hover:text-red-500 transition-colors italic"
          >
            Purge operational output
          </button>
        )}
        <div className="ml-auto flex items-center gap-6 text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
           <span className="flex items-center gap-1.5"><ImageIcon size={10} /> {results.length} images</span>
           <span className="flex items-center gap-1.5 italic underline decoration-indigo-500/30">{generationTime}s total</span>
        </div>
      </div>
    </div>
  );
};
