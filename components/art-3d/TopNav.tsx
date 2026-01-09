import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Box, Puzzle, Grid3X3, GanttChartSquare, Accessibility, X } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab, onClose }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const navTabs = [
    { id: 'Overview', label: 'Overview', icon: <Box size={16} /> },
    { id: 'Segmentation', label: 'Segmentation', icon: <Puzzle size={16} /> },
    { id: 'Retopology', label: 'Retopology', icon: <Grid3X3 size={16} /> },
    { id: 'Texture', label: 'Texture', icon: <GanttChartSquare size={16} /> },
    { id: 'Rigging', label: 'Rigging', icon: <Accessibility size={16} /> },
  ];

  return (
    <nav className="h-16 bg-[#141519] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] relative">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setActiveTab('Generate')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-tight transition-all mr-6 active:scale-95 shadow-xl ${activeTab === 'Generate' ? 'bg-yellow-500 text-black' : 'bg-white text-black hover:bg-slate-200'}`}
        >
          <Sparkles size={16} />
          Generate Model
        </button>

        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5">
          {navTabs.map((tab) => (
            <div 
              key={tab.id} 
              className="relative"
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-[#3b3d45] text-white shadow-lg' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>

              {/* HOVER PREVIEWS */}
              <AnimatePresence>
                {/* OVERVIEW PREVIEW */}
                {tab.id === 'Overview' && hoveredTab === 'Overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-4 w-72 bg-[#1c1c1f] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl z-[200] pointer-events-none"
                  >
                    <div className="aspect-video bg-black overflow-hidden relative">
                       <img 
                         src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/5f1958ba999efdc4.png" 
                         className="w-full h-full object-cover opacity-80" 
                         alt="Overview Preview" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6 space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                          <Box size={14} className="text-brand-blue" />
                          Tổng quan (Overview)
                       </h4>
                       <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                          Xem thông tin và chi tiết mô hình 3D của bạn để chuẩn bị cho các bước hậu kỳ tiếp theo.
                       </p>
                    </div>
                    <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-brand-blue"></div>
                       <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.3em]">Module_Node: v3.1</span>
                    </div>
                  </motion.div>
                )}

                {/* SEGMENTATION PREVIEW */}
                {tab.id === 'Segmentation' && hoveredTab === 'Segmentation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-4 w-72 bg-[#1c1c1f] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl z-[200] pointer-events-none"
                  >
                    <div className="aspect-video bg-black overflow-hidden relative">
                       <img 
                         src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/9eb466139cc29515.png" 
                         className="w-full h-full object-cover opacity-80" 
                         alt="Segmentation Preview" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6 space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                          <Puzzle size={14} className="text-brand-blue" />
                          Phân tách (Segmentation)
                       </h4>
                       <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                          Tách mô hình của bạn thành các phần có thể chỉnh sửa độc lập để tối ưu hóa vật liệu và diễn hoạt.
                       </p>
                    </div>
                    <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-brand-blue"></div>
                       <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.3em]">Module_Node: v3.1</span>
                    </div>
                  </motion.div>
                )}

                {/* RETOPOLOGY PREVIEW */}
                {tab.id === 'Retopology' && hoveredTab === 'Retopology' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-4 w-72 bg-[#1c1c1f] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl z-[200] pointer-events-none"
                  >
                    <div className="aspect-video bg-black overflow-hidden relative">
                       <img 
                         src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/223e7a8c9641afaf.png" 
                         className="w-full h-full object-cover opacity-80" 
                         alt="Retopology Preview" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6 space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                          <Grid3X3 size={14} className="text-brand-blue" />
                          Lưới bề mặt (Retopology)
                       </h4>
                       <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                          Tái cấu trúc (Remesh) với hệ thống đa giác Quad/Triangle sạch, tối ưu hóa cho việc diễn hoạt và render chất lượng cao.
                       </p>
                    </div>
                    <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-brand-blue"></div>
                       <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.3em]">Module_Node: v3.1</span>
                    </div>
                  </motion.div>
                )}

                {/* TEXTURE PREVIEW */}
                {tab.id === 'Texture' && hoveredTab === 'Texture' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-4 w-72 bg-[#1c1c1f] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl z-[200] pointer-events-none"
                  >
                    <div className="aspect-video bg-black overflow-hidden relative">
                       <img 
                         src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/c77abac1c246524e.png" 
                         className="w-full h-full object-cover opacity-80" 
                         alt="Texture Preview" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6 space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                          <GanttChartSquare size={14} className="text-brand-blue" />
                          Vật liệu & Kết cấu (Texture)
                       </h4>
                       <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                          Áp dụng hệ thống PBR (Physically Based Rendering) tự động, tạo ra các lớp vật liệu chân thực từ kim loại, nhựa đến vải vóc.
                       </p>
                    </div>
                    <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-brand-blue"></div>
                       <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.3em]">Module_Node: v3.1</span>
                    </div>
                  </motion.div>
                )}

                {/* RIGGING PREVIEW */}
                {tab.id === 'Rigging' && hoveredTab === 'Rigging' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-4 w-72 bg-[#1c1c1f] border border-white/10 rounded-[2rem] overflow-hidden shadow-3xl z-[200] pointer-events-none"
                  >
                    <div className="aspect-video bg-black overflow-hidden relative">
                       <img 
                         src="https://ai-cdn.gommo.net/ai/images/c1df07a5156c5710/8eb944108243aa97.png" 
                         className="w-full h-full object-cover opacity-80" 
                         alt="Rigging Preview" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6 space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                          <Accessibility size={14} className="text-brand-blue" />
                          Khung xương (Rigging)
                       </h4>
                       <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                          Tự động tạo bộ khung xương và gán trọng số bề mặt, sẵn sàng cho việc diễn hoạt trong các engine Game & Phim.
                       </p>
                    </div>
                    <div className="px-6 py-3 bg-black/20 border-t border-white/5 flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-brand-blue"></div>
                       <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.3em]">Module_Node: v3.1</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </div>
    </nav>
  );
};
