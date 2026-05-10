
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Coins, Wallet, ArrowDownToLine, ArrowUpFromLine,
  Loader2, ChevronLeft, ChevronRight, XCircle,
  Sparkles, Clock, CheckCircle, AlertCircle, Ban,
  Star, History, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { skytokenApi } from '../apis/skytoken';
import SkyTokenPurchaseModal from '../components/skytoken/SkyTokenPurchaseModal';
import type { SkyTokenPackage, SkyTokenTransaction, SkyTokenWithdrawal } from '../types';

const CARD = 'bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl';
const SKT_PER_VND = 1000; // 1 SKT = 1,000 VND
const MIN_WITHDRAW = 50;

const txTypeConfig: Record<string, { label: string; color: string; sign: string }> = {
  TOP_UP:   { label: 'Nạp',       color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', sign: '+' },
  CONSUME:  { label: 'Sử dụng',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',               sign: '-' },
  EARN:     { label: 'Kiếm được', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',           sign: '+' },
  BONUS:    { label: 'Thưởng',    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',   sign: '+' },
  REFUND:   { label: 'Hoàn tiền', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',   sign: '+' },
  WELCOME:  { label: 'Chào mừng', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',           sign: '+' },
  WITHDRAW: { label: 'Rút',       color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',           sign: '-' },
};

const withdrawStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Đang chờ',    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-3.5 h-3.5" /> },
  approved:  { label: 'Đã duyệt',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',         icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected:  { label: 'Từ chối',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',             icon: <AlertCircle className="w-3.5 h-3.5" /> },
  completed: { label: 'Hoàn tất',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const SkyTokenPage: React.FC = () => {
  const { skyTokenBalance, refreshSkyTokenBalance, refreshUserInfo, isAuthenticated, login } = useAuth();
  const { t } = useLanguage();

  // Packages
  const [packages, setPackages] = useState<SkyTokenPackage[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<SkyTokenPackage | null>(null);

  // Withdrawal form
  const [wForm, setWForm] = useState({ amountSKT: '', bankName: '', bankAccountNumber: '', bankAccountName: '' });
  const [wSubmitting, setWSubmitting] = useState(false);
  const [wMsg, setWMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Withdrawals list
  const [withdrawals, setWithdrawals] = useState<SkyTokenWithdrawal[]>([]);
  const [wLoading, setWLoading] = useState(false);

  // Transaction history
  const [transactions, setTransactions] = useState<SkyTokenTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const txLimit = 15;

  // Fetch packages
  useEffect(() => {
    (async () => {
      setLoadingPkgs(true);
      try {
        const res = await skytokenApi.getPackages();
        if (res.data) {
          setPackages(res.data.filter(p => p.active).sort((a, b) => a.sortOrder - b.sortOrder));
        }
      } catch (e) {
        console.error('Fetch packages error:', e);
      }
      setLoadingPkgs(false);
    })();
  }, []);

  // Fetch withdrawals
  const loadWithdrawals = useCallback(async () => {
    if (!isAuthenticated) return;
    setWLoading(true);
    try {
      const res = await skytokenApi.getMyWithdrawals(1, 50);
      setWithdrawals(res.data || []);
    } catch (e) {
      console.error('Fetch withdrawals error:', e);
    }
    setWLoading(false);
  }, [isAuthenticated]);

  // Fetch transactions
  const loadTransactions = useCallback(async (page: number) => {
    if (!isAuthenticated) return;
    setTxLoading(true);
    try {
      const res = await skytokenApi.getHistory(page, txLimit);
      setTransactions(res.data || []);
      setTxTotal(res.pagination?.total || 0);
    } catch (e) {
      console.error('Fetch history error:', e);
    }
    setTxLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWithdrawals();
      loadTransactions(1);
    }
  }, [isAuthenticated, loadWithdrawals, loadTransactions]);

  useEffect(() => {
    if (isAuthenticated) loadTransactions(txPage);
  }, [txPage, isAuthenticated, loadTransactions]);

  // Withdrawal submit
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWMsg(null);
    const amountSKT = Number(wForm.amountSKT);
    if (!amountSKT || amountSKT < MIN_WITHDRAW) {
      setWMsg({ type: 'error', text: `Tối thiểu ${MIN_WITHDRAW} SKT` });
      return;
    }
    if (amountSKT > (skyTokenBalance || 0)) {
      setWMsg({ type: 'error', text: 'Số dư không đủ' });
      return;
    }
    if (!wForm.bankName.trim() || !wForm.bankAccountNumber.trim() || !wForm.bankAccountName.trim()) {
      setWMsg({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin ngân hàng' });
      return;
    }
    setWSubmitting(true);
    try {
      const res = await skytokenApi.withdrawRequest({
        amountSKT,
        bankName: wForm.bankName.trim(),
        bankAccountNumber: wForm.bankAccountNumber.trim(),
        bankAccountName: wForm.bankAccountName.trim(),
      });
      if (res.success) {
        setWMsg({ type: 'success', text: 'Yêu cầu rút tiền đã được gửi!' });
        setWForm({ amountSKT: '', bankName: '', bankAccountNumber: '', bankAccountName: '' });
        refreshSkyTokenBalance();
        loadWithdrawals();
      } else {
        setWMsg({ type: 'error', text: res.message || 'Có lỗi xảy ra' });
      }
    } catch {
      setWMsg({ type: 'error', text: 'Lỗi kết nối' });
    }
    setWSubmitting(false);
  };

  // Cancel withdrawal
  const handleCancelWithdrawal = async (id: string) => {
    try {
      const res = await skytokenApi.cancelWithdrawal(id);
      if (res.success) {
        refreshSkyTokenBalance();
        loadWithdrawals();
      }
    } catch (e) {
      console.error('Cancel withdrawal error:', e);
    }
  };

  // Purchase success
  const handlePurchaseSuccess = () => {
    refreshSkyTokenBalance();
    refreshUserInfo();
    setSelectedPkg(null);
    loadTransactions(1);
  };

  const totalTxPages = Math.ceil(txTotal / txLimit);

  return (
    <div className="min-h-screen bg-[var(--atlas-bg-page)] text-[var(--atlas-text-primary)] pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-[var(--atlas-text-secondary)] mb-4">
            SKYTOKEN WALLET
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold atlas-text-gradient mb-4">
            Ví SkyToken
          </h1>
          <p className="text-lg text-[var(--atlas-text-secondary)] max-w-2xl mx-auto">
            Nạp, quản lý và rút SkyToken — đồng tiền của Prompt Marketplace
          </p>
        </motion.div>

        {/* ── Balance Card ── */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${CARD} p-6 md:p-8 mb-16`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm text-[var(--atlas-text-secondary)]">Số dư hiện tại</p>
                  <p className="text-3xl md:text-4xl font-bold">
                    {(skyTokenBalance || 0).toLocaleString('vi-VN')} <span className="text-lg text-brand-blue font-semibold">SKT</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Nạp SKT
                </button>
                <button
                  onClick={() => document.getElementById('withdraw-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-5 py-2.5 border border-brand-blue text-brand-blue rounded-xl font-medium hover:bg-brand-blue/5 transition-colors"
                >
                  <ArrowUpFromLine className="w-4 h-4" />
                  Rút SKT
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Packages Section ── */}
        <motion.section
          id="packages-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Gói nạp SkyToken</h2>
            <p className="text-[var(--atlas-text-secondary)]">Chọn gói phù hợp để nạp SKT vào ví</p>
          </div>

          {loadingPkgs ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  className={`${CARD} p-6 relative overflow-hidden hover:border-brand-blue/30 transition-colors cursor-pointer group`}
                  onClick={() => {
                    if (!isAuthenticated) { login(); return; }
                    setSelectedPkg(pkg);
                  }}
                >
                  {pkg.popular && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-blue text-white text-[10px] font-bold uppercase rounded-full">
                        <Star className="w-3 h-3" /> Phổ biến
                      </span>
                    </div>
                  )}
                  {pkg.badge && !pkg.popular && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase rounded-full">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-1">{pkg.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-brand-blue">{pkg.tokens.toLocaleString('vi-VN')}</span>
                      <span className="text-sm text-[var(--atlas-text-secondary)]">SKT</span>
                    </div>
                  </div>

                  {pkg.bonusTokens > 0 && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{pkg.bonusTokens.toLocaleString('vi-VN')} bonus ({pkg.bonusPercent}%)
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">{pkg.price.toLocaleString('vi-VN')}₫</span>
                      <span className="text-xs text-[var(--atlas-text-secondary)] group-hover:text-brand-blue transition-colors">
                        Mua ngay →
                      </span>
                    </div>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <p className="text-xs text-[var(--atlas-text-secondary)] line-through mt-1">
                        {pkg.originalPrice.toLocaleString('vi-VN')}₫
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Withdrawal Section ── */}
        {isAuthenticated && (
          <motion.section
            id="withdraw-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-20"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Rút SkyToken</h2>
              <p className="text-[var(--atlas-text-secondary)]">Chuyển SKT thành VND về tài khoản ngân hàng</p>
            </div>

            <div className={`${CARD} p-6 md:p-8 max-w-2xl mx-auto`}>
              <form onSubmit={handleWithdraw} className="space-y-5">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Số lượng SKT</label>
                  <input
                    type="number"
                    min={MIN_WITHDRAW}
                    value={wForm.amountSKT}
                    onChange={e => setWForm(f => ({ ...f, amountSKT: e.target.value }))}
                    placeholder={`Tối thiểu ${MIN_WITHDRAW} SKT`}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-transparent focus:outline-none focus:border-brand-blue transition-colors"
                  />
                  {Number(wForm.amountSKT) > 0 && (
                    <p className="text-sm text-[var(--atlas-text-secondary)] mt-1.5">
                      {Number(wForm.amountSKT).toLocaleString('vi-VN')} SKT × {SKT_PER_VND.toLocaleString('vi-VN')} = <span className="font-semibold text-[var(--atlas-text-primary)]">{(Number(wForm.amountSKT) * SKT_PER_VND).toLocaleString('vi-VN')} VND</span>
                    </p>
                  )}
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tên ngân hàng</label>
                  <input
                    type="text"
                    value={wForm.bankName}
                    onChange={e => setWForm(f => ({ ...f, bankName: e.target.value }))}
                    placeholder="VD: Vietcombank, MB Bank..."
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-transparent focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Số tài khoản</label>
                  <input
                    type="text"
                    value={wForm.bankAccountNumber}
                    onChange={e => setWForm(f => ({ ...f, bankAccountNumber: e.target.value }))}
                    placeholder="Nhập số tài khoản"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-transparent focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    value={wForm.bankAccountName}
                    onChange={e => setWForm(f => ({ ...f, bankAccountName: e.target.value }))}
                    placeholder="Nhập tên chủ tài khoản (viết hoa)"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-transparent focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>

                {/* Message */}
                {wMsg && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                    wMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {wMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {wMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={wSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {wSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-4 h-4" />}
                  {wSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu rút'}
                </button>
              </form>
            </div>
          </motion.section>
        )}

        {/* ── My Withdrawals ── */}
        {isAuthenticated && withdrawals.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mb-20"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-blue" />
              Yêu cầu rút tiền
            </h2>

            <div className={`${CARD} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                      <th className="text-left px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Ngày</th>
                      <th className="text-right px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">SKT</th>
                      <th className="text-right px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">VND</th>
                      <th className="text-left px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Ngân hàng</th>
                      <th className="text-center px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Trạng thái</th>
                      <th className="text-center px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map(w => {
                      const sc = withdrawStatusConfig[w.status] || withdrawStatusConfig.pending;
                      return (
                        <tr key={w._id} className="border-b border-black/[0.02] dark:border-white/[0.02] last:border-0">
                          <td className="px-5 py-3 whitespace-nowrap">{formatDate(w.createdAt)}</td>
                          <td className="px-5 py-3 text-right font-medium">{w.amountSKT.toLocaleString('vi-VN')}</td>
                          <td className="px-5 py-3 text-right">{w.amountVND.toLocaleString('vi-VN')}₫</td>
                          <td className="px-5 py-3">
                            <div>{w.bankName}</div>
                            <div className="text-xs text-[var(--atlas-text-secondary)]">{w.bankAccountNumber}</div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            {w.status === 'pending' && (
                              <button
                                onClick={() => handleCancelWithdrawal(w._id)}
                                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Huỷ
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Transaction History ── */}
        {isAuthenticated && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-blue" />
              Lịch sử giao dịch
            </h2>

            <div className={`${CARD} overflow-hidden`}>
              {txLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-[var(--atlas-text-secondary)] py-12">Chưa có giao dịch nào</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <th className="text-left px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Ngày</th>
                          <th className="text-center px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Loại</th>
                          <th className="text-right px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Số lượng</th>
                          <th className="text-right px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Số dư sau</th>
                          <th className="text-left px-5 py-3 text-[var(--atlas-text-secondary)] font-medium">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(tx => {
                          const cfg = txTypeConfig[tx.type] || txTypeConfig.CONSUME;
                          return (
                            <tr key={tx._id} className="border-b border-black/[0.02] dark:border-white/[0.02] last:border-0">
                              <td className="px-5 py-3 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                              <td className="px-5 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td className={`px-5 py-3 text-right font-medium ${cfg.sign === '+' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {cfg.sign}{Math.abs(tx.amount).toLocaleString('vi-VN')}
                              </td>
                              <td className="px-5 py-3 text-right">{tx.balanceAfter.toLocaleString('vi-VN')}</td>
                              <td className="px-5 py-3 text-[var(--atlas-text-secondary)] max-w-[200px] truncate">{tx.note || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalTxPages > 1 && (
                    <div className="flex items-center justify-center gap-3 py-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <button
                        onClick={() => setTxPage(p => Math.max(1, p - 1))}
                        disabled={txPage === 1}
                        className="p-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-[var(--atlas-text-secondary)]">
                        Trang {txPage} / {totalTxPages}
                      </span>
                      <button
                        onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))}
                        disabled={txPage >= totalTxPages}
                        className="p-2 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.section>
        )}
      </div>

      {/* ── Purchase Modal ── */}
      {selectedPkg && (
        <SkyTokenPurchaseModal
          pkg={selectedPkg}
          onClose={() => setSelectedPkg(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default SkyTokenPage;
