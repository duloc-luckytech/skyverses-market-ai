
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Edit3, Sparkles, Plus, Zap, Eye, EyeOff, 
  Loader2, Crown, Star, Calendar, ArrowDown, Trash2,
  X, ShieldCheck, AlignLeft, DollarSign, Layout, 
  PlusCircle, Palette, ToggleLeft, ToggleRight,
  CheckCircle2, Flame, Gift, MousePointer2, Layers,
  Box, Info, Percent, RefreshCw, Activity
} from 'lucide-react';
import { creditsApi, CreditPackage, CreditPackageRequest, CreditFeature, UnlimitedModelConfig } from '../../apis/credits';
import { useToast } from '../../context/ToastContext';

export const CreditPacksTab: React.FC = () => {
  const { showToast } = useToast();
  const [packs, setPacks] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialPayload: CreditPackageRequest = {
    code: '', name: '', description: '', 
    credits: 1000, bonusPercent: 0, bonusCredits: 0,
    price: 0, originalPrice: 0, currency: 'USD', 
    billingCycle: 'monthly', billedMonths: 1, discountPercent: 0,
    popular: false, highlight: false, badge: '', 
    ctaText: 'Mua ngay',
    ribbon: { text: '', color: '#C7F000', icon: '🔥' },
    features: [], 
    unlimitedModels: [],
    theme: { gradientFrom: '#0f172a', gradientTo: '#020617', accentColor: '#C7F000', buttonStyle: 'solid' },
    active: true, sortOrder: 0
  };

  const [payload, setPayload] = useState<CreditPackageRequest>(initialPayload);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await creditsApi.getAdminPackages();
      if (res.data) setPacks(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      console.error(error);
      showToast("Lỗi đồng bộ dữ liệu gói nạp từ Registry", "error");
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
      credits: pack.credits, bonusPercent: pack.bonusPercent || 0, bonusCredits: pack.bonusCredits || 0,
      price: pack.price, originalPrice: pack.originalPrice || 0, currency: pack.currency || 'USD',
      billingCycle: pack.billingCycle as any, billedMonths: pack.billedMonths || 1,
      discountPercent: pack.discountPercent || 0, popular: pack.popular || false, 
      highlight: pack.highlight || false, badge: pack.badge || '',
      ctaText: pack.ctaText || 'Mua ngay', 
      ribbon: pack.ribbon || { text: '', color: '#C7F000', icon: '🔥' },
      features: pack.features || [], 
      unlimitedModels: pack.unlimitedModels || [],
      theme: pack.theme || { gradientFrom: '#0f172a', gradientTo: '#020617', accentColor: '#C7F000', buttonStyle: 'solid' },
      active: pack.active, sortOrder: pack.sortOrder || 0
    });
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setPayload(initialPayload);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!payload.code || !payload.name) {
      showToast("Vui lòng nhập Mã gói và Tên hiển thị", "warning");
      return;
    }
    setIsSaving(true);
    try {
      let res;
      if (editingId) res = await creditsApi.updatePackage(editingId, payload);
      else res = await creditsApi.createPackage(payload);
      
      if (res.success) {
        showToast(editingId ? "Cập nhật thành công" : "Phát hành gói nạp mới thành công", "success");
        setIsDrawerOpen(false);
        fetchData();
      } else {
        showToast(res.message || "Thao tác thất bại", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ Cloud", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await creditsApi.togglePackage(id);
      if (res.success) {
        showToast("Đã thay đổi trạng thái hiển thị gói", "info");
        fetchData();
      }
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn gói nạp này? Hành động này không thể hoàn tác.")) return;
    try {
      const res = await creditsApi.deletePackage(id);
      if (res.success) {
        showToast("Đã xóa gói khỏi hệ thống", "success");
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const calculateTotal = () => {
    const bonusFromPercent = Math.floor((payload.credits * (payload.bonusPercent || 0)) / 100);
    return payload.credits + bonusFromPercent + (payload.bonusCredits || 0);
  };

  return (
    <div className="p-8 lg:p-12 h-full flex flex-col space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white dark:bg-[#08080a] p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-xl shadow-brand-blue/5">
         <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
               <Coins className="text-brand-blue" /> Quản trị Gói nạp <span className="text-brand-blue">Credits.</span>
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hệ thống quản lý Định mức & Chiến lược giá</p>
         </div>
         <button onClick={handleAddNew} className="bg-brand-blue text-white px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <Plus size={18} strokeWidth={3} /> Tạo gói mới
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {loading && packs.length === 0 ? (
          <div className="col-span-full h-[400px] flex flex-col items-center justify-center gap-6 opacity-40">
             <Loader2 className="animate-spin text-brand-blue" size={48} />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900 dark:text-white">Đang đồng bộ dữ liệu kinh tế...</p>
          </div>
        ) : packs.map(pack => (
          <div 
            key={pack._id} 
            className={`bg-[#fcfcfd] dark:bg-[#0d0d0f] border-2 p-10 rounded-[3rem] space-y-8 group transition-all shadow-sm relative ${pack.active ? 'border-black/5 dark:border-white/5 hover:border-brand-blue/30' : 'border-dashed border-red-500/20 opacity-60 grayscale'}`}
            style={pack.highlight ? { boxShadow: `0 0 50px ${pack.theme?.accentColor || '#0090ff'}20`, ring: `2px solid ${pack.theme?.accentColor}` } : {}}
          >
            {pack.ribbon?.text && (
               <div className="absolute -top-3 -right-3 px-5 py-2 rounded-xl shadow-2xl flex items-center gap-2 z-10 animate-pulse border border-black/10" style={{ backgroundColor: pack.ribbon.color }}>
                  <span className="text-[14px]">{pack.ribbon.icon}</span>
                  <span className="text-[11px] font-black uppercase text-black italic tracking-tighter">{pack.ribbon.text}</span>
               </div>
            )}
            
            <div className="flex justify-between items-start">
              <div className="p-5 rounded-2xl shadow-inner transition-transform group-hover:scale-110 bg-black/5 dark:bg-white/5" style={{ color: pack.theme?.accentColor || '#0090ff' }}>
                <Coins size={42} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(pack._id)} title="Bật/Tắt hiển thị" className={`p-3 rounded-xl transition-all border ${pack.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}>
                  {togglingId === pack._id ? <Loader2 size={18} className="animate-spin" /> : pack.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => handleEdit(pack)} title="Chỉnh sửa" className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-xl transition-all border border-black/5 dark:border-white/10 shadow-sm"><Edit3 size={18}/></button>
                <button onClick={() => handleDelete(pack._id)} title="Xóa vĩnh viễn" className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 shadow-sm"><Trash2 size={18}/></button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{pack.name}</h3>
                 {pack.badge && <span className="px-3 py-1 bg-brand-blue text-white text-[8px] font-black uppercase rounded-lg shadow-lg" style={{ backgroundColor: pack.theme?.accentColor }}>{pack.badge}</span>}
              </div>
              <p className="text-xs text-gray-500 font-medium italic line-clamp-2">"{pack.description || 'Không có mô tả'}"</p>
              <div className="flex items-center gap-3 pt-2">
                 <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest"><Calendar size={12} /> {pack.billingCycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}</div>
                 <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                 <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sắp xếp: {pack.sortOrder}</div>
              </div>
            </div>

            <div className="py-8 border-y border-black/5 dark:border-white/5 flex justify-between items-baseline">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Tổng nhận (Yield)</p>
                <p className="text-6xl font-black italic tracking-tighter" style={{ color: pack.theme?.accentColor || '#0090ff' }}>
                  {pack.totalCredits?.toLocaleString() || (pack.credits + (pack.bonusCredits || 0)).toLocaleString()} 
                  <span className="text-sm not-italic opacity-40 ml-2">CR</span>
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Giá bán</p>
                <div className="flex flex-col items-end">
                  {pack.originalPrice && pack.originalPrice > pack.price && (
                    <span className="text-[12px] text-gray-400 line-through font-bold">{pack.originalPrice.toLocaleString()} {pack.currency}</span>
                  )}
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{pack.price.toLocaleString()} <span className="text-xs opacity-50">{pack.currency}</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-black/5 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase">Tính năng</span>
                  <span className="text-xs font-black text-slate-700 dark:text-gray-300">{pack.features?.length || 0} Modules</span>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-black/5 flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase">Trạng thái</span>
                  <span className={`text-[9px] font-black uppercase italic ${pack.active ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {pack.active ? 'ĐANG KINH DOANH' : 'TẠM NGƯNG'}
                  </span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1200] flex justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsDrawerOpen(false)} />
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-6xl bg-white dark:bg-[#0c0c0e] h-full shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white overflow-hidden">
                
                {/* Header */}
                <div className="p-10 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40 transition-colors">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-[1.5rem] shadow-inner border border-brand-blue/20">
                         <Coins size={32} />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white leading-none">
                            {editingId ? 'Cập nhật cấu hình kinh tế' : 'Phát hành Gói nạp mới'}
                         </h3>
                         <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] italic mt-2">ĐANG TRUY CẬP HỆ THỐNG ĐIỀU PHỐI QUOTA</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      {editingId && <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest">ID: {editingId}</div>}
                      <button onClick={() => setIsDrawerOpen(false)} className="p-3 text-gray-400 hover:text-red-500 transition-colors hover:rotate-90 duration-300">
                        <X size={40}/>
                      </button>
                   </div>
                </div>
                
                {/* Body */}
                <div className="flex-grow overflow-y-auto p-12 space-y-20 no-scrollbar pb-40">
                   
                   {/* 1. IDENTITY */}
                   <section className="space-y-8">
                      <div className="flex items-center gap-4 border-l-4 border-brand-blue pl-6">
                         <AlignLeft size={20} className="text-brand-blue" />
                         <h4 className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-400">Định danh_Gói_nạp</h4>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <EditInput label="MÃ ĐỊNH DANH HỆ THỐNG (UNIQUE CODE) *" value={payload.code} onChange={(v: string) => setPayload({...payload, code: v.toLowerCase().replace(/\s+/g, '_')})} />
                           <EditInput label="TÊN HIỂN THỊ TRÊN CHỢ (NAME) *" value={payload.name} onChange={(v: string) => setPayload({...payload, name: v})} />
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2 italic">Mô tả ngắn</label>
                              <textarea value={payload.description} onChange={e => setPayload({...payload, description: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-blue transition-all" rows={3} placeholder="Mô tả giá trị của gói nạp này cho khách hàng..." />
                           </div>
                        </div>
                        <div className="space-y-6">
                           <EditInput label="NHÃN NÚT BẤM (CTA TEXT)" value={payload.ctaText} onChange={(v: string) => setPayload({...payload, ctaText: v})} />
                           <EditInput label="TRỌNG SỐ SẮP XẾP (SORT ORDER)" type="number" value={payload.sortOrder?.toString() || '0'} onChange={(v: string) => setPayload({...payload, sortOrder: parseInt(v) || 0})} />
                           <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-black/5 group">
                              <div className="flex items-center gap-4">
                                 <div className={`p-3 rounded-xl transition-all ${payload.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}><Activity size={20}/></div>
                                 <div>
                                    <p className="text-[11px] font-black uppercase italic">Trạng thái phát hành</p>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">Công khai gói nạp lên thị trường</p>
                                 </div>
                              </div>
                              <button onClick={() => setPayload({...payload, active: !payload.active})} className={`p-1 transition-all ${payload.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                 {payload.active ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                              </button>
                           </div>
                        </div>
                      </div>
                   </section>

                   {/* 2. ECONOMIC ALGORITHM */}
                   <section className="space-y-8">
                      <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-6">
                         <DollarSign size={20} className="text-emerald-500" />
                         <h4 className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-400">Thuật toán_Kinh_tế</h4>
                      </div>
                      
                      <div className="p-10 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-black/5 dark:border-white/5 space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-6">
                               <EditInput label="CREDITS GỐC (MONTHLY) *" type="number" value={payload.credits.toString()} onChange={(v: string) => setPayload({...payload, credits: parseInt(v) || 0})} />
                               <div className="grid grid-cols-2 gap-4">
                                  <EditInput label="THƯỞNG %" type="number" value={payload.bonusPercent?.toString() || '0'} onChange={(v: string) => setPayload({...payload, bonusPercent: parseInt(v) || 0})} />
                                  <EditInput label="THƯỞNG CỐ ĐỊNH" type="number" value={payload.bonusCredits?.toString() || '0'} onChange={(v: string) => setPayload({...payload, bonusCredits: parseInt(v) || 0})} />
                               </div>
                               <div className="p-6 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl flex flex-col gap-1 items-center">
                                  <span className="text-[9px] font-black uppercase text-brand-blue tracking-[0.2em] italic">Tổng Credits Thực Nhận</span>
                                  <span className="text-4xl font-black italic text-brand-blue">{calculateTotal().toLocaleString()} <span className="text-xs not-italic opacity-40">CR</span></span>
                               </div>
                            </div>
                            
                            <div className="space-y-6">
                               <EditInput label="GIÁ BÁN ƯU ĐÃI *" type="number" value={payload.price.toString()} onChange={(v: string) => setPayload({...payload, price: parseFloat(v) || 0})} />
                               <EditInput label="GIÁ GỐC (NIÊM YẾT)" type="number" value={payload.originalPrice?.toString() || '0'} onChange={(v: string) => setPayload({...payload, originalPrice: parseFloat(v) || 0})} />
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Loại tiền</label>
                                     <select value={payload.currency} onChange={e => setPayload({...payload, currency: e.target.value})} className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl text-xs font-black uppercase text-slate-900 dark:text-white outline-none border border-black/5">
                                        <option value="USD">USD ($)</option>
                                        <option value="VND">VND (đ)</option>
                                        <option value="EUR">EUR (€)</option>
                                     </select>
                                  </div>
                                  <EditInput label="CHIẾT KHẤU %" type="number" value={payload.discountPercent?.toString() || '0'} onChange={(v: string) => setPayload({...payload, discountPercent: parseInt(v) || 0})} />
                               </div>
                            </div>

                            <div className="space-y-6">
                               <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Chu kỳ thanh toán</label>
                                 <select value={payload.billingCycle} onChange={e => setPayload({...payload, billingCycle: e.target.value as any})} className="w-full bg-slate-100 dark:bg-white/5 p-4 rounded-xl text-xs font-black uppercase text-slate-900 dark:text-white outline-none border border-black/5">
                                    <option value="monthly">Hàng tháng (Monthly)</option>
                                    <option value="annual">Hàng năm (Annual)</option>
                                 </select>
                               </div>
                               <EditInput label="SỐ THÁNG THANH TOÁN" type="number" value={payload.billedMonths?.toString() || '1'} onChange={(v: string) => setPayload({...payload, billedMonths: parseInt(v) || 1})} />
                               <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                                  <div className="flex justify-between text-[10px] font-black uppercase italic">
                                     <span className="text-gray-500">Giá trị giao dịch:</span>
                                     <span className="text-emerald-500">{(payload.price * (payload.billedMonths || 1)).toLocaleString()} {payload.currency}</span>
                                  </div>
                                  <div className="h-px bg-emerald-500/10"></div>
                                  <p className="text-[8px] text-gray-400 italic">Số tiền thực thu trên mỗi lần quét thanh toán của khách hàng.</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </section>

                   {/* 3. UI FLAGS & RIBBON */}
                   <section className="space-y-8">
                      <div className="flex items-center gap-4 border-l-4 border-amber-500 pl-6">
                         <Star size={20} className="text-amber-500" />
                         <h4 className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-400">Tiếp_thị_&_Hiển_thị</h4>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 flex flex-col gap-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase text-amber-500">PHỔ BIẾN</span>
                                  <button onClick={() => setPayload({...payload, popular: !payload.popular})} className={`p-1 transition-all ${payload.popular ? 'text-amber-500' : 'text-slate-400'}`}>
                                     {payload.popular ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                  </button>
                               </div>
                               <p className="text-[8px] text-gray-400 uppercase italic">Gắn nhãn "Popular" để thu hút người dùng</p>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 flex flex-col gap-4">
                               <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase text-brand-blue">NỔI BẬT</span>
                                  <button onClick={() => setPayload({...payload, highlight: !payload.highlight})} className={`p-1 transition-all ${payload.highlight ? 'text-brand-blue' : 'text-slate-400'}`}>
                                     {payload.highlight ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                  </button>
                               </div>
                               <p className="text-[8px] text-gray-400 uppercase italic">Tạo hiệu ứng hào quang quanh gói nạp</p>
                            </div>
                            <div className="col-span-2">
                               <EditInput label="HUY HIỆU GÓC (VÍ DỤ: +25% THƯỞNG)" value={payload.badge || ''} onChange={(v: string) => setPayload({...payload, badge: v})} />
                            </div>
                         </div>

                         <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-black/5 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-2">Cấu hình Nuy-băng (Ribbon)</p>
                            <div className="grid grid-cols-2 gap-4">
                               <EditInput label="CHỮ HIỂN THỊ" value={payload.ribbon?.text || ''} onChange={(v: string) => setPayload({...payload, ribbon: { ...payload.ribbon!, text: v }})} />
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">Màu sắc</label>
                                  <div className="flex gap-2">
                                     <input type="color" value={payload.ribbon?.color || '#C7F000'} onChange={e => setPayload({...payload, ribbon: { ...payload.ribbon!, color: e.target.value }})} className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer" />
                                     <input type="text" value={payload.ribbon?.color} onChange={e => setPayload({...payload, ribbon: { ...payload.ribbon!, color: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-3 rounded-lg text-xs font-mono uppercase outline-none" />
                                  </div>
                               </div>
                            </div>
                            <EditInput label="BIỂU TƯỢNG (EMOJI)" value={payload.ribbon?.icon || ''} onChange={(v: string) => setPayload({...payload, ribbon: { ...payload.ribbon!, icon: v }})} />
                         </div>
                      </div>
                   </section>

                   {/* 4. FEATURE LIST & UNLIMITED MODELS */}
                   <section className="space-y-12">
                      <div className="flex items-center gap-4 border-l-4 border-purple-500 pl-6">
                         <Layers size={20} className="text-purple-500" />
                         <h4 className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-400">Tính năng_đính_kèm</h4>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                         {/* Features Manager */}
                         <div className="space-y-6">
                            <div className="flex justify-between items-center">
                               <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest italic">Danh sách đặc quyền</label>
                               <button 
                                onClick={() => setPayload({...payload, features: [...(payload.features || []), { key: 'feat', label: 'Tính năng mới', enabled: true, highlight: false }]})}
                                className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all"
                               >
                                  <Plus size={16}/>
                               </button>
                            </div>
                            <div className="space-y-4">
                               {payload.features?.map((f, idx) => (
                                  <div key={idx} className="p-6 bg-slate-50 dark:bg-white/5 border border-black/5 rounded-2xl space-y-4 relative group">
                                     <div className="flex gap-4">
                                        <div className="flex-grow space-y-4">
                                           <div className="grid grid-cols-2 gap-4">
                                              <input value={f.key} onChange={e => {
                                                 const next = [...payload.features!];
                                                 next[idx].key = e.target.value;
                                                 setPayload({...payload, features: next});
                                              }} className="w-full bg-white dark:bg-black p-3 rounded-xl text-[10px] font-black uppercase outline-none shadow-inner" placeholder="Mã key" />
                                              <input value={f.label} onChange={e => {
                                                 const next = [...payload.features!];
                                                 next[idx].label = e.target.value;
                                                 setPayload({...payload, features: next});
                                              }} className="w-full bg-white dark:bg-black p-3 rounded-xl text-[11px] font-bold outline-none shadow-inner" placeholder="Tên đặc quyền" />
                                           </div>
                                           <input value={f.note || ''} onChange={e => {
                                              const next = [...payload.features!];
                                              next[idx].note = e.target.value;
                                              setPayload({...payload, features: next});
                                           }} className="w-full bg-white dark:bg-black p-3 rounded-xl text-[10px] font-medium italic outline-none shadow-inner" placeholder="Ghi chú thêm..." />
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                           <button onClick={() => {
                                              const next = [...payload.features!];
                                              next[idx].enabled = !next[idx].enabled;
                                              setPayload({...payload, features: next});
                                           }} className={`p-3 rounded-xl border transition-all ${f.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-100 text-gray-400'}`}>
                                              <CheckCircle2 size={16}/>
                                           </button>
                                           <button onClick={() => {
                                              const next = [...payload.features!];
                                              next[idx].highlight = !next[idx].highlight;
                                              setPayload({...payload, features: next});
                                           }} className={`p-3 rounded-xl border transition-all ${f.highlight ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-gray-100 text-gray-400'}`}>
                                              <Zap size={16}/>
                                           </button>
                                        </div>
                                     </div>
                                     <button 
                                      onClick={() => setPayload({...payload, features: payload.features?.filter((_, i) => i !== idx)})}
                                      className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                     >
                                        <Trash2 size={14}/>
                                     </button>
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* Unlimited Models Manager */}
                         <div className="space-y-6">
                            <div className="flex justify-between items-center">
                               <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest italic">Gói không giới hạn (Unlimited)</label>
                               <button 
                                onClick={() => setPayload({...payload, unlimitedModels: [...(payload.unlimitedModels || []), { modelKey: 'veo', label: 'Model mới', badge: '365 NGÀY UNLIMITED', enabled: true, highlight: true }]})}
                                className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                               >
                                  <Plus size={16}/>
                               </button>
                            </div>
                            <div className="space-y-4">
                               {payload.unlimitedModels?.map((m, idx) => (
                                  <div key={idx} className="p-6 bg-slate-50 dark:bg-white/5 border border-black/5 rounded-2xl space-y-4 relative group">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input value={m.modelKey} onChange={e => {
                                           const next = [...payload.unlimitedModels!];
                                           next[idx].modelKey = e.target.value;
                                           setPayload({...payload, unlimitedModels: next});
                                        }} className="w-full bg-white dark:bg-black p-3 rounded-xl text-[10px] font-black outline-none shadow-inner" placeholder="Mã Model (Hệ thống)" />
                                        <input value={m.label} onChange={e => {
                                           const next = [...payload.unlimitedModels!];
                                           next[idx].label = e.target.value;
                                           setPayload({...payload, unlimitedModels: next});
                                        }} className="w-full bg-white dark:bg-black p-3 rounded-xl text-[11px] font-bold outline-none shadow-inner" placeholder="Tên hiển thị" />
                                     </div>
                                     <div className="flex gap-4">
                                        <input value={m.badge} onChange={e => {
                                           const next = [...payload.unlimitedModels!];
                                           next[idx].badge = e.target.value;
                                           setPayload({...payload, unlimitedModels: next});
                                        }} className="flex-grow bg-white dark:bg-black p-3 rounded-xl text-[10px] font-black uppercase text-brand-blue outline-none shadow-inner" placeholder="Chữ trên Badge" />
                                        <div className="flex gap-2">
                                           <button onClick={() => {
                                              const next = [...payload.unlimitedModels!];
                                              next[idx].enabled = !next[idx].enabled;
                                              setPayload({...payload, unlimitedModels: next});
                                           }} className={`p-3 rounded-xl border transition-all ${m.enabled ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-gray-100 text-gray-400'}`}>
                                              <ShieldCheck size={16}/>
                                           </button>
                                           <button onClick={() => {
                                              const next = [...payload.unlimitedModels!];
                                              next[idx].highlight = !next[idx].highlight;
                                              setPayload({...payload, unlimitedModels: next});
                                           }} className={`p-3 rounded-xl border transition-all ${m.highlight ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-gray-100 text-gray-400'}`}>
                                              <Sparkles size={16}/>
                                           </button>
                                        </div>
                                     </div>
                                     <button 
                                      onClick={() => setPayload({...payload, unlimitedModels: payload.unlimitedModels?.filter((_, i) => i !== idx)})}
                                      className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                     >
                                        <Trash2 size={14}/>
                                     </button>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </section>

                   {/* 5. THEME ENGINE */}
                   <section className="space-y-8">
                      <div className="flex items-center gap-4 border-l-4 border-rose-500 pl-6">
                         <Palette size={20} className="text-rose-500" />
                         <h4 className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-400">Giao_diện_Hiển_thị</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-black/5 space-y-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Màu nền Gradient</p>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-gray-400 px-2">Bắt đầu từ</label>
                                  <div className="flex gap-2">
                                     <input type="color" value={payload.theme?.gradientFrom || '#0f172a'} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientFrom: e.target.value }})} className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer" />
                                     <input value={payload.theme?.gradientFrom} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientFrom: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-2 text-[10px] font-mono outline-none rounded-lg" />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-gray-400 px-2">Kết thúc tại</label>
                                  <div className="flex gap-2">
                                     <input type="color" value={payload.theme?.gradientTo || '#020617'} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientTo: e.target.value }})} className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer" />
                                     <input value={payload.theme?.gradientTo} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientTo: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-2 text-[10px] font-mono outline-none rounded-lg" />
                                  </div>
                               </div>
                            </div>
                            <div className="h-24 w-full rounded-2xl shadow-xl border border-white/10" style={{ background: `linear-gradient(135deg, ${payload.theme?.gradientFrom}, ${payload.theme?.gradientTo})` }}></div>
                         </div>

                         <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-black/5 space-y-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Màu nhấn & Nút bấm</p>
                            <div className="space-y-6">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-gray-400 px-2">Màu nhấn chủ đạo (Accent)</label>
                                  <div className="flex gap-4">
                                     <input type="color" value={payload.theme?.accentColor || '#C7F000'} onChange={e => setPayload({...payload, theme: { ...payload.theme!, accentColor: e.target.value }})} className="w-12 h-12 rounded-xl bg-transparent border-none shadow-lg cursor-pointer" />
                                     <input value={payload.theme?.accentColor} onChange={e => setPayload({...payload, theme: { ...payload.theme!, accentColor: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-3 text-[11px] font-mono outline-none rounded-xl" />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-gray-400 px-2">Kiểu dáng Nút bấm</label>
                                  <div className="flex bg-black/10 p-1 rounded-xl">
                                     {[
                                       {id: 'solid', label: 'Khối'}, 
                                       {id: 'neon', label: 'Phát sáng'}, 
                                       {id: 'pink', label: 'Premium Pink'}
                                     ].map(s => (
                                        <button 
                                          key={s.id} onClick={() => setPayload({...payload, theme: { ...payload.theme!, buttonStyle: s.id as any }})}
                                          className={`flex-grow py-3 rounded-lg text-[10px] font-black uppercase transition-all ${payload.theme?.buttonStyle === s.id ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-500'}`}
                                        >
                                           {s.label}
                                        </button>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </section>

                </div>

                {/* Footer */}
                <div className="p-10 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/60 flex justify-between items-center gap-10 shrink-0 relative z-50">
                   <button onClick={() => setIsDrawerOpen(false)} className="text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2">
                      <X size={16}/> HỦY THAY ĐỔI
                   </button>
                   <div className="flex items-center gap-6">
                      <div className="hidden lg:flex flex-col items-end gap-1">
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Xác thực Ma trận Kinh tế</span>
                         <div className="flex items-center gap-2 text-emerald-500">
                            <CheckCircle2 size={14}/> <span className="text-[11px] font-black uppercase">SẴN SÀNG CẬP NHẬT</span>
                         </div>
                      </div>
                      <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="bg-brand-blue text-white px-16 py-6 rounded-2xl text-[14px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(0,144,255,0.4)] flex items-center justify-center gap-6 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 group"
                      >
                         {isSaving ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} className="group-hover:scale-125 transition-transform" />}
                         {editingId ? 'CẬP NHẬT HỆ THỐNG' : 'PHÁT HÀNH GÓI BÁN'}
                      </button>
                   </div>
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
     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2 italic">{label}</label>
     <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl text-[12px] font-black outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner" />
  </div>
);
