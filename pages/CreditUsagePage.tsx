import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, BarChart3, Activity, PieChart, 
  ArrowUpRight, ArrowDownRight, Clock,
  Filter, Search, Download, RefreshCw,
  AlertTriangle, ChevronLeft, ChevronRight,
  ImageIcon, Video, Music, Mic, Wand2,
  TrendingUp, Wallet, ArrowRight, Lock,
  Receipt, Loader2, Sparkles, Crown, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { creditsApi, CreditTransaction } from '../apis/credits';
import { usePageMeta } from '../hooks/usePageMeta';

const CreditUsagePage: React.FC = () => {
  const { credits, login, isAuthenticated, user, refreshUserInfo, freeImageRemaining } = useAuth();
  const { t } = useLanguage();

  usePageMeta({
    title: 'Lịch sử sử dụng Credits — Skyverses AI',
    description: 'Theo dõi chi tiết lịch sử tiêu thụ và nạp Credits trên Skyverses.',
    keywords: 'credits, usage, history, skyverses, AI',
    canonical: '/usage'
  });

  // Data
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  // Purchase history
  const [purchases, setPurchases] = useState<any[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [myPlan, setMyPlan] = useState<string | null>(null);
  const [myPlanExpiry, setMyPlanExpiry] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchHistory = useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const res = await creditsApi.getHistory(p, LIMIT);
      setTransactions(res.data || []);
      setTotal(res.pagination?.total || 0);
      setPage(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchPurchases = useCallback(async () => {
    setPurchaseLoading(true);
    try {
      const res = await creditsApi.getMyPurchases();
      if (res.success) {
        setPurchases(res.purchases || []);
        setMyPlan(res.plan);
        setMyPlanExpiry(res.planExpiresAt);
      }
    } catch (e) { console.error(e); }
    setPurchaseLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory(1);
      fetchPurchases();
      refreshUserInfo();
    }
  }, [isAuthenticated]);

  // ─── COMPUTED STATS ───────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let todaySpent = 0;
    let monthSpent = 0;
    let totalConsumed = 0;
    let totalTopUp = 0;
    const sourceBreakdown: Record<string, number> = {};

    transactions.forEach(tx => {
      const txDate = new Date(tx.createdAt);
      if (tx.amount < 0) {
        const absAmount = Math.abs(tx.amount);
        totalConsumed += absAmount;
        if (tx.createdAt.startsWith(todayStr)) todaySpent += absAmount;
        if (txDate >= monthStart) monthSpent += absAmount;

        // Breakdown by source
        const src = tx.source || 'other';
        const label = src.includes('image') ? 'Image AI' : 
                      src.includes('video') ? 'Video AI' : 
                      src.includes('voice') ? 'Voice AI' :
                      src.includes('music') ? 'Music AI' : 'Khác';
        sourceBreakdown[label] = (sourceBreakdown[label] || 0) + absAmount;
      } else {
        totalTopUp += tx.amount;
      }
    });

    return { todaySpent, monthSpent, totalConsumed, totalTopUp, sourceBreakdown };
  }, [transactions]);

  const breakdowns = useMemo(() => {
    const total = Object.values(stats.sourceBreakdown).reduce((a, b) => a + b, 0) || 1;
    const colors: Record<string, { color: string; icon: React.ReactNode }> = {
      'Video AI': { color: '#8b5cf6', icon: <Video size={14}/> },
      'Image AI': { color: '#0090ff', icon: <ImageIcon size={14}/> },
      'Voice AI': { color: '#f59e0b', icon: <Mic size={14}/> },
      'Music AI': { color: '#ec4899', icon: <Music size={14}/> },
      'Khác': { color: '#64748b', icon: <Wand2 size={14}/> },
    };
    return Object.entries(stats.sourceBreakdown)
      .sort(([,a], [,b]) => b - a)
      .map(([label, amount]) => ({
        label,
        percentage: Math.round((amount / total) * 100),
        credits: amount,
        ...(colors[label] || colors['Khác']),
      }));
  }, [stats]);

  // ─── FILTERED TRANSACTIONS ───────────────────────
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = !searchQuery || 
        (tx.note || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.source || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx._id.includes(searchQuery);
      const matchType = typeFilter === 'All' || tx.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, searchQuery, typeFilter]);

  // ─── TYPE CONFIG ─────────────────────────────────
  const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    'TOP_UP': { label: 'Nạp tiền', color: '#10b981', bg: '#10b98112' },
    'CONSUME': { label: 'Sử dụng', color: '#ef4444', bg: '#ef444412' },
    'FREE_IMAGE': { label: 'Ảnh Free', color: '#8b5cf6', bg: '#8b5cf612' },
    'REFUND': { label: 'Hoàn trả', color: '#f59e0b', bg: '#f59e0b12' },
    'ADMIN_ADJUST': { label: 'Điều chỉnh', color: '#8b5cf6', bg: '#8b5cf612' },
    'WELCOME': { label: 'Welcome', color: '#0090ff', bg: '#0090ff12' },
    'DAILY': { label: 'Daily', color: '#06b6d4', bg: '#06b6d412' },
    'EVENT_BONUS': { label: 'Event Bonus', color: '#f59e0b', bg: '#f59e0b12' },
    'REFERRAL': { label: 'Giới thiệu', color: '#ec4899', bg: '#ec489912' },
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#030305] px-6">
        <div className="text-center space-y-8 max-w-md">
          <div className="w-20 h-20 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto text-brand-blue">
            <Lock size={36} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tight">Đăng nhập để xem</h2>
            <p className="text-sm text-slate-400 dark:text-gray-500">Đăng nhập để theo dõi chi tiết lịch sử sử dụng Credits.</p>
          </div>
          <button onClick={login} className="px-8 py-4 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-brand-blue/20">
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="pt-28 pb-32 bg-[#fafafa] dark:bg-[#030305] min-h-screen transition-colors duration-500 selection:bg-brand-blue/30 overflow-x-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[40%] w-[1000px] h-[600px] bg-gradient-to-b from-brand-blue/[0.03] to-transparent dark:from-brand-blue/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-violet-500/[0.02] to-transparent dark:from-violet-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* ════════════ HEADER ════════════ */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-full">
                <div className="w-4 h-4 rounded-full bg-brand-blue/15 flex items-center justify-center">
                  <BarChart3 size={9} className="text-brand-blue" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-gray-400">Usage Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-[-0.03em] leading-[1.1]">
                Lịch sử <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-violet-500">sử dụng</span>
              </h1>
              <p className="text-sm text-slate-400 dark:text-gray-500 max-w-lg">
                Theo dõi chi tiết mọi giao dịch Credits — nạp, tiêu thụ, và hoàn trả.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => fetchHistory(page)} 
                className="flex items-center gap-2 px-5 py-3 border border-black/[0.06] dark:border-white/[0.06] rounded-xl bg-white dark:bg-white/[0.03] text-xs font-bold hover:border-brand-blue/30 hover:text-brand-blue transition-all"
              >
                <RefreshCw size={13} /> Làm mới
              </button>
              <Link to="/credits" className="flex items-center gap-2 px-5 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-sm">
                <Zap size={13} fill="currentColor" /> Mua Credits
              </Link>
            </div>
          </div>
        </motion.header>

        {/* ════════════ SUMMARY CARDS ════════════ */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          <StatCard
            label="Số dư hiện tại"
            value={credits.toLocaleString()}
            unit="CR"
            icon={<Sparkles size={18} fill="currentColor" />}
            color="#0090ff"
          />
          <StatCard
            label="Ảnh free còn lại"
            value={freeImageRemaining.toLocaleString()}
            unit="ảnh"
            icon={<ImageIcon size={18} />}
            color="#8b5cf6"
          />
          <StatCard
            label="Đã dùng hôm nay"
            value={stats.todaySpent.toLocaleString()}
            unit="CR"
            icon={<Activity size={18} />}
            color="#ef4444"
          />
          <StatCard
            label="Đã dùng tháng này"
            value={stats.monthSpent.toLocaleString()}
            unit="CR"
            icon={<TrendingUp size={18} />}
            color="#f59e0b"
          />
        </motion.section>

        {/* ════════════ PLAN & PURCHASE HISTORY ════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10"
        >
          {/* Current Plan */}
          <div className="lg:col-span-4 p-6 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl flex flex-col">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Crown size={14} className="text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gói hiện tại</h3>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center text-center py-4">
              <p className={`text-3xl font-black uppercase tracking-tight mb-2 ${
                (myPlan || user?.plan)
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'text-slate-300 dark:text-gray-600'
              }`}>
                {myPlan || user?.plan || 'Free'}
              </p>
              {(myPlanExpiry || user?.planExpiresAt) ? (() => {
                const expiry = new Date(myPlanExpiry || user?.planExpiresAt || '');
                const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
                return (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                    daysLeft > 0
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    <Clock size={10} />
                    {daysLeft > 0 ? `Còn ${daysLeft} ngày · ${expiry.toLocaleDateString('vi-VN')}` : `Hết hạn · ${expiry.toLocaleDateString('vi-VN')}`}
                  </div>
                );
              })() : (myPlan || user?.plan) ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                  <Sparkles size={10} /> Đang hoạt động
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-gray-500">Chưa mua gói nào</p>
              )}
            </div>
            <Link to="/credits" className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-sm">
              <Package size={12} /> Nâng cấp gói
            </Link>
          </div>

          {/* Purchase History */}
          <div className="lg:col-span-8 p-6 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Receipt size={14} className="text-indigo-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử mua gói</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{purchases.length} giao dịch</span>
            </div>
            {purchaseLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="py-12 text-center">
                <Receipt size={32} className="text-slate-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500">Chưa có lịch sử mua gói</p>
                <p className="text-[10px] text-slate-300 dark:text-gray-600 mt-1">Mua gói Credits để mở khoá tính năng nâng cao</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                {purchases.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.03] dark:border-white/[0.03] hover:border-black/[0.06] dark:hover:border-white/[0.06] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Package size={14} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-white uppercase">{p.planName || p.planCode}</p>
                        <p className="text-[9px] text-slate-400">{new Date(p.purchasedAt).toLocaleDateString('vi-VN')} · {new Date(p.purchasedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500 tabular-nums">{(p.amount || 0).toLocaleString()}<span className="text-[9px] text-slate-400 ml-1">₫</span></p>
                      <p className="text-[8px] font-bold text-emerald-500/60 uppercase">Thành công</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* ════════════ BREAKDOWN + BALANCE ════════════ */}
        {breakdowns.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10"
          >
            {/* Breakdown */}
            <div className="lg:col-span-7 p-6 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <PieChart size={14} className="text-violet-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Phân bổ tiêu thụ</h3>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trang hiện tại</span>
              </div>
              <div className="space-y-5">
                {breakdowns.map((b) => (
                  <div key={b.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${b.color}12`, color: b.color }}>
                          {b.icon}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{b.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400">{b.credits.toLocaleString()} CR</span>
                        <span className="text-xs font-black" style={{ color: b.color }}>{b.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-black/[0.03] dark:bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${b.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {credits < 500 && (
                <div className="p-5 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Số dư thấp</p>
                    <p className="text-[11px] text-amber-600/70 dark:text-amber-500/60 leading-relaxed">Nạp thêm Credits để tiếp tục sử dụng.</p>
                    <Link to="/credits" className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-black text-amber-600 hover:underline uppercase tracking-wider">
                      Nạp ngay <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              )}
              <div className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl flex-grow flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <Wallet size={16} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Số dư</p>
                    <p className="text-2xl font-black text-brand-blue tracking-tight">{credits.toLocaleString()} <span className="text-xs font-bold text-slate-400">CR</span></p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 leading-relaxed mb-4">Credits không hết hạn. Mua thêm bất cứ khi nào bạn cần.</p>
                <Link to="/credits" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-sm">
                  <Zap size={12} fill="currentColor" /> Mua thêm Credits
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════ FILTER BAR ════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4"
        >
          <h3 className="text-lg font-black tracking-tight shrink-0">
            Chi tiết giao dịch <span className="text-slate-300 dark:text-gray-600 text-sm font-bold">({total})</span>
          </h3>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" size={13} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo ghi chú, ID..."
                className="w-full bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium focus:border-brand-blue/40 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 border border-black/[0.06] dark:border-white/[0.06] rounded-xl bg-white dark:bg-white/[0.03]">
              <Filter size={13} className="text-slate-400" />
              <select 
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer text-slate-600 dark:text-gray-400"
              >
                <option value="All">Tất cả</option>
                <option value="CONSUME">Sử dụng</option>
                <option value="FREE_IMAGE">Ảnh Free</option>
                <option value="TOP_UP">Nạp tiền</option>
                <option value="REFUND">Hoàn trả</option>
                <option value="WELCOME">Welcome</option>
                <option value="DAILY">Daily</option>
                <option value="EVENT_BONUS">Event Bonus</option>
                <option value="REFERRAL">Giới thiệu</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ════════════ TRANSACTION TABLE ════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm"
        >
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Đang tải lịch sử...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <Receipt size={40} className="text-slate-200 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 dark:text-gray-500">
                {searchQuery || typeFilter !== 'All' ? 'Không tìm thấy giao dịch phù hợp' : 'Chưa có giao dịch nào'}
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
                <div className="col-span-2">Loại</div>
                <div className="col-span-2 text-right">Số lượng</div>
                <div className="col-span-2 text-right">Số dư sau</div>
                <div className="col-span-1">Nguồn</div>
                <div className="col-span-3">Ghi chú</div>
                <div className="col-span-2 text-right">Thời gian</div>
              </div>

              {/* Rows */}
              {filtered.map((tx) => {
                const isPositive = tx.amount > 0;
                const cfg = typeConfig[tx.type] || { label: tx.type, color: '#64748b', bg: '#64748b12' };
                const date = new Date(tx.createdAt);

                return (
                  <div key={tx._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-3.5 border-b border-black/[0.02] dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors items-center">
                    {/* Type */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {cfg.label}
                      </span>
                    </div>
                    {/* Amount */}
                    <div className="col-span-2 text-right">
                      {tx.type === 'FREE_IMAGE' ? (
                        <span className="text-sm font-black text-violet-500">Miễn phí</span>
                      ) : (
                        <>
                          <span className={`text-sm font-black tabular-nums ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 ml-1">CR</span>
                        </>
                      )}
                    </div>
                    {/* Balance after */}
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-bold text-slate-500 dark:text-gray-400 tabular-nums">{(tx.balanceAfter || 0).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-300 dark:text-gray-600 ml-1">CR</span>
                    </div>
                    {/* Source */}
                    <div className="col-span-1">
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 truncate block">
                        {(tx.source || '—').replace('_generation', '').replace('_cancel', '')}
                      </span>
                    </div>
                    {/* Note */}
                    <div className="col-span-3">
                      <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate" title={tx.note || ''}>
                        {tx.note || '—'}
                      </p>
                    </div>
                    {/* Time */}
                    <div className="col-span-2 text-right">
                      <p className="text-[11px] text-slate-400 dark:text-gray-500 tabular-nums">
                        {date.toLocaleDateString('vi-VN')} · {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-black/[0.03] dark:border-white/[0.03] bg-slate-50/30 dark:bg-white/[0.005]">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500">
                    Trang {page} / {totalPages} · {total} giao dịch
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fetchHistory(page - 1)} 
                      disabled={page <= 1}
                      className="w-8 h-8 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const p = startPage + i;
                      if (p > totalPages) return null;
                      return (
                        <button 
                          key={p}
                          onClick={() => fetchHistory(p)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                            p === page 
                              ? 'bg-brand-blue text-white shadow-sm' 
                              : 'text-slate-400 hover:text-brand-blue border border-transparent hover:border-brand-blue/20'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button 
                      onClick={() => fetchHistory(page + 1)} 
                      disabled={page >= totalPages}
                      className="w-8 h-8 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

      </div>
    </div>
  );
};

// ─── HELPER COMPONENTS ──────────────────────────────

const StatCard = ({ label, value, unit, icon, color }: { label: string; value: string; unit: string; icon: React.ReactNode; color: string }) => (
  <div className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl group hover:border-black/[0.08] dark:hover:border-white/[0.08] transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}12`, color }}>
        {icon}
      </div>
    </div>
    <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">{value}</span>
      <span className="text-[10px] font-bold" style={{ color }}>{unit}</span>
    </div>
  </div>
);

export default CreditUsagePage;