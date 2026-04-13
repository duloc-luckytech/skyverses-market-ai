# Character Sync AI - COMPLETE CODEBASE REFERENCE

## Files Summary
All requested files have been read and compiled below:

---

# 1. PRODUCT PAGE: ProductCharacterSync.tsx
**File Path:** `/pages/ProductCharacterSync.tsx` (343 lines)
**Status:** ✅ Complete product page component

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Fingerprint, ArrowRight, Users, CheckCircle2, X,
  Upload, UserCheck, Zap, Activity, Star,
  ChevronLeft, BrainCircuit, RefreshCw, Maximize2,
  Database, ChevronRight, Sparkles
} from 'lucide-react';
import CharacterSyncWorkspace from '../components/CharacterSyncWorkspace';
import { usePageMeta } from '../hooks/usePageMeta';

/* ─── DATA ─── */
const FEATURES = [
  { icon: <Fingerprint />, title: 'DNA Anchoring', desc: 'Upload lên 10 ảnh để định danh nhân vật. Mỗi ảnh trở thành nguồn sự thật hình ảnh.' },
  { icon: <BrainCircuit />, title: 'Semantic Binding', desc: 'Prompt tham chiếu nhân vật theo tên — y như kịch bản đạo diễn chuyên nghiệp.' },
  { icon: <Activity />, title: 'Context Memory', desc: 'AI ghi nhớ mối quan hệ nhân vật và đặc điểm tính cách xuyên suốt.' },
  { icon: <RefreshCw />, title: 'Zero-Drift Sync', desc: 'Duy trì khuôn mặt, tóc, trang phục ổn định ở mọi tư thế và góc nhìn.' },
  { icon: <Users />, title: 'Multi-Actor Control', desc: 'Tham chiếu đồng thời đến 3 nhân vật trong một cảnh mà không bị lẫn.' },
  { icon: <Database />, title: 'Shared Library', desc: 'Kho nhân vật tập trung — tái sử dụng xuyên suốt mọi dự án và video.' },
];

const PROBLEMS = [
  'Nhân vật thay đổi khuôn mặt mỗi lần generate.',
  'Trang phục và phong cách trôi dạt giữa các prompt.',
  'AI không ghi nhớ đặc điểm nhân vật dài hạn.',
  'Quản lý nhiều nhân vật trong một cảnh rất hỗn loạn.',
];

const WORKFLOW = [
  { step: '01', title: 'Upload ảnh nhân vật', desc: 'Upload 1-10 ảnh để xây dựng bộ DNA hình ảnh.', icon: <Upload size={20} /> },
  { step: '02', title: 'Đặt tên & vai trò', desc: 'Gán tên (VD: Luna) và mô tả tính cách.', icon: <UserCheck size={20} /> },
  { step: '03', title: 'Viết kịch bản', desc: '"Luna bước vào phòng lab" → AI tự áp dụng DNA.', icon: <Zap size={20} /> },
  { step: '04', title: 'Tổng hợp & lặp lại', desc: 'AI xử lý và xuất ảnh/video nhất quán.', icon: <Maximize2 size={20} /> },
];

const COMPARISON = [
  { label: 'Visual Memory', old: 'Ngẫu nhiên', new: 'Cố định vĩnh viễn' },
  { label: 'Tham chiếu nhân vật', old: 'Re-prompt thủ công', new: 'Gọi tên trực tiếp' },
  { label: 'Identity Drifting', old: 'Thường xuyên', new: 'Zero-Drift' },
  { label: 'Lịch sử', old: 'Không có', new: 'Full Registry' },
];

const USE_CASES = [
  { emoji: '📚', title: 'Truyện tranh AI', desc: 'Nhân vật nhất quán qua mọi trang' },
  { emoji: '🎬', title: 'Phim ngắn AI', desc: 'Diễn viên ảo xuyên suốt cốt truyện' },
  { emoji: '📱', title: 'Content Series', desc: 'Persona thống nhất cho social media' },
  { emoji: '🎮', title: 'Game Characters', desc: 'NPC nhất quán trong game AI' },
  { emoji: '📰', title: 'AI Anchor', desc: 'MC ảo cho bản tin, podcast' },
  { emoji: '👗', title: 'Virtual Model', desc: 'Model ảo cho lookbook, quảng cáo' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const ProductCharacterSync = () => {
  usePageMeta({
    title: 'Character Sync AI — Nhất quán nhân vật | Skyverses',
    description: 'Duy trì nhất quán hình ảnh nhân vật xuyên suốt ảnh, cảnh, truyện tranh và video bằng AI.',
    keywords: 'character sync, AI identity, consistency, Skyverses',
    canonical: '/product/character-sync-ai'
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-black animate-in fade-in duration-500">
        <CharacterSyncWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050508] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 transition-colors duration-500">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-purple-500/8 via-violet-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full z-10 space-y-12 text-center">
          <motion.div {...fadeUp(0)}>
            <Link to="/market" className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-purple-500 transition-colors mb-6">
              <ChevronLeft size={14} /> Quay lại
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase tracking-[0.15em]">
            <Fingerprint size={14} /> Identity Persistence Engine
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            Nhất quán nhân vật
            <br />
            <span className="bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              xuyên mọi sáng tạo
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Định danh nhân vật một lần — duy trì 100% nhất quán trên mọi ảnh, cảnh, truyện tranh và video AI.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button onClick={() => setIsStudioOpen(true)}
              className="group bg-gradient-to-r from-purple-500 to-violet-600 text-white px-10 py-5 rounded-2xl font-bold text-sm shadow-[0_20px_50px_rgba(147,51,234,0.25)] hover:shadow-[0_25px_60px_rgba(147,51,234,0.35)] hover:scale-[1.02] transition-all flex items-center gap-3">
              <Fingerprint size={18} />
              Thử Character Sync
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#features" className="px-10 py-5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              Tìm hiểu thêm
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-6 pt-6">
            {['DNA Lock', 'Zero-Drift', 'Multi-Actor', 'Name Reference'].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Visual Preview */}
        <motion.div {...fadeUp(0.5)} className="relative max-w-5xl mx-auto mt-16 w-full border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c10] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="h-10 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/80 dark:bg-white/[0.02] flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-3 uppercase tracking-wider">Character Sync — Studio</span>
          </div>
          <div className="aspect-[16/7] bg-gradient-to-br from-slate-100 via-purple-50/20 to-slate-50 dark:from-[#0a0a0e] dark:via-purple-950/10 dark:to-[#0c0c12] flex items-center justify-center relative group cursor-pointer"
            onClick={() => setIsStudioOpen(true)}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-500 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
                <Fingerprint size={32} />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-purple-500 transition-colors">Click để mở Studio</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Upload ảnh → Đặt tên → Viết kịch bản</p>
            </div>
            <div className="absolute top-6 right-6 px-3 py-1.5 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">DNA Ready</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp()} className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Vì sao nhất quán nhân vật <span className="text-red-400">rất khó</span> với AI?
            </h2>
            <div className="space-y-4">
              {PROBLEMS.map(point => (
                <div key={point} className="flex gap-3 items-start group">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <X size={12} strokeWidth={3} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.15)} className="p-8 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl relative overflow-hidden">
            <div className="grid grid-cols-3 gap-2.5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-slate-100 dark:bg-white/[0.03] rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/[0.04]">
                  <img src={`https://i.pravatar.cc/300?u=err${i}`} className="w-full h-full object-cover opacity-25 grayscale" alt="" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-500 text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xl -rotate-6">Broken Identity</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SOLUTION / FEATURES ═══ */}
      <section id="features" className="py-32 border-t border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Character Sync <span className="text-purple-500">giải quyết</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Một Character Layer nằm trên prompt — định danh nhân vật một lần, tham chiếu bằng tên xuyên suốt mọi dự án.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="p-8 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl space-y-5 group hover:border-purple-500/20 hover:shadow-lg dark:hover:shadow-purple-500/5 transition-all duration-500">
                <div className="w-12 h-12 border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-purple-500 group-hover:border-purple-500/30 transition-all rounded-xl">
                  {React.cloneElement(f.icon as React.ReactElement<any>, { size: 22 })}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white/90">{f.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Quy trình <span className="text-purple-500">đơn giản</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Chỉ 4 bước để có nhân vật nhất quán</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKFLOW.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="flex gap-5 p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl group hover:border-purple-500/20 transition-all">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Bước {s.step}</span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white/90">{s.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              So sánh <span className="text-purple-500">ưu việt</span>
            </h2>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.04]">
                  <th className="p-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiêu chí</th>
                  <th className="p-5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">AI Truyền thống</th>
                  <th className="p-5 text-center text-[11px] font-bold uppercase tracking-wider text-purple-500">Character Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {COMPARISON.map(row => (
                  <tr key={row.label} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-sm font-semibold text-slate-700 dark:text-white/80">{row.label}</td>
                    <td className="p-5 text-center text-sm text-red-400 font-medium">✗ {row.old}</td>
                    <td className="p-5 text-center text-sm text-emerald-500 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} /> {row.new}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Ứng dụng <span className="text-purple-500">đa dạng</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Từ truyện tranh đến phim ngắn — nhân vật AI luôn nhất quán.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl text-center group hover:border-purple-500/20 hover:shadow-md transition-all">
                <span className="text-3xl">{uc.emoji}</span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white/90 mt-3">{uc.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-40 text-center relative overflow-hidden border-t border-slate-100 dark:border-white/[0.03] bg-white dark:bg-[#050508] transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div {...fadeUp()} className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
              Xây dựng thế giới <br />
              <span className="text-purple-500">nhân vật AI</span>
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Định danh nhân vật một lần — sáng tạo câu chuyện mãi mãi.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setIsStudioOpen(true)}
              className="group bg-gradient-to-r from-purple-500 to-violet-600 text-white px-14 py-6 rounded-2xl text-sm font-bold shadow-[0_25px_60px_rgba(147,51,234,0.3)] hover:shadow-[0_30px_70px_rgba(147,51,234,0.4)] hover:scale-[1.03] transition-all inline-flex items-center gap-3">
              <Fingerprint size={18} />
              Bắt đầu tạo nhân vật
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/booking"
              className="px-10 py-6 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              Enterprise Access
            </Link>
          </motion.div>
          <motion.div {...fadeUp(0.25)} className="flex items-center justify-center gap-2 pt-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Được tin dùng bởi 800+ creators</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductCharacterSync;
```

---

# 2. APP.TSX - ROUTE DEFINITION (Around Line 245)

**File Path:** `/App.tsx`
**Relevant Section:** Lines 66, 129, 245

**Import statement (line 66):**
```tsx
charSync: () => import('./pages/ProductCharacterSync'),
```

**Lazy load (line 129):**
```tsx
const ProductCharacterSync = React.lazy(pageImports.charSync);
```

**Route definition (line 245):**
```tsx
<Route path="/product/character-sync-ai" element={<ProductCharacterSync />} />
```

---

# 3. CHARACTER_SYNC_AI_EXPLORATION.md - FULL CONTENT

[See above - the exploration document was read and contains comprehensive mapping]

---

# 4. DATA STRUCTURE & CONSTANTS

## data.ts - Character Sync Reference
No dedicated character-sync product definition in SOLUTIONS array, but there is a use case reference:

```typescript
{
  id: 'uc-1',
  industry: 'Marketing',
  problem: 'High cost of photoshoot for seasonal campaigns.',
  solution: 'Used Character Sync AI to maintain brand ambassadors across all digital ads.',
  outcome: '85% reduction in production costs and 3x faster delivery.',
  icon: 'Megaphone'
}
```

## constants/market-config.tsx - Home Block Options

```typescript
export interface HomeBlockOption {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
}

export const HOME_BLOCK_OPTIONS: HomeBlockOption[] = [
  { 
    id: 'top-choice', 
    label: 'Top Choice', 
    title: 'Top Choice',
    subtitle: 'Lựa chọn hàng đầu cho hiệu suất sáng tạo vượt trội',
    icon: <Flame size={14}/>, 
    color: 'text-orange-500' 
  },
  // ... other options
];
```

---

## KEY FINDINGS FOR REMAKE

### ✅ Current Structure
1. **Route:** `/product/character-sync-ai` - clean, SEO-friendly
2. **Page Component:** Modular sections (hero, problem, features, workflow, comparison, use cases, CTA)
3. **Modal Pattern:** Opens workspace in full-screen modal on button click
4. **State Management:** useCharacterSync hook handles all state
5. **API Integration:** Connected to videos API, pricing API, GCS storage

### ⚠️ Important Notes for Remake
1. **No hardcoded product data in SOLUTIONS array** - appears to be API-driven
2. **Character limits:** MAX_CHARACTERS = 10
3. **Video defaults:** 
   - Resolution: 720p
   - Default duration: 8 seconds
   - Aspect ratios: 16:9 or 9:16
4. **Images:** Uses Pravatar CDN for demo avatars, GCS for user uploads
5. **Language:** Vietnamese (vi) throughout content
6. **Color theme:** Purple/Violet/Fuchsia gradients
7. **Animation:** Framer Motion with custom fadeUp animation (0.7s duration)

---

## Component Architecture Overview

```
ProductCharacterSync (Page)
├── Hero Section (with gradient text)
├── Problem Section (with demo avatar gallery)
├── Features Section (6 cards with icons)
├── Workflow Section (4-step process)
├── Comparison Table
├── Use Cases Grid (6 items with emojis)
├── CTA Section
└── CharacterSyncWorkspace Modal
    ├── RegistrySection (character slots)
    ├── NarrativeBeats (prompts)
    ├── ConfigurationSection (settings)
    ├── Results Grid / History
    └── Supporting Modals
```

