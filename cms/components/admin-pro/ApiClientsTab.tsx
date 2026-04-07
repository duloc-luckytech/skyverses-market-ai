
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, Key, Copy, RefreshCw, Loader2, Check, X,
  Shield, Zap, Activity, Eye, EyeOff, Trash2, RotateCcw,
  Terminal, Code, ChevronLeft, ChevronRight, Sparkles,
  UserPlus, Link2, AlertTriangle, Globe, Clipboard, Clock,
  Timer, Calendar, Pencil
} from 'lucide-react';
import { apiClientApi, ApiClient, ApiClientStats } from '../../apis/api-client';
import { useToast } from '../../context/ToastContext';

/* ─── STAT CARD ─── */
const StatCard = ({ label, value, sub, color, icon, loading }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode; loading?: boolean }) => (
  <div className="bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-4 hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-md transition-all">
    <div className="flex items-center gap-2.5 mb-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400">{label}</p>
    </div>
    {loading ? <div className="h-6 w-16 bg-slate-100 dark:bg-white/5 animate-pulse rounded" /> : <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">{value}</p>}
    <p className="text-[9px] text-slate-400 mt-1 border-t border-black/[0.04] dark:border-white/[0.04] pt-2">{sub}</p>
  </div>
);

/* ─── MAIN COMPONENT ─── */
export const ApiClientsTab: React.FC = () => {
  const { showToast } = useToast();

  // Data
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [stats, setStats] = useState<ApiClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    plan: '',
    creditBalance: 0,
    generateToken: true,
    tokenExpiresIn: 30, // days, 0 = never
  });

  // Token reveal
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [generatingTokenId, setGeneratingTokenId] = useState<string | null>(null);

  // Edit expiry inline
  const [editingExpiryId, setEditingExpiryId] = useState<string | null>(null);
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [customExpiryDays, setCustomExpiryDays] = useState('');
  const expiryPopoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (expiryPopoverRef.current && !expiryPopoverRef.current.contains(e.target as Node)) {
        setEditingExpiryId(null);
        setCustomExpiryDays('');
      }
    };
    if (editingExpiryId) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingExpiryId]);

  // API Docs modal
  const [showApiDocs, setShowApiDocs] = useState(false);

  /* ── Fetch ── */
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClientApi.getList({ page, pageSize, search: search.trim() || undefined });
      if (res.success) {
        setClients(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, pageSize, search]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await apiClientApi.getStats();
      if (res.success) setStats(res);
    } catch (e) { console.error(e); }
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchClients(); fetchStats(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchClients();
  };

  /* ── Create Customer ── */
  const handleCreateCustomer = async () => {
    if (!formData.email) {
      showToast('Email là bắt buộc', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiClientApi.createCustomer(formData);
      if (res.success) {
        showToast('Tạo khách hàng thành công!', 'success');
        if (res.data?.apiToken) {
          setRevealedToken(res.data.apiToken);
        }
        setIsDrawerOpen(false);
        setFormData({ email: '', name: '', plan: '', creditBalance: 0, generateToken: true, tokenExpiresIn: 30 });
        fetchClients();
        fetchStats();
      } else {
        showToast(res.message || 'Tạo thất bại', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối', 'error');
    }
    setIsSaving(false);
  };

  /* ── Generate Token ── */
  const handleGenerateToken = async (userId: string, expiresIn?: number) => {
    setGeneratingTokenId(userId);
    try {
      const res = await apiClientApi.generateToken(userId, expiresIn || 30);
      if (res.success) {
        setRevealedToken(res.data.apiToken);
        showToast('Token đã được tạo thành công!', 'success');
        fetchClients();
      } else {
        showToast(res.message || 'Tạo token thất bại', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối', 'error');
    }
    setGeneratingTokenId(null);
  };

  /* ── Revoke Token ── */
  const handleRevokeToken = async (userId: string) => {
    if (!confirm('⚠️ Bạn có chắc muốn thu hồi token? User sẽ không thể gọi API nữa.')) return;
    try {
      const res = await apiClientApi.revokeToken(userId);
      if (res.success) {
        showToast('Token đã bị thu hồi', 'success');
        fetchClients();
        fetchStats();
      } else {
        showToast(res.message || 'Thu hồi thất bại', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối', 'error');
    }
  };

  /* ── Copy ── */
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}`, 'success');
  };

  /* ── Update Token Expiry ── */
  const handleUpdateExpiry = async (userId: string, days: number | null) => {
    setExpiryLoading(true);
    try {
      const res = await apiClientApi.updateTokenExpiry(userId, days);
      if (res.success) {
        showToast(days ? `Token hết hạn sau ${days} ngày` : 'Token đặt thành vĩnh viễn ∞', 'success');
        // Optimistic update in local state
        setClients(prev => prev.map(c => c._id === userId
          ? { ...c, apiTokenExpiresAt: res.data?.apiTokenExpiresAt || undefined, tokenExpired: false }
          : c
        ));
        setEditingExpiryId(null);
        setCustomExpiryDays('');
      } else {
        showToast(res.message || 'Cập nhật thất bại', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối', 'error');
    }
    setExpiryLoading(false);
  };

  const relativeTime = (d?: string) => {
    if (!d) return '—';
    const ms = Date.now() - new Date(d).getTime();
    if (ms < 60000) return 'Vừa xong';
    if (ms < 3600000) return `${Math.floor(ms / 60000)}p trước`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}h trước`;
    return new Date(d).toLocaleDateString('vi-VN');
  };

  const formatTokenExpiry = (expiresAt?: string, expired?: boolean) => {
    if (!expiresAt) return { label: 'Vĩnh viễn', color: 'text-slate-400', badge: 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10' };
    if (expired) return { label: 'Hết hạn', color: 'text-red-500', badge: 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' };
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return { label: 'Hết hạn', color: 'text-red-500', badge: 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' };
    if (days <= 3) return { label: `${days}d`, color: 'text-orange-500', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
    if (days <= 7) return { label: `${days}d`, color: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    return { label: `${days}d`, color: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key size={18} className="text-brand-blue" />
            API Clients
          </h2>
          <p className="text-xs text-slate-400">Quản lý khách hàng API & Bearer Token</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowApiDocs(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-500 hover:text-brand-blue transition-all"
          >
            <Code size={12} /> API Docs
          </button>
          <button
            onClick={() => { fetchClients(); fetchStats(); }}
            className="flex items-center gap-1.5 px-3 py-2 border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-500 hover:text-brand-blue transition-all"
          >
            <RefreshCw size={12} /> Làm mới
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-[11px] font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand-blue/20"
          >
            <UserPlus size={13} /> Thêm khách hàng
          </button>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tổng khách hàng" value={stats?.totalClients?.toLocaleString() || '0'} sub="Tất cả tài khoản" color="bg-brand-blue/10 text-brand-blue" icon={<Users size={15} />} loading={statsLoading} />
        <StatCard label="Token Active" value={stats?.activeTokens?.toLocaleString() || '0'} sub="Token đang hoạt động" color="bg-emerald-500/10 text-emerald-500" icon={<Key size={15} />} loading={statsLoading} />
        <StatCard label="Pending Tasks" value={stats?.pendingTasks?.toLocaleString() || '0'} sub="Tác vụ chờ xử lý" color="bg-amber-500/10 text-amber-500" icon={<Activity size={15} />} loading={statsLoading} />
        <StatCard label="Total Tasks" value={stats?.totalTasks?.toLocaleString() || '0'} sub="Tổng tác vụ đã tạo" color="bg-purple-500/10 text-purple-500" icon={<Zap size={15} />} loading={statsLoading} />
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 bg-white dark:bg-white/[0.02] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
        <form onSubmit={handleSearch} className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={13} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm email, tên..."
            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-brand-blue/40 outline-none transition-all"
          />
        </form>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium">{total} khách • Trang {page}/{totalPages || 1}</span>
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Credits</th>
                <th className="px-3 py-3">Plan</th>
                <th className="px-3 py-3">API Token</th>
                <th className="px-3 py-3">Hết hạn</th>
                <th className="px-3 py-3">Hoạt động</th>
                <th className="px-3 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
              {loading ? (
                <tr><td colSpan={9} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-blue mb-2" size={24} /><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang tải...</p></td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={9} className="py-20 text-center"><Users size={36} className="mx-auto mb-2 text-slate-200 dark:text-gray-700" /><p className="text-sm font-bold text-slate-400">Chưa có khách hàng nào</p></td></tr>
              ) : clients.map(c => (
                <tr key={c._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={c.avatar || `https://ui-avatars.com/api/?name=${c.name || c.email}&background=0090ff&color=fff&size=40`} className="w-8 h-8 rounded-lg border border-black/[0.04] dark:border-white/[0.06]" alt="" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{c.name || 'No name'}</p>
                        <p className="text-[9px] text-slate-400 truncate max-w-[140px]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-3 py-3">
                    <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${
                      c.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      c.role === 'master' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                    }`}>{c.role}</span>
                  </td>
                  {/* Credits */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Sparkles size={11} className="text-brand-blue" fill="currentColor" />
                      <span className="text-sm font-black text-brand-blue tabular-nums">{(c.creditBalance || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  {/* Plan */}
                  <td className="px-3 py-3">
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-md border ${
                      c.plan ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                    }`}>{c.plan || 'Free'}</span>
                  </td>
                  {/* API Token */}
                  <td className="px-3 py-3">
                    {c.hasToken ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">{c.apiToken}</span>
                        <button onClick={() => handleCopy(c.apiTokenFull || c.apiToken || '', 'Token')} className="p-1 hover:bg-brand-blue/10 hover:text-brand-blue rounded transition-all" title="Copy full token">
                          <Copy size={10} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-300 dark:text-gray-700 italic">Chưa có token</span>
                    )}
                  </td>
                  {/* Token Expiry — Inline editable */}
                  <td className="px-3 py-3">
                    {c.hasToken ? (() => {
                      const exp = formatTokenExpiry(c.apiTokenExpiresAt, c.tokenExpired);
                      const isEditingThis = editingExpiryId === c._id;
                      return (
                        <div className="relative">
                          {/* Badge — click to open popover */}
                          <button
                            onClick={() => {
                              setEditingExpiryId(isEditingThis ? null : c._id);
                              setCustomExpiryDays('');
                            }}
                            className={`group flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase rounded border transition-all hover:ring-1 hover:ring-brand-blue/30 ${exp.badge}`}
                            title="Click để chỉnh thời hạn"
                          >
                            {exp.label}
                            <Pencil size={7} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                          </button>
                          {c.apiTokenExpiresAt && (
                            <p className="text-[8px] text-slate-400 mt-0.5">{new Date(c.apiTokenExpiresAt).toLocaleDateString('vi-VN')}</p>
                          )}

                          {/* Inline Popover */}
                          <AnimatePresence>
                            {isEditingThis && (
                              <motion.div
                                ref={expiryPopoverRef}
                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 top-full mt-1.5 z-[500] w-52 bg-white dark:bg-[#111114] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl p-3 space-y-2"
                              >
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                  <Timer size={9} /> Thời hạn token
                                </p>

                                {/* Preset buttons */}
                                <div className="grid grid-cols-3 gap-1">
                                  {[7, 30, 90, 180, 365, 0].map(days => (
                                    <button
                                      key={days}
                                      disabled={expiryLoading}
                                      onClick={() => handleUpdateExpiry(c._id, days || null)}
                                      className="py-1.5 rounded-lg text-[9px] font-bold border border-black/[0.06] dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-gray-400 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all disabled:opacity-40"
                                    >
                                      {days === 0 ? '∞' : `${days}d`}
                                    </button>
                                  ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-black/[0.04] dark:border-white/[0.04]" />

                                {/* Custom days input */}
                                <div className="flex gap-1.5 items-center">
                                  <input
                                    type="number"
                                    min="1"
                                    max="3650"
                                    value={customExpiryDays}
                                    onChange={e => setCustomExpiryDays(e.target.value)}
                                    placeholder="Tùy chỉnh (ngày)"
                                    className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-2 py-1.5 text-[9px] font-bold text-slate-700 dark:text-white outline-none focus:border-brand-blue/40 min-w-0"
                                  />
                                  <button
                                    disabled={!customExpiryDays || expiryLoading}
                                    onClick={() => handleUpdateExpiry(c._id, parseInt(customExpiryDays))}
                                    className="px-2 py-1.5 bg-brand-blue text-white rounded-lg text-[9px] font-bold disabled:opacity-40 hover:brightness-110 transition-all shrink-0"
                                  >
                                    {expiryLoading ? <Loader2 size={9} className="animate-spin" /> : <Check size={9} />}
                                  </button>
                                </div>

                                <p className="text-[8px] text-slate-400">0 ngày hoặc ∞ = không bao giờ hết hạn</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })() : <span className="text-[9px] text-slate-300">—</span>}
                  </td>
                  {/* Last Active */}
                  <td className="px-3 py-3">
                    <p className="text-[10px] text-slate-500">{relativeTime(c.lastActiveAt)}</p>
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {c.hasToken ? (
                        <>
                          <button
                            onClick={() => handleGenerateToken(c._id)}
                            disabled={generatingTokenId === c._id}
                            className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[8px] font-bold hover:bg-amber-500/20 transition-all disabled:opacity-50"
                            title="Tái tạo token"
                          >
                            {generatingTokenId === c._id ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                          </button>
                          <button
                            onClick={() => handleRevokeToken(c._id)}
                            className="px-2 py-1 bg-red-500/10 text-red-500 rounded-lg text-[8px] font-bold hover:bg-red-500/20 transition-all"
                            title="Thu hồi token"
                          >
                            <Trash2 size={10} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleGenerateToken(c._id)}
                          disabled={generatingTokenId === c._id}
                          className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg text-[9px] font-bold hover:bg-brand-blue hover:text-white transition-all disabled:opacity-50"
                          title="Tạo token"
                        >
                          {generatingTokenId === c._id ? <Loader2 size={10} className="animate-spin" /> : <><Key size={10} className="inline mr-1" />Tạo Token</>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between bg-slate-50/30 dark:bg-white/[0.005]">
            <p className="text-[10px] font-bold text-slate-400">{total} clients · Trang {page}/{totalPages}</p>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue disabled:opacity-25 transition-all"><ChevronLeft size={12} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const s = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = s + i;
                if (p > totalPages) return null;
                return <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${p === page ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-brand-blue'}`}>{p}</button>;
              })}
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue disabled:opacity-25 transition-all"><ChevronRight size={12} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ TOKEN REVEAL MODAL ═══ */}
      <AnimatePresence>
        {revealedToken && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRevealedToken(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] rounded-3xl shadow-2xl p-8 mx-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bearer Token đã sẵn sàng</h3>
                  <p className="text-[10px] text-slate-400">Lưu token ngay — sẽ không hiển thị lại!</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.04] rounded-xl p-4 mb-4">
                <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 break-all leading-relaxed select-all">{revealedToken}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { handleCopy(revealedToken, 'API Token'); }}
                  className="flex-grow flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl text-[11px] font-bold hover:brightness-110 transition-all shadow-lg"
                >
                  <Clipboard size={14} /> Copy Token
                </button>
                <button
                  onClick={() => setRevealedToken(null)}
                  className="px-6 py-3 border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400">Token chỉ hiển thị một lần. Hãy lưu lại ở nơi an toàn trước khi đóng.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ CREATE CUSTOMER DRAWER ═══ */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#0c0c0e] shadow-3xl flex flex-col border-l border-black/10 dark:border-white/10 text-slate-900 dark:text-white"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-lg"><UserPlus size={20} /></div>
                  <div>
                    <h3 className="text-lg font-bold">Thêm khách hàng mới</h3>
                    <p className="text-[10px] text-slate-400">Tạo tài khoản và cấp API token</p>
                  </div>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>

              {/* Drawer Body */}
              <div className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">EMAIL *</label>
                  <input
                    type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner"
                    placeholder="customer@company.com"
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">TÊN KHÁCH HÀNG</label>
                  <input
                    type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-slate-900 dark:text-white shadow-inner"
                    placeholder="Tên hiển thị..."
                  />
                </div>

                {/* Plan & Credits */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">GÓI (PLAN)</label>
                    <select
                      value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-900 dark:text-white"
                    >
                      <option value="">Free</option>
                      <option value="starter">Starter</option>
                      <option value="creator">Creator</option>
                      <option value="studio">Studio</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2">CREDITS BAN ĐẦU</label>
                    <input
                      type="number" value={formData.creditBalance} onChange={e => setFormData({ ...formData, creditBalance: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-blue/30 text-slate-900 dark:text-white shadow-inner"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Generate Token Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Key size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">Tự động tạo Bearer Token</p>
                      <p className="text-[9px] text-slate-400">Token sẽ hiển thị sau khi tạo thành công</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, generateToken: !formData.generateToken })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.generateToken ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${formData.generateToken ? 'left-[26px]' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Token Expiry Selector */}
                {formData.generateToken && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2 flex items-center gap-1.5">
                      <Timer size={10} /> THỜI HẠN TOKEN (NGÀY)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[7, 30, 90, 0].map(days => (
                        <button
                          key={days}
                          onClick={() => setFormData({ ...formData, tokenExpiresIn: days })}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                            formData.tokenExpiresIn === days
                              ? 'bg-brand-blue border-brand-blue text-white shadow-lg'
                              : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/10 text-gray-400 hover:text-brand-blue'
                          }`}
                        >
                          {days === 0 ? '∞ Vĩnh viễn' : `${days}d`}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 px-2">
                      {formData.tokenExpiresIn === 0
                        ? 'Token sẽ không bao giờ hết hạn (có thể thu hồi thủ công)'
                        : `Token hết hạn sau ${formData.tokenExpiresIn} ngày kể từ khi tạo`
                      }
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-brand-blue">
                    <Globe size={14} />
                    <p className="text-[10px] font-bold">API Endpoint</p>
                  </div>
                  <code className="block text-[9px] font-mono text-slate-500 dark:text-gray-400 bg-black/[0.03] dark:bg-white/[0.03] p-3 rounded-lg leading-relaxed">
                    POST /api-client/external/image-task<br />
                    POST /api-client/external/video-task<br />
                    Authorization: Bearer {'<token>'}
                  </code>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-8 border-t border-black/[0.04] dark:border-white/[0.04] bg-slate-50 dark:bg-black/40 flex gap-4 shrink-0">
                <button onClick={() => setIsDrawerOpen(false)} className="flex-grow py-4 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">Hủy</button>
                <button
                  onClick={handleCreateCustomer} disabled={isSaving}
                  className="flex-grow py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  Tạo khách hàng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ API DOCS MODAL ═══ */}
      <AnimatePresence>
        {showApiDocs && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowApiDocs(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#111114] border border-black/[0.06] dark:border-white/[0.06] rounded-3xl shadow-2xl mx-4 flex flex-col"
            >
              <div className="p-6 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue"><Terminal size={16} /></div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Documentation</h3>
                </div>
                <button onClick={() => setShowApiDocs(false)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><X size={18} /></button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Create Image Task */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded">POST</span>
                    <code className="text-[11px] font-mono text-slate-600 dark:text-gray-400">/api-client/external/image-task</code>
                  </div>
                  <p className="text-[10px] text-slate-400">Tạo tác vụ hình ảnh AI (pending → chờ worker xử lý)</p>
                  <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-4 border border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Request Body</p>
                    <pre className="text-[10px] font-mono text-slate-600 dark:text-gray-400 leading-relaxed overflow-x-auto">{`{
  "prompt": "A cyberpunk cat in neon city",
  "type": "text_to_image",
  "width": 1024,
  "height": 1024,
  "aspectRatio": "1:1",
  "engine": {
    "provider": "fxflow",
    "model": "google_image_gen_4_5"
  }
}`}</pre>
                  </div>
                </div>

                {/* List Image Tasks */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase rounded">GET</span>
                    <code className="text-[11px] font-mono text-slate-600 dark:text-gray-400">/api-client/external/image-tasks</code>
                  </div>
                  <p className="text-[10px] text-slate-400">Liệt kê tất cả tác vụ hình ảnh. Params: ?status=pending&page=1&limit=20</p>
                </div>

                {/* Get Image Task Detail */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase rounded">GET</span>
                    <code className="text-[11px] font-mono text-slate-600 dark:text-gray-400">/api-client/external/image-task/:id</code>
                  </div>
                  <p className="text-[10px] text-slate-400">Xem chi tiết một tác vụ — kết quả, trạng thái, lỗi</p>
                </div>

                {/* Divider */}
                <div className="border-t border-black/[0.04] dark:border-white/[0.04]" />

                {/* Create Video Task */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-500 text-[9px] font-black uppercase rounded">POST</span>
                    <code className="text-[11px] font-mono text-slate-600 dark:text-gray-400">/api-client/external/video-task</code>
                  </div>
                  <p className="text-[10px] text-slate-400">Tạo tác vụ video AI (pending → chờ worker xử lý)</p>
                  <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-4 border border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Request Body — Text to Video</p>
                    <pre className="text-[10px] font-mono text-slate-600 dark:text-gray-400 leading-relaxed overflow-x-auto">{`{
  "prompt": "A cinematic drone shot of neon city",
  "type": "text-to-video",
  "duration": 5,
  "aspectRatio": "16:9", // "16:9" (Ngang) hoặc "9:16" (Dọc)
  "resolution": "720p",
  "mode": "relaxed",
  "engine": {
    "provider": "fxflow",
    "model": "veo_3_generate"
  }
}`}</pre>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-4 border border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Request Body — Image to Video</p>
                    <pre className="text-[10px] font-mono text-slate-600 dark:text-gray-400 leading-relaxed overflow-x-auto">{`{
  "prompt": "Zoom into the product with soft lighting",
  "type": "image-to-video",
  "startImage": "https://cdn.example.com/img.jpg",
  "duration": 5,
  "aspectRatio": "16:9", // "16:9" (Ngang) hoặc "9:16" (Dọc)
  "engine": {
    "provider": "fxflow",
    "model": "veo_3_generate"
  }
}`}</pre>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-3 border border-black/[0.04] dark:border-white/[0.04]">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1.5">Supported Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['text-to-video', 'image-to-video', 'start-end-image', 'image-to-animation', 'ingredient'].map(t => (
                        <span key={t} className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-violet-500/5 text-violet-500 border border-violet-500/10 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* List Video Tasks */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase rounded">GET</span>
                    <code className="text-[11px] font-mono text-slate-600 dark:text-gray-400">/api-client/external/video-tasks</code>
                  </div>
                  <p className="text-[10px] text-slate-400">Liệt kê tất cả tác vụ video. Params: ?status=pending&type=text-to-video&page=1&limit=20</p>
                </div>

                {/* Get Video Task Detail */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase rounded">GET</span>
                    <code className="text-[11px] font-mono text-slate-600 dark:text-gray-400">/api-client/external/video-task/:id</code>
                  </div>
                  <p className="text-[10px] text-slate-400">Xem chi tiết một tác vụ video — kết quả, trạng thái, lỗi</p>
                </div>

                {/* Divider */}
                <div className="border-t border-black/[0.04] dark:border-white/[0.04]" />

                {/* Auth Info */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><Shield size={12} /> Authentication</p>
                  <p className="text-[10px] text-slate-500">Tất cả API external cần header:</p>
                  <code className="block text-[10px] font-mono bg-black/[0.03] dark:bg-white/[0.03] p-2 rounded-lg text-slate-600 dark:text-gray-400">
                    Authorization: Bearer skv_xxxxx...
                  </code>
                </div>

                {/* cURL Examples */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500">cURL Example — Image</p>
                  <div className="bg-[#1a1a2e] rounded-xl p-4 relative">
                    <button onClick={() => handleCopy(`curl -X POST https://your-domain.com/api-client/external/image-task \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer skv_your_token_here" \\
  -d '{"prompt":"A beautiful sunset","type":"text_to_image","engine":{"provider":"fxflow","model":"google_image_gen_4_5"}}'`, 'cURL')} className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white transition-colors"><Copy size={12} /></button>
                    <pre className="text-[9px] font-mono text-emerald-400 leading-relaxed overflow-x-auto">{`curl -X POST \\
  https://your-domain.com/api-client/external/image-task \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer skv_your_token_here" \\
  -d '{
    "prompt": "A beautiful sunset",
    "type": "text_to_image",
    "engine": {
      "provider": "fxflow",
      "model": "google_image_gen_4_5"
    }
  }'`}</pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500">cURL Example — Video</p>
                  <div className="bg-[#1a1a2e] rounded-xl p-4 relative">
                    <button onClick={() => handleCopy(`curl -X POST https://your-domain.com/api-client/external/video-task \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer skv_your_token_here" \\
  -d '{"prompt":"A cinematic drone shot of neon city at night","type":"text-to-video","duration":5,"aspectRatio":"16:9","mode":"relaxed","engine":{"provider":"fxflow","model":"veo_3_generate"}}'`, 'cURL')} className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white transition-colors"><Copy size={12} /></button>
                    <pre className="text-[9px] font-mono text-violet-400 leading-relaxed overflow-x-auto">{`curl -X POST \\
  https://your-domain.com/api-client/external/video-task \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer skv_your_token_here" \\
  -d '{
    "prompt": "A cinematic drone shot of neon city",
    "type": "text-to-video",
    "duration": 5,
    "aspectRatio": "16:9",
    "mode": "relaxed",
    "engine": {
      "provider": "fxflow",
      "model": "veo_3_generate"
    }
  }'`}</pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
