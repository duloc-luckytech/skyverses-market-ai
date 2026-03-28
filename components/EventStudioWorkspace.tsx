
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, Zap, X, RefreshCw, History as HistoryIcon, Clock, Edit3, Download, Database, Sparkles, Heart, Layers, Share2 } from 'lucide-react';
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
  const clothingInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.id}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeResult = s.activeResultId ? s.results.find(r => r.id === s.activeResultId) || null : null;

  return (
    <div className="h-full w-full flex bg-[#fcfcfd] dark:bg-[#050507] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 relative">
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative h-full">
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {s.isMobileExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => s.setIsMobileExpanded(false)} 
              className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" 
            />
          )}
        </AnimatePresence>

        {/* ═══ SIDEBAR ═══ */}
        <aside className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[370px] shrink-0 bg-white dark:bg-[#0c0c0f] border-t lg:border-t-0 lg:border-r border-black/[0.06] dark:border-white/[0.04] flex flex-col z-[150] lg:z-50 shadow-2xl lg:shadow-none transition-all duration-500 ease-in-out ${s.isMobileExpanded ? 'h-[92dvh] rounded-t-[2rem]' : 'h-[150px] lg:h-full lg:rounded-none'}`}>
          <MobileGeneratorBar 
            isExpanded={s.isMobileExpanded} 
            setIsExpanded={s.setIsMobileExpanded}
            prompt={s.prompt} 
            setPrompt={s.setPrompt} 
            credits={s.credits} 
            totalCost={s.currentUnitCost * s.quantity}
            isGenerating={s.isRequesting}
            isGenerateDisabled={s.isGenerateDisabled}
            onGenerate={s.handleGenerate} 
            onOpenLibrary={() => s.setIsLibraryOpen(true)}
            generateLabel="TẠO HÌNH" 
            type="image"
            tooltip={s.generateTooltip}
          />

          <div className={`flex-grow overflow-y-auto no-scrollbar p-5 space-y-5 pb-44 ${!s.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <EventSidebar 
              config={config} 
              sourceImages={s.sourceImages}
              clothingImages={s.clothingImages}
              removeSourceImage={s.removeSourceImage}
              removeClothingImage={s.removeClothingImage}
              onUpload={() => fileInputRef.current?.click()}
              onClothingUpload={() => clothingInputRef.current?.click()}
              onOpenLibrary={() => s.setIsLibraryOpen(true)}
              isUploading={s.isUploading}
              selectedSubject={s.selectedSubject}
              setSelectedSubject={s.setSelectedSubject}
              selectedScenes={s.selectedScenes}
              setSelectedScenes={s.setSelectedScenes}
              selectedStyle={s.selectedStyle}
              setSelectedStyle={s.setSelectedStyle}
              prompt={s.prompt}
              setPrompt={s.setPrompt}
              showTemplates={s.showTemplates}
              setShowTemplates={s.setShowTemplates}
              onApplyTemplate={s.applyTemplate}
              onSuggestPrompt={s.handleSuggestPrompt}
            />
            
            <EventConfiguration 
              availableModels={s.availableModels}
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
              currentUnitCost={s.currentUnitCost}
            />
          </div>

          {/* ── Generate Buttons ── */}
          <div className={`p-5 border-t border-black/[0.04] dark:border-white/[0.04] bg-slate-50/50 dark:bg-black/20 shrink-0 space-y-3 ${!s.isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            {/* Main generate */}
            <button 
              onClick={s.handleGenerate} 
              disabled={s.isGenerateDisabled}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden ${
                s.isGenerateDisabled 
                  ? 'bg-slate-200 dark:bg-white/[0.03] text-slate-400 dark:text-slate-600 border border-black/[0.04] dark:border-white/[0.04]' 
                  : `bg-${config.accentColor}-500 text-white shadow-${config.accentColor}-500/20 hover:brightness-110`
              }`}
            >
              {!s.isGenerateDisabled && (
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              {s.isRequesting ? <Loader2 className="animate-spin" size={16} /> : <Zap size={14} fill="currentColor" />}
              Tổng hợp
            </button>

            {/* Multi-variation button */}
            <button
              onClick={s.handleMultiVariation}
              disabled={s.isGenerateDisabled}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-wider transition-all ${
                s.isGenerateDisabled
                  ? 'bg-slate-100 dark:bg-white/[0.02] text-slate-400 dark:text-slate-600 border border-black/[0.04] dark:border-white/[0.04]'
                  : 'bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30 hover:text-brand-blue'
              }`}
            >
              <Layers size={13} /> 4 Biến thể cùng lúc
              <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 ml-1">
                ({s.currentUnitCost * 4} CR)
              </span>
            </button>

            {/* Cost */}
            <div className="flex items-center justify-center gap-4">
              <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Sparkles size={8} className={`text-${config.accentColor}-500`} />
                {s.quantity}x = {s.currentUnitCost * s.quantity} CR
              </span>
            </div>
          </div>
        </aside>

        {/* ═══ VIEWPORT ═══ */}
        <main className="flex-grow flex flex-col relative bg-[#f8f9fb] dark:bg-[#030305] transition-colors duration-500 overflow-hidden h-full">
          {/* Header */}
          <div className="h-14 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between px-6 bg-white/80 dark:bg-black/40 backdrop-blur-xl z-40 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-1 h-5 rounded-full bg-${config.accentColor}-500`}></div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-none tracking-tight">{config.name}</h2>
              <span className="text-[8px] font-semibold text-slate-400 bg-slate-100 dark:bg-white/[0.03] px-2 py-0.5 rounded-md border border-black/[0.04] dark:border-white/[0.04] hidden sm:inline">
                Image Task API
              </span>
            </div>

            {/* Tabs */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex bg-slate-100 dark:bg-white/[0.03] p-0.5 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
              <button 
                onClick={() => s.setActiveTab('CURRENT')}
                className={`px-5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${s.activeTab === 'CURRENT' ? 'bg-white dark:bg-white/[0.08] text-brand-blue shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
              >
                Studio
              </button>
              <button 
                onClick={() => s.setActiveTab('HISTORY')}
                className={`px-5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${s.activeTab === 'HISTORY' ? 'bg-white dark:bg-white/[0.08] text-brand-blue shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
              >
                Lịch sử
              </button>
            </div>

            {/* Mobile tabs */}
            <div className="md:hidden flex bg-slate-100 dark:bg-white/[0.03] p-0.5 rounded-lg border border-black/[0.04] dark:border-white/[0.04] mr-3">
              <button onClick={() => s.setActiveTab('CURRENT')} className={`px-3 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${s.activeTab === 'CURRENT' ? 'bg-white dark:bg-white/[0.08] text-brand-blue shadow-sm' : 'text-slate-400'}`}>Lab</button>
              <button onClick={() => s.setActiveTab('HISTORY')} className={`px-3 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${s.activeTab === 'HISTORY' ? 'bg-white dark:bg-white/[0.08] text-brand-blue shadow-sm' : 'text-slate-400'}`}>History</button>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {s.activeTab === 'HISTORY' && (
                <button onClick={s.fetchHistory} className="p-2 text-slate-400 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/5">
                  <RefreshCw size={14} className={s.isFetchingHistory ? 'animate-spin' : ''} />
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto no-scrollbar relative flex flex-col items-center">
            <AnimatePresence mode="wait">
              {s.activeTab === 'CURRENT' ? (
                <motion.div key="viewport-current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex justify-center">
                  <EventViewport 
                    config={config}
                    activeResult={activeResult}
                    isGenerating={s.isGenerating}
                    onClose={onClose}
                    accentColor={config.accentColor}
                    onEdit={(url) => { s.setEditorImage(url); s.setIsEditorOpen(true); }}
                    onDownload={handleDownload}
                    onRegenerate={s.handleRegenerate}
                    onShare={s.handleShare}
                    onToggleFavorite={s.toggleFavorite}
                    isFavorite={activeResult ? s.favorites.has(activeResult.id) : false}
                    compareMode={s.compareMode}
                    setCompareMode={s.setCompareMode}
                    sourceImages={s.sourceImages}
                  />
                </motion.div>
              ) : (
                <motion.div key="viewport-history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-6xl p-6 md:p-10 space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <HistoryIcon size={18} className="text-brand-blue" />
                      <h2 className="text-2xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Lịch sử <span className="text-brand-blue">Cloud</span>
                      </h2>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Toàn bộ tác phẩm {config.name} đã tạo
                    </p>
                  </div>

                  {s.isFetchingHistory ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-40">
                      <Loader2 className="animate-spin text-brand-blue" size={36} />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Đang tải...</p>
                    </div>
                  ) : s.historyResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
                      {s.historyResults.map((res) => (
                        <div key={res.id} className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-sm group transition-all hover:shadow-xl hover:border-brand-blue/20">
                          <div 
                            className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-black cursor-pointer" 
                            onClick={() => { s.setActiveResultId(res.id); s.setResults(prev => { if (prev.some(r => r.id === res.id)) return prev; return [...prev, res]; }); s.setActiveTab('CURRENT'); }}
                          >
                            {res.url ? (
                              <img src={res.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                <AlertTriangle size={32} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className={`absolute top-3 left-3 px-2 py-0.5 bg-${config.accentColor}-500 text-white text-[7px] font-bold rounded-md uppercase tracking-wider shadow-sm`}>
                              {config.id}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80 line-clamp-2 leading-relaxed">"{res.prompt}"</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <Clock size={9} /> {res.timestamp}
                              </span>
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => s.handleRegenerate(res)} 
                                  className="p-1.5 bg-slate-100 dark:bg-white/[0.03] rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                                  title="Tạo lại"
                                >
                                  <RefreshCw size={12} />
                                </button>
                                <button 
                                  onClick={() => s.handleShare(res)} 
                                  className="p-1.5 bg-slate-100 dark:bg-white/[0.03] rounded-lg text-slate-500 dark:text-slate-400 hover:text-purple-500 hover:bg-purple-500/10 transition-all"
                                  title="Chia sẻ"
                                >
                                  <Share2 size={12} />
                                </button>
                                <button 
                                  onClick={() => { s.setEditorImage(res.url!); s.setIsEditorOpen(true); }} 
                                  className="p-1.5 bg-slate-100 dark:bg-white/[0.03] rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-all"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button 
                                  onClick={() => res.url && handleDownload(res.url)} 
                                  className="p-1.5 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all"
                                >
                                  <Download size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-32 text-center flex flex-col items-center gap-4 opacity-15 select-none">
                      <Database size={64} strokeWidth={0.8} />
                      <p className="text-sm font-bold uppercase tracking-wider">Chưa có lịch sử</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ═══ HISTORY SIDEBAR (DESKTOP) ═══ */}
        {s.activeTab === 'CURRENT' && (
          <EventHistory 
            results={s.sortedResults} 
            activeId={s.activeResultId} 
            onSelect={s.setActiveResultId}
            favorites={s.favorites}
            onToggleFavorite={s.toggleFavorite}
          />
        )}
      </div>

      {/* Hidden file inputs */}
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={s.handleUpload} />
      <input type="file" ref={clothingInputRef} className="hidden" accept="image/*" onChange={s.handleClothingUpload} />

      {/* Modals */}
      <ImageLibraryModal 
        isOpen={s.isLibraryOpen} 
        onClose={() => s.setIsLibraryOpen(false)} 
        onConfirm={(assets) => { s.addLibraryImages(assets); s.setIsLibraryOpen(false); }}
      />

      <ProductImageWorkspace 
        isOpen={s.isEditorOpen} 
        onClose={() => s.setIsEditorOpen(false)} 
        initialImage={s.editorImage} 
        onApply={(url) => {
          const editId = `edit-${Date.now()}`;
          s.setResults(prev => [{ id: editId, url, status: 'done', prompt: 'Edited', timestamp: 'Vừa xong', cost: 0, seed: 0 }, ...prev]);
          s.setActiveResultId(editId);
          s.setIsEditorOpen(false);
        }}
      />

      <ResourceAuthModal 
        isOpen={s.showResourceModal} 
        onClose={() => s.setShowResourceModal(false)} 
        onConfirm={(pref) => { s.setUsagePreference(pref); s.setShowResourceModal(false); }} 
        hasPersonalKey={!!localStorage.getItem('skyverses_model_vault')}
      />

      {/* Low Credit Alert */}
      <AnimatePresence>
        {s.showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="max-w-sm w-full bg-white dark:bg-[#111114] p-10 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                <AlertTriangle size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Không đủ Credits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bạn cần ít nhất <span className="font-bold text-amber-500">{s.currentUnitCost * s.quantity} CR</span> để tạo hình
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/credits" className="bg-brand-blue text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg hover:brightness-110 transition-all text-center">Nạp Credits</Link>
                <button onClick={() => s.setShowLowCreditAlert(false)} className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">Bỏ qua</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventStudioWorkspace;
