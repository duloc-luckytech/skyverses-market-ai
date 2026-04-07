import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Eye, EyeOff, Sparkles, Star, Trash2,
  Edit3, FileText, Globe, RefreshCw, CheckSquare, Square,
  GripVertical, ArrowUpDown, AlertTriangle, X, Save,
} from 'lucide-react';
import { blogApi } from '../../apis/blog';
import { useToast } from '../../context/ToastContext';
import { BlogDrawer } from './BlogDrawer';

const CATEGORY_OPTIONS = ['AI Tools', 'Tutorials', 'News', 'Case Studies', 'Tips & Tricks', 'Product Updates'];

/* ─── Drag-to-reorder hook ─────────────────────────────────── */
function useDragReorder<T extends { _id: string }>(
  items: T[],
  onReorder: (newItems: T[]) => void,
) {
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragIndex.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverIndex.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragIndex.current === null || dragOverIndex.current === null) return;
    if (dragIndex.current === dragOverIndex.current) {
      dragIndex.current = null;
      dragOverIndex.current = null;
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(dragOverIndex.current, 0, moved);
    dragIndex.current = null;
    dragOverIndex.current = null;
    onReorder(next);
  }, [items, onReorder]);

  return { handleDragStart, handleDragEnter, handleDragEnd };
}

/* ─── Confirm modal ────────────────────────────────────────── */
const ConfirmModal: React.FC<{
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ count, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-800 dark:text-white">Xóa bài viết</p>
          <p className="text-[11px] text-slate-400">Hành động không thể hoàn tác</p>
        </div>
      </div>
      <p className="text-[12px] text-slate-600 dark:text-slate-300 mb-5">
        Bạn sắp xóa <span className="font-bold text-red-500">{count}</span> bài viết được chọn.
        Dữ liệu sẽ bị xóa vĩnh viễn.
      </p>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-500 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all">
          Hủy
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-red-500 text-white hover:bg-red-600 transition-all">
          Xóa {count} bài
        </button>
      </div>
    </motion.div>
  </div>
);

/* ─── Main Component ───────────────────────────────────────── */
export const BlogTab: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  // Reorder
  const [isReordering, setIsReordering] = useState(false);
  const [reorderedPosts, setReorderedPosts] = useState<any[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  /* ── fetch ── */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await blogApi.getAll();
      if (res?.data) {
        const sorted = [...res.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setPosts(sorted);
      }
    } catch (err) {
      console.error('Fetch posts:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  /* ── filter ── */
  const displayPosts = isReordering ? reorderedPosts : posts;
  const filteredPosts = displayPosts.filter(p => {
    if (isReordering) return true; // show all when reordering
    const matchSearch = !search ||
      p.title?.en?.toLowerCase().includes(search.toLowerCase()) ||
      p.title?.vi?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && p.isPublished) ||
      (filterStatus === 'draft' && !p.isPublished);
    return matchSearch && matchStatus;
  });

  /* ── stats ── */
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.isPublished).length,
    draft: posts.filter(p => !p.isPublished).length,
    featured: posts.filter(p => p.isFeatured).length,
    totalViews: posts.reduce((sum, p) => sum + (p.viewCount || 0), 0),
  };

  /* ── selection helpers ── */
  const allSelected = filteredPosts.length > 0 && filteredPosts.every(p => selected.has(p._id));
  const someSelected = selected.size > 0;

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredPosts.map(p => p._id)));
    }
  };

  /* ── actions ── */
  const handleTogglePublish = async (post: any) => {
    const newStatus = !post.isPublished;
    const res = await blogApi.togglePublish(post._id, newStatus);
    if (res.success) {
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, isPublished: newStatus } : p));
      showToast(`${post.title.en} → ${newStatus ? 'Published' : 'Draft'}`, 'success');
    } else {
      showToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  const handleToggleFeatured = async (post: any) => {
    const newVal = !post.isFeatured;
    // Optimistic update
    setPosts(prev => prev.map(p => p._id === post._id ? { ...p, isFeatured: newVal } : p));
    const res = await blogApi.toggleFeatured(post._id, newVal);
    if (!res.success) {
      // Revert
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, isFeatured: !newVal } : p));
      showToast('Lỗi cập nhật featured', 'error');
    } else {
      showToast(newVal ? '⭐ Đã đặt làm nổi bật' : 'Đã bỏ nổi bật', 'success');
    }
  };

  const handleDelete = async (post: any) => {
    if (!confirm(`Xóa bài viết "${post.title.en}"?`)) return;
    const res = await blogApi.delete(post._id);
    if (res.success) {
      setPosts(prev => prev.filter(p => p._id !== post._id));
      showToast('Đã xóa bài viết', 'success');
    } else {
      showToast('Lỗi xóa bài viết', 'error');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    const res = await blogApi.bulkDelete(ids);
    if (res.success) {
      setPosts(prev => prev.filter(p => !selected.has(p._id)));
      showToast(`Đã xóa ${res.deleted ?? ids.length} bài viết`, 'success');
      setSelected(new Set());
    } else {
      showToast('Lỗi xóa hàng loạt', 'error');
    }
    setShowConfirm(false);
  };

  /* ── reorder ── */
  const startReorder = () => {
    setReorderedPosts([...posts]);
    setIsReordering(true);
    setSelected(new Set());
  };

  const cancelReorder = () => {
    setIsReordering(false);
    setReorderedPosts([]);
  };

  const saveReorder = async () => {
    setSavingOrder(true);
    const orders = reorderedPosts.map((p, i) => ({ id: p._id, order: i }));
    const res = await blogApi.reorder(orders);
    if (res.success) {
      setPosts(reorderedPosts.map((p, i) => ({ ...p, order: i })));
      showToast('Đã lưu thứ tự bài viết ✓', 'success');
      setIsReordering(false);
      setReorderedPosts([]);
    } else {
      showToast('Lỗi lưu thứ tự', 'error');
    }
    setSavingOrder(false);
  };

  const { handleDragStart, handleDragEnter, handleDragEnd } = useDragReorder(
    reorderedPosts,
    (next) => setReorderedPosts(next),
  );

  /* ── create / edit / save ── */
  const handleSave = async (data: any) => {
    let res;
    if (isCreating) {
      res = await blogApi.create(data);
    } else {
      res = await blogApi.update(data._id, data);
    }
    if (res.success) {
      showToast(isCreating ? 'Đã tạo bài viết mới' : 'Đã cập nhật bài viết', 'success');
      await fetchPosts();
      setEditingPost(null);
      setIsCreating(false);
    } else {
      showToast('Lỗi lưu bài viết', 'error');
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingPost({
      slug: '',
      title: { en: '', vi: '', ko: '', ja: '' },
      excerpt: { en: '', vi: '', ko: '', ja: '' },
      content: { en: '', vi: '', ko: '', ja: '' },
      coverImage: '',
      category: 'AI Tools',
      tags: [],
      author: { name: 'Skyverses Team', avatar: '', role: 'Editor' },
      seo: {
        metaTitle: { en: '', vi: '', ko: '', ja: '' },
        metaDescription: { en: '', vi: '', ko: '', ja: '' },
        ogImage: '',
        keywords: [],
      },
      isPublished: false,
      isFeatured: false,
      readTime: 5,
      order: 0,
      relatedSlugs: [],
    });
  };

  const handleEdit = async (post: any) => {
    setIsCreating(false);
    const res = await blogApi.getById(post._id);
    if (res.success && res.data) {
      setEditingPost(res.data);
    } else {
      showToast('Lỗi tải bài viết', 'error');
    }
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8 space-y-6">

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmModal
            count={selected.size}
            onConfirm={handleBulkDelete}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Tổng bài viết', value: stats.total, icon: FileText, color: 'text-brand-blue' },
          { label: 'Đã xuất bản', value: stats.published, icon: Globe, color: 'text-emerald-500' },
          { label: 'Bản nháp', value: stats.draft, icon: EyeOff, color: 'text-orange-500' },
          { label: 'Nổi bật', value: stats.featured, icon: Sparkles, color: 'text-amber-500' },
          { label: 'Tổng lượt xem', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white/60 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className={s.color} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        {/* Search */}
        {!isReordering && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={14} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bài viết..."
              className="w-full bg-white/60 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] pl-9 pr-4 py-2 rounded-xl text-[12px] focus:border-brand-blue outline-none transition-all" />
          </div>
        )}

        {/* Status filter */}
        {!isReordering && (
          <div className="flex gap-1.5">
            {(['all', 'published', 'draft'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filterStatus === s ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
                {s === 'all' ? 'Tất cả' : s === 'published' ? 'Published' : 'Draft'}
              </button>
            ))}
          </div>
        )}

        {/* Right actions */}
        <div className="flex gap-2 ml-auto items-center flex-wrap">
          {/* Bulk action bar */}
          <AnimatePresence>
            {someSelected && !isReordering && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
              >
                <span className="text-[11px] font-bold text-red-600">
                  {selected.size} đã chọn
                </span>
                <button onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-all">
                  <Trash2 size={10} /> Xóa hàng loạt
                </button>
                <button onClick={() => setSelected(new Set())}
                  className="p-1 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reorder mode controls */}
          {isReordering ? (
            <>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <GripVertical size={12} /> Kéo để sắp xếp
              </span>
              <button onClick={cancelReorder}
                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-500 hover:bg-slate-200 transition-all">
                Hủy
              </button>
              <button onClick={saveReorder} disabled={savingOrder}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-60">
                <Save size={11} /> {savingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
              </button>
            </>
          ) : (
            <button onClick={startReorder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-200 dark:hover:border-amber-500/20">
              <ArrowUpDown size={12} /> Sắp xếp
            </button>
          )}

          {!isReordering && (
            <>
              <button onClick={fetchPosts} className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-500 hover:text-brand-blue transition-colors">
                <RefreshCw size={14} />
              </button>
              <button onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-[11px] font-bold hover:brightness-110 transition-all shadow-sm shadow-brand-blue/20">
                <Plus size={13} /> Tạo bài viết
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-[13px]">Đang tải...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={32} className="mx-auto text-slate-300 dark:text-gray-600 mb-3" />
            <p className="text-[13px] text-slate-400">Chưa có bài viết nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                  {/* Checkbox all */}
                  {!isReordering && (
                    <th className="pl-4 py-3 w-8">
                      <button onClick={toggleAll} className="text-slate-400 hover:text-brand-blue transition-colors">
                        {allSelected
                          ? <CheckSquare size={14} className="text-brand-blue" />
                          : <Square size={14} />
                        }
                      </button>
                    </th>
                  )}
                  {isReordering && <th className="pl-4 py-3 w-8" />}
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bài viết</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh mục</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nổi bật</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Views</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày</th>
                  {!isReordering && (
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hành động</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, index) => {
                  const isSelected = selected.has(post._id);
                  return (
                    <tr
                      key={post._id}
                      draggable={isReordering}
                      onDragStart={isReordering ? () => handleDragStart(index) : undefined}
                      onDragEnter={isReordering ? () => handleDragEnter(index) : undefined}
                      onDragEnd={isReordering ? handleDragEnd : undefined}
                      onDragOver={isReordering ? (e) => e.preventDefault() : undefined}
                      className={`border-b border-black/[0.02] dark:border-white/[0.02] transition-colors
                        ${isReordering ? 'cursor-grab active:cursor-grabbing hover:bg-amber-50/50 dark:hover:bg-amber-500/5' : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.01]'}
                        ${isSelected ? 'bg-brand-blue/[0.02] dark:bg-brand-blue/[0.04]' : ''}
                      `}
                    >
                      {/* Checkbox / Drag handle */}
                      {!isReordering ? (
                        <td className="pl-4 py-3 w-8">
                          <button onClick={() => toggleSelect(post._id)} className="text-slate-300 hover:text-brand-blue transition-colors">
                            {isSelected
                              ? <CheckSquare size={14} className="text-brand-blue" />
                              : <Square size={14} />
                            }
                          </button>
                        </td>
                      ) : (
                        <td className="pl-4 py-3 w-8">
                          <GripVertical size={14} className="text-slate-300 dark:text-gray-600" />
                        </td>
                      )}

                      {/* Post info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {post.coverImage ? (
                            <img src={post.coverImage} alt="" className="w-12 h-8 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-slate-700 dark:text-white truncate max-w-[240px]">
                              {post.title?.en || 'Untitled'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[240px]">/{post.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-brand-blue/[0.06] text-brand-blue rounded text-[10px] font-medium">
                          {post.category}
                        </span>
                      </td>

                      {/* Featured star — quick toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => !isReordering && handleToggleFeatured(post)}
                          disabled={isReordering}
                          title={post.isFeatured ? 'Bỏ nổi bật' : 'Đặt làm nổi bật'}
                          className={`group inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all
                            ${post.isFeatured
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                              : 'text-slate-300 dark:text-gray-600 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                            }
                            ${isReordering ? 'opacity-40 cursor-default' : 'cursor-pointer'}
                          `}
                        >
                          <Star size={13} className={post.isFeatured ? 'fill-amber-500' : 'group-hover:fill-amber-300'} />
                        </button>
                      </td>

                      {/* Publish toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => !isReordering && handleTogglePublish(post)}
                          disabled={isReordering}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all
                            ${isReordering ? 'opacity-40 cursor-default' : ''}
                            ${post.isPublished
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500/20'
                            }`}
                        >
                          {post.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                          {post.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3 text-center text-[12px] text-slate-500 font-medium">
                        {(post.viewCount || 0).toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-center text-[11px] text-slate-400">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Actions */}
                      {!isReordering && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => handleEdit(post)} title="Sửa"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/[0.06] transition-all">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDelete(post)} title="Xóa"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {editingPost && (
        <BlogDrawer
          post={editingPost}
          isNew={isCreating}
          onClose={() => { setEditingPost(null); setIsCreating(false); }}
          onSave={handleSave}
          categories={CATEGORY_OPTIONS}
        />
      )}
    </motion.div>
  );
};
