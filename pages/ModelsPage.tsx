
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Video, ImageIcon, Zap, ChevronRight, ArrowRight,
  X, Activity, ShieldCheck, Clock, Layers, LayoutGrid,
  Info, Cpu, Loader2, PlayCircle, Fingerprint,
  CheckCircle2, Database, Globe, Server, Command, Check,
  MousePointer2, Volume2, Sparkles, Monitor as MonitorIcon
} from 'lucide-react';

interface AIModel {
  id_base: string;
  name: string;
  description: string;
  status: string;
  server: string;
  model: string;
  price: number;
  rate_type: string;
  ratios: { name: string; type: string }[];
  durations: { name: string; type: string }[];
  prices: { mode: string; duration: string; price: number }[];
  modes: { type: string; name: string }[];
  // Features
  startText: boolean;
  startImage: boolean;
  withLipsync: boolean;
  withMotion: boolean;
  withEdit: boolean;
  withReference: boolean;
  extendVideo: boolean;
  withRemix: boolean;
}

const CATEGORIES = ['Tất cả', 'Video', 'Hình ảnh', 'Audio / TTS', 'Nhạc', 'Avatar Lipsync'];
const SERVER_LIST = [
  'Tất cả', 'Alibaba', 'Auto', 'Bytedance', 'Dreamina', 'Elevenlabs', 
  'Google_veo', 'Grok', 'Hailuo', 'Kling', 'Midjourney', 
  'Minimax', 'Seedream', 'Sora', 'Suno'
];

const ModelDetailModal: React.FC<{ model: AIModel; onClose: () => void }> = ({ model, onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-xl" onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col max-h-[90vh] transition-colors duration-500"
      >
        {/* Header */}
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-black/20 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue shadow-inner">
               <Cpu size={28} />
            </div>
            <div>
               <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{model.name}</h2>
               <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1">ID: {model.id_base} • Server: {model.server}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-8 lg:p-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-10">
               <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-blue italic">Mô tả hệ thống</h4>
                  <p className="text-lg text-slate-600 dark:text-gray-300 font-medium leading-relaxed italic border-l-4 border-brand-blue pl-6">
                    "{model.description}"
                  </p>
               </div>

               {/* Features Grid */}
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Edit Mode', val: model.withEdit },
                    { label: 'Reference', val: model.withReference },
                    { label: 'Motion Sync', val: model.withMotion },
                    { label: 'Lipsync', val: model.withLipsync },
                    { label: 'Extend', val: model.extendVideo },
                    { label: 'Remix', val: model.withRemix }
                  ].map(f => (
                    <div key={f.label} className={`p-4 border rounded-xl flex items-center gap-3 transition-all ${f.val ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-500' : 'border-black/5 dark:border-white/5 opacity-30 grayscale'}`}>
                       {f.val ? <CheckCircle2 size={16}/> : <X size={16}/>}
                       <span className="text-[10px] font-black uppercase tracking-widest">{f.label}</span>
                    </div>
                  ))}
               </div>

               {/* Ratio & Duration Lists */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tỷ lệ hỗ trợ</h4>
                    <div className="flex flex-wrap gap-2">
                       {model.ratios.map(r => (
                         <span key={r.type} className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-lg text-[11px] font-black text-slate-700 dark:text-slate-300">{r.name}</span>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời lượng</h4>
                    <div className="flex flex-wrap gap-2">
                       {model.durations.map(d => (
                         <span key={d.type} className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-lg text-[11px] font-black text-slate-700 dark:text-slate-300">{d.name}</span>
                       ))}
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Pricing Table (Hiding prices per user request) */}
            <div className="lg:col-span-5 space-y-8">
               <div className="p-8 bg-slate-50 dark:bg-black border border-black/5 dark:border-white/5 rounded-3xl shadow-inner flex flex-col items-center justify-center min-h-[300px] text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-6">
                    <Clock size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Giá cước đang cập nhật</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Hệ thống đang đồng bộ biểu phí chính thức</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 w-full flex justify-between items-center">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tình trạng</span>
                     <span className="text-[10px] font-black text-brand-blue uppercase italic">Sắp công bố</span>
                  </div>
               </div>

               <div className="p-6 border border-brand-blue/20 bg-brand-blue/5 rounded-2xl flex gap-4 items-start">
                  <ShieldCheck className="text-brand-blue shrink-0 mt-0.5" size={20} />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest italic">Industrial Stability</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-500 font-bold leading-relaxed uppercase">
                      Mô hình này đã được kiểm định về độ ổn định và tính an toàn cho doanh nghiệp.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/40 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0 transition-colors duration-500">
           <div className="flex items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${model.status === 'ON' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">NODE_{model.status}</span>
              </div>
           </div>
           <button 
            onClick={onClose}
            className="w-full sm:w-auto px-16 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all"
           >
              Đã hiểu
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('Tất cả');
  const [activeServer, setActiveServer] = useState('Tất cả');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('https://api.gommo.net/ai/models');
        const json = await res.json();
        if (json.data) setModels(json.data);
      } catch (err) {
        console.error("Fetch models failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchSearch = !search || 
        m.name.toLowerCase().includes(search.toLowerCase()) || 
        m.description.toLowerCase().includes(search.toLowerCase()) ||
        m.id_base.toLowerCase().includes(search.toLowerCase());
      
      const matchCat = activeCat === 'Tất cả' || 
        (activeCat === 'Video' && m.prices.some(p => p.duration)) ||
        (activeCat === 'Hình ảnh' && !m.prices.some(p => p.duration)) ||
        (m.name.toLowerCase().includes(activeCat.toLowerCase())) ||
        (m.description.toLowerCase().includes(activeCat.toLowerCase()));

      const matchServer = activeServer === 'Tất cả' || m.server.toLowerCase() === activeServer.toLowerCase();

      return matchSearch && matchCat && matchServer;
    });
  }, [models, search, activeCat, activeServer]);

  return (
    <div className="pt-32 pb-40 min-h-screen bg-[#fcfcfd] dark:bg-[#030304] text-black dark:text-white transition-colors duration-500 font-sans overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/5 rounded-full blur-[200px]"></div>
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute inset-[-4px] bg-brand-blue/10 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] md:rounded-full h-16 md:h-20 shadow-2xl transition-all group-focus-within:border-brand-blue/40">
               <Search className="ml-8 text-slate-400 group-focus-within:text-brand-blue" size={24} />
               <input 
                 type="text"
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="Tìm kiếm Model Engine (ID, tên, kịch bản)..."
                 className="w-full bg-transparent border-none px-6 text-base md:text-lg font-bold outline-none placeholder:text-slate-300 dark:placeholder:text-gray-800 text-slate-900 dark:text-white"
               />
               <div className="mr-8 hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[9px] text-gray-400 font-black uppercase italic">
                  <Command size={10} /> <span>K</span>
               </div>
            </div>
          </div>
        </div>

        {/* Filters Area */}
        <div className="space-y-6 mb-16 max-w-6xl mx-auto">
          {/* Categories Filter - ChatGPT/Skyverses Style */}
          <div className="bg-black/5 dark:bg-white/[0.03] p-1.5 rounded-2xl md:rounded-full flex items-center gap-1 overflow-x-auto no-scrollbar border border-black/5 dark:border-white/5 shadow-inner">
             {CATEGORIES.map(cat => {
               const isActive = activeCat === cat;
               return (
                 <button 
                   key={cat} onClick={() => setActiveCat(cat)}
                   className={`px-8 py-3 rounded-xl md:rounded-full text-[12px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive ? 'bg-white dark:bg-white text-black dark:text-black shadow-xl scale-[1.02]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
                 >
                   {cat}
                 </button>
               );
             })}
          </div>

          {/* Server Filter - Image Reference style */}
          <div className="flex items-center gap-4 px-2 overflow-hidden">
             <div className="flex items-center gap-2 text-slate-400 dark:text-gray-600 shrink-0 uppercase text-[10px] font-black tracking-widest italic">
                <Database size={16} /> Server:
             </div>
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
               {SERVER_LIST.map(srv => {
                 const isActive = activeServer === srv;
                 return (
                   <button 
                     key={srv} onClick={() => setActiveServer(srv)}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border whitespace-nowrap ${isActive ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/20'}`}
                   >
                     {srv}
                   </button>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Grid View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="aspect-[4/5] bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[2.5rem] animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filteredModels.map((model, idx) => {
               // Logic determine if "NEW" (mocked based on index for demo)
               const isNew = idx < 2 || model.id_base.includes('grok') || model.id_base.includes('kling') || model.name.includes('Pro');

               return (
                 <motion.div 
                   whileHover={{ y: -8 }}
                   key={model.id_base}
                   className="group relative bg-white dark:bg-[#111114] border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 space-y-6 md:space-y-8 shadow-2xl transition-all overflow-hidden cursor-pointer flex flex-col h-full"
                   onClick={() => setSelectedModel(model)}
                 >
                    {/* NEW Badge */}
                    {isNew && (
                      <div className="absolute top-6 right-6 z-20">
                         <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                            <Sparkles size={12} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-wider">NEW</span>
                         </div>
                      </div>
                    )}

                    <div className="flex gap-6 items-start relative z-10">
                       <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400 dark:text-gray-400 group-hover:text-brand-blue transition-colors shrink-0 shadow-inner">
                          {model.prices.some(p => p.duration) ? <Video size={32} /> : <ImageIcon size={32} />}
                       </div>
                       <div className="space-y-1.5 flex-grow pr-16">
                          <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none group-hover:text-brand-blue transition-colors truncate">{model.name}</h3>
                          <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500">
                             <Globe size={12} />
                             <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">{model.server.toUpperCase()}</span>
                          </div>
                       </div>
                    </div>

                    <p className="text-sm md:text-base text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic line-clamp-2 pr-4 opacity-80">"{model.description}"</p>

                    <div className="flex flex-wrap gap-2.5">
                       {model.withReference && (
                         <div className="px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg flex items-center gap-2 text-brand-blue shadow-lg">
                            <ImageIcon size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Img2Video</span>
                         </div>
                       )}
                       {model.startText && (
                         <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2 text-purple-600 dark:text-purple-400 shadow-lg">
                            <Zap size={14} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Text2Video</span>
                         </div>
                       )}
                       <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 shadow-lg">
                          <MonitorIcon size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">1080p</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 py-2">
                       <div className="flex items-center gap-2.5">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white/80">{model.ratios.length} Ratios</span>
                       </div>
                       <div className="flex items-center gap-2.5">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white/80">{model.durations.length} Durations</span>
                       </div>
                       <div className="flex items-center gap-2.5">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white/80">{model.modes.length} Modes</span>
                       </div>
                    </div>

                    {/* Footer Area - Updated to hide credit range */}
                    <div className="pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between relative z-10 mt-auto">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-400">
                             <Clock size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest italic leading-none pt-0.5">Sắp công bố giá</span>
                          </div>
                          <button className="text-[9px] font-black text-brand-blue uppercase tracking-[0.2em] hover:underline w-fit">Chi tiết</button>
                       </div>
                       <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl">
                          Thử Ngay <ArrowRight size={18} strokeWidth={3} />
                       </button>
                    </div>
                 </motion.div>
               );
             })}
          </div>
        )}

        {filteredModels.length === 0 && !loading && (
           <div className="py-48 flex flex-col items-center justify-center text-center space-y-8 opacity-20 italic text-slate-900 dark:text-white">
              <Search size={80} strokeWidth={1} />
              <div className="space-y-2">
                 <p className="text-xl font-black uppercase tracking-[0.5em]">No Model Detected</p>
                 <button onClick={() => { setSearch(''); setActiveCat('Tất cả'); setActiveServer('Tất cả'); }} className="text-xs font-black text-brand-blue underline uppercase tracking-widest">Reset Registry Search</button>
              </div>
           </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedModel && (
          <ModelDetailModal 
            model={selectedModel} 
            onClose={() => setSelectedModel(null)} 
          />
        )}
      </AnimatePresence>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-fade-vertical {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
      `}</style>
    </div>
  );
};

const Monitor = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
);

export default ModelsPage;
