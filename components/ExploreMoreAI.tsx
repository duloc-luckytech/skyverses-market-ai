
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageCircle} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ExploreMoreAI: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="w-full py-20 md:py-32 mt-16 md:mt-24 border-t border-black/5 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* CTA Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-brand-blue/10 via-purple-500/5 to-pink-500/5 dark:from-brand-blue/15 dark:via-purple-500/8 dark:to-pink-500/5 border border-brand-blue/10 dark:border-white/5 p-10 md:p-16"
        >
          {/* Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand-blue" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-blue italic">Giải pháp AI riêng</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-[0.95] text-slate-900 dark:text-white">
                Cần giải pháp AI{' '}
                <span className="text-brand-blue">tuỳ chỉnh</span>
                {' '}cho doanh nghiệp?
              </h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Skyverses cung cấp dịch vụ phát triển giải pháp AI theo yêu cầu — từ chatbot, xử lý ảnh, video đến workflow tự động hoá cho doanh nghiệp.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => navigate('/booking')}
                className="inline-flex items-center justify-center gap-3 bg-brand-blue text-white px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all w-full"
              >
                <MessageCircle size={16} />
                Đặt lịch tư vấn
              </button>
              
              {!isAuthenticated && (
                <button 
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center gap-3 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/10 transition-all w-full"
                >
                  Tạo tài khoản miễn phí
                  <ArrowRight size={14} />
                </button>
              )}
              
              <div className="flex items-center gap-4 justify-center pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phản hồi trong 24h</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreMoreAI;
