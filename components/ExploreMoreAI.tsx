
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Sparkles, Rocket, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ExploreMoreAI: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="w-full py-20 md:py-32 mt-16 md:mt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Main CTA Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-[#0c0c10] dark:via-[#0e0e14] dark:to-[#0c0c10]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 p-8 md:p-16 lg:p-20">
            <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center">
              {/* Left: Content (3 cols) */}
              <div className="md:col-span-3 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Building2 size={12} className="text-brand-blue" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">Enterprise Solutions</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
                  Biến ý tưởng thành{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-400">
                    sản phẩm AI thực tế
                  </span>
                </h2>
                
                <p className="text-base text-white/50 leading-relaxed max-w-lg">
                  Skyverses cung cấp dịch vụ phát triển giải pháp AI theo yêu cầu — chatbot, xử lý ảnh/video, 
                  workflow tự động hoá, và nhiều hơn nữa cho doanh nghiệp của bạn.
                </p>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Rocket size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-white/40">Triển khai nhanh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-white/40">AI state-of-the-art</span>
                  </div>
                </div>
              </div>
              
              {/* Right: Actions (2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <button 
                  onClick={() => navigate('/booking')}
                  className="group w-full inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-5 rounded-2xl text-sm font-bold hover:bg-white/95 hover:shadow-2xl hover:shadow-white/10 transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={16} />
                  Liên hệ tư vấn
                  <ArrowRight size={14} className="ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
                
                {!isAuthenticated && (
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full inline-flex items-center justify-center gap-3 bg-white/5 text-white border border-white/10 px-8 py-5 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    Tạo tài khoản miễn phí
                  </button>
                )}
                
                <p className="text-center text-[10px] font-medium text-white/25 pt-2">
                  ✦ Phản hồi trong 24 giờ • Tư vấn miễn phí
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreMoreAI;
