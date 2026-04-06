import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Eye, EyeOff, Sparkles, Star, Trash2,
  Edit3, Calendar, Clock, Tag, FileText, Globe, RefreshCw
} from 'lucide-react';
import { blogApi } from '../../apis/blog';
import { useToast } from '../../context/ToastContext';
import { BlogDrawer } from './BlogDrawer';

const CATEGORY_OPTIONS = ['AI Tools', 'Tutorials', 'News', 'Case Studies', 'Tips & Tricks', 'Product Updates'];

export const BlogTab: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await blogApi.getAll();
      if (res?.data) setPosts(res.data);
    } catch (err) {
      console.error('Fetch posts:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = posts.filter(p => {
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
    // Fetch full post with content
    const res = await blogApi.getById(post._id);
    if (res.success && res.data) {
      setEditingPost(res.data);
    } else {
      showToast('Lỗi tải bài viết', 'error');
    }
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.isPublished).length,
    draft: posts.filter(p => !p.isPublished).length,
    featured: posts.filter(p => p.isFeatured).length,
    totalViews: posts.reduce((sum, p) => sum + (p.viewCount || 0), 0),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8 space-y-6">

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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={14} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bài viết..."
            className="w-full bg-white/60 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] pl-9 pr-4 py-2 rounded-xl text-[12px] focus:border-brand-blue outline-none transition-all" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'published', 'draft'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filterStatus === s ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
              {s === 'all' ? 'Tất cả' : s === 'published' ? 'Published' : 'Draft'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={fetchPosts} className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-500 hover:text-brand-blue transition-colors">
            <RefreshCw size={14} />
          </button>
          <button onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-[11px] font-bold hover:brightness-110 transition-all shadow-sm shadow-brand-blue/20">
            <Plus size={13} /> Tạo bài viết
          </button>
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
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bài viết</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh mục</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Views</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post._id} className="border-b border-black/[0.02] dark:border-white/[0.02] hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt="" className="w-12 h-8 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-slate-700 dark:text-white truncate max-w-[250px]">
                            {post.title?.en || 'Untitled'}
                            {post.isFeatured && <Sparkles size={10} className="inline ml-1 text-amber-500" />}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[250px]">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-brand-blue/[0.06] text-brand-blue rounded text-[10px] font-medium">{post.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${post.isPublished
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}>
                        {post.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                        {post.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-[12px] text-slate-500 font-medium">{(post.viewCount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-[11px] text-slate-400">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
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
                  </tr>
                ))}
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
