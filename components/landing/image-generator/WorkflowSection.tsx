
import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Terminal, Cpu, Sliders, Zap } from 'lucide-react';

const WORKFLOW_STEPS = [
  { 
    step: '01', 
    title: 'Ảnh tham chiếu (Reference)', 
    desc: 'Khởi tạo định danh thị giác. Upload tối đa 6 ảnh để AI hiểu style, nhân vật và bố cục. Hệ thống hỗ trợ khóa Identity Lock giúp giữ vững các đặc điểm quan trọng.',
    icon: <ImageIcon size={32} />,
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    tags: ['Max 6 images', 'Identity Sync', 'Optional']
  },
  { 
    step: '02', 
    title: 'Kịch bản (Prompt Script)', 
    desc: 'Mô tả hình ảnh mong muốn bằng ngôn ngữ tự nhiên. Hệ thống hỗ trợ kịch bản dài, chi tiết, phù hợp cho cả nhu cầu sáng tạo tự do và sản xuất thương mại.',
    icon: <Terminal size={32} />,
    img: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800',
    tags: ['Natural Language', 'High Detail', 'Logic Binding']
  },
  { 
    step: '03', 
    title: 'Lựa chọn Model Engine', 
    desc: 'Tùy chỉnh trung tâm xử lý. Chọn model AI phù hợp với mục tiêu chất lượng và ngân sách Credits. Mỗi Engine được tối ưu hóa cho các phong cách hiển thị khác nhau.',
    icon: <Cpu size={32} />,
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=800',
    tags: ['Gemini 3 Pro', 'Banana Pro', 'Custom Nodes']
  },
  { 
    step: '04', 
    title: 'Output Specification', 
    desc: 'Thiết lập tham số cuối cùng. Tùy chỉnh tỷ lệ khung hình (1:1, 16:9, 9:16...), độ phân giải (1K, 2K, 4K) và số lượng biến thể cần tạo trong một chu kỳ.',
    icon: <Sliders size={32} />,
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    tags: ['Multi-Ratio', 'UHD Resolution', 'Quantity Control']
  },
  { 
    step: '05', 
    title: 'Generate & Credits', 
    desc: 'Thực thi kiến tạo. Hình ảnh được tổng hợp trong vài giây. Hệ thống hiển thị rõ ràng số lượng Credits tiêu thụ dựa trên cấu hình đã thiết lập.',
    icon: <Zap size={32} />,
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    tags: ['Fast Inference', 'Real-time Sync', 'Credit Clear']
  }
];

export const WorkflowSection: React.FC = () => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center space-y-4 mb-32">
          <span className="text-brand-blue font-black uppercase tracking-[0.6em] text-[11px]">Production Pipeline</span>
          <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-tight text-slate-900 dark:text-white transition-colors">Quy trình <span className="text-brand-blue">vận hành.</span></h2>
          <p className="text-slate-500 dark:text-gray-400 font-medium max-w-xl mx-auto italic">“Thiết kế chính xác theo từng bước của giao diện chuyên nghiệp.”</p>
        </div>

        <div className="space-y-40">
          {WORKFLOW_STEPS.map((item, idx) => (
            <motion.div 
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="lg:w-1/2 relative group">
                <div className="absolute -inset-4 bg-brand-blue/5 rounded-[3rem] blur-2xl group-hover:bg-brand-blue/10 transition-all"></div>
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 bg-black">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                </div>
              </div>
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-black italic text-brand-blue/40">STEP_{item.step}</span>
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white transition-colors">{item.title}</h3>
                </div>
                <p className="text-lg lg:text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-4 border-brand-blue pl-6 transition-colors">
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
