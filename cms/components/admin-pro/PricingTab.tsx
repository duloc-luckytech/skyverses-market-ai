
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Edit3, ChevronDown, Monitor, Clock,
  Loader2, Trash2, Search,
  X, DollarSign, Settings2, RefreshCw, Plus, Copy, Maximize2,
  Video, Image, Music, Server, Tag, Layers, Activity, Eye, EyeOff
} from 'lucide-react';
import { pricingApi, PricingModel, PricingFilters, CreatePricingRequest } from '../../apis/pricing';

/* =====================================================
   CONSTANTS
===================================================== */
const TOOL_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  video: { label: 'Video', icon: <Video size={14} />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  image: { label: 'Image', icon: <Image size={14} />, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  music: { label: 'Music', icon: <Music size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
};

const ENGINE_COLORS: Record<string, string> = {
  gommo: '#8b5cf6',
  fxlab: '#f59e0b',
  wan: '#10b981',
  veo: '#3b82f6',
};

/* =====================================================
   MAIN COMPONENT
===================================================== */
export const PricingTab: React.FC = () => {
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [toolFilter, setToolFilter] = useState('');
  const [engineFilter, setEngineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newModeInput, setNewModeInput] = useState('');
  const [resInput, setResInput] = useState('720p:1, 1080p:1.5');
  const [durInput, setDurInput] = useState('5, 8, 10');
  const [aspectRatioInput, setAspectRatioInput] = useState('1:1, 16:9, 9:16');
  const [payload, setPayload] = useState<CreatePricingRequest>({
    tool: 'video', engine: 'gommo', modelKey: '', version: '1.0', name: '', modes: [],
    baseCredits: 20, perSecond: 2, defaultDuration: 5, resolutions: {}, durations: [5, 8, 10], aspectRatios: [],
    description: '', status: 'active'
  });

  /* =====================================================
     DATA FETCH
  ===================================================== */
  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: PricingFilters = {};
      if (toolFilter) filters.tool = toolFilter;
      if (engineFilter) filters.engine = engineFilter;
      const res = await pricingApi.getPricing(filters);
      if (res.success) setPricingModels(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [toolFilter, engineFilter]);

  /* =====================================================
     DERIVED DATA
  ===================================================== */
  const filteredModels = useMemo(() => {
    let models = pricingModels;
    if (search) {
      const q = search.toLowerCase();
      models = models.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.modelKey.toLowerCase().includes(q) ||
        m.engine.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      models = models.filter(m => m.status === statusFilter);
    }
    return models;
  }, [pricingModels, search, statusFilter]);

  // Group by engine
  const groupedByEngine = useMemo(() => {
    const groups: Record<string, PricingModel[]> = {};
    filteredModels.forEach(m => {
      const key = m.engine;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    // Sort groups: gommo first
    const sorted: [string, PricingModel[]][] = [];
    if (groups['gommo']) { sorted.push(['gommo', groups['gommo']]); delete groups['gommo']; }
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).forEach(e => sorted.push(e));
    return sorted;
  }, [filteredModels]);

  // Stats
  const stats = useMemo(() => ({
    total: pricingModels.length,
    active: pricingModels.filter(m => m.status === 'active').length,
    video: pricingModels.filter(m => m.tool === 'video').length,
    image: pricingModels.filter(m => m.tool === 'image').length,
    engines: [...new Set(pricingModels.map(m => m.engine))].length,
  }), [pricingModels]);

  /* =====================================================
     HANDLERS
  ===================================================== */
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setResInput('720p:1, 1080p:1.5');
    setDurInput('5, 8, 10');
    setAspectRatioInput('1:1, 16:9, 9:16');
    setPayload({
      tool: 'video', engine: 'gommo', modelKey: '', version: '1.0',
      name: '', modes: [], baseCredits: 20, perSecond: 2, defaultDuration: 5,
      resolutions: {}, durations: [5, 8, 10], aspectRatios: [], description: '', status: 'active'
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (model: PricingModel) => {
    setEditingId(model._id);
    const resolutions = Object.keys(model.pricing || {});
    const firstRes = resolutions[0];
    const durations = firstRes ? Object.keys(model.pricing[firstRes]).map(Number).filter(n => !isNaN(n)) : [];
    const modes = firstRes ? Object.keys(model.pricing[firstRes]).filter(k => isNaN(Number(k))) : [];
    setResInput(resolutions.map(r => `${r}:1`).join(', '));
    setDurInput(durations.length > 0 ? durations.join(', ') : modes.join(', '));
    setAspectRatioInput(model.aspectRatios?.join(', ') || '1:1, 16:9, 9:16');
    setPayload({
      tool: model.tool, engine: model.engine, modelKey: model.modelKey, version: model.version,
      name: model.name, modes: model.modes || [model.mode || ''], baseCredits: 20, perSecond: 2, defaultDuration: 5,
      resolutions: {}, durations: durations.length > 0 ? durations : [], aspectRatios: model.aspectRatios || [],
      description: model.description, status: model.status
    });
    setIsDrawerOpen(true);
  };

  const handleDuplicate = (model: PricingModel) => {
    setEditingId(null);
    const resolutions = Object.keys(model.pricing || {});
    const firstRes = resolutions[0];
    const durations = firstRes ? Object.keys(model.pricing[firstRes]).map(Number).filter(n => !isNaN(n)) : [];
    setResInput(resolutions.map(r => `${r}:1`).join(', '));
    setDurInput(durations.join(', '));
    setAspectRatioInput(model.aspectRatios?.join(', ') || '');
    setPayload({
      tool: model.tool, engine: model.engine, modelKey: `${model.modelKey}_copy`, version: model.version,
      name: `${model.name} (Copy)`, modes: model.modes || [], baseCredits: 20, perSecond: 2, defaultDuration: 5,
      resolutions: {}, durations: durations, aspectRatios: model.aspectRatios || [],
      description: model.description, status: 'active'
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
      const body: any = { ...payload, resolutions: resObj, durations: finalDurations, aspectRatios: finalAspectRatios, mode: payload.modes?.[0] || '' };
      let res;
      if (editingId) res = await pricingApi.updatePricing(editingId, body);
      else res = await pricingApi.createPricing(body);
      if (res.success) { setIsDrawerOpen(false); fetchData(); }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xác nhận xóa cấu hình giá này?")) return;
    try { await pricingApi.deletePricing(id); fetchData(); } catch (e) { console.error(e); }
  };

  const addMode = () => {
    if (!newModeInput.trim()) return;
    if (payload.modes?.includes(newModeInput.trim())) return;
    setPayload({ ...payload, modes: [...(payload.modes || []), newModeInput.trim()] });
    setNewModeInput('');
  };

  const removeMode = (mode: string) => {
    setPayload({ ...payload, modes: payload.modes?.filter(m => m !== mode) || [] });
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="flex flex-col h-full">
      {/* ======= HEADER ======= */}
      <div className="shrink-0 bg-white dark:bg-[#08080a] border-b border-slate-200 dark:border-white/5 p-6 lg:p-8 space-y-5">
        {/* Stats bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: 'Tổng', value: stats.total, color: 'text-slate-500' },
            { label: 'Active', value: stats.active, color: 'text-emerald-500' },
            { label: 'Video', value: stats.video, color: 'text-purple-500' },
            { label: 'Image', value: stats.image, color: 'text-sky-500' },
            { label: 'Engines', value: stats.engines, color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-slate-100 dark:border-white/5">
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">{s.label}</span>
              <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
            </div>
          ))}

          <div className="ml-auto flex items-center gap-3">
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-brand-blue text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-brand-blue/20 hover:scale-[1.02] transition-all">
              <Plus size={14} strokeWidth={3} /> Thêm mới
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên model, key, engine..."
              className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 text-slate-800 dark:text-white transition-all"
            />
          </div>

          {/* Tool filter */}
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg border border-black/[0.04] dark:border-white/[0.04] p-0.5">
            {[
              { key: '', label: 'Tất cả' },
              { key: 'image', label: 'Image', icon: <Image size={11} /> },
              { key: 'video', label: 'Video', icon: <Video size={11} /> },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setToolFilter(t.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${toolFilter === t.key ? 'bg-white dark:bg-white/10 text-brand-blue dark:text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Engine filter */}
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg border border-black/[0.04] dark:border-white/[0.04] p-0.5">
            {['', 'gommo', 'fxlab', 'wan'].map(e => (
              <button
                key={e}
                onClick={() => setEngineFilter(e)}
                className={`px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${engineFilter === e ? 'bg-white dark:bg-white/10 text-brand-blue dark:text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
              >
                {e === '' ? 'Tất cả' : e}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg border border-black/[0.04] dark:border-white/[0.04] p-0.5">
            {[
              { key: '', label: 'Tất cả', icon: <Layers size={11} /> },
              { key: 'active', label: 'Active', icon: <Eye size={11} /> },
              { key: 'inactive', label: 'Inactive', icon: <EyeOff size={11} /> },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === s.key ? 'bg-white dark:bg-white/10 text-brand-blue dark:text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
              >
                {s.icon}{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======= CONTENT ======= */}
      <div className="flex-grow overflow-y-auto p-6 lg:p-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
          </div>
        ) : groupedByEngine.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Server size={48} className="mx-auto mb-4" />
            <p className="text-lg font-bold">Không tìm thấy cấu hình nào</p>
          </div>
        ) : (
          groupedByEngine.map(([engine, models]) => (
            <EngineGroup
              key={engine}
              engine={engine}
              models={models}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onCellUpdate={async (id, res, dur, val) => {
                const result = await pricingApi.updatePricingCell(id, res, Number(dur), val);
                fetchData();
                return result;
              }}
            />
          ))
        )}
      </div>

      {/* ======= DRAWER ======= */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/[0.04] dark:border-white/[0.04] text-slate-900 dark:text-white">
              {/* Drawer Header */}
              <div className="p-6 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-lg"><DollarSign size={18} /></div>
                  <div>
                    <h3 className="text-base font-bold">{editingId ? 'Chỉnh sửa cấu hình' : 'Tạo cấu hình mới'}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Pricing Matrix Configuration</p>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><X size={20} /></button>
              </div>

              {/* Drawer Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-8">
                <Section title="Thông tin cơ bản">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tool</label>
                      <select value={payload.tool} onChange={e => setPayload({ ...payload, tool: e.target.value })} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-lg text-xs font-semibold text-slate-900 dark:text-white">
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                        <option value="music">Music</option>
                      </select>
                    </div>
                    <DrawerInput label="Tên hiển thị" value={payload.name || ''} onChange={v => setPayload({ ...payload, name: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DrawerInput label="Engine" value={payload.engine} onChange={v => setPayload({ ...payload, engine: v })} />
                    <DrawerInput label="Model Key" value={payload.modelKey} onChange={v => setPayload({ ...payload, modelKey: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DrawerInput label="Version" value={payload.version} onChange={v => setPayload({ ...payload, version: v })} />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <select value={payload.status} onChange={e => setPayload({ ...payload, status: e.target.value })} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-lg text-xs font-semibold text-slate-900 dark:text-white">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modes</label>
                    <div className="flex gap-2">
                      <input value={newModeInput} onChange={e => setNewModeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMode()} placeholder="vd: fast, relaxed..." className="flex-grow bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-lg text-xs outline-none focus:border-brand-blue text-slate-900 dark:text-white" />
                      <button onClick={addMode} className="p-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue transition-colors"><Plus size={14} /></button>
                    </div>
                    {payload.modes && payload.modes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {payload.modes.map(m => (
                          <span key={m} className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-md flex items-center gap-1.5 border border-brand-blue/20">
                            {m}
                            <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => removeMode(m)} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea value={payload.description} onChange={e => setPayload({ ...payload, description: e.target.value })} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-lg text-xs text-slate-900 dark:text-white" rows={2} placeholder="Mô tả model..." />
                  </div>
                </Section>

                <Section title="Cấu hình giá">
                  <div className="grid grid-cols-3 gap-4">
                    <DrawerInput label="Base Credits" type="number" value={payload.baseCredits.toString()} onChange={v => setPayload({ ...payload, baseCredits: parseInt(v) || 0 })} />
                    <DrawerInput label="Per Second" type="number" value={payload.perSecond.toString()} onChange={v => setPayload({ ...payload, perSecond: parseInt(v) || 0 })} />
                    <DrawerInput label="Default Dur" type="number" value={payload.defaultDuration?.toString() || '5'} onChange={v => setPayload({ ...payload, defaultDuration: parseInt(v) || 5 })} />
                  </div>
                  <DrawerInput label="Resolutions (vd: 720p:1, 1080p:1.5)" value={resInput} onChange={v => setResInput(v)} />
                  <DrawerInput label="Durations (vd: 5, 8, 10)" value={durInput} onChange={v => setDurInput(v)} />
                  <DrawerInput label="Aspect Ratios (vd: 16:9, 9:16)" value={aspectRatioInput} onChange={v => setAspectRatioInput(v)} />
                </Section>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-black/[0.04] dark:border-white/[0.04] bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-4 shrink-0">
                <button onClick={() => setIsDrawerOpen(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">Hủy</button>
                <button onClick={handleSave} disabled={isSaving} className="bg-brand-blue hover:bg-brand-blue text-white px-8 py-3 rounded-lg text-xs font-bold flex items-center gap-3 shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =====================================================
   ENGINE GROUP COMPONENT
===================================================== */
const EngineGroup: React.FC<{
  engine: string;
  models: PricingModel[];
  expandedIds: string[];
  toggleExpand: (id: string) => void;
  onEdit: (m: PricingModel) => void;
  onDuplicate: (m: PricingModel) => void;
  onDelete: (id: string) => void;
  onCellUpdate: (id: string, res: string, dur: string, val: number) => Promise<any>;
}> = ({ engine, models, expandedIds, toggleExpand, onEdit, onDuplicate, onDelete, onCellUpdate }) => {
  const engineColor = ENGINE_COLORS[engine] || '#6b7280';
  const videoCount = models.filter(m => m.tool === 'video').length;
  const imageCount = models.filter(m => m.tool === 'image').length;

  return (
    <div className="rounded-xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden bg-white dark:bg-[#0a0a0c]">
      {/* Engine Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${engineColor}15` }}>
            <Server size={16} style={{ color: engineColor }} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: engineColor }}>{engine}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{models.length} models</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {videoCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-500 text-[9px] font-bold border border-purple-500/20">
              <Video size={10} /> {videoCount}
            </span>
          )}
          {imageCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-sky-500/10 text-sky-500 text-[9px] font-bold border border-sky-500/20">
              <Image size={10} /> {imageCount}
            </span>
          )}
        </div>
      </div>

      {/* Models Grid */}
      <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
        {models.map(model => (
          <ModelCard
            key={model._id}
            model={model}
            engineColor={engineColor}
            isExpanded={expandedIds.includes(model._id)}
            toggleExpand={() => toggleExpand(model._id)}
            onEdit={() => onEdit(model)}
            onDuplicate={() => onDuplicate(model)}
            onDelete={() => onDelete(model._id)}
            onCellUpdate={onCellUpdate}
          />
        ))}
      </div>
    </div>
  );
};

/* =====================================================
   MODEL CARD COMPONENT
===================================================== */
const ModelCard: React.FC<{
  model: PricingModel;
  engineColor: string;
  isExpanded: boolean;
  toggleExpand: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCellUpdate: (id: string, res: string, dur: string, val: number) => Promise<any>;
}> = ({ model, engineColor, isExpanded, toggleExpand, onEdit, onDuplicate, onDelete, onCellUpdate }) => {
  const toolCfg = TOOL_CONFIG[model.tool] || TOOL_CONFIG.video;
  const resolutions = Object.keys(model.pricing || {});
  const firstRes = resolutions[0];
  const pricingKeys = firstRes ? Object.keys(model.pricing[firstRes]) : [];
  const minPrice = Math.min(...Object.values(model.pricing || {}).flatMap(r => Object.values(r as any)));
  const maxPrice = Math.max(...Object.values(model.pricing || {}).flatMap(r => Object.values(r as any)));

  return (
    <div className="group">
      {/* Main Row */}
      <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors cursor-pointer" onClick={toggleExpand}>
        {/* Tool badge */}
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${toolCfg.bg}`}>
          {toolCfg.icon}
        </div>

        {/* Name + Key */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{model.name}</p>
            <span className={`shrink-0 px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${model.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400 border-black/[0.04] dark:border-white/[0.04]'}`}>
              {model.status}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono truncate">{model.modelKey} · v{model.version}</p>
        </div>

        {/* Info badges */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Modes */}
          {model.modes && model.modes.length > 0 && (
            <div className="flex items-center gap-1">
              {model.modes.slice(0, 3).map(m => (
                <span key={m} className="px-2 py-0.5 text-[9px] font-semibold rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/10">{m}</span>
              ))}
              {model.modes.length > 3 && <span className="text-[9px] text-slate-400">+{model.modes.length - 3}</span>}
            </div>
          )}

          {/* Resolutions */}
          <div className="flex items-center gap-1">
            {resolutions.slice(0, 3).map(r => (
              <span key={r} className="px-2 py-0.5 text-[9px] font-semibold rounded bg-slate-100 dark:bg-white/5 text-slate-500 border border-black/[0.04] dark:border-white/[0.04]">{r}</span>
            ))}
          </div>

          {/* Ratios */}
          {model.aspectRatios && model.aspectRatios.length > 0 && (
            <div className="flex items-center gap-1">
              {model.aspectRatios.slice(0, 2).map(r => (
                <span key={r} className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">{r}</span>
              ))}
              {model.aspectRatios.length > 2 && <span className="text-[9px] text-slate-400">+{model.aspectRatios.length - 2}</span>}
            </div>
          )}

          {/* Price range */}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 border border-orange-500/10">
            <Zap size={10} className="text-orange-500" />
            <span className="text-[10px] font-bold text-orange-500">
              {minPrice === maxPrice ? `${minPrice}` : `${minPrice}–${maxPrice}`}
            </span>
            <span className="text-[8px] text-orange-400/60">CR</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onDuplicate(); }} title="Nhân bản" className="p-2 rounded-md hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-all"><Copy size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onEdit(); }} title="Chỉnh sửa" className="p-2 rounded-md hover:bg-brand-blue/10 text-slate-400 hover:text-brand-blue transition-all"><Edit3 size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} title="Xóa" className="p-2 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={13} /></button>
        </div>

        {/* Expand chevron */}
        <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Expanded Pricing Detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-6 pb-5 pt-2">
              {/* Description */}
              {model.description && (
                <p className="text-xs text-slate-500 mb-4 italic">{model.description}</p>
              )}

              {/* Mobile info */}
              <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
                {model.modes?.map(m => <span key={m} className="px-2 py-0.5 text-[9px] font-semibold rounded bg-brand-blue/10 text-brand-blue">{m}</span>)}
                {model.aspectRatios?.map(r => <span key={r} className="px-2 py-0.5 text-[9px] font-semibold rounded bg-amber-500/10 text-amber-500">{r}</span>)}
              </div>

              {/* Pricing matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Object.entries(model.pricing || {}).map(([res, durMap]) => (
                  <div key={res} className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-lg">
                    <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                      <Monitor size={11} className="text-brand-blue" />
                      <span className="text-[10px] font-bold uppercase text-brand-blue tracking-wider">{res}</span>
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(durMap as any).map(([dur, cost]) => (
                        <div key={dur} className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Clock size={9} className="text-slate-400" />
                            {isNaN(Number(dur)) ? dur : `${dur}s`}
                          </span>
                          <EditableCell
                            modelId={model._id} res={res} dur={dur} initialValue={cost as number}
                            onUpdate={onCellUpdate}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =====================================================
   EDITABLE CELL
===================================================== */
const EditableCell = ({ modelId, res, dur, initialValue, onUpdate }: any) => {
  const [value, setValue] = useState(initialValue?.toString() ?? '0');
  const [isSaving, setIsSaving] = useState(false);
  const handleBlur = async () => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue === initialValue) { setValue(initialValue?.toString() ?? '0'); return; }
    setIsSaving(true);
    try { await onUpdate(modelId, res, dur, numValue); } catch (e) { }
    finally { setIsSaving(false); }
  };
  return (
    <div className={`flex items-center gap-1 text-orange-500 font-bold relative ${isSaving ? 'animate-pulse' : ''}`}>
      <Zap size={9} fill="currentColor" />
      <input type="number" value={value} onChange={e => setValue(e.target.value)} onBlur={handleBlur} className="w-14 bg-transparent border-none outline-none text-right text-xs focus:bg-brand-blue/10 rounded px-1 transition-colors" />
      <span className="text-[7px] opacity-50 uppercase">CR</span>
    </div>
  );
};

/* =====================================================
   HELPER COMPONENTS
===================================================== */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-bold uppercase text-brand-blue tracking-wider border-b border-brand-blue/20 pb-2">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const DrawerInput = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] p-3 rounded-lg text-xs font-semibold outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 text-slate-900 dark:text-white transition-all" />
  </div>
);
