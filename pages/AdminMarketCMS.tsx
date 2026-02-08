
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { marketApi } from '../apis/market';
import { SOLUTIONS } from '../data';
import { Solution, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { 
  Database, RefreshCw, Plus, Trash2, 
  CheckCircle2, AlertTriangle, Search, 
  LayoutGrid, Globe, Zap, ArrowRight,
  ShieldCheck, Activity, Terminal, ExternalLink,
  Star, Eye, Settings2, Filter, Loader2,
  Snowflake, Flower2, Heart, Cake, Palette,
  ChevronDown, Edit3, Save, Layers, Coins,
  // Add missing X icon
  X
} from 'lucide-react';
import { EVENT_CONFIGS, EventConfig } from '../constants/event-configs';

type AdminTab = 'REGISTRY' | 'EVENTS';

const AdminMarketCMS = () => {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('REGISTRY');
  const [remoteSolutions, setRemoteSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Event Config Management State
  const [editingEvent, setEditingEvent] = useState<EventConfig | null>(null);
  // Fix: Explicitly type the state to avoid 'unknown' type inference in the view
  const [localEventConfigs, setLocalEventConfigs] = useState<Record<string, EventConfig>>(EVENT_CONFIGS);

  const fetchRemoteData = async () => {
    setLoading(true);
    try {
      const res = await marketApi.getSolutions();
      if (res.success) {
        setRemoteSolutions(res.data);
      }
    } catch (error) {
      showToast("Không thể nạp dữ liệu từ Registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoteData();
  }, []);

  const comparison = useMemo(() => {
    const liveIds = new Set(remoteSolutions.map(s => s.id));
    const missing = SOLUTIONS.filter(local => !liveIds.has(local.id));
    const live = remoteSolutions.filter(remote => 
      remote.name[lang as Language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remote.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { missing, live };
  }, [remoteSolutions, searchQuery, lang]);

  const handlePushToCloud = async (solution: Solution) => {
    setIsSyncing(solution.id);
    try {
      const { _id, ...payload } = solution as any;
      const res = await marketApi.createSolution({
        ...payload,
        status: 'active',
        isActive: true
      });
      if (res.success) {
        showToast(`Đã đồng bộ "${solution.id}" lên Cloud`, "success");
        await fetchRemoteData();
      }
    } catch (error) {
      showToast("Lỗi đồng bộ kịch bản", "error");
    } finally {
      setIsSyncing(null);
    }
  };

  const handleToggleActive = async (solution: Solution) => {
    if (!solution._id) return;
    setIsSyncing(solution.id);
    try {
      const res = await marketApi.toggleActive(solution._id, !solution.isActive);
      if (res.success) {
        showToast("Đã cập nhật trạng thái hiển thị", "success");
        await fetchRemoteData();
      }
    } catch (error) {
      showToast("Lỗi cập nhật", "error");
    } finally {
      setIsSyncing(null);
    }
  };

  const handleSaveEventConfig = () => {
    if (!editingEvent) return;
    setLocalEventConfigs(prev => ({
      ...prev,
      [editingEvent.id]: editingEvent
    }));
    showToast(`Đã cập nhật cấu hình ${editingEvent.name}`, "success");
    setEditingEvent(null);
  };

  return (
    <div className="pt-32 pb-40 min-h-screen bg-white dark:bg-[#020203] text-slate-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden selection:bg-brand-blue/30">
      
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/5 rounded-full blur-[200px]"></div>
         <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10 space-y-12">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-blue">
                 <Settings2 size={24} />
                 <span className="text-[12px] font-black uppercase tracking-[0.6em] italic">Infrastructure_Admin</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">Market <span className="text-brand-blue">Registry.</span></h1>
              
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 w-fit mt-4">
                <button 
                  onClick={() => setActiveTab('REGISTRY')}
                  className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REGISTRY' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-500'}`}
                >
                  Market Items
                </button>
                <button 
                  onClick={() => setActiveTab('EVENTS')}
                  className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'EVENTS' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-500'}`}
                >
                  Event Studio Config
                </button>
              </div>
           </div>

           <div className="relative group w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={18} />
              <input 
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kịch bản ID hoặc Tên..."
                className="w-full bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-sm"
              />
           </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'REGISTRY' ? (
            <motion.div key="registry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-16">
              {/* Cấu trúc cũ: Missing and Live Inventory */}
              {comparison.missing.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4 px-1">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shadow-inner"><AlertTriangle size={20} /></div>
                      <div className="space-y-0.5">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Registry Mismatches</h3>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Phát hiện kịch bản chưa được đẩy lên Cloud</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {comparison.missing.map((sol) => (
                        <div key={sol.id} className="p-8 bg-amber-500/[0.03] border border-amber-500/20 rounded-[2rem] space-y-8">
                          <div className="flex justify-between items-start">
                              <h4 className="text-xl font-black uppercase italic text-slate-900 dark:text-white truncate">{sol.name[lang as Language]}</h4>
                              <button onClick={() => handlePushToCloud(sol)} className="px-6 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">PUSH</button>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              <section className="space-y-8 pb-32">
                <div className="flex items-center gap-4 px-1">
                  <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue shadow-inner"><Database size={20} /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Live Inventory</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {comparison.live.map((sol) => (
                    <div key={sol.id} className={`p-8 bg-white dark:bg-[#0d0d0f] border rounded-[2rem] space-y-6 ${sol.isActive ? 'border-black/5 dark:border-white/5' : 'opacity-40 grayscale'}`}>
                       <div className="flex justify-between items-start">
                          <h4 className="text-lg font-black uppercase italic text-slate-900 dark:text-white truncate">{sol.name[lang as Language]}</h4>
                          <div className="flex gap-1.5">
                             <button onClick={() => handleToggleActive(sol)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl"><Zap size={14} fill={sol.isActive ? "currentColor" : "none"} /></button>
                          </div>
                       </div>
                       <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/40"><img src={sol.imageUrl} className="w-full h-full object-cover" alt="" /></div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Fix: Explicitly cast the values array to EventConfig[] to resolve 'unknown' type errors */}
                  {(Object.values(localEventConfigs) as EventConfig[]).map((event) => {
                    const EvIcon = event.icon;
                    return (
                      <div 
                        key={event.id}
                        className={`p-8 bg-white dark:bg-[#0d0d0f] border-2 rounded-[2.5rem] space-y-6 shadow-sm transition-all group hover:shadow-2xl ${editingEvent?.id === event.id ? `border-${event.accentColor}-500` : 'border-black/5 dark:border-white/5'}`}
                      >
                         <div className="flex justify-between items-start">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner bg-${event.accentColor}-500/10 border-${event.accentColor}-500/20 text-${event.accentColor}-500 group-hover:scale-110 transition-transform`}>
                               <EvIcon size={28} />
                            </div>
                            <button 
                              onClick={() => setEditingEvent(event)}
                              className="p-2 text-slate-400 hover:text-brand-blue transition-colors bg-slate-50 dark:bg-white/5 rounded-full"
                            >
                               <Edit3 size={16} />
                            </button>
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{event.name}</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{event.version}</p>
                         </div>
                         <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2">
                               <Coins size={14} className="text-orange-500" />
                               <span className="text-sm font-black italic">{event.costBase} CR</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded bg-${event.accentColor}-500/10 text-${event.accentColor}-500`}>{event.id}</span>
                         </div>
                      </div>
                    );
                  })}
               </div>

               {/* EVENT EDITOR MODAL */}
               <AnimatePresence>
                 {editingEvent && (
                   <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
                   >
                     <motion.div 
                       initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                       className="bg-white dark:bg-[#0d0d0f] border border-black/10 dark:border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-3xl"
                     >
                        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
                           <div className="flex items-center gap-4">
                              <div className={`p-2 bg-${editingEvent.accentColor}-500/10 rounded-lg text-${editingEvent.accentColor}-500`}>
                                 <Settings2 size={20} />
                              </div>
                              <h3 className="text-xl font-black uppercase italic tracking-tight">Cấu hình: {editingEvent.name}</h3>
                           </div>
                           <button onClick={() => setEditingEvent(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 lg:p-10 no-scrollbar space-y-10">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tên Hiển Thị</label>
                                 <input 
                                   value={editingEvent.name}
                                   onChange={e => setEditingEvent({...editingEvent, name: e.target.value})}
                                   className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none focus:border-brand-blue" 
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Chi Phí Cơ Bản</label>
                                 <div className="relative">
                                    <input 
                                      type="number"
                                      value={editingEvent.costBase}
                                      onChange={e => setEditingEvent({...editingEvent, costBase: parseInt(e.target.value) || 0})}
                                      className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none focus:border-brand-blue" 
                                    />
                                    <Zap size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500" fill="currentColor" />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Chủ Đề (Cách nhau bởi dấu phẩy)</label>
                              <textarea 
                                value={editingEvent.subjects.join(', ')}
                                onChange={e => setEditingEvent({...editingEvent, subjects: e.target.value.split(',').map(s => s.trim())})}
                                className="w-full h-24 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-sm font-medium outline-none focus:border-brand-blue resize-none" 
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Bối Cảnh (Cách nhau bởi đóng phẩy)</label>
                              <textarea 
                                value={editingEvent.scenes.join(', ')}
                                onChange={e => setEditingEvent({...editingEvent, scenes: e.target.value.split(',').map(s => s.trim())})}
                                className="w-full h-24 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-sm font-medium outline-none focus:border-brand-blue resize-none" 
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Base Prompt Directive</label>
                              <textarea 
                                value={editingEvent.basePrompt}
                                onChange={e => setEditingEvent({...editingEvent, basePrompt: e.target.value})}
                                className="w-full h-20 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl text-sm font-mono focus:border-brand-blue resize-none" 
                              />
                           </div>
                        </div>

                        <div className="p-8 border-t border-black/5 dark:border-white/5 flex justify-end gap-4 bg-slate-50 dark:bg-black/40 shrink-0">
                           <button onClick={() => setEditingEvent(null)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors">Hủy Bỏ</button>
                           <button 
                             onClick={handleSaveEventConfig}
                             className={`px-12 py-4 bg-${editingEvent.accentColor}-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
                           >
                              <Save size={14} /> Lưu Cấu Hình
                           </button>
                        </div>
                     </motion.div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminMarketCMS;
