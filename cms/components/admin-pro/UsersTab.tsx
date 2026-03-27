
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Sparkles, RefreshCw, Loader2, SearchX, Crown, Shield,
  UserCheck, UserX, Film, TrendingUp, Download, Clock
} from 'lucide-react';
import { AuthUser, UserListResponse, UserListParams, authApi } from '../../apis/auth';
import { UserDetailDrawer } from './UserDetailDrawer';

interface UsersTabProps {
  loading: boolean;
  response: UserListResponse | null;
  onParamsChange: (params: UserListParams) => void;
}

// ─── STAT CARD ───
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

// ─── ROLE BADGE ───
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  master: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  sub: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  user: 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10',
};

const PLAN_COLORS: Record<string, string> = {
  enterprise: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  studio: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  creator: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  starter: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const relativeTime = (d: string) => {
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60000) return 'Vừa xong';
  if (ms < 3600000) return `${Math.floor(ms / 60000)}p trước`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h trước`;
  if (ms < 2592000000) return `${Math.floor(ms / 86400000)}d trước`;
  return new Date(d).toLocaleDateString('vi-VN');
};

export const UsersTab: React.FC<UsersTabProps> = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [params, setParams] = useState<UserListParams>({
    page: 1, pageSize: 20, searchContent: '', sortBy: 'lastActiveAt', sortOrder: 'desc', plan: ''
  });

  // Stats
  const [stats, setStats] = useState<any>({});

  // Drawer
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  const fetchUsers = useCallback(async (p: UserListParams) => {
    setLoading(true);
    try {
      const res = await authApi.listUsers(p);
      setUsers(res.data || []);
      setTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await authApi.getUserStatistic();
      if (res.success) setStats(res);
    } catch (e) { console.error(e); }
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchUsers(params); fetchStats(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); const next = { ...params, page: 1 }; setParams(next); fetchUsers(next); };
  const handlePageChange = (p: number) => { const next = { ...params, page: p }; setParams(next); fetchUsers(next); };
  const handleSort = (field: string) => {
    const nextOrder = params.sortBy === field && params.sortOrder === 'desc' ? 'asc' : 'desc';
    const next = { ...params, sortBy: field, sortOrder: nextOrder as 'asc' | 'desc' };
    setParams(next); fetchUsers(next);
  };
  const handleFilterPlan = (plan: string) => { const next = { ...params, plan, page: 1 }; setParams(next); fetchUsers(next); };

  const handleUserUpdated = (updated: AuthUser) => {
    setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u));
    setSelectedUser(updated);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Plan', 'Credits', 'Role', 'VideoUsed', 'MaxVideo', 'CreatedAt', 'LastActive'];
    const rows = users.map(u => [u.name, u.email, u.plan || 'Free', u.creditBalance, u.role, u.videoUsed || 0, u.maxVideo || 0, u.createdAt || '', u.lastActiveAt || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `users_page${params.page}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-in fade-in duration-500 max-w-[1600px] mx-auto">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quản lý khách hàng</h2>
          <p className="text-xs text-slate-400">{totalItems} tài khoản đã đăng ký hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-[10px] font-bold text-slate-500 hover:text-brand-blue transition-all">
            <Download size={12} /> Export CSV
          </button>
          <button onClick={() => { fetchUsers(params); fetchStats(); }} className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white text-[11px] font-semibold rounded-xl hover:brightness-110 transition-all">
            <RefreshCw size={12} /> Làm mới
          </button>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Tổng Users" value={stats.totalUser?.toLocaleString() || '0'} sub="Tất cả tài khoản" color="bg-brand-blue/10 text-brand-blue" icon={<Users size={15} />} loading={statsLoading} />
        <StatCard label="VIP Active" value={stats.vipActive?.toLocaleString() || '0'} sub="Gói còn hạn" color="bg-emerald-500/10 text-emerald-500" icon={<UserCheck size={15} />} loading={statsLoading} />
        <StatCard label="VIP Expired" value={stats.vipExpired?.toLocaleString() || '0'} sub="Gói hết hạn" color="bg-red-500/10 text-red-500" icon={<UserX size={15} />} loading={statsLoading} />
        <StatCard label="Trial" value={stats.trialUsers?.toLocaleString() || '0'} sub="Đang dùng thử" color="bg-amber-500/10 text-amber-500" icon={<Clock size={15} />} loading={statsLoading} />
        <StatCard label="Tổng Video" value={stats.totalVideoCount?.toLocaleString() || '0'} sub="Video đã tạo" color="bg-purple-500/10 text-purple-500" icon={<Film size={15} />} loading={statsLoading} />
        <StatCard label="Hiển thị" value={`${users.length} / ${totalItems}`} sub={`Trang ${params.page || 1}/${totalPages}`} color="bg-cyan-500/10 text-cyan-500" icon={<TrendingUp size={15} />} loading={false} />
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 bg-white dark:bg-white/[0.02] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
        <form onSubmit={handleSearch} className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={13} />
          <input type="text" value={params.searchContent} onChange={e => setParams({ ...params, searchContent: e.target.value })} placeholder="Tìm tên, email, ID..."
            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-brand-blue/40 outline-none transition-all" />
        </form>
        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-black/[0.04] dark:border-white/[0.06] rounded-xl bg-slate-50 dark:bg-white/[0.03]">
            <Filter size={11} className="text-slate-400" />
            <select value={params.plan} onChange={e => handleFilterPlan(e.target.value)} className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer text-slate-600 dark:text-gray-400">
              <option value="">Tất cả</option><option value="free">Free</option><option value="starter">Starter</option><option value="creator">Creator</option><option value="studio">Studio</option>
            </select>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.03] p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
            {[10, 20, 50].map(size => (
              <button key={size} onClick={() => { const next = { ...params, pageSize: size, page: 1 }; setParams(next); fetchUsers(next); }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${params.pageSize === size ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-slate-400'}`}>{size}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('creditBalance')}>Credits <ArrowUpDown size={7} className="inline ml-0.5" /></th>
                <th className="px-3 py-3 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('plan')}>Gói <ArrowUpDown size={7} className="inline ml-0.5" /></th>
                <th className="px-3 py-3">Video</th>
                <th className="px-3 py-3">Hoa hồng</th>
                <th className="px-3 py-3 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('lastActiveAt')}>Hoạt động <ArrowUpDown size={7} className="inline ml-0.5" /></th>
                <th className="px-3 py-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-blue mb-2" size={24} /><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang tải...</p></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center"><SearchX size={36} className="mx-auto mb-2 text-slate-200 dark:text-gray-700" /><p className="text-sm font-bold text-slate-400">Không tìm thấy</p></td></tr>
              ) : users.map(u => {
                const planExpiry = u.planExpiresAt ? new Date(u.planExpiresAt) : null;
                const expired = planExpiry && planExpiry < new Date();
                const vp = u.maxVideo ? Math.round((u.videoUsed || 0) / u.maxVideo * 100) : 0;
                return (
                  <tr key={u._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name || u.email}&background=0090ff&color=fff&size=40`} className="w-8 h-8 rounded-lg border border-black/[0.04] dark:border-white/[0.06]" alt="" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{u.name || 'No name'}</p>
                          <p className="text-[9px] text-slate-400 truncate max-w-[140px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-3 py-3">
                      <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>{u.role}</span>
                    </td>
                    {/* Credits */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <Sparkles size={11} className="text-brand-blue" fill="currentColor" />
                        <span className="text-sm font-black text-brand-blue tabular-nums">{(u.creditBalance || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="px-3 py-3">
                      <div>
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-md border ${PLAN_COLORS[u.plan || ''] || 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>{u.plan || 'Free'}</span>
                        {planExpiry && <p className={`text-[8px] mt-0.5 ${expired ? 'text-red-400' : 'text-slate-400'}`}>{expired ? 'Hết hạn' : planExpiry.toLocaleDateString('vi-VN')}</p>}
                      </div>
                    </td>
                    {/* Video */}
                    <td className="px-3 py-3">
                      {(u.maxVideo || 0) > 0 ? (
                        <div className="w-16">
                          <p className="text-[9px] text-slate-500 tabular-nums mb-0.5">{u.videoUsed || 0}/{u.maxVideo}</p>
                          <div className="h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-brand-blue rounded-full" style={{ width: `${vp}%` }} /></div>
                        </div>
                      ) : <span className="text-[9px] text-slate-300">—</span>}
                    </td>
                    {/* Affiliate */}
                    <td className="px-3 py-3">
                      {(u.affiliateTotal || 0) > 0 ? (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-500 tabular-nums">{(u.affiliateTotal || 0).toLocaleString()}₫</p>
                          {(u.affiliatePending || 0) > 0 && <p className="text-[8px] text-amber-500">Chờ: {(u.affiliatePending || 0).toLocaleString()}</p>}
                        </div>
                      ) : <span className="text-[9px] text-slate-300">—</span>}
                    </td>
                    {/* Last active */}
                    <td className="px-3 py-3">
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">{u.lastActiveAt ? relativeTime(u.lastActiveAt) : '—'}</p>
                    </td>
                    {/* Action */}
                    <td className="px-3 py-3 text-right">
                      <button onClick={e => { e.stopPropagation(); setSelectedUser(u); }} className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg text-[9px] font-bold hover:bg-brand-blue hover:text-white transition-all">Xem</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between bg-slate-50/30 dark:bg-white/[0.005]">
            <p className="text-[10px] font-bold text-slate-400">{totalItems} users · Trang {params.page}/{totalPages}</p>
            <div className="flex items-center gap-1">
              <button disabled={(params.page || 1) <= 1} onClick={() => handlePageChange((params.page || 1) - 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue disabled:opacity-25 transition-all"><ChevronLeft size={12} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const s = Math.max(1, Math.min((params.page || 1) - 2, totalPages - 4)); const p = s + i;
                if (p > totalPages) return null;
                return <button key={p} onClick={() => handlePageChange(p)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${p === (params.page || 1) ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-brand-blue'}`}>{p}</button>;
              })}
              <button disabled={(params.page || 1) >= totalPages} onClick={() => handlePageChange((params.page || 1) + 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue disabled:opacity-25 transition-all"><ChevronRight size={12} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ USER DETAIL DRAWER ═══ */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onUserUpdated={handleUserUpdated} />
        )}
      </AnimatePresence>
    </div>
  );
};
