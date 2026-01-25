import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, ImageIcon, Film, ChevronDown, Monitor, Clock, Play, Loader2 } from 'lucide-react';
import { pricingApi, PricingModel } from '../../apis/pricing';

interface RenderConfigProps {
  settings: any;
  setSettings: (updates: any) => void;
}

export const RenderConfig: React.FC<RenderConfigProps> = ({ settings, setSettings }) => {
  // Added handleChange helper to fix "Cannot find name 'handleChange'" error on line 177
  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const [imageModels, setImageModels] = useState<PricingModel[]>([]);
  const [videoModels, setVideoModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(true);

  const selectClass = "w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-xs font-bold uppercase outline-none appearance-none focus:border-brand-blue transition-all cursor-pointer text-slate-800 dark:text-white shadow-inner";
  const sectionLabel = "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-600 mb-3 block px-1";

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
      <div className="py-20 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse italic">Synchronizing Model Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* IMAGE CONFIGURATION */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <ImageIcon size={18} />
          </div>
          <h4 className="text-sm font-black uppercase italic tracking-widest text-slate-900 dark:text-white">Storyboard Engine (Image)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={sectionLabel}>MÔ HÌNH XỬ LÝ</label>
            <div className="relative">
              <select 
                className={selectClass}
                value={settings.imageModel}
                onChange={(e) => setSettings({ ...settings, imageModel: e.target.value })}
              >
                {imageModels.map(m => (
                  <option key={m._id} value={m.modelKey} className="dark:bg-[#111]">{m.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className={sectionLabel}>TỈ LỆ (RATIO)</label>
               <div className="relative">
                  <select className={selectClass}>
                    <option className="dark:bg-[#111]">1:1</option>
                    <option className="dark:bg-[#111]">16:9</option>
                    <option className="dark:bg-[#111]">9:16</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
               </div>
             </div>
             <div className="space-y-2">
               <label className={sectionLabel}>CHẤT LƯỢNG</label>
               <div className="relative">
                  <select className={selectClass}>
                    <option className="dark:bg-[#111]">1K</option>
                    <option className="dark:bg-[#111]">2K</option>
                    <option className="dark:bg-[#111]">4K</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* VIDEO CONFIGURATION */}
      <section className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-600">
            <Film size={18} />
          </div>
          <h4 className="text-sm font-black uppercase italic tracking-widest text-slate-900 dark:text-white">Synthesis Engine (Video)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={sectionLabel}>MÔ HÌNH XỬ LÝ</label>
            <div className="relative">
              <select 
                className={selectClass}
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              >
                {videoModels.map(m => (
                  <option key={m._id} value={m.modelKey} className="dark:bg-[#111]">{m.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className={sectionLabel}>PHÂN GIẢI</label>
               <div className="relative">
                  <select className={selectClass}>
                    {availableVideoResolutions.map(res => (
                      <option key={res} value={res} className="dark:bg-[#111]">{res.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
               </div>
             </div>
             <div className="space-y-2">
               <label className={sectionLabel}>THỜI LƯỢNG</label>
               <div className="relative">
                  <select className={selectClass}>
                    {availableVideoDurations.map(dur => (
                      <option key={dur} value={dur} className="dark:bg-[#111]">{dur}s</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className={sectionLabel}>CHẾ ĐỘ ƯU TIÊN</label>
          <div className="flex gap-2 bg-slate-100 dark:bg-black/60 p-1 rounded-xl w-fit border border-black/5 dark:border-white/5">
             {['fast', 'quality', 'relaxed'].map(mode => (
               <button 
                 key={mode}
                 onClick={() => handleChange('mode', mode)}
                 className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${settings.mode === mode ? 'bg-white dark:bg-[#2a2a2e] text-brand-blue shadow-lg' : 'text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
               >
                 {mode}
               </button>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};
