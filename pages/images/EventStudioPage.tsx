import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EventStudioWorkspace from '../../components/EventStudioWorkspace';
import { EVENT_CONFIGS, STYLE_PRESETS } from '../../constants/event-configs';
import { Loader2, Zap, ArrowRight, Sparkles, ShieldCheck, Camera, Palette, ChevronRight, Users } from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';

interface EventStudioPageProps {
  type: 'noel' | 'tet' | 'wedding' | 'birthday';
}

const SEO_MAP: Record<string, { title: string; description: string; keywords: string; canonical: string }> = {
  birthday: { title: 'AI Birthday Studio — Tạo Ảnh Sinh Nhật AI | Skyverses', description: 'Tạo ảnh sinh nhật chuyên nghiệp với AI. Hàng chục chủ đề tiệc tùng, giữ nguyên khuôn mặt, chất lượng 8K.', keywords: 'AI birthday, ảnh sinh nhật AI, birthday generator', canonical: '/product/ai-birthday-generator' },
  wedding: { title: 'AI Wedding Studio — Ảnh Cưới AI Pro | Skyverses', description: 'Tạo ảnh cưới đẳng cấp với AI. Couple Mode đồng bộ khuôn mặt cặp đôi, 100+ bối cảnh lãng mạn.', keywords: 'AI wedding, ảnh cưới AI, couple photo AI', canonical: '/product/ai-wedding-generator' },
  noel: { title: 'AI Noel Studio — Tạo Ảnh Giáng Sinh AI | Skyverses', description: 'Tạo ảnh Giáng sinh tuyệt đẹp với AI. Tuyết rơi, lò sưởi, cây thông Noel, chất lượng 8K.', keywords: 'AI noel, ảnh giáng sinh AI, christmas generator', canonical: '/product/ai-noel-generator' },
  tet: { title: 'AI Tết Studio — Tạo Ảnh Tết AI | Skyverses', description: 'Tạo ảnh Tết nguyên đán chuyên nghiệp. Áo dài, hoa đào, chợ Tết. Giữ nguyên khuôn mặt 100%.', keywords: 'AI tết, ảnh tết AI, lunar new year photo', canonical: '/product/ai-tet-generator' }
};

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } };

const EventStudioPage: React.FC<EventStudioPageProps> = ({ type }) => {
  const config = EVENT_CONFIGS[type];
  const seo = SEO_MAP[type] || SEO_MAP.birthday;
  const l = config.landing;
  usePageMeta(seo);

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSamples = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.skyverses.com/explorer?page=1&limit=12&search=${type}`);
        const result = await response.json();
        if (result.data) setImages(result.data);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchSamples();
    setIsStudioOpen(false);
  }, [type]);

  if (!config) return <div className="pt-40 text-center uppercase font-black tracking-widest opacity-20">Configuration Not Found</div>;
  if (isStudioOpen) return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
      <EventStudioWorkspace config={config} onClose={() => setIsStudioOpen(false)} />
    </div>
  );

  const ac = config.accentColor;
  const EvIcon = config.icon;

  return (
    <div className="bg-[#fdfdfe] dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-500">
      
      {/* ═══════════════════════════════════════════════════
          SECTION 1: HERO
      ═══════════════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-16 pt-28 pb-20 relative overflow-hidden">
        {/* Background blurs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-[800px] h-[800px] bg-${ac}-500/8 rounded-full blur-[180px]`}></div>
          <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[150px]"></div>
        </div>
        {/* Dot grid */}
        <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          {/* Left: Text */}
          <div className="space-y-10">
            {/* Tagline */}
            <motion.div {...fadeUp}>
              <span className={`inline-flex items-center gap-2.5 px-4 py-2 bg-${ac}-500/8 border border-${ac}-500/15 rounded-full text-${ac}-500 text-[10px] font-bold uppercase tracking-[0.25em]`}>
                <EvIcon size={13} /> {l.tagline}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <h1 className="text-5xl sm:text-6xl lg:text-[84px] font-black leading-[0.9] tracking-tight text-slate-900 dark:text-white whitespace-pre-line">
                {l.headline.split('\\n').map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {i === 0 ? line : <span className={`text-${ac}-500`}>{line}</span>}
                  </span>
                ))}
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }} className="text-base lg:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              {l.subheadline}
            </motion.p>

            {/* Stats */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.24 }} className="flex gap-6 sm:gap-10">
              {l.stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className={`text-2xl sm:text-3xl font-black text-${ac}-500 leading-none`}>{s.value}</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5">{s.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.32 }} className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className={`bg-${ac}-500 hover:bg-${ac}-600 text-white px-10 py-5 rounded-2xl text-sm font-bold tracking-wide shadow-xl shadow-${ac}-500/20 hover:shadow-${ac}-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group`}
              >
                {l.ctaText} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 self-center font-medium">{l.ctaSubtext}</p>
            </motion.div>
          </div>

          {/* Right: Showcase Grid */}
          <div className="h-[600px] lg:h-[700px] relative">
            <div className="absolute inset-0 overflow-hidden mask-fade-vertical">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                  <Loader2 className={`w-10 h-10 animate-spin text-${ac}-500`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Loading showcase...</span>
                </div>
              ) : images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 animate-marquee-vertical">
                  {[...images, ...images].map((img, idx) => (
                    <div key={`${img._id}-${idx}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0a0a0d] border border-black/[0.04] dark:border-white/[0.04] group shadow-lg">
                      <img src={img.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={img.title} loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className={`text-[7px] font-bold uppercase text-${ac}-400 tracking-widest block mb-1`}>{config.name}</span>
                        <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">{img.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center opacity-10">
                  <EvIcon size={80} strokeWidth={0.8} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-white dark:bg-[#060608] border-y border-black/[0.04] dark:border-white/[0.04] transition-colors">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          <motion.div {...fadeUp} className="text-center space-y-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 bg-${ac}-500/8 border border-${ac}-500/15 rounded-lg text-${ac}-500 text-[9px] font-bold uppercase tracking-[0.2em]`}>
              <Sparkles size={11} /> Cách hoạt động
            </span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              3 bước. 30 giây.{' '}
              <span className={`text-${ac}-500`}>Xong.</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Quy trình tối giản — không cần kỹ năng chỉnh sửa, không cần phần mềm phức tạp.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {l.howItWorks.map((step, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.12 }} className="relative group">
                <div className={`p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl hover:border-${ac}-500/20 transition-all h-full`}>
                  <div className={`w-12 h-12 rounded-xl bg-${ac}-500/10 border border-${ac}-500/15 flex items-center justify-center text-${ac}-500 text-lg font-black mb-6`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight size={20} className="text-slate-300 dark:text-slate-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3: TEMPLATES PREVIEW
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 transition-colors">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <motion.div {...fadeUp} className="text-center space-y-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 bg-${ac}-500/8 border border-${ac}-500/15 rounded-lg text-${ac}-500 text-[9px] font-bold uppercase tracking-[0.2em]`}>
              <Palette size={11} /> Mẫu có sẵn
            </span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Chọn mẫu. <span className={`text-${ac}-500`}>1 Click.</span> Xong.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Mỗi template được thiết kế sẵn với prompt chuyên nghiệp và phong cách phù hợp.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {config.templates.map((t, i) => (
              <motion.div 
                key={t.id} 
                {...fadeUp} 
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className={`bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-6 hover:border-${ac}-500/20 hover:shadow-lg transition-all group cursor-pointer`}
                onClick={() => setIsStudioOpen(true)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-2.5 py-1 bg-${ac}-500/10 text-${ac}-500 text-[8px] font-bold uppercase tracking-wider rounded-lg`}>{t.style}</div>
                  <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{t.name}</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-3">{t.prompt.slice(0, 120)}...</p>
                <div className="flex gap-1.5 mt-4">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/[0.03] text-slate-400 dark:text-slate-500 rounded-md">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 4: STYLE PRESETS
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white dark:bg-[#060608] border-y border-black/[0.04] dark:border-white/[0.04] transition-colors">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              6 phong cách AI <span className={`text-${ac}-500`}>chuyên nghiệp</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mỗi phong cách thay đổi hoàn toàn tone ảnh — từ Cinematic đến Manga.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STYLE_PRESETS.map((style, i) => (
              <motion.div
                key={style.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className={`flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl hover:border-${ac}-500/20 transition-all cursor-pointer group`}
                onClick={() => setIsStudioOpen(true)}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{style.emoji}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-white/80">{style.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 5: BENEFITS (WHY US)
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 transition-colors">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          <motion.div {...fadeUp} className="text-center space-y-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 bg-${ac}-500/8 border border-${ac}-500/15 rounded-lg text-${ac}-500 text-[9px] font-bold uppercase tracking-[0.2em]`}>
              <ShieldCheck size={11} /> Tại sao chọn {config.name}
            </span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Công nghệ <span className={`text-${ac}-500`}>tạo nên sự khác biệt.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.benefits.map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className={`p-8 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl group hover:border-${ac}-500/20 transition-all`}>
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 shrink-0 rounded-xl bg-${ac}-500/10 border border-${ac}-500/15 flex items-center justify-center text-${ac}-500 text-xl font-black`}>
                    0{i + 1}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{item.t}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.d}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 6: FEATURES GRID
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-[#060608] border-y border-black/[0.04] dark:border-white/[0.04] transition-colors">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Tính năng <span className={`text-${ac}-500`}>vượt trội</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🔒', title: 'Face-Lock 100%', desc: 'AI giữ nguyên hoàn toàn khuôn mặt, đường nét, tông da trong mọi bối cảnh.' },
              { icon: '👕', title: 'Trang phục tham khảo', desc: 'Upload ảnh trang phục mong muốn — AI sẽ "mặc" lên nhân vật tự nhiên.' },
              { icon: '📊', title: '4 Biến thể cùng lúc', desc: 'Tạo 4 phiên bản khác nhau trong 1 click để chọn tác phẩm ưng ý nhất.' },
              { icon: '🔄', title: 'So sánh Trước / Sau', desc: 'Thanh trượt so sánh ảnh gốc vs AI — đánh giá chất lượng trực quan.' },
              { icon: '✨', title: 'Gợi ý prompt AI', desc: 'AI tự động gợi ý kịch bản phù hợp dựa trên chủ đề đã chọn.' },
              { icon: '📤', title: 'Chia sẻ 1 chạm', desc: 'Share trực tiếp lên mạng xã hội hoặc copy link ảnh tức thì.' },
            ].map((feat, i) => (
              <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl transition-all">
                <span className="text-2xl block mb-3">{feat.icon}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{feat.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 7: SHOWCASE (Community Gallery)
      ═══════════════════════════════════════════════════ */}
      {images.length > 0 && (
        <section className="py-28 lg:py-36 transition-colors">
          <div className="max-w-6xl mx-auto px-6 space-y-16">
            <motion.div {...fadeUp} className="text-center space-y-4">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {l.showcaseTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">{l.showcaseDesc}</p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.slice(0, 8).map((img, i) => (
                <motion.div key={img._id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0a0a0d] border border-black/[0.04] dark:border-white/[0.04] group relative shadow-sm hover:shadow-xl transition-all">
                  <img src={img.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={img.title} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <p className="text-[10px] font-bold text-white line-clamp-2">{img.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 8: FINAL CTA
      ═══════════════════════════════════════════════════ */}
      <section className={`py-28 lg:py-36 bg-gradient-to-br from-${ac}-500/5 via-transparent to-brand-blue/5 border-t border-black/[0.04] dark:border-white/[0.04] transition-colors`}>
        <motion.div {...fadeUp} className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className={`w-16 h-16 mx-auto rounded-2xl bg-${ac}-500/10 border border-${ac}-500/15 flex items-center justify-center text-${ac}-500`}>
            <EvIcon size={28} />
          </div>
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Sẵn sàng tạo<br />
            <span className={`text-${ac}-500`}>tác phẩm đầu tiên?</span>
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Chỉ cần 1 tấm ảnh chân dung và 30 giây. {config.name} sẽ lo phần còn lại.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className={`bg-${ac}-500 hover:bg-${ac}-600 text-white px-12 py-5 rounded-2xl text-sm font-bold tracking-wide shadow-xl shadow-${ac}-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group`}
            >
              <Zap size={18} fill="currentColor" /> {l.ctaText} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{l.ctaSubtext}</p>
        </motion.div>
      </section>

      {/* Inline Styles */}
      <style>{`
        .mask-fade-vertical {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 50s linear infinite;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default EventStudioPage;