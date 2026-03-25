
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, ArrowRight, Zap, Star } from 'lucide-react';
import { systemConfigApi } from '../apis/config';

const STORAGE_KEY = 'skyverses_welcome_seen';

const formatCredits = (n: number) => n.toLocaleString('en-US');

const WelcomeBonusModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bonusCredits, setBonusCredits] = useState(1000);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch bonus credits from CMS config
    systemConfigApi.getSystemConfig().then(res => {
      if (res?.success && res.data.welcomeBonusCredits) {
        setBonusCredits(res.data.welcomeBonusCredits);
      }
    }).catch(() => { /* use default */ });

    // TODO: restore localStorage check after testing
    // const hasSeen = localStorage.getItem(STORAGE_KEY);
    // if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    // }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSignUp = () => {
    handleClose();
    navigate('/login');
  };

  const creditsText = formatCredits(bonusCredits);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
            >
              <X size={18} />
            </button>

            {/* Top gradient section */}
            <div className="relative bg-gradient-to-br from-[#0a0e1a] via-[#0c1225] to-[#0f0a20] px-8 pt-10 pb-8 text-center overflow-hidden">
              {/* Background effects */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-brand-blue/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute top-[30%] left-0 w-[150px] h-[150px] bg-amber-500/8 rounded-full blur-[60px] pointer-events-none" />

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-brand-blue/40"
                  style={{
                    left: `${15 + i * 14}%`,
                    top: `${20 + ((i * 23) % 50)}%`,
                    animation: `float ${2 + i * 0.4}s ease-in-out infinite ${i * 0.2}s`,
                  }}
                />
              ))}

              {/* Gift icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative z-10 mx-auto mb-5"
              >
                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mx-auto relative">
                  <Gift size={36} className="text-amber-400" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
                    <Star size={12} className="text-white" fill="currentColor" />
                  </div>
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/25 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 mb-4">
                  <Sparkles size={10} fill="currentColor" />
                  Welcome Bonus
                </span>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="relative z-10 text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mt-3 mb-3"
              >
                Đăng ký nhận ngay
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
                  {creditsText} Credits miễn phí
                </span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="relative z-10 text-sm text-white/40 max-w-xs mx-auto leading-relaxed"
              >
                Trải nghiệm hơn 30+ sản phẩm AI — Video, Image, Voice, Music — hoàn toàn miễn phí.
              </motion.p>
            </div>

            {/* Bottom section */}
            <div className="bg-white dark:bg-[#0c0e16] px-8 py-7 space-y-5">
              {/* Benefits */}
              <div className="space-y-3">
                {[
                  { icon: <Zap size={14} />, text: `${creditsText} Credits dùng cho mọi sản phẩm`, color: 'text-amber-500 bg-amber-500/10' },
                  { icon: <Sparkles size={14} />, text: 'Truy cập 30+ công cụ AI premium', color: 'text-brand-blue bg-brand-blue/10' },
                  { icon: <Gift size={14} />, text: 'Không cần thẻ tín dụng, không ràng buộc', color: 'text-emerald-500 bg-emerald-500/10' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSignUp}
                className="group w-full relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl text-sm font-bold shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  Đăng ký nhận {creditsText} Credits
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              {/* Skip */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={handleClose}
                className="w-full text-center text-[11px] font-medium text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors py-1"
              >
                Để sau, tôi muốn khám phá trước
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBonusModal;
