
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Sparkles, ArrowRight, ExternalLink,
  MessageSquare, Zap, Lock, Eye, Code2, BrainCircuit,
  Cpu, Shield, Server, Terminal, Globe, Layers,
  CheckCircle2, Star, Settings2, MonitorSmartphone
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

const PRODUCT_URL = 'https://ai-api.skyverses.com';

// ═══ HERO DATA ═══
const MODEL_FAMILIES = [
  { name: 'Qwen3.5 4B', tag: 'Fastest', hot: true },
  { name: 'Qwen3.5 9B', tag: 'Smartest' },
  { name: 'Qwen2.5 VL 3B', tag: 'Vision' },
];

const SPECS = [
  { icon: <Cpu size={12} />, label: '3 AI Models', sub: 'Qwen 3.5 family' },
  { icon: <Zap size={12} />, label: '50+ tokens/s', sub: 'GPU Accelerated' },
  { icon: <Lock size={12} />, label: '100% Private', sub: 'No data shared' },
  { icon: <Code2 size={12} />, label: 'OpenAI API', sub: 'REST compatible' },
];

// ═══ WORKFLOW DATA ═══
const STEPS = [
  {
    step: '01', title: 'Truy cập Chat', icon: <Globe size={18} />,
    desc: 'Mở trình duyệt, truy cập Ollama Chat Studio. Không cần đăng ký, không cần API key — sẵn sàng chat ngay lập tức.',
    tags: ['No Login', 'Instant Access'],
  },
  {
    step: '02', title: 'Chọn AI Model', icon: <Layers size={18} />,
    desc: 'Chọn model phù hợp: Qwen3.5 4B (nhanh nhất), Qwen3.5 9B (thông minh nhất), hoặc Qwen2.5 VL (Vision/OCR).',
    tags: ['3 Models', 'Fast / Deep Mode'],
  },
  {
    step: '03', title: 'Chat & Đính kèm', icon: <MessageSquare size={18} />,
    desc: 'Gõ tin nhắn tiếng Việt hoặc tiếng Anh. Hỗ trợ đính kèm ảnh để AI phân tích, đọc text (OCR), mô tả hình ảnh.',
    tags: ['Đa ngôn ngữ', 'Image Attach', 'OCR'],
  },
  {
    step: '04', title: 'Tích hợp API', icon: <Terminal size={18} />,
    desc: 'Sử dụng REST API chuẩn OpenAI để tích hợp vào ứng dụng. Tương thích n8n, LangChain, Cursor, Continue.dev.',
    tags: ['OpenAI Format', 'No API Key', 'Stream'],
  },
];

// ═══ MODES DATA ═══
const MODES = [
  {
    icon: <Zap size={18} />, accent: 'emerald', label: 'Qwen3.5 4B', sub: 'Fastest',
    desc: 'Tốc độ cực nhanh — phù hợp chat thường, hỏi đáp, brainstorm, viết nội dung nhanh. Hỗ trợ Vision.',
    features: [
      '⚡ 50+ tokens/giây',
      '🖼 Vision Support — phân tích ảnh',
      '💬 Chat thường, brainstorm',
      '🔄 Streaming response',
    ],
  },
  {
    icon: <BrainCircuit size={18} />, accent: 'purple', label: 'Qwen3.5 9B', sub: 'Smartest',
    desc: 'Suy luận chuyên sâu — giải quyết bài toán phức tạp, phân tích code, viết tài liệu kỹ thuật.',
    features: [
      '🧠 Deep Thinking Mode',
      '📊 Phân tích phức tạp',
      '💻 Code Expert — debug & review',
      '📝 Viết tài liệu kỹ thuật',
    ],
  },
  {
    icon: <Eye size={18} />, accent: 'cyan', label: 'Qwen2.5 VL 3B', sub: 'Vision Specialist',
    desc: 'Chuyên gia thị giác — đọc text từ ảnh chụp, phân tích hình ảnh, mô tả chi tiết từng element.',
    features: [
      '👁 Image Analysis chi tiết',
      '📝 OCR — đọc text từ ảnh',
      '🔍 Nhận diện object \u0026 scene',
      '📋 Trích xuất dữ liệu từ ảnh',
    ],
  },
];

const accentBorder: Record<string, string> = {
  emerald: 'border-emerald-500/15 hover:border-emerald-500/30',
  purple: 'border-purple-500/15 hover:border-purple-500/30',
  cyan: 'border-cyan-500/15 hover:border-cyan-500/30'
};
const iconBg: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
  purple: 'bg-purple-500/10 text-purple-500 dark:text-purple-400',
  cyan: 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400'
};
const checkColor: Record<string, string> = {
  emerald: 'text-emerald-500 dark:text-emerald-400',
  purple: 'text-purple-500 dark:text-purple-400',
  cyan: 'text-cyan-500 dark:text-cyan-400'
};

// ═══ INTEGRATIONS ═══
const INTEGRATIONS = [
  { name: 'n8n', desc: 'Workflow automation' },
  { name: 'LangChain', desc: 'AI framework' },
  { name: 'Cursor', desc: 'AI code editor' },
  { name: 'Continue.dev', desc: 'VS Code AI' },
  { name: 'Claude Code', desc: 'Terminal AI' },
];

// ═══ USE CASES ═══
const USE_CASES = [
  { title: 'Chat AI thường', desc: 'Hỏi đáp, brainstorm, viết nội dung, sáng tạo — như ChatGPT nhưng miễn phí.' },
  { title: 'Code Assistant', desc: 'Viết, debug, review code. Hỗ trợ mọi ngôn ngữ: Python, JS, Go, Rust...' },
  { title: 'Phân tích hình ảnh', desc: 'Upload ảnh, AI phân tích, mô tả, trích xuất text (OCR) tự động.' },
  { title: 'Tích hợp Workflow', desc: 'Kết nối API vào n8n, LangChain để tự động hoá quy trình AI.' },
  { title: 'Nghiên cứu & Học tập', desc: 'Giải thích khái niệm, tóm tắt tài liệu, dịch đa ngôn ngữ.' },
  { title: 'Content Creation', desc: 'Viết bài, kể chuyện, brainstorm — với deep reasoning mode.' },
];


const QwenChatAIPage: React.FC = () => {
  usePageMeta({
    title: 'Qwen AI Chat — Free Local AI | Skyverses',
    description: 'Chat AI miễn phí với Qwen 3.5 chạy 100% local. Nhanh, riêng tư, hỗ trợ Vision và Deep Reasoning.',
    keywords: 'AI chat, Qwen, local AI, free, vision, API, Skyverses',
    canonical: '/product/qwen-chat-ai'
  });

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pt-16 transition-colors duration-300">

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-purple-600/[0.04] dark:bg-purple-600/[0.08] rounded-full blur-[200px]" />
          <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-cyan-600/[0.03] dark:bg-cyan-600/[0.05] rounded-full blur-[180px]" />
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          {/* LEFT */}
          <div className="lg:col-span-6 space-y-7">
            <Link to="/markets" className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-purple-500 dark:hover:text-purple-400 transition-colors tracking-wider">
              <ChevronLeft size={14} /> Trở lại
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/[0.08] border border-purple-500/15 rounded-full text-purple-500 dark:text-purple-400 text-[10px] font-semibold uppercase tracking-wider">
                  <Sparkles size={12} /> AI Chat Local
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full text-emerald-500 text-[10px] font-semibold">
                  <Star size={10} fill="currentColor" /> Free
                </div>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
                Qwen <br /><span className="text-purple-500 dark:text-purple-400">Chat AI</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
                Chat với AI chạy 100% local — nhanh, riêng tư, không gửi dữ liệu ra ngoài.
                Hỗ trợ Vision, Deep Reasoning, và OpenAI-compatible REST API.
              </p>
            </motion.div>

            {/* Model family pills */}
            <div className="space-y-2">
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#444] tracking-wider">Available Models</p>
              <div className="flex flex-wrap gap-1.5">
                {MODEL_FAMILIES.map(m => (
                  <div key={m.name} className={`px-2.5 py-1 rounded-lg text-[9px] font-medium border transition-all ${m.hot ? 'bg-purple-500/10 border-purple-500/25 text-purple-500 dark:text-purple-400' : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.04] text-slate-500 dark:text-[#666]'}`}>
                    {m.name} <span className="text-slate-400 dark:text-[#444] ml-1">· {m.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-2">
              {SPECS.map(s => (
                <div key={s.label} className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 group hover:border-purple-500/20 transition-all">
                  <div className="shrink-0 w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400">{s.icon}</div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{s.label}</p>
                    <p className="text-[8px] font-medium text-slate-400 dark:text-[#444]">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={PRODUCT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 group w-fit"
            >
              <MessageSquare size={14} /> Mở Chat Studio <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* RIGHT - Chat Preview */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] shadow-2xl shadow-black/10 dark:shadow-black/40">
                {/* Chat UI Preview */}
                <div className="bg-[#0c0d14] min-h-[520px] flex flex-col">
                  {/* Sidebar + Main area mock */}
                  <div className="flex h-full min-h-[520px]">
                    {/* Sidebar */}
                    <div className="w-[180px] border-r border-white/[0.04] p-3 flex flex-col shrink-0 hidden md:flex">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-md bg-purple-600/20 flex items-center justify-center text-sm">🦙</div>
                        <div>
                          <p className="text-[10px] font-bold text-white/90">Ollama Studio</p>
                          <p className="text-[7px] text-gray-600">Local AI Chat</p>
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-purple-600 rounded-lg text-[9px] font-semibold text-white text-center mb-3">+ New Chat</div>
                      <div className="flex-1" />
                      <div className="space-y-2 border-t border-white/[0.04] pt-3">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/[0.03] rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[8px] font-medium text-white/60">Qwen3.5 4B ⚡</span>
                        </div>
                        <div className="px-2 py-1.5 bg-white/[0.03] rounded-lg flex items-center gap-2">
                          <span className="text-[8px]">⚡</span>
                          <span className="text-[8px] font-medium text-white/50">Fast Mode</span>
                        </div>
                        <p className="text-[7px] text-gray-700 text-center pt-1">Developed by <span className="text-purple-400 font-bold">Skyverses</span></p>
                      </div>
                    </div>

                    {/* Main chat area */}
                    <div className="flex-1 flex flex-col p-5">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🦙</span>
                          <div>
                            <p className="text-xs font-bold text-white/90">Ollama Chat Studio</p>
                            <p className="text-[8px] text-gray-600">qwen3.5:4b</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {['● Online', '📚 API', '🖥️ Hardware'].map(b => (
                            <span key={b} className="px-2 py-1 bg-white/[0.03] border border-white/[0.05] rounded text-[8px] font-medium text-gray-500">{b}</span>
                          ))}
                        </div>
                      </div>

                      {/* Center content */}
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-4xl mb-3">🦙</div>
                        <h3 className="text-sm font-bold text-white/90 mb-1">Ollama Chat Studio</h3>
                        <p className="text-[9px] text-gray-600 text-center max-w-[240px] mb-5">Chat với AI chạy 100% local. Nhanh, riêng tư, không gửi data ra ngoài.</p>

                        {/* Quick start cards */}
                        <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                          {[
                            { emoji: '👋', title: 'Xin chào', sub: 'Bắt đầu nói chuyện' },
                            { emoji: '💻', title: 'Code Python', sub: 'Viết code nhanh' },
                            { emoji: '🧠', title: 'Giải thích AI', sub: 'Hiểu công nghệ' },
                            { emoji: '📖', title: 'Kể chuyện', sub: 'Sáng tạo nội dung' },
                          ].map((c) => (
                            <div key={c.title} className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:border-purple-500/20 transition-colors">
                              <span className="text-sm">{c.emoji}</span>
                              <p className="text-[9px] font-bold text-white/80 mt-1">{c.title}</p>
                              <p className="text-[7px] text-gray-600">{c.sub}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Input bar */}
                      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 mt-4">
                        <span className="text-gray-600">📎</span>
                        <span className="text-[10px] text-gray-600 flex-1">Message Ollama... (Shift+Enter for new line)</span>
                        <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
                          <span className="text-white text-[10px]">▶</span>
                        </div>
                      </div>
                      <p className="text-[7px] text-gray-700 text-center mt-2">Powered by <span className="text-gray-500">Ollama</span> • 100% Local — <span className="text-purple-400">Skyverses</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                className="absolute -left-3 top-[28%] px-3 py-2 bg-white dark:bg-[#0e0e12] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Shield size={12} /></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-800 dark:text-white">100% Private</p>
                  <p className="text-[7px] text-slate-400">No data shared</p>
                </div>
              </motion.div>

              {/* Floating badge right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                className="absolute -right-3 bottom-[22%] px-3 py-2 bg-white dark:bg-[#0e0e12] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center"><Zap size={12} /></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-800 dark:text-white">50+ tokens/s</p>
                  <p className="text-[7px] text-slate-400">GPU Accelerated</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ WORKFLOW SECTION ═══════════ */}
      <section className="py-24 border-y border-black/[0.06] dark:border-white/[0.04] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-3 mb-16">
            <span className="text-purple-500/60 dark:text-purple-400 font-semibold uppercase tracking-wider text-[9px]">How It Works</span>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">4 bước <span className="text-purple-500 dark:text-purple-400">sử dụng AI</span></h2>
            <p className="text-slate-500 dark:text-[#555] font-medium text-sm max-w-lg mx-auto">Từ mở trình duyệt đến tích hợp API — mọi thứ đều miễn phí.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className="p-5 bg-black/[0.01] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-2xl flex gap-4 group hover:border-purple-500/20 transition-all"
              >
                <div className="shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform">{s.icon}</div>
                  <p className="text-[7px] font-medium text-slate-300 dark:text-[#333] text-center mt-1">{s.step}</p>
                </div>
                <div className="space-y-2 min-w-0">
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-[#555] font-medium leading-relaxed">{s.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.04] rounded text-[7px] font-medium text-slate-400 dark:text-[#444]">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MODELS SECTION ═══════════ */}
      <section className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-3 mb-14">
            <span className="text-purple-500/60 dark:text-purple-400 font-semibold uppercase tracking-wider text-[9px]">3 AI Models</span>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Powered by <span className="text-purple-500 dark:text-purple-400">Qwen 3.5</span></h2>
            <p className="text-slate-500 dark:text-[#555] font-medium text-sm max-w-xl mx-auto">Chọn model phù hợp: chat nhanh, suy luận chuyên sâu, hoặc phân tích hình ảnh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MODES.map(m => (
              <div key={m.sub} className={`p-5 bg-black/[0.01] dark:bg-white/[0.015] border rounded-2xl space-y-4 transition-all ${accentBorder[m.accent]}`}>
                <div className="flex justify-between items-start">
                  <div className={`w-9 h-9 rounded-xl ${iconBg[m.accent]} flex items-center justify-center`}>{m.icon}</div>
                  <span className="text-[7px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#444]">{m.sub}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{m.label}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-[#555] font-medium leading-relaxed">{m.desc}</p>
                </div>
                <ul className="space-y-1.5 pt-1">
                  {m.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[9px] font-medium text-slate-500 dark:text-[#555]">
                      <CheckCircle2 size={10} className={`${checkColor[m.accent]} shrink-0 mt-0.5`} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ API & INTEGRATIONS ═══════════ */}
      <section className="py-24 border-y border-black/[0.06] dark:border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Code block */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] shadow-xl">
                <div className="bg-slate-100 dark:bg-[#1a1a1e] px-4 py-2.5 flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono ml-2">curl — Chat Completions</span>
                </div>
                <pre className="bg-[#0c0d14] p-5 text-[10px] text-gray-400 font-mono overflow-x-auto leading-relaxed">
{`curl ${PRODUCT_URL}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen3.5:4b",
    "messages": [
      { "role": "user",
        "content": "Xin chào!" }
    ],
    "stream": true
  }'`}
                </pre>
              </div>
            </motion.div>

            {/* Right: Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div className="space-y-3">
                <span className="text-purple-500/60 dark:text-purple-400 font-semibold uppercase tracking-wider text-[9px]">Developer API</span>
                <h2 className="text-3xl font-bold tracking-tight">
                  OpenAI-Compatible <span className="text-purple-500 dark:text-purple-400">REST API</span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-[#555] font-medium leading-relaxed">
                  Tích hợp AI vào ứng dụng của bạn với API chuẩn OpenAI format. Không cần API key — server chạy local,
                  mọi endpoint đều public.
                </p>
              </div>

              {/* Spec list */}
              <div className="space-y-3">
                {[
                  { l: 'Endpoint', v: '/v1/chat/completions', icon: <Server size={12} /> },
                  { l: 'Auth', v: 'None required', icon: <Lock size={12} /> },
                  { l: 'Streaming', v: 'SSE supported', icon: <Zap size={12} /> },
                  { l: 'Format', v: 'OpenAI compatible', icon: <Code2 size={12} /> },
                ].map(stat => (
                  <div key={stat.l} className="flex justify-between items-center border-b border-black/5 dark:border-white/[0.06] pb-3 group">
                    <div className="flex items-center gap-2.5">
                      <span className="text-purple-500 group-hover:scale-110 transition-transform">{stat.icon}</span>
                      <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-wider">{stat.l}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-white/80">{stat.v}</span>
                  </div>
                ))}
              </div>

              {/* Integration badges */}
              <div className="space-y-2">
                <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#444] tracking-wider">Tích hợp dễ dàng</p>
                <div className="flex flex-wrap gap-2">
                  {INTEGRATIONS.map(i => (
                    <span key={i.name} className="px-3 py-1.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-xl text-[9px] font-bold text-slate-600 dark:text-gray-400 hover:border-purple-500/20 transition-colors">
                      {i.name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ USE CASES ═══════════ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-3 mb-14">
            <span className="text-emerald-500/60 dark:text-emerald-400 font-semibold uppercase tracking-wider text-[9px]">Use Cases</span>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">Sử dụng cho <span className="text-emerald-500 dark:text-emerald-400">mọi mục đích</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {USE_CASES.map((uc, idx) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] hover:border-purple-500/15 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold mb-0.5">{uc.title}</h4>
                  <p className="text-[9px] text-slate-500 dark:text-[#555] font-medium leading-relaxed">{uc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-32 text-center relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-violet-800">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none text-[160px] font-bold text-white leading-none tracking-tight flex items-center justify-center whitespace-nowrap">
          QWEN QWEN
        </div>
        <div className="max-w-2xl mx-auto space-y-8 relative z-10 px-6">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Chat AI <br /><span className="text-white/40">miễn phí.</span>
            </h2>
            <p className="text-sm text-white/50 font-medium max-w-md mx-auto">
              Không cần đăng ký, không cần API key. Mở trình duyệt và bắt đầu chat với Qwen AI ngay lập tức.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={PRODUCT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-purple-700 px-8 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2 group"
            >
              <ExternalLink size={14} /> Mở Chat Studio <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <Link to="/markets" className="bg-white/10 text-white/80 border border-white/15 px-8 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md">
              Xem giải pháp khác
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QwenChatAIPage;
