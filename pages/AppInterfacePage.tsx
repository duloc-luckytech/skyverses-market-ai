
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, LogOut, Zap, Download, 
  CheckCircle2, Info, ArrowRight, ShieldCheck,
  Smartphone, Activity, Globe, MonitorPlay,
  Lock, CreditCard, Coins, User
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppInterfacePage = () => {
  const { id } = useParams();
  const { user, credits } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pt-24 pb-40 relative transition-colors duration-500">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/apps')}
        className="fixed top-28 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all z-50 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
        
        {/* User Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#161b22] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-3xl"
        >
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-full bg-brand-blue/20 border-2 border-brand-blue/30 flex items-center justify-center text-brand-blue shadow-lg">
                <User size={32} />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{user?.name || 'Xvirion'}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">@{user?.email?.split('@')[0] || 'xvirion25749'}</p>
             </div>
          </div>

          <div className="flex items-center gap-12">
             <div className="text-center space-y-1">
                <div className="flex items-center gap-3 text-yellow-500">
                   <Zap size={18} fill="currentColor" />
                   <span className="text-2xl font-black italic tracking-tighter">{credits.toLocaleString()}</span>
                </div>
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">AI Credits</p>
             </div>
             
             <div className="h-12 w-px bg-white/5"></div>

             <div className="text-center space-y-1">
                <div className="flex items-center gap-3 text-purple-500">
                   <Download size={18} />
                   <span className="text-2xl font-black italic tracking-tighter">0 / 5</span>
                </div>
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Limit Download Sora</p>
             </div>
          </div>

          <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-gray-400">
             <LogOut size={20} />
          </button>
        </motion.div>

        {/* Input Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bg-[#161b22] border border-white/5 p-4 rounded-[2rem] flex flex-col md:flex-row gap-4 shadow-2xl"
        >
           <input 
             type="text" 
             value={url}
             onChange={e => setUrl(e.target.value)}
             placeholder="https://sora.chatgpt.com/p/s_..."
             className="flex-grow bg-[#0d1117] border border-white/5 rounded-2xl px-8 py-5 text-sm font-medium focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-700"
           />
           <button className="bg-brand-blue text-white px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">
              Lấy Link Download
           </button>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <InfoCard 
             title="Tải Video Sora. Tức Thì. Không Logo."
             features={[
               { l: 'Tốc độ siêu nhanh', d: 'Tải video chỉ trong vài giây.' },
               { l: 'Chất lượng nguyên bản', d: 'Video sắc nét, không bị chèn logo hay watermark.' },
               { l: 'Xem trước tiện lợi', d: 'Xem video ngay trên trình duyệt trước khi tải.' },
               { l: 'Tải xuống 1-Click', d: 'Giao diện tối giản, trải nghiệm mượt mà như app iOS.' },
               { l: 'Hoàn toàn miễn phí', d: 'Không giới hạn, không cần đăng nhập.' }
             ]}
           />
           <InfoCard 
             title="Instant Sora Video Downloads. No Watermarks."
             isEn
             features={[
               { l: 'Blazing Fast Speed', d: 'Download your videos in just a few seconds.' },
               { l: 'Pristine Quality', d: 'Crisp, clear videos with no logos or watermarks.' },
               { l: 'Instant Preview', d: 'Watch the video directly in your browser before downloading.' },
               { l: '1-Click Download', d: 'Minimalist interface for a seamless, iOS-like experience.' },
               { l: 'Completely Free', d: 'No limits, no sign-up required.' }
             ]}
           />
        </div>

      </div>
    </div>
  );
};

const InfoCard = ({ title, features, isEn = false }: any) => (
  <div className="bg-[#161b22] border border-white/5 p-10 rounded-[2.5rem] space-y-8 shadow-xl">
     <div className="space-y-4">
        <h2 className="text-2xl font-black italic tracking-tighter text-white">🌟 {title}</h2>
        <p className="text-gray-400 text-sm font-medium leading-relaxed italic">
           {isEn 
             ? '♦ Experience the smoothest and fastest way to download Sora videos. Get original quality, logo-free videos ready for any use, all with a single click.'
             : '♦ Trải nghiệm tải video Sora mượt mà và nhanh chóng nhất. Video chất lượng gốc, không logo, sẵn sàng cho mọi mục đích sử dụng của bạn chỉ trong một cú nhấp.'
           }
        </p>
     </div>

     <div className="space-y-5">
        {features.map((f: any, i: number) => (
          <div key={i} className="flex gap-4 items-start">
             <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
             <p className="text-sm font-medium leading-relaxed">
                <strong className="text-white uppercase tracking-tight italic">{f.l}:</strong> <span className="text-gray-400">{f.d}</span>
             </p>
          </div>
        ))}
     </div>
  </div>
);

export default AppInterfacePage;
