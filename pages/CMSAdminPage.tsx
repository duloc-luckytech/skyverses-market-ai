import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Plus, Trash2, Search, 
  Terminal, Cpu, CheckCircle2, AlertTriangle,
  Edit3, Loader2, Database, Zap,
  CloudUpload, X, Check, Activity,
  Layers, Globe, Fingerprint, RefreshCw,
  HardDrive, Cloud, Eye, EyeOff, Coins,
  Tag, Tag as TagIcon, LayoutList, DollarSign,
  Monitor, Clock, Filter as FilterIcon,
  PlusCircle, BarChart3, Binary, List,
  Info, ChevronDown, ChevronUp, Box,
  AlertCircle, ShieldCheck, Workflow,
  FileCode, Layers as LayersIcon
} from 'lucide-react';
import { marketApi } from '../apis/market';
import { pricingApi, PricingModel, PricingFilters, CreatePricingRequest } from '../apis/pricing';
import { Solution } from '../types';
import { SOLUTIONS as LOCAL_SOLUTIONS } from '../data';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

type AdminTab = 'LOCAL' | 'CLOUD' | 'PRICING';

const CMSAdminPage = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('CLOUD');
  const [remoteSolutions, setRemoteSolutions] = useState<Solution[]>([]);
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Expanded State for Pricing Models
  const [expandedPricingIds, setExpandedPricingIds] = useState<string[]>([]);

  // Edit Solution States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<Solution | null>(null);
  
  // Pricing States
  const [isPricingDrawerOpen, setIsPricingDrawerOpen] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  
  // Local string inputs for complex structures to avoid UI jumping and allow commas
  const [resInput, setResInput] = useState(''); // Format: "720p:1, 1080p:1.5"
  const [durInput, setDurInput] = useState(''); // Format: "5, 8, 10"

  const [pricingPayload, setPricingPayload] = useState<CreatePricingRequest>({
    tool: 'video',
    engine: 'gommo',
    modelKey: 'veo_3_1',
    version: '3.1',
    name: '',
    mode: 'relaxed',
    baseCredits: 20,
    perSecond: 2,
    defaultDuration: 5,
    resolutions: {}, 
    durations: [5, 8, 10],
    description: '',
    status: 'active'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Pricing Specific Filters
  const [pricingFilters, setPricingFilters] = useState<PricingFilters>({
    engine: '',
    modelKey: '',
    version: '',
    tool: ''
  });

  // Lấy dữ liệu từ Cloud API
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'PRICING') {
        const res = await pricingApi.getPricing(pricingFilters);
        if (res.success) {
          setPricingModels(res.data);
        }
      } else {
        const res = await marketApi.getSolutions();
        if (res && res.data) {
          setRemoteSolutions(res.data);
        } else if (Array.isArray(res)) {
          setRemoteSolutions(res);
        }
      }
    } catch (error) {
      console.error("Uplink Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const displayNodes = useMemo(() => {
    if (activeTab === 'PRICING') return [];
    
    let baseList: Solution[] = [];
    if (activeTab === 'CLOUD') {
      baseList = [...remoteSolutions];
    } else {
      baseList = [...LOCAL_SOLUTIONS];
    }

    return baseList.filter(n => 
      n.name.en.toLowerCase().includes(search.toLowerCase()) ||
      n.slug.toLowerCase().includes(search.toLowerCase()) ||
      (n.id && n.id.toLowerCase().includes(search.toLowerCase()))
    );
  }, [activeTab, remoteSolutions, search]);

  const togglePricingExpand = (id: string) => {
    setExpandedPricingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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

  const handleEditPricing = (model: PricingModel) => {
    setEditingPricingId(model._id);
    
    if (!expandedPricingIds.includes(model._id)) {
      setExpandedPricingIds(prev => [...prev, model._id]);
    }

    const resolutions = Object.keys(model.pricing || {});
    const firstRes = resolutions[0];
    const durations = firstRes ? Object.keys(model.pricing[firstRes]).map(Number) : [];
    
    const resString = resolutions.map(r => `${r}:1`).join(', ');
    setResInput(resString);
    setDurInput(durations.join(', '));

    setPricingPayload({
      tool: model.tool,
      engine: model.engine,
      modelKey: model.modelKey,
      version: model.version,
      name: model.name,
      mode: model.mode,
      baseCredits: 20, 
      perSecond: 2,
      defaultDuration: 5,
      resolutions: {}, 
      durations: durations,
      description: model.description,
      status: model.status
    });
    setIsPricingDrawerOpen(true);
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

  const handleAddNew = () => {
    if (activeTab === 'PRICING') {
      setEditingPricingId(null);
      setResInput('720p:1, 1080p:1.5');
      setDurInput('5, 8, 10');
      setPricingPayload({
        tool: 'video',
        engine: 'gommo',
        modelKey: 'veo_3_1',
        version: '3.1',
        name: '',
        mode: 'relaxed',
        baseCredits: 20,
        perSecond: 2,
        defaultDuration: 5,
        resolutions: {},
        durations: [5, 8, 10],
        description: '',
        status: 'active'
      });
      setIsPricingDrawerOpen(true);
    } else {
      const emptyNode: Solution = {
        id: `NODE_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        slug: 'new-service-slug',
        name: { en: '', vi: '', ko: '', ja: '' },
        category: { en: 'Audio AI', vi: 'Âm thanh AI', ko: '', ja: '' },
        description: { en: '', vi: '', ko: '', ja: '' },
        problems: [],
        industries: [],
        models: [],
        priceCredits: 0,
        isFree: false,
        imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600',
        demoType: 'text',
        tags: [],
        features: [],
        complexity: 'Standard',
        priceReference: 'Contact for Quote',
        isActive: true
      };
      setEditedItem(emptyNode);
      setEditingId('NEW');
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

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      const resObj: Record<string, number> = {};
      resInput.split(',').forEach(part => {
        const [key, val] = part.split(':');
        if (key && val) {
          resObj[key.trim()] = parseFloat(val.trim()) || 1;
        }
      });

      const finalDurations = durInput.split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n));

      const payload: any = {
        ...pricingPayload,
        resolutions: resObj,
        durations: finalDurations
      };

      let res;
      if (editingPricingId) {
        res = await pricingApi.updatePricing(editingPricingId, payload);
      } else {
        res = await pricingApi.createPricing(payload);
      }
      
      if (res.success) {
        await fetchData();
        setIsPricingDrawerOpen(false);
        setEditingPricingId(null);
        alert(editingPricingId ? "Pricing Configuration Updated." : "New Pricing Configuration Manifested.");
      } else {
        alert("Error: " + (res.message || "Pricing Uplink Failed"));
      }
    } catch (e) {
      alert("Critical Sync Error: Check your input syntax (e.g. 720p:1, 1080p:1.5)");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePricingFilter = (key: keyof PricingFilters, value: string) => {
    setPricingFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#020203] text-black dark:text-white font-sans transition-colors duration-500 pt-24 pb-40 selection:bg-brand-blue/30">
      
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-blue">
                 <Database size={24} />
                 <span className="text-[12px] font-black uppercase tracking-[0.6em] italic">Inventory_Manager_v3.5</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none">Market <span className="text-brand-blue">CMS.</span></h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                System Registry Controller
              </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {activeTab !== 'PRICING' ? (
                <div className="relative flex-grow md:w-80 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue" size={16} />
                   <input 
                     type="text" value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Tìm kiếm theo slug hoặc tên..."
                     className="w-full bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs font-bold focus:border-brand-blue outline-none transition-all"
                   />
                </div>
              ) : null}
              <button 
                onClick={handleAddNew}
                className="bg-brand-blue text-white px-8 py-4 rounded-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
              >
                 <Plus size={18} /> {activeTab === 'PRICING' ? 'Create New Pricing' : 'Register New Node'}
              </button>
           </div>
        </header>

        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-1 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl border border-black/5 dark:border-white/10 w-fit">
            <button 
              onClick={() => setActiveTab('CLOUD')}
              className={`flex items-center gap-3 px-8 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'CLOUD' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              <Cloud size={16} className={activeTab === 'CLOUD' && loading ? 'animate-spin' : ''} /> 
              Cloud Database ({remoteSolutions.length})
            </button>
            <button 
              onClick={() => setActiveTab('LOCAL')}
              className={`flex items-center gap-3 px-8 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'LOCAL' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              <HardDrive size={16} /> 
              Local Registry ({LOCAL_SOLUTIONS.length})
            </button>
            <button 
              onClick={() => setActiveTab('PRICING')}
              className={`flex items-center gap-3 px-8 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'PRICING' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
            >
              <DollarSign size={16} className={activeTab === 'PRICING' && loading ? 'animate-spin' : ''} /> 
              Pricing Models
            </button>
            <button onClick={fetchData} className="p-3 text-gray-400 hover:text-brand-blue transition-colors ml-2" title="Sync Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {activeTab === 'PRICING' && (
            <div className="flex flex-wrap items-center gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/10">
               <div className="flex items-center gap-2 px-3 border-r border-black/10 dark:border-white/10 last:border-0">
                  <span className="text-[9px] font-black uppercase text-gray-400">Tool</span>
                  <input 
                    type="text" value={pricingFilters.tool} onChange={e => updatePricingFilter('tool', e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-bold w-16"
                    placeholder="video"
                  />
               </div>
               <div className="flex items-center gap-2 px-3 border-r border-black/10 dark:border-white/10 last:border-0">
                  <span className="text-[9px] font-black uppercase text-gray-400">Engine</span>
                  <input 
                    type="text" value={pricingFilters.engine} onChange={e => updatePricingFilter('engine', e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-bold w-20"
                    placeholder="gommo"
                  />
               </div>
               <div className="flex items-center gap-2 px-3 border-r border-black/10 dark:border-white/10 last:border-0">
                  <span className="text-[9px] font-black uppercase text-gray-400">Key</span>
                  <input 
                    type="text" value={pricingFilters.modelKey} onChange={e => updatePricingFilter('modelKey', e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-bold w-24"
                    placeholder="veo_3_1"
                  />
               </div>
               <div className="flex items-center gap-2 px-3 border-r border-black/10 dark:border-white/10 last:border-0">
                  <span className="text-[9px] font-black uppercase text-gray-400">Ver</span>
                  <input 
                    type="text" value={pricingFilters.version} onChange={e => updatePricingFilter('version', e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-bold w-12"
                    placeholder="3.1"
                  />
               </div>
               <button 
                 onClick={fetchData}
                 className="bg-brand-blue text-white p-2 rounded-lg hover:scale-105 transition-all"
               >
                 <FilterIcon size={14} />
               </button>
            </div>
          )}
        </div>

        {/* MAIN DATA GRID */}
        <div className="bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/10 rounded-sm overflow-hidden shadow-2xl">
           <AnimatePresence mode="wait">
             {activeTab === 'PRICING' ? (
                <motion.div 
                  key="pricing-table" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="overflow-x-auto"
                >
                   <table className="w-full text-left border-collapse font-mono">
                      <thead>
                         <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <th className="px-8 py-6">Model_Designation</th>
                            <th className="px-8 py-6">Tool</th>
                            <th className="px-8 py-6">Infrastructure / Provider</th>
                            <th className="px-8 py-6">Mode</th>
                            <th className="px-8 py-6 text-center">Status</th>
                            <th className="px-8 py-6 text-right">Operations</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-blue" /></td>
                          </tr>
                        ) : pricingModels.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-20 text-center opacity-30">
                              <Search size={48} className="mx-auto mb-4" />
                              <p className="text-[10px] font-black uppercase tracking-widest">Không tìm thấy Model giá nào phù hợp</p>
                            </td>
                          </tr>
                        ) : pricingModels.map((model) => {
                           const isExpanded = expandedPricingIds.includes(model._id);
                           const resolutions = Object.keys(model.pricing || {});
                           
                           return (
                             <React.Fragment key={model._id}>
                               <tr className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg">
                                           <Zap size={18} fill="currentColor" />
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-black text-black dark:text-white uppercase italic">{model.name}</p>
                                          </div>
                                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-xs">{model.modelKey}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[7px] font-black text-gray-500 uppercase tracking-widest border border-black/5 dark:border-white/10 group-hover:border-brand-blue group-hover:text-brand-blue transition-all">
                                        {model.tool}
                                     </span>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-brand-blue uppercase italic">{model.engine}</span>
                                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Version: {model.version}</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className="text-[10px] font-black uppercase text-slate-700 dark:text-gray-300">
                                        {model.mode || 'standard'}
                                     </span>
                                  </td>
                                  <td className="px-8 py-6 text-center">
                                     <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-sm border ${
                                       model.status === 'active' 
                                         ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                         : model.status === 'deprecated'
                                           ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                           : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                     }`}>
                                        {model.status}
                                     </span>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                     <div className="flex items-center justify-end gap-3">
                                        <button 
                                          onClick={() => handleEditPricing(model)}
                                          className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-lg transition-all"
                                          title="Edit Model Parameters"
                                        >
                                           <Edit3 size={14} />
                                        </button>
                                        <button 
                                          onClick={() => togglePricingExpand(model._id)}
                                          className={`p-2.5 rounded-lg transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isExpanded ? 'bg-brand-blue text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-gray-400 hover:text-brand-blue'}`}
                                          title={isExpanded ? "Thu gọn ma trận" : "Xổ ma trận giá"}
                                        >
                                           {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                           {isExpanded ? 'Hide' : 'Details'}
                                        </button>
                                     </div>
                                  </td>
                               </tr>

                               {/* EXPANDABLE PRICING MATRIX */}
                               <AnimatePresence>
                                  {isExpanded && (
                                    <motion.tr 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="bg-black/[0.03] dark:bg-white/[0.02]"
                                    >
                                       <td colSpan={6} className="px-20 py-10 border-b border-black/5 dark:border-white/5">
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                             {Object.entries(model.pricing || {}).map(([res, durations]) => (
                                                <div key={res} className="bg-white dark:bg-[#0c0c0e] border border-black/5 dark:border-white/5 p-6 rounded-xl space-y-4 shadow-sm">
                                                   <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-3">
                                                      <Monitor size={14} className="text-brand-blue" />
                                                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{res}</span>
                                                   </div>
                                                   <div className="space-y-2">
                                                      {Object.entries(durations).map(([dur, cost]) => (
                                                         <div key={dur} className="flex justify-between items-center text-[10px]">
                                                            <div className="flex items-center gap-2 text-gray-500">
                                                               <Clock size={10} />
                                                               <span className="font-bold">{dur}s</span>
                                                            </div>
                                                            <EditableCell 
                                                              modelId={model._id}
                                                              res={res}
                                                              dur={dur}
                                                              initialValue={cost as number}
                                                              onUpdate={fetchData}
                                                            />
                                                         </div>
                                                      ))}
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       </td>
                                    </motion.tr>
                                  )}
                               </AnimatePresence>
                             </React.Fragment>
                           );
                        })}
                      </tbody>
                   </table>
                </motion.div>
             ) : (
                <motion.div 
                  key="solutions-table"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="overflow-x-auto"
                >
                   <table className="w-full text-left border-collapse font-mono">
                      <thead>
                         <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <th className="px-8 py-6">Identity_Slug / UID</th>
                            <th className="px-8 py-6">Registry_Status</th>
                            {activeTab === 'CLOUD' && <th className="px-8 py-6">Visibility</th>}
                            <th className="px-8 py-6">Economics</th>
                            <th className="px-8 py-6">Localized_Strings (EN/VI)</th>
                            <th className="px-8 py-6">Infrastructure / Models</th>
                            <th className="px-8 py-6 text-right">Operations</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                         {loading && activeTab === 'CLOUD' && remoteSolutions.length === 0 ? (
                            <tr>
                               <td colSpan={7} className="py-40 text-center">
                                  <Loader2 className="animate-spin mx-auto text-brand-blue mb-4" size={40} />
                                  <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Cloud Database...</p>
                               </td>
                            </tr>
                         ) : displayNodes.map((sol) => {
                            const asynced = isSyncedOnCloud(sol.slug);
                            const targetId = sol._id || sol.id;
                            return (
                            <tr key={targetId} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded bg-black flex items-center justify-center overflow-hidden border border-white/10">
                                        <img src={sol.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">{sol.slug}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">ID: {sol.id}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  {asynced ? (
                                    <div className="flex items-center gap-2 text-emerald-500">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                       <span className="text-[9px] font-black uppercase tracking-widest">Asynced</span>
                                       <Check size={12} strokeWidth={4} />
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center gap-2 text-orange-500/60">
                                          <AlertTriangle size={12} />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Local_Only</span>
                                       </div>
                                       <button 
                                         onClick={() => handleEdit(sol)}
                                         className="p-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-md transition-all shadow-sm"
                                         title="Deploy this node to Cloud Database"
                                       >
                                          <CloudUpload size={14} />
                                       </button>
                                    </div>
                                  )}
                               </td>
                               {activeTab === 'CLOUD' && (
                                  <td className="px-8 py-6">
                                     <button 
                                       onClick={() => handleToggleActive(sol)}
                                       disabled={togglingId === targetId}
                                       className={`flex items-center gap-3 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                                         sol.isActive 
                                           ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                           : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500 hover:text-white'
                                       } disabled:opacity-50`}
                                     >
                                        {togglingId === targetId ? (
                                           <Loader2 size={12} className="animate-spin" />
                                        ) : sol.isActive ? (
                                           <Eye size={12} />
                                        ) : (
                                           <EyeOff size={12} />
                                        )}
                                        {sol.isActive ? 'Active' : 'Hidden'}
                                     </button>
                                  </td>
                               )}
                               <td className="px-8 py-6">
                                  <div className="flex flex-col gap-1">
                                     {sol.isFree ? (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-sm w-fit">Free_Access</span>
                                     ) : (
                                        <div className="flex items-center gap-2 text-orange-500">
                                           <Zap size={12} fill="currentColor" />
                                           <span className="text-[11px] font-black italic">{sol.priceCredits} Credits</span>
                                        </div>
                                     )}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="space-y-1 max-w-xs">
                                     <p className="text-[11px] font-black text-black dark:text-white uppercase truncate">{sol.name.en}</p>
                                     <p className="text-[10px] font-medium text-gray-500 italic line-clamp-1">"{sol.name.vi}"</p>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex flex-col gap-2">
                                     <div className="flex items-center gap-6">
                                        <div className="space-y-1">
                                           <p className="text-[8px] font-black uppercase text-gray-400">Compute</p>
                                           <p className="text-[10px] font-black text-brand-blue">{sol.complexity}</p>
                                        </div>
                                        <div className="space-y-1">
                                           <p className="text-[8px] font-black uppercase text-gray-400">Protocol</p>
                                           <p className="text-[10px] font-black text-black dark:text-white uppercase">{sol.demoType}</p>
                                        </div>
                                     </div>
                                     {sol.models && sol.models.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                           {sol.models.map(m => (
                                              <span key={m} className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[7px] font-black uppercase text-gray-500">{m}</span>
                                           ))}
                                        </div>
                                     )}
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                     <button 
                                       onClick={() => handleEdit(sol)}
                                       className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-lg transition-all"
                                     >
                                        <Edit3 size={14} />
                                     </button>
                                     {activeTab === 'CLOUD' && (
                                       <button 
                                         onClick={() => handleDelete(sol)}
                                         className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                       >
                                          <Trash2 size={14} />
                                       </button>
                                     )}
                                  </div>
                               </td>
                            </tr>
                         )})}
                      </tbody>
                   </table>
                   {displayNodes.length === 0 && !loading && (
                      <div className="py-40 text-center opacity-20">
                         <Search size={48} className="mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No entries found in {activeTab === 'CLOUD' ? 'Cloud Database' : 'Local Registry'}</p>
                      </div>
                   )}
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* --- NODE SPECIFICATION DRAWER (SOLUTIONS) --- */}
      <AnimatePresence>
        {editedItem && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => { setEditingId(null); setEditedItem(null); }}
             />
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10"
             >
                <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
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
                   <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative group">
                      <img src={editedItem.imageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 space-y-1">
                         <h4 className="text-xl font-black uppercase text-white tracking-tighter italic">{editedItem.name.en || 'UNNAMED_NODE'}</h4>
                         <span className="text-[8px] font-black text-brand-blue uppercase tracking-widest italic">{remoteSolutions.some(r => r.slug.toLowerCase().trim() === editedItem.slug.toLowerCase().trim()) ? 'CLOUD_NATIVE' : 'LOCAL_CACHE'}</span>
                      </div>
                   </div>

                   {/* Economics Matrix */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Economic_Protocol</h4>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Access Mode</label>
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                               <button 
                                 onClick={() => setEditedItem({...editedItem, isFree: true} as any)}
                                 className={`flex-grow py-2 text-[10px] font-black uppercase rounded-lg transition-all ${editedItem.isFree ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500'}`}
                               >
                                  Free
                               </button>
                               <button 
                                 onClick={() => setEditedItem({...editedItem, isFree: false} as any)}
                                 className={`flex-grow py-2 text-[10px] font-black uppercase rounded-lg transition-all ${!editedItem.isFree ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500'}`}
                               >
                                  Paid
                               </button>
                            </div>
                         </div>
                         {!editedItem.isFree && (
                            <EditInput 
                               label="Credit Cost" type="number" 
                               value={editedItem.priceCredits?.toString() || '0'} 
                               onChange={val => setEditedItem({...editedItem, priceCredits: parseInt(val) || 0} as any)} 
                            />
                         )}
                      </div>
                   </div>

                   {/* Identity Section */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Identity_Matrix</h4>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="grid grid-cols-2 gap-6">
                            <EditInput 
                               label="Registry Slug" value={editedItem.slug} 
                               onChange={val => setEditedItem({...editedItem, slug: val} as any)} 
                            />
                            <EditInput 
                               label="Legacy ID" value={editedItem.id} 
                               onChange={val => setEditedItem({...editedItem, id: val} as any)} 
                            />
                         </div>
                         <EditInput 
                           label="Display Name (EN)" value={editedItem.name.en} 
                           onChange={val => setEditedItem({...editedItem, name: {...editedItem.name, en: val}} as any)} 
                         />
                         <EditInput 
                           label="Display Name (VI)" value={editedItem.name.vi} 
                           onChange={val => setEditedItem({...editedItem, name: {...editedItem.name, vi: val}} as any)} 
                         />
                         <EditTextArea 
                           label="Semantic Description (EN)" value={editedItem.description.en} 
                           onChange={val => setEditedItem({...editedItem, description: {...editedItem.description, en: val}} as any)} 
                         />
                         <EditTextArea 
                           label="Semantic Description (VI)" value={editedItem.description.vi} 
                           onChange={val => setEditedItem({...editedItem, description: {...editedItem.description, vi: val}} as any)} 
                         />
                      </div>
                   </div>

                   {/* Protocol Section */}
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Operational_Protocol</h4>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="grid grid-cols-2 gap-6">
                            <EditSelect 
                              label="Synthesis Mode" value={editedItem.demoType} 
                              options={['text', 'image', 'video', 'automation']}
                              onChange={val => setEditedItem({...editedItem, demoType: val as any} as any)} 
                            />
                            <EditSelect 
                              label="Compute Tier" value={editedItem.complexity} 
                              options={['Standard', 'Advanced', 'Enterprise']}
                              onChange={val => setEditedItem({...editedItem, complexity: val as any} as any)} 
                            />
                         </div>
                         <EditInput 
                           label="Supported Models (Comma separated)" 
                           value={(editedItem.models || []).join(', ')} 
                           onChange={val => setEditedItem({...editedItem, models: val.split(',').map(s => s.trim()).filter(s => s !== '')} as any)} 
                           placeholder="gpt3.5, midjourney, veo3.1..."
                         />
                         <EditInput label="Visual Asset URL" value={editedItem.imageUrl} onChange={val => setEditedItem({...editedItem, imageUrl: val} as any)} />
                         <EditInput label="Pricing Reference" value={editedItem.priceReference} onChange={val => setEditedItem({...editedItem, priceReference: val} as any)} />
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-6 shrink-0">
                   <button onClick={() => { setEditingId(null); setEditedItem(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">Abort_Changes</button>
                   <button 
                     onClick={handleSaveSolution}
                     disabled={isSaving}
                     className="bg-brand-blue text-white px-12 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/20 flex items-center gap-4 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                   >
                      {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor"/>}
                      {remoteSolutions.some(r => r.slug.toLowerCase().trim() === editedItem.slug.toLowerCase().trim()) ? 'Synchronize Node' : 'Deploy to Cloud'}
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
               className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10"
             >
                <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
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
                               options={['relaxed', 'fast', 'pro']}
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
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Economic_Algorithm</h4>
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
                   
                   <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl flex gap-6 items-start shadow-inner transition-colors">
                      <div className="text-brand-blue shrink-0 mt-0.5"><Info size={20} /></div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 tracking-widest">Automatic Matrix Computation</p>
                        <p className="text-xs text-gray-500 dark:text-gray-600 leading-relaxed font-medium">
                          The system will automatically compute the <strong>Cost Grid</strong> for each Resolution/Duration pair based on: <br />
                          <code>Cost = (BaseCredits + (Duration * PerSecond)) * Multiplier</code>
                        </p>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-6 shrink-0">
                   <button onClick={() => { setIsPricingDrawerOpen(false); setEditingPricingId(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">Abort_Changes</button>
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

    </div>
  );
};

// --- INTERNAL ATOMIC UI ---

const EditableCell = ({ modelId, res, dur, initialValue, onUpdate }: any) => {
  const [value, setValue] = useState(initialValue !== undefined && initialValue !== null ? initialValue.toString() : '0');
  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = async () => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue === initialValue) {
      setValue(initialValue?.toString() ?? '0');
      return;
    }
    setIsSaving(true);
    try {
      const resApi = await pricingApi.updatePricingCell(modelId, res, parseInt(dur), numValue);
      if (resApi.success) {
        onUpdate();
      } else {
        alert("Lỗi cập nhật cell");
        setValue(initialValue?.toString() ?? '0');
      }
    } catch (e) {
      alert("Lỗi kết nối API");
      setValue(initialValue?.toString() ?? '0');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 text-orange-500 font-black relative group">
       <div className={`transition-all ${isSaving ? 'animate-pulse' : ''}`}><Zap size={10} fill="currentColor" /></div>
       <input 
         type="number"
         value={value}
         onChange={(e) => setValue(e.target.value)}
         onBlur={handleBlur}
         onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
         className="w-14 bg-transparent border-none outline-none text-right focus:bg-brand-blue/10 rounded transition-colors"
       />
       <span className="text-[7px] uppercase opacity-50">CR</span>
       {isSaving && (
         <div className="absolute inset-0 bg-white/10 dark:bg-black/10 flex items-center justify-center">
           <Loader2 size={8} className="animate-spin" />
         </div>
       )}
    </div>
  );
};

const EditInput = ({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string, disabled?: boolean }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
     <input 
       type={type}
       value={value} onChange={e => onChange(e.target.value)}
       placeholder={placeholder}
       disabled={disabled}
       className={`w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-brand-blue transition-all ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'text-black dark:text-white'}`}
     />
  </div>
);

const EditTextArea = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
     <textarea 
       rows={3}
       value={value} onChange={e => onChange(e.target.value)}
       className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-brand-blue transition-all resize-none text-black dark:text-white"
     />
  </div>
);

const EditSelect = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
     <select 
       value={value} onChange={e => onChange(e.target.value)}
       className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-brand-blue transition-all text-black dark:text-white"
     >
        {options.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-[#111]">{opt}</option>)}
     </select>
  </div>
);

export default CMSAdminPage;