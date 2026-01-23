
import React from 'react';
import { Loader2 } from 'lucide-react';

interface NoelShowcaseProps {
  images: any[];
  loading: boolean;
}

export const NoelShowcase: React.FC<NoelShowcaseProps> = ({ images, loading }) => {
  return (
    <div className="lg:col-span-6 h-[700px] relative">
      <div className="absolute inset-0 overflow-hidden mask-fade-vertical">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Đang tải mẫu thiết kế...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 animate-marquee-vertical">
            {[...images, ...images].map((img, idx) => (
              <div 
                key={`${img._id}-${idx}`}
                className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 group shadow-2xl"
              >
                <img 
                  src={img.thumbnailUrl} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                  alt={img.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 right-6">
                   <span className="text-[8px] font-black uppercase text-rose-400 tracking-widest block mb-2">Ảnh tạo bởi AI</span>
                   <h3 className="text-lg font-black italic uppercase tracking-tighter text-white line-clamp-2 drop-shadow-lg">
                     {img.title}
                   </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          animation: marquee-vertical 40s linear infinite;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
