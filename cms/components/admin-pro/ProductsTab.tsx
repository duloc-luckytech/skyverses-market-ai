import React, { useState, useEffect } from 'react';
import {
  Package, Lock, Unlock, Loader2, ToggleLeft, ToggleRight,
  Video, Image as ImageIcon, Maximize2, Palette, Film, Wand2
} from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../apis/config';
import { useToast } from '../../context/ToastContext';

interface ProductItem {
  slug: string;
  name: string;
  locked: boolean;
}

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  'video-animate-ai': <Video size={20} />,
  'image-upscale-ai': <Maximize2 size={20} />,
  'image-generator-ai': <Wand2 size={20} />,
  'video-generator-ai': <Film size={20} />,
  'product-image-ai': <Palette size={20} />,
  'image-restoration-ai': <ImageIcon size={20} />,
};

export const ProductsTab: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/product-locks`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (err) {
      console.error('Fetch product locks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleToggle = async (slug: string, currentLocked: boolean) => {
    setTogglingSlug(slug);
    try {
      // Build new locks map
      const newLocks: Record<string, boolean> = {};
      products.forEach(p => {
        newLocks[p.slug] = p.slug === slug ? !currentLocked : p.locked;
      });

      const res = await fetch(`${API_BASE_URL}/config/product-locks`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ locks: newLocks }),
      });
      const data = await res.json();

      if (data.success) {
        setProducts(prev => prev.map(p =>
          p.slug === slug ? { ...p, locked: !currentLocked } : p
        ));
        showToast(
          !currentLocked 
            ? `🔒 Đã khóa "${products.find(p => p.slug === slug)?.name}" — hiển thị "Sắp ra mắt"` 
            : `🔓 Đã mở khóa "${products.find(p => p.slug === slug)?.name}"`,
          'success'
        );
      }
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái sản phẩm', 'error');
    } finally {
      setTogglingSlug(null);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-5xl">
      {/* HEADER */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 border-l-4 border-violet-600 pl-6">
          <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-600">
            <Package size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Quản lý sản phẩm</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Product Lock & Availability Control</p>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-blue" size={24} />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
                {products.map(p => (
                  <tr key={p.slug} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    {/* Product */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          p.locked
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {PRODUCT_ICONS[p.slug] || <Package size={20} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">/product/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-5">
                      <code className="text-[10px] font-mono bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md text-slate-500">{p.slug}</code>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 text-center">
                      {p.locked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          <Lock size={10} /> Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <Unlock size={10} /> Hoạt động
                        </span>
                      )}
                    </td>

                    {/* Toggle */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleToggle(p.slug, p.locked)}
                        disabled={togglingSlug === p.slug}
                        className={`p-2 transition-all rounded-xl hover:scale-110 ${
                          p.locked ? 'text-red-500 hover:bg-red-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                        } disabled:opacity-50`}
                      >
                        {togglingSlug === p.slug ? (
                          <Loader2 size={28} className="animate-spin" />
                        ) : p.locked ? (
                          <ToggleLeft size={36} />
                        ) : (
                          <ToggleRight size={36} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
