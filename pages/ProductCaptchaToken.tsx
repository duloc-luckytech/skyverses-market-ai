import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, ShieldCheck, Clock, Code2, ArrowRight, Sparkles, Shield, Globe2, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCaptchaToken } from '../hooks/useCaptchaToken';

// Sub-components
import { CaptchaHero } from '../components/captcha-token/CaptchaHero';
import { QuotaCard } from '../components/captcha-token/QuotaCard';
import { UplinkTab } from '../components/captcha-token/UplinkTab';
import { PaymentHistoryTab } from '../components/captcha-token/PaymentHistoryTab';
import { DocsTab } from '../components/captcha-token/DocsTab';
import { PricingMatrix } from '../components/captcha-token/PricingMatrix';
import { CaptchaPaymentModal } from '../components/captcha-token/CaptchaPaymentModal';

import { usePageMeta } from '../hooks/usePageMeta';

const ProductCaptchaToken = () => {
  const { isAuthenticated, login } = useAuth();
  const t = useCaptchaToken();

  usePageMeta({
    title: 'Captcha Token Service | Skyverses',
    description: 'Professional CAPTCHA token service for Google VEO3 & FX Lab automation.',
    keywords: 'captcha token, VEO3, automation',
    canonical: '/product/captcha-veo3'
  });

  useEffect(() => {
    document.title = "Captcha Token Service for Google VEO3 & FX Lab | Skyverses";
  }, []);

  const features = [
    {
      icon: <Zap size={22} />,
      title: 'Tốc độ cao',
      desc: 'Giải mã CAPTCHA trong ~3 giây trung bình. Tối ưu cho batch processing hàng nghìn request.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/15',
    },
    {
      icon: <ShieldCheck size={22} />,
      title: 'Độ chính xác 99.8%',
      desc: 'Mô hình AI được train riêng cho reCAPTCHA v2/v3 & hCaptcha, đạt tỉ lệ thành công cao.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/15',
    },
    {
      icon: <Code2 size={22} />,
      title: 'REST API đơn giản',
      desc: 'Tích hợp trong 5 phút với REST API. Hỗ trợ Node.js, Python, cURL — có code snippet sẵn.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10 border-indigo-500/15',
    },
    {
      icon: <Clock size={22} />,
      title: 'Hoạt động 24/7',
      desc: 'Hệ thống server cluster đảm bảo uptime 99.9%. Auto-scaling khi traffic tăng đột biến.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/15',
    },
    {
      icon: <Shield size={22} />,
      title: 'Bảo mật API Key',
      desc: 'Mỗi tài khoản có API Key riêng, rate-limit cấu hình theo plan. Dữ liệu mã hoá end-to-end.',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10 border-cyan-500/15',
    },
    {
      icon: <Globe2 size={22} />,
      title: 'Multi-platform',
      desc: 'Hỗ trợ giải mã cho Google VEO3, FX Lab, và các nền tảng yêu cầu CAPTCHA verification.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10 border-rose-500/15',
    },
  ];

  return (
    <div className="pt-20 bg-[#fcfcfd] dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500">

      {/* ═══════════ HERO ═══════════ */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 pt-6">
        <CaptchaHero activeTab={t.activeTab} setActiveTab={t.setActiveTab} />
      </div>

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 relative z-10 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: QUOTA CARD (4 columns) */}
          <QuotaCard accountData={t.accountData} />

          {/* RIGHT: TAB CONTENT (8 columns) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {t.activeTab === 'CONNECT' && (
                <UplinkTab
                  key="connect"
                  accountData={t.accountData}
                  isGeneratingKey={t.isGeneratingKey}
                  isLinking={t.isLinking}
                  handleGenerateKey={t.handleGenerateKey}
                  handleLinkAccount={t.handleLinkAccount}
                  isAuthenticated={isAuthenticated}
                  login={login}
                  onTryIt={() => t.setActiveTab('DOCS')}
                />
              )}

              {t.activeTab === 'PAYMENTS' && (
                <PaymentHistoryTab
                  key="payments"
                  logs={t.paymentHistory}
                  loading={t.loadingHistory}
                />
              )}

              {t.activeTab === 'DOCS' && (
                <DocsTab
                  key="docs"
                  apiKey={t.accountData?.apiKey?.key}
                  onRefreshAccount={t.fetchAccountInfo}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-24 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/8 border border-indigo-500/15 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400 mb-4">
            <Sparkles size={10} /> Tại sao chọn chúng tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Giải pháp Captcha <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">toàn diện</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: idx * 0.08, duration: 0.5, type: 'spring', stiffness: 120 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-indigo-500/20 dark:hover:border-indigo-500/15 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 dark:text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════════ PRICING MATRIX ═══════════ */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-8" id="pricing-matrix">
        <PricingMatrix
          plans={t.plans}
          loading={t.loadingPlans}
          onSelectPlan={t.handleCreatePayment}
          isCreatingPayment={t.isCreatingPayment}
        />
      </div>

      {/* ═══════════ FOOTER CTA ═══════════ */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mt-20 mb-24">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c0e1a] via-[#0e1028] to-[#130a22]"
        >
          {/* Background decor */}
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-[20%] w-[400px] h-[300px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 py-20 md:py-28 px-8 md:px-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">
                <Cpu size={10} /> Sẵn sàng tích hợp
              </span>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Tự động hoá
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  ngay hôm nay.
                </span>
              </h2>

              <p className="text-base text-white/35 leading-relaxed max-w-md mx-auto">
                Bắt đầu với gói miễn phí. Nâng cấp khi cần — không ràng buộc, không phí ẩn.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group inline-flex items-center gap-3 bg-indigo-500 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-indigo-400 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
                >
                  Mua Token ngay
                  <Zap size={16} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                </button>
                <a
                  href="/booking"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-2xl text-sm font-bold transition-all"
                >
                  Tư vấn giải pháp API
                  <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* ═══════════ PAYMENT MODAL ═══════════ */}
      <AnimatePresence>
        {t.activePayment && (
          <CaptchaPaymentModal
            paymentData={t.activePayment}
            onClose={() => t.setActivePayment(null)}
            onPollStatus={t.pollPaymentStatus}
          />
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ProductCaptchaToken;