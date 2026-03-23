
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Sparkles, ArrowRight, Check, X, Loader2, Star,
  Shield, Cpu, Globe2, ChevronDown, Gift, CreditCard, RefreshCw,
  Video, ImageIcon, Music, Mic, Wand2, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { creditsApi, CreditPackage } from '../apis/credits';
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

  useEffect(() => {
    const fetchPacks = async () => {
      setLoading(true);
      try {
        const res = await creditsApi.getAdminPackages();
        if (res.data) {
          setPackages(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
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

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050507] text-black dark:text-white pt-28 pb-32 transition-colors duration-500 overflow-x-hidden selection:bg-brand-blue/30">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-brand-blue/[0.04] to-transparent dark:from-brand-blue/[0.08] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/[0.02] dark:bg-purple-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* ═══════════════ HERO ═══════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full mb-6">
            <Zap size={14} className="text-brand-blue" fill="currentColor" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">Universal Credits</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            Mua Credits một lần,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-500 to-pink-500">
              dùng cho tất cả
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-400 dark:text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
            Không subscription, không lock-in. Mua Credits theo nhu cầu và sử dụng cho hơn 30 sản phẩm AI — Video, Image, Voice, Music và nhiều hơn nữa.
          </p>

          {/* Current Balance */}
          {isAuthenticated && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <Sparkles size={16} className="text-brand-blue" fill="currentColor" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Số dư hiện tại</p>
                <p className="text-lg font-black text-brand-blue">{(credits || 0).toLocaleString()} <span className="text-xs font-bold text-slate-400">credits</span></p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ═══════════════ HOW CREDITS WORK ═══════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 md:mb-20 max-w-4xl mx-auto"
        >
          {[
            { icon: <CreditCard size={20} />, title: 'Chọn gói phù hợp', desc: 'Mua gói Credits hoặc nạp tuỳ ý. Gói lớn hơn = giá tốt hơn.', color: 'text-brand-blue', bg: 'bg-brand-blue/8' },
            { icon: <Wand2 size={20} />, title: 'Sử dụng mọi nơi', desc: 'Dùng Credits cho bất kỳ tool AI nào — không giới hạn sản phẩm.', color: 'text-purple-500', bg: 'bg-purple-500/8' },
            { icon: <RefreshCw size={20} />, title: 'Không hết hạn', desc: 'Credits còn lại mãi mãi. Nạp thêm bất cứ lúc nào bạn muốn.', color: 'text-emerald-500', bg: 'bg-emerald-500/8' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
              <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>{item.icon}</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ═══════════════ PRICING GRID ═══════════════ */}
        <section className="mb-20 md:mb-28">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Chọn gói Credits</h2>
            <p className="text-sm text-slate-400 dark:text-gray-500">Chọn gói phù hợp với nhu cầu sáng tạo của bạn</p>
          </motion.div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải bảng giá...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {packages.map((pack, packIdx) => {
                const isPopular = pack.code.toLowerCase().includes('ultimate') || pack.popular;
                const isCreator = pack.code.toLowerCase().includes('creator');
                
                const accentColor = isPopular ? 'brand-blue' : isCreator ? 'purple-500' : 'slate-300';
                const accentBg = isPopular ? 'bg-brand-blue' : isCreator ? 'bg-purple-500' : 'bg-slate-900 dark:bg-white';
                const accentText = isPopular ? 'text-white' : isCreator ? 'text-white' : 'text-white dark:text-black';

                return (
                  <motion.div 
                    key={pack._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: packIdx * 0.1 }}
                    className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-500 ${
                      isPopular 
                        ? 'border-brand-blue/40 shadow-xl shadow-brand-blue/10 dark:shadow-brand-blue/5 scale-[1.02] z-10' 
                        : isCreator 
                          ? 'border-purple-500/30 shadow-lg' 
                          : 'border-black/[0.06] dark:border-white/[0.06] shadow-sm hover:shadow-lg'
                    } bg-white dark:bg-[#0c0c10]`}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="bg-brand-blue text-white py-2.5 flex items-center justify-center gap-2">
                        <Crown size={12} fill="currentColor" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Phổ biến nhất</span>
                      </div>
                    )}

                    {/* Ribbon */}
                    {pack.ribbon?.text && !isPopular && (
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 flex items-center justify-center gap-2">
                        <Gift size={12} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{pack.ribbon.text}</span>
                      </div>
                    )}

                    <div className="p-7 md:p-8 flex flex-col flex-grow">
                      {/* Name & Description */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-black tracking-tight">{pack.name}</h3>
                          {pack.badge && (
                            <span className="text-[8px] font-black uppercase px-2 py-1 bg-pink-500/10 text-pink-500 rounded-md border border-pink-500/20 tracking-wider">{pack.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{pack.description}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          {pack.originalPrice && pack.originalPrice > pack.price && (
                            <span className="text-sm font-bold text-slate-300 dark:text-gray-600 line-through">{formatVND(pack.originalPrice)}₫</span>
                          )}
                          <span className="text-3xl md:text-4xl font-black tracking-tight">{formatVND(pack.price)}<span className="text-lg">₫</span></span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">≈ ${pack.price} / tháng • Tỷ giá 1$ = {USD_TO_VND.toLocaleString()}₫</p>
                        {pack.originalPrice && pack.originalPrice > pack.price && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-md border border-emerald-500/20">
                            Tiết kiệm {Math.round((1 - pack.price / pack.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Credits Badge */}
                      <div className={`flex items-center gap-3 p-3.5 rounded-xl mb-6 ${isPopular ? 'bg-brand-blue/5 border border-brand-blue/15' : isCreator ? 'bg-purple-500/5 border border-purple-500/15' : 'bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]'}`}>
                        <Sparkles size={18} className={isPopular ? 'text-brand-blue' : isCreator ? 'text-purple-500' : 'text-slate-400'} fill="currentColor" />
                        <div>
                          <p className="text-base font-black tracking-tight">{pack.totalCredits?.toLocaleString() || pack.credits.toLocaleString()} <span className="text-xs font-bold text-slate-400">credits/tháng</span></p>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button 
                        onClick={() => handleUpgradeClick(pack)}
                        className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-[0.97] shadow-sm hover:shadow-lg ${accentBg} ${accentText} ${
                          isPopular ? 'hover:shadow-brand-blue/20' : isCreator ? 'hover:shadow-purple-500/20' : ''
                        }`}
                      >
                        Chọn gói này <ArrowRight size={14} className="inline ml-1" />
                      </button>

                      {/* Features */}
                      <div className="mt-6 pt-6 border-t border-black/[0.04] dark:border-white/[0.04] space-y-3 flex-grow">
                        {pack.features?.map((feat, i) => (
                          <div key={i} className={`flex gap-3 items-start ${feat.enabled ? '' : 'opacity-25'}`}>
                            {feat.enabled ? (
                              <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Check size={12} className="text-emerald-500" strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                <X size={12} className="text-slate-300 dark:text-gray-600" strokeWidth={3} />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-gray-300 leading-tight">{feat.label}</p>
                              {feat.highlight && <span className="inline-block mt-1 text-[7px] font-black px-1.5 py-0.5 bg-pink-500/10 text-pink-500 rounded border border-pink-500/20 uppercase tracking-wider">Bonus</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Unlimited Models */}
                      {pack.unlimitedModels && pack.unlimitedModels.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-black/[0.04] dark:border-white/[0.04]">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3">Unlimited Access</p>
                          <div className="space-y-2">
                            {pack.unlimitedModels.map((model, i) => (
                              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${model.enabled ? 'bg-brand-blue/5 border border-brand-blue/10' : 'opacity-20 border border-black/[0.04] dark:border-white/[0.04]'}`}>
                                <div className="flex items-center gap-2">
                                  {model.enabled ? <Check size={12} className="text-brand-blue" strokeWidth={3} /> : <X size={12} className="text-slate-300" />}
                                  <span className="text-[10px] font-bold">{model.label}</span>
                                </div>
                                {model.enabled && (
                                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${model.highlight ? 'bg-brand-blue text-white' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                    {model.badge || '∞'}
                                  </span>
                                )}
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

        {/* ═══════════════ WHAT CAN YOU CREATE ═══════════════ */}
        <section className="mb-20 md:mb-28">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
              Credits dùng được cho <span className="text-brand-blue">mọi thứ</span>
            </h2>
            <p className="text-sm text-slate-400 dark:text-gray-500 max-w-lg mx-auto">Một loại credit, dùng cho hơn 30 công cụ AI khác nhau</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 max-w-5xl mx-auto">
            {[
              { icon: <Video size={22} />, name: 'Video AI', cost: '~20-120', color: 'text-red-500', bg: 'bg-red-500/8' },
              { icon: <ImageIcon size={22} />, name: 'Image AI', cost: '~2-15', color: 'text-brand-blue', bg: 'bg-brand-blue/8' },
              { icon: <Mic size={22} />, name: 'Voice AI', cost: '~5-15', color: 'text-amber-500', bg: 'bg-amber-500/8' },
              { icon: <Music size={22} />, name: 'Music AI', cost: '~10-30', color: 'text-pink-500', bg: 'bg-pink-500/8' },
              { icon: <Wand2 size={22} />, name: 'Enhance AI', cost: '~3-10', color: 'text-purple-500', bg: 'bg-purple-500/8' },
              { icon: <Cpu size={22} />, name: 'Workflow', cost: '~5-50', color: 'text-emerald-500', bg: 'bg-emerald-500/8' },
            ].map((tool, idx) => (
              <motion.div 
                key={tool.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.1] dark:hover:border-white/[0.1] transition-all text-center"
              >
                <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{tool.name}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500">{tool.cost} credits</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════ TRUST STRIP ═══════════════ */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 py-10 mb-20 border-y border-black/[0.04] dark:border-white/[0.04]"
        >
          {[
            { icon: <Shield size={16} />, text: 'Thanh toán an toàn 100%' },
            { icon: <Globe2 size={16} />, text: 'Hỗ trợ đa ngôn ngữ' },
            { icon: <RefreshCw size={16} />, text: 'Credits không hết hạn' },
            { icon: <Zap size={16} />, text: 'Hoàn tiền trong 7 ngày' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-400 dark:text-gray-500">
              <span className="text-brand-blue">{item.icon}</span>
              <span className="text-xs font-bold">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section className="max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Câu hỏi thường gặp</h2>
            <p className="text-sm text-slate-400 dark:text-gray-500">Mọi thứ bạn cần biết về Credits</p>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: 'Credits có hết hạn không?', a: 'Không. Credits bạn mua sẽ còn mãi mãi cho đến khi sử dụng hết. Không có thời hạn sử dụng.' },
              { q: 'Tôi có thể dùng Credits cho sản phẩm nào?', a: 'Tất cả sản phẩm trong Skyverses Market — Video AI, Image AI, Voice Studio, Music AI, Workflow, Background Removal, Upscale và hơn 30 công cụ khác.' },
              { q: 'Mỗi lần tạo ảnh/video tốn bao nhiêu Credits?', a: 'Tuỳ theo model và chất lượng. Image AI từ 2-15 credits, Video AI từ 20-120 credits. Chi tiết hiển thị trước khi bạn tạo.' },
              { q: 'Có được hoàn tiền không?', a: 'Có, Skyverses hỗ trợ hoàn tiền trong vòng 7 ngày nếu bạn chưa sử dụng Credits. Liên hệ support để được hỗ trợ.' },
              { q: 'Unlimited Model là gì?', a: 'Một số gói cho phép truy cập không giới hạn vào các model AI cụ thể — bạn có thể tạo bao nhiêu tuỳ ý mà không tốn Credits.' },
              { q: 'Tôi có thể nâng cấp gói giữa chừng không?', a: 'Hoàn toàn được. Hệ thống sẽ tính toán chênh lệch Credit và thời gian còn lại. Bạn chỉ trả phần chênh lệch.' },
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-black/[0.05] dark:border-white/[0.05] rounded-xl overflow-hidden bg-white dark:bg-white/[0.02] hover:border-black/[0.1] dark:hover:border-white/[0.1] transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
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
