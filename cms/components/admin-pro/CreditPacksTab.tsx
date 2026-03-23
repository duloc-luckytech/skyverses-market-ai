
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Edit3, Plus, Zap, Eye, EyeOff, 
  Loader2, Crown, Star, Calendar, Trash2,
  X, ShieldCheck, AlignLeft, DollarSign, 
  Palette, ToggleLeft, ToggleRight,
  CheckCircle2, MousePointer2, Layers,
  RefreshCw
} from 'lucide-react';
import { creditsApi, CreditPackage, CreditPackageRequest } from '../../apis/credits';
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
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="shrink-0 bg-white dark:bg-[#08080a] border-b border-slate-200 dark:border-white/5 p-6 lg:p-8 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Coins className="text-brand-blue" size={22} /> Quản trị Gói nạp Credits
            </h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{packs.length} gói · Hệ thống quản lý Định mức &amp; Chiến lược giá</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-brand-blue/20 hover:scale-[1.02] transition-all">
              <Plus size={14} strokeWidth={3} /> Tạo gói mới
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 flex-wrap">
          {packs.map(p => {
            const total = p.totalCredits || (p.credits + Math.floor(p.credits * (p.bonusPercent || 0) / 100) + (p.bonusCredits || 0));
            return (
              <div key={p._id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${p.active ? 'bg-white dark:bg-white/[0.03] border-black/[0.04] dark:border-white/[0.06]' : 'bg-slate-50 dark:bg-white/[0.01] border-dashed border-slate-200 dark:border-white/5 opacity-50'}`}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.theme?.accentColor || '#0090ff' }} />
                <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300">{p.name}</span>
                <span className="text-[10px] font-black" style={{ color: p.theme?.accentColor || '#0090ff' }}>${p.price}</span>
                <span className="text-[9px] text-slate-400">/ {total.toLocaleString()} cr</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="flex-grow overflow-y-auto p-6 lg:p-8">
        {loading && packs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
            {packs.map(pack => {
              const total = pack.totalCredits || (pack.credits + Math.floor(pack.credits * (pack.bonusPercent || 0) / 100) + (pack.bonusCredits || 0));
              const bonusFromPercent = Math.floor(pack.credits * (pack.bonusPercent || 0) / 100);
              const accentColor = pack.theme?.accentColor || '#0090ff';

              return (
                <div
                  key={pack._id}
                  className={`rounded-2xl border overflow-hidden transition-all group relative ${pack.active ? 'border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.12]' : 'border-dashed border-red-500/20 opacity-60'}`}
                  style={pack.highlight ? { boxShadow: `0 0 40px ${accentColor}15` } : {}}
                >
                  {/* Ribbon */}
                  {pack.ribbon?.text && (
                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 shadow-lg" style={{ backgroundColor: pack.ribbon.color, color: '#000' }}>
                      <span>{pack.ribbon.icon}</span> {pack.ribbon.text}
                    </div>
                  )}

                  {/* Theme gradient header strip */}
                  <div className="h-2" style={{ background: `linear-gradient(90deg, ${pack.theme?.gradientFrom || '#0f172a'}, ${accentColor}, ${pack.theme?.gradientTo || '#020617'})` }} />

                  {/* Card body */}
                  <div className="bg-white dark:bg-[#0c0c0e] p-5 space-y-4">
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Coins size={16} style={{ color: accentColor }} />
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{pack.name}</h3>
                          {pack.badge && (
                            <span className="px-1.5 py-0.5 text-[8px] font-bold text-white rounded" style={{ backgroundColor: accentColor }}>{pack.badge}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{pack.code} · sort:{pack.sortOrder}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleToggle(pack._id)} className={`p-1.5 rounded-lg transition-all border ${pack.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' : 'bg-red-500/10 text-red-500 border-red-500/15'}`}>
                          {togglingId === pack._id ? <Loader2 size={13} className="animate-spin" /> : pack.active ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button onClick={() => handleEdit(pack)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-all border border-black/[0.04] dark:border-white/[0.04]"><Edit3 size={13} /></button>
                        <button onClick={() => handleDelete(pack._id)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-400 hover:text-rose-600 transition-all border border-rose-500/10"><Trash2 size={13} /></button>
                      </div>
                    </div>

                    {pack.description && (
                      <p className="text-[10px] text-slate-400 italic line-clamp-2">&quot;{pack.description}&quot;</p>
                    )}

                    {/* Price section */}
                    <div className="flex items-end justify-between py-3 border-y border-slate-100 dark:border-white/[0.04]">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Giá bán</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black" style={{ color: accentColor }}>${pack.price}</span>
                          <span className="text-[10px] text-slate-400 font-medium">/{pack.billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                        </div>
                        {pack.originalPrice && pack.originalPrice > pack.price && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-400 line-through">${pack.originalPrice}</span>
                            {pack.discountPercent && (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold text-white bg-red-500 rounded">-{pack.discountPercent}%</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng Credits</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{total.toLocaleString()}</p>
                        <p className="text-[8px] text-slate-400 uppercase">credits</p>
                      </div>
                    </div>

                    {/* Credit breakdown */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Credit Breakdown</p>
                      <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded font-semibold text-slate-600 dark:text-gray-300">{pack.credits.toLocaleString()}</span>
                        {pack.bonusPercent > 0 && (
                          <>
                            <span className="text-slate-300">+</span>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded font-semibold">{pack.bonusPercent}% ({bonusFromPercent.toLocaleString()})</span>
                          </>
                        )}
                        {(pack.bonusCredits || 0) > 0 && (
                          <>
                            <span className="text-slate-300">+</span>
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded font-semibold">{pack.bonusCredits?.toLocaleString()}</span>
                          </>
                        )}
                        <span className="text-slate-300">=</span>
                        <span className="px-2 py-1 rounded font-bold text-white text-[10px]" style={{ backgroundColor: accentColor }}>{total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Features */}
                    {pack.features && pack.features.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tính năng ({pack.features.length})</p>
                        <div className="space-y-1">
                          {pack.features.map((f: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-[10px]">
                              <CheckCircle2 size={11} className={f.enabled ? 'text-emerald-500' : 'text-slate-300'} />
                              <span className={`${f.enabled ? 'text-slate-600 dark:text-gray-300' : 'text-slate-300 dark:text-gray-600 line-through'} ${f.highlight ? 'font-bold' : 'font-medium'}`}>
                                {f.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unlimited models */}
                    {pack.unlimitedModels && pack.unlimitedModels.filter((m: any) => m.enabled).length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wider flex items-center gap-1"><Crown size={10} /> Unlimited Models</p>
                        <div className="flex flex-wrap gap-1">
                          {pack.unlimitedModels.filter((m: any) => m.enabled).map((m: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 text-[9px] font-bold rounded bg-violet-500/10 text-violet-500 border border-violet-500/15">{m.label}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                      <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={10} /> {pack.billingCycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                        {pack.billedMonths > 1 && ` · ${pack.billedMonths} tháng`}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-1 rounded" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                        <MousePointer2 size={9} className="inline mr-1" />{pack.ctaText}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-3xl bg-white dark:bg-[#0c0c0e] h-full flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white overflow-hidden">
              
              {/* Header */}
              <div className="shrink-0 px-6 py-5 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-blue/10 flex items-center justify-center text-brand-blue rounded-xl">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingId ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {editingId ? `ID: ${editingId}` : 'Thiết lập cấu hình gói nạp credits'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">

                {/* ── Section 1: Identity ── */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                    <AlignLeft size={13} /> Thông tin gói
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FInput label="Mã gói (code) *" value={payload.code} onChange={(v: string) => setPayload({...payload, code: v.toLowerCase().replace(/\s+/g, '_')})} />
                    <FInput label="Tên hiển thị *" value={payload.name} onChange={(v: string) => setPayload({...payload, name: v})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả</label>
                    <textarea value={payload.description} onChange={e => setPayload({...payload, description: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-brand-blue/40 transition-all resize-none" rows={2} placeholder="Mô tả ngắn..." />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <FInput label="CTA Button" value={payload.ctaText || ''} onChange={(v: string) => setPayload({...payload, ctaText: v})} />
                    <FInput label="Thứ tự" type="number" value={payload.sortOrder?.toString() || '0'} onChange={(v: string) => setPayload({...payload, sortOrder: parseInt(v) || 0})} />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</label>
                      <button onClick={() => setPayload({...payload, active: !payload.active})} className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold transition-all ${payload.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {payload.active ? <><ToggleRight size={16} /> Đang bật</> : <><ToggleLeft size={16} /> Tắt</>}
                      </button>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />

                {/* ── Section 2: Credits & Pricing ── */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    <DollarSign size={13} /> Credits &amp; Giá
                  </div>

                  {/* Credits row */}
                  <div className="grid grid-cols-3 gap-3">
                    <FInput label="Credits gốc *" type="number" value={payload.credits.toString()} onChange={(v: string) => setPayload({...payload, credits: parseInt(v) || 0})} />
                    <FInput label="Bonus %" type="number" value={payload.bonusPercent?.toString() || '0'} onChange={(v: string) => setPayload({...payload, bonusPercent: parseInt(v) || 0})} />
                    <FInput label="Bonus cố định" type="number" value={payload.bonusCredits?.toString() || '0'} onChange={(v: string) => setPayload({...payload, bonusCredits: parseInt(v) || 0})} />
                  </div>

                  {/* Total display */}
                  <div className="flex items-center justify-between p-3 bg-brand-blue/5 border border-brand-blue/15 rounded-xl">
                    <span className="text-[10px] font-bold text-brand-blue uppercase">Tổng Credits thực nhận</span>
                    <span className="text-lg font-black text-brand-blue">{calculateTotal().toLocaleString()} <span className="text-[10px] font-normal opacity-50">CR</span></span>
                  </div>

                  {/* Price row */}
                  <div className="grid grid-cols-4 gap-3">
                    <FInput label="Giá bán *" type="number" value={payload.price.toString()} onChange={(v: string) => setPayload({...payload, price: parseFloat(v) || 0})} />
                    <FInput label="Giá gốc" type="number" value={payload.originalPrice?.toString() || '0'} onChange={(v: string) => setPayload({...payload, originalPrice: parseFloat(v) || 0})} />
                    <FInput label="Chiết khấu %" type="number" value={payload.discountPercent?.toString() || '0'} onChange={(v: string) => setPayload({...payload, discountPercent: parseInt(v) || 0})} />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiền tệ</label>
                      <select value={payload.currency} onChange={e => setPayload({...payload, currency: e.target.value})} className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                        <option value="USD">USD</option>
                        <option value="VND">VND</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  {/* Billing row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chu kỳ</label>
                      <select value={payload.billingCycle} onChange={e => setPayload({...payload, billingCycle: e.target.value as any})} className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                        <option value="monthly">Hàng tháng</option>
                        <option value="annual">Hàng năm</option>
                      </select>
                    </div>
                    <FInput label="Số tháng thanh toán" type="number" value={payload.billedMonths?.toString() || '1'} onChange={(v: string) => setPayload({...payload, billedMonths: parseInt(v) || 1})} />
                  </div>

                  {/* Transaction value */}
                  <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400">Giá trị giao dịch</span>
                    <span className="text-sm font-bold text-emerald-500">{(payload.price * (payload.billedMonths || 1)).toLocaleString()} {payload.currency}</span>
                  </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />

                {/* ── Section 3: Marketing ── */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    <Star size={13} /> Marketing &amp; Hiển thị
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Popular toggle */}
                    <button onClick={() => setPayload({...payload, popular: !payload.popular})} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${payload.popular ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-400'}`}>
                      <span className="text-[10px] font-bold uppercase">Phổ biến</span>
                      {payload.popular ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    {/* Highlight toggle */}
                    <button onClick={() => setPayload({...payload, highlight: !payload.highlight})} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${payload.highlight ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-400'}`}>
                      <span className="text-[10px] font-bold uppercase">Nổi bật</span>
                      {payload.highlight ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </div>

                  <FInput label="Huy hiệu (Badge)" value={payload.badge || ''} onChange={(v: string) => setPayload({...payload, badge: v})} placeholder="VD: +20% BONUS" />

                  {/* Ribbon */}
                  <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ribbon</p>
                    <div className="grid grid-cols-3 gap-3">
                      <FInput label="Chữ" value={payload.ribbon?.text || ''} onChange={(v: string) => setPayload({...payload, ribbon: { ...payload.ribbon!, text: v }})} />
                      <FInput label="Emoji" value={payload.ribbon?.icon || ''} onChange={(v: string) => setPayload({...payload, ribbon: { ...payload.ribbon!, icon: v }})} />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Màu</label>
                        <div className="flex gap-2">
                          <input type="color" value={payload.ribbon?.color || '#C7F000'} onChange={e => setPayload({...payload, ribbon: { ...payload.ribbon!, color: e.target.value }})} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                          <input value={payload.ribbon?.color || ''} onChange={e => setPayload({...payload, ribbon: { ...payload.ribbon!, color: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-2 rounded-lg text-[10px] font-mono outline-none border border-slate-200 dark:border-white/[0.06]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />

                {/* ── Section 4: Features ── */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                      <Layers size={13} /> Tính năng ({payload.features?.length || 0})
                    </div>
                    <button onClick={() => setPayload({...payload, features: [...(payload.features || []), { key: 'feat', label: 'Tính năng mới', enabled: true, highlight: false }]})} className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue hover:text-white transition-all">
                      <Plus size={12} /> Thêm
                    </button>
                  </div>

                  <div className="space-y-2">
                    {payload.features?.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl group">
                        <input value={f.key} onChange={e => { const n = [...payload.features!]; n[idx].key = e.target.value; setPayload({...payload, features: n}); }} className="w-16 shrink-0 bg-white dark:bg-black/30 p-2 rounded-lg text-[9px] font-mono uppercase outline-none border border-slate-100 dark:border-white/[0.04]" placeholder="key" />
                        <input value={f.label} onChange={e => { const n = [...payload.features!]; n[idx].label = e.target.value; setPayload({...payload, features: n}); }} className="flex-grow bg-white dark:bg-black/30 p-2 rounded-lg text-[10px] font-medium outline-none border border-slate-100 dark:border-white/[0.04]" placeholder="Tên tính năng" />
                        <button onClick={() => { const n = [...payload.features!]; n[idx].enabled = !n[idx].enabled; setPayload({...payload, features: n}); }} className={`p-1.5 rounded-lg transition-all ${f.enabled ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-300 bg-slate-100 dark:bg-white/5'}`}>
                          <CheckCircle2 size={14} />
                        </button>
                        <button onClick={() => { const n = [...payload.features!]; n[idx].highlight = !n[idx].highlight; setPayload({...payload, features: n}); }} className={`p-1.5 rounded-lg transition-all ${f.highlight ? 'text-amber-500 bg-amber-500/10' : 'text-slate-300 bg-slate-100 dark:bg-white/5'}`}>
                          <Zap size={14} />
                        </button>
                        <button onClick={() => setPayload({...payload, features: payload.features?.filter((_: any, i: number) => i !== idx)})} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />

                {/* ── Section 5: Unlimited Models ── */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                      <Crown size={13} /> Unlimited Models ({payload.unlimitedModels?.length || 0})
                    </div>
                    <button onClick={() => setPayload({...payload, unlimitedModels: [...(payload.unlimitedModels || []), { modelKey: 'new_model', label: 'Model mới', badge: 'UNLIMITED', enabled: true, highlight: true }]})} className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-indigo-500 bg-indigo-500/10 rounded-lg hover:bg-indigo-500 hover:text-white transition-all">
                      <Plus size={12} /> Thêm
                    </button>
                  </div>

                  <div className="space-y-2">
                    {payload.unlimitedModels?.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl group">
                        <input value={m.modelKey} onChange={e => { const n = [...payload.unlimitedModels!]; n[idx].modelKey = e.target.value; setPayload({...payload, unlimitedModels: n}); }} className="w-24 shrink-0 bg-white dark:bg-black/30 p-2 rounded-lg text-[9px] font-mono outline-none border border-slate-100 dark:border-white/[0.04]" placeholder="model_key" />
                        <input value={m.label} onChange={e => { const n = [...payload.unlimitedModels!]; n[idx].label = e.target.value; setPayload({...payload, unlimitedModels: n}); }} className="flex-grow bg-white dark:bg-black/30 p-2 rounded-lg text-[10px] font-medium outline-none border border-slate-100 dark:border-white/[0.04]" placeholder="Tên hiển thị" />
                        <input value={m.badge} onChange={e => { const n = [...payload.unlimitedModels!]; n[idx].badge = e.target.value; setPayload({...payload, unlimitedModels: n}); }} className="w-24 shrink-0 bg-white dark:bg-black/30 p-2 rounded-lg text-[9px] font-bold uppercase text-indigo-500 outline-none border border-slate-100 dark:border-white/[0.04]" placeholder="Badge" />
                        <button onClick={() => { const n = [...payload.unlimitedModels!]; n[idx].enabled = !n[idx].enabled; setPayload({...payload, unlimitedModels: n}); }} className={`p-1.5 rounded-lg transition-all ${m.enabled ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-300 bg-slate-100 dark:bg-white/5'}`}>
                          <ShieldCheck size={14} />
                        </button>
                        <button onClick={() => setPayload({...payload, unlimitedModels: payload.unlimitedModels?.filter((_: any, i: number) => i !== idx)})} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />

                {/* ── Section 6: Theme ── */}
                <section className="space-y-4 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    <Palette size={13} /> Giao diện
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gradient From</label>
                      <div className="flex gap-1.5">
                        <input type="color" value={payload.theme?.gradientFrom || '#0f172a'} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientFrom: e.target.value }})} className="w-9 h-9 rounded-lg cursor-pointer border-0" />
                        <input value={payload.theme?.gradientFrom || ''} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientFrom: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-2 text-[9px] font-mono outline-none rounded-lg border border-slate-200 dark:border-white/[0.06]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gradient To</label>
                      <div className="flex gap-1.5">
                        <input type="color" value={payload.theme?.gradientTo || '#020617'} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientTo: e.target.value }})} className="w-9 h-9 rounded-lg cursor-pointer border-0" />
                        <input value={payload.theme?.gradientTo || ''} onChange={e => setPayload({...payload, theme: { ...payload.theme!, gradientTo: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-2 text-[9px] font-mono outline-none rounded-lg border border-slate-200 dark:border-white/[0.06]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accent</label>
                      <div className="flex gap-1.5">
                        <input type="color" value={payload.theme?.accentColor || '#C7F000'} onChange={e => setPayload({...payload, theme: { ...payload.theme!, accentColor: e.target.value }})} className="w-9 h-9 rounded-lg cursor-pointer border-0" />
                        <input value={payload.theme?.accentColor || ''} onChange={e => setPayload({...payload, theme: { ...payload.theme!, accentColor: e.target.value }})} className="flex-grow bg-white dark:bg-black/20 p-2 text-[9px] font-mono outline-none rounded-lg border border-slate-200 dark:border-white/[0.06]" />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="h-16 w-full rounded-xl border border-white/10 shadow-inner" style={{ background: `linear-gradient(135deg, ${payload.theme?.gradientFrom}, ${payload.theme?.gradientTo})` }}>
                    <div className="h-full flex items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: payload.theme?.accentColor }}>{payload.name || 'Preview'}</span>
                    </div>
                  </div>

                  {/* Button style */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kiểu nút</label>
                    <div className="flex bg-slate-100 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200 dark:border-white/[0.06]">
                      {[{id: 'solid', label: 'Khối'}, {id: 'neon', label: 'Phát sáng'}, {id: 'pink', label: 'Premium'}].map(s => (
                        <button
                          key={s.id}
                          onClick={() => setPayload({...payload, theme: { ...payload.theme!, buttonStyle: s.id as any }})}
                          className={`flex-grow py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${payload.theme?.buttonStyle === s.id ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-black/40 flex items-center justify-between">
                <button onClick={() => setIsDrawerOpen(false)} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5">
                  <X size={14} /> Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-brand-blue/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {editingId ? 'Cập nhật' : 'Tạo gói'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FInput = ({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-2.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-brand-blue/40 transition-all" placeholder={placeholder} />
  </div>
);
