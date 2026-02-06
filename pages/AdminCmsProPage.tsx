import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Settings, Database, Zap, Fingerprint, Box, Cpu, 
  Users, Activity, BarChart3, Cloud, HardDrive, DollarSign, 
  Package, History, Shield, X, Loader2, ArrowRight,
  TrendingUp, Activity as ActivityIcon, ShieldCheck, 
  Terminal, Camera, Trash2, Check, Eye, EyeOff,
  ChevronDown, ChevronUp, ChevronRight, Coins,
  Target, Info, Share2, ClipboardList, Palette,
  ListPlus, Crown, Star, Flame, LayoutTemplate,
  PlusCircle, Layout, AlignLeft, Globe, List, Code2, Layers,
  CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight,
  Sparkles, Compass, Search, RefreshCw, Bot, Filter, Cog,
  Key, Languages, Briefcase, HelpCircle, LayoutGrid, Tag, Video, ImageIcon, Gift
} from 'lucide-react';
import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { authApi, UserListResponse, UserListParams } from '../apis/auth';
import { Solution, HomeBlock, Language } from '../types';
import { SOLUTIONS as LOCAL_SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
import { ConfigurationTab } from '../components/admin-pro/ConfigurationTab';
import { ProviderTokensTab } from '../components/admin-pro/ProviderTokensTab';
import { SolutionDrawer } from '../components/admin-pro/solution-drawer/SolutionDrawer';

type ProAdminTab = 'DASHBOARD' | 'CLOUD' | 'LOCAL' | 'PRICING' | 'CREDIT_PACKS' | 'USERS' | 'LOGS' | 'EXPLORER' | 'AI_MODELS' | 'MARKET_FILTERS' | 'CONFIG' | 'PROVIDER_TOKENS';

const AdminCmsProPage = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ProAdminTab>('DASHBOARD');
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('LIST');
  const [remoteSolutions, setRemoteSolutions] = useState<Solution[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cloud Filter States
  const [cloudSearchText, setCloudSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'HIDDEN'>('ALL');
  const [homeBlockFilter, setHomeBlockFilter] = useState<string>('ALL');
  
  // Solution Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [solRes, configRes] = await Promise.all([
        marketApi.getSolutions(),
        systemConfigApi.getSystemConfig()
      ]);
      if (solRes && solRes.data) setRemoteSolutions(solRes.data);
      if (configRes?.success && configRes.data.marketHomeBlock) {
        setHomeBlocks(configRes.data.marketHomeBlock.sort((a, b) => a.order - b.order));
      }
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

  const handleEdit = (sol: any) => {
    setEditingId(sol._id || sol.id);
    setEditedItem({
      ...sol,
      name: sol.name || { en: '', vi: '', ko: '', ja: '' },
      category: sol.category || { en: '', vi: '', ko: '', ja: '' },
      description: sol.description || { en: '', vi: '', ko: '', ja: '' },
      problems: sol.problems || [],
      industries: sol.industries || [],
      tags: sol.tags || [],
      models: sol.models || [],
      homeBlocks: sol.homeBlocks || [],
      features: sol.features || [],
      neuralStack: sol.neuralStack || [],
      priceCredits: sol.priceCredits || 0,
      isFree: sol.isFree ?? false,
      featured: sol.featured ?? false,
      isActive: sol.isActive ?? true,
      order: sol.order ?? 0,
      status: sol.status || 'active',
      complexity: sol.complexity || 'Standard',
      demoType: sol.demoType || 'text'
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
        showToast(`Đã ${newStatus ? 'hiển thị' : 'ẩn'} giải pháp thành công`, 'success');
      }
    } catch (err) {
      showToast("Lỗi khi thay đổi trạng thái hiển thị", "error");
    }
    finally { setTogglingId(null); }
  };

  const handleQuickUpdateHomeBlocks = async (sol: Solution, newBlocks: string[]) => {
    const targetId = sol._id || sol.id;
    setTogglingId(targetId);
    try {
      const res = await marketApi.updateSolution(targetId, { homeBlocks: newBlocks });
      if (res.success) {
        setRemoteSolutions(prev => prev.map(item => 
          (item._id === targetId || item.id === targetId) ? { ...item, homeBlocks: newBlocks } : item
        ));
        showToast("Cập nhật vị trí hiển thị thành công", "success");
      }
    } catch (err) {
      console.error("Quick sync failed:", err);
      showToast("Cập nhật vị trí thất bại", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveSolution = async () => {
    if (!editedItem) return;
    setIsSaving(true);
    const existingRemote = remoteSolutions.find(r => r.slug.toLowerCase().trim() === editedItem.slug.toLowerCase().trim());
    let res: any;
    
    try {
      if (existingRemote && editingId !== 'NEW') {
        res = await marketApi.updateSolution(existingRemote._id || existingRemote.id, editedItem);
      } else {
        res = await marketApi.createSolution(editedItem);
      }

      if (res.success || (res && res.data)) {
        await fetchData();
        setEditingId(null);
        setEditedItem(null);
        showToast("Hệ thống đã đồng bộ thành công với Registry.", "success");
      } else {
        showToast(res.message || "Đồng bộ thất bại, vui lòng kiểm tra lại thông số", "error");
      }
    } catch (error) {
      showToast("Lỗi kết nối máy chủ Registry", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSolutions = useMemo(() => {
    const base = activeTab === 'CLOUD' ? remoteSolutions : LOCAL_SOLUTIONS;
    return base.filter(sol => {
      // Search
      const s = cloudSearchText.toLowerCase();
      const matchesSearch = !s || 
        sol.name.en.toLowerCase().includes(s) || 
        sol.name.vi.toLowerCase().includes(s) || 
        sol.slug.toLowerCase().includes(s) || 
        sol.id.toLowerCase().includes(s);
      
      // Status
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && sol.isActive) || 
        (statusFilter === 'HIDDEN' && !sol.isActive);
      
      // Home Block
      const matchesBlock = homeBlockFilter === 'ALL' || 
        (sol.homeBlocks && sol.homeBlocks.includes(homeBlockFilter));

      return matchesSearch && matchesStatus && matchesBlock;
    });
  }, [activeTab, remoteSolutions, cloudSearchText, statusFilter, homeBlockFilter]);

  const sidebarItems = [
    { id: 'DASHBOARD', label: 'Tổng quan', icon: <BarChart3 size={20} /> },
    { id: 'CLOUD', label: 'Thị trường Cloud', icon: <Cloud size={20} /> },
    { id: 'LOCAL', label: 'Thị trường Local', icon: <HardDrive size={20} /> },
    { id: 'MARKET_FILTERS', label: 'Bộ lọc sản phẩm', icon: <Filter size={20} /> },
    { id: 'EXPLORER', label: 'Thư viện mẫu', icon: <Compass size={20} /> },
    { id: 'AI_MODELS', label: 'Danh sách Models AI', icon: <Bot size={20} /> },
    { id: 'PROVIDER_TOKENS', label: 'Token nhà cung cấp', icon: <Key size={20} /> },
    { id: 'PRICING', label: 'Bảng giá dịch vụ', icon: <DollarSign size={20} /> },
    { id: 'CREDIT_PACKS', label: 'Gói nạp Credits', icon: <Package size={20} /> },
    { id: 'USERS', label: 'Quản lý khách hàng', icon: <Users size={20} /> },
    { id: 'LOGS', label: 'Nhật ký hệ thống', icon: <History size={20} /> },
    { id: 'CONFIG', label: 'Cấu hình chung', icon: <Cog size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#020203] text-black dark:text-white font-sans transition-colors duration-500 flex flex-col md:flex-row pt-24">
      <aside className="w-full md:w-80 shrink-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#08080a] flex flex-col z-[100] transition-all">
         <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-lg"><ShieldCheck size={18} /></div>
            <div><h2 className="text-sm font-black uppercase tracking-widest italic">Quản trị hệ thống</h2><p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Core v4.5 Operational</p></div>
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
              <div className="flex items-center gap-3 text-brand-blue"><Terminal size={18} className="animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">NODE_PATH: /QUẢN_TRỊ/{activeTab}</span></div>
              <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">{sidebarItems.find(i => i.id === activeTab)?.label} <span className="text-brand-blue">Hub.</span></h1>
           </div>
           {(activeTab === 'CLOUD' || activeTab === 'LOCAL') && (
              <button onClick={() => handleEdit({ id: 'NODE_'+Date.now(), slug: '', name: {en:'', vi:'', ko:'', ja:''}, category: {en:'', vi:'', ko:'', ja:''}, description: {en:'', vi:'', ko:'', ja:''}, problems: [], industries: [], models: [], priceCredits: 0, isFree: false, imageUrl: '', demoType: 'text', tags: [], features: [], complexity: 'Standard', priceReference: '', isActive: true, neuralStack: [], homeBlocks: [] })} className="bg-brand-blue text-white px-10 py-5 rounded-xl shadow-2xl hover:scale-105 transition-all text-xs font-black uppercase tracking-widest whitespace-nowrap flex items-center gap-3">
                <Plus size={18} /> Đăng ký giải pháp mới
              </button>
           )}
        </header>

        {/* LỌC DỮ LIỆU THỊ TRƯỜNG CLOUD */}
        {(activeTab === 'CLOUD' || activeTab === 'LOCAL') && (
           <div className="px-8 lg:px-12 py-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#08080a] flex flex-col lg:flex-row items-center gap-6 z-[80]">
              <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-all" size={18} />
                <input 
                  type="text" 
                  value={cloudSearchText}
                  onChange={(e) => setCloudSearchText(e.target.value)}
                  placeholder="Tìm theo tên, slug, ID..."
                  className="w-full bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:border-brand-blue transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                {/* Trạng thái hiển thị */}
                <div className="flex items-center gap-2 px-4 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-white dark:bg-black/40">
                  <Activity size={16} className="text-gray-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả Trạng thái</option>
                    <option value="ACTIVE">Hoạt động (Active)</option>
                    <option value="HIDDEN">Đã ẩn (Hidden)</option>
                  </select>
                </div>

                {/* Vị trí trang chủ */}
                <div className="flex items-center gap-2 px-4 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-white dark:bg-black/40">
                  <LayoutGrid size={16} className="text-gray-400" />
                  <select 
                    value={homeBlockFilter}
                    onChange={(e) => setHomeBlockFilter(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer max-w-[150px]"
                  >
                    <option value="ALL">Tất cả Home Blocks</option>
                    {homeBlocks.map(block => (
                      <option key={block.key} value={block.key}>{block.title.en}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-inner">
                   <button 
                     onClick={() => setViewMode('LIST')}
                     className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-400'}`}
                   >
                     <List size={16} />
                   </button>
                   <button 
                     onClick={() => setViewMode('CARD')}
                     className={`p-2 rounded-lg transition-all ${viewMode === 'CARD' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-400'}`}
                   >
                     <LayoutGrid size={16} />
                   </button>
                </div>

                <button 
                  onClick={() => { setCloudSearchText(''); setStatusFilter('ALL'); setHomeBlockFilter('ALL'); }}
                  className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                  title="Reset bộ lọc"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
              
              <div className="lg:ml-auto flex items-center gap-3">
                 <span className="text-[10px] font-black uppercase text-gray-400 italic">Kết quả: {filteredSolutions.length}</span>
              </div>
           </div>
        )}

        <div className="flex-grow">
           <AnimatePresence mode="wait">
             {activeTab === 'DASHBOARD' && <DashboardTab key="dashboard" />}
             {activeTab === 'EXPLORER' && <ExplorerTab key="explorer" />}
             {activeTab === 'MARKET_FILTERS' && <MarketFiltersTab key="market_filters" />}
             {activeTab === 'CREDIT_PACKS' && <CreditPacksTab key="packs" />}
             {activeTab === 'PRICING' && <PricingTab key="pricing" />}
             {activeTab === 'AI_MODELS' && <AIModelsTab key="ai_models" />}
             {activeTab === 'PROVIDER_TOKENS' && <ProviderTokensTab key="provider_tokens" />}
             {activeTab === 'LOGS' && <LogsTab key="logs" remoteSolutions={remoteSolutions} />}
             {activeTab === 'USERS' && <UsersTab key="users" loading={loading} response={null} onParamsChange={()=>{}} />}
             {activeTab === 'CONFIG' && <ConfigurationTab key="config" />}
             {(activeTab === 'CLOUD' || activeTab === 'LOCAL') && (
               <NodeRegistryTab 
                 key={`${activeTab}-${viewMode}`} 
                 activeTab={activeTab} 
                 viewMode={viewMode}
                 solutions={filteredSolutions} 
                 onEdit={handleEdit} 
                 onDelete={()=>{}} 
                 onToggleActive={handleToggleActive} 
                 onUpdateHomeBlocks={handleQuickUpdateHomeBlocks}
                 isSyncedOnCloud={isSyncedOnCloud} 
               />
             )}
           </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {editedItem && (
          <SolutionDrawer 
            editingId={editingId}
            editedItem={editedItem}
            setEditedItem={setEditedItem}
            isSaving={isSaving}
            onClose={() => setEditedItem(null)}
            onSave={handleSaveSolution}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCmsProPage;
