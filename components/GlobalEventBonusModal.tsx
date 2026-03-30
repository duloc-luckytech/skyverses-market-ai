
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Gift, ArrowRight, Image, Zap, Star,
  Clock, Trophy, Camera, Flame
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'skyverses_global_event_2026_seen';
const EVENT_END_DATE = new Date('2026-04-30T23:59:59+07:00');
const FREE_IMAGES = 100;

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, expired: diff === 0 };
  }, [target]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

// ─── Flip digit tile ──────────────────────────────────────────────────────────
const Tile: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-white tabular-nums"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {display}
        </div>
        {/* shine */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-xl pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)' }}
        />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
    </div>
  );
};

// ─── Floating particle ────────────────────────────────────────────────────────
const Particle: React.FC<{ delay: number; x: string; y: string; color: string }> = ({ delay, x, y, color }) => (
  <div
    className={`absolute w-1.5 h-1.5 rounded-full ${color} pointer-events-none`}
    style={{
      left: x,
      top: y,
      animation: `globalEventFloat ${2.5 + delay * 0.4}s ease-in-out infinite ${delay * 0.3}s`,
      opacity: 0.5,
    }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const GlobalEventBonusModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const countdown = useCountdown(EVENT_END_DATE);

  useEffect(() => {
    // Don't show if event ended
    if (countdown.expired) return;

    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 3500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSignUp = () => {
    handleClose();
    navigate('/login');
  };

  // Particle config
  const particles = [
    { delay: 0,   x: '10%',  y: '15%',  color: 'bg-amber-400' },
    { delay: 0.5, x: '85%',  y: '20%',  color: 'bg-purple-400' },
    { delay: 1.0, x: '20%',  y: '75%',  color: 'bg-pink-400' },
    { delay: 1.5, x: '75%',  y: '65%',  color: 'bg-sky-400' },
    { delay: 2.0, x: '50%',  y: '10%',  color: 'bg-emerald-400' },
    { delay: 2.5, x: '35%',  y: '85%',  color: 'bg-amber-300' },
    { delay: 0.8, x: '90%',  y: '50%',  color: 'bg-rose-400' },
    { delay: 1.8, x: '5%',   y: '55%',  color: 'bg-violet-400' },
  ];

  return (
    <>
      {/* Inject keyframe */}
      <style>{`
        @keyframes globalEventFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.5; }
          50%       { transform: translateY(-12px) scale(1.3); opacity: 0.9; }
        }
        @keyframes globalEventPulseRing {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.35); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 16px rgba(251, 191, 36, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        @keyframes globalEventShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes globalEventSpin {
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
                background: 'radial-gradient(ellipse at center, rgba(20,10,40,0.85) 0%, rgba(0,0,0,0.75) 100%)',
                backdropFilter: 'blur(6px)',
              }}
              onClick={handleClose}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.82, y: 50 }}
              transition={{ duration: 0.55, type: 'spring', stiffness: 180, damping: 22 }}
              className="relative w-full max-w-[420px] overflow-hidden"
              style={{
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: `
                  0 0 0 1px rgba(251,191,36,0.15),
                  0 24px 80px rgba(0,0,0,0.8),
                  0 0 120px rgba(139,92,246,0.15),
                  inset 0 1px 0 rgba(255,255,255,0.08)
                `,
              }}
            >
              {/* Floating particles */}
              {particles.map((p, i) => (
                <Particle key={i} {...p} />
              ))}

              {/* Close btn */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                <X size={16} />
              </button>

              {/* ══════════════ TOP SECTION ══════════════ */}
              <div
                className="relative overflow-hidden px-8 pt-9 pb-7 text-center"
                style={{
                  background: `
                    radial-gradient(ellipse 120% 100% at 50% -10%, rgba(139,92,246,0.25) 0%, transparent 60%),
                    radial-gradient(ellipse 80% 80% at 80% 80%, rgba(251,191,36,0.12) 0%, transparent 60%),
                    linear-gradient(180deg, #0d0818 0%, #0a0614 100%)
                  `,
                }}
              >
                {/* Top badge row */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center justify-center gap-2 mb-5"
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em]"
                    style={{
                      background: 'linear-gradient(90deg, rgba(251,191,36,0.2), rgba(251,191,36,0.08))',
                      border: '1px solid rgba(251,191,36,0.3)',
                      color: '#fbbf24',
                    }}
                  >
                    <Flame size={10} fill="currentColor" />
                    Sự Kiện Toàn Cầu
                    <Flame size={10} fill="currentColor" />
                  </span>
                </motion.div>

                {/* Icon stack */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 18 }}
                  className="relative mx-auto w-fit mb-5"
                >
                  {/* Outer pulse ring */}
                  <div
                    className="absolute inset-0 rounded-[1.8rem]"
                    style={{ animation: 'globalEventPulseRing 2.5s ease-in-out infinite' }}
                  />
                  {/* Icon card */}
                  <div
                    className="relative w-24 h-24 rounded-[1.8rem] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(139,92,246,0.3), rgba(251,191,36,0.15))',
                      border: '1px solid rgba(139,92,246,0.35)',
                      boxShadow: '0 12px 40px rgba(139,92,246,0.3)',
                    }}
                  >
                    <Camera size={40} className="text-white" strokeWidth={1.5} />
                    {/* Sparkle badge */}
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        boxShadow: '0 4px 12px rgba(251,191,36,0.5)',
                        animation: 'globalEventSpin 4s linear infinite',
                      }}
                    >
                      <Star size={14} className="text-white" fill="currentColor" />
                    </div>
                    {/* Trophy badge */}
                    <div
                      className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        boxShadow: '0 4px 12px rgba(139,92,246,0.5)',
                      }}
                    >
                      <Trophy size={12} className="text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2
                    className="text-[26px] font-black leading-tight text-white mb-2"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    Đăng Ký Nhận Ngay
                    <br />
                    <span
                      style={{
                        background: 'linear-gradient(90deg, #fbbf24, #a78bfa, #fb923c)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'globalEventShimmer 3s linear infinite',
                      }}
                    >
                      {FREE_IMAGES} Ảnh Miễn Phí
                    </span>
                  </h2>
                  <p className="text-[13px] text-white/45 max-w-xs mx-auto leading-relaxed">
                    Ưu đãi dành riêng cho user mới — chỉ có trong thời gian sự kiện.
                    Tạo ảnh AI cực kỳ đỉnh ngay hôm nay.
                  </p>
                </motion.div>
              </div>

              {/* ══════════════ COUNTDOWN SECTION ══════════════ */}
              <div
                className="px-8 py-5"
                style={{
                  background: 'linear-gradient(180deg, #0a0614 0%, #070412 100%)',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-1.5 mb-4"
                >
                  <Clock size={12} className="text-rose-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                    Kết thúc 30/04/2026
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center justify-center gap-3"
                >
                  <Tile value={countdown.days}    label="Ngày"   />
                  <span className="text-white/20 text-2xl font-thin mb-5 select-none">:</span>
                  <Tile value={countdown.hours}   label="Giờ"    />
                  <span className="text-white/20 text-2xl font-thin mb-5 select-none">:</span>
                  <Tile value={countdown.minutes} label="Phút"   />
                  <span className="text-white/20 text-2xl font-thin mb-5 select-none">:</span>
                  <Tile value={countdown.seconds} label="Giây"   />
                </motion.div>

                {/* Progress bar: days left / 30 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="mt-4 relative h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.max(0, (countdown.days / 30) * 100))}%`,
                      background: 'linear-gradient(90deg, #8b5cf6, #fbbf24)',
                      boxShadow: '0 0 10px rgba(139,92,246,0.6)',
                    }}
                  />
                </motion.div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-white/20 font-medium">0 ngày</span>
                  <span className="text-[9px] text-white/20 font-medium">30 ngày</span>
                </div>
              </div>

              {/* ══════════════ BOTTOM SECTION ══════════════ */}
              <div
                className="px-8 py-6"
                style={{
                  background: 'linear-gradient(180deg, #070412 0%, #050210 100%)',
                }}
              >
                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {[
                    {
                      icon: <Image size={14} />,
                      text: `${FREE_IMAGES} lượt tạo ảnh AI miễn phí`,
                      sub: 'Cho người đăng ký mới',
                      color: 'text-amber-400',
                      bg: 'rgba(251,191,36,0.12)',
                      border: 'rgba(251,191,36,0.2)',
                    },
                    {
                      icon: <Zap size={14} />,
                      text: 'Truy cập 30+ công cụ AI premium',
                      sub: 'Video · Image · Voice · Music',
                      color: 'text-violet-400',
                      bg: 'rgba(139,92,246,0.12)',
                      border: 'rgba(139,92,246,0.2)',
                    },
                    {
                      icon: <Gift size={14} />,
                      text: 'Không cần thẻ tín dụng',
                      sub: 'Dùng ngay, không ràng buộc',
                      color: 'text-emerald-400',
                      bg: 'rgba(52,211,153,0.10)',
                      border: 'rgba(52,211,153,0.18)',
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                        style={{ background: item.bg, border: `1px solid ${item.border}` }}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white/85 leading-tight">{item.text}</p>
                        <p className="text-[10px] text-white/30 leading-snug">{item.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignUp}
                  className="group w-full relative inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-black text-white overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.45), 0 0 0 1px rgba(167,139,250,0.25)',
                  }}
                >
                  {/* Shimmer overlay */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #fbbf24, #fb923c)',
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles size={15} fill="currentColor" />
                    Đăng ký nhận {FREE_IMAGES} ảnh miễn phí
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>

                {/* Skip */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                  onClick={handleClose}
                  className="w-full text-center text-[11px] font-medium text-white/25 hover:text-white/50 transition-colors py-2 mt-2"
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
