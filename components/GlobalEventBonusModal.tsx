
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, ArrowRight, Zap, Shield, ChevronRight, Flame, Clock, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'skyverses_welcome_promo_seen';
const FREE_IMAGES = 50;
const WELCOME_CREDITS = 1000;

// Ảnh output thật của Skyverses — thay bằng CDN sau khi chạy gen_onboarding_slides.sh
const GRID_IMAGES = [
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/020090da-8567-4d53-0530-d602bf3e4800/public',
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/e56f8ec9-a6b0-4833-c469-2b666794da00/public',
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/64e717f9-284f-46fc-dc7f-42dcfdaba600/public',
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/ce9652e2-6846-48a0-5c58-3dc4aa970900/public',
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/7f0ac8f1-aedc-4abb-3b52-e272be253300/public',
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/f455b340-e5a3-42b2-c5cc-f6bd33286e00/public',
];

const GlobalEventBonusModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 = intro, 1 = offer
  const navigate = useNavigate();
  const { isAuthenticated, freeImageRemaining } = useAuth();

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setStep(0);
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

  return (
    <>
      <style>{`
        @keyframes ev-float { 0%,100%{transform:translateY(0) scale(1);opacity:.45} 50%{transform:translateY(-10px) scale(1.3);opacity:.9} }
        @keyframes ev-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ev-pulse { 0%{box-shadow:0 0 0 0 rgba(139,92,246,.45)} 70%{box-shadow:0 0 0 14px rgba(139,92,246,0)} 100%{box-shadow:0 0 0 0 rgba(139,92,246,0)} }
        @keyframes ev-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center,rgba(6,2,20,.95),rgba(0,0,0,.88))', backdropFilter: 'blur(14px)' }}
              onClick={handleClose}
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 32 }}
              transition={{ duration: 0.42, type: 'spring', stiffness: 220, damping: 24 }}
              className="relative w-full max-w-[390px] overflow-hidden"
              style={{
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.07)',
                background: '#07050f',
                boxShadow: '0 0 0 1px rgba(139,92,246,.12), 0 30px 100px rgba(0,0,0,.9), 0 0 140px rgba(139,92,246,.07)',
              }}
            >
              {/* Particles */}
              {[{d:0,x:'9%',y:'9%',c:'bg-violet-400'},{d:.5,x:'91%',y:'11%',c:'bg-amber-400'},{d:1.1,x:'11%',y:'83%',c:'bg-pink-400'},{d:1.7,x:'84%',y:'74%',c:'bg-sky-400'},{d:.3,x:'51%',y:'4%',c:'bg-emerald-400'}].map((p,i)=>(
                <div key={i} className={`absolute w-1.5 h-1.5 rounded-full ${p.c} pointer-events-none z-0`}
                  style={{left:p.x,top:p.y,animation:`ev-float ${2.4+p.d*.35}s ease-in-out infinite ${p.d*.28}s`}} />
              ))}

              {/* Close */}
              <button onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                <X size={14} />
              </button>

              <AnimatePresence mode="wait">

                {/* ═══ SLIDE 0 — INTRO ═══ */}
                {step === 0 && (
                  <motion.div key="slide0"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.32 }}
                  >
                    {/* Image grid — ảnh output thật */}
                    <div className="relative w-full overflow-hidden" style={{ height: 192 }}>
                      <div className="grid grid-cols-3 gap-0.5 h-full">
                        {GRID_IMAGES.map((url, i) => (
                          <div key={i} className="relative overflow-hidden bg-white/5">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            {/* Subtle overlay */}
                            <div className="absolute inset-0" style={{background:'rgba(7,5,15,.25)'}} />
                          </div>
                        ))}
                      </div>
                      {/* Label overlay center */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{background:'linear-gradient(to bottom, rgba(7,5,15,.1) 0%, rgba(7,5,15,.7) 100%)'}}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[.22em] mb-2"
                          style={{background:'rgba(139,92,246,.18)',border:'1px solid rgba(139,92,246,.35)',color:'#c4b5fd'}}>
                          <Sparkles size={9} fill="currentColor" /> Skyverses AI
                        </span>
                        <p className="text-[11px] text-white/50 font-medium">Ảnh được tạo bởi AI</p>
                      </div>
                      {/* Bottom fade */}
                      <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                        style={{background:'linear-gradient(to bottom,transparent,#07050f)'}} />
                      {/* Step dots */}
                      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        <div className="rounded-full bg-violet-400 transition-all" style={{width:18,height:6}} />
                        <div className="rounded-full bg-white/20 transition-all" style={{width:6,height:6}} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-4 pb-2">
                      <h2 className="text-[22px] font-black text-white leading-tight mb-2" style={{letterSpacing:'-0.02em'}}>
                        Nền tảng AI sáng tạo
                        <br/>
                        <span style={{
                          background:'linear-gradient(90deg,#a78bfa,#c4b5fd,#a78bfa)',
                          backgroundSize:'200% auto',
                          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                          backgroundClip:'text', animation:'ev-shimmer 3s linear infinite',
                        }}>hàng đầu Việt Nam</span>
                      </h2>
                      <p className="text-[11.5px] text-white/38 leading-relaxed mb-5">
                        30+ công cụ AI trong 1 nền tảng — Video, Ảnh, Voice, Music, Workflow. Dùng chung 1 loại Credits. Không cần đăng ký riêng từng tool.
                      </p>

                      {/* 3 quick stats */}
                      <div className="grid grid-cols-3 gap-2 mb-5">
                        {[
                          {val:'30+', label:'Công cụ AI', color:'#a78bfa'},
                          {val:'4K',  label:'Upscale',    color:'#fbbf24'},
                          {val:'50+', label:'Ngôn ngữ',   color:'#34d399'},
                        ].map((s,i)=>(
                          <div key={i} className="text-center p-2.5 rounded-xl"
                            style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)'}}>
                            <div className="text-[18px] font-black leading-none mb-0.5" style={{color:s.color}}>{s.val}</div>
                            <div className="text-[9px] text-white/30 font-medium uppercase tracking-wide">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="px-6 pb-6">
                      <motion.button whileHover={{scale:1.025,y:-1}} whileTap={{scale:.97}}
                        onClick={() => setStep(1)}
                        className="group w-full relative inline-flex items-center justify-center gap-2 py-[13px] rounded-2xl text-[13px] font-black text-white overflow-hidden"
                        style={{background:'linear-gradient(135deg,#7c3aed,#9333ea,#a78bfa)',boxShadow:'0 8px 28px rgba(139,92,246,.4),0 0 0 1px rgba(255,255,255,.1)'}}>
                        <span className="relative z-10 flex items-center gap-2">
                          Xem ưu đãi cho bạn
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>
                      <button onClick={handleClose}
                        className="w-full text-center text-[11px] text-white/18 hover:text-white/40 transition-colors py-2 mt-1">
                        Bỏ qua
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ═══ SLIDE 1 — OFFER ═══ */}
                {step === 1 && (
                  <motion.div key="slide1"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.32 }}
                  >
                    {/* Top gradient hero */}
                    <div className="relative px-6 pt-7 pb-5 text-center overflow-hidden"
                      style={{background:`radial-gradient(ellipse 130% 120% at 50% -10%,rgba(139,92,246,.22) 0%,transparent 60%),radial-gradient(ellipse 80% 70% at 85% 95%,rgba(251,191,36,.1) 0%,transparent 55%),linear-gradient(180deg,#0e0820 0%,#07050f 100%)`}}>

                      {/* Step dots */}
                      <div className="flex items-center justify-center gap-1.5 mb-5">
                        <div className="rounded-full bg-white/20" style={{width:6,height:6}} />
                        <div className="rounded-full bg-violet-400" style={{width:18,height:6}} />
                      </div>

                      {/* Badges */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[.2em]"
                          style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.3)',color:'#f87171'}}>
                          <Flame size={9} fill="currentColor" /> Có hạn
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[.2em]"
                          style={{background:'rgba(139,92,246,.15)',border:'1px solid rgba(139,92,246,.3)',color:'#a78bfa'}}>
                          <Gift size={9} /> Welcome Bonus
                        </span>
                      </div>

                      {/* Big numbers */}
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-[52px] font-black leading-none" style={{
                            background:'linear-gradient(135deg,#a78bfa,#c4b5fd)',
                            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                            letterSpacing:'-0.04em',animation:'ev-pulse 2.5s ease-in-out infinite',
                          }}>{FREE_IMAGES}</div>
                          <div className="text-[10px] font-bold text-white/45 uppercase tracking-widest mt-0.5">Ảnh AI</div>
                        </div>
                        <div className="text-white/20 text-3xl font-thin pb-4">+</div>
                        <div className="text-center">
                          <div className="text-[52px] font-black leading-none" style={{
                            background:'linear-gradient(135deg,#fbbf24,#fb923c)',
                            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                            letterSpacing:'-0.04em',
                          }}>1K</div>
                          <div className="text-[10px] font-bold text-white/45 uppercase tracking-widest mt-0.5">Credits</div>
                        </div>
                      </div>

                      <p className="text-[12px] font-bold text-white/65 mb-1">Tặng miễn phí khi đăng ký hôm nay</p>
                      <p className="text-[10.5px] text-white/28 max-w-[230px] mx-auto leading-relaxed">
                        Không cần thẻ tín dụng — nhận ngay, dùng ngay
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="px-6 py-4 space-y-2.5"
                      style={{borderTop:'1px solid rgba(255,255,255,.04)'}}>
                      {[
                        {icon:<ImageIcon size={14}/>, label:'MIỄN PHÍ', title:`${FREE_IMAGES} Ảnh AI`, sub:'Tạo ngay với mọi model — không giới hạn style', ic:'#a78bfa', ib:'rgba(139,92,246,.15)', border:'rgba(139,92,246,.25)'},
                        {icon:<Zap size={14}/>,      label:'TẶNG KÈM', title:`${WELCOME_CREDITS.toLocaleString()} Credits`, sub:'Video · Voice · Music · Upscale · 30+ tool', ic:'#fbbf24', ib:'rgba(251,191,36,.12)', border:'rgba(251,191,36,.25)'},
                        {icon:<Shield size={14}/>,   label:'ĐẢM BẢO',  title:'Không mất phí',  sub:'Đăng ký miễn phí · Hủy bất kỳ lúc nào', ic:'#34d399', ib:'rgba(52,211,153,.12)', border:'rgba(52,211,153,.25)'},
                      ].map((b,i)=>(
                        <motion.div key={i} initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} transition={{delay:.05+i*.07}}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{background:`linear-gradient(135deg, ${b.ib}, transparent)`, border:`1px solid ${b.border}`}}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{background:b.ib, border:`1px solid ${b.border}`, color:b.ic}}>
                            {b.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase tracking-[.18em] px-1.5 py-0.5 rounded"
                                style={{background:b.border, color:b.ic}}>{b.label}</span>
                              <span className="text-[12px] font-bold text-white/90">{b.title}</span>
                            </div>
                            <p className="text-[10px] text-white/28 mt-0.5">{b.sub}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Social proof */}
                    <div className="px-6 py-2.5 flex items-center justify-center gap-2"
                      style={{borderTop:'1px solid rgba(255,255,255,.03)'}}>
                      <div className="flex -space-x-2">
                        {['bg-violet-500','bg-pink-500','bg-amber-500','bg-sky-500'].map((c,i)=>(
                          <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-[#07050f] flex items-center justify-center text-[8px] font-bold text-white`}>
                            {['T','A','M','N'][i]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-white/28">
                        <span className="text-white/55 font-bold">+2,400 người</span> nhận bonus tuần này
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="px-6 pb-6 pt-3">
                      <motion.button whileHover={{scale:1.025,y:-1}} whileTap={{scale:.97}}
                        onClick={handleCTA}
                        className="group w-full relative inline-flex items-center justify-center gap-2 py-[14px] rounded-2xl text-[13px] font-black text-white overflow-hidden"
                        style={{background:'linear-gradient(135deg,#7c3aed,#9333ea,#a78bfa)',boxShadow:'0 8px 30px rgba(139,92,246,.45),0 0 0 1px rgba(255,255,255,.1)'}}>
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{background:'linear-gradient(135deg,#8b5cf6,#fbbf24,#fb923c)'}} />
                        <span className="relative z-10 flex items-center gap-2">
                          <Gift size={14} />
                          {isAuthenticated ? 'Bắt đầu tạo ảnh miễn phí' : `Nhận ngay ${FREE_IMAGES} Ảnh + ${WELCOME_CREDITS.toLocaleString()} CR`}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>

                      <div className="flex items-center justify-center gap-1.5 mt-2.5">
                        <Clock size={9} className="text-white/18" />
                        <span className="text-[9.5px] text-white/18">Ưu đãi có thể kết thúc bất cứ lúc nào</span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        <button onClick={() => setStep(0)}
                          className="text-[11px] text-white/20 hover:text-white/45 transition-colors py-1.5 px-1">
                          ← Quay lại
                        </button>
                        <button onClick={handleClose}
                          className="text-[11px] text-white/18 hover:text-white/40 transition-colors py-1.5 px-1">
                          Bỏ qua
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalEventBonusModal;
