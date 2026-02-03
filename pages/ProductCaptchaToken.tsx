
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
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

const ProductCaptchaToken = () => {
  const { isAuthenticated, login } = useAuth();
  const t = useCaptchaToken();

  return (
    <div className="pt-24 bg-[#fcfcfd] dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500 pb-32">
      
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#6366f108_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* HERO & TABS */}
        <CaptchaHero activeTab={t.activeTab} setActiveTab={t.setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* LEFT: QUOTA CARD (4 columns) */}
           <QuotaCard accountData={t.accountData} />

           {/* RIGHT: CONTENT (8 columns) */}
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
                   />
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* PRICING MATRIX */}
        <div id="pricing-matrix">
           <PricingMatrix 
             plans={t.plans} 
             loading={t.loadingPlans} 
             onSelectPlan={t.handleCreatePayment}
             isCreatingPayment={t.isCreatingPayment}
           />
        </div>

        {/* FOOTER CTA */}
        <section className="py-40 text-center relative overflow-hidden bg-indigo-600 rounded-[3rem] shadow-3xl mx-4 mt-32 transition-all duration-700 group">
           <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-white leading-none tracking-tighter select-none italic uppercase">
              CAPTCHA CAPTCHA CAPTCHA
           </div>
           
           <div className="relative z-10 space-y-16 max-w-4xl mx-auto px-6">
              <h2 className="text-7xl lg:text-[140px] font-black tracking-tighter leading-[0.8] italic text-white drop-shadow-2xl">Unify Your <br /> <span className="text-black">Automation.</span></h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-10">
                 <button 
                   onClick={() => document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' })}
                   className="w-full sm:w-auto bg-black text-white px-24 py-8 rounded-full text-sm font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-6 group"
                 >
                    MUA TOKEN NGAY <Zap size={24} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                 </button>
                 <a href="#/booking" className="px-16 py-8 border-2 border-black/20 text-black hover:bg-black hover:text-white text-sm font-black uppercase tracking-[0.4em] transition-all rounded-full italic">
                    Tư vấn giải pháp API
                 </a>
              </div>
           </div>
        </section>

      </div>

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
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
      `}</style>
    </div>
  );
};

export default ProductCaptchaToken;
