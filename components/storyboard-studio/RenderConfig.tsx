
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, ImageIcon, Film, ChevronDown, Monitor, Clock, Play, Loader2 } from 'lucide-react';
import { pricingApi, PricingModel } from '../../apis/pricing';

interface RenderConfigProps {
  settings: any;
  setSettings: (updates: any) => void;
}

export const RenderConfig: React.FC<RenderConfigProps> = ({ settings, setSettings }) => {
  const [imageModels, setImageModels] = useState<PricingModel[]>([]);
  const [videoModels, setVideoModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(true);

  const selectClass = "w-full bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-3 rounded-lg text-[11px] font-bold uppercase outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-800 dark:text-white";

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const [imgRes, vidRes] = await Promise.all([
          pricingApi.getPricing({ tool: 'image' }),
          pricingApi.getPricing({ tool: 'video' })
        ]);

        if (imgRes.success) setImageModels(imgRes.data);
        if (vidRes.success) setVideoModels(vidRes.data);
      } catch (error) {
        console.error("Failed to fetch pricing models for StoryboardStudio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Lấy danh sách độ phân giải và thời lượng từ model video đang chọn
  const currentVideoModel = useMemo(() => {
    return videoModels.find(m => m.modelKey === settings.model) || videoModels[0];
  }, [videoModels, settings.model]);

  const availableVideoResolutions = useMemo(() => {
    return currentVideoModel?.pricing ? Object.keys(currentVideoModel.pricing) : ['720p', '1080p'];
  }, [currentVideoModel]);

  const availableVideoDurations = useMemo(() => {
    if (!currentVideoModel?.pricing) return ['5', '8', '10'];
    const firstRes = Object.keys(currentVideoModel.pricing)[0];
    return Object.keys(currentVideoModel.pricing[firstRes]);
  }, [currentVideoModel]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Đang tải cấu hình máy chủ...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50/50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-10 shadow-sm transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-brand-blue" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-slate-900 dark:text-white">CẤU HÌNH KẾT XUẤT</h3>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 rounded-full text-[10px] font-black uppercase text-brand-blue hover:bg-brand-blue hover:text-white transition-all">
          <Zap size={12} fill="currentColor" /> Thiết lập nhanh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IMAGE CONFIG BOX */}
        <div className="p-8 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-[1.5rem] space-y-6">
          <div className="flex items-center gap-3">
            <ImageIcon size={18} className="text-brand-blue" />
            <span className="text-[12px] font-black uppercase tracking-widest text-brand-blue">Mô hình ảnh (Storyboard)</span>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <select 
                className={selectClass}
                onChange={(e) => setSettings({ ...settings, imageModel: e.target.value })}
              >
                {imageModels.map(m => (
                  <option key={m._id} value={m.modelKey} className="bg-white dark:bg-[#111]">{m.name}</option>
                ))}
                {imageModels.length === 0 && <option>Không có dữ liệu model ảnh</option>}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select className={selectClass}>
                  <option className="bg-white dark:bg-[#111]">auto</option>
                  <option className="bg-white dark:bg-[#111]">1:1</option>
                  <option className="bg-white dark:bg-[#111]">16:9</option>
                  <option className="bg-white dark:bg-[#111]">9:16</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select className={selectClass}>
                  <option className="bg-white dark:bg-[#111]">1k</option>
                  <option className="bg-white dark:bg-[#111]">2k</option>
                  <option className="bg-white dark:bg-[#111]">4k</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="relative">
              <select className={selectClass}>
                <option className="bg-white dark:bg-[#111]">Vip - Hỗ trợ ưu tiên</option>
                <option className="bg-white dark:bg-[#111]">Standard - Hàng đợi</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* VIDEO CONFIG BOX */}
        <div className="p-8 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-[1.5rem] space-y-6">
          <div className="flex items-center gap-3">
            <Film size={18} className="text-purple-500" />
            <span className="text-[12px] font-black uppercase tracking-widest text-purple-500">Mô hình video (Final)</span>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <select 
                className={selectClass}
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              >
                {videoModels.map(m => (
                  <option key={m._id} value={m.modelKey} className="bg-white dark:bg-[#111]">{m.name}</option>
                ))}
                {videoModels.length === 0 && <option>Không có dữ liệu model video</option>}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select className={selectClass}>
                  <option className="bg-white dark:bg-[#111]">16:9 - Ngang</option>
                  <option className="bg-white dark:bg-[#111]">9:16 - Dọc</option>
                  <option className="bg-white dark:bg-[#111]">1:1 - Vuông</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select className={selectClass}>
                  {availableVideoResolutions.map(res => (
                    <option key={res} value={res} className="bg-white dark:bg-[#111]">{res.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select className={selectClass}>
                  {availableVideoDurations.map(dur => (
                    <option key={dur} value={dur} className="bg-white dark:bg-[#111]">{dur}s</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <select className={selectClass}>
                   <option value="fast" className="bg-white dark:bg-[#111]">Fast - Render nhanh</option>
                   <option value="quality" className="bg-white dark:bg-[#111]">Quality - Chất lượng</option>
                   <option value="relaxed" className="bg-white dark:bg-[#111]">Relaxed - Tiết kiệm</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
