
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Video, ImageIcon, Zap, ArrowRight,
  X, Clock, Layers,
  Cpu, Sparkles, Monitor as MonitorIcon,
  CheckCircle2, Globe, Command, Check,
  ShieldCheck, ChevronRight
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

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

// ═══════ MODEL DETAIL MODAL ═══════
const ModelDetailModal: React.FC<{ model: AIModel; onClose: () => void }> = ({ model, onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md" onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.97, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0, y: 10 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{model.name}</h2>
              <p className="text-[12px] text-slate-400 dark:text-gray-500">{model.id_base} · {model.server}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left Info */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <p className="text-[12px] font-medium text-slate-400 dark:text-gray-500 mb-2">Mô tả</p>
                <p className="text-[15px] text-slate-600 dark:text-gray-300 leading-relaxed">{model.description}</p>
              </div>

              {/* Features Grid */}
              <div>
                <p className="text-[12px] font-medium text-slate-400 dark:text-gray-500 mb-3">Tính năng</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Edit Mode', val: model.withEdit },
                    { label: 'Reference', val: model.withReference },
                    { label: 'Motion Sync', val: model.withMotion },
                    { label: 'Lipsync', val: model.withLipsync },
                    { label: 'Extend', val: model.extendVideo },
                    { label: 'Remix', val: model.withRemix }
                  ].map(f => (
                    <div key={f.label} className={`px-3 py-2 border rounded-lg flex items-center gap-2 text-[12px] font-medium transition-all ${f.val ? 'border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400' : 'border-black/[0.04] dark:border-white/[0.04] text-slate-300 dark:text-gray-600'}`}>
                      {f.val ? <CheckCircle2 size={14}/> : <X size={14}/>}
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ratio & Duration */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[12px] font-medium text-slate-400 dark:text-gray-500 mb-2">Tỷ lệ</p>
                  <div className="flex flex-wrap gap-1.5">
                    {model.ratios.map(r => (
                      <span key={r.type} className="px-2.5 py-1 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg text-[11px] font-medium text-slate-600 dark:text-gray-300">{r.name}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-400 dark:text-gray-500 mb-2">Thời lượng</p>
                  <div className="flex flex-wrap gap-1.5">
                    {model.durations.map(d => (
                      <span key={d.type} className="px-2.5 py-1 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg text-[11px] font-medium text-slate-600 dark:text-gray-300">{d.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pricing */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-center space-y-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-white/[0.04] rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-700 dark:text-white">Giá cước đang cập nhật</h4>
                  <p className="text-[12px] text-slate-400 dark:text-gray-500 mt-1">Hệ thống đang đồng bộ biểu phí</p>
                </div>
              </div>

              <div className="p-4 border border-brand-blue/15 bg-brand-blue/[0.03] rounded-xl flex gap-3 items-start">
                <ShieldCheck className="text-brand-blue shrink-0 mt-0.5" size={16} />
                <p className="text-[12px] text-slate-500 dark:text-gray-400 leading-relaxed">
                  Model đã được kiểm định về độ ổn định và an toàn cho sản xuất.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${model.status === 'ON' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-[12px] font-medium text-slate-400">{model.status === 'ON' ? 'Hoạt động' : 'Tạm dừng'}</span>
          </div>
          <button onClick={onClose} className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-[13px] font-semibold hover:brightness-110 active:scale-[0.99] transition-all">
            Đã hiểu
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ═══════ MODELS PAGE ═══════
const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('Tất cả');
  const [activeServer, setActiveServer] = useState('Tất cả');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  usePageMeta({
    title: 'AI Models | Skyverses - 30+ Model AI mạnh mẽ',
    description: 'Khám phá bộ sưu tập 30+ model AI từ Google, Midjourney, Kling, Sora, Hailuo và nhiều hơn. Hỗ trợ tạo hình ảnh, video, nhạc và giọng nói.',
    keywords: 'AI models, Midjourney, Kling, Sora, Veo3, AI video models, AI image models',
    canonical: '/models'
  });

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
    <div className="pt-24 md:pt-28 pb-32 min-h-screen bg-white dark:bg-[#0a0a0c] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
        
        {/* ═══════ HERO ═══════ */}
        <div className="mb-8 md:mb-10 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.06] border border-brand-blue/10 rounded-full">
              <Cpu size={13} className="text-brand-blue" />
              <span className="text-[11px] font-semibold text-brand-blue">{models.length} Models Available</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              AI <span className="bg-gradient-to-r from-brand-blue to-blue-400 bg-clip-text text-transparent">Models</span>
            </h1>
            <p className="text-sm text-slate-400 dark:text-gray-500 max-w-lg">
              Khám phá bộ sưu tập model AI mạnh mẽ cho sản xuất hình ảnh, video, nhạc và giọng nói.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={18} />
            <input 
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm model (tên, ID, mô tả)..."
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-11 pr-4 py-3 rounded-xl text-sm focus:border-brand-blue outline-none transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} onClick={() => setActiveCat(cat)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${activeCat === cat ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/20' : 'bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Server Filter */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[12px] font-medium text-slate-400 dark:text-gray-500 shrink-0">Server:</span>
            <div className="flex gap-1.5">
              {SERVER_LIST.map(srv => (
                <button 
                  key={srv} onClick={() => setActiveServer(srv)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${activeServer === srv ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
                >
                  {srv}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ GRID ═══════ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[280px] bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model, idx) => {
              const isVideo = model.prices.some(p => p.duration);
              const isNew = idx < 2 || model.id_base.includes('grok') || model.id_base.includes('kling') || model.name.includes('Pro');

              return (
                <motion.div 
                  key={model.id_base}
                  whileHover={{ y: -4 }}
                  className="group relative bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-5 space-y-4 cursor-pointer hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-lg transition-all flex flex-col"
                  onClick={() => setSelectedModel(model)}
                >
                  {/* NEW Badge */}
                  {isNew && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} fill="currentColor" />
                        <span className="text-[9px] font-bold">NEW</span>
                      </div>
                    </div>
                  )}

                  {/* Top Row: Icon + Name */}
                  <div className="flex gap-3.5 items-start">
                    <div className="w-11 h-11 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors shrink-0">
                      {isVideo ? <Video size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="min-w-0 flex-1 pr-12">
                      <h3 className="text-[16px] font-bold text-slate-800 dark:text-white group-hover:text-brand-blue transition-colors truncate leading-tight">{model.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-500 mt-0.5">
                        <Globe size={11} />
                        <span className="text-[11px] font-medium">{model.server}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-slate-400 dark:text-gray-500 leading-relaxed line-clamp-2">{model.description}</p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {model.withReference && (
                      <span className="px-2 py-1 bg-brand-blue/[0.06] text-brand-blue rounded-md text-[10px] font-medium border border-brand-blue/10">Img2Video</span>
                    )}
                    {model.startText && (
                      <span className="px-2 py-1 bg-purple-500/[0.06] text-purple-600 dark:text-purple-400 rounded-md text-[10px] font-medium border border-purple-500/10">Text2Video</span>
                    )}
                    <span className="px-2 py-1 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-medium border border-emerald-500/10">1080p</span>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-gray-500">
                    <span className="flex items-center gap-1"><Layers size={12} /> {model.ratios.length} ratios</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {model.durations.length} durations</span>
                    <span className="flex items-center gap-1"><Zap size={12} /> {model.modes.length} modes</span>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${model.status === 'ON' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-[11px] font-medium text-slate-400">{model.status === 'ON' ? 'Active' : 'Offline'}</span>
                    </div>
                    <button className="flex items-center gap-1 text-[12px] font-medium text-brand-blue group-hover:gap-2 transition-all">
                      Thử ngay <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredModels.length === 0 && !loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <Search size={40} strokeWidth={1.5} className="text-slate-200 dark:text-gray-700" />
            <div>
              <p className="text-lg font-semibold text-slate-400">Không tìm thấy model</p>
              <button onClick={() => { setSearch(''); setActiveCat('Tất cả'); setActiveServer('Tất cả'); }} className="text-[13px] text-brand-blue hover:underline mt-1">
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedModel && (
          <ModelDetailModal model={selectedModel} onClose={() => setSelectedModel(null)} />
        )}
      </AnimatePresence>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ModelsPage;
