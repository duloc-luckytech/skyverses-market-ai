
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Music, Sparkles, Activity, ShieldCheck, 
  SlidersHorizontal, Layers, Trash2, ListMusic, Loader2, Zap, Download, X,
  ArrowRight, Mic2, FileMusic, ChevronUp, ChevronDown, Radio,
  LayoutTemplate, Star, Wand2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMusicStudio } from '../../hooks/useMusicStudio';
import { StudioSidebar } from '../../components/music-generator/StudioSidebar';
import { MusicResultCard } from '../../components/music-generator/MusicResultCard';
import { ExpandModal } from '../../components/music-generator/ExpandModal';
import ResourceAuthModal from '../../components/common/ResourceAuthModal';
import { ResourceControl } from '../../components/fashion-studio/ResourceControl';

const MUSIC_TEMPLATES = [
  {
    id: 'lofi',
    label: 'Lo-fi Chill',
    name: 'Midnight Study Session',
    desc: 'Lofi, chill, nostalgic, smooth piano, vinyl crackle, 80bpm',
    lyrics: '[Instrumental Chill Beats with subtle atmospheric raining sounds]'
  },
  {
    id: 'cyber',
    label: 'Cyberpunk',
    name: 'Neon District Chase',
    desc: 'Synthwave, aggressive, cinematic, heavy bass, dark electronic, 120bpm',
    lyrics: 'Neon lights reflecting in the rain / Digital blood running through my veins'
  },
  {
    id: 'pop',
    label: 'Modern Pop',
    name: 'Summer Love Story',
    desc: 'Upbeat, catchy, acoustic guitar, female vocals, summer vibes, 105bpm',
    lyrics: 'Walking down the coastline / Everything is just fine'
  },
  {
    id: 'epic',
    label: 'Epic Cinema',
    name: 'Empire Rises',
    desc: 'Orchestral, epic, powerful, dramatic strings, cinematic percussion',
    lyrics: '[Grand orchestral choir and powerful horns intensify]'
  }
];

// Added default export to MusicGenerator component
const MusicGenerator: React.FC = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <MusicStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/10 rounded-full blur-[200px]"></div>
        </div>
        <div className="max-w-[1500px] mx-auto text-center space-y-12 relative z-10">
          <h1 className="text-6xl lg:text-[110px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
            AI Music <span className="text-brand-blue">Generator.</span>
          </h1>
          <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight max-w-2xl mx-auto">
            Professional neural music workstation to generate broadcast-quality tracks from text descriptions.
          </p>
          <button 
            onClick={() => setIsStudioOpen(true)}
            className="bg-brand-blue text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto group"
          >
            Open Music Studio <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

const MusicStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useMusicStudio();
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try {
        const keys = JSON.parse(vault);
        if (keys.gemini && keys.gemini.trim() !== '') {
          setHasPersonalKey(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleGenerateClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileExpanded(false);
    }
    s.handleGenerate();
  };

  const applyTemplate = (t: typeof MUSIC_TEMPLATES[0]) => {
    s.setSongName(t.name);
    s.setDescription(t.desc);
    s.setLyrics(t.lyrics);
    if (t.id === 'lofi' || t.id === 'epic') s.setIsInstrumental(true);
    else s.setIsInstrumental(false);
    setShowTemplates(false);
    if (window.innerWidth < 1024) setIsMobileExpanded(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex flex-col lg:flex-row bg-[#f4f7f9] dark:bg-[#0b0c10] overflow-hidden transition-colors duration-500"
    >
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileExpanded(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <StudioSidebar 
        onClose={onClose}
        songName={s.songName} setSongName={s.setSongName}
        description={s.description} setDescription={s.setDescription}
        lyrics={s.lyrics} setLyrics={s.setLyrics}
        isInstrumental={s.isInstrumental} setIsInstrumental={s.setIsInstrumental}
        selectedEngine={s.selectedEngine}
        setSelectedEngine={s.setSelectedEngine}
        availableModels={s.availableModels}
        selectedModelObj={s.selectedModelObj}
        setSelectedModelObj={s.setSelectedModelObj}
        currentUnitCost={s.currentUnitCost}
        usagePreference={s.usagePreference as 'credits' | 'key'}
        credits={s.credits}
        setShowResourceModal={setShowResourceModal}
        isGenerating={s.isGenerating}
        onExpand={s.setExpanding}
        onGenerate={handleGenerateClick}
        isMobileExpanded={isMobileExpanded}
        setIsMobileExpanded={setIsMobileExpanded}
      />

      <main className="flex-grow flex flex-col bg-white dark:bg-[#0b0c10] relative transition-all min-w-0 border-l border-black/5 dark:border-white/5 h-full">
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 border-b border-black/5 dark:border-white/5 shrink-0 z-50 bg-white/80 dark:bg-[#0b0c10]/80 backdrop-blur-xl">
          
          {/* Header Left: Empty or simple logo for balance */}
          <div className="flex items-center gap-2">
            <Music size={18} className="text-brand-blue lg:hidden" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 lg:hidden">Studio Workspace</span>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/40 px-3 lg:px-4 py-2 rounded-full border border-black/5 dark:border-white/10">
               <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest hidden sm:inline">Tự động tải</span>
               <button 
                 onClick={() => s.setAutoDownload(!s.autoDownload)}
                 className={`w-9 h-4 lg:w-10 lg:h-5 rounded-full relative transition-colors ${s.autoDownload ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-700'}`}
               >
                 <motion.div animate={{ x: s.autoDownload ? 20 : 2 }} className="absolute top-0.5 lg:top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg" />
               </button>
            </div>
            
            <button 
              onClick={s.handleDownloadAll}
              className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 lg:px-5 py-2 rounded-full border border-black/5 dark:border-white/5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all text-slate-600 dark:text-gray-300 shadow-sm"
            >
              <Download size={14} /> <span className="hidden sm:inline">Tải tất cả</span>
            </button>

            <div className="h-8 w-px bg-black/5 dark:bg-white/5 hidden lg:block"></div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center p-4 lg:p-12 relative overflow-hidden h-full pb-20 lg:pb-12">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full lg:w-[800px] aspect-square bg-brand-blue/5 rounded-full blur-[150px]"></div>
          </div>

          <AnimatePresence mode="wait">
            {s.results.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full max-w-[1400px] overflow-y-auto no-scrollbar max-h-full py-4 lg:py-10 relative z-10">
                {s.results.map(song => (
                  <MusicResultCard 
                    key={song.id}
                    id={song.id}
                    name={song.name}
                    desc={song.desc}
                    timestamp={song.timestamp}
                    status={song.status}
                    isActive={s.activeAudioId === song.id}
                    isPlaying={s.isPlaying}
                    onPlay={() => {
                      if (song.status === 'done') {
                        s.playBuffer(song.url || song.buffer!, song.id);
                      }
                    }}
                    onDelete={() => s.handleDelete(song.id)}
                    onDownload={() => s.downloadFile(song.url || '', song.name)}
                    onRecreate={() => s.handleGenerate({ name: song.name, desc: song.desc, id: song.id })}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 lg:gap-10 text-center max-w-2xl px-6 relative z-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-blue blur-[60px] opacity-10 rounded-full animate-pulse"></div>
                  <div className="w-24 h-24 lg:w-40 lg:h-40 bg-slate-50 dark:bg-white/[0.03] rounded-[2rem] lg:rounded-[3rem] border border-black/5 dark:border-white/10 flex items-center justify-center relative z-10 shadow-2xl transition-transform group-hover:scale-110 duration-700">
                    <Music size={40} lg:size={80} strokeWidth={1} className="text-brand-blue opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter italic text-slate-800 dark:text-white leading-none">Studio Standby</h3>
                  <div className="space-y-3 lg:space-y-4">
                     {[
                       { icon: <Zap size={14} />, text: 'Nhập ý tưởng âm nhạc ở cột bên trái' },
                       { icon: <Mic2 size={14} />, text: 'Tùy chỉnh lời hoặc tạo bản không lời' },
                       { icon: <Sparkles size={14} />, text: 'Nhấn "TẠO NHẠC" để AI bắt đầu' }
                     ].map((step, i) => (
                       <div key={i} className="flex items-center gap-3 lg:gap-4 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 bg-slate-50/50 dark:bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                          <div className="text-brand-blue">{step.icon}</div>
                          <span>{step.text}</span>
                       </div>
                     ))}
                  </div>

                  {/* QUICK TEMPLATES BUTTON - CENTRAL HUB POSITION */}
                  <div className="pt-6">
                    <button 
                      onClick={() => setShowTemplates(true)}
                      className="inline-flex items-center gap-3 px-10 py-5 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all group"
                    >
                      <LayoutTemplate size={20} className="group-hover:rotate-12 transition-transform" />
                      Mẫu kịch bản nhanh
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TEMPLATES MODAL */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-[#111318] border border-black/5 dark:border-white/10 w-full max-w-2xl rounded-3xl flex flex-col shadow-3xl overflow-hidden"
              >
                <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-transparent">
                  <div className="flex items-center gap-3 text-brand-blue">
                    <LayoutTemplate size={20} />
                    <h3 className="text-lg font-black uppercase tracking-tight italic">Mẫu kịch bản nhanh</h3>
                  </div>
                  <button onClick={() => setShowTemplates(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto no-scrollbar max-h-[70vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MUSIC_TEMPLATES.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => applyTemplate(t)}
                        className="flex flex-col p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-brand-blue transition-all group text-left shadow-sm"
                      >
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                               <Star size={18} fill="currentColor" />
                            </div>
                            <span className="text-sm font-black uppercase italic text-slate-800 dark:text-white">{t.label}</span>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase">{t.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-2 italic leading-relaxed">"{t.desc}"</p>
                         </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-transparent text-center">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest italic leading-none">Hệ thống kịch bản chuyên nghiệp tối ưu cho Gemini v3.2</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {s.isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 dark:bg-[#0b0c10]/90 backdrop-blur-md flex flex-col items-center justify-center z-[200]">
              <div className="relative mb-6 lg:mb-10">
                <Loader2 size={60} lg:size={100} className="text-brand-blue animate-spin" strokeWidth={1} />
                <Music size={20} lg:size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/50 animate-pulse" />
              </div>
              <div className="text-center space-y-4 px-6">
                <p className="text-lg lg:text-2xl font-black uppercase tracking-[0.4em] lg:tracking-[0.8em] text-brand-blue animate-pulse italic">MANIFESTING AUDIO...</p>
                <div className="h-1 w-48 lg:w-64 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mx-auto">
                  <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 2 }} className="h-full bg-brand-blue shadow-[0_0_15px_#0090ff]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {s.expanding === 'desc' && (
          <ExpandModal 
            isOpen title="Edit Description" 
            value={s.description} onChange={s.setDescription} 
            onClose={() => s.setExpanding(null)} 
          />
        )}
        {s.expanding === 'lyrics' && (
          <ExpandModal 
            isOpen title="Edit Lyrics" 
            value={s.lyrics} onChange={s.setLyrics} 
            onClose={() => s.setExpanding(null)} 
          />
        )}
      </AnimatePresence>

      <ResourceAuthModal 
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        onConfirm={(pref) => {
          localStorage.setItem('skyverses_usage_preference', pref);
          window.location.reload();
        }}
        hasPersonalKey={hasPersonalKey}
        totalCost={s.currentUnitCost}
      />
    </motion.div>
  );
};

export default MusicGenerator;
