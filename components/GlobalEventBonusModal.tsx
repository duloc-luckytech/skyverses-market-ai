
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Gift, ArrowRight, Image, Zap, Star,
  Clock, Trophy, Camera, Flame, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'skyverses_welcome_promo_seen';
const FREE_IMAGES = 100;
const WELCOME_CREDITS = 1000;

// ─── Main Component ───────────────────────────────────────────────────────────
const GlobalEventBonusModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, freeImageRemaining } = useAuth();

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleCTA = () => {
    handleClose();
    if (isAuthenticated && freeImageRemaining > 0) {
      window.dispatchEvent(new CustomEvent('openQuickImageGen'));
    } else {
      navigate('/login');
    }
  };

  // Benefit rows
  const benefits = [
    {
      icon: <Camera size={16} />,
      title: `${FREE_IMAGES} ảnh AI miễn phí`,
      sub: 'Tạo hình ngay, không giới hạn model',
      gradient: 'from-violet-500/20 to-purple-500/10',
      border: 'rgba(139,92,246,0.25)',
      iconColor: 'text-violet-400',
    },
    {
      icon: <Zap size={16} />,
      title: `${WELCOME_CREDITS.toLocaleString()} Credits tặng kèm`,
      sub: 'Dùng cho Video, Voice, Upscale...',
      gradient: 'from-amber-500/20 to-orange-500/10',
      border: 'rgba(251,191,36,0.25)',
      iconColor: 'text-amber-400',
    },
    {
      icon: <Shield size={16} />,
      title: 'Không cần thẻ tín dụng',
      sub: 'Đăng ký miễn phí, không ràng buộc',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      border: 'rgba(52,211,153,0.25)',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes promoFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50%       { transform: translateY(-14px) scale(1.25); opacity: 0.8; }
        }
        @keyframes promoPulse {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.3); }
          70%  { box-shadow: 0 0 0 18px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        @keyframes promoShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes promoSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(15,5,35,0.9) 0%, rgba(0,0,0,0.8) 100%)',
                backdropFilter: 'blur(8px)',
              }}
              onClick={handleClose}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 24 }}
              className="relative w-full max-w-[400px] overflow-hidden"
              style={{
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: `
                  0 0 0 1px rgba(139,92,246,0.1),
                  0 24px 80px rgba(0,0,0,0.8),
                  0 0 100px rgba(139,92,246,0.1)
                `,
              }}
            >
              {/* Floating particles */}
              {[
                { delay: 0, x: '12%', y: '12%', color: 'bg-amber-400' },
                { delay: 0.6, x: '88%', y: '18%', color: 'bg-violet-400' },
                { delay: 1.2, x: '15%', y: '78%', color: 'bg-pink-400' },
                { delay: 1.8, x: '80%', y: '70%', color: 'bg-sky-400' },
                { delay: 0.4, x: '50%', y: '8%', color: 'bg-emerald-400' },
                { delay: 2.2, x: '92%', y: '50%', color: 'bg-rose-400' },
              ].map((p, i) => (
                <div key={i}
                  className={`absolute w-1.5 h-1.5 rounded-full ${p.color} pointer-events-none`}
                  style={{ left: p.x, top: p.y, animation: `promoFloat ${2.5 + p.delay * 0.4}s ease-in-out infinite ${p.delay * 0.3}s`, opacity: 0.4 }}
                />
              ))}

              {/* Close */}
              <button onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full transition-all duration-200 text-white/40 hover:text-white hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <X size={15} />
              </button>

              {/* ══════ TOP SECTION ══════ */}
              <div className="relative overflow-hidden px-7 pt-8 pb-6 text-center"
                style={{
                  background: `
                    radial-gradient(ellipse 120% 100% at 50% -10%, rgba(139,92,246,0.2) 0%, transparent 60%),
                    radial-gradient(ellipse 80% 80% at 80% 80%, rgba(251,191,36,0.08) 0%, transparent 60%),
                    linear-gradient(180deg, #0c0818 0%, #090614 100%)
                  `,
                }}
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 250, damping: 20 }}
                  className="relative mx-auto w-fit mb-5"
                >
                  <div className="absolute inset-0 rounded-[1.6rem]" style={{ animation: 'promoPulse 2.5s ease-in-out infinite' }} />
                  <div className="relative w-20 h-20 rounded-[1.6rem] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(139,92,246,0.25), rgba(251,191,36,0.1))',
                      border: '1px solid rgba(139,92,246,0.3)',
                      boxShadow: '0 10px 40px rgba(139,92,246,0.25)',
                    }}
                  >
                    <Gift size={34} className="text-white" strokeWidth={1.5} />
                    <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        boxShadow: '0 4px 12px rgba(251,191,36,0.5)',
                        animation: 'promoSpin 6s linear infinite',
                      }}
                    >
                      <Star size={12} className="text-white" fill="currentColor" />
                    </div>
                  </div>
                </motion.div>

                {/* Badge */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em]"
                    style={{
                      background: 'linear-gradient(90deg, rgba(139,92,246,0.15), rgba(251,191,36,0.08))',
                      border: '1px solid rgba(139,92,246,0.25)',
                      color: '#a78bfa',
                    }}
                  >
                    <Sparkles size={10} fill="currentColor" />
                    Welcome Bonus
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 className="text-[24px] font-black leading-tight text-white mt-4 mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Đăng Ký Nhận Ngay
                    <br />
                    <span style={{
                      background: 'linear-gradient(90deg, #a78bfa, #fbbf24, #fb923c)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'promoShimmer 3s linear infinite',
                    }}>
                      {FREE_IMAGES} Ảnh + {WELCOME_CREDITS.toLocaleString()} CR
                    </span>
                  </h2>
                  <p className="text-[12px] text-white/35 max-w-[280px] mx-auto leading-relaxed">
                    Trải nghiệm 30+ sản phẩm AI — Hình ảnh, Video, Voice, Music — hoàn toàn miễn phí.
                  </p>
                </motion.div>
              </div>

              {/* ══════ BENEFITS ══════ */}
              <div className="px-7 py-5 space-y-3"
                style={{ background: 'linear-gradient(180deg, #090614 0%, #070412 100%)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
              >
                {benefits.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 ${item.iconColor}`}
                      style={{ border: `1px solid ${item.border}` }}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-white/85 leading-tight">{item.title}</p>
                      <p className="text-[10px] text-white/25 leading-snug">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ══════ CTA ══════ */}
              <div className="px-7 pb-6 pt-2" style={{ background: '#070412' }}>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCTA}
                  className="group w-full relative inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.35), 0 0 0 1px rgba(167,139,250,0.2)',
                  }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #fbbf24, #fb923c)' }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {isAuthenticated ? (
                      <>
                        <Sparkles size={15} fill="currentColor" />
                        Bắt đầu tạo ảnh miễn phí
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        <Gift size={15} />
                        Đăng ký nhận ngay
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Skip */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                  onClick={handleClose}
                  className="w-full text-center text-[11px] font-medium text-white/20 hover:text-white/40 transition-colors py-2 mt-2"
                >
                  Để sau, tôi muốn khám phá trước
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalEventBonusModal;
