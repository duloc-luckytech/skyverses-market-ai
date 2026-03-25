
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck, Zap, Globe2, Cpu, ArrowRight, Sparkles } from 'lucide-react';
import { CaptchaTab } from '../../hooks/useCaptchaToken';

interface CaptchaHeroProps {
  activeTab: CaptchaTab;
  setActiveTab: (tab: CaptchaTab) => void;
}

export const CaptchaHero: React.FC<CaptchaHeroProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: CaptchaTab; label: string; icon: React.ReactNode }[] = [
    { id: 'CONNECT', label: 'Kết nối', icon: <Zap size={14} /> },
    { id: 'PAYMENTS', label: 'Thanh toán', icon: <Sparkles size={14} /> },
    { id: 'DOCS', label: 'API Docs', icon: <Cpu size={14} /> },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e1a] via-[#0e1028] to-[#130a22] rounded-[2.5rem]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[400px] h-[300px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 px-8 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Link to="/apps" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-white/30 hover:text-indigo-400 transition-colors tracking-[0.2em] mb-8 group">
            <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Trở lại ứng dụng
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-7">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">
                <ShieldCheck size={11} />
                API Service
              </span>
            </motion.div>

            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Captcha Token
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  Service API
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg text-white/40 leading-relaxed max-w-lg"
            >
              Dịch vụ giải mã Captcha tốc độ cao cho Google VEO3 & FX Lab. Tích hợp qua REST API với token authentication — tự động hoá quy trình tạo video, ảnh AI.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { value: '~3s', label: 'Avg Solve', icon: <Zap size={12} /> },
                { value: '99.8%', label: 'Success Rate', icon: <ShieldCheck size={12} /> },
                { value: '24/7', label: 'Uptime', icon: <Globe2 size={12} /> },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-indigo-400">
                    {s.icon}
                  </div>
                  <div>
                    <span className="block text-lg font-black text-white">{s.value}</span>
                    <span className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em]">{s.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <button
                onClick={() => document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-400 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
              >
                Xem bảng giá
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setActiveTab('DOCS')}
                className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white/70 px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/[0.08] hover:text-white transition-all"
              >
                Xem API Docs
              </button>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Code snippet visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full scale-75 pointer-events-none" />
              <div className="relative bg-[#0d1117] border border-white/[0.06] rounded-2xl p-6 shadow-2xl font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-[10px] text-white/20 font-sans font-bold">captcha-api.ts</span>
                </div>
                <div className="space-y-1 text-[13px] leading-relaxed">
                  <div><span className="text-purple-400">const</span> <span className="text-cyan-300">response</span> <span className="text-white/40">=</span> <span className="text-purple-400">await</span> <span className="text-yellow-300">fetch</span><span className="text-white/40">(</span></div>
                  <div className="pl-4"><span className="text-green-400">'https://captcha.skyverses.com/solve'</span><span className="text-white/40">,</span></div>
                  <div className="pl-4"><span className="text-white/40">{'{'}</span></div>
                  <div className="pl-8"><span className="text-cyan-300">method</span><span className="text-white/40">:</span> <span className="text-green-400">'POST'</span><span className="text-white/40">,</span></div>
                  <div className="pl-8"><span className="text-cyan-300">headers</span><span className="text-white/40">: {'{'}</span></div>
                  <div className="pl-12"><span className="text-green-400">'X-API-Key'</span><span className="text-white/40">:</span> <span className="text-orange-300">API_KEY</span></div>
                  <div className="pl-8"><span className="text-white/40">{'}'}</span></div>
                  <div className="pl-4"><span className="text-white/40">{'}'}</span></div>
                  <div><span className="text-white/40">)</span></div>
                  <div className="mt-2"><span className="text-gray-500">// ✅ Token solved in ~3s</span></div>
                  <div><span className="text-purple-400">const</span> <span className="text-cyan-300">{'{ token }'}</span> <span className="text-white/40">=</span> <span className="text-purple-400">await</span> <span className="text-cyan-300">response</span><span className="text-white/40">.</span><span className="text-yellow-300">json</span><span className="text-white/40">()</span></div>
                </div>
                {/* Glow line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -right-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live • 99.8% Uptime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
