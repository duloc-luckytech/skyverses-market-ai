
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, Zap, X, RefreshCw, History as HistoryIcon, Clock, Edit3, Download, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import ImageLibraryModal from './ImageLibraryModal';

// Sub-components
import { EventSidebar } from './event-studio/EventSidebar';
import { EventViewport } from './event-studio/EventViewport';
import { EventHistory } from './event-studio/EventHistory';
import { EventConfiguration } from './event-studio/EventConfiguration';

// Types & Hook
import { EventConfig } from '../constants/event-configs';
import { useEventStudio } from '../hooks/useEventStudio';

interface EventStudioWorkspaceProps {
  config: EventConfig;
  onClose: () => void;
}

const EventStudioWorkspace: React.FC<EventStudioWorkspaceProps> = ({ config, onClose }) => {
  const s = useEventStudio(config);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `event_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full flex bg-[#fcfcfd] dark:bg-[#08080a] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 relative">
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative h-full">
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {s.isMobileExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => s.setIsMobileExpanded(false)} 
              className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" 
            />
          )}
        </AnimatePresence>

        {/* SIDEBAR */}
        <aside className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[380px] shrink-0 bg-white dark:bg-[#0d0e12] border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-2xl transition-all duration-500 ease-in-out ${s.isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-[150px] lg:h-full lg:rounded-none'}`}>
          <MobileGeneratorBar 
            isExpanded={s.isMobileExpanded} 
            setIsExpanded={s.setIsMobileExpanded}
            prompt={s.prompt} 
            setPrompt={s.setPrompt} 
            credits={s.credits} 
            totalCost={s.selectedModel.cost * s.quantity}
            isGenerating={s.isRequesting} // Use short-lived requesting state for button feedback
            isGenerateDisabled={s.isGenerateDisabled}
            onGenerate={s.handleGenerate} 
            onOpenLibrary={() => s.setIsLibraryOpen(true)}
            generateLabel="KHỞI CHẠY" 
            type="image"
            tooltip={s.generateTooltip}
          />

          <div className={`flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 pb-48 ${!s.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <EventSidebar 
              config={config} 
              sourceImages={s.sourceImages} 
              removeSourceImage={s.removeSourceImage}
              onUpload={() => fileInputRef.current?.click()}
              onOpenLibrary={() => s.setIsLibraryOpen(true)}
              isUploading={s.isUploading}
              selectedSubject={s.selectedSubject}
              setSelectedSubject={s.setSelectedSubject}
              selectedScenes={s.selectedScenes}
              setSelectedScenes={s.setSelectedScenes}
              prompt={s.prompt}
              setPrompt={s.setPrompt}
            />
            
            <EventConfiguration 
              selectedModel={s.selectedModel}
              setSelectedModel={s.setSelectedModel}
              selectedRatio={s.selectedRatio}
              setSelectedRatio={s.setSelectedRatio}
              selectedRes={s.selectedRes}
              setSelectedRes={s.setSelectedRes}
              quantity={s.quantity}
              setQuantity={s.setQuantity}
              usagePreference={s.usagePreference}
              credits={s.credits}
              onShowResource={() => s.setShowResourceModal(true)}
            />
          </div>

          <div className={`p-6 pb-12 lg:pb-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0 ${!s.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
             <button 
               onClick={s.handleGenerate} 
               disabled={s.isGenerateDisabled}
               className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${s.isGenerateDisabled ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 grayscale' : `bg-${config.accentColor}-600 text-white shadow-${config.accentColor}-500/20`}`}
             >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {s.isRequesting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                TỔNG HỢP {config.id.toUpperCase()}
             </button>
          </div>
        </aside>

        {/* VIEWPORT */}
        <main className="flex-grow flex flex-col relative bg-[#f8f9fb] dark:bg-[#020205] transition-colors duration-500 overflow-hidden h-full">
           {/* Unified Header: Title + Tabs */}
           <div className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-black/40 backdrop-blur-xl z-40 shrink-0">
             {/* Title on left */}
             <div className="flex items-center gap-4">
                <div className={`w-1.5 h-6 rounded-full bg-${config.accentColor}-500 shadow-[0_0_10px_rgba(var(--tw-color-${config.accentColor}-500),0.5)]`}></div>
                <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none whitespace-nowrap">
                  {config.name} <span className="text-[10px] opacity-40 font-bold ml-2 hidden sm:inline tracking-[0.2em]">NODE_042</span>
                </h2>
             </div>

             {/* Tabs in center */}
             <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10">
               <button 
                 onClick={() => s.setActiveTab('CURRENT')}
                 className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${s.activeTab === 'CURRENT' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white'}`}
               >
                 Phòng Lab
               </button>
               <button 
                 onClick={() => s.setActiveTab('HISTORY')}
                 className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${s.activeTab === 'HISTORY' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white'}`}
               >
                 Lịch sử
               </button>
             </div>

             {/* Small tabs for mobile */}
             <div className="md:hidden flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-full border border-black/5 dark:border-white/10 mr-4">
               <button onClick={() => s.setActiveTab('CURRENT')} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${s.activeTab === 'CURRENT' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-sm' : 'text-slate-400'}`}>Lab</button>
               <button onClick={() => s.setActiveTab('HISTORY')} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${s.activeTab === 'HISTORY' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-sm' : 'text-slate-400'}`}>History</button>
             </div>
             
             {/* Actions on right */}
             <div className="flex items-center gap-2">
               {s.activeTab === 'HISTORY' && (
                 <button onClick={s.fetchHistory} className="p-2 text-slate-400 hover:text-brand-blue transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                   <RefreshCw size={16} className={s.isFetchingHistory ? 'animate-spin' : ''} />
                 </button>
               )}
               <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-black/5 dark:bg-white/5 rounded-full">
                 <X size={20} />
               </button>
             </div>
           </div>

           <div className="flex-grow overflow-y-auto no-scrollbar relative p-6 md:p-12 flex flex-col items-center">
             <AnimatePresence mode="wait">
               {s.activeTab === 'CURRENT' ? (
                 <motion.div key="viewport-current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center h-full">
                   <EventViewport 
                     config={config}
                     activeResult={s.activeResultId ? s.results.find(r => r.id === s.activeResultId) || null : null}
                     isGenerating={s.isGenerating}
                     onClose={onClose}
                     accentColor={config.accentColor}
                     onEdit={(url) => { s.setEditorImage(url); s.setIsEditorOpen(true); }}
                     onDownload={handleDownload}
                   />
                 </motion.div>
               ) : (
                 <motion.div key="viewport-history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-6xl space-y-12">
                   <div className="space-y-4 px-1">
                      <div className="flex items-center gap-3 text-brand-blue"><HistoryIcon size={20} /></div>
                      <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Kho lưu trữ <span className="text-brand-blue">Cloud.</span></h2>
                      <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest italic opacity-60">Toàn bộ tác phẩm của bạn được lưu trữ an toàn trong sổ cái sáng tạo.</p>
                   </div>

                   {s.isFetchingHistory ? (
                     <div className="py-40 flex flex-col items-center justify-center gap-4 opacity-40">
                        <Loader2 className="animate-spin text-brand-blue" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Đang đồng bộ dữ liệu...</p>
                     </div>
                   ) : s.historyResults.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                        {s.historyResults.map((res) => (
                           <div key={res.id} className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl group transition-all hover:border-brand-blue/30">
                              <div className="aspect-[3/4] relative overflow-hidden bg-black cursor-pointer" onClick={() => { s.setActiveResultId(res.id); s.setResults(prev => [...prev, res]); s.setActiveTab('CURRENT'); }}>
                                 <img src={res.url!} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" alt="" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                 <div className="absolute top-4 left-4 bg-brand-blue text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase">8K MASTER</div>
                              </div>
                              <div className="p-6 space-y-4">
                                 <div className="space-y-1">
                                    <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white truncate italic">"{res.prompt}"</h4>
                                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest"><Clock size={10} /> {res.timestamp}</div>
                                 </div>
                                 <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                                    <button onClick={() => { s.setEditorImage(res.url!); s.setIsEditorOpen(true); }} className="flex-grow bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2"><Edit3 size={12}/> Edit</button>
                                    <button onClick={() => res.url && handleDownload(res.url)} className="p-2 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-all rounded-lg"><Download size={14}/></button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                   ) : (
                     <div className="py-40 text-center opacity-10 flex flex-col items-center gap-6 select-none grayscale">
                        <Database size={100} strokeWidth={1} />
                        <p className="textxl font-black uppercase tracking-[0.5em]">Lịch sử trống</p>
                     </div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </main>

        {/* HISTORY SIDEBAR (DESKTOP) */}
        {s.activeTab === 'CURRENT' && (
          <EventHistory 
            results={s.results} 
            activeId={s.activeResultId} 
            onSelect={s.setActiveResultId} 
          />
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={s.handleUpload} />

      <ImageLibraryModal 
        isOpen={s.isLibraryOpen} 
        onClose={() => s.setIsLibraryOpen(false)} 
        onConfirm={(assets) => {
          s.addLibraryImages(assets);
          s.setIsLibraryOpen(false);
        }}
      />

      <ProductImageWorkspace 
        isOpen={s.isEditorOpen} 
        onClose={() => s.setIsEditorOpen(false)} 
        initialImage={s.editorImage} 
        onApply={(url) => {
          s.setResults(prev => [{ id: `edit-${Date.now()}`, url, status: 'done', prompt: 'Edited', timestamp: 'Vừa xong', cost: 0 }, ...prev]);
          s.setActiveResultId(`edit-${Date.now()}`);
          s.setIsEditorOpen(false);
        }}
      />

      <ResourceAuthModal 
        isOpen={s.showResourceModal} 
        onClose={() => s.setShowResourceModal(false)} 
        onConfirm={(pref) => { s.setUsagePreference(pref); s.setShowResourceModal(false); }} 
        hasPersonalKey={!!localStorage.getItem('skyverses_model_vault')}
      />

      <AnimatePresence>
        {s.showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-3xl transition-colors">
              <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]"><AlertTriangle size={48} /></div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">Bạn cần ít nhất **{s.selectedModel.cost * s.quantity} credits** để bắt đầu chu trình này.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link to="/credits" className="bg-brand-blue text-white py-5 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all text-center">Nạp thêm Credits</Link>
                <button onClick={() => s.setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest underline underline-offset-8 decoration-white/20">Bỏ qua</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventStudioWorkspace;
