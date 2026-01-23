
import React from 'react';
import { Megaphone, Film, ShoppingBag, Clapperboard, ChevronRight } from 'lucide-react';

const VIDEO_USE_CASES = [
  { 
    t: 'Marketing Ads', 
    d: 'Tạo video quảng cáo social thu hút, tăng tỷ lệ chuyển đổi.', 
    img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800',
    icon: <Megaphone className="text-indigo-600" />
  },
  { 
    t: 'Indie Film', 
    d: 'Sản xuất kịch bản phim ngắn, trailer với diễn viên AI nhất quán.', 
    img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    icon: <Film className="text-purple-500" />
  },
  { 
    t: 'Product Demo', 
    d: 'Review sản phẩm 3D sống động từ hình ảnh chụp thực tế.', 
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    icon: <ShoppingBag className="text-emerald-500" />
  },
  { 
    t: 'Storytelling', 
    d: 'Kể chuyện visual đa kênh với phong cách nghệ thuật độc bản.', 
    img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
    icon: <Clapperboard className="text-orange-500" />
  }
];

export const UseCasesSection: React.FC = () => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#050507] transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 space-y-24">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white transition-colors">Vận hành <br /><span className="text-indigo-600">đa kênh.</span></h2>
          </div>
          <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-xs tracking-widest max-w-xs text-right italic border-r-4 border-indigo-600 pr-6 transition-colors">"Dây chuyền sản xuất video vạn năng cho kỷ nguyên content 4.0."</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {VIDEO_USE_CASES.map((item, i) => (
            <div key={i} className="group relative overflow-hidden aspect-[3/4] bg-black rounded-sm shadow-2xl transition-all hover:scale-[1.02]">
              <img src={item.img} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt={item.t} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                <div className="space-y-4 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">{item.icon}</div>
                  <h4 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">{item.t}</h4>
                  <p className="text-xs text-white/60 font-bold uppercase tracking-widest leading-relaxed">"{item.d}"</p>
                  <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Khám phá ngay <ChevronRight size={14}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
