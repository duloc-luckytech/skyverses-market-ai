
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Edit3, ChevronDown, Monitor, Clock, 
  Loader2, Trash2, Search, Filter as FilterIcon,
  X, DollarSign, Settings2, Info, RefreshCw, Plus, Check, Copy, Globe, Maximize2
} from 'lucide-react';
import { pricingApi, PricingModel, PricingFilters, CreatePricingRequest } from '../../apis/pricing';

export const PricingTab: React.FC = () => {
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<PricingFilters>({
    engine: '', modelKey: '', version: '', tool: ''
  });

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newModeInput, setNewModeInput] = useState('');
  const [resInput, setResInput] = useState('720p:1, 1080p:1.5');
  const [durInput, setDurInput] = useState('5, 8, 10');
  const [aspectRatioInput, setAspectRatioInput] = useState('1:1, 16:9, 9:16, 4:3, 3:4');
  const [payload, setPayload] = useState<CreatePricingRequest>({
    tool: 'video', engine: 'gommo', modelKey: 'veo_3_1', version: '3.1', name: '', modes: ['relaxed'],
    baseCredits: 20, perSecond: 2, defaultDuration: 4, resolutions: {}, durations: [5, 8, 10], aspectRatios: [],
    description: '', status: 'active'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await pricingApi.getPricing(filters);
      if (res.success) setPricingModels(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const filteredModels = useMemo(() => pricingModels.filter(m => 
    !search || 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.modelKey.toLowerCase().includes(search.toLowerCase())
  ), [pricingModels, search]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setResInput('720p:1, 1080p:1.5');
    setDurInput('5, 8, 10');
    setAspectRatioInput('1:1, 16:9, 9:16, 4:3, 3:4');
    setPayload({
      tool: 'video', engine: 'gommo', modelKey: 'veo_3_1', version: '3.1',
      name: '', modes: ['relaxed'], baseCredits: 20, perSecond: 2, defaultDuration: 5,
      resolutions: {}, durations: [5, 8, 10], aspectRatios: [], description: '', status: 'active'
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (model: PricingModel) => {
    setEditingId(model._id);
    const resolutions = Object.keys(model.pricing || {});
    const firstRes = resolutions[0];
    const durations = firstRes ? Object.keys(model.pricing[firstRes]).map(Number) : [];
    setResInput(resolutions.map(r => `${r}:1`).join(', '));
    setDurInput(durations.join(', '));
    setAspectRatioInput(model.aspectRatios?.join(', ') || '1:1, 16:9, 9:16, 4:3, 3:4');
    setPayload({
      tool: model.tool, engine: model.engine, modelKey: model.modelKey, version: model.version,
      name: model.name, modes: model.modes || [model.mode || 'relaxed'], baseCredits: 20, perSecond: 2, defaultDuration: 5,
      resolutions: {}, durations: durations, aspectRatios: model.aspectRatios || [], description: model.description, status: model.status
    });
    setIsDrawerOpen(true);
  };

  const handleDuplicate = (model: PricingModel) => {
    setEditingId(null); 
    const resolutions = Object.keys(model.pricing || {});
    const firstRes = resolutions[0];
    const durations = firstRes ? Object.keys(model.pricing[firstRes]).map(Number) : [];
    setResInput(resolutions.map(r => `${r}:1`).join(', '));
    setDurInput(durations.join(', '));
    setAspectRatioInput(model.aspectRatios?.join(', ') || '1:1, 16:9, 9:16, 4:3, 3:4');
    setPayload({
      tool: model.tool, engine: model.engine, modelKey: `${model.modelKey}_copy`,
      version: model.version,
      name: `${model.name} (Copy)`,
      modes: model.modes || [model.mode || 'relaxed'], 
      baseCredits: 20, 
      perSecond: 2, 
      defaultDuration: 5,
      resolutions: {}, 
      durations: durations, 
      aspectRatios: model.aspectRatios || [],
      description: model.description, 
      status: 'active'
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const resObj: Record<string, number> = {};
      resInput.split(',').forEach(part => {
        const [key, val] = part.split(':');
        if (key && val) resObj[key.trim()] = parseFloat(val.trim()) || 1;
      });
      const finalDurations = durInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const finalAspectRatios = aspectRatioInput.split(',').map(s => s.trim()).filter(Boolean);
      const body: any = {
        ...payload,
        resolutions: resObj,
        durations: finalDurations,
        aspectRatios: finalAspectRatios,
        mode: payload.modes?.[0] || '' 
      };
      let res;
      if (editingId) res = await pricingApi.updatePricing(editingId, body);
      else res = await pricingApi.createPricing(body);
      
      if (res.success) {
        setIsDrawerOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Purge Model Configuration?")) return;
    try {
      await pricingApi.deletePricing(id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const addMode = () => {
    if (!newModeInput.trim()) return;
    if (payload.modes?.includes(newModeInput.trim())) return;
    setPayload({
      ...payload,
      modes: [...(payload.modes || []), newModeInput.trim()]
    });
    setNewModeInput('');
  };

  const removeMode = (mode: string) => {
    setPayload({
      ...payload,
      modes: payload.modes?.filter(m => m !== mode) || []
    });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white dark:bg-[#08080a] p-8 lg:p-12 border-b border-slate-200 dark:border-white/5 transition-all">
        <div className="space-y-6 flex-grow w-full lg:w-auto">
          <div className="relative w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue" size={20} />
            <input 
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc model key..."
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-brand-blue text-slate-800 dark:text-white shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {/* Filter by Tool */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Loại công cụ</label>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                {['', 'image', 'video'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilters({ ...filters, tool: t })}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.tool === t ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {t === '' ? 'Tất cả' : `${t.toUpperCase()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Engine */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Hạ tầng (Engine)</label>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                {['', 'gommo', 'fxlab', 'wan'].map(e => (
                  <button 
                    key={e}
                    onClick={() => setFilters({ ...filters, engine: e })}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.engine === e ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {e === '' ? 'Tất cả' : e.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 shrink-0">
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} strokeWidth={3} /> Thêm cấu hình
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-blue transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới Registry
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse font-mono">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
              <th className="px-8 py-6">Định danh Model</th>
              <th className="px-8 py-6">Công cụ</th>
              <th className="px-8 py-6">Hạ tầng</th>
              <th className="px-8 py-6 text-center">Trạng thái</th>
              <th className="px-8 py-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-blue" /></td></tr>
            ) : filteredModels.length > 0 ? filteredModels.map((model) => (
              <React.Fragment key={model._id}>
                <tr className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg shadow-inner"><Zap size={18} fill="currentColor" /></div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-black dark:text-white uppercase italic">{model.name}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-xs">{model.modelKey}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[7px] font-black text-gray-500 uppercase tracking-widest border border-black/5 dark:border-white/10 text-slate-900 dark:text-white">{model.tool}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-brand-blue uppercase italic">{model.engine}</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">v{model.version}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-sm border ${model.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>{model.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDuplicate(model)} title="Nhân bản" className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white rounded-lg transition-all shadow-sm"><Copy size={14} /></button>
                      <button onClick={() => handleEdit(model)} title="Chỉnh sửa" className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-lg transition-all shadow-sm"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(model._id)} title="Xóa" className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm"><Trash2 size={14} /></button>
                      <button onClick={() => toggleExpand(model._id)} className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 text-gray-400 hover:text-brand-blue transition-all"><ChevronDown size={14} className={`transition-transform ${expandedIds.includes(model._id) ? 'rotate-180' : ''}`} /></button>
                    </div>
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedIds.includes(model._id) && (
                    <motion.tr initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/[0.01] dark:bg-white/[0.01]">
                      <td colSpan={5} className="px-12 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Object.entries(model.pricing || {}).map(([res, durMap]) => (
                            <div key={res} className="p-4 bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl shadow-sm">
                              <p className="text-[9px] font-black uppercase text-brand-blue mb-3 pb-2 border-b border-black/5 dark:border-white/5 flex items-center gap-2"><Monitor size={10}/>{res}</p>
                              <div className="space-y-2">
                                {Object.entries(durMap as any).map(([dur, cost]) => (
                                  <div key={dur} className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-500 flex items-center gap-1.5"><Clock size={10}/>{dur}s</span>
                                    <EditableCell modelId={model._id} res={res} dur={dur} initialValue={cost as number} onUpdate={async (id: string, r: string, d: string, v: number) => { const result = await pricingApi.updatePricingCell(id, r, Number(d), v); fetchData(); return result; }} />
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
            )) : (
              <tr>
                <td colSpan={5} className="py-40 text-center opacity-30">
                  <p className="text-xl font-black uppercase tracking-[0.2em] italic">No Configurations Found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white">
                <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg">
                         <DollarSign size={20} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black uppercase tracking-tight italic">
                            {editingId ? 'Update Pricing Manifest' : 'Create Pricing Manifest'}
                         </h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">ADMIN_OVERRIDE_ACTIVE</p>
                      </div>
                   </div>
                   <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-10 no-scrollbar">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Metadata_Registry</h4>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-gray-400">Tool Category</label>
                               <select value={payload.tool} onChange={e => setPayload({...payload, tool: e.target.value as any})} className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl text-xs font-black uppercase text-slate-900 dark:text-white">
                                  <option value="video">Video</option>
                                  <option value="image">Image</option>
                                  <option value="music">Music</option>
                               </select>
                            </div>
                            <EditInput label="Model Name" value={payload.name || ''} onChange={(v: string) => setPayload({...payload, name: v})} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <EditInput label="Engine Provider" value={payload.engine} onChange={(v: string) => setPayload({...payload, engine: v})} />
                            <EditInput label="Model Key" value={payload.modelKey} onChange={(v: string) => setPayload({...payload, modelKey: v})} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <EditInput label="Version" value={payload.version} onChange={(v: string) => setPayload({...payload, version: v})} />
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Modes</label>
                               <div className="flex gap-2">
                                  <input 
                                    value={newModeInput}
                                    onChange={e => setNewModeInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addMode()}
                                    placeholder="Add mode..."
                                    className="flex-grow bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner"
                                  />
                                  <button onClick={addMode} className="p-4 bg-brand-blue text-white rounded-xl"><Plus size={16}/></button>
                               </div>
                               <div className="flex flex-wrap gap-2 pt-2">
                                  {payload.modes?.map(m => (
                                    <span key={m} className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase rounded-full flex items-center gap-2">
                                      {m}
                                      <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => removeMode(m)} />
                                    </span>
                                  ))}
                               </div>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Description</label>
                            <textarea value={payload.description} onChange={e => setPayload({...payload, description: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 p-4 rounded-xl text-xs font-medium text-slate-900 dark:text-white" rows={3} placeholder="Mô tả hệ thống..." />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2">Economic_Algorithm</h4>
                      <div className="grid grid-cols-3 gap-6">
                         <EditInput label="Base Credits" type="number" value={payload.baseCredits.toString()} onChange={(v: string) => setPayload({...payload, baseCredits: parseInt(v) || 0})} />
                         <EditInput label="Cost Per Second" type="number" value={payload.perSecond.toString()} onChange={(v: string) => setPayload({...payload, perSecond: parseInt(v) || 0})} />
                         <EditInput label="Default Dur" type="number" value={payload.defaultDuration?.toString() || '4'} onChange={(v: string) => setPayload({...payload, defaultDuration: parseInt(v) || 4})} />
                      </div>
                      <EditInput label="Multipliers (Res:Mul, e.g. 720p:1, 1080p:1.5)" value={resInput} onChange={(v: string) => setResInput(v)} />
                      <EditInput label="Durations (e.g. 5, 8, 10)" value={durInput} onChange={(v: string) => setDurInput(v)} />
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 px-2">
                            <Maximize2 size={12} className="text-brand-blue" />
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Aspect Ratios</label>
                         </div>
                         <input 
                           value={aspectRatioInput} 
                           onChange={e => setAspectRatioInput(e.target.value)} 
                           className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white"
                           placeholder="e.g. 1:1, 16:9, 9:16, 4:3, 3:4"
                         />
                         <p className="text-[8px] text-gray-500 uppercase font-bold italic px-2">Ví dụ: 1:1, 16:9, 9:16, 4:3, 3:4</p>
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-6 shrink-0 transition-colors">
                   <button onClick={() => setIsDrawerOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Abort_Changes</button>
                   <button onClick={handleSave} disabled={isSaving} className="bg-brand-blue text-white px-12 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
                      {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor"/>}
                      {editingId ? 'Update Configuration' : 'Publish Configuration'}
                   </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditableCell = ({ modelId, res, dur, initialValue, onUpdate }: any) => {
  const [value, setValue] = useState(initialValue?.toString() ?? '0');
  const [isSaving, setIsSaving] = useState(false);
  const handleBlur = async () => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue === initialValue) { setValue(initialValue?.toString() ?? '0'); return; }
    setIsSaving(true);
    try { await onUpdate(modelId, res, dur, numValue); } catch (e) {}
    finally { setIsSaving(false); }
  };
  return (
    <div className="flex items-center gap-1.5 text-orange-500 font-black relative group">
       <div className={`transition-all ${isSaving ? 'animate-pulse' : ''}`}><Zap size={10} fill="currentColor" /></div>
       <input type="number" value={value} onChange={(e) => setValue(e.target.value)} onBlur={handleBlur} className="w-14 bg-transparent border-none outline-none text-right focus:bg-brand-blue/10 rounded transition-colors" />
       <span className="text-[7px] uppercase opacity-50">CR</span>
       {isSaving && <div className="absolute inset-0 bg-white/10 dark:bg-black/10 flex items-center justify-center rounded"><Loader2 size={8} className="animate-spin" /></div>}
    </div>
  );
};

const EditInput = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white" />
  </div>
);
