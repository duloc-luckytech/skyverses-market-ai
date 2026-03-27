
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Copy, Check, Sparkles, Zap, Gift,
  ArrowRight, Users, TrendingUp,
  Share2, ExternalLink, Coins, Shield,
  Crown, Percent, Clock, ChevronRight,
  Star, Rocket, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { API_BASE_URL, getHeaders } from '../apis/config';

/* ───── API ───── */
const referralApi = {
  getStats: async (): Promise<{
    success: boolean;
    data: {
      totalInvited: number;
      totalEarned: number;
      pendingRewards: number;
      history: Array<{ name: string; avatar?: string; date: string; credits: number; status: string }>;
    };
  }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/referral-stats`, { method: 'GET', headers: getHeaders() });
      if (!res.ok) return { success: false, data: { totalInvited: 0, totalEarned: 0, pendingRewards: 0, history: [] } };
      return await res.json();
    } catch {
      return { success: false, data: { totalInvited: 0, totalEarned: 0, pendingRewards: 0, history: [] } };
    }
  },
};

/* ───── Component ───── */
const ReferralPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  usePageMeta({
    title: 'Referral Program | Skyverses',
    description: 'Giới thiệu bạn bè đến Skyverses và nhận thưởng Credits miễn phí.',
    canonical: '/referral'
  });

  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalInvited: 0, totalEarned: 0, pendingRewards: 0, history: [] as any[] });
  const [loadingStats, setLoadingStats] = useState(false);

  const referralCode = user?.inviteCode || '';
  const referralLink = `https://market.skyverses.io/login?ref=${referralCode}`;

  // Fetch stats
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingStats(true);
      referralApi.getStats().then(res => {
        if (res.success) setStats(res.data);
      }).finally(() => setLoadingStats(false));
    }
  }, [isAuthenticated]);

  const handleCopy = () => {
    if (!isAuthenticated) { login(); return; }
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Đã sao chép link giới thiệu!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    if (!isAuthenticated) { login(); return; }
    navigator.clipboard.writeText(referralCode);
    showToast('Đã sao chép mã giới thiệu!', 'success');
  };

  const handleShare = async () => {
    if (!isAuthenticated) { login(); return; }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Skyverses - AI Creative Studio',
          text: `Tham gia Skyverses và nhận Credits miễn phí! Dùng mã giới thiệu: ${referralCode}`,
          url: referralLink,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  const statCards = [
    { label: 'Đã mời', value: stats.totalInvited, icon: <Users size={20} />, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
    { label: 'Đã nhận', value: `${stats.totalEarned.toLocaleString()} CR`, icon: <Coins size={20} />, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
    { label: 'Chờ duyệt', value: stats.pendingRewards, icon: <Clock size={20} />, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#030304] text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden pt-28 md:pt-32 pb-32">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[900px] h-[900px] bg-brand-blue/5 dark:bg-brand-blue/8 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-10 relative z-10 space-y-16">

        {/* ═══════════════════════════════ */}
        {/* HERO */}
        {/* ═══════════════════════════════ */}
        <section className="text-center space-y-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/8 border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-widest">
            <Sparkles size={12} fill="currentColor" /> Referral Program
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Mời bạn bè, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">nhận thưởng Credits</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Chia sẻ link giới thiệu — khi bạn bè đăng ký thành công, cả hai cùng nhận Credits miễn phí để sáng tạo với AI.
          </motion.p>

          {/* ─── REFERRAL LINK BOX ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-1.5 gap-1.5 shadow-xl shadow-brand-blue/5 focus-within:border-brand-blue/30 transition-all">
              <div className="flex-grow flex items-center px-4 py-3 sm:py-0 min-w-0 overflow-hidden">
                {isAuthenticated ? (
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-300 truncate select-all">{referralLink}</span>
                ) : (
                  <span className="text-sm text-slate-400 italic">Đăng nhập để nhận link giới thiệu</span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all shrink-0 ${copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-brand-blue to-purple-500 text-white hover:brightness-110 hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-blue/20'
                  }`}
              >
                {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                {copied ? 'Đã sao chép' : 'Sao chép link'}
              </button>
            </div>

            {/* Code + Share */}
            <div className="flex items-center justify-center gap-4 mt-5">
              {isAuthenticated && (
                <button onClick={handleCopyCode}
                  className="flex items-center gap-2 px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
                  <span className="font-mono text-brand-blue">{referralCode}</span>
                  <Copy size={11} />
                </button>
              )}
              <button onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
                <Share2 size={12} /> Chia sẻ
              </button>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════ */}
        {/* STATS */}
        {/* ═══════════════════════════════ */}
        {isAuthenticated && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="relative bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-6 hover:shadow-lg hover:border-brand-blue/15 transition-all duration-500 group overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-y-6 translate-x-6`} />
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${card.color}`}>{card.icon}</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{loadingStats ? '—' : card.value}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{card.label}</p>
                </div>
              </div>
            ))}
          </motion.section>
        )}

        {/* ═══════════════════════════════ */}
        {/* COMING SOON — 5% COMMISSION */}
        {/* ═══════════════════════════════ */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#0c0e18] via-[#0e1225] to-[#120c20] text-white rounded-3xl p-8 md:p-12 border border-white/[0.06]">
          {/* Glow effects */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-grow space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/25 rounded-full">
                  <Rocket size={12} className="text-amber-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Coming Soon</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <Lock size={10} className="text-white/40" />
                  <span className="text-[9px] font-medium uppercase tracking-widest text-white/40">Q2 2026</span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                Nhận <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">5% hoa hồng</span> khi bạn bè nạp Credits
              </h2>

              <p className="text-sm text-white/50 max-w-lg leading-relaxed">
                Chương trình hoa hồng vĩnh viễn — mỗi khi bạn bè bạn giới thiệu nạp thêm Credits,
                bạn tự động nhận <strong className="text-white/70">5% giá trị</strong> vào tài khoản.
                Không giới hạn số lần và số người.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { icon: <Percent size={12} />, text: '5% mỗi giao dịch nạp' },
                  { icon: <TrendingUp size={12} />, text: 'Thu nhập thụ động vĩnh viễn' },
                  { icon: <Users size={12} />, text: 'Không giới hạn referral' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/[0.06] rounded-lg">
                    <span className="text-amber-400">{item.icon}</span>
                    <span className="text-[10px] font-medium text-white/60">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="shrink-0 hidden lg:flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center relative">
                <Crown size={48} className="text-amber-400" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-[11px] font-black text-white">5%</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Commission</span>
            </div>
          </div>

          {/* Example calculation */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/[0.06]">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Ví dụ minh họa</p>
            <div className="flex flex-wrap gap-3 md:gap-6 items-center">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl border border-white/[0.06]">
                <Users size={14} className="text-brand-blue" />
                <span className="text-sm font-medium text-white/70">10 bạn bè</span>
              </div>
              <ArrowRight size={14} className="text-white/20 hidden md:block" />
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl border border-white/[0.06]">
                <Coins size={14} className="text-amber-400" />
                <span className="text-sm font-medium text-white/70">Mỗi người nạp 100,000 CR</span>
              </div>
              <ArrowRight size={14} className="text-white/20 hidden md:block" />
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Zap size={14} className="text-amber-400" fill="currentColor" />
                <span className="text-sm font-bold text-amber-400">Bạn nhận 50,000 CR</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════ */}
        {/* HOW IT WORKS */}
        {/* ═══════════════════════════════ */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cách hoạt động</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">3 bước đơn giản để bắt đầu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '01', emoji: '📩', title: 'Chia sẻ link', desc: 'Sao chép link giới thiệu và gửi cho bạn bè qua tin nhắn, mạng xã hội.' },
              { step: '02', emoji: '✨', title: 'Bạn bè đăng ký', desc: 'Bạn bè click link, đăng ký tài khoản Skyverses và xác thực thành công.' },
              { step: '03', emoji: '🎁', title: 'Nhận thưởng', desc: 'Cả hai tự động nhận Credits miễn phí vào tài khoản. Bắt đầu sáng tạo!' },
            ].map((item, i) => (
              <div key={i} className="relative bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-7 hover:shadow-lg hover:border-brand-blue/15 transition-all duration-500 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/8 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    {item.emoji}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest">{item.step}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-600">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════ */}
        {/* BENEFITS */}
        {/* ═══════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* YOU GET */}
          <div className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-8 space-y-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Zap size={20} fill="currentColor" />
              </div>
              <h3 className="text-lg font-bold">Bạn nhận được</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: <Coins size={16} />, title: 'Credits miễn phí', desc: 'Nhận Credits cho mỗi người bạn đăng ký thành công.' },
                { icon: <Star size={16} />, title: 'Đặc quyền Creator', desc: 'Mở khóa badge "Referrer" và ưu tiên trải nghiệm tính năng mới.' },
                { icon: <TrendingUp size={16} />, title: 'Hoa hồng 5% (sắp ra mắt)', desc: 'Nhận 5% mỗi khi bạn bè nạp Credits — thu nhập thụ động.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/8 flex items-center justify-center text-brand-blue shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{item.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FRIEND GETS */}
          <div className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-8 space-y-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Gift size={20} />
              </div>
              <h3 className="text-lg font-bold">Bạn bè nhận được</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: <Gift size={16} />, title: 'Welcome Credits', desc: 'Nhận Credits chào mừng để bắt đầu trải nghiệm nền tảng.' },
                { icon: <Sparkles size={16} />, title: '30+ công cụ AI', desc: 'Truy cập toàn bộ hệ sinh thái AI: Hình ảnh, Video, Nhạc, Giọng nói.' },
                { icon: <Shield size={16} />, title: 'Hỗ trợ ưu tiên', desc: 'Được hỗ trợ kỹ thuật ưu tiên từ đội ngũ Skyverses.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/8 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{item.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════ */}
        {/* REFERRAL HISTORY */}
        {/* ═══════════════════════════════ */}
        {isAuthenticated && stats.history.length > 0 && (
          <section className="space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users size={18} className="text-brand-blue" />
              Lịch sử giới thiệu
            </h3>
            <div className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl overflow-hidden">
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {stats.history.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-bold">
                        {item.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.name || 'Người dùng'}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(item.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${item.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                        }`}>
                        {item.status === 'completed' ? 'Hoàn tất' : 'Chờ'}
                      </span>
                      <span className="text-sm font-semibold text-brand-blue">+{item.credits} CR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════ */}
        {/* NOTES */}
        {/* ═══════════════════════════════ */}
        <section className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Shield size={14} className="text-brand-blue" /> Lưu ý
          </h3>
          <div className="grid gap-3">
            {[
              'Credits thưởng áp dụng cho tất cả công cụ trên nền tảng (Tạo ảnh, Video, Upscale, Voice...).',
              'Chương trình áp dụng cho người bạn lần đầu đăng ký và xác thực tài khoản tại Skyverses.',
              'Hoa hồng 5% sẽ được kích hoạt trong giai đoạn Q2 2026. Thông báo sẽ được gửi qua email.',
              'Skyverses có quyền điều chỉnh chính sách chương trình với thông báo trước.',
            ].map((note, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1 h-1 rounded-full bg-brand-blue mt-2 shrink-0" />
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════ */}
        {/* CTA */}
        {/* ═══════════════════════════════ */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Sẵn sàng chia sẻ?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={handleCopy}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-blue to-purple-500 text-white rounded-xl text-[11px] font-semibold uppercase tracking-wider shadow-lg shadow-brand-blue/15 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all">
              <Copy size={14} /> Sao chép link
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-2 px-8 py-3.5 border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all">
              <Share2 size={14} /> Chia sẻ
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ReferralPage;