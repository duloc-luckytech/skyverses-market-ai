
import React, { useState, useEffect, useMemo } from 'react';
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
import { pricingApi, PricingModel, PricingFilters, CreatePricingRequest } from '../apis/pricing';
import { creditsApi, CreditPackage, CreditPackageRequest, CreditFeature, UnlimitedModelConfig } from '../apis/credits';
import { authApi, UserListResponse, UserListParams } from '../apis/auth';
import { aiModelsApi, AIModel, AIModelRequest } from '../apis/ai-models';
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
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPackage[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [userListResponse, setUserListResponse] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // States cho Drawers & Modals
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<Solution | null>(null);
  
  const [isPricingDrawerOpen, setIsPricingDrawerOpen] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  
  const [isPackDrawerOpen, setIsPackDrawerOpen] = useState(false);
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  
  const [isAiModelDrawerOpen, setIsAiModelDrawerOpen] = useState(false);
  const [editingAiModelId, setEditingAiModelId] = useState<string | null>(null);

  // Payloads
  const [packPayload, setPackPayload] = useState<CreditPackageRequest>({
    code: '', name: '', description: '', credits: 1000, bonusPercent: 0, bonusCredits: 0,
    price: 0, originalPrice: 0, currency: 'VND', billingCycle: 'monthly', billedMonths: 1,
    discountPercent: 0, popular: false, highlight: false, badge: '', ctaText: 'Nâng cấp ngay',
    ribbon: { text: '', color: '#FFE135', icon: '🔥' },
    features: [], unlimitedModels: [],
    theme: { gradientFrom: '#0f172a', gradientTo: '#020617', accentColor: '#0090ff', buttonStyle: 'solid' },
    active: true, sortOrder: 0
  });

  const [aiModelPayload, setAiModelPayload] = useState<AIModelRequest>({
    key: '', name: '', logoUrl: '', route: '', description: '', provider: '', category: 'text', order: 0, status: 'active'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedPricingIds, setExpandedPricingIds] = useState<string[]>([]);

  // Form Payloads
  const [resInput, setResInput] = useState('');
  const [durInput, setDurInput] = useState('');
  const [pricingPayload, setPricingPayload] = useState<CreatePricingRequest>({
    tool: 'video', engine: 'gommo', modelKey: 'veo_3_1', version: '3.1', name: '', mode: 'relaxed',
    baseCredits: 20, perSecond: 2, defaultDuration: 4, resolutions: {}, durations: [5, 8, 10],
    description: '', status: 'active'
  });

  const [pricingFilters, setPricingFilters] = useState<PricingFilters>({
    engine: '', modelKey: '', version: '', tool: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'USERS') {
        const res = await authApi.listUsers({ page: 1, pageSize: 20 });
        setUserListResponse(res);
      } else if (activeTab === 'PRICING') {
        const res = await pricingApi.getPricing(pricingFilters);
        if (res.success) setPricingModels(res.data);
      } else if (activeTab === 'CREDIT_PACKS') {
        const res = await creditsApi.getAdminPackages();
        if (res.data) setCreditPacks(res.data);
      } else if (activeTab === 'AI_MODELS') {
        const res = await aiModelsApi.getModels();
        if (res.data) setAiModels(res.data);
      } else {
        const solRes = await marketApi.getSolutions();
        if (solRes && solRes.data) setRemoteSolutions(solRes.data);
      }
    } catch (error) {
      console.error("Uplink Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, pricingFilters]);

  const displayPricingModels = useMemo(() => {
    if (activeTab !== 'PRICING') return [];
    return pricingModels.filter(m => 
      !search || 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.modelKey.toLowerCase().includes(search.toLowerCase())
    );
  }, [pricingModels, search, activeTab]);

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

  const handleDelete = async (sol: Solution) => {
    const targetId = sol._id || sol.id;
    if (!window.confirm(`Bạn có chắc muốn xóa node "${sol.slug}" khỏi Cloud Registry?`)) return;
    
    try {
      const res = await marketApi.deleteSolution(targetId);
      if (res.success || (res as any).message?.toLowerCase().includes('success')) {
        await fetchData();
        alert("Node đã được loại bỏ khỏi Cloud Registry.");
      } else {
        alert("Thất bại: " + ((res as any).message || "Lỗi phản hồi từ server"));
      }
    } catch (err) {
      alert("Lỗi kết nối khi thực hiện lệnh PURGE.");
    }
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
          (item._id === targetId || item.id === targetId) 
            ? { ...item, isActive: newStatus } 
            : item
        ));
      } else {
        alert("Lỗi khi cập nhật trạng thái hiển thị.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveSolution = async () => {
    if (!editedItem) return;
    setIsSaving(true);
    
    const existingRemote = remoteSolutions.find(r => r.slug.toLowerCase().trim() === editedItem.slug.toLowerCase().trim());
    const isAlreadyInDB = !!existingRemote;
    
    let res;
    if (isAlreadyInDB && editingId !== 'NEW') {
      const targetId = existingRemote._id || existingRemote.id;
      res = await marketApi.updateSolution(targetId, editedItem);
    } else {
      res = await marketApi.createSolution(editedItem);
    }
    
    if (res.success || (res && (res as any).data)) {
      await fetchData();
      setEditingId(null);
      setEditedItem(null);
      alert("Nexus Cloud Registry Synchronized.");
    } else {
      alert("Error: " + ((res as any).message || "Uplink Failed"));
    }
    setIsSaving(false);
  };

  const handleFetchUsers = async (params: UserListParams) => {
    setLoading(true);
    try {
      const res = await authApi.listUsers(params);
      setUserListResponse(res);
    } catch (error) {
      console.error("Fetch users failed:", error);
    }
    setLoading(false);
  };

  const handleEditPack = (pack: CreditPackage) => {
    setEditingPackId(pack._id);
    setPackPayload({
      code: pack.code, name: pack.name, description: pack.description || '',
      credits: pack.credits, bonusPercent: pack.bonusPercent, bonusCredits: pack.bonusCredits,
      price: pack.price, originalPrice: pack.originalPrice || 0, currency: pack.currency,
      billingCycle: pack.billingCycle, billedMonths: pack.billedMonths,
      discountPercent: pack.discountPercent || 0, popular: pack.popular, highlight: pack.highlight, badge: pack.badge || '',
      ctaText: pack.ctaText, ribbon: pack.ribbon || { text: '', color: '#FFE135', icon: '🔥' },
      features: pack.features || [], unlimitedModels: pack.unlimitedModels || [],
      theme: pack.theme || { gradientFrom: '#0f172a', gradientTo: '#020617', accentColor: '#0090ff', buttonStyle: 'solid' },
      active: pack.active, sortOrder: pack.sortOrder
    });
    setIsPackDrawerOpen(true);
  };

  const handleTogglePack = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await creditsApi.togglePackage(id);
      if (res.success) {
        await fetchData();
      } else {
        alert("Lỗi khi chuyển đổi trạng thái gói nạp.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePack = async (id: string) => {
    if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn gói nạp này?")) return;
    setLoading(true);
    try {
      const res = await creditsApi.deletePackage(id);
      if (res.success) await fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSavePack = async () => {
    setIsSaving(true);
    try {
      let res;
      if (editingPackId) res = await creditsApi.updatePackage(editingPackId, packPayload);
      else res = await creditsApi.createPackage(packPayload);
      if (res.success) {
        await fetchData();
        setIsPackDrawerOpen(false);
        setEditingPackId(null);
        alert("✅ Thành công: Cấu hình kinh tế đã được đồng bộ.");
      }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleEditAiModel = (model: AIModel) => {
    setEditingAiModelId(model._id);
    setAiModelPayload({
      key: model.key, name: model.name, logoUrl: model.logoUrl, route: model.route,
      description: model.description || '', provider: model.provider || '',
      category: model.category || 'text', order: model.order, status: model.status
    });
    setIsAiModelDrawerOpen(true);
  };

  const handleSaveAiModel = async () => {
    setIsSaving(true);
    try {
      let res;
      if (editingAiModelId) res = await aiModelsApi.updateModel(editingAiModelId, aiModelPayload);
      else res = await aiModelsApi.createModel(aiModelPayload);
      if (res.success) {
        await fetchData();
        setIsAiModelDrawerOpen(false);
        setEditingAiModelId(null);
        alert("✅ Thành công: Danh mục Model đã được cập nhật.");
      }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleToggleAiModel = async (id: string, status: string) => {
    setTogglingId(id);
    try {
      const res = await aiModelsApi.toggleStatus(id, status);
      if (res.success) await fetchData();
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  const handleDeleteAiModel = async (id: string) => {
    if (!window.confirm("Xóa vĩnh viễn Model này khỏi Registry?")) return;
    setLoading(true);
    try {
      const res = await aiModelsApi.deleteModel(id);
      if (res.success) await fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddNew = () => {
    if (activeTab === 'CREDIT_PACKS') {
       setEditingPackId(null);
       setPackPayload({
         code: '', name: '', description: '', credits: 1000, bonusPercent: 0, bonusCredits: 0,
         price: 0, originalPrice: 0, currency: 'VND', billingCycle: 'monthly', billedMonths: 1,
         discountPercent: 0, popular: false, highlight: false, badge: '', ctaText: 'Nâng cấp ngay',
         ribbon: { text: '', color: '#FFE135', icon: '🔥' },
         features: [], unlimitedModels: [],
         theme: { gradientFrom: '#0f172a', gradientTo: '#020617', accentColor: '#0090ff', buttonStyle: 'solid' },
         active: true, sortOrder: 0
       });
       setIsPackDrawerOpen(true);
    } else if (activeTab === 'PRICING') {
       setEditingPricingId(null);
       setResInput('720p:1, 1080p:1.5');
       setDurInput('5, 8, 10');
       setPricingPayload({
         tool: 'video', engine: 'gommo', modelKey: 'veo_3_1', version: '3.1', name: '', mode: 'relaxed',
         baseCredits: 20, perSecond: 2, defaultDuration: 4, resolutions: {}, durations: [5, 8, 10],
         description: '', status: 'active'
       });
       setIsPricingDrawerOpen(true);
    } else if (activeTab === 'AI_MODELS') {
       setEditingAiModelId(null);
       setAiModelPayload({
          key: '', name: '', logoUrl: '', route: '', description: '', provider: '', category: 'text', order: 0, status: 'active'
       });
       setIsAiModelDrawerOpen(true);
    } else {
        setEditingId('NEW'); 
        setEditedItem({ 
          id: 'NODE_'+Date.now(), slug: '', name: {en:'', vi:'', ko:'', ja:''}, category: {en:'', vi:'', ko:'', ja:''}, 
          description: {en:'', vi:'', ko:'', ja:''}, problems: [], industries: [], models: [],
          priceCredits: 0, isFree: false, imageUrl: '', demoType: 'text', 
          tags: [], features: [], neuralStack: [], complexity: 'Standard', 
          priceReference: '', isActive: true, order: 0, status: 'active', featured: false
        });
    }
  };

  const handleEditPricing = (model: PricingModel) => {
    setEditingPricingId(model._id);
    if (!expandedPricingIds.includes(model._id)) setExpandedPricingIds(prev => [...prev, model._id]);
    const resolutions = Object.keys(model.pricing || {});
    const firstRes = resolutions[0];
    const durations = firstRes ? Object.keys(model.pricing[firstRes]).map(Number) : [];
    setResInput(resolutions.map(r => `${r}:1`).join(', '));
    setDurInput(durations.join(', '));
    setPricingPayload({
      tool: model.tool, engine: model.engine, modelKey: model.modelKey, version: model.version,
      name: model.name, mode: model.mode, baseCredits: 20, perSecond: 2, defaultDuration: 5,
      resolutions: {}, durations: durations, description: model.description, status: model.status
    });
    setIsPricingDrawerOpen(true);
  };

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      const resObj: Record<string, number> = {};
      resInput.split(',').forEach(part => {
        const [key, val] = part.split(':');
        if (key && val) resObj[key.trim()] = parseFloat(val.trim()) || 1;
      });
      const finalDurations = durInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const payload: any = {
        name: pricingPayload.name, mode: pricingPayload.mode, baseCredits: Number(pricingPayload.baseCredits),
        defaultDuration: Number(pricingPayload.defaultDuration || 4), perSecond: Number(pricingPayload.perSecond),
        resolutions: resObj, durations: finalDurations, modelKey: pricingPayload.modelKey,
        description: pricingPayload.description, status: pricingPayload.status
      };
      let res;
      if (editingPricingId) res = await pricingApi.updatePricing(editingPricingId, payload);
      else res = await pricingApi.createPricing({ ...payload, tool: pricingPayload.tool, engine: pricingPayload.engine, version: pricingPayload.version });
      if (res.success) {
        await fetchData();
        setIsPricingDrawerOpen(false);
        setEditingPricingId(null);
      }
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const togglePricingExpand = (id: string) => {
    setExpandedPricingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const updatePricingFilter = (key: keyof PricingFilters, value: string) => {
    setPricingFilters(prev => ({ ...prev, [key]: value }));
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
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-80 shrink-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#08080a] flex flex-col z-[100] transition-all">
         <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-lg">
               <ShieldCheck size={18} />
            </div>
            <div>
               <h2 className="text-sm font-black uppercase tracking-widest italic">System Admin</h2>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Skyverses Core v4.5</p>
            </div>
         </div>

         <div className="flex-grow p-4 space-y-1 overflow-y-auto no-scrollbar">
            {sidebarItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as ProAdminTab)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {item.icon}
                <span className="text-[11px]">{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow overflow-y-auto no-scrollbar flex flex-col">
        <header className="p-8 lg:p-12 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-white dark:bg-[#020203] sticky top-0 z-[90] backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 transition-colors">
           <div className="space-y-3">
              <div className="flex items-center gap-3 text-brand-blue">
                 <Terminal size={18} className="animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">SYSTEM_PATH: /ADMIN/{activeTab}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">
                {sidebarItems.find(i => i.id === activeTab)?.label} <span className="text-brand-blue">Hub.</span>
              </h1>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              {activeTab !== 'USERS' && activeTab !== 'DASHBOARD' && activeTab !== 'LOGS' && activeTab !== 'MARKET_FILTERS' && (
                <button onClick={handleAddNew} className="w-full sm:w-auto bg-brand-blue text-white px-10 py-5 rounded-xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">
                   <Plus size={18} /> 
                   {activeTab === 'CREDIT_PACKS' ? 'Tạo gói nạp' : activeTab === 'PRICING' ? 'Tạo bảng giá' : activeTab === 'AI_MODELS' ? 'Thêm Model AI' : 'Đăng ký Node mới'}
                </button>
              )}
           </div>
        </header>

        <div className="flex-grow">
           <AnimatePresence mode="wait">
             {activeTab === 'DASHBOARD' && <DashboardTab key="dashboard" />}
             {activeTab === 'EXPLORER' && <ExplorerTab key="explorer" />}
             {activeTab === 'MARKET_FILTERS' && <MarketFiltersTab key="market_filters" />}
             {activeTab === 'CREDIT_PACKS' && (
               <CreditPacksTab 
                 key="packs"
                 packs={creditPacks} 
                 onAddNew={handleAddNew}
                 onEdit={handleEditPack}
                 onToggle={handleTogglePack}
                 onDelete={handleDeletePack}
                 loading={loading}
                 togglingId={togglingId}
               />
             )}
             {activeTab === 'CLOUD' && (
               <NodeRegistryTab 
                 key="cloud"
                 activeTab="CLOUD"
                 solutions={remoteSolutions}
                 onEdit={handleEdit}
                 onDelete={handleDelete}
                 onToggleActive={handleToggleActive}
                 isSyncedOnCloud={isSyncedOnCloud}
               />
             )}
             {activeTab === 'LOCAL' && (
                <NodeRegistryTab 
                  key="local"
                  activeTab="LOCAL"
                  solutions={LOCAL_SOLUTIONS}
                  onEdit={handleEdit}
                  onDelete={()=>{}}
                  onToggleActive={()=>{}}
                  isSyncedOnCloud={isSyncedOnCloud}
                />
             )}
             {activeTab === 'PRICING' && (
               <div className="flex flex-col h-full animate-in fade-in duration-700">
                 {/* PRICING TOOLBAR */}
                 <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white dark:bg-[#08080a] p-8 lg:p-12 border-b border-slate-200 dark:border-white/5 transition-all">
                    <div className="relative w-full lg:w-96 group">
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={20} />
                       <input 
                         type="text" value={search} onChange={e => setSearch(e.target.value)}
                         placeholder="Tìm theo tên hoặc model key..."
                         className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:border-brand-blue outline-none transition-all shadow-sm text-slate-800 dark:text-white"
                       />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                       <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
                          {[
                            { id: '', label: 'Tất cả' },
                            { id: 'image', label: 'Image AI' },
                            { id: 'video', label: 'Video AI' }
                          ].map(t => (
                            <button 
                              key={t.id}
                              onClick={() => updatePricingFilter('tool', t.id)}
                              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pricingFilters.tool === t.id ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl shadow-brand-blue/10' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                              {t.label}
                            </button>
                          ))}
                       </div>

                       <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                          <div className="flex items-center gap-3 px-4 border-r border-slate-200 dark:border-white/10 last:border-0">
                             <span className="text-[9px] font-black uppercase text-gray-400">Engine</span>
                             <input 
                               type="text" value={pricingFilters.engine} onChange={e => updatePricingFilter('engine', e.target.value)}
                               className="bg-transparent border-none outline-none text-[11px] font-bold w-16 text-slate-800 dark:text-white"
                               placeholder="gommo"
                             />
                          </div>
                          <div className="flex items-center gap-3 px-4 border-r border-slate-200 dark:border-white/10 last:border-0">
                             <span className="text-[9px] font-black uppercase text-gray-400">Key</span>
                             <input 
                               type="text" value={pricingFilters.modelKey} onChange={e => updatePricingFilter('modelKey', e.target.value)}
                               className="bg-transparent border-none outline-none text-[11px] font-bold w-20 text-slate-800 dark:text-white"
                               placeholder="veo_3_1"
                             />
                          </div>
                          <button onClick={fetchData} className="p-2 bg-brand-blue text-white rounded-xl hover:scale-105 transition-all shadow-lg"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/></button>
                       </div>
                    </div>
                 </div>

                 <PricingTab 
                   key="pricing"
                   pricingModels={displayPricingModels}
                   expandedIds={expandedPricingIds}
                   toggleExpand={togglePricingExpand}
                   onEdit={handleEditPricing}
                   onDelete={async (id)=>{ if(window.confirm("Purge Model Configuration?")) { await pricingApi.deletePricing(id); fetchData(); } }}
                   onUpdateCell={async (id, res, dur, val)=>{ 
                     const r = await pricingApi.updatePricingCell(id, res, Number(dur), val); 
                     fetchData(); 
                     return r; 
                   }}
                 />
               </div>
             )}
             {activeTab === 'AI_MODELS' && (
                <div className="flex flex-col h-full animate-in fade-in duration-700">
                  <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#08080a] transition-colors">
                     <div className="relative w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue" size={18} />
                        <input 
                          type="text" value={search} onChange={e => setSearch(e.target.value)}
                          placeholder="Tìm model..."
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-brand-blue transition-all text-slate-800 dark:text-white"
                        />
                     </div>
                  </div>
                  <AIModelsTab 
                    loading={loading}
                    models={aiModels}
                    search={search}
                    onEdit={handleEditAiModel}
                    onDelete={handleDeleteAiModel}
                    onToggleStatus={handleToggleAiModel}
                  />
                </div>
             )}
             {activeTab === 'USERS' && (
               <UsersTab 
                 key="users"
                 loading={loading}
                 response={userListResponse}
                 onParamsChange={handleFetchUsers}
               />
             )}
             {activeTab === 'LOGS' && <LogsTab key="logs" remoteSolutions={remoteSolutions} />}
           </AnimatePresence>
        </div>
      </main>

      {/* --- DRAWERS --- */}
      <AnimatePresence>
        {editedItem && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => { setEditingId(null); setEditedItem(null); }}
             />
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white"
             >
                <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg">
                         <Settings size={20} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black uppercase tracking-tight italic">
                            {editingId === 'NEW' ? 'Register New Engine' : 'Engine Specification'}
                         </h3>
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">MANIFEST_ID: {editedItem.id}</p>
                      </div>
                   </div>
                   <button onClick={() => { setEditingId(null); setEditedItem(null); }} className="p-2 text-gray-400 hover:text-red-500"><X size={24}/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar">
                   {/* Preview Header */}
                   <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative group shadow-inner">
                      <img src={editedItem.imageUrl} className="w-full h-full object-cover opacity-60 transition-opacity duration-1000 group-hover:opacity-100" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 space-y-1">
                         <h4 className="text-xl font-black uppercase text-white tracking-tighter italic">{editedItem.name.en || 'UNNAMED_NODE'}</h4>
                         <span className="text-[8px] font-black text-brand-blue uppercase tracking-widest italic">{remoteSolutions.some(r => r.slug.toLowerCase().trim() === editedItem.slug.toLowerCase().trim()) ? 'CLOUD_NATIVE' : 'LOCAL_CACHE'}</span>
                      </div>
                   </div>

                   {/* Identity Section */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Identity_Matrix</h4>
                      <div className="grid grid-cols-2 gap-6">
                         <EditInput label="UID (Hệ thống)" value={editedItem.id} onChange={v => setEditedItem({...editedItem, id: v})} />
                         <EditInput label="Slug (URL)" value={editedItem.slug} onChange={v => setEditedItem({...editedItem, slug: v})} />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Access Type</label>
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl shadow-inner transition-colors">
                               <button onClick={() => setEditedItem({...editedItem, isFree: true})} className={`flex-grow py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editedItem.isFree ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500'}`}>Free</button>
                               <button onClick={() => setEditedItem({...editedItem, isFree: false})} className={`flex-grow py-2 text-[10px] font-black uppercase rounded-lg transition-all ${!editedItem.isFree ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500'}`}>Paid</button>
                            </div>
                         </div>
                         {!editedItem.isFree && (
                            <EditInput label="Credit Cost" type="number" value={editedItem.priceCredits?.toString() || '0'} onChange={v => setEditedItem({...editedItem, priceCredits: parseInt(v) || 0})} />
                         )}
                      </div>
                   </div>

                   {/* Localized Strings */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Localized_Strings</h4>
                      <div className="grid grid-cols-2 gap-6">
                         <EditInput label="Name (EN)" value={editedItem.name.en} onChange={v => setEditedItem({...editedItem, name: {...editedItem.name, en: v}})} />
                         <EditInput label="Name (VI)" value={editedItem.name.vi || ''} onChange={v => setEditedItem({...editedItem, name: {...editedItem.name, vi: v}})} />
                         <EditInput label="Category (EN)" value={editedItem.category.en} onChange={v => setEditedItem({...editedItem, category: {...editedItem.category, en: v}})} />
                         <EditInput label="Category (VI)" value={editedItem.category.vi || ''} onChange={v => setEditedItem({...editedItem, category: {...editedItem.category, vi: v}})} />
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                         <EditTextArea label="Description (EN)" value={editedItem.description.en} onChange={v => setEditedItem({...editedItem, description: {...editedItem.description, en: v}})} />
                         <EditTextArea label="Description (VI)" value={editedItem.description.vi || ''} onChange={v => setEditedItem({...editedItem, description: {...editedItem.description, vi: v}})} />
                      </div>
                   </div>

                   {/* Protocol Section */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Operational_Protocol</h4>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="grid grid-cols-2 gap-6">
                            <EditSelect label="Synthesis Mode" value={editedItem.demoType} options={['text', 'image', 'video', 'automation']} onChange={v => setEditedItem({...editedItem, demoType: v as any})} />
                            <EditSelect label="Compute Tier" value={editedItem.complexity} options={['Standard', 'Advanced', 'Enterprise']} onChange={v => setEditedItem({...editedItem, complexity: v as any})} />
                         </div>
                         <EditInput 
                           label="Supported Models (Comma separated)" 
                           value={(editedItem.models || []).join(', ')} 
                           onChange={val => setEditedItem({...editedItem, models: val.split(',').map(s => s.trim()).filter(s => s !== '')} as any)} 
                           placeholder="gpt3.5, midjourney, veo3.1..."
                         />
                         <EditInput 
                           label="Registry Tags (Comma separated)" 
                           value={(editedItem.tags || []).join(', ')} 
                           onChange={val => setEditedItem({...editedItem, tags: val.split(',').map(s => s.trim()).filter(s => s !== '')} as any)} 
                           placeholder="Cyberpunk, Cinematic, Unreal Engine..."
                         />
                         <EditInput label="Visual Asset URL" value={editingItem.imageUrl} onChange={v => setEditedItem({...editedItem, imageUrl: v})} />
                         <EditInput label="Pricing Reference" value={editedItem.priceReference || ''} onChange={v => setEditedItem({...editedItem, priceReference: v})} />
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-6 shrink-0 transition-colors">
                   <button onClick={() => { setEditingId(null); setEditedItem(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Abort_Changes</button>
                   <button 
                     onClick={handleSaveSolution}
                     disabled={isSaving}
                     className="bg-brand-blue text-white px-12 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/20 flex items-center gap-4 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                   >
                      {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor"/>}
                      {editingId === 'NEW' ? 'Deploy to Cloud' : 'Synchronize Node'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PRICING SPECIFICATION DRAWER --- */}
      <AnimatePresence>
        {isPricingDrawerOpen && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => { setIsPricingDrawerOpen(false); setEditingPricingId(null); }}
             />
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white"
             >
                <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg">
                         <DollarSign size={20} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black uppercase tracking-tight italic">
                            {editingPricingId ? 'Update Pricing Manifest' : 'Create Pricing Manifest'}
                         </h3>
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">ADMIN_OVERRIDE_ACTIVE</p>
                      </div>
                   </div>
                   <button onClick={() => { setIsPricingDrawerOpen(false); setEditingPricingId(null); }} className="p-2 text-gray-400 hover:text-red-500"><X size={24}/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar">
                   {/* Identify Section */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Metadata_Registry</h4>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="grid grid-cols-2 gap-6">
                            <EditInput 
                               label="Tool Category" value={pricingPayload.tool} 
                               onChange={val => setPricingPayload({...pricingPayload, tool: val})} 
                               placeholder="video, image, audio"
                            />
                            <EditInput 
                               label="Model Name" value={pricingPayload.name || ''} 
                               onChange={val => setPricingPayload({...pricingPayload, name: val})} 
                               placeholder="VEO 3.1 - HOT"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <EditInput 
                               label="Engine Provider" value={pricingPayload.engine} 
                               onChange={val => setPricingPayload({...pricingPayload, engine: val})} 
                               placeholder="gommo, fxlab"
                            />
                            <EditInput 
                               label="Model Key" value={pricingPayload.modelKey} 
                               onChange={val => setPricingPayload({...pricingPayload, modelKey: val})} 
                               placeholder="veo_3_1"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <EditInput 
                               label="Version" value={pricingPayload.version} 
                               onChange={val => setPricingPayload({...pricingPayload, version: val})} 
                               placeholder="3.1"
                            />
                            <EditSelect 
                               label="Operation Mode" value={pricingPayload.mode || 'relaxed'} 
                               options={['relaxed', 'fast', 'pro', 'reason', 'professional', 'standard', 'quality']}
                               onChange={val => setPricingPayload({...pricingPayload, mode: val})} 
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                           <EditSelect 
                              label="Deployment Status" value={pricingPayload.status || 'active'} 
                              options={['active', 'deprecated', 'disabled']}
                              onChange={val => setPricingPayload({...pricingPayload, status: val})} 
                           />
                         </div>
                         <EditTextArea 
                           label="System Description" value={pricingPayload.description || ''} 
                           onChange={val => setPricingPayload({...pricingPayload, description: val})} 
                         />
                      </div>
                   </div>

                   {/* Economic Matrix Section */}
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Economic_Algorithm</h4>
                      <div className="grid grid-cols-3 gap-6">
                         <EditInput 
                            label="Base Credits" type="number"
                            value={pricingPayload.baseCredits.toString()} 
                            onChange={val => setPricingPayload({...pricingPayload, baseCredits: parseInt(val) || 0})} 
                         />
                         <EditInput 
                            label="Cost Per Second" type="number"
                            value={pricingPayload.perSecond.toString()} 
                            onChange={val => setPricingPayload({...pricingPayload, perSecond: parseInt(val) || 0})} 
                         />
                         <EditInput 
                            label="Default Duration" type="number"
                            value={pricingPayload.defaultDuration?.toString() || '4'} 
                            onChange={val => setPricingPayload({...pricingPayload, defaultDuration: parseInt(val) || 4})} 
                         />
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                         <EditInput 
                            label="Resolutions Multipliers (Format: Res:Mul, e.g. 720p:1, 1080p:1.5)" 
                            value={resInput} 
                            onChange={val => setResInput(val)} 
                            placeholder="720p:1, 1080p:1.5"
                         />
                         <EditInput 
                            label="Durations (Comma separated numbers, e.g. 5, 8, 10)" 
                            value={durInput} 
                            onChange={val => setDurInput(val)} 
                            placeholder="5, 8, 10"
                         />
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-6 shrink-0 transition-colors">
                   <button onClick={() => { setIsPricingDrawerOpen(false); setEditingPricingId(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Abort_Changes</button>
                   <button 
                     onClick={handleSavePricing}
                     disabled={isSaving}
                     className="bg-brand-blue text-white px-12 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/20 flex items-center gap-4 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                   >
                      {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor"/>}
                      {editingPricingId ? 'Update Configuration' : 'Publish Configuration'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREDIT PACK MANIFEST DRAWER (FULL FIELDS) --- */}
      <AnimatePresence>
        {isPackDrawerOpen && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPackDrawerOpen(false)} />
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-5xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-2xl shadow-inner"><Coins size={28} /></div>
                      <div>
                         <h3 className="text-2xl font-black uppercase tracking-tight italic">{editingPackId ? 'Update Credit Bundle' : 'Create New Bundle'}</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">FINANCIAL_UNIT_AUTHORIZATION</p>
                      </div>
                   </div>
                   <button onClick={() => setIsPackDrawerOpen(false)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><X size={32}/></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-10 space-y-12 no-scrollbar">
                   {/* 1. Identity & Pricing */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2 flex items-center gap-3"><AlignLeft size={14}/> Basic_Identity</h4>
                        <EditInput label="UNIQUE CODE" value={packPayload.code} onChange={(v) => setPackPayload({...packPayload, code: v})} placeholder="pro_monthly" />
                        <EditInput label="DISPLAY NAME" value={packPayload.name} onChange={(v) => setPackPayload({...packPayload, name: v})} placeholder="Pro Creator Hub" />
                        <EditTextArea label="DESCRIPTION" value={packPayload.description || ''} onChange={(v) => setPackPayload({...packPayload, description: v})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                           <EditInput label="SORT ORDER" type="number" value={packPayload.sortOrder?.toString() || '0'} onChange={(v) => setPackPayload({...packPayload, sortOrder: parseInt(v) || 0})} />
                           <EditSelect label="CURRENCY" value={packPayload.currency || 'USD'} options={['USD', 'VND', 'EUR']} onChange={(v) => setPackPayload({...packPayload, currency: v})} />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2 flex items-center gap-3"><DollarSign size={14}/> Financial_Model</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <EditInput label="CURRENT PRICE" type="number" value={packPayload.price.toString()} onChange={(v) => setPackPayload({...packPayload, price: parseFloat(v) || 0})} />
                           <EditInput label="ORIGINAL PRICE" type="number" value={packPayload.originalPrice?.toString() || '0'} onChange={(v) => setPackPayload({...packPayload, originalPrice: parseFloat(v) || 0})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <EditSelect label="BILLING CYCLE" value={packPayload.billingCycle || 'monthly'} options={['monthly', 'annual']} onChange={(v: any) => setPackPayload({...packPayload, billingCycle: v})} />
                           <EditInput label="BILLED MONTHS" type="number" value={packPayload.billedMonths?.toString() || '1'} onChange={(v) => setPackPayload({...packPayload, billedMonths: parseInt(v) || 1})} />
                        </div>
                        <EditInput label="DISCOUNT PERCENT" type="number" value={packPayload.discountPercent?.toString() || '0'} onChange={(v) => setPackPayload({...packPayload, discountPercent: parseInt(v) || 0})} />
                      </div>
                   </div>

                   {/* 2. Quota & Engine */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-slate-200 dark:border-white/5 transition-colors">
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2 flex items-center gap-3"><Zap size={14}/> Quota_Algorithm</h4>
                        <EditInput label="BASE CREDITS" type="number" value={packPayload.credits.toString()} onChange={(v) => setPackPayload({...packPayload, credits: parseInt(v) || 0})} />
                        <div className="grid grid-cols-2 gap-4">
                           <EditInput label="BONUS PERCENT" type="number" value={packPayload.bonusPercent?.toString() || '0'} onChange={(v) => setPackPayload({...packPayload, bonusPercent: parseInt(v) || 0})} />
                           <EditInput label="BONUS FIXED CREDITS" type="number" value={packPayload.bonusCredits?.toString() || '0'} onChange={(v) => setPackPayload({...packPayload, bonusCredits: parseInt(v) || 0})} />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2 flex items-center gap-3"><Layout size={14}/> UI_Visual_Flags</h4>
                        <div className="flex gap-10">
                           <EditToggle label="Popular (Flag)" checked={!!packPayload.popular} onChange={v => setPackPayload({...packPayload, popular: v})} />
                           <EditToggle label="Highlight (Flag)" checked={!!packPayload.highlight} onChange={v => setPackPayload({...packPayload, highlight: v})} />
                           <EditToggle label="Active (Status)" checked={!!packPayload.active} onChange={v => setPackPayload({...packPayload, active: v})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <EditInput label="BADGE TEXT" value={packPayload.badge || ''} onChange={(v) => setPackPayload({...packPayload, badge: v})} placeholder="+25% BONUS" />
                           <EditInput label="CTA TEXT" value={packPayload.ctaText || 'Nâng cấp ngay'} onChange={(v) => setPackPayload({...packPayload, ctaText: v})} />
                        </div>
                        
                        <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl space-y-4 shadow-inner transition-colors">
                           <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Ribbon Branding</label>
                           <div className="grid grid-cols-2 gap-4">
                              <EditInput label="TEXT" value={packPayload.ribbon?.text || ''} onChange={(v) => setPackPayload({...packPayload, ribbon: {...packPayload.ribbon!, text: v}})} />
                              <EditInput label="ICON" value={packPayload.ribbon?.icon || ''} onChange={(v) => setPackPayload({...packPayload, ribbon: {...packPayload.ribbon!, icon: v}})} />
                           </div>
                           <EditInput label="COLOR (HEX)" value={packPayload.ribbon?.color || '#FFE135'} onChange={(v) => setPackPayload({...packPayload, ribbon: {...packPayload.ribbon!, color: v}})} />
                        </div>
                      </div>
                   </div>

                   {/* 3. Features & Unlimited Models (DYNAMIC LISTS) */}
                   <div className="space-y-12 pt-12 border-t border-slate-200 dark:border-white/5 transition-colors">
                      {/* Features */}
                      <div className="space-y-6">
                         <div className="flex justify-between items-center border-b border-brand-blue/20 pb-2">
                           <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] flex items-center gap-3"><CheckCircle2 size={14}/> Features_Manifest</h4>
                           <button 
                             onClick={() => setPackPayload({...packPayload, features: [...(packPayload.features || []), { key: '', label: '', enabled: true, highlight: false }]})}
                             className="text-brand-blue hover:scale-110 transition-transform"><PlusCircle size={18} />
                           </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(packPayload.features || []).map((feat, idx) => (
                               <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl space-y-4 relative group transition-all hover:border-brand-blue/30 shadow-sm">
                                  <button onClick={() => setPackPayload({...packPayload, features: packPayload.features?.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                  <div className="grid grid-cols-2 gap-3">
                                     <EditInput label="KEY" value={feat.key} onChange={(v) => {
                                        const next = [...packPayload.features!];
                                        next[idx].key = v;
                                        setPackPayload({...packPayload, features: next});
                                     }} />
                                     <EditInput label="LABEL" value={feat.label} onChange={(v) => {
                                        const next = [...packPayload.features!];
                                        next[idx].label = v;
                                        setPackPayload({...packPayload, features: next});
                                     }} />
                                  </div>
                                  <div className="flex gap-6">
                                     <EditToggle label="Enabled" checked={feat.enabled} onChange={v => {
                                        const next = [...packPayload.features!];
                                        next[idx].enabled = v;
                                        setPackPayload({...packPayload, features: next});
                                     }} />
                                     <EditToggle label="Extra" checked={feat.highlight} onChange={v => {
                                        const next = [...packPayload.features!];
                                        next[idx].highlight = v;
                                        setPackPayload({...packPayload, features: next});
                                     }} />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Unlimited Models */}
                      <div className="space-y-6">
                         <div className="flex justify-between items-center border-b border-brand-blue/20 pb-2">
                           <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] flex items-center gap-3"><Sparkles size={14}/> Unlimited_Models_Entry</h4>
                           <button 
                             onClick={() => setPackPayload({...packPayload, unlimitedModels: [...(packPayload.unlimitedModels || []), { modelKey: '', label: '', badge: 'UNLIMITED', enabled: true, highlight: false }]})}
                             className="text-brand-blue hover:scale-110 transition-transform"><PlusCircle size={18} />
                           </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(packPayload.unlimitedModels || []).map((model, idx) => (
                               <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl space-y-4 relative group transition-all hover:border-brand-blue/30 shadow-sm">
                                  <button onClick={() => setPackPayload({...packPayload, unlimitedModels: packPayload.unlimitedModels?.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                  <div className="grid grid-cols-2 gap-3">
                                     <EditInput label="MODEL KEY" value={model.modelKey} onChange={(v) => {
                                        const next = [...packPayload.unlimitedModels!];
                                        next[idx].modelKey = v;
                                        setPackPayload({...packPayload, unlimitedModels: next});
                                     }} />
                                     <EditInput label="LABEL" value={model.label} onChange={(v) => {
                                        const next = [...packPayload.unlimitedModels!];
                                        next[idx].label = v;
                                        setPackPayload({...packPayload, unlimitedModels: next});
                                     }} />
                                  </div>
                                  <div className="grid grid-cols-1">
                                     <EditInput label="BADGE (e.g. UNLIMITED)" value={model.badge} onChange={(v) => {
                                        const next = [...packPayload.unlimitedModels!];
                                        next[idx].badge = v;
                                        setPackPayload({...packPayload, unlimitedModels: next});
                                     }} />
                                  </div>
                                  <div className="flex gap-6">
                                     <EditToggle label="Enabled" checked={model.enabled} onChange={v => {
                                        const next = [...packPayload.unlimitedModels!];
                                        next[idx].enabled = v;
                                        setPackPayload({...packPayload, unlimitedModels: next});
                                     }} />
                                     <EditToggle label="Highlight" checked={model.highlight} onChange={v => {
                                        const next = [...packPayload.unlimitedModels!];
                                        next[idx].highlight = v;
                                        setPackPayload({...packPayload, unlimitedModels: next});
                                     }} />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Theme Config */}
                      <div className="space-y-6">
                         <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2 flex items-center gap-3"><Palette size={14}/> Theme_Matrix</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl shadow-inner transition-colors">
                            <EditInput label="GRADIENT FROM" value={packPayload.theme?.gradientFrom || ''} onChange={v => setPackPayload({...packPayload, theme: {...packPayload.theme!, gradientFrom: v}})} />
                            <EditInput label="GRADIENT TO" value={packPayload.theme?.gradientTo || ''} onChange={v => setPackPayload({...packPayload, theme: {...packPayload.theme!, gradientTo: v}})} />
                            <EditInput label="ACCENT COLOR" value={packPayload.theme?.accentColor || ''} onChange={v => setPackPayload({...packPayload, theme: {...packPayload.theme!, accentColor: v}})} />
                            <EditSelect label="BTN STYLE" value={packPayload.theme?.buttonStyle || 'solid'} options={['solid', 'neon', 'pink']} onChange={v => setPackPayload({...packPayload, theme: {...packPayload.theme!, buttonStyle: v as any}})} />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-10 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/60 flex justify-between items-center gap-10 shrink-0 transition-colors">
                   <button onClick={() => setIsPackDrawerOpen(false)} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Abort_Changes</button>
                   <button onClick={handleSavePack} disabled={isSaving} className="flex-grow bg-brand-blue text-white py-6 rounded-2xl text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(0,144,255,0.3)] flex items-center justify-center gap-6 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {isSaving ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24}/>}
                      {editingPackId ? 'ĐỒNG BỘ MANIFEST' : 'XUẤT BẢN GÓI NẠP'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- AI MODEL CONFIG DRAWER --- */}
      <AnimatePresence>
        {isAiModelDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAiModelDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
              <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                <div className="flex items-center gap-4">
                  <Bot className="text-brand-blue" size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tight italic">
                    {editingAiModelId ? 'Update Model Registry' : 'Register New AI Model'}
                  </h3>
                </div>
                <button onClick={() => setIsAiModelDrawerOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
                 <div className="grid grid-cols-2 gap-6">
                    <EditInput label="MODEL KEY (Unique)" value={aiModelPayload.key} onChange={v => setAiModelPayload({...aiModelPayload, key: v})} placeholder="google_gemini_3" />
                    <EditInput label="DISPLAY NAME" value={aiModelPayload.name} onChange={v => setAiModelPayload({...aiModelPayload, name: v})} placeholder="Gemini 3 Pro" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <EditInput label="PROVIDER" value={aiModelPayload.provider || ''} onChange={v => setAiModelPayload({...aiModelPayload, provider: v})} placeholder="Google, OpenAI" />
                    <EditInput label="ROUTE/PROTOCOL" value={aiModelPayload.route} onChange={v => setAiModelPayload({...aiModelPayload, route: v})} placeholder="/v1/chat/completions" />
                 </div>
                 <EditInput label="LOGO URL" value={aiModelPayload.logoUrl} onChange={v => setAiModelPayload({...aiModelPayload, logoUrl: v})} />
                 <EditTextArea label="DESCRIPTION" value={aiModelPayload.description || ''} onChange={v => setAiModelPayload({...aiModelPayload, description: v})} />
                 <div className="grid grid-cols-2 gap-6">
                    <EditSelect label="CATEGORY" value={aiModelPayload.category || 'text'} options={['text', 'image', 'video', 'audio']} onChange={v => setAiModelPayload({...aiModelPayload, category: v as any})} />
                    <EditInput label="SORT ORDER" type="number" value={aiModelPayload.order?.toString() || '0'} onChange={v => setAiModelPayload({...aiModelPayload, order: parseInt(v) || 0})} />
                 </div>
                 <EditSelect label="STATUS" value={aiModelPayload.status || 'active'} options={['active', 'inactive', 'draft']} onChange={v => setAiModelPayload({...aiModelPayload, status: v as any})} />
              </div>

              <div className="p-8 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex gap-4 shrink-0 transition-colors">
                <button onClick={() => setIsAiModelDrawerOpen(false)} className="flex-grow py-4 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-500">Hủy bỏ</button>
                <button onClick={handleSaveAiModel} disabled={isSaving} className="flex-grow py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} 
                  {editingAiModelId ? 'Update Registry' : 'Publish Model'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Internal Atomic UI
interface EditInputProps { label: string; value?: string; onChange: (val: string) => void; placeholder?: string; type?: string; disabled?: boolean; }
const EditInput = ({ label, value, onChange, placeholder, type = "text", disabled = false }: EditInputProps) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label>
     <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={`w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'text-slate-900 dark:text-white shadow-inner focus:bg-white dark:focus:bg-black'}`} />
  </div>
);

const EditTextArea = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label>
     <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all resize-none shadow-inner text-slate-900 dark:text-white" />
  </div>
);

const EditSelect = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label>
     <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all shadow-inner appearance-none cursor-pointer text-slate-900 dark:text-white">
          {options.map((opt: string) => <option key={opt} value={opt} className="bg-white dark:bg-black">{opt.toUpperCase()}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
     </div>
  </div>
);

const EditToggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center gap-4">
    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</span>
    <button onClick={() => onChange(!checked)} className="focus:outline-none transition-all">
       {checked ? <ToggleRight size={32} className="text-brand-blue" /> : <ToggleLeft size={32} className="text-gray-300" />}
    </button>
  </div>
);

export default AdminCmsProPage;
