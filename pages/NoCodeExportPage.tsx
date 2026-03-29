import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Globe, Zap, ArrowRight, ExternalLink, Sparkles,
  Download, GitBranch, Rocket, Shield, Monitor, Layers,
  CheckCircle, Terminal, Package, Cloud, Cpu, Star, Copy
} from 'lucide-react';

const PRODUCT_URL = 'https://nocodexport.figma.site/';

// ═══ DATA ═══
const FEATURES = [
  {
    icon: <Globe size={22} />,
    title: 'Paste URL & Export',
    desc: 'Chỉ cần dán URL website bất kỳ — hệ thống tự động crawl, parse và xuất thành source code sạch.',
    color: 'text-brand-blue', bg: 'bg-brand-blue/10 border-brand-blue/15',
  },
  {
    icon: <Code2 size={22} />,
    title: 'Static HTML Export',
    desc: 'Xuất thành file HTML/CSS/JS tĩnh, clean source code — sẵn sàng deploy lên bất kỳ hosting nào.',
    color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/15',
  },
  {
    icon: <Cpu size={22} />,
    title: 'Auto Detect Mode',
    desc: 'Tự động nhận diện framework (React, Vue, Next.js...) và xuất code theo cấu trúc phù hợp.',
    color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/15',
  },
  {
    icon: <GitBranch size={22} />,
    title: 'Push to GitHub',
    desc: 'Kết nối GitHub và push code trực tiếp vào repository — workflow tự động, không cần CLI.',
    color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/15',
  },
  {
    icon: <Cloud size={22} />,
    title: 'Deploy to Vercel & More',
    desc: 'One-click deploy lên Vercel, Netlify, Cloudflare Pages. Live preview ngay lập tức.',
    color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/15',
  },
  {
    icon: <Shield size={22} />,
    title: 'Clean & Optimized',
    desc: 'Source code được tối ưu hoá, loại bỏ tracking scripts, minify assets — sẵn sàng production.',
    color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/15',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Dán URL', desc: 'Paste link website bạn muốn export vào thanh nhập liệu.', icon: <Copy size={20} /> },
  { step: '02', title: 'Chọn format', desc: 'Static HTML hoặc Auto Detect — tuỳ mục đích sử dụng.', icon: <Layers size={20} /> },
  { step: '03', title: 'Export', desc: 'Nhấn Export và nhận source code sạch trong vài giây.', icon: <Download size={20} /> },
  { step: '04', title: 'Publish', desc: 'Push to GitHub hoặc deploy trực tiếp lên Vercel, Netlify.', icon: <Rocket size={20} /> },
];

const USE_CASES = [
  { title: 'Clone & Customize Landing Page', desc: 'Export landing page mẫu, customize theo brand của bạn.' },
  { title: 'Backup Website', desc: 'Lưu trữ offline toàn bộ website dưới dạng static files.' },
  { title: 'Migration Framework', desc: 'Chuyển đổi website từ WordPress, Wix sang static site.' },
  { title: 'Learning & Study Code', desc: 'Phân tích source code của website bất kỳ để học hỏi.' },
  { title: 'Portfolio Builder', desc: 'Export template đẹp từ Figma sites và deploy ngay.' },
  { title: 'Speed Optimization', desc: 'Biến website nặng thành static site siêu nhanh.' },
];

const NoCodeExportPage: React.FC = () => {
  useEffect(() => {
    document.title = 'NoCodeExport — Export Any Website to Code | Skyverses';
  }, []);

  return (
    <div className="pt-20 bg-[#fcfcfd] dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500">

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden">
        {/* Background decors */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-blue/[0.04] to-transparent dark:from-brand-blue/[0.08] rounded-full blur-[120px]" />
          <div className="absolute bottom-[0%] right-[5%] w-[600px] h-[400px] bg-purple-500/[0.03] dark:bg-purple-500/[0.05] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 pt-12 pb-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full">
                  <Sparkles size={12} className="text-brand-blue" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">New Product</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/8 border border-emerald-500/15 rounded-full">
                  <Star size={10} className="text-emerald-500" fill="currentColor" />
                  <span className="text-[9px] font-bold text-emerald-500">Free to Use</span>
                </span>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
                  Export Any{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-500 to-cyan-400">
                    Website
                  </span>
                  {' '}to Code
                  <br />
                  & Publish{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-brand-blue">
                    Anywhere
                  </span>
                </h1>

                <p className="text-base md:text-lg text-slate-400 dark:text-gray-500 max-w-lg leading-relaxed">
                  Paste a URL — Get code — Push to GitHub, deploy to Vercel & More. 
                  Không cần code, không cần CLI. Mọi thứ chỉ với vài click.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a
                  href={PRODUCT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 bg-brand-blue text-white px-8 py-4 rounded-2xl text-sm font-bold hover:brightness-110 active:scale-[0.97] transition-all shadow-xl shadow-brand-blue/20"
                >
                  <Rocket size={18} />
                  Try NoCodeExport
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-black/[0.08] dark:border-white/[0.08] text-slate-600 dark:text-gray-400 hover:text-brand-blue hover:border-brand-blue/30 rounded-2xl text-sm font-bold transition-all"
                >
                  Cách hoạt động
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Trust Mini Stats */}
              <div className="flex items-center gap-6 pt-2">
                {[
                  { value: 'Free', label: 'Miễn phí' },
                  { value: '3s', label: 'Export time' },
                  { value: '100+', label: 'Formats' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-lg font-black text-brand-blue">{stat.value}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Product Screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] shadow-2xl shadow-black/10 dark:shadow-black/40">
                {/* Browser chrome */}
                <div className="bg-slate-100 dark:bg-[#1a1a1e] px-4 py-3 flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-white dark:bg-white/5 rounded-lg text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                      nocodexport.figma.site
                    </div>
                  </div>
                </div>
                <img
                  src="/nocode-export-hero.png"
                  alt="NoCodeExport Interface"
                  className="w-full h-auto"
                />
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-4 top-[30%] px-3 py-2 bg-white dark:bg-[#0e0e12] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 dark:text-white">Export Complete</p>
                  <p className="text-[8px] text-slate-400">2.3s • 15 files</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute -right-4 bottom-[20%] px-3 py-2 bg-white dark:bg-[#0e0e12] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  <GitBranch size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 dark:text-white">Pushed to GitHub</p>
                  <p className="text-[8px] text-slate-400">main branch • live</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue/8 border border-brand-blue/15 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue mb-4">
              <Terminal size={10} /> Cách hoạt động
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Chỉ <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">4 bước</span> đơn giản
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative group"
              >
                <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/5 transition-all h-full">
                  {/* Step number */}
                  <span className="text-[48px] font-black text-slate-100 dark:text-white/[0.03] leading-none absolute top-4 right-5 select-none">{item.step}</span>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-bold">{item.title}</h3>
                    <p className="text-sm text-slate-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                {/* Arrow connector */}
                {idx < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-slate-200 dark:text-gray-700">
                    <ArrowRight size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES GRID ═══════════ */}
      <section className="py-20 md:py-28 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/8 border border-purple-500/15 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-purple-500 mb-4">
              <Sparkles size={10} /> Tính năng
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Công cụ export <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-brand-blue">mạnh mẽ</span>
            </h2>
            <p className="text-sm text-slate-400 dark:text-gray-500 mt-3 max-w-lg mx-auto">
              Mọi thứ bạn cần để chuyển đổi website thành source code — từ crawling, parsing đến deploy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.08, duration: 0.5, type: 'spring', stiffness: 120 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20 dark:hover:border-brand-blue/15 hover:shadow-xl hover:shadow-brand-blue/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 dark:text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ USE CASES ═══════════ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/8 border border-cyan-500/15 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-4">
              <Package size={10} /> Use Cases
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Sử dụng cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-brand-blue">mọi mục đích</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((uc, idx) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="flex items-start gap-3.5 p-5 rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/15 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1">{uc.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{uc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER CTA ═══════════ */}
      <section className="pb-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c0e1a] via-[#0e1028] to-[#130a22]"
          >
            {/* Background decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-[20%] w-[400px] h-[300px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 py-20 md:py-28 px-8 md:px-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">
                  <Rocket size={10} /> Sẵn sàng export
                </span>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  Export website
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-purple-400 to-cyan-400">
                    ngay bây giờ.
                  </span>
                </h2>

                <p className="text-base text-white/35 leading-relaxed max-w-md mx-auto">
                  Hoàn toàn miễn phí. Paste URL, chọn format, nhấn Export. Đơn giản vậy thôi.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <a
                    href={PRODUCT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 bg-brand-blue text-white px-10 py-5 rounded-2xl text-sm font-bold hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-brand-blue/20"
                  >
                    <ExternalLink size={18} />
                    Try NoCodeExport
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="/booking"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-2xl text-sm font-bold transition-all"
                  >
                    Liên hệ tư vấn
                    <ArrowRight size={14} />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Powered By Footer */}
      <div className="text-center pb-12">
        <p className="text-[10px] text-slate-300 dark:text-gray-600">
          © 2020-2025 SKYVERSES CO.,LTD. All rights reserved. Build by{' '}
          <span className="text-brand-blue font-bold">Skyverses</span>
        </p>
      </div>
    </div>
  );
};

export default NoCodeExportPage;
