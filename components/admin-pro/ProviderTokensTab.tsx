
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Plus, Search, Filter, Edit3, Trash2, Check, X, 
  Loader2, Zap, ShieldCheck, Mail, Key, Database, Globe,
  Activity, AlertCircle, Clock, ToggleLeft, ToggleRight, 
  ChevronDown, Server, Cloud, Cpu, Terminal, Copy
} from 'lucide-react';
import { providerTokensApi, ProviderToken, ProviderTokenRequest } from '../../apis/provider-tokens';
import { useToast } from '../../context/ToastContext';

export const ProviderTokensTab: React.FC = () => {
  const { showToast } = useToast();
  const [tokens, setTokens] = useState<ProviderToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [payload, setPayload] = useState<ProviderTokenRequest>({
    provider: 'labs',
    isActive: true,
    email: '',
    accessToken: '',
    cookieToken: '',
    apiKey: '',
    plan: 'Premium',
    note: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await providerTokensApi.getList({
      provider: filterProvider === 'all' ? undefined : filterProvider
    });
    if (res.success) setTokens(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterProvider]);

  const handleEdit = (token: ProviderToken) => {
    setEditingId(token._id);
    setPayload({
      provider: token.provider,
      isActive: token.isActive,
      email: token.email || '',
      accessToken: token.accessToken || '',
      cookieToken: token.cookieToken || '',
      apiKey: token.apiKey || '',
      plan: token.plan || '',
      note: token.note || ''
    });
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setPayload({
      provider: 'labs',
      isActive: true,
      email: '',
      accessToken: '',
      cookieToken: '',
      apiKey: '',
      plan: 'Premium',
      note: ''
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let res;
      if (editingId) res = await providerTokensApi.update(editingId, payload);
      else res = await providerTokensApi.create(payload);
      
      if (res.success) {
        setIsDrawerOpen(false);
        fetchData();
        showToast(editingId ? "Cập nhật token thành công" : "Đăng ký token thành công", "success");
      } else {
        showToast(res.message || "Thao tác thất bại", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi hệ thống", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) {
      showToast(`${label} trống`, "warning");
      return;
    }
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}`, "success");
  };

  const filteredTokens = tokens.filter(t => 
    !search || 
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.note?.toLowerCase().includes(search.toLowerCase()) ||
    t.accessToken?.toLowerCase().includes(search.toLowerCase()) ||
    t.cookieToken?.toLowerCase().includes(search.toLowerCase())
  );

  const TokenCell = ({ value, label }: { value?: string, label: string }) => {
    if (!value) return <span className="text-slate-300 dark:text-gray-800 italic">None</span>;
    return (
      <div className="flex items-center gap-2 max-w-[150px]">
        <span className="text-[10px] font-mono text-gray-400 truncate flex-grow">
          {value.slice(0, 8)}...{value.slice(-4)}
        </span>
        <button 
          onClick={() => handleCopy(value, label)}
          className="p-1.5 hover:bg-indigo-500/10 hover:text-indigo-500 rounded transition-all shrink-0"
          title={`Copy ${label}`}
        >
          <Copy size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 shrink-0">
          {['all', 'labs', 'wan', 'gommo'].map(p => (
            <button 
              key={p} onClick={() => setFilterProvider(p)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterProvider === p ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-indigo-600'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue" size={16} />
            <input 
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm token..."
              className="w-full bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-brand-blue transition-all"
            />
          </div>
          <button onClick={handleAddNew} className="bg-brand-blue text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all shrink-0">
            + Đăng ký Token
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all flex-grow">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-8 py-6">Provider / Identity</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Access Token</th>
                <th className="px-8 py-6">Cookie Token</th>
                <th className="px-8 py-6">Economic Class</th>
                <th className="px-8 py-6 text-center">Runtime Stats</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-brand-blue" /></td></tr>
              ) : filteredTokens.length === 0 ? (
                <tr><td colSpan={7} className="py-32 text-center opacity-30 text-xs font-black uppercase italic tracking-[0.4em]">No tokens found in registry</td></tr>
              ) : filteredTokens.map((t) => (
                <tr key={t._id} className="group hover:bg-brand-blue/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center p-2 border shadow-lg ${
                        t.provider === 'labs' ? 'bg-purple-600/10 border-purple-500/20 text-purple-600' :
                        t.provider === 'wan' ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-600' :
                        'bg-orange-600/10 border-orange-500/20 text-orange-600'
                      }`}>
                         <Server size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-black dark:text-white uppercase italic">{t.provider}</p>
                        <p className="text-[9px] font-medium text-gray-500 truncate max-w-[150px]">{t.email || t.apiKey || 'No identity'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className={`px-3 py-1 text-[8px] font-black uppercase rounded-full border ${
                       t.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                     }`}>
                       {t.isActive ? 'Active' : 'Disabled'}
                     </span>
                  </td>
                  <td className="px-8 py-6">
                    <TokenCell value={t.accessToken} label="Access Token" />
                  </td>
                  <td className="px-8 py-6">
                    <TokenCell value={t.cookieToken} label="Cookie Token" />
                  </td>
                  <td className="px-8 py-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-700 dark:text-gray-300 uppercase italic tracking-tighter">{t.plan || 'Standard'}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase truncate max-w-[120px]">{t.note || 'No notes'}</p>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${t.errorCount > 10 ? 'bg-red-500' : t.errorCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                           <span className="text-[10px] font-black">{t.errorCount} Errors</span>
                        </div>
                        <p className="text-[7px] text-gray-500 uppercase tracking-widest">
                          Last: {t.lastActiveAt ? new Date(t.lastActiveAt).toLocaleTimeString() : 'Never'}
                        </p>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button onClick={() => handleEdit(t)} className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-blue rounded-lg transition-all shadow-sm">
                        <Edit3 size={14} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-xl bg-white dark:bg-[#0c0c0e] shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
              <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg"><Key size={20}/></div>
                  <h3 className="text-xl font-black uppercase tracking-tight italic">{editingId ? 'Cập nhật Token' : 'Đăng ký Token mới'}</h3>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] ml-2 italic">NHÀ CUNG CẤP (PROVIDER)</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['labs', 'wan', 'gommo'].map(p => (
                         <button 
                           key={p} onClick={() => setPayload({...payload, provider: p as any})}
                           className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${payload.provider === p ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-black/5 dark:border-white/10 text-gray-400'}`}
                         >
                            {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 {payload.provider === 'labs' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <EditInput label="EMAIL" value={payload.email} onChange={v => setPayload({...payload, email: v})} />
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">ACCESS TOKEN</label>
                          <textarea 
                            value={payload.accessToken} 
                            onChange={e => setPayload({...payload, accessToken: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 p-4 rounded-xl text-xs font-mono text-indigo-400 resize-none h-24"
                            placeholder="Dán access token tại đây..."
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">COOKIE TOKEN</label>
                          <textarea 
                            value={payload.cookieToken} 
                            onChange={e => setPayload({...payload, cookieToken: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 p-4 rounded-xl text-xs font-mono text-indigo-400 resize-none h-24"
                            placeholder="Dán nội dung cookie tại đây..."
                          />
                       </div>
                    </motion.div>
                 )}

                 {payload.provider === 'wan' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       <EditInput label="API KEY" value={payload.apiKey} onChange={v => setPayload({...payload, apiKey: v})} />
                    </motion.div>
                 )}

                 <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-6">
                    <EditInput label="PLAN / RANK" value={payload.plan} onChange={v => setPayload({...payload, plan: v})} />
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Ghi chú (Note)</label>
                      <input value={payload.note} onChange={e => setPayload({...payload, note: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-900 dark:text-white" placeholder="VD: Account phụ, Proxy VN..." />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-black/5">
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Trạng thái kích hoạt</span>
                       <button onClick={() => setPayload({...payload, isActive: !payload.isActive})} className={`p-2 transition-all ${payload.isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {payload.isActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex gap-4 shrink-0">
                <button onClick={() => setIsDrawerOpen(false)} className="flex-grow py-4 border border-black/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">Hủy</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-grow py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} 
                  {editingId ? 'Đồng bộ Token' : 'Phát hành Token'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditInput = ({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label>
     <input value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner" />
  </div>
);
