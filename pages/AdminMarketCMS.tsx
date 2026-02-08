
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Add Link import from react-router-dom
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
  Star, Eye, Settings2, Filter,
  // Add Loader2 to lucide-react imports
  Loader2
} from 'lucide-react';

const AdminMarketCMS = () => {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  
  const [remoteSolutions, setRemoteSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // So sánh dữ liệu
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
      // Chuẩn bị payload sạch (xóa _id nếu có)
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

  const handlePurge = async (id: string) => {
    if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn giải pháp này khỏi Database?")) return;
    setIsSyncing(id);
    try {
      const res = await marketApi.deleteSolution(id);
      if (res.success) {
        showToast("Đã gỡ bỏ giải pháp", "info");
        await fetchRemoteData();
      }
    } catch (error) {
      showToast("Lỗi gỡ bỏ", "error");
    } finally {
      setIsSyncing(null);
    }
  };

  return (
    <div className="pt-32 pb-40 min-h-screen bg-white dark:bg-[#020203] text-slate-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden selection:bg-brand-blue/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/5 rounded-full blur-[200px]"></div>
         <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10 space-y-16">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-blue">
                 <Settings2 size={24} />
                 <span className="text-[12px] font-black uppercase tracking-[0.6em] italic">Infrastructure_Admin</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">Market <span className="text-brand-blue">Registry.</span></h1>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Database Sync: {remoteSolutions.length} nodes</span>
                 </div>
                 <button onClick={fetchRemoteData} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full hover:rotate-180 transition-all duration-700 text-slate-400 hover:text-brand-blue">
                    <RefreshCw size={16} />
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

        {/* --- MISSING FROM CLOUD (LOCAL DATA.TS) --- */}
        {comparison.missing.length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center gap-4 px-1">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shadow-inner">
                   <AlertTriangle size={20} />
                </div>
                <div className="space-y-0.5">
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Registry Mismatches</h3>
                   <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Phát hiện {comparison.missing.length} kịch bản trong code chưa được đẩy lên Cloud</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparison.missing.map((sol) => (
                  <div key={sol.id} className="p-8 bg-amber-500/[0.03] border border-amber-500/20 rounded-[2rem] space-y-8 relative overflow-hidden group">
                     <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-1">
                           <span className="text-[8px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-sm uppercase tracking-widest italic">LOCAL_ONLY</span>
                           <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white truncate max-w-[200px]">{sol.name[lang as Language]}</h4>
                        </div>
                        <button 
                          onClick={() => handlePushToCloud(sol)}
                          disabled={isSyncing === sol.id}
                          className="px-6 py-2.5 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                           {isSyncing === sol.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} strokeWidth={4} />} PUSH
                        </button>
                     </div>
                     <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic line-clamp-2">"{sol.description[lang as Language]}"</p>
                     <div className="flex items-center gap-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] pt-4 border-t border-amber-500/10">
                        <span>ID: {sol.id}</span>
                        <span>•</span>
                        <span>{sol.demoType.toUpperCase()}</span>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* --- LIVE DATABASE INVENTORY --- */}
        <section className="space-y-8">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue shadow-inner">
                    <Database size={20} />
                 </div>
                 <div className="space-y-0.5">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Live Inventory</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Quản lý các giải pháp đang hoạt động trên hệ thống</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-inner transition-colors">
                 <button className="px-6 py-2 bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-sm rounded-lg text-[10px] font-black uppercase">Grid</button>
                 <button className="px-6 py-2 text-gray-500 hover:text-slate-900 dark:hover:text-white rounded-lg text-[10px] font-black uppercase">List</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {comparison.live.map((sol) => (
                <div key={sol.id} className={`p-8 bg-white dark:bg-[#0d0d0f] border rounded-[2rem] space-y-8 relative overflow-hidden transition-all duration-500 group shadow-sm hover:shadow-2xl ${sol.isActive ? 'border-black/5 dark:border-white/5' : 'opacity-40 grayscale border-dashed border-red-500/20'}`}>
                   <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${sol.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                               {sol.isActive ? 'OPERATIONAL' : 'INACTIVE'}
                            </span>
                            {sol.featured && <Star size={10} className="text-yellow-500" fill="currentColor" />}
                         </div>
                         <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white truncate max-w-[180px] group-hover:text-brand-blue transition-colors leading-none pt-1">{sol.name[lang as Language]}</h4>
                      </div>
                      <div className="flex gap-1.5">
                         <button 
                           onClick={() => handleToggleActive(sol)}
                           disabled={isSyncing === sol.id}
                           className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-brand-blue hover:text-white transition-all rounded-xl border border-black/5 dark:border-white/10 shadow-sm"
                         >
                            <Zap size={14} fill={sol.isActive ? "currentColor" : "none"} />
                         </button>
                         <button 
                           onClick={() => handlePurge(sol._id!)}
                           disabled={isSyncing === sol.id}
                           className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-all rounded-xl border border-black/5 dark:border-white/10 shadow-sm"
                         >
                            <Trash2 size={14} />
                         </button>
                      </div>
                   </div>

                   <div className="aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-slate-100 dark:bg-black/40 relative shadow-inner">
                      <img src={sol.imageUrl} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                         <Link to={`/product/${sol.slug}`} className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline">Preview Node <ExternalLink size={12}/></Link>
                      </div>
                   </div>

                   <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-xl space-y-0.5">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Complexity</span>
                            <p className="text-[10px] font-black uppercase italic text-slate-800 dark:text-white">{sol.complexity}</p>
                         </div>
                         <div className="p-3 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-xl space-y-0.5">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Credits</span>
                            <p className="text-[10px] font-black uppercase italic text-brand-blue">{sol.priceCredits}</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between text-[8px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest italic px-1">
                         <span className="flex items-center gap-1.5"><LayoutGrid size={10} /> {sol.demoType}</span>
                         <span className="flex items-center gap-1.5"><Activity size={10} /> v4.2 Stable</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {loading && (
          <div className="py-40 flex flex-col items-center justify-center gap-6 animate-pulse">
             <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-blue">Synchronizing_Registry...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminMarketCMS;
