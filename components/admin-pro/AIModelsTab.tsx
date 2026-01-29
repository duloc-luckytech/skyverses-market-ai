
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Edit3, Trash2, CheckCircle2, 
  AlertCircle, Clock, ExternalLink,
  ChevronRight, ArrowRight, Activity,
  Globe, LayoutGrid, Layers, Loader2,
  ToggleLeft, ToggleRight, Search, X, Check, Save
} from 'lucide-react';
import { aiModelsApi, AIModel, AIModelRequest } from '../../apis/ai-models';

export const AIModelsTab: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Drawer States
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
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    setPayload({
       key: '', name: '', logoUrl: '', route: '', description: '', provider: '', category: 'text', order: 0, status: 'active'
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let res;
      if (editingId) res = await aiModelsApi.updateModel(editingId, payload);
      else res = await aiModelsApi.createModel(payload);
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

  const handleToggleStatus = async (id: string, status: string) => {
    try {
      const res = await aiModelsApi.toggleStatus(id, status);
      if (res.success) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa vĩnh viễn Model này khỏi Registry?")) return;
    try {
      const res = await aiModelsApi.deleteModel(id);
      if (res.success) fetchData();
    } catch (e) { console.error(e); }
  };

  const filteredModels = models.filter(m => 
    !search || 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.key.toLowerCase().includes(search.toLowerCase()) ||
    m.provider?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-700 h-full flex flex-col">
      <div className="p-8 lg:p-12 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#08080a] transition-colors">
         <div className="relative w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue" size={18} />
            <input 
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm model..."
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-brand-blue transition-all text-slate-800 dark:text-white"
            />
         </div>
         <button onClick={handleAddNew} className="bg-brand-blue text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">+ Thêm Model</button>
      </div>

      <div className="bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-none overflow-hidden shadow-2xl transition-all flex-grow">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-8 py-6">Model Core</th>
                <th className="px-8 py-6">Provider / Engine</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Order</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading && models.length === 0 ? (
                <tr><td colSpan={6} className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-brand-blue" /></td></tr>
              ) : filteredModels.map((m) => (
                <tr key={m._id} className="group hover:bg-brand-blue/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center p-2 border border-white/10 group-hover:scale-105 transition-transform shadow-lg">
                         <img src={m.logoUrl} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-black dark:text-white uppercase italic truncate max-w-[180px]">{m.name}</p>
                        <p className="text-[9px] font-medium text-gray-500 truncate max-w-[180px]">{m.key}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{m.provider || 'N/A'}</span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase italic">Protocol: {m.route}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded text-[8px] font-black uppercase text-gray-500">{m.category || 'Standard'}</span>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-[11px] font-black text-slate-700 dark:text-gray-300">{m.order}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <button 
                       onClick={() => handleToggleStatus(m._id, m.status === 'active' ? 'inactive' : 'active')}
                       className={`mx-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}
                     >
                       {m.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                       {m.status}
                     </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleEdit(m)} className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-blue rounded-lg transition-all shadow-sm"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(m._id)} className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm"><Trash2 size={14} /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full h-full bg-white dark:bg-[#0c0c0e] shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
              <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                <div className="flex items-center gap-4">
                  <Bot className="text-brand-blue" size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tight italic">{editingId ? 'Update Model Registry' : 'Register New AI Model'}</h3>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
                 <div className="grid grid-cols-2 gap-6">
                    <EditInput label="MODEL KEY" value={payload.key} onChange={v => setPayload({...payload, key: v})} />
                    <EditInput label="DISPLAY NAME" value={payload.name} onChange={v => setPayload({...payload, name: v})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <EditInput label="PROVIDER" value={payload.provider || ''} onChange={v => setPayload({...payload, provider: v})} />
                    <EditInput label="ROUTE" value={payload.route} onChange={v => setPayload({...payload, route: v})} />
                 </div>
                 <EditInput label="LOGO URL" value={payload.logoUrl} onChange={v => setPayload({...payload, logoUrl: v})} />
                 <textarea value={payload.description} onChange={e => setPayload({...payload, description: e.target.value})} className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 p-4 rounded-xl text-xs" rows={3} placeholder="Mô tả..." />
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-400">CATEGORY</label>
                       <select value={payload.category} onChange={e => setPayload({...payload, category: e.target.value as any})} className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 p-4 rounded-xl text-xs font-black uppercase">
                          {['text', 'image', 'video', 'audio'].map(o => <option key={o} value={o}>{o}</option>)}
                       </select>
                    </div>
                    <EditInput label="ORDER" type="number" value={payload.order?.toString() || '0'} onChange={v => setPayload({...payload, order: parseInt(v) || 0})} />
                 </div>
              </div>
              <div className="p-8 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex gap-4 shrink-0">
                <button onClick={() => setIsDrawerOpen(false)} className="flex-grow py-4 border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Hủy</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-grow py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} 
                  {editingId ? 'Update Registry' : 'Publish Model'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label>
     <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner" />
  </div>
);
