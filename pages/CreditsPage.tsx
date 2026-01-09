
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Crown, ShieldCheck, 
  ArrowRight, ImageIcon, Video,
  BrainCircuit, LayoutGrid, Sparkles,
  Lock, Activity, TrendingUp,
  Cpu, Database, Code2, ArrowUpRight,
  Info, Check, X, HelpCircle, Gift,
  Coins, AlertCircle, Loader2, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { creditsApi, CreditPackage } from '../apis/credits';
import CreditPurchaseModal from '../components/CreditPurchaseModal';

const CreditsPage = () => {
  const { t } = useLanguage();
  const { credits, isAuthenticated, login } = useAuth();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPackForModal, setSelectedPackForModal] = useState<CreditPackage | null>(null);
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPacks = async () => {
      setLoading(true);
      try {
        const res = await creditsApi.getAdminPackages();
        if (res.data) {
          // Lọc các gói theo chu kỳ đang chọn hoặc hiển thị linh hoạt
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
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-32 pb-40 transition-colors duration-500 overflow-x-hidden selection:bg-brand-blue/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none"></div>
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center space-y-12 mb-20 max-w-4xl mx-auto">
           <div className="space-y-6">
             <motion.h1 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="text-7xl lg:text-[100px] font-black tracking-tighter uppercase italic leading-[0.85]"
             >
               SÁNG TẠO <br /> KHÔNG <span className="text-brand-blue">GIỚI HẠN.</span>
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="text-gray-500 dark:text-gray-400 text-xl lg:text-2xl font-medium max-w-3xl mx-auto italic leading-relaxed"
             >
               “Credits được dùng cho mọi công cụ trong Skyverses Market — từ tạo video điện ảnh, hình ảnh AI đến prompt và workflow tự động.”
             </motion.p>
           </div>

           {/* BILLING SWITCHER */}
           <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-6 bg-black/5 dark:bg-white/5 p-2 rounded-full border border-black/5 dark:border-white/10">
                 <button 
                   onClick={() => setBillingCycle('monthly')}
                   className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500'}`}
                 >
                   Hàng tháng
                 </button>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setBillingCycle('annual')}
                      className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'annual' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-xl' : 'text-gray-500'}`}
                    >
                      Hàng năm
                    </button>
                    <span className="bg-pink-600 text-white text-[9px] font-black px-3 py-1 rounded-full animate-pulse">GIẢM ĐẾN -85%</span>
                 </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-2 bg-[#dfff1a] text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                <Info size={14} /> Cách để tiết kiệm Credit
              </button>
           </div>
        </div>

        {/* --- PRICING GRID --- */}
        <section className="mb-40">
           {loading ? (
              <div className="py-40 flex flex-col items-center justify-center gap-6">
                 <Loader2 className="w-16 h-16 text-brand-blue animate-spin" />
                 <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500 animate-pulse">Đang nạp bảng giá hệ thống...</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {packages.map((pack) => {
                  // Logic xác định style dựa trên theme hoặc code
                  const isUltimate = pack.code.toLowerCase().includes('ultimate') || pack.popular;
                  const isCreator = pack.code.toLowerCase().includes('creator');
                  
                  return (
                    <div 
                      key={pack._id}
                      className={`relative flex flex-col bg-white dark:bg-[#111114] rounded-[2rem] border-2 transition-all duration-500 overflow-hidden shadow-2xl ${
                        isUltimate ? 'border-[#dfff1a] scale-105 z-20' : 
                        isCreator ? 'border-pink-600' : 
                        'border-black/5 dark:border-white/5'
                      }`}
                    >
                      {/* Popular Tag */}
                      {isUltimate && (
                        <div className="bg-[#dfff1a] text-black py-2 flex items-center justify-center gap-2">
                           <Star size={12} fill="currentColor" />
                           <span className="text-[10px] font-black uppercase tracking-widest">PHỔ BIẾN NHẤT</span>
                        </div>
                      )}

                      {/* Limited Offer Ribbon */}
                      {pack.ribbon?.text && (
                         <div className="bg-pink-600 text-white py-2 flex items-center justify-center gap-2">
                            <Sparkles size={12} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">{pack.ribbon.text}</span>
                         </div>
                      )}

                      <div className="p-10 flex flex-col flex-grow space-y-10">
                         {/* Header Info */}
                         <div className="space-y-4">
                            <div className="flex justify-between items-start">
                               <h3 className="text-3xl font-black uppercase italic tracking-tighter">{pack.name}</h3>
                               {pack.badge && (
                                  <span className="bg-pink-600/10 text-pink-600 text-[9px] font-black px-2 py-1 rounded-sm border border-pink-500/20">{pack.badge}</span>
                               )}
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{pack.description}</p>
                         </div>

                         {/* Pricing Display */}
                         <div className="space-y-2">
                            <div className="flex items-baseline gap-3">
                               {pack.originalPrice && pack.originalPrice > pack.price && (
                                 <span className="text-2xl font-black text-pink-600 line-through opacity-60 italic tracking-tighter">${pack.originalPrice}</span>
                               )}
                               <span className="text-6xl font-black italic tracking-tighter">${pack.price}</span>
                               <span className="text-gray-500 font-bold uppercase text-xs">/tháng</span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thanh toán cho {pack.billedMonths} tháng</p>
                         </div>

                         {/* Select Button */}
                         <button 
                           onClick={() => handleUpgradeClick(pack)}
                           className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                             isUltimate ? 'bg-[#dfff1a] text-black hover:brightness-110' : 
                             isCreator ? 'bg-pink-600 text-white shadow-pink-500/20' : 
                             'bg-white dark:bg-[#1a1a1e] border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
                           }`}
                         >
                            CHỌN GÓI NÀY
                         </button>

                         {/* Core Credit Stats */}
                         <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-3">
                               <Sparkles className={isUltimate ? 'text-[#dfff1a]' : isCreator ? 'text-pink-600' : 'text-brand-blue'} size={18} fill="currentColor" />
                               <span className="text-base font-black italic tracking-tight">{pack.totalCredits?.toLocaleString() || pack.credits.toLocaleString()} credits mỗi tháng</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-7 italic">= {Math.floor(pack.credits/2)} Nano Banana Pro</p>
                         </div>

                         {/* Feature Checklist */}
                         <div className="space-y-4 py-8 border-y border-black/5 dark:border-white/5">
                            {pack.features?.map((feat, i) => (
                               <div key={i} className={`flex gap-4 items-start ${feat.enabled ? 'opacity-100' : 'opacity-30'}`}>
                                  {feat.enabled ? (
                                    <Check size={16} className="text-white mt-0.5 shrink-0" strokeWidth={4} />
                                  ) : (
                                    <X size={16} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={4} />
                                  )}
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-tight leading-tight">{feat.label}</p>
                                    {feat.highlight && <span className="inline-block bg-pink-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest">EXTRA</span>}
                                  </div>
                               </div>
                            ))}
                         </div>

                         {/* Unlimited Grid Section */}
                         <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic">TRUY CẬP KHÔNG GIỚI HẠN</h4>
                            <div className="space-y-2.5">
                               {pack.unlimitedModels?.map((model, i) => (
                                  <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${model.enabled ? 'border-brand-blue/30 bg-brand-blue/5' : 'border-black/5 dark:border-white/5 opacity-20'}`}>
                                     <div className="flex items-center gap-3">
                                        {model.enabled ? <Check size={12} className="text-brand-blue" strokeWidth={4} /> : <X size={12} className="text-gray-500" />}
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{model.label}</span>
                                     </div>
                                     {model.enabled && (
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${model.highlight ? 'bg-[#dfff1a] text-black' : 'bg-brand-blue text-white'}`}>
                                          {model.badge || 'UNLIMITED'}
                                        </span>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* Footer Link */}
                         <div className="pt-6">
                            <button className="w-full py-4 border border-black/10 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-blue hover:border-brand-blue transition-all">
                               Tìm hiểu thêm về Unlimited
                            </button>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
           )}
        </section>

        {/* --- FOOTER EXPLAINER --- Centered FAQ Section */}
        <div className="mt-40 border-t border-black/5 dark:border-white/10 pt-24 max-w-4xl mx-auto">
           <div className="space-y-12">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter text-center">Câu hỏi thường gặp</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { q: 'Gói đăng ký có tự động gia hạn không?', a: 'Có, các gói sẽ tự động gia hạn vào cuối chu kỳ. Bạn có thể hủy bất cứ lúc nào trong cài đặt.' },
                   { q: 'Tôi có thể nâng cấp giữa chừng không?', a: 'Hoàn toàn được. Hệ thống sẽ tính toán chênh lệch Credit và thời gian còn lại cho bạn.' },
                   { q: 'Unlimited Model là gì?', a: 'Là quyền truy cập không tốn Credit vào một số Model AI nhất định trong suốt thời gian đăng ký.' },
                   { q: 'Hỗ trợ kỹ thuật 24/7?', a: 'Tất cả các gói trả phí đều nhận được hỗ trợ ưu tiên từ đội ngũ kỹ sư của Skyverses.' }
                 ].map((faq, i) => (
                    <div key={i} className="p-8 bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl group hover:border-brand-blue/30 transition-all">
                       <h4 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-3 text-slate-800 dark:text-white"><ArrowUpRight size={16} className="text-brand-blue" /> {faq.q}</h4>
                       <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic leading-relaxed">{faq.a}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

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
