
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Zap, Sparkles, ArrowRight, ShieldCheck, 
  Activity, MonitorPlay, UserCircle, Film,
  Layers, Lock, ExternalLink, Cpu, ChevronLeft,
  Scan, Maximize2, Mic2, Music, UserCheck, 
  Target, Globe, Zap as ZapIcon, Database
} from 'lucide-react';
import VideoAnimateWorkspace from '../../components/VideoAnimateWorkspace';
import { Link } from 'react-router-dom';

const HERO_EXAMPLES = [
  {
    id: 0,
    url: 'https://video.aidancing.net/video-avatar/ai-talking-intro-product-2.mp4',
    title: 'AI Presenter Pro',
    tag: 'TALKING_AVATAR'
  },
  {
    id: 1,
    url: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4',
    title: 'Review Sản Phẩm AI',
    tag: 'E-COMMERCE_VN'
  },
  {
    id: 2,
    url: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4',
    title: 'Catwalk Thời Trang AI',
    tag: 'FASHION_CREATOR'
  }
];

const SHOWCASE_LIST = [
  {
    id: 's1',
    title: 'AI Talking Avatar Engine',
    headline: 'Sức mạnh của sự nhất quán định danh 1:1',
    desc: 'Công nghệ độc quyền cho phép chuyển đổi mọi bức ảnh tĩnh thành một nhân vật kỹ thuật số sống động. Hệ thống phân tích sâu các khối cơ mặt (Facial Landmarks) để tái tạo khẩu hình miệng (Lip-sync) chính xác từng mili giây theo nguồn âm thanh. Đây là giải pháp hoàn hảo để tự động hóa sản xuất video giới thiệu sản phẩm, bản tin nội bộ và đại diện thương hiệu ảo mà không cần phòng Studio vật lý.',
    benefits: ['Tiết kiệm 95% chi phí quay phim truyền thống', 'Tự động hóa 24/7 không cần diễn viên thật', 'Hỗ trợ đa ngôn ngữ với khẩu hình tự nhiên'],
    video: 'https://video.aidancing.net/video-avatar/ai-talking-intro-product-2.mp4',
    mode: 'NEURAL_TALKING',
    tags: ['Identity Lock', '4K Output', 'Audio-Driven'],
    icon: <UserCircle className="text-cyan-400" />
  },
  {
    id: 's2',
    title: 'AI Singing Performance',
    headline: 'Nghệ thuật biểu diễn kỹ thuật số đa tầng',
    desc: 'Vượt xa khỏi việc nói thông thường, thuật toán của Skyverses cho phép nhân vật thực hiện các kỹ thuật hát phức tạp bao gồm cả độ rung của môi và biểu cảm cảm xúc theo giai điệu. Hệ thống tự động cân chỉnh độ tương phản và ánh sáng môi trường để đảm bảo nhân vật hòa hợp hoàn hảo với bối cảnh, tạo ra những MV ca nhạc AI chất lượng cao chỉ từ một tấm ảnh duy nhất.',
    benefits: ['Tái hiện giọng hát của thần tượng/nhân vật', 'Xử lý chuyển động nhịp điệu cao cấp', 'Tối ưu cho Tiktok & Social Media'],
    video: 'https://video.aidancing.net/video-avatar/ai-singing.mp4',
    mode: 'VIRTUAL_SINGING',
    tags: ['Emotion Engine', 'Rhythm Sync', 'High Bitrate'],
    icon: <Music className="text-pink-500" />
  },
  {
    id: 's3',
    title: 'Speech to Speech Sync (STS)',
    headline: 'Đồng bộ hóa biểu cảm chuyên sâu',
    desc: 'Giải pháp STS (Speech-to-Speech) cho phép bạn sử dụng một video mẫu làm "khuôn mẫu" chuyển động và áp dụng định danh của một nhân vật khác vào. Toàn bộ sắc thái biểu cảm từ cái nháy mắt đến cái nhếch môi được truyền tải nguyên vẹn nhưng mang gương mặt của đối tượng mục tiêu. Đây là bước đột phá trong việc tạo ra các nội dung truyền thông mang tính cá nhân hóa cực cao.',
    benefits: ['Giữ trọn vẹn cảm xúc của video gốc', 'Khóa định danh nhân vật tuyệt đối', 'Xử lý nhiễu temporal thông minh'],
    video: 'https://video.aidancing.net/video-avatar/ai-sts.mp4',
    mode: 'EXPRESSION_TRANSFER',
    tags: ['STS Pro', 'Zero Drift', 'Temporal Fix'],
    icon: <Mic2 className="text-emerald-400" />
  },
  {
    id: 's4',
    title: 'Identity Swap Master',
    headline: 'Thay đổi nhân dạng chuẩn điện ảnh',
    desc: 'Hệ thống Identity Swap của chúng tôi không chỉ đơn thuần là "dán" gương mặt. Nó tái cấu trúc lại cấu trúc xương mặt và phản xạ ánh sáng trên da để khớp hoàn toàn với môi trường trong video gốc. Công nghệ này đảm bảo tính chân thực ở mọi góc xoay của đầu và trong các điều kiện ánh sáng phức tạp, mang lại kết quả mượt mà không có hiện tượng "nhảy pixel" (Ghosting artifacts).',
    benefits: ['Xử lý góc xoay đầu lên đến 90 độ', 'Tự động cân bằng màu da theo bối cảnh', 'Chất lượng xuất bản cho TVC quảng cáo'],
    video: 'https://video.aidancing.net/video-avatar/face-swap.mp4',
    mode: 'SMART_SWAP',
    tags: ['Identity Match', 'Lighting Reflector', '60FPS'],
    icon: <UserCheck className="text-purple-500" />
  },
  {
    id: 's5',
    title: 'E-commerce Video Automation',
    headline: 'Cuộc cách mạng hình ảnh cho sàn thương mại điện tử',
    desc: 'Tự động hóa hoàn toàn quy trình tạo video review sản phẩm. Hệ thống tự động tách nền, chèn bối cảnh lifestyle và diễn hoạt nhân vật đang tương tác với sản phẩm. Giải pháp này giúp các thương hiệu sở hữu hàng ngàn video review chất lượng cao cho toàn bộ danh mục sản phẩm chỉ trong vài giờ thay vì hàng tháng trời chuẩn bị hậu cần.',
    benefits: ['Tăng tỷ lệ chuyển đổi mua hàng (CR)', 'Bối cảnh linh hoạt theo chiến dịch', 'Tích hợp sẵn bộ lọc làm đẹp AI'],
    video: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4',
    mode: 'E-COM_BOOST',
    tags: ['Auto Segment', 'Fast Ship', 'Conversion Ready'],
    icon: <ZapIcon className="text-orange-400" />
  },
  {
    id: 's6',
    title: 'AI Fashion Catwalk',
    headline: 'Sàn diễn thời trang kỹ thuật số 4.0',
    desc: 'Biến thiết kế thời trang của bạn thành các đoạn phim catwalk chuyên nghiệp. AI mô phỏng chính xác sự chuyển động của vải vóc (Fabric Physics) và dáng đi của người mẫu dựa trên ảnh mẫu quần áo. Bạn có thể thay đổi người mẫu, tư thế đi và bối cảnh sàn diễn (Runway) để tạo ra những chiến dịch quảng bá thời trang ấn tượng mà không cần tốn kém cho việc thuê ekip và model chuyên nghiệp.',
    benefits: ['Mô phỏng vật lý vải vóc chân thực', 'Tùy biến người mẫu theo thị trường', 'Độ phân giải 4K cho màn hình lớn'],
    video: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4',
    mode: 'FASHION_AI',
    tags: ['Fabric Physics', 'Catwalk Logic', 'AAA Textures'],
    icon: <Sparkles className="text-blue-400" />
  }
];

const VideoAnimateAI: React.FC = () => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_EXAMPLES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-cyan-600/5 rounded-full blur-[250px]"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[200px]"></div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 z-10 overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-blue transition-colors tracking-[0.4em]">
              <ChevronLeft size={14} /> Quay lại Kho giải pháp
            </Link>
            
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-600 dark:text-cyan-400 text-[11px] font-black uppercase tracking-[0.4em] italic"
              >
                <Sparkles size={14} /> Next Video Animation Studio
              </motion.div>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-6xl lg:text-[100px] font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900 dark:text-white"
                >
                  Video <br /> <span className="text-cyan-500">Animate.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium max-w-xl leading-tight border-l-4 border-cyan-500 pl-8"
                >
                  “Hệ thống diễn hoạt hình ảnh và video chuyên nghiệp. Khóa định danh nhân vật (Identity Lock) và tái cấu trúc chuyển động chuẩn điện ảnh bằng trí tuệ nhân tạo.”
                </motion.p>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
            >
              <button 
                onClick={() => setIsWorkspaceOpen(true)}
                className="bg-cyan-500 text-white dark:text-black px-12 py-6 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Mở Studio Sáng Tạo <Zap size={18} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
              </button>
              <button className="px-10 py-6 border border-slate-200 dark:border-white/10 rounded-full text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md">
                Xem Showreel AI
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2">
            <div className="relative aspect-[16/10] bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-[3rem] p-4 shadow-3xl overflow-hidden group">
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1 }}
                    className="h-full w-full bg-black rounded-[2.5rem] overflow-hidden relative"
                  >
                    <video 
                      src={HERO_EXAMPLES[currentSlide].url} 
                      autoPlay loop muted playsInline 
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-8 left-8 flex items-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                       <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-black uppercase text-white tracking-widest italic">{HERO_EXAMPLES[currentSlide].tag}</span>
                    </div>
                    <div className="absolute bottom-10 left-10 space-y-2">
                       <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{HERO_EXAMPLES[currentSlide].title}</h3>
                    </div>
                  </motion.div>
               </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAPABILITIES SHOWCASE ZIC-ZAC LAYOUT */}
      <section className="py-40 bg-slate-50/50 dark:bg-black/20 border-y border-slate-100 dark:border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-32">
             <motion.span 
               initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
               className="text-cyan-500 font-black uppercase tracking-[0.6em] text-[11px]"
             >
               Architecture & Solutions
             </motion.span>
             <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Thư viện giải pháp Diễn hoạt</h2>
             <p className="text-slate-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Tối ưu hóa quy trình sản xuất nội dung video với các thuật toán chuyên biệt cấp độ doanh nghiệp.</p>
          </div>

          <div className="space-y-40 lg:space-y-64">
            {SHOWCASE_LIST.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* VIDEO PANEL */}
                <div className="w-full lg:w-1/2">
                   <div className="relative aspect-video rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden bg-black shadow-3xl group border border-slate-100 dark:border-white/5 transition-all hover:border-cyan-500/30">
                      <video 
                        src={item.video} 
                        autoPlay loop muted playsInline 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      
                      {/* Mode HUD */}
                      <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                         <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_cyan]"></div>
                         <span className="text-[9px] font-black uppercase text-white tracking-widest italic">{item.mode}</span>
                      </div>

                      {/* Floating Play Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-3xl">
                           <Play size={32} fill="white" className="ml-1" />
                        </div>
                      </div>
                   </div>
                </div>

                {/* CONTENT PANEL */}
                <div className="w-full lg:w-1/2 space-y-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-inner">
                            {item.icon}
                         </div>
                         <h3 className="text-3xl lg:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                            {item.title}
                         </h3>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xl lg:text-2xl font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-tight italic border-l-4 border-cyan-500 pl-6">{item.headline}</h4>
                        <p className="text-base lg:text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">
                          "{item.desc}"
                        </p>
                      </div>
                   </div>

                   {/* Benefits List */}
                   <div className="space-y-4">
                      {item.benefits.map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-4">
                           <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <CheckCircle2 size={14} />
                           </div>
                           <span className="text-xs lg:text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400">{benefit}</span>
                        </div>
                      ))}
                   </div>

                   {/* Tags & Action */}
                   <div className="pt-8 flex flex-wrap items-center justify-between gap-6 border-t border-black/5 dark:border-white/5">
                      <div className="flex flex-wrap gap-2">
                         {item.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/10">
                               #{tag}
                            </span>
                         ))}
                      </div>
                      <button 
                        onClick={() => setIsWorkspaceOpen(true)}
                        className="flex items-center gap-3 text-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group"
                      >
                         <span className="text-xs font-black uppercase tracking-[0.4em] italic">Thử nghiệm ngay</span>
                         <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKSPACE MODAL */}
      <AnimatePresence>
        {isWorkspaceOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1000] bg-white dark:bg-[#050507]"
          >
            <VideoAnimateWorkspace onClose={() => setIsWorkspaceOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. FOOTER */}
      <footer className="py-20 text-center space-y-8 opacity-40">
         <div className="flex items-center justify-center gap-6">
            <Cpu size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Powered by Skyverses Neural Lattice - Giải pháp AI hàng đầu Việt Nam</span>
         </div>
      </footer>
    </div>
  );
};

const CheckCircle2 = ({ size, className }: { size?: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;

export default VideoAnimateAI;
