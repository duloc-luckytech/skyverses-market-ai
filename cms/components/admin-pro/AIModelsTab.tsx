
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Edit3, Trash2,
  Loader2, ToggleLeft, ToggleRight, Search, X, Check, Plus,
  Image, Video, Music, Type, RefreshCw, Eye, EyeOff, ExternalLink, Copy
} from 'lucide-react';
import { aiModelsApi, AIModel, AIModelRequest } from '../../apis/ai-models';

/* =====================================================
   CONSTANTS
===================================================== */
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  text: { label: 'Text', icon: <Type size={12} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  image: { label: 'Image', icon: <Image size={12} />, color: 'text-sky-500', bg: 'bg-sky-500/10 border-sky-500/20' },
  video: { label: 'Video', icon: <Video size={12} />, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
  audio: { label: 'Audio', icon: <Music size={12} />, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
};

/* =====================================================
   MAIN COMPONENT
===================================================== */
export const AIModelsTab: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [payload, setPayload] = useState<AIModelRequest>({
    key: '', name: '', logoUrl: '', route: '', description: '', provider: '', category: 'text', order: 0, status: 'active'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await aiModelsApi.getModels();
      if (res.data) setModels(res.data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  /* =====================================================
     DERIVED
  ===================================================== */
  const filteredModels = useMemo(() => {
    let result = models;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.key.toLowerCase().includes(q) ||
        m.provider?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) result = result.filter(m => m.category === categoryFilter);
    if (statusFilter) result = result.filter(m => m.status === statusFilter);
    return result;
  }, [models, search, categoryFilter, statusFilter]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, AIModel[]> = {};
    filteredModels.forEach(m => {
      const key = m.category || 'text';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredModels]);

  const stats = useMemo(() => ({
    total: models.length,
    active: models.filter(m => m.status === 'active').length,
    text: models.filter(m => m.category === 'text').length,
    image: models.filter(m => m.category === 'image').length,
    video: models.filter(m => m.category === 'video').length,
  }), [models]);

  /* =====================================================
     HANDLERS
  ===================================================== */
  const handleEdit = (model: AIModel) => {
    setEditingId(model._id);
    setPayload({
      key: model.key, name: model.name, logoUrl: model.logoUrl, route: model.route,
      description: model.description || '', provider: model.provider || '',
      category: model.category || 'text', order: model.order, status: model.status
    });
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setPayload({ key: '', name: '', logoUrl: '', route: '', description: '', provider: '', category: 'text', order: 0, status: 'active' });
    setIsDrawerOpen(true);
  };

  const handleDuplicate = (model: AIModel) => {
    setEditingId(null);
    setPayload({
      key: `${model.key}_copy`, name: `${model.name} (Copy)`, logoUrl: model.logoUrl, route: model.route,
      description: model.description || '', provider: model.provider || '',
      category: model.category || 'text', order: (model.order || 0) + 1, status: 'active'
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let res;
      if (editingId) res = await aiModelsApi.updateModel(editingId, payload);
      else res = await aiModelsApi.createModel(payload);
      if (res.success) { setIsDrawerOpen(false); fetchData(); }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleToggleStatus = async (id: string, status: string) => {
    try {
      const res = await aiModelsApi.toggleStatus(id, status);
      if (res.success) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xác nhận xóa Model này?")) return;
    try {
      const res = await aiModelsApi.deleteModel(id);
      if (res.success) fetchData();
    } catch (e) { console.error(e); }
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-[#08080a] border-b border-slate-200 dark:border-white/5 p-6 space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: 'Tổng', value: stats.total, color: 'text-slate-500' },
            { label: 'Active', value: stats.active, color: 'text-emerald-500' },
            { label: 'Text', value: stats.text, color: 'text-emerald-500' },
            { label: 'Image', value: stats.image, color: 'text-sky-500' },
            { label: 'Video', value: stats.video, color: 'text-purple-500' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">{s.label}</span>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 transition-all">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-violet-600/20 transition-all">
              <Plus size={14} strokeWidth={3} /> Thêm Model
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm model, key, provider..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:border-violet-500 text-slate-800 dark:text-white transition-all"
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-0.5">
            {[{ key: '', label: 'Tất cả' }, { key: 'text', label: 'Text' }, { key: 'image', label: 'Image' }, { key: 'video', label: 'Video' }, { key: 'audio', label: 'Audio' }].map(c => (
              <button key={c.key} onClick={() => setCategoryFilter(c.key)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${categoryFilter === c.key ? 'bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
              >{c.label}</button>
            ))}
          </div>

          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-0.5">
            {[{ key: '', label: 'Tất cả' }, { key: 'active', label: 'Active', icon: <Eye size={11} /> }, { key: 'inactive', label: 'Inactive', icon: <EyeOff size={11} /> }].map(s => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === s.key ? 'bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
              >{s.icon}{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-violet-500" size={32} /></div>
        ) : groupedByCategory.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Bot size={48} className="mx-auto mb-4" />
            <p className="text-lg font-bold">Không tìm thấy model nào</p>
          </div>
        ) : (
          groupedByCategory.map(([category, catModels]) => {
            const catCfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.text;
            return (
              <div key={category} className="rounded-xl border border-slate-200 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[#0a0a0c]">
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${catCfg.bg}`}>
                      {catCfg.icon}
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${catCfg.color}`}>{catCfg.label}</h3>
                      <p className="text-[9px] text-slate-400">{catModels.length} models</p>
                    </div>
                  </div>
                </div>

                {/* Models list */}
                <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {catModels.map(model => (
                    <div key={model._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors group">
                      {/* Logo */}
                      <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-black flex items-center justify-center p-1.5 border border-slate-200 dark:border-white/10 shrink-0 shadow-sm">
                        {model.logoUrl ? (
                          <img src={model.logoUrl} className="w-full h-full object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <Bot size={14} className="text-slate-400" />
                        )}
                      </div>

                      {/* Name + Key */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{model.name}</p>
                          <span className={`shrink-0 px-1.5 py-0.5 text-[8px] font-bold rounded border ${model.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>
                            {model.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="truncate">{model.key}</span>
                          {model.provider && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-violet-500 font-semibold">{model.provider}</span>
                            </>
                          )}
                          {model.route && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="truncate">{model.route}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Order */}
                      <span className="shrink-0 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">#{model.order}</span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleToggleStatus(model._id, model.status === 'active' ? 'inactive' : 'active')} title="Toggle status" className="p-1.5 rounded-md hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-all">
                          {model.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                        <button onClick={() => handleDuplicate(model)} title="Nhân bản" className="p-1.5 rounded-md hover:bg-sky-500/10 text-slate-400 hover:text-sky-500 transition-all"><Copy size={13} /></button>
                        <button onClick={() => handleEdit(model)} title="Chỉnh sửa" className="p-1.5 rounded-md hover:bg-violet-500/10 text-slate-400 hover:text-violet-500 transition-all"><Edit3 size={13} /></button>
                        <button onClick={() => handleDelete(model._id)} title="Xóa" className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-lg bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-500/10 flex items-center justify-center text-violet-500 rounded-lg"><Bot size={16} /></div>
                  <div>
                    <h3 className="text-sm font-bold">{editingId ? 'Chỉnh sửa Model' : 'Thêm Model mới'}</h3>
                    <p className="text-[9px] text-slate-400">AI Model Registry</p>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"><X size={18} /></button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-5 space-y-6 no-scrollbar">
                <FormSection title="Thông tin cơ bản">
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Model Key" value={payload.key} onChange={v => setPayload({ ...payload, key: v })} placeholder="vd: gpt-4o" />
                    <FormInput label="Tên hiển thị" value={payload.name} onChange={v => setPayload({ ...payload, name: v })} placeholder="vd: GPT-4o" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Provider" value={payload.provider || ''} onChange={v => setPayload({ ...payload, provider: v })} placeholder="vd: OpenAI" />
                    <FormInput label="Route / Endpoint" value={payload.route} onChange={v => setPayload({ ...payload, route: v })} placeholder="vd: /v1/chat" />
                  </div>
                  <FormInput label="Logo URL" value={payload.logoUrl} onChange={v => setPayload({ ...payload, logoUrl: v })} placeholder="https://..." />
                  {payload.logoUrl && (
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center p-1.5">
                        <img src={payload.logoUrl} className="w-full h-full object-contain" alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <span className="text-[10px] text-slate-400">Preview</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả</label>
                    <textarea value={payload.description} onChange={e => setPayload({ ...payload, description: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-violet-500" rows={2} placeholder="Mô tả model..." />
                  </div>
                </FormSection>

                <FormSection title="Phân loại & Sắp xếp">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                      <select value={payload.category} onChange={e => setPayload({ ...payload, category: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-lg text-xs font-semibold text-slate-900 dark:text-white">
                        {['text', 'image', 'video', 'audio'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                      </select>
                    </div>
                    <FormInput label="Thứ tự" type="number" value={payload.order?.toString() || '0'} onChange={v => setPayload({ ...payload, order: parseInt(v) || 0 })} />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <select value={payload.status} onChange={e => setPayload({ ...payload, status: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-lg text-xs font-semibold text-slate-900 dark:text-white">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </FormSection>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex justify-between items-center gap-4 shrink-0">
                <button onClick={() => setIsDrawerOpen(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">Hủy</button>
                <button onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg text-xs font-bold flex items-center gap-3 shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
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
   HELPER COMPONENTS
===================================================== */
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h4 className="text-[10px] font-bold uppercase text-violet-500 tracking-wider border-b border-violet-500/20 pb-2">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const FormInput = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-lg text-xs font-semibold outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-900 dark:text-white transition-all" />
  </div>
);