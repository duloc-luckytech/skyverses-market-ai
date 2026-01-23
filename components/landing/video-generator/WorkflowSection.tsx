
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, ImageIcon, Cpu, Film, Sparkles } from 'lucide-react';

const VIDEO_WORKFLOW = [
  { 
    step: '01', 
    title: 'Xây dựng kịch bản', 
    desc: 'Nhập nội dung câu chuyện bằng ngôn ngữ tự nhiên. AI sẽ phân tích ngữ nghĩa để chuẩn bị cho việc bóc tách phân cảnh điện ảnh.',
    icon: <Terminal size={32} />,
    img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    tags: ['Natural Language', 'Auto-Parsing']
  },
  { 
    step: '02', 
    title: 'Khóa định danh nhân vật', 
    desc: 'Tải lên ảnh nhân vật mỏ neo. Hệ thống sử dụng Identity Lock để đảm bảo nhân vật luôn đồng nhất 100% qua mọi cảnh quay.',
    icon: <ImageIcon size={32} />,
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    tags: ['Zero-Drift', 'Identity Sync']
  },
  { 
    step: '03', 
    title: 'Cấu hình Production', 
    desc: 'Lựa chọn Model Engine (VEO 3.1 Pro), thiết lập tỷ lệ khung hình và độ phân giải 1080p hoặc 4K cho thành phẩm.',
    icon: <Cpu size={32} />,
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=800',
    tags: ['VEO 3.1', 'H100 Node']
  },
  { 
    step: '04', 
    title: 'Kết xuất Master', 
    desc: 'Kích hoạt chu trình tổng hợp. AI kết hợp kịch bản, nhân vật và vật lý chuyển động để tạo ra video master sẵn sàng công chiếu.',
    icon: <Sparkles size={32} />,
    img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    tags: ['4K Render', 'Cinematic Motion']
  }
];

export const WorkflowSection: React.FC = () => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center space-y-4 mb-32">
          <span className="text-indigo-600 font-black uppercase tracking-[0.6em] text-[11px]">Industrial Pipeline</span>
          <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-tight text-slate-900 dark:text-white transition-colors">Dây chuyền <span className="text-indigo-600">sản xuất.</span></h2>
          <p className="text-slate-500 dark:text-gray-400 font-medium max-w-xl mx-auto italic">“Tự động hóa từ ý tưởng đến khung hình điện ảnh cuối cùng.”</p>
        </div>

        <div className="space-y-40">
          {VIDEO_WORKFLOW.map((item, idx) => (
            <motion.div 
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="lg:w-1/2 relative group">
                <div className="absolute -inset-4 bg-indigo-600/5 rounded-[3rem] blur-2xl group-hover:bg-indigo-600/10 transition-all"></div>
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 bg-black">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                </div>
              </div>
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-black italic text-indigo-600/40">PHASE_{item.step}</span>
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white transition-colors">{item.title}</h3>
                </div>
                <p className="text-lg lg:text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-4 border-indigo-600 pl-6 transition-colors">
                  "{item.desc}"
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-black/5 dark:border-white/10">#{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
