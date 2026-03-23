
import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap, Terminal, ShieldCheck, Database, ArrowRight, Plug, Rocket } from 'lucide-react';

interface DeveloperPortalProps {
  onApply: () => void;
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ onApply }) => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
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
                  Tích hợp sức mạnh AI vào ứng dụng của bạn với SDK và API chuyên dụng. Hỗ trợ đa ngôn ngữ, tài liệu đầy đủ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Zap size={18} />, title: 'High-Speed API', desc: 'Endpoint độ trễ thấp, xử lý real-time.' },
                  { icon: <Terminal size={18} />, title: 'Unified SDK', desc: 'Python, JavaScript, C# — chọn ngôn ngữ bạn thích.' },
                  { icon: <ShieldCheck size={18} />, title: 'Bảo mật VPC', desc: 'Môi trường cloud riêng biệt cho mỗi dự án.' },
                  { icon: <Database size={18} />, title: 'Asset Registry', desc: 'Quản lý tập trung mọi tài sản AI.' },
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

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={onApply}
                  className="group inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-xl text-xs font-bold hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Đăng ký Developer Access
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="https://docs.skyverses.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:border-white/20 transition-all">
                  Xem tài liệu API
                </a>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:block">
              <div className="relative p-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                {/* Code Preview */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    <span className="ml-2 text-[10px] text-white/20 font-sans font-bold">skyverses-sdk.ts</span>
                  </div>
                  <div>
                    <span className="text-purple-400">import</span> <span className="text-white/80">{'{ Skyverses }'}</span> <span className="text-purple-400">from</span> <span className="text-emerald-400">'@skyverses/sdk'</span>
                  </div>
                  <div className="text-white/20">{'// Initialize client'}</div>
                  <div>
                    <span className="text-purple-400">const</span> <span className="text-brand-blue">ai</span> <span className="text-white/40">=</span> <span className="text-purple-400">new</span> <span className="text-amber-400">Skyverses</span><span className="text-white/40">{'({'}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-white/60">apiKey:</span> <span className="text-emerald-400">'sk_live_...'</span>
                  </div>
                  <div className="text-white/40">{'})'};</div>
                  <div className="mt-2">
                    <span className="text-purple-400">const</span> <span className="text-brand-blue">result</span> <span className="text-white/40">=</span> <span className="text-purple-400">await</span> <span className="text-brand-blue">ai</span><span className="text-white/40">.</span><span className="text-amber-400">generate</span><span className="text-white/40">{'({'}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-white/60">model:</span> <span className="text-emerald-400">'flux-pro'</span><span className="text-white/40">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-white/60">prompt:</span> <span className="text-emerald-400">'A futuristic city'</span>
                  </div>
                  <div className="text-white/40">{'})'};</div>
                </div>

                {/* Status bar */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/30">API Status: Operational</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/20">99.9% uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
