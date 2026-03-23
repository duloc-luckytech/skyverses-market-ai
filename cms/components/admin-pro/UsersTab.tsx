
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, 
  Mail, Calendar, Activity, Zap, 
  Crown, Shield, Clock, Loader2,
  SearchX, X, ArrowUpRight, ArrowDownRight,
  Sparkles, RefreshCw, PlusCircle, MinusCircle,
  Receipt, Send
} from 'lucide-react';
import { AuthUser, UserListResponse, UserListParams, authApi } from '../../apis/auth';

interface UsersTabProps {
  loading: boolean;
  response: UserListResponse | null;
  onParamsChange: (params: UserListParams) => void;
}

export const UsersTab: React.FC<UsersTabProps> = () => {
  // Users list
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    pageSize: 20,
    searchContent: '',
    sortBy: 'lastActiveAt',
    sortOrder: 'desc',
    plan: ''
  });

  // User detail drawer
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Admin adjust credits
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

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

  useEffect(() => { fetchUsers(params); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { ...params, page: 1 };
    setParams(next);
    fetchUsers(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = { ...params, page: newPage };
    setParams(next);
    fetchUsers(next);
  };

  const handleSort = (field: string) => {
    const nextOrder = params.sortBy === field && params.sortOrder === 'desc' ? 'asc' : 'desc';
    const next = { ...params, sortBy: field, sortOrder: nextOrder as 'asc' | 'desc' };
    setParams(next);
    fetchUsers(next);
  };

  const handlePlanFilter = (plan: string) => {
    const next = { ...params, plan, page: 1 };
    setParams(next);
    fetchUsers(next);
  };

  // User detail
  const openUserDetail = async (user: AuthUser) => {
    setSelectedUser(user);
    setHistoryPage(1);
    setAdjustAmount('');
    setAdjustNote('');
    fetchUserHistory(user._id, 1);
  };

  const fetchUserHistory = async (userId: string, page: number) => {
    setHistoryLoading(true);
    try {
      const res = await authApi.getUserCreditHistory(userId, page, 15);
      setUserHistory(res.data || []);
      setHistoryTotal(res.pagination?.total || 0);
      setHistoryPage(page);
    } catch (e) { console.error(e); }
    setHistoryLoading(false);
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser || !adjustAmount) return;
    setAdjusting(true);
    try {
      const amount = parseInt(adjustAmount);
      if (isNaN(amount)) return;
      const res = await authApi.adminAdjustCredits(selectedUser._id, amount, adjustNote || `Admin adjust: ${amount > 0 ? '+' : ''}${amount}`);
      if (res.success) {
        // Refresh
        fetchUserHistory(selectedUser._id, 1);
        fetchUsers(params);
        setSelectedUser({ ...selectedUser, creditBalance: res.creditBalance });
        setAdjustAmount('');
        setAdjustNote('');
      }
    } catch (e) { console.error(e); }
    setAdjusting(false);
  };

  const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    'TOP_UP': { label: 'Nạp', color: '#10b981', bg: '#10b98112' },
    'CONSUME': { label: 'Dùng', color: '#ef4444', bg: '#ef444412' },
    'REFUND': { label: 'Hoàn', color: '#f59e0b', bg: '#f59e0b12' },
    'ADMIN_ADJUST': { label: 'Admin', color: '#8b5cf6', bg: '#8b5cf612' },
    'BONUS': { label: 'Bonus', color: '#8b5cf6', bg: '#8b5cf612' },
    'WELCOME': { label: 'Welcome', color: '#0090ff', bg: '#0090ff12' },
    'DAILY': { label: 'Daily', color: '#06b6d4', bg: '#06b6d412' },
    'REFERRAL': { label: 'Ref', color: '#ec4899', bg: '#ec489912' },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* ═══ TOOLBAR ═══ */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
        <form onSubmit={handleSearch} className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={14} />
          <input 
            type="text"
            value={params.searchContent}
            onChange={(e) => setParams({ ...params, searchContent: e.target.value })}
            placeholder="Tìm theo tên, email..."
            className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:border-brand-blue/40 outline-none transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 border border-black/[0.04] dark:border-white/[0.06] rounded-xl bg-slate-50 dark:bg-white/[0.03]">
            <Filter size={13} className="text-slate-400" />
            <select 
              value={params.plan}
              onChange={(e) => handlePlanFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer text-slate-600 dark:text-gray-400"
            >
              <option value="">Tất cả</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="creator">Creator</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/[0.03] p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
            {[10, 20, 50].map(size => (
              <button 
                key={size}
                onClick={() => { const next = { ...params, pageSize: size, page: 1 }; setParams(next); fetchUsers(next); }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${params.pageSize === size ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-slate-400'}`}
              >
                {size}
              </button>
            ))}
          </div>

          <button onClick={() => fetchUsers(params)} className="p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06] text-slate-400 hover:text-brand-blue transition-all">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Tổng user" value={totalItems.toString()} color="#0090ff" icon={<Users size={14} />} />
        <StatBox label="Trang" value={`${params.page || 1} / ${totalPages}`} color="#8b5cf6" icon={<Receipt size={14} />} />
        <StatBox label="Sort by" value={params.sortBy || 'lastActive'} color="#10b981" icon={<ArrowUpDown size={14} />} />
        <StatBox label="Hiển thị" value={`${users.length} user`} color="#f59e0b" icon={<Activity size={14} />} />
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-5 py-3.5 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('creditBalance')}>
                  Credits <ArrowUpDown size={8} className="inline ml-1" />
                </th>
                <th className="px-5 py-3.5 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('plan')}>
                  Gói <ArrowUpDown size={8} className="inline ml-1" />
                </th>
                <th className="px-5 py-3.5 cursor-pointer hover:text-brand-blue" onClick={() => handleSort('lastActiveAt')}>
                  Hoạt động cuối <ArrowUpDown size={8} className="inline ml-1" />
                </th>
                <th className="px-5 py-3.5">Đăng ký</th>
                <th className="px-5 py-3.5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-blue mb-3" size={28} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang tải...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <SearchX size={40} className="mx-auto mb-3 text-slate-200 dark:text-gray-700" />
                    <p className="text-sm font-bold text-slate-400">Không tìm thấy người dùng</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer" onClick={() => openUserDetail(u)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || 'https://i.pravatar.cc/100'} className="w-9 h-9 rounded-xl border border-black/[0.04] dark:border-white/[0.06]" alt="" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">{u.name || 'No name'}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-brand-blue" fill="currentColor" />
                        <span className="text-sm font-black text-brand-blue tabular-nums">{(u.creditBalance || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400">CR</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded-lg border ${
                        u.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                        u.plan === 'studio' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
                        u.plan === 'creator' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                      }`}>
                        {u.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">
                        {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[11px] text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openUserDetail(u); }}
                        className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-[10px] font-bold hover:bg-brand-blue hover:text-white transition-all"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between bg-slate-50/30 dark:bg-white/[0.005]">
            <p className="text-[10px] font-bold text-slate-400">{totalItems} người dùng · Trang {params.page} / {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button disabled={(params.page || 1) <= 1} onClick={() => handlePageChange((params.page || 1) - 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue disabled:opacity-25 transition-all">
                <ChevronLeft size={12} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min((params.page || 1) - 2, totalPages - 4));
                const p = startPage + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => handlePageChange(p)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${p === (params.page || 1) ? 'bg-brand-blue text-white' : 'text-slate-400 hover:text-brand-blue'}`}>
                    {p}
                  </button>
                );
              })}
              <button disabled={(params.page || 1) >= totalPages} onClick={() => handlePageChange((params.page || 1) + 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue disabled:opacity-25 transition-all">
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ USER DETAIL DRAWER ═══ */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-[#0a0a0e] border-l border-black/[0.06] dark:border-white/[0.06] shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="shrink-0 px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar || 'https://i.pravatar.cc/100'} className="w-10 h-10 rounded-xl border border-black/[0.04] dark:border-white/[0.06]" alt="" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.name}</p>
                    <p className="text-[10px] text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* User Info Cards */}
              <div className="shrink-0 px-6 py-4 grid grid-cols-3 gap-3 border-b border-black/[0.04] dark:border-white/[0.04]">
                <div className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-brand-blue uppercase tracking-wider mb-1">Credits</p>
                  <p className="text-lg font-black text-brand-blue tabular-nums">{(selectedUser.creditBalance || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gói</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase">{selectedUser.plan || 'Free'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Giao dịch</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-300 tabular-nums">{historyTotal}</p>
                </div>
              </div>

              {/* Admin Adjust Credits */}
              <div className="shrink-0 px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Điều chỉnh Credits</p>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={adjustAmount} 
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="+1000 hoặc -500"
                    className="flex-grow bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-brand-blue/40"
                  />
                  <input 
                    type="text" 
                    value={adjustNote} 
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="Ghi chú..."
                    className="w-32 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-brand-blue/40"
                  />
                  <button 
                    onClick={handleAdjustCredits}
                    disabled={!adjustAmount || adjusting}
                    className="px-3 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5"
                  >
                    {adjusting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    Gửi
                  </button>
                </div>
              </div>

              {/* Transaction History */}
              <div className="flex-grow overflow-y-auto">
                <div className="px-6 py-3 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0a0a0e] z-10 border-b border-black/[0.02] dark:border-white/[0.02]">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Lịch sử giao dịch</p>
                  <button onClick={() => fetchUserHistory(selectedUser._id, historyPage)} className="text-[10px] font-bold text-brand-blue flex items-center gap-1">
                    <RefreshCw size={10} /> Làm mới
                  </button>
                </div>

                {historyLoading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-2" />
                    <p className="text-[10px] text-slate-400">Đang tải...</p>
                  </div>
                ) : userHistory.length === 0 ? (
                  <div className="py-16 text-center">
                    <Receipt size={28} className="text-slate-200 dark:text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Chưa có giao dịch</p>
                  </div>
                ) : (
                  <div className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
                    {userHistory.map((tx: any) => {
                      const isPositive = tx.amount > 0;
                      const cfg = typeConfig[tx.type] || { label: tx.type, color: '#64748b', bg: '#64748b12' };
                      const date = new Date(tx.createdAt);
                      return (
                        <div key={tx._id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                              {isPositive ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                              {cfg.label}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{tx.note || tx.source || '—'}</p>
                              <p className="text-[9px] text-slate-300 dark:text-gray-600">{date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className={`text-xs font-black tabular-nums ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                              {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-slate-300 dark:text-gray-600 tabular-nums">{(tx.balanceAfter || 0).toLocaleString()} CR</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* History pagination */}
                {historyTotal > 15 && (
                  <div className="px-6 py-3 flex items-center justify-between border-t border-black/[0.03] dark:border-white/[0.03]">
                    <p className="text-[10px] text-slate-400">{historyPage} / {Math.ceil(historyTotal / 15)}</p>
                    <div className="flex gap-1.5">
                      <button disabled={historyPage <= 1} onClick={() => fetchUserHistory(selectedUser._id, historyPage - 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25">
                        <ChevronLeft size={12} />
                      </button>
                      <button disabled={historyPage >= Math.ceil(historyTotal / 15)} onClick={() => fetchUserHistory(selectedUser._id, historyPage + 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25">
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mini stat box
const StatBox = ({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) => (
  <div className="p-3.5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}12`, color }}>{icon}</div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight tabular-nums">{value}</p>
  </div>
);
