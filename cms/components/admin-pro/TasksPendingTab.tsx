
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Trash2, Loader2, Cpu, X,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  ChevronLeft, ChevronRight, Image, Video, Scissors,
  Zap, Filter, ArrowUpDown
} from 'lucide-react';
import { tasksApi, TaskItem, TaskStats, TaskListParams } from '../../apis/tasks';
import { useToast } from '../../context/ToastContext';

/* ═══════════════════════════════════════════════════
 *  CONSTANTS
 * ═══════════════════════════════════════════════════ */
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'polling', label: 'Polling' },
  { value: 'done', label: 'Done' },
  { value: 'error', label: 'Error' },
  { value: 'reject', label: 'Reject' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'capcha', label: 'Capcha' },
];

const COLLECTION_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'image', label: 'Image Jobs' },
  { value: 'videoV2', label: 'Video V2' },
  { value: 'video', label: 'Video Legacy' },
  { value: 'editImage', label: 'Edit Image' },
];

const PROVIDER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'fxflow', label: 'FXFlow' },
  { value: 'grok', label: 'Grok' },
  { value: 'gommo', label: 'Gommo' },
  { value: 'wan', label: 'WAN' },
  { value: 'veo', label: 'VEO' },
  { value: 'kling', label: 'Kling' },
  { value: 'fxlab', label: 'FXLab' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'running', label: 'RunningHub' },
  { value: 'stable_diffusion', label: 'Stable Diffusion' },
  { value: 'leonardo', label: 'Leonardo' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
  processing: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
  polling:    { bg: 'bg-indigo-500/10', text: 'text-indigo-500', dot: 'bg-indigo-500' },
  done:       { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  error:      { bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500' },
  reject:     { bg: 'bg-orange-500/10', text: 'text-orange-500', dot: 'bg-orange-500' },
  cancelled:  { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
  capcha:     { bg: 'bg-purple-500/10', text: 'text-purple-500', dot: 'bg-purple-500' },
};

const COLLECTION_ICONS: Record<string, React.ReactNode> = {
  image: <Image size={13} />,
  videoV2: <Video size={13} />,
  video: <Video size={13} />,
  editImage: <Scissors size={13} />,
};

const COLLECTION_LABELS: Record<string, string> = {
  image: 'Image',
  videoV2: 'Video V2',
  video: 'Video',
  editImage: 'Edit',
};

/* ═══════════════════════════════════════════════════
 *  HELPERS
 * ═══════════════════════════════════════════════════ */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function truncate(str: string, max: number): string {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/* ═══════════════════════════════════════════════════
 *  COMPONENT
 * ═══════════════════════════════════════════════════ */
export const TasksPendingTab: React.FC = () => {
  const { showToast } = useToast();

  // Data
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  // Clear modal
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearStatus, setClearStatus] = useState('pending');
  const [clearCollection, setClearCollection] = useState('');
  const [clearing, setClearing] = useState(false);

  // Deleting
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── FETCH ── */
  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: TaskListParams = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (collectionFilter) params.collection = collectionFilter;
      if (providerFilter) params.provider = providerFilter;
      if (search.trim()) params.search = search.trim();

      const res = await tasksApi.getTasks(params);
      if (res.success) {
        setTasks(res.data);
        setPagination(res.pagination);
      }
    } catch (e) {
      showToast('Lỗi tải danh sách tasks', 'error');
    }
    setLoading(false);
  }, [statusFilter, collectionFilter, providerFilter, search]);

  const fetchStats = useCallback(async () => {
    const res = await tasksApi.getStats();
    if (res.success) setStats(res);
  }, []);

  useEffect(() => { fetchTasks(1); fetchStats(); }, [statusFilter, collectionFilter, providerFilter]);

  const handleSearch = () => fetchTasks(1);
  const handleRefresh = () => { fetchTasks(pagination.page); fetchStats(); };

  /* ── DELETE SINGLE ── */
  const handleDeleteTask = async (task: TaskItem) => {
    if (deletingId) return;
    setDeletingId(task._id);
    const res = await tasksApi.deleteTask(task._collection, task._id);
    if (res.success) {
      setTasks(prev => prev.filter(t => t._id !== task._id));
      showToast('Đã xóa task', 'success');
      fetchStats();
    } else {
      showToast(res.message || 'Xóa thất bại', 'error');
    }
    setDeletingId(null);
  };

  /* ── CLEAR BULK ── */
  const handleClear = async () => {
    setClearing(true);
    const res = await tasksApi.clearTasks({ status: clearStatus, collection: clearCollection || undefined });
    if (res.success) {
      showToast(`Đã xóa ${res.totalDeleted} tasks`, 'success');
      setShowClearModal(false);
      fetchTasks(1);
      fetchStats();
    } else {
      showToast('Xóa thất bại', 'error');
    }
    setClearing(false);
  };

  /* ── STATUS BADGE ── */
  const StatusBadge = ({ status }: { status: string }) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.cancelled;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'processing' || status === 'polling' ? 'animate-pulse' : ''}`} />
        {status}
      </span>
    );
  };

  /* ═══════════════════════════════════════════════════
   *  RENDER
   * ═══════════════════════════════════════════════════ */
  return (
    <div className="p-0 flex flex-col h-full animate-in fade-in duration-700 bg-white dark:bg-[#050507]">

      {/* ══════ STATS BAR ══════ */}
      <div className="px-12 py-6 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#08080a] shrink-0">
        <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400 flex-wrap">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-brand-blue" />
            <span>Total: <span className="text-white">{stats?.total ?? '—'}</span></span>
          </div>
          {['pending', 'processing', 'polling', 'done', 'error', 'cancelled'].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[s]?.dot || 'bg-gray-500'} ${s === 'processing' ? 'animate-pulse shadow-[0_0_6px_#3b82f6]' : ''}`} />
              <span>{s}: <span className="text-slate-700 dark:text-gray-200">{stats?.byStatus[s] ?? 0}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ TOOLBAR ══════ */}
      <div className="px-12 py-5 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#08080a] shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative group flex-1 min-w-[200px] max-w-[360px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={16} />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm theo prompt hoặc email..."
              className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[12px] font-bold outline-none focus:border-brand-blue transition-all text-slate-800 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none text-slate-700 dark:text-gray-300 focus:border-brand-blue">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Collection Filter */}
          <select value={collectionFilter} onChange={e => setCollectionFilter(e.target.value)}
            className="bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none text-slate-700 dark:text-gray-300 focus:border-brand-blue">
            {COLLECTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Provider Filter */}
          <select value={providerFilter} onChange={e => setProviderFilter(e.target.value)}
            className="bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none text-slate-700 dark:text-gray-300 focus:border-brand-blue">
            {PROVIDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleRefresh}
              className="p-2.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-brand-blue hover:text-white rounded-xl transition-all border border-black/5 dark:border-white/10"
              title="Refresh">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider">
              <Trash2 size={13} /> Clear Tasks
            </button>
          </div>
        </div>
      </div>

      {/* ══════ DATA TABLE ══════ */}
      <div className="flex-grow overflow-y-auto no-scrollbar">
        <table className="w-full text-left border-collapse font-mono">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 sticky top-0 z-20 backdrop-blur-md">
              <th className="px-6 py-5">Status</th>
              <th className="px-4 py-5">Collection</th>
              <th className="px-4 py-5">Type</th>
              <th className="px-4 py-5">Provider</th>
              <th className="px-4 py-5">User</th>
              <th className="px-4 py-5">Prompt</th>
              <th className="px-4 py-5 text-right">Credits</th>
              <th className="px-4 py-5 text-right">Created</th>
              <th className="px-6 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {loading && tasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-32 text-center">
                  <Loader2 className="animate-spin text-brand-blue mx-auto mb-4" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse italic">LOADING_TASKS...</p>
                </td>
              </tr>
            ) : tasks.length > 0 ? (
              tasks.map(task => (
                <tr key={`${task._collection}-${task._id}`} className="group hover:bg-brand-blue/[0.02] transition-colors">
                  <td className="px-6 py-4"><StatusBadge status={task.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-gray-400">
                      <span className="text-brand-blue">{COLLECTION_ICONS[task._collection]}</span>
                      {COLLECTION_LABELS[task._collection]}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black uppercase italic text-slate-700 dark:text-gray-300 tracking-tight">{task.type}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase text-slate-700 dark:text-gray-300">{task.provider}</p>
                      <p className="text-[8px] text-gray-500 truncate max-w-[100px]">{task.model}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 truncate block max-w-[140px]" title={task.user?.email}>
                      {task.user?.email ? truncate(task.user.email, 20) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate max-w-[200px]" title={task.prompt}>
                      {truncate(task.prompt, 40)}
                    </p>
                    {task.error && (
                      <p className="text-[9px] text-rose-500 truncate max-w-[200px] mt-0.5" title={task.error}>
                        ⚠ {truncate(task.error, 30)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-[11px] font-black text-slate-700 dark:text-gray-300">{task.creditsUsed || 0}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-[10px] font-bold text-gray-400 italic" title={new Date(task.createdAt).toLocaleString('vi-VN')}>
                      {timeAgo(task.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeleteTask(task)}
                      disabled={deletingId === task._id}
                      className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Xóa task">
                      {deletingId === task._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-32 text-center opacity-20 italic">
                  <Cpu size={40} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.4em]">No tasks found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══════ PAGINATION ══════ */}
      {pagination.totalPages > 1 && (
        <div className="px-12 py-4 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#08080a] shrink-0 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400">
            Page {pagination.page} / {pagination.totalPages} — {pagination.total} tasks
          </span>
          <div className="flex items-center gap-2">
            <button disabled={pagination.page <= 1} onClick={() => fetchTasks(pagination.page - 1)}
              className="p-2 rounded-lg border border-black/5 dark:border-white/10 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTasks(pagination.page + 1)}
              className="p-2 rounded-lg border border-black/5 dark:border-white/10 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ══════ CLEAR MODAL ══════ */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowClearModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-500">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white">Clear Tasks</h3>
                    <p className="text-[10px] text-gray-500 font-bold">Xóa hàng loạt theo bộ lọc</p>
                  </div>
                </div>
                <button onClick={() => setShowClearModal(false)} className="p-1.5 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Status to clear</label>
                  <select value={clearStatus} onChange={e => setClearStatus(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-rose-500">
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="error">Error</option>
                    <option value="reject">Reject</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="done">Done</option>
                    <option value="capcha">Capcha</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Collection (optional)</label>
                  <select value={clearCollection} onChange={e => setClearCollection(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-rose-500">
                    <option value="">All collections</option>
                    <option value="image">Image Jobs</option>
                    <option value="videoV2">Video V2</option>
                    <option value="video">Video Legacy</option>
                    <option value="editImage">Edit Image</option>
                  </select>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-rose-400">
                    ⚠️ Hành động này sẽ xóa vĩnh viễn các tasks phù hợp bộ lọc. Không thể hoàn tác.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                <button onClick={() => setShowClearModal(false)}
                  className="px-5 py-2.5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-all">
                  Hủy
                </button>
                <button onClick={handleClear} disabled={clearing}
                  className="px-6 py-2.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2">
                  {clearing && <Loader2 size={12} className="animate-spin" />}
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
