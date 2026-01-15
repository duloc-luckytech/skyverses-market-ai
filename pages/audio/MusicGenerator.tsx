
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Music, Sparkles, Activity, ShieldCheck, 
  SlidersHorizontal, Layers, Trash2, ListMusic, Loader2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMusicStudio } from '../../hooks/useMusicStudio';
import { StudioSidebar } from '../../components/music-generator/StudioSidebar';
import { MusicResultCard } from '../../components/music-generator/MusicResultCard';
import { ExpandModal } from '../../components/music-generator/ExpandModal';

const MusicStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useMusicStudio();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex flex-col lg:flex-row bg-[#0b0c10] overflow-hidden"
    >
      <StudioSidebar 
        onClose={onClose}
        songName={s.songName} setSongName={s.setSongName}
        description={s.description} setDescription={s.setDescription}
        lyrics={s.lyrics} setLyrics={s.setLyrics}
        isInstrumental={s.isInstrumental} setIsInstrumental={s.setIsInstrumental}
        selectedModel={s.selectedModel}
        isGenerating={s.isGenerating}
        onExpand={s.setExpanding}
        onGenerate={s.handleGenerate}
      />

      <main className="flex-grow flex flex-col bg-[#0b0c10] relative transition-all min-w-0">
        <header className="h-16 lg:h-20 flex items-center justify-between px-8 border-b border-white/5 shrink-0 z-50 bg-[#0b0c10]/80 backdrop-blur-xl transition-colors">
          <div className="flex bg-[#161b22] p-1 rounded-xl shadow-inner border border-white/5">
            <button onClick={() => s.setActiveTab('current')} className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${s.activeTab === 'current' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Phiên hiện tại</button>
            <button onClick={() => s.setActiveTab('library')} className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${s.activeTab === 'library' ? 'bg-[#2a2a2e] text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Thư viện</button>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[11px] font-black uppercase text-red-500 hover:brightness-125 flex items-center gap-2 transition-all">
              <Trash2 size={14} /> Xóa phiên
            </button>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-[150px]"></div>
          </div>

          <AnimatePresence mode="wait">
            {s.results.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1400px] overflow-y-auto no-scrollbar max-h-full py-10 relative z-10">
                {s.results.map(song => (
                  <MusicResultCard 
                    key={song.id}
                    id={song.id}
                    name={song.name}
                    desc={song.desc}
                    timestamp={song.timestamp}
                    isActive={s.activeAudioId === song.id}
                    isPlaying={s.isPlaying}
                    onPlay={() => s.playBuffer(song.buffer, song.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 opacity-20">
                <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto shadow-inner">
                  <ListMusic size={64} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black uppercase tracking-[0.5em] italic">No music found.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Start a new session to synthesize high-fidelity tracks</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {s.isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0b0c10]/90 backdrop-blur-md flex flex-col items-center justify-center z-[200]">
              <div className="relative mb-10">
                <Loader2 size={100} className="text-brand-blue animate-spin" strokeWidth={1} />
                <Music size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/50 animate-pulse" />
              </div>
              <div className="text-center space-y-4">
                <p className="text-2xl font-black uppercase tracking-[0.8em] text-brand-blue animate-pulse italic">MANIFESTING AUDIO...</p>
                <div className="h-1 w-64 bg-white/10 rounded-full overflow-hidden mx-auto">
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

const MusicGenerator: React.FC = () => {
  const { lang, t } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = React.useState(false);

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans transition-colors duration-500 pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#ea580c08_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '120px 120px' }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <section className="min-h-[80vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-10">
                <Link to="/market" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-brand-blue transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audio_Infrastructure</span>
                </Link>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-orange-500">
                      <Music size={32} />
                      <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic">ACOUSTIC_GEN_v3.2</span>
                   </div>
                   <h1 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Music <br /> <span className="text-brand-blue">Mastery.</span>
                   </h1>
                </div>
                
                <p className="text-xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-[1.1] border-l-4 border-brand-blue pl-10 max-w-2xl italic">
                  “Biến mô tả văn bản thành các bản nhạc chất lượng phát sóng chuyên nghiệp với quyền sở hữu thương mại tuyệt đối.”
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 pt-4">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-orange-600 text-white px-16 py-8 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(234,88,12,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    Khởi chạy Studio <Play size={20} fill="currentColor" />
                 </button>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
               <div className="aspect-[4/5] bg-gray-100 dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl rounded-sm group p-12 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="h-1 w-24 bg-orange-500/40"></div>
                    <div className="space-y-8">
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Audio_Stability</span>
                          <span className="text-2xl font-black text-brand-blue italic">99.8%</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                          <span className="text-[10px] font-black uppercase text-gray-400">Mastering_Node</span>
                          <span className="text-2xl font-black text-brand-blue italic">48KHZ</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.5em]">SYSTEM INTERFACE</p>
                     <h3 className="text-3xl font-black italic text-black dark:text-white leading-tight uppercase tracking-tighter">Unified_Studio.</h3>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-40 border-t border-black/5 dark:border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
             <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-brand-blue">
                      <Activity size={24} />
                      <span className="text-[10px] font-black uppercase tracking-[0.6em]">Studio_Pipeline</span>
                   </div>
                   <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">Acoustic <br /> <span className="text-brand-blue">Lattice.</span></h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-medium uppercase tracking-widest">
                  Công cụ hỗ trợ nhà sáng tạo và doanh nghiệp sản xuất âm nhạc độc quyền, loại bỏ các vấn đề về bản quyền và tối ưu chi phí vận hành.
                </p>
             </div>

             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl">
                {[
                  { title: 'BPM & Key Control', icon: <SlidersHorizontal />, desc: 'Kiểm soát nhịp độ và cung bậc âm nhạc chính xác cho từng dự án.' },
                  { title: 'Commercial Rights', icon: <ShieldCheck />, desc: 'Sở hữu 100% bản quyền âm nhạc được tạo ra cho mục đích thương mại.' },
                  { title: 'Multi-genre Synth', icon: <Layers />, desc: 'Hỗ trợ hơn 20 thể loại âm nhạc từ Lo-fi, Cinematic đến Heavy Metal.' },
                  { title: 'HD Mastering', icon: <Sparkles />, desc: 'Tự động hậu kỳ và tối ưu chất lượng âm thanh 48kHz / 24-bit.' }
                ].map((f, i) => (
                  <div key={i} className="p-16 bg-white dark:bg-[#08080a] space-y-8 group hover:bg-brand-blue/[0.01] transition-all duration-700 border-r border-black/5 dark:border-white/5 last:border-r-0">
                    <div className="w-14 h-14 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all rounded-sm shadow-xl">
                        {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24 })}
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-2xl font-black uppercase tracking-tighter italic">{f.title}</h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.desc}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>

      {/* STUDIO OVERLAY */}
      <AnimatePresence>
        {isStudioOpen && <MusicStudioWorkspace onClose={() => setIsStudioOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default MusicGenerator;
