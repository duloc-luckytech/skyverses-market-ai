import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Search, Loader2, RefreshCw, Eye, MessageSquare, Check, X,
  Clock, Package, User, Mail, Globe, Cpu, Tag, Image, ExternalLink,
  ChevronDown, ChevronUp, Sparkles, Trash2, Send, AlertCircle,
  CheckCircle, XCircle, Rocket
} from 'lucide-react';
import { productSubmissionApi, ProductSubmissionItem, SubmissionStats } from '../../apis/product-submission';
import { useToast } from '../../context/ToastContext';

// ═══ STATUS CONFIG ═══
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending: { label: 'Chờ duyệt', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock size={10} /> },
  reviewing: { label: 'Đang xem xét', color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', icon: <Eye size={10} /> },
  approved: { label: 'Đã duyệt', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle size={10} /> },
  rejected: { label: 'Từ chối', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <XCircle size={10} /> },
  published: { label: 'Đã xuất bản', color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: <Rocket size={10} /> },
};

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'reviewing', label: 'Đang xem' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Từ chối' },
  { key: 'published', label: 'Đã xuất bản' },
];

// ═══ REVIEW DRAWER ═══
const ReviewDrawer: React.FC<{
  item: ProductSubmissionItem;
  onClose: () => void;
  onReview: (id: string, status: string, feedback: string) => Promise<void>;
}> = ({ item, onClose, onReview }) => {
  const [feedback, setFeedback] = useState(item.adminFeedback || '');
  const [selectedStatus, setSelectedStatus] = useState(item.status);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onReview(item._id, selectedStatus, feedback);
    setIsSaving(false);
    onClose();
  };

  const statusActions = [
    { status: 'reviewing', label: 'Đang xem xét', color: 'bg-brand-blue' },
    { status: 'approved', label: 'Duyệt', color: 'bg-emerald-500' },
    { status: 'rejected', label: 'Từ chối', color: 'bg-rose-500' },
    { status: 'published', label: 'Xuất bản', color: 'bg-violet-500' },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[700]" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-[640px] bg-white dark:bg-[#0a0a0e] border-l border-black/[0.06] dark:border-white/[0.06] z-[701] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Submission</h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-500">{item.productName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Thumbnail */}
          {item.thumbnailUrl && (
            <div className="rounded-xl overflow-hidden border border-black/[0.04] dark:border-white/[0.04] h-[160px]">
              <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Thông tin sản phẩm</h4>
            <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl p-4 space-y-2.5">
              {[
                { label: 'Tên', value: item.productName },
                { label: 'Slug', value: item.productSlug },
                { label: 'Danh mục', value: item.category },
                { label: 'Cấp độ', value: item.complexity },
                { label: 'Demo Type', value: item.demoType },
                { label: 'Giá', value: item.isFree ? 'FREE' : `${item.priceCredits} Credits` },
                { label: 'Platforms', value: item.platforms?.join(', ') || '—' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-black/[0.02] dark:border-white/[0.02] last:border-0">
                  <span className="text-[11px] text-slate-400">{row.label}</span>
                  <span className="text-[12px] font-bold text-slate-700 dark:text-gray-300">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Mô tả</h4>
            <p className="text-[12px] text-slate-600 dark:text-gray-400 leading-relaxed bg-slate-50/50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl p-4">
              {item.shortDescription}
            </p>
            {item.fullDescription && (
              <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed mt-2">{item.fullDescription}</p>
            )}
          </div>

          {/* Features */}
          {item.features?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Tính năng ({item.features.length})</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-blue/[0.06] text-brand-blue rounded-lg text-[10px] font-medium border border-brand-blue/10">
                    <Check size={8} /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags + AI Models */}
          <div className="grid grid-cols-2 gap-4">
            {item.tags?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 text-[9px] font-medium rounded">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {item.aiModels?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Models</h4>
                <div className="flex flex-wrap gap-1">
                  {item.aiModels.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[9px] font-medium rounded">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Thông tin Creator</h4>
            <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl p-4 space-y-2.5">
              {[
                { icon: <User size={11} />, label: 'Tên', value: item.creatorName },
                { icon: <Mail size={11} />, label: 'Email', value: item.creatorEmail },
                { icon: <Package size={11} />, label: 'Studio', value: item.creatorStudio || '—' },
                { icon: <Globe size={11} />, label: 'Website', value: item.creatorWebsite || '—' },
                { icon: <Send size={11} />, label: 'Telegram', value: item.creatorTelegram || '—' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-black/[0.02] dark:border-white/[0.02] last:border-0">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400">{row.icon} {row.label}</span>
                  <span className="text-[12px] font-bold text-slate-700 dark:text-gray-300 truncate max-w-[200px]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {item.additionalNotes && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ghi chú thêm</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed italic">{item.additionalNotes}</p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {item.demoUrl && (
              <a href={item.demoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/[0.06] text-brand-blue border border-brand-blue/10 rounded-lg text-[10px] font-bold hover:bg-brand-blue/[0.1] transition-colors">
                <ExternalLink size={10} /> Demo URL
              </a>
            )}
            {item.apiEndpoint && (
              <a href={item.apiEndpoint} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/[0.06] text-purple-500 border border-purple-500/10 rounded-lg text-[10px] font-bold hover:bg-purple-500/[0.1] transition-colors">
                <Cpu size={10} /> API Endpoint
              </a>
            )}
            {item.documentation && (
              <a href={item.documentation} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/[0.06] text-emerald-500 border border-emerald-500/10 rounded-lg text-[10px] font-bold hover:bg-emerald-500/[0.1] transition-colors">
                <ExternalLink size={10} /> Tài liệu
              </a>
            )}
          </div>

          {/* ═══ ADMIN REVIEW SECTION ═══ */}
          <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-6 space-y-4">
            <h4 className="text-[10px] font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={12} /> Admin Review
            </h4>

            {/* Status Actions */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400">Cập nhật trạng thái</label>
              <div className="flex flex-wrap gap-2">
                {statusActions.map(action => (
                  <button
                    key={action.status}
                    onClick={() => setSelectedStatus(action.status as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold border transition-all ${
                      selectedStatus === action.status
                        ? `${action.color} text-white border-transparent shadow-md`
                        : 'bg-white dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] text-slate-500 dark:text-gray-400 hover:border-brand-blue/30'
                    }`}
                  >
                    {STATUS_CONFIG[action.status]?.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400">Phản hồi cho Creator</label>
              <textarea
                rows={4}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white resize-none placeholder:text-slate-300 dark:placeholder:text-gray-600"
                placeholder="VD: Sản phẩm rất tốt! Vui lòng bổ sung thêm screenshot gallery..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0 bg-white dark:bg-[#0a0a0e]">
          <p className="text-[10px] text-slate-300 dark:text-gray-600">
            Submitted {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-brand-blue/20"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Lưu Review
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ═══ MAIN TAB ═══
export const SubmissionsTab: React.FC = () => {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState<ProductSubmissionItem[]>([]);
  const [stats, setStats] = useState<SubmissionStats>({ total: 0, pending: 0, reviewing: 0, approved: 0, rejected: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ProductSubmissionItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await productSubmissionApi.getAll({ status: statusFilter, q: search || undefined });
    if (res.success) {
      setSubmissions(res.data);
      setStats(res.stats);
    }
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReview = async (id: string, status: string, adminFeedback: string) => {
    const res = await productSubmissionApi.review(id, { status, adminFeedback });
    if (res.success) {
      showToast(`✅ Đã cập nhật trạng thái thành "${STATUS_CONFIG[status]?.label}"`, 'success');
      fetchData();
    } else {
      showToast('❌ Lỗi cập nhật review', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa submission này?')) return;
    setDeletingId(id);
    const res = await productSubmissionApi.delete(id);
    if (res.success) {
      showToast('🗑️ Đã xóa submission', 'success');
      fetchData();
    }
    setDeletingId(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours}h trước`;
    return `${Math.floor(hours / 24)}d trước`;
  };

  return (
    <div className="p-8 lg:p-12 space-y-8 animate-in fade-in duration-700 max-w-6xl">
      {/* ═══ HEADER ═══ */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 border-l-4 border-brand-blue pl-6">
          <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
            <Inbox size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Product Submissions</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Review & Approve Pipeline</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'total', label: 'Tổng', value: stats.total, color: 'text-slate-700 dark:text-white', bg: 'bg-slate-100 dark:bg-white/5' },
            { key: 'pending', label: 'Chờ duyệt', value: stats.pending, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { key: 'reviewing', label: 'Đang xem', value: stats.reviewing, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
            { key: 'approved', label: 'Đã duyệt', value: stats.approved, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { key: 'rejected', label: 'Từ chối', value: stats.rejected, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { key: 'published', label: 'Xuất bản', value: stats.published, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          ].map(stat => (
            <div key={stat.key} className={`${stat.bg} rounded-xl p-3.5 text-center border border-black/[0.04] dark:border-white/[0.04]`}>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  statusFilter === tab.key
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && stats[tab.key as keyof SubmissionStats] > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                    statusFilter === tab.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5'
                  }`}>
                    {stats[tab.key as keyof SubmissionStats]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={14} />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-4 py-2.5 rounded-xl text-[12px] w-[200px] focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600"
              />
            </div>
            <button onClick={fetchData} className="p-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-slate-400 hover:text-brand-blue transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ TABLE ═══ */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue" size={24} />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Inbox size={40} className="mx-auto text-slate-200 dark:text-gray-700" />
          <p className="text-sm text-slate-400 dark:text-gray-500">Chưa có submission nào</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-4 py-4">Creator</th>
                <th className="px-4 py-4">Danh mục</th>
                <th className="px-4 py-4 text-center">Trạng thái</th>
                <th className="px-4 py-4">Thời gian</th>
                <th className="px-4 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
              {submissions.map(item => {
                const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={item._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-black/[0.04] dark:border-white/[0.04]" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.shortDescription}</p>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="px-4 py-4">
                      <p className="text-[12px] font-bold text-slate-700 dark:text-gray-300">{item.creatorName}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.creatorEmail}</p>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-brand-blue/[0.06] text-brand-blue rounded text-[9px] font-medium border border-brand-blue/10">
                        {item.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase rounded-full ${sc.bg} ${sc.color} border ${sc.border}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-4">
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">{getTimeAgo(item.createdAt)}</p>
                      <p className="text-[9px] text-slate-300 dark:text-gray-600">{formatDate(item.createdAt)}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-all"
                          title="Review"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                          title="Xóa"
                        >
                          {deletingId === item._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ REVIEW DRAWER ═══ */}
      <AnimatePresence>
        {selectedItem && (
          <ReviewDrawer
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onReview={handleReview}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
