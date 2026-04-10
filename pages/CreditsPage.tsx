
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Sparkles, ArrowRight, Check, X, Loader2, Star,
  Shield, Globe2, ChevronDown, CreditCard, RefreshCw,
  Video, ImageIcon, Music, Mic, Wand2, Crown, Cpu,
  Gift, Infinity, Flame, TrendingUp, Lock, Receipt,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { creditsApi, CreditPackage } from '../apis/credits';
import CreditPurchaseModal from '../components/CreditPurchaseModal';
import { Link } from 'react-router-dom';

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

          {/* Link to Usage Page */}
          {isAuthenticated && (
            <Link
              to="/usage"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.03] hover:border-brand-blue/30 hover:text-brand-blue transition-all"
            >
              <BarChart3 size={14} />
              Xem lịch sử sử dụng
            </Link>
          )}
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

          {/* Tool cost cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mb-10">
            {[
              { icon: <Video size={22} />, name: 'Video AI', range: '600 – 2,000', avgCost: 1500, color: '#ef4444' },
              { icon: <ImageIcon size={22} />, name: 'Image AI', range: '80 – 1,500', avgCost: 150, color: '#0090ff' },
              { icon: <Mic size={22} />, name: 'Voice AI', range: '500 – 2,000', avgCost: 500, color: '#f59e0b' },
              { icon: <Music size={22} />, name: 'Music AI', range: '1,000 – 5,000', avgCost: 1000, color: '#ec4899' },
              { icon: <Wand2 size={22} />, name: 'Upscale', range: '100 – 500', avgCost: 100, color: '#8b5cf6' },
              { icon: <Cpu size={22} />, name: 'Workflow', range: '500 – 5,000', avgCost: 500, color: '#10b981' },
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

          {/* Per-package estimate table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-center text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-5">
              Ước tính số lần tạo theo gói <span className="text-slate-300 dark:text-gray-600">(dựa trên mức giá trung bình)</span>
            </p>
            <div className="overflow-x-auto rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-white/[0.02]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black/[0.05] dark:border-white/[0.05]">
                    <th className="text-left px-5 py-4 font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[9px]">Công cụ</th>
                    <th className="px-4 py-4 font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[9px] text-center">
                      <span className="text-slate-800 dark:text-white">Starter</span><br />
                      <span className="font-bold text-brand-blue normal-case tracking-normal">5,000 cr</span>
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[9px] text-center">
                      <span className="text-slate-800 dark:text-white">Creator</span><br />
                      <span className="font-bold text-violet-500 normal-case tracking-normal">~27,500 cr</span>
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[9px] text-center">
                      <span className="text-slate-800 dark:text-white">Pro</span><br />
                      <span className="font-bold text-fuchsia-500 normal-case tracking-normal">~72,000 cr</span>
                    </th>
                    <th className="px-4 py-4 font-black text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[9px] text-center">
                      <span className="text-slate-800 dark:text-white">Ultimate</span><br />
                      <span className="font-bold text-amber-500 normal-case tracking-normal">~244,000 cr</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      icon: <ImageIcon size={13} />, name: 'Image AI', color: '#0090ff',
                      note: 'avg ~150 cr/ảnh',
                      avg: 150,
                    },
                    {
                      icon: <Video size={13} />, name: 'Video AI', color: '#ef4444',
                      note: 'avg ~1,500 cr/video',
                      avg: 1500,
                    },
                    {
                      icon: <Mic size={13} />, name: 'Voice AI', color: '#f59e0b',
                      note: 'avg ~500 cr/bản',
                      avg: 500,
                    },
                    {
                      icon: <Music size={13} />, name: 'Music AI', color: '#ec4899',
                      note: 'avg ~1,000 cr/bài',
                      avg: 1000,
                    },
                    {
                      icon: <Wand2 size={13} />, name: 'Upscale', color: '#8b5cf6',
                      note: 'avg ~100 cr/ảnh',
                      avg: 100,
                    },
                  ].map((row, i) => {
                    const counts = [5000, 27500, 72000, 244000].map(cr => Math.floor(cr / row.avg));
                    const colors = ['#0090ff', '#8b5cf6', '#ec4899', '#f59e0b'];
                    return (
                      <tr key={row.name} className={`border-b border-black/[0.03] dark:border-white/[0.03] last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-white/[0.01]'}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${row.color}12`, color: row.color }}>
                              {row.icon}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white text-xs">{row.name}</p>
                              <p className="text-[9px] text-slate-400 dark:text-gray-500">{row.note}</p>
                            </div>
                          </div>
                        </td>
                        {counts.map((count, ci) => (
                          <td key={ci} className="px-4 py-4 text-center">
                            <span className="text-sm font-black" style={{ color: colors[ci] }}>
                              ~{count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K` : count}
                            </span>
                            <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-0.5">lần</p>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-center text-[10px] text-slate-300 dark:text-gray-600 mt-3">
              * Ước tính dựa trên mức giá trung bình. Giá thực tế phụ thuộc vào model và chất lượng chọn.
            </p>
          </motion.div>
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
              { q: 'Mỗi lần tạo ảnh/video tốn bao nhiêu Credits?', a: 'Tuỳ theo model và chất lượng. Image AI từ 80–1,500 credits (avg ~150 cr/ảnh), Video AI từ 600–2,000 credits (avg ~1,500 cr/video). Chi tiết hiển thị trước khi bạn tạo.' },
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
