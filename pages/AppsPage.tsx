
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, MessageSquare, Sparkles, Code2, Zap, Shield, ArrowRight, Terminal } from 'lucide-react';
import { useAppsPage } from '../hooks/useAppsPage';
import { SubmissionHero } from '../components/apps/SubmissionHero';
import { StepIndicator } from '../components/apps/StepIndicator';
import {
  Step1ProductInfo,
  Step2MediaPricing,
  Step3Technical,
  Step4ReviewSubmit,
  FormNavigation,
  SuccessOverlay
} from '../components/apps/SubmissionFormSteps';

const AppsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    formData,
    updateField,
    togglePlatform,
    autoSlug,
    isStepValid,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    resetForm,
    isSubmitting,
    isSuccess,
    isAuthenticated,
    user,
    completionPercent,
  } = useAppsPage();

  return (
    <div className="pt-24 min-h-screen bg-[#fafafa] dark:bg-[#050507] text-slate-900 dark:text-white transition-colors duration-500 selection:bg-brand-blue/30 overflow-x-hidden pb-32">
      
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[30%] w-[800px] h-[500px] bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/[0.02] dark:bg-purple-500/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Hero */}
      <SubmissionHero />

      {/* Main Content */}
      <section className="max-w-[1300px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Not logged in — prompt to login */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center space-y-6"
          >
            <div className="p-8 bg-white dark:bg-[#0a0a0e] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-xl space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto">
                <LogIn size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Đăng nhập để tiếp tục</h3>
                <p className="text-sm text-slate-400 dark:text-gray-500 leading-relaxed">
                  Bạn cần đăng nhập để gửi thông tin sản phẩm lên Marketplace. 
                  Thông tin tài khoản sẽ được tự động điền vào form.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-brand-blue/20"
              >
                <LogIn size={16} /> Đăng nhập ngay
              </button>
            </div>
          </motion.div>
        ) : (
          /* ═══ MAIN FORM LAYOUT ═══ */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
            
            {/* LEFT SIDEBAR: Steps + Info */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Step Indicator */}
              <div className="bg-white dark:bg-[#0a0a0e] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-5 shadow-sm">
                <StepIndicator 
                  currentStep={currentStep} 
                  onGoToStep={goToStep}
                  completionPercent={completionPercent}
                />
              </div>

              {/* Info Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider ml-1">Tại sao Skyverses?</h3>
                {[
                  { icon: <Sparkles size={18} />, title: '10,000+ Active Users', desc: 'Tiếp cận cộng đồng AI lớn nhất Việt Nam.', color: 'text-amber-500', bg: 'bg-amber-500/8' },
                  { icon: <Code2 size={18} />, title: 'SDK & API Support', desc: 'Tích hợp nhanh với hệ sinh thái Skyverses.', color: 'text-brand-blue', bg: 'bg-brand-blue/8' },
                  { icon: <Shield size={18} />, title: 'Revenue Sharing', desc: 'Mô hình chia sẻ doanh thu minh bạch.', color: 'text-emerald-500', bg: 'bg-emerald-500/8' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">{item.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Help Card */}
              <div className="flex items-start gap-3 p-4 bg-brand-blue/[0.04] dark:bg-brand-blue/[0.08] border border-brand-blue/10 rounded-xl">
                <MessageSquare size={16} className="text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                    Cần hỗ trợ? Liên hệ <strong className="text-brand-blue">support@skyverses.com</strong> hoặc Telegram <strong className="text-brand-blue">@skyverses</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3 relative"
            >
              <div className="bg-white dark:bg-[#0a0a0e] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden shadow-xl">
                {/* Form Header */}
                <div className="px-6 md:px-8 py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin sản phẩm</h2>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                      Bước {currentStep}/4 — Điền đầy đủ để sản phẩm được duyệt nhanh hơn
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isStepValid ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-gray-600'}`} />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500">
                      {isStepValid ? 'Hợp lệ' : 'Chưa đủ'}
                    </span>
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 relative">
                  {/* Success Overlay */}
                  <AnimatePresence>
                    {isSuccess && <SuccessOverlay onReset={resetForm} />}
                  </AnimatePresence>

                  {/* Steps */}
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <Step1ProductInfo
                        formData={formData}
                        updateField={updateField}
                        autoSlug={autoSlug}
                        togglePlatform={togglePlatform}
                      />
                    )}
                    {currentStep === 2 && (
                      <Step2MediaPricing
                        formData={formData}
                        updateField={updateField}
                        autoSlug={autoSlug}
                        togglePlatform={togglePlatform}
                      />
                    )}
                    {currentStep === 3 && (
                      <Step3Technical
                        formData={formData}
                        updateField={updateField}
                        autoSlug={autoSlug}
                        togglePlatform={togglePlatform}
                      />
                    )}
                    {currentStep === 4 && (
                      <Step4ReviewSubmit
                        formData={formData}
                        updateField={updateField}
                        autoSlug={autoSlug}
                        togglePlatform={togglePlatform}
                        user={user}
                      />
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <FormNavigation
                    currentStep={currentStep}
                    isStepValid={isStepValid}
                    isSubmitting={isSubmitting}
                    isSuccess={isSuccess}
                    onPrev={prevStep}
                    onNext={nextStep}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>

              {/* Footer note */}
              <p className="text-center text-[10px] text-slate-300 dark:text-gray-600 mt-4">
                Bằng cách gửi, bạn đồng ý với điều khoản sử dụng của Skyverses. 
                Sản phẩm sẽ được review bởi đội ngũ quản trị.
              </p>
            </motion.div>
          </div>
        )}
      </section>

      {/* ═══ DEVELOPER PORTAL SECTION ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8">
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0a0e1a] to-slate-900 dark:from-[#060810] dark:via-[#080c18] dark:to-[#060810] p-8 md:p-14 lg:p-16">
            {/* Background glows */}
            <div className="absolute top-0 right-[20%] w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-[10%] w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div className="space-y-8">
                <div className="space-y-5">
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    whileInView={{ opacity: 1 }} 
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full"
                  >
                    <Code2 size={12} className="text-brand-blue" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">Developer Portal</span>
                  </motion.div>
                  
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-[1.1]">
                    Xây dựng trên{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-400">
                      nền tảng Skyverses
                    </span>
                  </h2>
                  
                  <p className="text-sm text-white/40 max-w-lg leading-relaxed">
                    Tích hợp sức mạnh AI vào ứng dụng của bạn qua quy trình đơn giản: Submit → Review → Deploy. 
                    Sản phẩm được duyệt sẽ hiển thị trên Marketplace cho hàng ngàn người dùng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Zap size={18} />, title: 'Duyệt nhanh', desc: 'Review trong 48 giờ, deploy ngay khi approved.' },
                    { icon: <Terminal size={18} />, title: 'Hạ tầng sẵn', desc: 'Hosting, CDN, Payment — mọi thứ đã sẵn sàng.' },
                    { icon: <Shield size={18} />, title: 'Bảo mật cao', desc: 'Sandbox riêng biệt cho mỗi product.' },
                    { icon: <Sparkles size={18} />, title: 'Marketing hỗ trợ', desc: 'Promotion tới 10K+ users trên hệ sinh thái.' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-[10px] text-white/35 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: Process Steps */}
              <div className="hidden lg:block">
                <div className="relative p-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    <span className="text-[10px] text-white/30 font-bold">SUBMISSION PIPELINE</span>
                  </div>

                  {[
                    { step: '01', title: 'Submit Product', desc: 'Điền form thông tin sản phẩm', status: 'active' },
                    { step: '02', title: 'Admin Review', desc: 'Đội ngũ Skyverses kiểm duyệt', status: 'pending' },
                    { step: '03', title: 'Integration', desc: 'Tích hợp vào Marketplace', status: 'pending' },
                    { step: '04', title: 'Go Live!', desc: 'Sản phẩm lên sàn cho users', status: 'pending' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                        item.status === 'active' 
                          ? 'bg-brand-blue text-white' 
                          : 'bg-white/[0.04] text-white/30'
                      }`}>
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-white/30">{item.desc}</p>
                      </div>
                      {i < 3 && (
                        <ArrowRight size={12} className="text-white/10 shrink-0" />
                      )}
                    </div>
                  ))}

                  {/* Status bar */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-white/30">Pipeline Status: Ready</span>
                    </div>
                    <span className="text-[10px] font-bold text-white/20">~48h review time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppsPage;
