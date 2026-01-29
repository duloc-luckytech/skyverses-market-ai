import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Edit3, Sparkles, Plus, Zap, Eye, EyeOff, 
  Loader2, Crown, Star, Calendar, ArrowDown, Trash2,
  X, ShieldCheck, AlignLeft, DollarSign, Layout, 
  PlusCircle, Palette, ToggleLeft, ToggleRight,
  CheckCircle2
} from 'lucide-react';
import { creditsApi, CreditPackage, CreditPackageRequest } from '../../apis/credits';

export const CreditPacksTab: React.FC = () => {
  const [packs, setPacks] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payload, setPayload] = useState<CreditPackageRequest>({
    code: '', name: '', description: '', credits: 1000, bonusPercent: 0, bonusCredits: 0,
    price: 0, originalPrice: 0, currency: 'VND', billingCycle: 'monthly', billedMonths: 1,
    discountPercent: 0, popular: false, highlight: false, badge: '', ctaText: 'Nâng cấp ngay',
    ribbon: { text: '', color: '#FFE135', icon: '🔥' },
    features: [], unlimitedModels: [],
    theme: { gradientFrom: '#0f172a', gradientTo: '#020617', accentColor: '#0090ff', buttonStyle: 'solid' },
    active: true, sortOrder: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await creditsApi.getAdminPackages();
      if (res.data) setPacks(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (pack: CreditPackage) => {
    setEditingId(pack._id);
    setPayload({
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
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setPayload({
       code: '', name: '', description: '', credits: 1000, bonusPercent: 0, bonusCredits: 0,
       price: 0, originalPrice: 0, currency: 'VND', billingCycle: 'monthly', billedMonths: 1,
       discountPercent: 0, popular: false, highlight: false, badge: '', ctaText: 'Nâng cấp ngay',
       ribbon: { text: '', color: '#FFE135', icon: '🔥' },
       features: [], unlimitedModels: [],
       theme: { gradientFrom: '#0f172a', gradientTo: '#020617', accentColor: '#0090ff', buttonStyle: 'solid' },
       active: true, sortOrder: 0
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let res;
      if (editingId) res = await creditsApi.updatePackage(editingId, payload);
      else res = await creditsApi.createPackage(payload);
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

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await creditsApi.togglePackage(id);
      if (res.success) fetchData();
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn gói nạp này?")) return;
    try {
      const res = await creditsApi.deletePackage(id);
      if (res.success) fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-12 h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
         <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Quản lý Gói nạp</h3>
         <button onClick={handleAddNew} className="bg-brand-blue text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">+ Tạo gói mới</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading && packs.length === 0 ? (
          <div className="col-span-full h-[400px] flex flex-col items-center justify-center gap-6 opacity-40">
             <Loader2 className="animate-spin text-brand-blue" size={48} />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900 dark:text-white">Synchronizing_Economic_Vault...</p>
          </div>
        ) : packs.map(pack => (
          <div 
            key={pack._id} 
            className={`bg-[#fcfcfd] dark:bg-[#111114] border-2 p-10 rounded-[2.5rem] space-y-6 group transition-all shadow-sm relative ${pack.active ? 'border-black/5 dark:border-white/5 hover:border-brand-blue/30' : 'border-dashed border-red-500/20 opacity-60 grayscale'} ${pack.highlight ? 'ring-2 ring-brand-blue ring-offset-4 dark:ring-offset-black' : ''}`}
            style={pack.highlight ? { boxShadow: `0 0 40px ${pack.theme?.accentColor || '#0090ff'}15` } : {}}
          >
            {pack.ribbon?.text && (
               <div className="absolute -top-3 -right-3 px-4 py-1.5 rounded-lg shadow-xl flex items-center gap-2 z-10 animate-bounce" style={{ backgroundColor: pack.ribbon.color }}>
                  <span className="text-[12px]">{pack.ribbon.icon}</span>
                  <span className="text-[10px] font-black uppercase text-black italic tracking-tighter">{pack.ribbon.text}</span>
               </div>
            )}
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-2xl shadow-inner transition-transform group-hover:scale-110 ${pack.active ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`} style={pack.active ? { color: pack.theme?.accentColor, backgroundColor: `${pack.theme?.accentColor}10` } : {}}>
                <Coins size={36} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(pack._id)} className={`p-2.5 rounded-lg transition-all ${pack.active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                  {togglingId === pack._id ? <Loader2 size={16} className="animate-spin" /> : pack.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => handleEdit(pack)} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-lg transition-colors"><Edit3 size={16}/></button>
                <button onClick={() => handleDelete(pack._id)} className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{pack.name}</h3>
                 {pack.badge && <span className="px-2 py-0.5 bg-brand-blue text-white text-[7px] font-black uppercase rounded-full shadow-lg" style={{ backgroundColor: pack.theme?.accentColor }}>{pack.badge}</span>}
              </div>
              <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 uppercase tracking-widest"><Calendar size={10} /> {pack.billingCycle} • {pack.billedMonths} mo</div>
            </div>
            <div className="py-6 border-y border-black/5 dark:border-white/5 flex justify-between items-baseline">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Sản lượng Credits</p>
                <p className="text-5xl font-black italic text-brand-blue" style={{ color: pack.theme?.accentColor }}>{pack.totalCredits?.toLocaleString() || pack.credits.toLocaleString()} <span className="text-xs not-italic opacity-50 ml-1">CR</span></p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[8px] font-black text-gray-400 uppercase">Giá niêm yết</p>
                <div className="flex flex-col items-end">
                  {pack.originalPrice && pack.originalPrice > pack.price && <span className="text-[10px] text-gray-400 line-through font-bold">{pack.originalPrice.toLocaleString()} {pack.currency}</span>}
                  <p className="text-xl font-black text-slate-800 dark:text-white">{pack.price.toLocaleString()} {pack.currency}</p>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-t border-black/5 dark:border-white/5 pt-4">
              <span>Vị trí: {pack.sortOrder}</span>
              <span className={pack.active ? 'text-emerald-500' : 'text-red-500'}>{pack.active ? 'OPERATIONAL' : 'DEPRECATED'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-5xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-2xl shadow-inner"><Coins size={28} /></div>
                      <div>
                         <h3 className="text-2xl font-black uppercase tracking-tight italic">{editingId ? 'Update Credit Bundle' : 'Create New Bundle'}</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">FINANCIAL_UNIT_AUTHORIZATION</p>
                      </div>
                   </div>
                   <button onClick={() => setIsDrawerOpen(false)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><X size={32}/></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-10 space-y-12 no-scrollbar">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2 flex items-center gap-3"><AlignLeft size={14}/> Basic_Identity</h4>
                        <EditInput label="UNIQUE CODE" value={payload.code} onChange={(v: string) => setPayload({...payload, code: v})} />
                        <EditInput label="DISPLAY NAME" value={payload.name} onChange={(v: string) => setPayload({...payload, name: v})} />
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Description</label>
                           <textarea value={payload.description} onChange={e => setPayload({...payload, description: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-xs font-medium text-slate-900 dark:text-white" rows={3} placeholder="Mô tả gói..." />
                        </div>
                        <EditInput label="SORT ORDER" type="number" value={payload.sortOrder?.toString() || '0'} onChange={(v: string) => setPayload({...payload, sortOrder: parseInt(v) || 0})} />
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-brand-blue tracking-[0.4em] border-b border-brand-blue/20 pb-2 flex items-center gap-3"><DollarSign size={14}/> Financial_Model</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <EditInput label="PRICE" type="number" value={payload.price.toString()} onChange={(v: string) => setPayload({...payload, price: parseFloat(v) || 0})} />
                           <EditInput label="ORIGINAL PRICE" type="number" value={payload.originalPrice?.toString() || '0'} onChange={(v: string) => setPayload({...payload, originalPrice: parseFloat(v) || 0})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <label className="text-[9px] font-black text-gray-400">CYCLE</label>
                             <select value={payload.billingCycle} onChange={e => setPayload({...payload, billingCycle: e.target.value as any})} className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl text-xs font-black uppercase text-slate-900 dark:text-white">
                                <option value="monthly">Monthly</option>
                                <option value="annual">Annual</option>
                             </select>
                           </div>
                           <EditInput label="BILLED MO" type="number" value={payload.billedMonths?.toString() || '1'} onChange={(v: string) => setPayload({...payload, billedMonths: parseInt(v) || 1})} />
                        </div>
                        <EditInput label="CREDITS" type="number" value={payload.credits.toString()} onChange={(v: string) => setPayload({...payload, credits: parseInt(v) || 0})} />
                      </div>
                   </div>
                </div>
                <div className="p-10 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/60 flex justify-between items-center gap-10 shrink-0">
                   <button onClick={() => setIsDrawerOpen(false)} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Abort_Changes</button>
                   <button onClick={handleSave} disabled={isSaving} className="flex-grow bg-brand-blue text-white py-6 rounded-2xl text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(0,144,255,0.3)] flex items-center justify-center gap-6 hover:brightness-110 active:scale-[0.98] transition-all">
                      {isSaving ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24}/>}
                      {editingId ? 'ĐỒNG BỘ MANIFEST' : 'XUẤT BẢN GÓI NẠP'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditInput = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">{label}</label>
     <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner" />
  </div>
);