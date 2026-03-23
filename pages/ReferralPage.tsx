import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, Check, Share2, Sparkles, 
  UserPlus, Zap, Heart, Gift, 
  MessageSquare, Star, ArrowRight,
  Facebook, Mail, Send as Telegram,
  Twitter, Globe, Activity, Palette,
  Coins, Camera, Film, Info, Users,
  MonitorPlay
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import { usePageMeta } from '../hooks/usePageMeta';

const ReferralPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  usePageMeta({
    title: 'Referral Program | Skyverses',
    description: 'Earn credits by referring friends to Skyverses AI creative platform.',
    keywords: 'referral, earn credits, invite friends',
    canonical: '/referral'
  });

  const [copied, setCopied] = useState(false);

  const referralLink = `https://market.skyverses.io/register?ref=${user?._id?.slice(0, 8) || 'CREATIVE'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-40 min-h-screen bg-white dark:bg-[#020203] text-black dark:text-white transition-colors duration-500 overflow-x-hidden selection:bg-brand-blue/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[150px]"></div>
         <div className="absolute inset-0 opacity-[0.01] dark:opacity-[0.03]" style={{ 
           backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', 
           backgroundSize: '100px 100px' 
         }}></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 space-y-24">
        
        {/* 1️⃣ HERO SECTION */}
        <section className="text-center space-y-12 max-w-5xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-3 px-5 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-black uppercase tracking-[0.3em] italic"
           >
              <Sparkles size={14} fill="currentColor" /> Cùng nhau kiến tạo nghệ thuật
           </motion.div>
           
           <div className="space-y-8">
             <motion.h1 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="text-6xl lg:text-[110px] font-black tracking-tighter uppercase italic leading-[0.85]"
             >
               Lan tỏa cảm hứng, <br />
               Nhân đôi <span className="text-brand-blue">niềm vui.</span>
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="text-gray-500 dark:text-gray-400 text-xl lg:text-2xl font-medium max-w-3xl mx-auto italic leading-relaxed"
             >
               Sáng tạo sẽ vui hơn khi có bạn đồng hành! Mời bạn bè gia nhập Skyverses Studio để cùng nhau khám phá sức mạnh kỳ diệu của AI và nhận thêm nguồn năng lượng cho mọi ý tưởng nghệ thuật.
             </motion.p>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
             className="pt-8 max-w-2xl mx-auto w-full"
           >
              <div className="flex flex-col sm:flex-row bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-2 gap-2 shadow-2xl transition-all group focus-within:border-brand-blue/40">
                 <input 
                   readOnly value={referralLink}
                   className="flex-grow bg-transparent border-none text-slate-900 dark:text-white font-mono text-sm px-6 focus:outline-none py-4 sm:py-0"
                 />
                 <button 
                   onClick={handleCopy}
                   className={`flex items-center justify-center gap-3 px-12 py-5 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-brand-blue text-white hover:scale-105 active:scale-95 shadow-xl shadow-brand-blue/20'}`}
                 >
                    {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
                    {copied ? 'ĐÃ SAO CHÉP' : 'Gửi lời mời'}
                 </button>
              </div>
              <div className="flex justify-center gap-6 mt-10">
                 <button className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"><Facebook size={20}/></button>
                 <button className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"><Telegram size={20}/></button>
                 <button className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"><Twitter size={20}/></button>
                 <button className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-sm"><Mail size={20}/></button>
              </div>
           </motion.div>
        </section>

        {/* 2️⃣ BENEFIT SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* BẠN NHẬN ĐƯỢC GÌ */}
           <motion.div 
             whileHover={{ y: -10 }}
             className="p-12 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-[3rem] space-y-10 shadow-sm relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-[3s]">
                 <Zap size={240} strokeWidth={1} />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                 <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue shadow-inner">
                    <Zap size={32} fill="currentColor" />
                 </div>
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Bạn nhận được gì?</h3>
              </div>
              <ul className="space-y-6 relative z-10">
                 {[
                   { t: 'Thêm Credit, thêm tác phẩm', d: 'Nhận ngay AI Credits vào tài khoản cho mỗi người bạn đăng ký và trải nghiệm thành công.', i: <Coins /> },
                   { t: 'Sáng tạo không giới hạn', d: 'Càng nhiều bạn bè tham gia, kho năng lượng của bạn càng dồi dào để thỏa sức tạo video chất lượng cao.', i: <Film /> },
                   { t: 'Đặc quyền Creator', d: 'Cơ hội nhận vé mời trải nghiệm sớm các tính năng AI mới nhất và tham gia nhóm cộng tác viên ưu tú.', i: <Star /> }
                 ].map((item, i) => (
                    <li key={i} className="flex gap-6 items-start">
                       <div className="text-brand-blue mt-1">{item.i}</div>
                       <div className="space-y-1">
                          <p className="font-black uppercase tracking-tight text-slate-800 dark:text-white">{item.t}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">{item.d}</p>
                       </div>
                    </li>
                 ))}
              </ul>
           </motion.div>

           {/* BẠN BÈ NHẬN ĐƯỢC GÌ */}
           <motion.div 
             whileHover={{ y: -10 }}
             className="p-12 bg-white dark:bg-[#08080a] border border-black/5 dark:border-white/5 rounded-[3rem] space-y-10 shadow-sm relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-[3s]">
                 <Heart size={240} strokeWidth={1} />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                    <Heart size={32} fill="currentColor" />
                 </div>
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Bạn bè nhận được gì?</h3>
              </div>
              <ul className="space-y-6 relative z-10">
                 {[
                   { t: 'Món quà chào mừng', d: 'Nhận ngay 1000 Credits "khởi nghiệp" để bắt đầu hành trình sáng tạo tại Skyverses ngay lập tức.', i: <Gift /> },
                   { t: 'Trải nghiệm trọn vẹn', d: 'Quyền truy cập vào toàn bộ hệ sinh thái công cụ từ tạo nhân vật nhất quán đến dựng phim AI đỉnh cao.', i: <MonitorPlay /> },
                   { t: 'Sự chào đón ấm áp', d: 'Gia nhập cộng đồng những người yêu nghệ thuật, nơi mọi ý tưởng đều được tôn trọng.', i: <Users /> }
                 ].map((item, i) => (
                    <li key={i} className="flex gap-6 items-start">
                       <div className="text-emerald-500 mt-1">{item.i}</div>
                       <div className="space-y-1">
                          <p className="font-black uppercase tracking-tight text-slate-800 dark:text-white">{item.t}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">{item.d}</p>
                       </div>
                    </li>
                 ))}
              </ul>
           </motion.div>
        </section>

        {/* 4️⃣ HOW IT WORKS */}
        <section className="py-24 border-y border-black/5 dark:border-white/5 text-center space-y-20">
           <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Hành trình 3 bước đơn giản</h2>
              <p className="text-[11px] text-gray-400 uppercase font-black tracking-[0.5em] italic">Chia sẻ → Kết nối → Sáng tạo</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                { s: '01', t: 'Gửi lời mời', d: 'Copy link cá nhân của bạn và gửi cho những tâm hồn yêu sáng tạo qua tin nhắn hoặc mạng xã hội.', i: <ArrowRight />, e: '📩' },
                { s: '02', t: 'Bạn bè gia nhập', d: 'Người thương của bạn click vào link và hoàn tất đăng ký tài khoản Skyverses.', i: <ArrowRight />, e: '✨' },
                { s: '03', t: 'Cùng nhau tỏa sáng', d: 'Credits thưởng sẽ tự động "ting ting" vào ví của cả hai khi họ bắt đầu những bước chân đầu tiên!', i: <Check />, e: '🎨' }
              ].map((step, i) => (
                 <div key={i} className="relative space-y-6 group">
                    <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6">
                       {step.e}
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">{step.t}</h4>
                       <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase leading-relaxed max-w-[200px] mx-auto text-center">"{step.d}"</p>
                    </div>
                    {i < 2 && (
                       <div className="hidden md:block absolute top-12 -right-6 text-brand-blue opacity-20 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={24} />
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </section>

        {/* 5️⃣ NOTES SECTION */}
        <section className="max-w-3xl mx-auto bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl p-12 space-y-8">
           <div className="flex items-center gap-4 text-brand-blue">
              <Info size={24} />
              <h3 className="text-xl font-black uppercase tracking-widest italic">Một chút lưu ý nhỏ</h3>
           </div>
           <div className="grid gap-6">
              {[
                'Credits thưởng có giá trị sử dụng cho tất cả công cụ trên nền tảng (Tạo ảnh, Video, Đồng bộ nhân vật).',
                'Chương trình áp dụng cho những người bạn lần đầu đăng ký và xác thực tài khoản tại Skyverses.',
                'Hãy cùng nhau xây dựng một cộng đồng sáng tạo văn minh, không spam link bạn nhé!'
              ].map((note, i) => (
                 <div key={i} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0"></div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed italic">{note}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* 6️⃣ FINAL CTA */}
        <section className="text-center space-y-12 py-20 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/[0.03] rounded-full blur-[180px] pointer-events-none"></div>
           <div className="space-y-4 relative z-10">
              <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Sẵn sàng kết nối?</h2>
              <p className="text-gray-400 uppercase text-[12px] font-black tracking-[1em] italic">Join the soul network</p>
           </div>
           <div className="flex flex-wrap justify-center gap-6 relative z-10 pt-8">
              <button className="px-12 py-6 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Hỗ trợ kỹ thuật</button>
              <button className="px-12 py-6 border border-black/10 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all text-slate-600 dark:text-white">Quy định cộng tác</button>
           </div>
        </section>

      </div>
    </div>
  );
};

export default ReferralPage;