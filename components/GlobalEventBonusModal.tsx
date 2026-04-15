
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, ArrowRight, Zap, Shield, ChevronRight, Flame, Clock, Image as ImageIcon, Video, Mic, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'skyverses_welcome_promo_seen';
const FREE_IMAGES = 50;
const WELCOME_CREDITS = 1000;

// Demo videos — Seedance AI generated
const DEMO_VIDEOS = [
  'https://cdn.seedance2.ai/examples/seedance2/18.mp4',
  'https://cdn.seedance2.ai/examples/seedance2/13.mp4',
];

// Demo images — Cloudflare CDN
const DEMO_IMAGES = [
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/10c49b25-2bbb-40cc-2493-b81e1b59cc00/public',
  'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/a19a66d7-8b96-4c4f-73fe-1ca080b96500/public',
];

// AI Model logos — official assets mirrored to Cloudflare CDN
const MODEL_LOGOS: Record<string, string> = {
  seedance: 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/e1a580fc-b5e5-4da9-1881-e4515f62f100/public',
  veo3:     'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/93c7e777-c777-4392-6eab-bb56a0d4ee00/public',
  grok:     'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/8f1f9f36-428b-4f54-df75-ca90fb541c00/public',
  claude:   'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/5bbdc89c-d79b-4488-d8bf-d8748bea2100/public',
  kling:    'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/750c5b7e-4ddb-4a36-16ff-08f9272ea200/public',
};

const AUTO_NEXT_MS = 5000;

const GlobalEventBonusModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 = discovery, 1 = claim
  const navigate = useNavigate();
  const { isAuthenticated, freeImageRemaining } = useAuth();

  // Auto-advance Slide 0 → Slide 1 after AUTO_NEXT_MS
  useEffect(() => {
    if (!isOpen || step !== 0) return;
    const t = setTimeout(() => setStep(1), AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, [isOpen, step]);

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
        @keyframes ev-spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ev-progress { from{width:0%} to{width:100%} }
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
              className="relative w-full max-w-[600px] overflow-hidden"
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

                {/* ═══ SLIDE 0 — DISCOVERY ═══ */}
                {step === 0 && (
                  <motion.div key="slide0"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.32 }}
                  >
                    {/* Hero — video 1 lớn trái + cột phải: video 2 + 2 ảnh */}
                    <div className="relative w-full overflow-hidden" style={{ height: 260 }}>
                      <div className="flex gap-0.5 h-full">
                        {/* Trái — video 1 lớn */}
                        <video
                          src={DEMO_VIDEOS[0]}
                          autoPlay muted loop playsInline
                          className="h-full object-cover"
                          style={{ flex: '0 0 60%' }}
                        />
                        {/* Phải — video 2 + 2 ảnh xếp dọc */}
                        <div className="flex flex-col gap-0.5" style={{ flex: '0 0 40%' }}>
                          <video
                            src={DEMO_VIDEOS[1]}
                            autoPlay muted loop playsInline
                            className="w-full object-cover flex-1"
                          />
                          {DEMO_IMAGES.map((src, i) => (
                            <img key={i} src={src} alt="" className="w-full object-cover flex-1" />
                          ))}
                        </div>
                      </div>
                      {/* Step dots */}
                      <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                        <div className="rounded-full bg-violet-400" style={{width:18,height:6}} />
                        <div className="rounded-full bg-white/20" style={{width:6,height:6}} />
                      </div>
                      {/* Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-[.18em]"
                          style={{background:'rgba(7,5,15,.7)',border:'1px solid rgba(139,92,246,.4)',color:'#c4b5fd',backdropFilter:'blur(8px)'}}>
                          <Sparkles size={8} fill="currentColor" /> AI Generated
                        </span>
                      </div>
                      {/* Bottom fade */}
                      <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                        style={{background:'linear-gradient(to bottom,transparent,#07050f)'}} />
                    </div>

                    {/* Content */}
                    <div className="px-6 pt-3 pb-2">
                      <h2 className="text-[22px] font-black text-white leading-tight mb-1.5" style={{letterSpacing:'-0.02em'}}>
                        Tạo ảnh AI đẹp
                        <br />
                        <span style={{
                          background:'linear-gradient(90deg,#a78bfa,#c4b5fd,#a78bfa)',
                          backgroundSize:'200% auto',
                          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                          backgroundClip:'text', animation:'ev-shimmer 3s linear infinite',
                        }}>chỉ trong 10 giây</span>
                      </h2>
                      <p className="text-[11px] text-white/35 leading-relaxed mb-3">
                        Veo 3, Seedance, Grok, Claude… tất cả ở đây — đăng ký một lần, dùng hết.
                      </p>

                      {/* Hot new models strip — logo thật */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="shrink-0 text-[8px] font-black uppercase tracking-widest text-white/25">Mới nhất</span>
                        <div className="flex items-center gap-1.5">
                          {[
                            {key:'seedance', name:'Seedance', invert: false},
                            {key:'veo3',     name:'Veo 3',    invert: false},
                            {key:'grok',     name:'Grok',     invert: false},
                            {key:'claude',   name:'Claude',   invert: false},
                            {key:'kling',    name:'Kling',    invert: false},
                          ].map((m) => (
                            <div key={m.key}
                              className="flex items-center gap-1 px-2 py-1 rounded-full"
                              style={{background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)'}}>
                              <img
                                src={MODEL_LOGOS[m.key]}
                                alt={m.name}
                                className="w-3.5 h-3.5 rounded-sm object-contain"
                                style={m.invert ? {filter:'invert(1) brightness(1.2)'} : {}}
                              />
                              <span className="text-[9px] font-semibold text-white/60">{m.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4 AI categories */}
                      <div className="grid grid-cols-4 gap-2 mb-5">
                        {[
                          {icon:<ImageIcon size={15}/>, label:'Ảnh AI',  color:'#a78bfa', bg:'rgba(139,92,246,.12)', border:'rgba(139,92,246,.22)'},
                          {icon:<Video size={15}/>,     label:'Video',   color:'#f472b6', bg:'rgba(244,114,182,.1)', border:'rgba(244,114,182,.2)'},
                          {icon:<Mic size={15}/>,       label:'Voice',   color:'#34d399', bg:'rgba(52,211,153,.1)', border:'rgba(52,211,153,.2)'},
                          {icon:<Music size={15}/>,     label:'Music',   color:'#fbbf24', bg:'rgba(251,191,36,.1)', border:'rgba(251,191,36,.2)'},
                        ].map((c,i)=>(
                          <div key={i} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl"
                            style={{background:c.bg, border:`1px solid ${c.border}`}}>
                            <span style={{color:c.color}}>{c.icon}</span>
                            <span className="text-[9px] font-bold text-white/55">{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="px-6 pb-6">
                      <motion.button whileHover={{scale:1.025,y:-1}} whileTap={{scale:.97}}
                        onClick={() => setStep(1)}
                        className="group w-full relative inline-flex items-center justify-center gap-2 py-[14px] rounded-2xl text-[13px] font-black text-white overflow-hidden"
                        style={{background:'linear-gradient(135deg,#7c3aed,#9333ea,#a78bfa)',boxShadow:'0 8px 30px rgba(139,92,246,.5),0 0 0 1px rgba(255,255,255,.1)',animation:'ev-pulse 2.5s ease-in-out infinite'}}>
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{background:'linear-gradient(135deg,#8b5cf6,#a78bfa,#c4b5fd)'}} />
                        <span className="relative z-10 flex items-center gap-2">
                          <Gift size={14} />
                          Xem ưu đãi dành riêng cho bạn
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>

                      {/* Auto-next progress bar */}
                      <div className="w-full h-[3px] rounded-full mt-2 overflow-hidden" style={{background:'rgba(255,255,255,.07)'}}>
                        <div className="h-full rounded-full" style={{
                          background:'linear-gradient(90deg,#7c3aed,#a78bfa)',
                          animation:`ev-progress ${AUTO_NEXT_MS}ms linear forwards`,
                        }} />
                      </div>

                      <button onClick={handleClose}
                        className="w-full text-center text-[10.5px] text-white/15 hover:text-white/35 transition-colors py-2 mt-1">
                        Không, cảm ơn
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ═══ SLIDE 1 — CLAIM OFFER ═══ */}
                {step === 1 && (
                  <motion.div key="slide1"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.32 }}
                  >
                    {/* Hero */}
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
                      <div className="flex items-center justify-center gap-5 mb-3">
                        <div className="text-center">
                          <div className="text-[58px] font-black leading-none" style={{
                            background:'linear-gradient(135deg,#a78bfa,#c4b5fd)',
                            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                            letterSpacing:'-0.05em',
                          }}>{FREE_IMAGES}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{color:'#a78bfa'}}>Ảnh AI Free</div>
                        </div>
                        <div className="text-white/15 text-2xl font-thin pb-5">+</div>
                        <div className="text-center">
                          <div className="text-[58px] font-black leading-none" style={{
                            background:'linear-gradient(135deg,#fbbf24,#fb923c)',
                            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                            letterSpacing:'-0.05em',
                          }}>1K</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{color:'#fbbf24'}}>Credits</div>
                        </div>
                      </div>

                      <p className="text-[11px] text-white/30 max-w-[220px] mx-auto leading-relaxed">
                        Không cần thẻ tín dụng · Nhận ngay · Dùng ngay
                      </p>
                    </div>

                    {/* Benefits — mỗi item KHÁC nhau hoàn toàn */}
                    <div className="px-6 py-4 space-y-2"
                      style={{borderTop:'1px solid rgba(255,255,255,.04)'}}>
                      {[
                        {icon:<ImageIcon size={14}/>, title:'50 Ảnh miễn phí',       sub:'Flux · Imagen · SDXL · Seedance · mọi style',     ic:'#a78bfa', ib:'rgba(139,92,246,.12)', border:'rgba(139,92,246,.22)'},
                        {icon:<Zap size={14}/>,       title:'1,000 Credits đa năng', sub:'Veo 3 · Grok · Kling · Voice · Music · 30+ tool',   ic:'#fbbf24', ib:'rgba(251,191,36,.1)',  border:'rgba(251,191,36,.2)'},
                        {icon:<Shield size={14}/>,    title:'Không ràng buộc',       sub:'Miễn phí mãi mãi · Nâng cấp khi muốn',            ic:'#34d399', ib:'rgba(52,211,153,.1)',  border:'rgba(52,211,153,.2)'},
                      ].map((b,i)=>(
                        <motion.div key={i} initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} transition={{delay:.05+i*.08}}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{background:b.ib, border:`1px solid ${b.border}`}}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{background:`rgba(255,255,255,.06)`, color:b.ic}}>
                            {b.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold leading-tight" style={{color:b.ic}}>{b.title}</p>
                            <p className="text-[10px] text-white/30 mt-0.5 leading-snug">{b.sub}</p>
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
                          {isAuthenticated ? 'Bắt đầu tạo ảnh miễn phí' : `Đăng ký & nhận ngay miễn phí`}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>

                      <div className="flex items-center justify-center gap-1.5 mt-2">
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
