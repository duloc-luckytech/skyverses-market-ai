
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Sparkles, ArrowRight, Check, X, Loader2, Star,
  Shield, Globe2, ChevronDown, CreditCard, RefreshCw,
  Video, ImageIcon, Music, Mic, Wand2, Crown, Cpu,
  Gift, Infinity, Flame, TrendingUp, Lock, Clock, Receipt,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { creditsApi, CreditPackage, CreditTransaction } from '../apis/credits';
import CreditPurchaseModal from '../components/CreditPurchaseModal';

const USD_TO_VND = 26000;
const formatVND = (usd: number) => Math.round(usd * USD_TO_VND).toLocaleString('vi-VN');

const CreditsPage = () => {
  const { t } = useLanguage();
  const { credits, isAuthenticated, login } = useAuth();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPackForModal, setSelectedPackForModal] = useState<CreditPackage | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredPack, setHoveredPack] = useState<string | null>(null);
  
  // Credit History
  const [showHistory, setShowHistory] = useState(false);
  const [txHistory, setTxHistory] = useState<CreditTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const HISTORY_LIMIT = 15;

  useEffect(() => {
    const fetchPacks = async () => {
      setLoading(true);
      try {
        const res = await creditsApi.getAdminPackages();
        if (res.data) {
          setPackages(res.data.filter(p => p.active).sort((a, b) => a.sortOrder - b.sortOrder));
        }
      } catch (error) {
        console.error("Fetch Packs Error:", error);
      }
      setLoading(false);
    };
    fetchPacks();
  }, []);

  const fetchHistory = async (page: number = 1) => {
    setHistoryLoading(true);
    try {
      const res = await creditsApi.getHistory(page, HISTORY_LIMIT);
      setTxHistory(res.data || []);
      setHistoryTotal(res.pagination?.total || 0);
      setHistoryPage(page);
    } catch (e) { console.error(e); }
    setHistoryLoading(false);
  };

  useEffect(() => {
    if (showHistory && isAuthenticated) fetchHistory(1);
  }, [showHistory, isAuthenticated]);

  const handleUpgradeClick = (pack: CreditPackage) => {
    if (!isAuthenticated) {
      login();
    } else {
      setSelectedPackForModal(pack);
      setIsPurchaseModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsPurchaseModalOpen(false);
    setSelectedPackForModal(null);
  };

  const getTotal = (pack: CreditPackage) => {
    return pack.totalCredits || (pack.credits + Math.floor(pack.credits * (pack.bonusPercent || 0) / 100) + (pack.bonusCredits || 0));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#030305] text-black dark:text-white pt-24 pb-32 transition-colors duration-500 overflow-x-hidden selection:bg-brand-blue/30">
      
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-30%] left-[50%] -translate-x-1/2 w-[1400px] h-[700px] bg-gradient-to-b from-brand-blue/[0.03] to-transparent dark:from-brand-blue/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-tl from-violet-500/[0.02] to-transparent dark:from-violet-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/[0.02] to-transparent dark:from-emerald-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* ════════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-full mb-8 shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-brand-blue/15 flex items-center justify-center">
              <Zap size={10} className="text-brand-blue" fill="currentColor" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-gray-400">Universal Credits System</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-[-0.03em] leading-[1.08] mb-6">
            Một loại Credit,{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-violet-500 to-fuchsia-500">
                vô hạn sáng tạo
              </span>
              <motion.div 
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-brand-blue via-violet-500 to-fuchsia-500 opacity-30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-400 dark:text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Không subscription, không lock-in. Mua Credits theo nhu cầu và sử dụng cho hơn 30 công cụ AI — Video, Image, Voice, Music và hơn thế nữa.
          </p>

          {/* Balance Card */}
          {isAuthenticated && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-sm backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-violet-500/20 flex items-center justify-center">
                <Sparkles size={18} className="text-brand-blue" fill="currentColor" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Số dư hiện tại</p>
                <p className="text-xl font-black text-brand-blue">{(credits || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">credits</span></p>
              </div>
            </motion.div>
          )}

          {/* Toggle History Button */}
          {isAuthenticated && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowHistory(!showHistory)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.03] hover:border-brand-blue/30 hover:text-brand-blue transition-all"
            >
              <Receipt size={14} />
              {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử giao dịch'}
            </motion.button>
          )}

          {/* Credit History Section */}
          <AnimatePresence>
            {showHistory && isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden w-full max-w-4xl mx-auto mt-8"
              >
                <div className="bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                        <Clock size={14} className="text-brand-blue" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử giao dịch</h3>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500">{historyTotal} giao dịch</p>
                      </div>
                    </div>
                    <button onClick={() => fetchHistory(historyPage)} className="text-[10px] font-bold text-brand-blue hover:underline flex items-center gap-1">
                      <RefreshCw size={10} /> Làm mới
                    </button>
                  </div>

                  {/* Table */}
                  {historyLoading ? (
                    <div className="py-16 flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Đang tải...</p>
                    </div>
                  ) : txHistory.length === 0 ? (
                    <div className="py-16 text-center">
                      <Receipt size={32} className="text-slate-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 dark:text-gray-500">Chưa có giao dịch nào</p>
                    </div>
                  ) : (
                    <>
                      {/* Table header */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600 border-b border-black/[0.03] dark:border-white/[0.03]">
                        <div className="col-span-2">Loại</div>
                        <div className="col-span-2 text-right">Số lượng</div>
                        <div className="col-span-2 text-right">Số dư</div>
                        <div className="col-span-3">Ghi chú</div>
                        <div className="col-span-3 text-right">Thời gian</div>
                      </div>

                      {/* Rows */}
                      {txHistory.map((tx) => {
                        const isPositive = tx.amount > 0;
                        const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
                          'TOP_UP': { label: 'Nạp tiền', color: '#10b981', bg: '#10b98112' },
                          'CONSUME': { label: 'Sử dụng', color: '#ef4444', bg: '#ef444412' },
                          'REFUND': { label: 'Hoàn trả', color: '#f59e0b', bg: '#f59e0b12' },
                          'ADMIN_ADJUST': { label: 'Điều chỉnh', color: '#8b5cf6', bg: '#8b5cf612' },
                          'WELCOME': { label: 'Welcome', color: '#0090ff', bg: '#0090ff12' },
                          'DAILY': { label: 'Daily', color: '#06b6d4', bg: '#06b6d412' },
                          'REFERRAL': { label: 'Giới thiệu', color: '#ec4899', bg: '#ec489912' },
                        };
                        const cfg = typeConfig[tx.type] || { label: tx.type, color: '#64748b', bg: '#64748b12' };
                        const date = new Date(tx.createdAt);

                        return (
                          <div key={tx._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-3.5 border-b border-black/[0.02] dark:border-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors items-center">
                            {/* Type badge */}
                            <div className="col-span-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                                {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {cfg.label}
                              </span>
                            </div>
                            {/* Amount */}
                            <div className="col-span-2 text-right">
                              <span className={`text-sm font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-400 ml-1">CR</span>
                            </div>
                            {/* Balance after */}
                            <div className="col-span-2 text-right">
                              <span className="text-xs font-bold text-slate-500 dark:text-gray-400">{(tx.balanceAfter || 0).toLocaleString()}</span>
                              <span className="text-[9px] text-slate-300 dark:text-gray-600 ml-1">CR</span>
                            </div>
                            {/* Note */}
                            <div className="col-span-3">
                              <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate" title={tx.note || tx.source}>
                                {tx.note || tx.source || '—'}
                              </p>
                            </div>
                            {/* Time */}
                            <div className="col-span-3 text-right">
                              <p className="text-[11px] text-slate-400 dark:text-gray-500">
                                {date.toLocaleDateString('vi-VN')} · {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pagination */}
                      {historyTotal > HISTORY_LIMIT && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-black/[0.03] dark:border-white/[0.03]">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500">
                            Trang {historyPage} / {Math.ceil(historyTotal / HISTORY_LIMIT)}
                          </p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => fetchHistory(historyPage - 1)} 
                              disabled={historyPage <= 1}
                              className="w-8 h-8 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button 
                              onClick={() => fetchHistory(historyPage + 1)} 
                              disabled={historyPage >= Math.ceil(historyTotal / HISTORY_LIMIT)}
                              className="w-8 h-8 rounded-lg border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRightIcon size={14} />
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

        {/* ════════════════════════════════════════════
            HOW IT WORKS — 3 STEPS
        ════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20 max-w-4xl mx-auto"
        >
          {[
            { icon: <CreditCard size={20} />, num: '01', title: 'Chọn gói Credits', desc: 'Mua gói phù hợp nhu cầu. Gói lớn = giá tốt hơn.', color: '#0090ff' },
            { icon: <Wand2 size={20} />, num: '02', title: 'Tạo nội dung AI', desc: 'Dùng Credits cho bất kỳ công cụ AI nào — không giới hạn.', color: '#8b5cf6' },
            { icon: <Infinity size={20} />, num: '03', title: 'Không hết hạn', desc: 'Credits còn mãi mãi. Nạp thêm bất cứ lúc nào.', color: '#10b981' },
          ].map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.08] dark:hover:border-white/[0.08] transition-all group"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${step.color}12`, color: step.color }}>
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: step.color }}>{step.num}</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h4>
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ════════════════════════════════════════════
            PRICING GRID — DATA-DRIVEN FROM DB
        ════════════════════════════════════════════ */}
        <section className="mb-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Chọn gói phù hợp</h2>
            <p className="text-sm text-slate-400 dark:text-gray-500 max-w-lg mx-auto">Mỗi gói được thiết kế để phù hợp với nhu cầu sáng tạo khác nhau</p>
          </motion.div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải bảng giá...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {packages.map((pack, packIdx) => {
                const accent = pack.theme?.accentColor || '#0090ff';
                const gradFrom = pack.theme?.gradientFrom || '#0f172a';
                const gradTo = pack.theme?.gradientTo || '#020617';
                const total = getTotal(pack);
                const isHighlight = pack.highlight || pack.popular;
                const isHovered = hoveredPack === pack._id;
                const pricePerCredit = (pack.price / total * 1000).toFixed(2);

                return (
                  <motion.div 
                    key={pack._id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: packIdx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setHoveredPack(pack._id)}
                    onMouseLeave={() => setHoveredPack(null)}
                    className={`relative flex flex-col rounded-[1.25rem] border overflow-hidden transition-all duration-500 ${
                      isHighlight 
                        ? 'shadow-xl z-10 lg:scale-[1.03]' 
                        : 'shadow-sm hover:shadow-lg'
                    } bg-white dark:bg-[#0a0a0e]`}
                    style={{ 
                      borderColor: isHighlight ? `${accent}40` : isHovered ? `${accent}25` : 'rgba(0,0,0,0.06)',
                      ...(isHighlight ? { boxShadow: `0 20px 60px ${accent}12` } : {})
                    }}
                  >
                    {/* Top gradient strip */}
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${gradFrom}, ${accent}, ${gradTo})` }} />

                    {/* Popular / Ribbon badge */}
                    {pack.popular && (
                      <div className="flex items-center justify-center gap-2 py-2.5" style={{ backgroundColor: accent }}>
                        <Crown size={12} fill="white" className="text-white" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Phổ biến nhất</span>
                      </div>
                    )}
                    {pack.ribbon?.text && !pack.popular && (
                      <div className="flex items-center justify-center gap-2 py-2" style={{ backgroundColor: pack.ribbon.color || accent, color: '#000' }}>
                        <span className="text-sm">{pack.ribbon.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{pack.ribbon.text}</span>
                      </div>
                    )}

                    <div className="p-6 md:p-7 flex flex-col flex-grow">
                      {/* Name + Badge */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{pack.name}</h3>
                          {pack.badge && (
                            <span className="text-[8px] font-black uppercase px-2 py-1 rounded-md border tracking-wider" style={{ backgroundColor: `${accent}12`, color: accent, borderColor: `${accent}20` }}>
                              {pack.badge}
                            </span>
                          )}
                        </div>
                        {pack.description && (
                          <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed line-clamp-2">{pack.description}</p>
                        )}
                      </div>

                      {/* Price block */}
                      <div className="mb-5">
                        <div className="flex items-baseline gap-2 mb-1">
                          {pack.originalPrice && pack.originalPrice > pack.price && (
                            <span className="text-sm font-bold text-slate-300 dark:text-gray-600 line-through">{formatVND(pack.originalPrice)}₫</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl md:text-[2.5rem] font-black tracking-tight" style={{ color: accent }}>{formatVND(pack.price)}</span>
                          <span className="text-base font-bold text-slate-300 dark:text-gray-600">₫</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5 font-medium">
                          ≈ ${pack.price} · {pricePerCredit}₫/1K credits
                        </p>
                        {pack.discountPercent && pack.discountPercent > 0 && (
                          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-md border border-emerald-500/15">
                            <TrendingUp size={10} /> Tiết kiệm {pack.discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Credit amount display */}
                      <div className="flex items-center gap-3 p-4 rounded-xl mb-5 border transition-all" style={{ backgroundColor: `${accent}06`, borderColor: `${accent}12` }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                          <Sparkles size={16} style={{ color: accent }} fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            {total.toLocaleString()} <span className="text-xs font-bold text-slate-400">credits</span>
                          </p>
                          {(pack.bonusPercent || 0) > 0 && (
                            <p className="text-[9px] font-bold text-emerald-500">
                              Bao gồm +{pack.bonusPercent}% bonus ({Math.floor(pack.credits * (pack.bonusPercent || 0) / 100).toLocaleString()} cr miễn phí)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <motion.button 
                        onClick={() => handleUpgradeClick(pack)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-sm hover:shadow-lg flex items-center justify-center gap-2"
                        style={{ 
                          backgroundColor: accent, 
                          color: '#fff',
                          boxShadow: isHovered ? `0 8px 30px ${accent}30` : undefined 
                        }}
                      >
                        {pack.ctaText || 'Chọn gói này'} <ArrowRight size={14} />
                      </motion.button>

                      {/* Features */}
                      {pack.features && pack.features.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2.5 flex-grow">
                          {pack.features.map((feat, i) => (
                            <div key={i} className={`flex gap-2.5 items-start ${feat.enabled ? '' : 'opacity-25'}`}>
                              {feat.enabled ? (
                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${accent}10` }}>
                                  <Check size={11} style={{ color: accent }} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                  <X size={11} className="text-slate-300 dark:text-gray-600" strokeWidth={3} />
                                </div>
                              )}
                              <div>
                                <p className={`text-xs leading-tight ${feat.enabled ? 'font-semibold text-slate-700 dark:text-gray-300' : 'font-medium text-slate-300 dark:text-gray-600 line-through'}`}>
                                  {feat.label}
                                </p>
                                {feat.highlight && feat.enabled && (
                                  <span className="inline-block mt-1 text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ backgroundColor: `${accent}10`, color: accent, borderColor: `${accent}20` }}>
                                    Đặc biệt
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Unlimited Models */}
                      {pack.unlimitedModels && pack.unlimitedModels.filter(m => m.enabled).length > 0 && (
                        <div className="mt-5 pt-5 border-t border-black/[0.04] dark:border-white/[0.04]">
                          <div className="flex items-center gap-1.5 mb-3">
                            <Infinity size={12} style={{ color: accent }} />
                            <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: accent }}>Unlimited Access</p>
                          </div>
                          <div className="space-y-1.5">
                            {pack.unlimitedModels.filter(m => m.enabled).map((model, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border" style={{ backgroundColor: `${accent}04`, borderColor: `${accent}10` }}>
                                <div className="flex items-center gap-2">
                                  <Check size={11} style={{ color: accent }} strokeWidth={3} />
                                  <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300">{model.label}</span>
                                </div>
                                <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>
                                  {model.badge || '∞'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════
            WHAT YOU CAN CREATE 
        ════════════════════════════════════════════ */}
        <section className="mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
              Dùng cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-violet-500">mọi công cụ AI</span>
            </h2>
            <p className="text-sm text-slate-400 dark:text-gray-500 max-w-lg mx-auto">Một loại credit — hơn 30 sản phẩm AI</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {[
              { icon: <Video size={22} />, name: 'Video AI', range: '100 – 160K', color: '#ef4444' },
              { icon: <ImageIcon size={22} />, name: 'Image AI', range: '100 – 17.5K', color: '#0090ff' },
              { icon: <Mic size={22} />, name: 'Voice AI', range: '500 – 5K', color: '#f59e0b' },
              { icon: <Music size={22} />, name: 'Music AI', range: '1K – 10K', color: '#ec4899' },
              { icon: <Wand2 size={22} />, name: 'Enhance', range: '200 – 5K', color: '#8b5cf6' },
              { icon: <Cpu size={22} />, name: 'Workflow', range: '500 – 20K', color: '#10b981' },
            ].map((tool, idx) => (
              <motion.div 
                key={tool.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.1] dark:hover:border-white/[0.1] transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${tool.color}12`, color: tool.color }}>
                  {tool.icon}
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{tool.name}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500">{tool.range} cr</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            TRUST STRIP 
        ════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 py-10 mb-24 border-y border-black/[0.04] dark:border-white/[0.04]"
        >
          {[
            { icon: <Shield size={15} />, text: 'Thanh toán an toàn 100%' },
            { icon: <Globe2 size={15} />, text: 'Hỗ trợ đa ngôn ngữ' },
            { icon: <RefreshCw size={15} />, text: 'Credits không hết hạn' },
            { icon: <Lock size={15} />, text: 'Hoàn tiền trong 7 ngày' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-slate-400 dark:text-gray-500">
              <span className="text-brand-blue">{item.icon}</span>
              <span className="text-xs font-bold">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* ════════════════════════════════════════════
            FAQ
        ════════════════════════════════════════════ */}
        <section className="max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Câu hỏi thường gặp</h2>
            <p className="text-sm text-slate-400 dark:text-gray-500">Mọi thứ bạn cần biết về hệ thống Credits</p>
          </motion.div>

          <div className="space-y-2.5">
            {[
              { q: 'Credits có hết hạn không?', a: 'Không. Credits bạn mua sẽ còn mãi mãi cho đến khi sử dụng hết. Không có thời hạn sử dụng.' },
              { q: 'Tôi có thể dùng Credits cho sản phẩm nào?', a: 'Tất cả sản phẩm trong Skyverses — Video AI, Image AI, Voice Studio, Music AI, Workflow, Background Removal, Upscale và hơn 30 công cụ khác.' },
              { q: 'Mỗi lần tạo ảnh/video tốn bao nhiêu Credits?', a: 'Tuỳ theo model và chất lượng. Image AI từ 100-17,500 credits, Video AI từ 100-160,000 credits. Chi tiết hiển thị trước khi bạn tạo.' },
              { q: 'Có được hoàn tiền không?', a: 'Có, Skyverses hỗ trợ hoàn tiền trong vòng 7 ngày nếu bạn chưa sử dụng Credits. Liên hệ support để được hỗ trợ.' },
              { q: 'Unlimited Model là gì?', a: 'Một số gói cho phép truy cập không giới hạn vào các model AI cụ thể — bạn có thể tạo bao nhiêu tuỳ ý mà không tốn Credits.' },
              { q: 'Tôi có thể nâng cấp gói giữa chừng không?', a: 'Hoàn toàn được. Bạn có thể mua thêm Credits bất kỳ lúc nào. Credits mới sẽ được cộng vào số dư hiện tại.' },
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="border border-black/[0.05] dark:border-white/[0.05] rounded-xl overflow-hidden bg-white dark:bg-white/[0.02] hover:border-black/[0.1] dark:hover:border-white/[0.1] transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-slate-400 dark:text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            BOTTOM CTA
        ════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.02] dark:to-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] mb-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-6">
            <Flame size={24} className="text-brand-blue" />
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight mb-3">Sẵn sàng bắt đầu?</h3>
          <p className="text-sm text-slate-400 dark:text-gray-500 max-w-md mx-auto mb-8">
            Chọn gói Credits phù hợp và bắt đầu sáng tạo với AI ngay hôm nay
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-[0.97] transition-all"
          >
            <Zap size={14} fill="currentColor" /> Xem bảng giá
          </button>
        </motion.div>

      </div>

      {/* PURCHASE MODAL */}
      <AnimatePresence>
        {isPurchaseModalOpen && (
          <CreditPurchaseModal 
            isOpen={isPurchaseModalOpen} 
            onClose={handleCloseModal} 
            initialPack={selectedPackForModal}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default CreditsPage;
