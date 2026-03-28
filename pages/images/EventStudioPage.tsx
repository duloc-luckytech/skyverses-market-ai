import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import EventStudioWorkspace from '../../components/EventStudioWorkspace';
import { EVENT_CONFIGS, STYLE_PRESETS } from '../../constants/event-configs';
import { Loader2, Zap, ArrowRight, Sparkles, ShieldCheck, Camera, Palette, ChevronRight, ChevronDown, Users, CircleDollarSign, HelpCircle, ArrowUpRight } from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';

interface EventStudioPageProps {
  type: 'noel' | 'tet' | 'wedding' | 'birthday';
}

const OG_IMAGES: Record<string, string> = {
  birthday: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=1200&h=630',
  wedding: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200&h=630',
  noel: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&q=80&w=1200&h=630',
  tet: 'https://images.unsplash.com/photo-1611516491426-03025e6043c8?auto=format&fit=crop&q=80&w=1200&h=630',
};

const SEO_MAP: Record<string, { title: string; description: string; keywords: string; canonical: string; ogImage: string }> = {
  birthday: { title: 'AI Birthday Studio — Tạo Ảnh Sinh Nhật AI | Skyverses', description: 'Tạo ảnh sinh nhật chuyên nghiệp với AI. Hàng chục chủ đề tiệc tùng, giữ nguyên khuôn mặt, chất lượng 8K.', keywords: 'AI birthday, ảnh sinh nhật AI, birthday generator', canonical: '/product/ai-birthday-generator', ogImage: OG_IMAGES.birthday },
  wedding: { title: 'AI Wedding Studio — Ảnh Cưới AI Pro | Skyverses', description: 'Tạo ảnh cưới đẳng cấp với AI. Couple Mode đồng bộ khuôn mặt cặp đôi, 100+ bối cảnh lãng mạn.', keywords: 'AI wedding, ảnh cưới AI, couple photo AI', canonical: '/product/ai-wedding-generator', ogImage: OG_IMAGES.wedding },
  noel: { title: 'AI Noel Studio — Tạo Ảnh Giáng Sinh AI | Skyverses', description: 'Tạo ảnh Giáng sinh tuyệt đẹp với AI. Tuyết rơi, lò sưởi, cây thông Noel, chất lượng 8K.', keywords: 'AI noel, ảnh giáng sinh AI, christmas generator', canonical: '/product/ai-noel-generator', ogImage: OG_IMAGES.noel },
  tet: { title: 'AI Tết Studio — Tạo Ảnh Tết AI | Skyverses', description: 'Tạo ảnh Tết nguyên đán chuyên nghiệp. Áo dài, hoa đào, chợ Tết. Giữ nguyên khuôn mặt 100%.', keywords: 'AI tết, ảnh tết AI, lunar new year photo', canonical: '/product/ai-tet-generator', ogImage: OG_IMAGES.tet }
};

/* FAQ data per event */
const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  birthday: [
    { q: 'Ảnh sinh nhật AI có giữ nguyên khuôn mặt không?', a: 'Có. Công nghệ Face-Lock đảm bảo giữ nguyên 100% đường nét gương mặt, tông da và biểu cảm trong mọi bối cảnh.' },
    { q: 'Tôi có thể chọn trang phục cho ảnh sinh nhật không?', a: 'Có. Bạn có thể upload ảnh trang phục mong muốn, AI sẽ "mặc" lên nhân vật tự nhiên như thật.' },
    { q: 'Mất bao lâu để tạo 1 ảnh?', a: 'Trung bình 20-40 giây tùy độ phức tạp của bối cảnh. Bạn có thể tạo 4 biến thể cùng lúc.' },
    { q: 'Ảnh có thể in được không?', a: 'Có. Ảnh đầu ra chất lượng 8K (4096x4096), đủ sắc nét để in thiệp mời, poster, hay banner lớn.' },
    { q: 'Tôi có thể dùng ảnh cho mục đích thương mại không?', a: 'Có. Tất cả ảnh bạn tạo ra đều thuộc quyền sở hữu của bạn và có thể sử dụng cho bất kỳ mục đích nào.' },
  ],
  wedding: [
    { q: 'Couple Mode hoạt động như thế nào?', a: 'Upload 2 ảnh chân dung riêng — AI sẽ ghép cả hai vào cùng một bối cảnh cưới lãng mạn, giữ nguyên khuôn mặt của cả cô dâu và chú rể.' },
    { q: 'Ảnh cưới AI có đẹp bằng studio thật không?', a: 'AI tạo ảnh chất lượng tạp chí với bối cảnh mà studio thật không thể có: cung điện Châu Âu, bờ biển Santorini, hay rừng hoa anh đào Nhật Bản.' },
    { q: 'Có thể chọn váy cưới không?', a: 'Có. Upload ảnh váy cưới mong muốn qua tính năng "Trang phục tham khảo", AI sẽ tổng hợp lên nhân vật.' },
    { q: 'Chi phí so với studio cưới thật?', a: 'Studio thật: 5-15 triệu/bộ. AI Wedding Studio: chỉ từ 250 Credits (~25.000đ)/ảnh. Tiết kiệm đến 99%.' },
    { q: 'Ảnh cưới AI có thể in khổ lớn không?', a: 'Có. Chất lượng 8K cho phép in khổ A1 (60x84cm) vẫn sắc nét.' },
  ],
  noel: [
    { q: 'Tôi có cần tuyết thật để chụp ảnh Noel không?', a: 'Không! AI tạo bối cảnh tuyết rơi, lò sưởi ấm cúng, hay chợ Giáng sinh châu Âu chân thực từ bất kỳ ảnh chân dung nào.' },
    { q: 'Có template Santa Claus không?', a: 'Có. Mẫu "Santa Claus Premium" biến bạn thành ông già Noel phong cách cao cấp với áo nhung đỏ, lông trắng, và đại sảnh trang trí lộng lẫy.' },
    { q: 'Ảnh Noel AI có thể dùng làm thiệp chúc mừng không?', a: 'Hoàn toàn phù hợp. Ảnh 8K sắc nét, bạn có thể in thiệp, poster, hay chia sẻ trực tiếp lên mạng xã hội.' },
    { q: 'Mất bao lâu để tạo ảnh?', a: 'Trung bình 20-40 giây. Bạn có thể tạo 4 biến thể cùng lúc để chọn ảnh ưng ý nhất.' },
    { q: 'Có phong cách Cyberpunk Christmas không?', a: 'Có! Mẫu "Neon Christmas" kết hợp Giáng sinh với aesthetic cyberpunk: đèn neon đỏ-xanh, đô thị tương lai, bông tuyết holographic.' },
  ],
  tet: [
    { q: 'AI có tạo được Áo dài chính xác không?', a: 'Có. AI được train với hàng nghìn mẫu Áo dài truyền thống, đảm bảo tái hiện chính xác kiểu dáng, chất liệu và hoa văn đặc trưng.' },
    { q: 'Hoa đào và hoa mai có đẹp tự nhiên không?', a: 'AI tái hiện hoa đào Hà Nội và hoa mai miền Nam cực kỳ chân thực, từ cánh hoa mỏng manh đến ánh sáng xuân trong trẻo.' },
    { q: 'Có template phố ông đồ không?', a: 'Có. Mẫu "Phố Ông Đồ" tái hiện không gian thư pháp truyền thống với câu đối đỏ, hoa đào, và kiến trúc Hà Nội cổ kính.' },
    { q: 'Tôi có thể tạo ảnh Tết cho cả gia đình không?', a: 'Hiện tại hỗ trợ 1-2 người/ảnh. Bạn có thể tạo nhiều ảnh riêng rồi ghép bằng editor.' },
    { q: 'Chi phí tạo ảnh Tết AI?', a: 'Chỉ từ 150 Credits (~15.000đ)/ảnh. So với thuê studio + áo dài + phụ kiện, tiết kiệm đến 95%.' },
  ],
};

/* Pricing comparison data per event */
const PRICING_DATA: Record<string, { traditional: { label: string; items: { name: string; cost: string }[]; total: string }; ai: { label: string; items: { name: string; cost: string }[]; total: string } }> = {
  birthday: {
    traditional: { label: 'Studio truyền thống', items: [{ name: 'Thuê studio + trang trí', cost: '2.000.000đ' }, { name: 'Nhiếp ảnh gia', cost: '1.500.000đ' }, { name: 'Trang phục + makeup', cost: '800.000đ' }, { name: 'Hậu kỳ chỉnh sửa', cost: '500.000đ' }], total: '4.800.000đ' },
    ai: { label: 'Birthday AI Studio', items: [{ name: '1 ảnh AI chất lượng 8K', cost: '150 CR' }, { name: '4 biến thể cùng lúc', cost: '600 CR' }, { name: 'Trang phục tham khảo', cost: 'Miễn phí' }, { name: 'Chỉnh sửa & tải về', cost: 'Miễn phí' }], total: '~15.000đ/ảnh' }
  },
  wedding: {
    traditional: { label: 'Studio cưới truyền thống', items: [{ name: 'Package chụp cưới cơ bản', cost: '8.000.000đ' }, { name: 'Thuê váy cưới + vest', cost: '3.000.000đ' }, { name: 'Makeup + tóc', cost: '2.000.000đ' }, { name: 'Di chuyển + bối cảnh', cost: '2.000.000đ' }], total: '15.000.000đ' },
    ai: { label: 'Wedding AI Studio', items: [{ name: '1 ảnh cưới AI đẳng cấp', cost: '250 CR' }, { name: 'Couple Mode (2 người)', cost: 'Đã bao gồm' }, { name: 'Bối cảnh Hàn/Âu/Biển', cost: 'Miễn phí' }, { name: 'Chỉnh sửa & tải về', cost: 'Miễn phí' }], total: '~25.000đ/ảnh' }
  },
  noel: {
    traditional: { label: 'Studio Giáng Sinh', items: [{ name: 'Thuê studio + set Noel', cost: '1.500.000đ' }, { name: 'Nhiếp ảnh gia', cost: '1.000.000đ' }, { name: 'Trang phục Santa/Noel', cost: '500.000đ' }, { name: 'Hậu kỳ chỉnh sửa', cost: '300.000đ' }], total: '3.300.000đ' },
    ai: { label: 'Noel AI Studio', items: [{ name: '1 ảnh Noel AI chất lượng 8K', cost: '150 CR' }, { name: '5 concept có sẵn', cost: 'Miễn phí' }, { name: 'Phong cách tùy chỉnh', cost: 'Miễn phí' }, { name: 'Chỉnh sửa & tải về', cost: 'Miễn phí' }], total: '~15.000đ/ảnh' }
  },
  tet: {
    traditional: { label: 'Studio ảnh Tết', items: [{ name: 'Thuê studio + bối cảnh Tết', cost: '2.000.000đ' }, { name: 'Thuê Áo dài cao cấp', cost: '800.000đ' }, { name: 'Makeup + phụ kiện', cost: '500.000đ' }, { name: 'Hậu kỳ chỉnh sửa', cost: '500.000đ' }], total: '3.800.000đ' },
    ai: { label: 'Tết AI Studio', items: [{ name: '1 ảnh Tết AI chất lượng 8K', cost: '150 CR' }, { name: '5 concept Tết có sẵn', cost: 'Miễn phí' }, { name: 'Áo dài tham khảo', cost: 'Miễn phí' }, { name: 'Chỉnh sửa & tải về', cost: 'Miễn phí' }], total: '~15.000đ/ảnh' }
  },
};

/* Cross-sell: other event studios */
const CROSS_SELL: { id: string; name: string; desc: string; slug: string; emoji: string; color: string }[] = [
  { id: 'birthday', name: 'Birthday Studio', desc: 'Ảnh sinh nhật AI đẳng cấp', slug: '/product/ai-birthday-generator', emoji: '🎂', color: 'purple' },
  { id: 'wedding', name: 'Wedding Studio', desc: 'Ảnh cưới AI Couple Mode', slug: '/product/ai-wedding-generator', emoji: '💒', color: 'pink' },
  { id: 'noel', name: 'Noel Studio', desc: 'Ảnh Giáng sinh huyền ảo', slug: '/product/ai-noel-generator', emoji: '🎄', color: 'rose' },
  { id: 'tet', name: 'Tết Studio', desc: 'Ảnh Tết truyền thống AI', slug: '/product/ai-tet-generator', emoji: '🌸', color: 'red' },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } };

/* FAQ Accordion Item */
const FaqItem: React.FC<{ faq: { q: string; a: string }; accentColor: string; index: number }> = ({ faq, accentColor: ac, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.06 }}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-5 bg-white dark:bg-white/[0.02] border ${open ? `border-${ac}-500/20` : 'border-black/[0.04] dark:border-white/[0.04]'} rounded-xl text-left transition-all hover:border-${ac}-500/15 group`}
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white pr-6">{faq.q}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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
          SECTION 8: PRICING COMPARISON
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white dark:bg-[#060608] border-y border-black/[0.04] dark:border-white/[0.04] transition-colors">
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          <motion.div {...fadeUp} className="text-center space-y-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 bg-${ac}-500/8 border border-${ac}-500/15 rounded-lg text-${ac}-500 text-[9px] font-bold uppercase tracking-[0.2em]`}>
              <CircleDollarSign size={11} /> So sánh chi phí
            </span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Tiết kiệm <span className={`text-${ac}-500`}>đến 95%</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">So sánh chi phí thực tế giữa studio truyền thống và AI Studio.</p>
          </motion.div>

          {(() => {
            const pricing = PRICING_DATA[type];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traditional */}
                <motion.div {...fadeUp} className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200/30 dark:bg-white/[0.02] rounded-bl-[60px]"></div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{pricing.traditional.label}</h3>
                  <div className="space-y-3">
                    {pricing.traditional.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-dashed border-black/[0.06] dark:border-white/[0.04]">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.cost}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng chi phí</span>
                    <span className="text-xl font-black text-red-500 line-through decoration-2">{pricing.traditional.total}</span>
                  </div>
                </motion.div>

                {/* AI */}
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className={`p-8 bg-${ac}-500/5 border-2 border-${ac}-500/20 rounded-2xl space-y-5 relative overflow-hidden`}>
                  <div className={`absolute top-4 right-4 px-2.5 py-1 bg-${ac}-500 text-white text-[8px] font-bold uppercase tracking-wider rounded-full`}>Tiết kiệm</div>
                  <h3 className={`text-base font-bold text-${ac}-600 dark:text-${ac}-400`}>{pricing.ai.label}</h3>
                  <div className="space-y-3">
                    {pricing.ai.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-dashed border-black/[0.04] dark:border-white/[0.04]">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                        <span className={`text-sm font-semibold ${item.cost === 'Miễn phí' || item.cost === 'Đã bao gồm' ? 'text-emerald-500' : `text-${ac}-600 dark:text-${ac}-400`}`}>{item.cost}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chỉ từ</span>
                    <span className={`text-xl font-black text-${ac}-500`}>{pricing.ai.total}</span>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 9: FAQ
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 transition-colors">
        <div className="max-w-3xl mx-auto px-6 space-y-16">
          <motion.div {...fadeUp} className="text-center space-y-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 bg-${ac}-500/8 border border-${ac}-500/15 rounded-lg text-${ac}-500 text-[9px] font-bold uppercase tracking-[0.2em]`}>
              <HelpCircle size={11} /> FAQ
            </span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Câu hỏi <span className={`text-${ac}-500`}>thường gặp</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {(FAQ_DATA[type] || []).map((faq, i) => (
              <FaqItem key={i} faq={faq} accentColor={ac} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 10: CROSS-SELL
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white dark:bg-[#060608] border-y border-black/[0.04] dark:border-white/[0.04] transition-colors">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <motion.div {...fadeUp} className="text-center space-y-3">
            <h2 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Khám phá thêm <span className={`text-${ac}-500`}>studio khác</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mỗi dịp lễ đều có studio AI riêng — được tối ưu cho từng bối cảnh.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CROSS_SELL.filter(s => s.id !== type).map((studio, i) => (
              <motion.div key={studio.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <Link
                  to={studio.slug}
                  className={`block p-6 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl hover:border-${studio.color}-500/20 hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{studio.emoji}</span>
                    <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{studio.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{studio.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 11: FINAL CTA
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