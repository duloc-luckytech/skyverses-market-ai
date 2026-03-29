import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, Send, History, User, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight,
  Filter, CreditCard, AlertCircle
} from 'lucide-react';
import { creditsApi } from '../../apis/credits';
import { API_BASE_URL, getHeaders } from '../../apis/config';

// ═══ Types ═══
interface UserResult {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
  creditBalance: number;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  source: string;
  note?: string;
  createdAt: string;
  user?: { email: string; name?: string };
}

// ═══ Helpers ═══
const TYPE_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  TOP_UP: { label: 'Nạp', color: 'text-emerald-500 bg-emerald-500/10', icon: <ArrowUpRight size={12} /> },
  BONUS: { label: 'Thưởng', color: 'text-brand-blue bg-brand-blue/10', icon: <Sparkles size={12} /> },
  CONSUME: { label: 'Tiêu', color: 'text-rose-500 bg-rose-500/10', icon: <ArrowDownRight size={12} /> },
  REFUND: { label: 'Hoàn', color: 'text-amber-500 bg-amber-500/10', icon: <ArrowUpRight size={12} /> },
  WELCOME: { label: 'Welcome', color: 'text-purple-500 bg-purple-500/10', icon: <Sparkles size={12} /> },
  DAILY: { label: 'Daily', color: 'text-cyan-500 bg-cyan-500/10', icon: <Clock size={12} /> },
};

const formatDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
    dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// ═══ Component ═══
export const AdminDepositTab: React.FC = () => {
  // Default user list
  const [defaultUsers, setDefaultUsers] = useState<UserResult[]>([]);
  const [defaultLoading, setDefaultLoading] = useState(true);

  // Search & Select user
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositResult, setDepositResult] = useState<{ success: boolean; message: string } | null>(null);

  // User history
  const [userHistory, setUserHistory] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Admin deposit history (all admin deposits)
  const [adminHistory, setAdminHistory] = useState<Transaction[]>([]);
  const [adminHistoryLoading, setAdminHistoryLoading] = useState(false);
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotal, setAdminTotal] = useState(0);

  // Active view
  const [activeView, setActiveView] = useState<'deposit' | 'history'>('deposit');

  // ═══ Fetch default users on mount ═══
  const fetchDefaultUsers = useCallback(async () => {
    setDefaultLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/list-u?page=1&pageSize=30&sortBy=lastActiveAt&sortOrder=desc`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      setDefaultUsers((data.data || []).map((u: any) => ({
        _id: u._id, email: u.email, name: u.name, avatar: u.avatar, creditBalance: u.creditBalance || 0,
      })));
    } catch { setDefaultUsers([]); }
    setDefaultLoading(false);
  }, []);

  useEffect(() => { fetchDefaultUsers(); }, [fetchDefaultUsers]);

  // ═══ Search Users ═══
  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/admin/search?q=${encodeURIComponent(q)}&limit=10`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      setSearchResults(data.data || data.users || []);
    } catch { setSearchResults([]); }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  // ═══ Fetch user history ═══
  const fetchUserHistory = useCallback(async (userId: string, page: number) => {
    setHistoryLoading(true);
    const res = await creditsApi.adminUserHistory(userId, page, 10);
    if (res.success) {
      setUserHistory(res.data || []);
      setHistoryTotal(res.pagination?.total || 0);
      // Update user balance from response
      if (res.user && selectedUser) {
        setSelectedUser(prev => prev ? { ...prev, creditBalance: res.user.creditBalance } : null);
      }
    }
    setHistoryLoading(false);
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) fetchUserHistory(selectedUser._id, historyPage);
  }, [selectedUser?._id, historyPage]);

  // ═══ Fetch admin deposit history ═══
  const fetchAdminHistory = useCallback(async (page: number) => {
    setAdminHistoryLoading(true);
    const res = await creditsApi.adminTopUpHistory(page, 15, 'admin');
    if (res.success) {
      setAdminHistory(res.data || []);
      setAdminTotal(res.pagination?.total || 0);
    }
    setAdminHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (activeView === 'history') fetchAdminHistory(adminPage);
  }, [activeView, adminPage, fetchAdminHistory]);

  // ═══ Deposit ═══
  const handleDeposit = async () => {
    if (!selectedUser || !depositAmount) return;
    const amount = parseInt(depositAmount);
    if (isNaN(amount) || amount === 0) return;

    setIsDepositing(true);
    setDepositResult(null);
    const res = await creditsApi.adminDeposit(
      selectedUser._id,
      amount,
      depositNote || `Admin deposit ${amount > 0 ? '+' : ''}${amount} credits`
    );

    if (res.success) {
      setDepositResult({ success: true, message: `Đã ${amount > 0 ? 'nạp' : 'trừ'} ${Math.abs(amount).toLocaleString()} credits. Số dư mới: ${res.creditBalance?.toLocaleString()}` });
      setSelectedUser(prev => prev ? { ...prev, creditBalance: res.creditBalance! } : null);
      setDepositAmount('');
      setDepositNote('');
      fetchUserHistory(selectedUser._id, 1);
      setHistoryPage(1);
    } else {
      setDepositResult({ success: false, message: res.message || 'Lỗi không xác định' });
    }
    setIsDepositing(false);
  };

  // ═══ Quick amounts ═══
  const quickAmounts = [100, 500, 1000, 5000, 10000, 50000];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-6"
    >
      {/* ═══ TABS ═══ */}
      <div className="flex items-center gap-2">
        {[
          { id: 'deposit' as const, label: 'Nạp Credit', icon: <CreditCard size={14} /> },
          { id: 'history' as const, label: 'Lịch sử Admin', icon: <History size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === tab.id
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                : 'bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-slate-500 dark:text-gray-400 hover:text-brand-blue'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'deposit' ? (
          <motion.div key="deposit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* ═══ LEFT: SEARCH & DEPOSIT ═══ */}
              <div className="lg:col-span-5 space-y-5">

                {/* Search User */}
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Tìm khách hàng</p>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Email hoặc tên..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 outline-none focus:border-brand-blue/30 transition-colors"
                    />
                    {isSearching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-blue animate-spin" />}
                  </div>

                  {/* User List (search results or default) */}
                  {!selectedUser && (() => {
                    const displayUsers = searchQuery.length >= 2 ? searchResults : defaultUsers;
                    const isLoading = searchQuery.length >= 2 ? isSearching : defaultLoading;
                    return (
                      <div className="mt-3">
                        {!searchQuery && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Khách hàng gần đây ({defaultUsers.length})</p>}
                        {isLoading ? (
                          <div className="text-center py-6"><Loader2 size={16} className="mx-auto text-brand-blue animate-spin" /></div>
                        ) : displayUsers.length === 0 ? (
                          <p className="text-center py-4 text-[10px] text-slate-400">{searchQuery ? 'Không tìm thấy' : 'Chưa có khách hàng'}</p>
                        ) : (
                          <div className="space-y-1 max-h-[400px] overflow-y-auto no-scrollbar">
                            {displayUsers.map(u => (
                              <button
                                key={u._id}
                                onClick={() => { setSelectedUser(u); setSearchResults([]); setSearchQuery(''); }}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-brand-blue/5 transition-all text-left group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold shrink-0">
                                  {u.avatar ? <img src={u.avatar} className="w-8 h-8 rounded-lg object-cover" alt="" /> : (u.email?.[0]?.toUpperCase() || 'U')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{u.name || u.email}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                                </div>
                                <span className="text-[10px] font-bold text-brand-blue">{(u.creditBalance || 0).toLocaleString()} CR</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Selected User + Deposit Form */}
                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] space-y-5"
                  >
                    {/* User Card */}
                    <div className="flex items-center gap-3 p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                        {selectedUser.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedUser.name || selectedUser.email}</p>
                        <p className="text-[10px] text-slate-400 truncate">{selectedUser.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-brand-blue">{selectedUser.creditBalance.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 uppercase">Credits</p>
                      </div>
                      <button
                        onClick={() => { setSelectedUser(null); setUserHistory([]); setDepositResult(null); }}
                        className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Số lượng Credits</p>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        placeholder="Nhập số credits (âm = trừ)"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 outline-none focus:border-brand-blue/30 transition-colors"
                      />
                      {/* Quick Amounts */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {quickAmounts.map(amt => (
                          <button
                            key={amt}
                            onClick={() => setDepositAmount(String(amt))}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg text-[10px] font-bold text-slate-500 hover:text-brand-blue hover:border-brand-blue/20 transition-all"
                          >
                            +{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú</p>
                      <input
                        type="text"
                        value={depositNote}
                        onChange={e => setDepositNote(e.target.value)}
                        placeholder="VD: Nạp credit cho KH VIP..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 outline-none focus:border-brand-blue/30 transition-colors"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-40"
                    >
                      {isDepositing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      {isDepositing ? 'Đang xử lý...' : 'Xác nhận Deposit'}
                    </button>

                    {/* Result */}
                    <AnimatePresence>
                      {depositResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
                            depositResult.success
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15'
                              : 'bg-red-500/10 text-red-500 border border-red-500/15'
                          }`}
                        >
                          {depositResult.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {depositResult.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* ═══ RIGHT: USER HISTORY ═══ */}
              <div className="lg:col-span-7">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History size={12} /> Lịch sử giao dịch
                      {selectedUser && <span className="text-brand-blue">• {selectedUser.email}</span>}
                    </p>
                  </div>

                  {!selectedUser ? (
                    <div className="text-center py-16">
                      <User size={32} className="mx-auto text-slate-200 dark:text-gray-700 mb-3" />
                      <p className="text-xs text-slate-400">Tìm và chọn khách hàng để xem lịch sử</p>
                    </div>
                  ) : historyLoading ? (
                    <div className="text-center py-16">
                      <Loader2 size={20} className="mx-auto text-brand-blue animate-spin" />
                    </div>
                  ) : userHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <History size={32} className="mx-auto text-slate-200 dark:text-gray-700 mb-3" />
                      <p className="text-xs text-slate-400">Chưa có giao dịch</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5 max-h-[500px] overflow-y-auto no-scrollbar">
                        {userHistory.map(tx => {
                          const cfg = TYPE_MAP[tx.type] || { label: tx.type, color: 'text-slate-500 bg-slate-100', icon: <Clock size={12} /> };
                          return (
                            <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
                              <div className={`w-8 h-8 rounded-lg ${cfg.color} flex items-center justify-center shrink-0`}>
                                {cfg.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                                  {tx.source === 'admin' && (
                                    <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">ADMIN</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{tx.note || '—'}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-xs font-black ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                </p>
                                <p className="text-[9px] text-slate-400">→ {tx.balanceAfter?.toLocaleString()}</p>
                              </div>
                              <p className="text-[9px] text-slate-300 dark:text-gray-600 w-24 text-right shrink-0">{formatDate(tx.createdAt)}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {historyTotal > 10 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                          <p className="text-[10px] text-slate-400">{historyTotal} giao dịch</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                              disabled={historyPage <= 1}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 disabled:opacity-30 transition-all"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <span className="text-[10px] font-bold text-slate-500 px-2">{historyPage}</span>
                            <button
                              onClick={() => setHistoryPage(p => p + 1)}
                              disabled={historyPage * 10 >= historyTotal}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 disabled:opacity-30 transition-all"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ═══ ADMIN HISTORY VIEW ═══ */
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Filter size={12} /> Tất cả giao dịch từ Admin
              </p>

              {adminHistoryLoading ? (
                <div className="text-center py-16">
                  <Loader2 size={20} className="mx-auto text-brand-blue animate-spin" />
                </div>
              ) : adminHistory.length === 0 ? (
                <div className="text-center py-16">
                  <History size={32} className="mx-auto text-slate-200 dark:text-gray-700 mb-3" />
                  <p className="text-xs text-slate-400">Chưa có giao dịch nào từ admin</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {adminHistory.map(tx => {
                      const cfg = TYPE_MAP[tx.type] || { label: tx.type, color: 'text-slate-500 bg-slate-100', icon: <Clock size={12} /> };
                      return (
                        <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all">
                          <div className={`w-8 h-8 rounded-lg ${cfg.color} flex items-center justify-center shrink-0`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {tx.user?.email || tx.user?.name || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{tx.note || '—'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-black ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-slate-400">→ {tx.balanceAfter?.toLocaleString()}</p>
                          </div>
                          <p className="text-[9px] text-slate-300 dark:text-gray-600 w-28 text-right shrink-0">{formatDate(tx.createdAt)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {adminTotal > 15 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <p className="text-[10px] text-slate-400">{adminTotal} giao dịch</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setAdminPage(p => Math.max(1, p - 1))}
                          disabled={adminPage <= 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 disabled:opacity-30 transition-all"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-[10px] font-bold text-slate-500 px-2">{adminPage}</span>
                        <button
                          onClick={() => setAdminPage(p => p + 1)}
                          disabled={adminPage * 15 >= adminTotal}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 disabled:opacity-30 transition-all"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDepositTab;
