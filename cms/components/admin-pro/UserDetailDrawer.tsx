
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Crown, Shield, Users as UsersIcon, Send, Loader2,
  RefreshCw, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
  Calendar, Mail, Phone, MapPin, Briefcase, CreditCard, Link2,
  Receipt, Award, Clock, Copy, Check, UserCog
} from 'lucide-react';
import { AuthUser, authApi } from '../../apis/auth';

type DrawerTab = 'overview' | 'plan' | 'credits' | 'referral' | 'info';

const TABS: { id: DrawerTab; label: string }[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'plan', label: 'Gói dịch vụ' },
  { id: 'credits', label: 'Credits' },
  { id: 'referral', label: 'Giới thiệu' },
  { id: 'info', label: 'Thông tin' },
];

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: '#ef4444', bg: '#ef444415' },
  master: { label: 'Master', color: '#f59e0b', bg: '#f59e0b15' },
  sub: { label: 'Sub Agent', color: '#8b5cf6', bg: '#8b5cf615' },
  user: { label: 'User', color: '#64748b', bg: '#64748b15' },
};

const PLAN_CONFIG: Record<string, { color: string; bg: string }> = {
  enterprise: { color: '#a855f7', bg: '#a855f715' },
  studio: { color: '#0090ff', bg: '#0090ff15' },
  creator: { color: '#10b981', bg: '#10b98115' },
  starter: { color: '#f59e0b', bg: '#f59e0b15' },
};

const TX_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TOP_UP: { label: 'Nạp', color: '#10b981', bg: '#10b98112' },
  CONSUME: { label: 'Dùng', color: '#ef4444', bg: '#ef444412' },
  REFUND: { label: 'Hoàn', color: '#f59e0b', bg: '#f59e0b12' },
  ADMIN_ADJUST: { label: 'Admin', color: '#8b5cf6', bg: '#8b5cf612' },
  BONUS: { label: 'Bonus', color: '#8b5cf6', bg: '#8b5cf612' },
  WELCOME: { label: 'Welcome', color: '#0090ff', bg: '#0090ff12' },
  DAILY: { label: 'Daily', color: '#06b6d4', bg: '#06b6d412' },
  REFERRAL: { label: 'Ref', color: '#ec4899', bg: '#ec489912' },
};

interface Props {
  user: AuthUser;
  onClose: () => void;
  onUserUpdated: (u: AuthUser) => void;
}

export const UserDetailDrawer: React.FC<Props> = ({ user, onClose, onUserUpdated }) => {
  const [tab, setTab] = useState<DrawerTab>('overview');
  const [copied, setCopied] = useState(false);

  // Credits
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Customer detail (revenue)
  const [customerDetail, setCustomerDetail] = useState<any>(null);

  // Purchase history
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Referral
  const [referrals, setReferrals] = useState<any[]>([]);
  const [refTotal, setRefTotal] = useState(0);
  const [refLoading, setRefLoading] = useState(false);

  // Role change
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    fetchCredits(1);
    fetchCustomerDetail();
  }, [user._id]);

  const fetchCredits = async (p: number) => {
    setTxLoading(true);
    try {
      const res = await authApi.getUserCreditHistory(user._id, p, 15);
      setTxHistory(res.data || []);
      setTxTotal(res.pagination?.total || 0);
      setTxPage(p);
    } catch (e) { console.error(e); }
    setTxLoading(false);
  };

  const fetchCustomerDetail = async () => {
    try {
      const res = await authApi.getCustomerDetail(user._id);
      if (res.success) setCustomerDetail(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchPurchaseHistory = async () => {
    setPurchaseLoading(true);
    try {
      const res = await authApi.getCustomerPurchaseHistory(user._id);
      if (res.success) setPurchaseHistory(res.data || []);
    } catch (e) { console.error(e); }
    setPurchaseLoading(false);
  };

  const fetchReferrals = async () => {
    setRefLoading(true);
    try {
      const res = await authApi.getInvitedUsers(user._id, 1, 50);
      if (res.success) { setReferrals(res.users || []); setRefTotal(res.total || 0); }
    } catch (e) { console.error(e); }
    setRefLoading(false);
  };

  // Lazy load tabs
  useEffect(() => {
    if (tab === 'plan' && purchaseHistory.length === 0) fetchPurchaseHistory();
    if (tab === 'referral' && referrals.length === 0) fetchReferrals();
  }, [tab]);

  const handleAdjust = async () => {
    if (!adjustAmount) return;
    setAdjusting(true);
    try {
      const amount = parseInt(adjustAmount);
      if (isNaN(amount)) return;
      const res = await authApi.adminAdjustCredits(user._id, amount, adjustNote || `Admin: ${amount > 0 ? '+' : ''}${amount}`);
      if (res.success) {
        fetchCredits(1);
        onUserUpdated({ ...user, creditBalance: res.creditBalance });
        setAdjustAmount(''); setAdjustNote('');
      }
    } catch (e) { console.error(e); }
    setAdjusting(false);
  };

  const handleRoleChange = async (newRole: string) => {
    setChangingRole(true);
    try {
      const res = await authApi.updateUserRole(user._id, newRole);
      if (res.success) onUserUpdated({ ...user, role: newRole });
    } catch (e) { console.error(e); }
    setChangingRole(false);
  };

  const copyText = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const planExpiry = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const daysLeft = planExpiry ? Math.ceil((planExpiry.getTime() - Date.now()) / 86400000) : null;
  const planCfg = PLAN_CONFIG[user.plan || ''] || { color: '#64748b', bg: '#64748b15' };
  const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
  const videoPercent = user.maxVideo ? Math.round((user.videoUsed || 0) / user.maxVideo * 100) : 0;

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-center justify-between py-2 border-b border-black/[0.02] dark:border-white/[0.02] last:border-0">
      <div className="flex items-center gap-2 text-slate-400"><span className="shrink-0">{icon}</span><span className="text-[10px] font-medium">{label}</span></div>
      <span className="text-[11px] font-semibold text-slate-700 dark:text-gray-300 text-right max-w-[200px] truncate">{value || '—'}</span>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-[#0a0a0e] border-l border-black/[0.06] dark:border-white/[0.06] shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name || user.email}&background=0090ff&color=fff&size=80`} className="w-11 h-11 rounded-xl border border-black/[0.04] dark:border-white/[0.06]" alt="" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name || 'Unnamed'}</p>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider" style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}>{roleCfg.label}</span>
              </div>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="shrink-0 px-6 pt-3 pb-0 flex gap-1 border-b border-black/[0.04] dark:border-white/[0.04] overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-[10px] font-bold rounded-t-lg transition-all whitespace-nowrap ${tab === t.id ? 'text-brand-blue border-b-2 border-brand-blue bg-brand-blue/5' : 'text-slate-400 hover:text-slate-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {/* ═══ OVERVIEW ═══ */}
          {tab === 'overview' && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-brand-blue uppercase tracking-wider mb-1">Credits</p>
                  <p className="text-xl font-black text-brand-blue tabular-nums">{(user.creditBalance || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl text-center border" style={{ backgroundColor: planCfg.bg, borderColor: planCfg.color + '20' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: planCfg.color }}>Gói hiện tại</p>
                  <p className="text-lg font-black uppercase" style={{ color: planCfg.color }}>{user.plan || 'Free'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Video Quota</p>
                  <p className="text-lg font-black text-slate-700 dark:text-gray-300 tabular-nums">{user.videoUsed || 0}<span className="text-xs text-slate-400">/{user.maxVideo || 0}</span></p>
                  {(user.maxVideo || 0) > 0 && <div className="mt-1.5 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${videoPercent}%` }} /></div>}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hoa hồng</p>
                  <p className="text-lg font-black text-emerald-500 tabular-nums">{((user.affiliateTotal || 0)).toLocaleString()}<span className="text-[9px] text-slate-400 ml-1">₫</span></p>
                </div>
              </div>
              {/* Plan expiry */}
              {planExpiry && (
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${daysLeft && daysLeft > 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                  <Clock size={14} className={daysLeft && daysLeft > 0 ? 'text-emerald-500' : 'text-red-500'} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-gray-300">Hết hạn: {planExpiry.toLocaleDateString('vi-VN')}</p>
                    <p className={`text-[9px] font-semibold ${daysLeft && daysLeft > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{daysLeft && daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã hết hạn'}</p>
                  </div>
                </div>
              )}
              {/* Revenue from customer detail */}
              {customerDetail && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">Tổng doanh thu</p>
                  <p className="text-xl font-black text-amber-600 tabular-nums">{(customerDetail.totalRevenue || 0).toLocaleString()}<span className="text-xs ml-1">₫</span></p>
                </div>
              )}
              {/* Quick info */}
              <div className="space-y-0">
                <InfoRow icon={<Calendar size={12} />} label="Ngày tham gia" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'} />
                <InfoRow icon={<Clock size={12} />} label="Hoạt động cuối" value={user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'} />
                <InfoRow icon={<Link2 size={12} />} label="Invite Code" value={<span className="flex items-center gap-1 cursor-pointer" onClick={() => copyText(user.inviteCode)}>{user.inviteCode} {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}</span>} />
                <InfoRow icon={<Mail size={12} />} label="Google Email" value={user.googleEmail || '—'} />
              </div>
            </div>
          )}

          {/* ═══ PLAN ═══ */}
          {tab === 'plan' && (
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl border" style={{ backgroundColor: planCfg.bg, borderColor: planCfg.color + '20' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: planCfg.color }}>Subscription Plan</p>
                    <p className="text-2xl font-black uppercase" style={{ color: planCfg.color }}>{user.plan || 'Free'}</p>
                  </div>
                  {planExpiry && <div className="text-right">
                    <p className="text-[10px] text-slate-500">Hết hạn</p>
                    <p className="text-sm font-bold" style={{ color: planCfg.color }}>{planExpiry.toLocaleDateString('vi-VN')}</p>
                    <p className={`text-[9px] font-semibold ${daysLeft && daysLeft > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{daysLeft && daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}</p>
                  </div>}
                </div>
                {(user.maxVideo || 0) > 0 && <div className="mt-3"><p className="text-[9px] text-slate-400 mb-1">Video: {user.videoUsed || 0}/{user.maxVideo}</p><div className="h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${videoPercent}%` }} /></div></div>}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lịch sử mua gói</p>
              {purchaseLoading ? <div className="py-8 text-center"><Loader2 className="w-5 h-5 text-brand-blue animate-spin mx-auto" /></div> : purchaseHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Chưa có lịch sử mua gói</p>
              ) : purchaseHistory.map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <div><p className="text-[11px] font-bold text-slate-700 dark:text-white">{h.plan}</p><p className="text-[9px] text-slate-400">{new Date(h.purchasedAt).toLocaleDateString('vi-VN')}</p></div>
                  <div className="text-right"><p className="text-sm font-black text-brand-blue tabular-nums">{(h.price || 0).toLocaleString()}₫</p><span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${h.status === 'Còn hạn' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{h.status}</span></div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ CREDITS ═══ */}
          {tab === 'credits' && (
            <div className="flex flex-col h-full">
              <div className="shrink-0 px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Điều chỉnh Credits</p>
                <div className="flex gap-2">
                  <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="+1000 hoặc -500" className="flex-grow bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-brand-blue/40" />
                  <input type="text" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="Ghi chú..." className="w-28 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-brand-blue/40" />
                  <button onClick={handleAdjust} disabled={!adjustAmount || adjusting} className="px-3 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5">
                    {adjusting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Gửi
                  </button>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto">
                <div className="px-6 py-2 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0a0a0e] z-10 border-b border-black/[0.02] dark:border-white/[0.02]">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Lịch sử giao dịch</p>
                  <button onClick={() => fetchCredits(txPage)} className="text-[10px] font-bold text-brand-blue flex items-center gap-1"><RefreshCw size={10} /> Làm mới</button>
                </div>
                {txLoading ? <div className="py-12 text-center"><Loader2 className="w-5 h-5 text-brand-blue animate-spin mx-auto" /></div> : txHistory.length === 0 ? (
                  <div className="py-12 text-center"><Receipt size={28} className="text-slate-200 dark:text-gray-700 mx-auto mb-2" /><p className="text-xs text-slate-400">Chưa có giao dịch</p></div>
                ) : (
                  <div className="divide-y divide-black/[0.02] dark:divide-white/[0.02]">
                    {txHistory.map((tx: any) => {
                      const isPos = tx.amount > 0;
                      const cfg = TX_TYPE_CONFIG[tx.type] || { label: tx.type, color: '#64748b', bg: '#64748b12' };
                      return (
                        <div key={tx._id} className="px-6 py-2.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                              {isPos ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}{cfg.label}
                            </span>
                            <div className="min-w-0"><p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{tx.note || tx.source || '—'}</p><p className="text-[9px] text-slate-300 dark:text-gray-600">{new Date(tx.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p></div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className={`text-xs font-black tabular-nums ${isPos ? 'text-emerald-500' : 'text-red-500'}`}>{isPos ? '+' : ''}{tx.amount.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-300 dark:text-gray-600 tabular-nums">{(tx.balanceAfter || 0).toLocaleString()} CR</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {txTotal > 15 && (
                  <div className="px-6 py-3 flex items-center justify-between border-t border-black/[0.03] dark:border-white/[0.03]">
                    <p className="text-[10px] text-slate-400">{txPage}/{Math.ceil(txTotal / 15)}</p>
                    <div className="flex gap-1.5">
                      <button disabled={txPage <= 1} onClick={() => fetchCredits(txPage - 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25"><ChevronLeft size={12} /></button>
                      <button disabled={txPage >= Math.ceil(txTotal / 15)} onClick={() => fetchCredits(txPage + 1)} className="w-7 h-7 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 disabled:opacity-25"><ChevronRight size={12} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ REFERRAL ═══ */}
          {tab === 'referral' && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-brand-blue uppercase tracking-wider mb-1">Invite Code</p>
                  <p className="text-sm font-black text-brand-blue cursor-pointer" onClick={() => copyText(user.inviteCode)}>{user.inviteCode}</p>
                </div>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Tổng hoa hồng</p>
                  <p className="text-sm font-black text-emerald-500 tabular-nums">{(user.affiliateTotal || 0).toLocaleString()}₫</p>
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1">Chờ thanh toán</p>
                  <p className="text-sm font-black text-amber-500 tabular-nums">{(user.affiliatePending || 0).toLocaleString()}₫</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Người được giới thiệu ({refTotal})</p>
              {refLoading ? <div className="py-8 text-center"><Loader2 className="w-5 h-5 text-brand-blue animate-spin mx-auto" /></div> : referrals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Chưa giới thiệu ai</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                  {referrals.map((r: any) => (
                    <div key={r._id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                      <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold shrink-0">{r.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className="flex-1 min-w-0"><p className="text-[11px] font-semibold text-slate-700 dark:text-white truncate">{r.name || r.email}</p><p className="text-[9px] text-slate-400">{r.plan || 'Free'} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ INFO ═══ */}
          {tab === 'info' && (
            <div className="p-6 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông tin cá nhân</p>
              <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04] px-4">
                <InfoRow icon={<UsersIcon size={12} />} label="Họ tên" value={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '—'} />
                <InfoRow icon={<Phone size={12} />} label="Điện thoại" value={user.phone || '—'} />
                <InfoRow icon={<MapPin size={12} />} label="Tỉnh/Thành" value={user.province || '—'} />
                <InfoRow icon={<Calendar size={12} />} label="Giới tính" value={user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : user.gender || '—'} />
                <InfoRow icon={<Calendar size={12} />} label="Năm sinh" value={user.birthYear?.toString() || '—'} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nghề nghiệp</p>
              <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04] px-4">
                <InfoRow icon={<Briefcase size={12} />} label="Chuyên môn" value={user.specialty || '—'} />
                <InfoRow icon={<Award size={12} />} label="Kinh nghiệm" value={user.experienceYears ? `${user.experienceYears} năm` : '—'} />
                <InfoRow icon={<Briefcase size={12} />} label="Mô tả" value={user.careerDescription || '—'} />
              </div>
              {user.onboarding?.completedAt && (<>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Onboarding</p>
                <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04] px-4">
                  <InfoRow icon={<UserCog size={12} />} label="Role" value={user.onboarding.role || '—'} />
                  <InfoRow icon={<Briefcase size={12} />} label="Experience" value={user.onboarding.experienceLevel || '—'} />
                  <InfoRow icon={<UsersIcon size={12} />} label="Work Style" value={user.onboarding.workStyle || '—'} />
                  <InfoRow icon={<Award size={12} />} label="Goals" value={user.onboarding.goals?.join(', ') || '—'} />
                </div>
              </>)}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngân hàng</p>
              <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04] px-4">
                <InfoRow icon={<CreditCard size={12} />} label="Ngân hàng" value={user.bankName || '—'} />
                <InfoRow icon={<CreditCard size={12} />} label="Chủ TK" value={user.bankAccountName || '—'} />
                <InfoRow icon={<CreditCard size={12} />} label="Số TK" value={user.bankNumber || '—'} />
              </div>
              {/* Role Management */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quản lý Role</p>
              <div className="flex gap-2 flex-wrap">
                {['user', 'sub', 'master'].map(r => (
                  <button key={r} disabled={user.role === r || changingRole} onClick={() => handleRoleChange(r)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${user.role === r ? 'opacity-50 cursor-default' : 'hover:brightness-110 cursor-pointer'}`}
                    style={{ backgroundColor: ROLE_CONFIG[r].bg, color: ROLE_CONFIG[r].color, borderColor: ROLE_CONFIG[r].color + '30' }}>
                    {changingRole ? <Loader2 size={10} className="animate-spin inline mr-1" /> : null}{ROLE_CONFIG[r].label}
                  </button>
                ))}
              </div>
              {/* Owned Tools */}
              {user.ownedTools && user.ownedTools.length > 0 && (<>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Công cụ sở hữu</p>
                <div className="flex gap-1.5 flex-wrap">{user.ownedTools.map(t => <span key={t} className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded-lg">{t}</span>)}</div>
              </>)}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};
