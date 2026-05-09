
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Edit3, Plus, Eye, EyeOff,
  Loader2, Trash2, X, ArrowRight,
  ToggleLeft, ToggleRight, RefreshCw,
  Link as LinkIcon, Tag, Type, AlignLeft
} from 'lucide-react';
import { promoBannersApi, PromoBanner, PromoBannerRequest } from '../../apis/promo-banners';
import { useToast } from '../../context/ToastContext';

const initialPayload: Partial<PromoBannerRequest> = {
  tag: '',
  heroTitle: '',
  heroHighlight: '',
  heroDesc: '',
  title: '',
  desc: '',
  cta: 'Xem ngay',
  link: '/pricing',
  active: true,
  sortOrder: 0,
};

export const PromoBannersTab: React.FC = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payload, setPayload] = useState<Partial<PromoBannerRequest>>(initialPayload);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await promoBannersApi.getAll();
      if (res.data) setBanners(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      console.error(error);
      showToast("Lỗi tải dữ liệu promo banners", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (banner: PromoBanner) => {
    setEditingId(banner._id);
    setPayload({
      tag: banner.tag,
      heroTitle: banner.heroTitle,
      heroHighlight: banner.heroHighlight,
      heroDesc: banner.heroDesc,
      title: banner.title,
      desc: banner.desc,
      cta: banner.cta,
      link: banner.link,
      active: banner.active,
      sortOrder: banner.sortOrder,
    });
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setPayload(initialPayload);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!payload.tag || !payload.heroTitle || !payload.heroHighlight) {
      showToast("Vui lòng nhập Tag, Hero Title và Highlight", "warning");
      return;
    }
    setIsSaving(true);
    try {
      let res;
      if (editingId) res = await promoBannersApi.update(editingId, payload);
      else res = await promoBannersApi.create(payload);

      if (res.success) {
        showToast(editingId ? "Cập nhật banner thành công" : "Tạo banner mới thành công", "success");
        setIsDrawerOpen(false);
        fetchData();
      } else {
        showToast(res.message || "Thao tác thất bại", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await promoBannersApi.toggle(id);
      if (res.success) {
        showToast("Đã thay đổi trạng thái banner", "info");
        fetchData();
      }
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa banner này?')) return;
    try {
      const res = await promoBannersApi.delete(id);
      if (res.success) {
        showToast("Đã xóa banner", "info");
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const set = (key: string, value: string | number | boolean) =>
    setPayload(prev => ({ ...prev, [key]: value }));

  // ─── RENDER ───
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone size={22} className="text-amber-500" />
          <div>
            <h2 className="text-lg font-bold text-white">Promo Banners</h2>
            <p className="text-xs text-neutral-400">Hero banners cho trang Marketplace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors">
            <Plus size={16} /> Thêm Banner
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-neutral-500" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <Megaphone size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Chưa có banner nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-start gap-4 group hover:border-neutral-700 transition-colors">
              {/* Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${b.active ? 'bg-amber-600/20 text-amber-400' : 'bg-neutral-700 text-neutral-500'}`}>
                    {b.tag}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[10px] rounded ${b.active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {b.active ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-[10px] text-neutral-600">#{b.sortOrder}</span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate">
                  {b.heroTitle}<span className="text-amber-400">{b.heroHighlight}</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 truncate">{b.heroDesc}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-600">
                  <LinkIcon size={11} /> {b.link}
                  <span className="mx-1">·</span>
                  <ArrowRight size={11} /> {b.cta}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleToggle(b._id)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" title={b.active ? 'Ẩn' : 'Hiện'}>
                  {togglingId === b._id ? <Loader2 size={15} className="animate-spin" /> : b.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => handleEdit(b)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" title="Sửa">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors" title="Xóa">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ DRAWER ═══════ */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setIsDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Megaphone size={18} className="text-amber-500" />
                  {editingId ? 'Chỉnh sửa Banner' : 'Tạo Banner mới'}
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400">
                  <X size={18} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Tag & Sort */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Tag size={12} /> Tag
                    </label>
                    <input value={payload.tag} onChange={e => set('tag', e.target.value)}
                      placeholder="HOT DEAL, MỚI, FLASH SALE..."
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 block">Sort Order</label>
                    <input type="number" value={payload.sortOrder} onChange={e => set('sortOrder', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:border-amber-600 focus:outline-none" />
                  </div>
                </div>

                {/* Hero Title */}
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Type size={12} /> Hero Title
                  </label>
                  <input value={payload.heroTitle} onChange={e => set('heroTitle', e.target.value)}
                    placeholder="Nâng cấp "
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none" />
                </div>

                {/* Hero Highlight */}
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 block">Hero Highlight (gold text)</label>
                  <input value={payload.heroHighlight} onChange={e => set('heroHighlight', e.target.value)}
                    placeholder="gói Pro giảm 30%"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-amber-400 placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none" />
                </div>

                {/* Hero Desc */}
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlignLeft size={12} /> Hero Description
                  </label>
                  <textarea value={payload.heroDesc} onChange={e => set('heroDesc', e.target.value)}
                    placeholder="Subtitle dưới dòng tiêu đề hero..."
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none resize-none" />
                </div>

                <hr className="border-neutral-800" />

                {/* Promo strip — Title */}
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 block">Promo Title</label>
                  <input value={payload.title} onChange={e => set('title', e.target.value)}
                    placeholder="Giảm 30% gói Pro"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none" />
                </div>

                {/* Promo strip — Desc */}
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 block">Promo Description</label>
                  <input value={payload.desc} onChange={e => set('desc', e.target.value)}
                    placeholder="Mô tả ngắn cho promo strip..."
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none" />
                </div>

                {/* CTA & Link */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 block">CTA Text</label>
                    <input value={payload.cta} onChange={e => set('cta', e.target.value)}
                      placeholder="Xem ngay"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <LinkIcon size={12} /> Link
                    </label>
                    <input value={payload.link} onChange={e => set('link', e.target.value)}
                      placeholder="/pricing"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-amber-600 focus:outline-none" />
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-300">Hiển thị (Active)</span>
                  <button onClick={() => set('active', !payload.active)} className="text-neutral-400 hover:text-white transition-colors">
                    {payload.active ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                {/* Live preview */}
                <div className="mt-2">
                  <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2">Preview</p>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-600 text-white rounded">
                        {payload.tag || 'TAG'}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500 mb-1">Marketplace</p>
                    <h4 className="text-base font-bold text-white leading-tight">
                      {payload.heroTitle || 'Hero title '}<span className="text-amber-400">{payload.heroHighlight || 'highlight'}</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{payload.heroDesc || 'Hero description...'}</p>
                    <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{payload.title || 'Promo title'}</p>
                        <p className="text-[10px] text-neutral-500">{payload.desc || 'Promo desc'}</p>
                      </div>
                      <span className="text-amber-500 text-xs font-semibold flex items-center gap-1">
                        {payload.cta || 'CTA'} <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-neutral-800 flex items-center gap-3">
                <button onClick={() => setIsDrawerOpen(false)} className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-neutral-900 transition-colors">
                  Hủy
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
