
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Grid, Plus, MoreVertical, 
  CheckCircle2, Star, User, Info, 
  Share2, ShieldAlert, Zap, X, ChevronRight,
  MonitorPlay, ImageIcon, LayoutPanelLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AppItem {
  id: string;
  name: string;
  category: string;
  description: string;
  author: string;
  authorPic: string;
  imageUrl: string;
  rating: number;
  isFree: boolean;
  gallery: string[];
}

const MOCK_APPS: AppItem[] = [
  {
    id: 'sora-2',
    name: 'Sora Download - No Logo',
    category: 'Ứng dụng tổng hợp',
    description: 'Tải video Sora nhanh chóng, không watermark, không giới hạn. Sora 2.0 ready.',
    author: 'Mark Zuckerberg',
    authorPic: 'https://i.pravatar.cc/150?u=mark',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    rating: 0.0,
    isFree: true,
    gallery: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: 'ai-art-studio',
    name: 'AI Art Studio',
    category: 'Ứng dụng tổng hợp',
    description: 'AI Art Studio - Thay đổi hình ảnh của bạn theo các phong cách điện ảnh nhất',
    author: 'vo khoa',
    authorPic: 'https://i.pravatar.cc/150?u=khoa',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
    rating: 0.0,
    isFree: true,
    gallery: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: 'mega-studio',
    name: 'Mega Studio',
    category: 'Ứng dụng tổng hợp',
    description: 'Mega Studio là ứng dụng biên tập video chuyên nghiệp được thiết kế...',
    author: 'Mark Zuckerberg',
    authorPic: 'https://i.pravatar.cc/150?u=mark',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    isFree: true,
    gallery: []
  },
  {
    id: 'concept-app',
    name: 'APP tạo ảnh concept',
    category: 'Ứng dụng hình ảnh',
    description: 'Không có mô tả',
    author: 'Tuan AI',
    authorPic: 'https://i.pravatar.cc/150?u=tuan',
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=600',
    rating: 0.0,
    isFree: true,
    gallery: []
  },
  {
    id: 'ken',
    name: 'ken',
    category: 'Ứng dụng tổng hợp',
    description: 'Không có mô tả',
    author: 'manh son',
    authorPic: 'https://i.pravatar.cc/150?u=son',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=600',
    rating: 0.0,
    isFree: true,
    gallery: []
  },
  {
    id: 'xx',
    name: 'x x',
    category: 'Ứng dụng tổng hợp',
    description: 'svsvs',
    author: 'NGUYEN HUE',
    authorPic: 'https://i.pravatar.cc/150?u=hue',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=600',
    rating: 0.0,
    isFree: true,
    gallery: []
  }
];

const AppsPage = () => {
  const [activeTab, setActiveTab] = useState('Đề xuất');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const navigate = useNavigate();

  const imgApps = MOCK_APPS.filter(a => a.category === 'Ứng dụng hình ảnh');
  const otherApps = MOCK_APPS.filter(a => a.category === 'Ứng dụng tổng hợp');

  return (
    <div className="pt-24 min-h-screen bg-[#0d1117] text-white transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5 w-fit mb-12">
          {['Đề xuất', 'Đã Mua', 'My Apps'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-lg text-[13px] font-bold transition-all ${activeTab === tab ? 'bg-[#21262d] text-cyan-400 shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-16">
          
          {/* Section: Image Apps */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                 <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight italic">
                Ứng dụng hình ảnh <span className="ml-2 text-gray-500 not-italic">({imgApps.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {imgApps.map(app => (
                <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
              ))}
            </div>
          </section>

          {/* Section: Other Apps */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                 <LayoutPanelLeft size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight italic">
                Ứng dụng tổng hợp <span className="ml-2 text-gray-500 not-italic">({otherApps.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {otherApps.map(app => (
                <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedApp(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-[#0d1117] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-3xl"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedApp(null)}
                className="absolute top-6 right-6 z-50 p-2 bg-black/40 hover:bg-red-500 transition-colors rounded-full text-white"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col h-full">
                {/* Top Image Section */}
                <div className="h-[400px] bg-[#161b22] relative flex flex-col items-center justify-center p-8">
                   <div className="max-w-md w-full text-center space-y-6">
                      <h3 className="text-3xl font-black italic">Step 1: <span className="text-white font-medium">Upload Your Photo</span></h3>
                      <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl">
                         <img src={selectedApp.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <button className="bg-brand-blue text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl hover:brightness-110">
                        Change Image
                      </button>
                   </div>
                </div>

                {/* Bottom Info Section */}
                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12 bg-[#090d13]">
                   <div className="md:col-span-2 space-y-8">
                      <div className="space-y-4">
                         <div className="space-y-1">
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">{selectedApp.name}</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">ID: {selectedApp.id.toUpperCase()}-{Math.random().toString(36).substr(2,6)}</p>
                         </div>
                         <div className="flex items-center gap-1 text-yellow-500">
                            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= 4 ? 'currentColor' : 'none'} className="opacity-20" />)}
                            <span className="text-[11px] font-bold text-gray-500 ml-2">({selectedApp.rating.toFixed(1)} rating)</span>
                         </div>
                         <p className="text-gray-400 text-base leading-relaxed font-medium">
                            {selectedApp.description}
                         </p>
                      </div>

                      {selectedApp.gallery.length > 0 && (
                        <div className="space-y-4">
                           <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 italic">Hình ảnh</h4>
                           <div className="flex gap-4">
                              {selectedApp.gallery.map((img, i) => (
                                <div key={i} className="w-20 h-28 rounded-lg overflow-hidden border border-white/10 bg-black">
                                   <img src={img} className="w-full h-full object-cover" alt="" />
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="space-y-8">
                      <button 
                        onClick={() => navigate(`/app/${selectedApp.id}`)}
                        className="w-full bg-[#00d1d1] hover:bg-cyan-400 text-black py-5 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                      >
                         Truy Cập Apps
                      </button>

                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Tác giả</p>
                         <div className="flex items-center gap-4">
                            <img src={selectedApp.authorPic} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                            <div>
                               <p className="text-sm font-black uppercase italic">{selectedApp.author}</p>
                               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">@{selectedApp.author.replace(' ', '').toLowerCase()}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-4">
                         <button className="flex-grow flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            <ShieldAlert size={14} /> Report
                         </button>
                         <button className="flex-grow flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            <Share2 size={14} /> Share
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Fix: Explicitly type AppCard as React.FC to handle the reserved 'key' prop correctly in lists.
const AppCard: React.FC<{ app: AppItem; onClick: () => void }> = ({ app, onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-[#161b22] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col group cursor-pointer shadow-xl hover:border-cyan-500/30 transition-all duration-500"
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-black">
        <img src={app.imageUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt={app.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-80"></div>
        
        {app.isFree && (
          <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-md border border-green-500/40 px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest text-green-400">
             MIỄN PHÍ
          </div>
        )}
      </div>

      <div className="p-6 flex-grow space-y-4">
         <div className="space-y-1">
            <h3 className="text-base font-black uppercase italic tracking-tighter text-white group-hover:text-cyan-400 transition-colors">{app.name}</h3>
            <p className="text-[10px] text-gray-500 font-medium line-clamp-2 leading-relaxed">
               {app.description === 'Không có mô tả' ? 'Architecture optimized for creative pipelines.' : app.description}
            </p>
         </div>

         <div className="flex items-center gap-3 pt-2">
            <img src={app.authorPic} className="w-6 h-6 rounded-full border border-white/10" alt="" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{app.author}</span>
         </div>
      </div>
    </motion.div>
  );
};

export default AppsPage;
