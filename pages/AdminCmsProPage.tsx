import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Settings, Database, Zap, Fingerprint, Box, Cpu, 
  Users, Activity, BarChart, Cloud, HardDrive, DollarSign, 
  Package, History, Shield, X, Loader2, ArrowRight,
  TrendingUp, Activity as ActivityIcon, ShieldCheck, 
  Terminal, Camera, Trash2, Check, Eye, EyeOff,
  ChevronDown, ChevronUp, ChevronRight, Coins,
  Target, Info, Share2, ClipboardList, Palette,
  ListPlus, Crown, Star, Flame, LayoutTemplate,
  PlusCircle, Layout, AlignLeft, Globe, List, Code2, Layers,
  CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight,
  Sparkles, Compass, Search, RefreshCw, Bot, Filter
} from 'lucide-react';
import { marketApi } from '../apis/market';
import { authApi, UserListResponse, UserListParams } from '../apis/auth';
import { Solution } from '../types';
import { SOLUTIONS as LOCAL_SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Import Sub-components
import { DashboardTab } from '../components/admin-pro/DashboardTab';
import { NodeRegistryTab } from '../components/admin-pro/NodeRegistryTab';
import { PricingTab } from '../components/admin-pro/PricingTab';
import { CreditPacksTab } from '../components/admin-pro/CreditPacksTab';
import { UsersTab } from '../components/admin-pro/UsersTab';
import { LogsTab } from '../components/admin-pro/LogsTab';
import { ExplorerTab } from '../components/admin-pro/ExplorerTab';
import { AIModelsTab } from '../components/admin-pro/AIModelsTab';
import { MarketFiltersTab } from '../components/admin-pro/MarketFiltersTab';

type ProAdminTab = 'DASHBOARD' | 'CLOUD' | 'LOCAL' | 'PRICING' | 'CREDIT_PACKS' | 'USERS' | 'LOGS' | 'EXPLORER' | 'AI_MODELS' | 'MARKET_FILTERS';

const AdminCmsProPage = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();

  const [activeTab, setActiveTab] = useState<ProAdminTab>('DASHBOARD');
  const [remoteSolutions, setRemoteSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Shared Drawer States (for Solutions)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<Solution | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const solRes = await marketApi.getSolutions();
      if (solRes && solRes.data) setRemoteSolutions(solRes.data);
    } catch (error) {
      console.error("Uplink Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const isSyncedOnCloud = (slug: string) => {
    return remoteSolutions.some(r => r.slug.toLowerCase().trim() === slug.toLowerCase().trim());
  };

  const handleEdit = (sol: Solution) => {
    setEditingId(sol._id || sol.id);
    setEditedItem({ 
      ...sol, 
      isFree: sol.isFree ?? false, 
      priceCredits: sol.priceCredits ?? 0 
    });
  };

  const handleToggleActive = async (sol: Solution) => {
    const targetId = sol._id || sol.id;
    if (togglingId) return;
    setTogglingId(targetId);
    try {
      const newStatus = !sol.isActive;
      const res = await marketApi.toggleActive(targetId, newStatus);
      if (res.success) {
        setRemoteSolutions(prev => prev.map(item => 
          (item._id === targetId || item.id === targetId) ? { ...item, isActive: newStatus } : item
        ));
      }
    } catch (err) {}
    finally { setTogglingId(null); }
  };

  const handleSaveSolution = async () => {
    if (!editedItem) return;
    setIsSaving(true);
    const existingRemote = remoteSolutions.find(r => r.slug.toLowerCase().trim() === editedItem.slug.toLowerCase().trim());
    let res;
    if (existingRemote && editingId !== 'NEW') {
      res = await marketApi.updateSolution(existingRemote._id || existingRemote.id, editedItem);
    } else {
      res = await marketApi.createSolution(editedItem);
    }
    if (res.success || (res && (res as any).data)) {
      await fetchData();
      setEditingId(null);
      setEditedItem(null);
      alert("Nexus Cloud Registry Synchronized.");
    }
    setIsSaving(false);
  };

  const sidebarItems = [
    { id: 'DASHBOARD', label: 'Tổng quan', icon: <BarChart size={20} /> },
    { id: 'CLOUD', label: 'Market Cloud', icon: <Cloud size={20} /> },
    { id: 'LOCAL', label: 'Market Local', icon: <HardDrive size={20} /> },
    { id: 'MARKET_FILTERS', label: 'Market Filters', icon: <Filter size={20} /> },
    { id: 'EXPLORER', label: 'Thư viện Explorer', icon: <Compass size={20} /> },
    { id: 'AI_MODELS', label: 'List AI Models', icon: <Bot size={20} /> },
    { id: 'PRICING', label: 'Bảng giá (Model)', icon: <DollarSign size={20} /> },
    { id: 'CREDIT_PACKS', label: 'Gói nạp Credit', icon: <Package size={20} /> },
    { id: 'USERS', label: 'Khách hàng', icon: <Users size={20} /> },
    { id: 'LOGS', label: 'Nhật ký hệ thống', icon: <History size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#020203] text-black dark:text-white font-sans transition-colors duration-500 flex flex-col md:flex-row pt-24">
      <aside className="w-full md:w-80 shrink-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#08080a] flex flex-col z-[100] transition-all">
         <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-lg"><ShieldCheck size={18} /></div>
            <div><h2 className="text-sm font-black uppercase tracking-widest italic">System Admin</h2><p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Skyverses Core v4.5</p></div>
         </div>
         <div className="flex-grow p-4 space-y-1 overflow-y-auto no-scrollbar flex flex-col">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id as ProAdminTab)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                {item.icon}<span className="text-[11px]">{item.label}</span>{activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
         </div>
      </aside>

      <main className="flex-grow overflow-y-auto no-scrollbar flex flex-col">
        <header className="p-8 lg:p-12 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-white dark:bg-[#020203] sticky top-0 z-[90] backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 transition-colors">
           <div className="space-y-3">
              <div className="flex items-center gap-3 text-brand-blue"><Terminal size={18} className="animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">SYSTEM_PATH: /ADMIN/{activeTab}</span></div>
              <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">{sidebarItems.find(i => i.id === activeTab)?.label} <span className="text-brand-blue">Hub.</span></h1>
           </div>
           {(activeTab === 'CLOUD' || activeTab === 'LOCAL') && (
              <button onClick={() => { handleEdit({ id: 'NODE_'+Date.now(), slug: '', name: {en:'', vi:'', ko:'', ja:''}, category: {en:'', vi:'', ko:'', ja:''}, description: {en:'', vi:'', ko:'', ja:''}, problems: [], industries: [], models: [], priceCredits: 0, isFree: false, imageUrl: '', demoType: 'text', tags: [], features: [], complexity: 'Standard', priceReference: '', isActive: true }); setEditingId('NEW'); }} className="bg-brand-blue text-white px-10 py-5 rounded-xl shadow-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest whitespace-nowrap"><Plus size={18} /> Register New Node</button>
           )}
        </header>

        <div className="flex-grow">
           <AnimatePresence mode="wait">
             {activeTab === 'DASHBOARD' && <DashboardTab key="dashboard" />}
             {activeTab === 'EXPLORER' && <ExplorerTab key="explorer" />}
             {activeTab === 'MARKET_FILTERS' && <MarketFiltersTab key="market_filters" />}
             {activeTab === 'CREDIT_PACKS' && <CreditPacksTab key="packs" />}
             {activeTab === 'PRICING' && <PricingTab key="pricing" />}
             {activeTab === 'AI_MODELS' && <AIModelsTab key="ai_models" />}
             {activeTab === 'LOGS' && <LogsTab key="logs" remoteSolutions={remoteSolutions} />}
             {activeTab === 'USERS' && <UsersTab key="users" loading={loading} response={null} onParamsChange={()=>{}} />}
             {(activeTab === 'CLOUD' || activeTab === 'LOCAL') && (
               <NodeRegistryTab key={activeTab} activeTab={activeTab} solutions={activeTab === 'CLOUD' ? remoteSolutions : LOCAL_SOLUTIONS} onEdit={handleEdit} onDelete={()=>{}} onToggleActive={handleToggleActive} isSyncedOnCloud={isSyncedOnCloud} />
             )}
           </AnimatePresence>
        </div>
      </main>

      {/* SHARED SOLUTION DRAWER */}
      <AnimatePresence>
        {editedItem && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditedItem(null)} />
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white">
                <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                   <div className="flex items-center gap-4"><div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg"><Settings size={20} /></div><div><h3 className="text-xl font-black uppercase tracking-tight italic">{editingId === 'NEW' ? 'Register New Engine' : 'Engine Specification'}</h3><p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">MANIFEST_ID: {editedItem.id}</p></div></div>
                   <button onClick={() => setEditedItem(null)} className="p-2 text-gray-400 hover:text-red-500"><X size={24}/></button>
                </div>
                <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar">
                   <EditInput label="Identity Slug" value={editedItem.slug} onChange={(v: string) => setEditedItem({...editedItem, slug: v})} />
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black uppercase text-gray-400">Access Mode</label>
                         <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl shadow-inner"><button onClick={() => setEditedItem({...editedItem, isFree: true})} className={`flex-grow py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editedItem.isFree ? 'bg-emerald-500 text-white' : 'text-gray-500'}`}>Free</button><button onClick={() => setEditedItem({...editedItem, isFree: false})} className={`flex-grow py-2 text-[10px] font-black uppercase rounded-lg transition-all ${!editedItem.isFree ? 'bg-orange-500 text-white' : 'text-gray-500'}`}>Paid</button></div>
                      </div>
                      {!editedItem.isFree && <EditInput label="Credit Cost" type="number" value={editedItem.priceCredits?.toString() || '0'} onChange={(v: string) => setEditedItem({...editedItem, priceCredits: parseInt(v) || 0})} />}
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <EditInput label="Name (EN)" value={editedItem.name.en} onChange={(v: string) => setEditedItem({...editedItem, name: {...editedItem.name, en: v}})} />
                      <EditInput label="Name (VI)" value={editedItem.name.vi} onChange={(v: string) => setEditedItem({...editedItem, name: {...editedItem.name, vi: v}})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Description (EN)</label>
                     <textarea value={editedItem.description.en} onChange={e => setEditedItem({...editedItem, description: {...editedItem.description, en: e.target.value}})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-xs font-medium text-slate-900 dark:text-white" rows={3} placeholder="Description (EN)..." />
                   </div>
                </div>
                <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-6 shrink-0"><button onClick={() => setEditedItem(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Abort_Changes</button><button onClick={handleSaveSolution} disabled={isSaving} className="bg-brand-blue text-white px-12 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 group">{isSaving ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor"/>} Synchronize Node</button></div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditInput = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label><input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner" /></div>
);

export default AdminCmsProPage;