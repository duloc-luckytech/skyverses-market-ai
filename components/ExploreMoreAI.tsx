
import React from 'react';
import { motion } from 'framer-motion';

const AI_TAGS = [
  "Cinema Studio", "Visual Effects", "Higgsfield Soul", "Higgsfield Apps", 
  "Kling 2.1 Master", "Camera Controls", "Viral", "Action movements", 
  "Commercial", "MiniMax Hailuo 02", "Seedance Pro", "Community", 
  "Wan 2.2 Image", "Seedream 4.0", "Nano Banana", "Flux Kontext", 
  "GPT Image", "Topaz", "Google Veo3", "Kling 2.5 Turbo", 
  "Kling Avatars 2.0", "Wan 2.5", "Sora 2", "Sora 2 Presets", 
  "Banana Placement", "Product Placement", "Edit Image", "Multi Reference", 
  "Upscale", "Assists", "YouTube", "TikTok", "Instagram Reels", 
  "YouTube Shorts", "Nano Banana Pro", "Kling o1"
];

const ExploreMoreAI: React.FC = () => {
  return (
    <section className="w-full py-32 mt-20 border-t border-black/5 dark:border-white/5 bg-slate-50/30 dark:bg-[#08080a] transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white"
          >
            Explore More <span className="text-brand-blue">AI Features</span>
          </motion.h2>
          <div className="w-24 h-1 bg-brand-blue mx-auto rounded-full opacity-50"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 md:gap-3">
          {AI_TAGS.map((tag, idx) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.02 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 144, 255, 0.1)', borderColor: 'rgba(0, 144, 255, 0.3)' }}
              className="px-4 py-2.5 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white transition-all shadow-sm"
            >
              {tag}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreMoreAI;
