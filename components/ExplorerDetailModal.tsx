
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import MediaViewport from './explorer/MediaViewport';
import SidebarHeader from './explorer/SidebarHeader';
import ContentInfo from './explorer/ContentInfo';
import TechnicalSpecs from './explorer/TechnicalSpecs';
import TagSection from './explorer/TagSection';
import ActionFooter from './explorer/ActionFooter';
import UpscaleWorkspace from './UpscaleWorkspace';
import Art3DWorkspace from './Art3DWorkspace';
import { useArt3DGenerator } from '../hooks/useArt3DGenerator';

export interface ExplorerItem {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'prompt' | 'game_asset' | 'game_asset_3d' | 'text_video' | 'image_video' | 'character' | 'cinematic' | 'gameplay';
  thumbnailUrl: string;
  mediaUrl: string;
  url?: string;
  tags?: string[];
  categories?: string[];
  authorName?: string;
  author?: string;
  authorHandle?: string;
  prompt?: string;
  engine?: string;
  model?: string;
  modelKey?: string;
  resolution?: string;
  seed?: number;
  views?: number;
  likes?: number;
  meta?: Record<string, any>;
  createdAt?: string;
  status?: string;
}

interface ExplorerDetailModalProps {
  item: ExplorerItem | null;
  onClose: () => void;
}

const ExplorerDetailModal: React.FC<ExplorerDetailModalProps> = ({ item, onClose }) => {
  const [isUpscaleOpen, setIsUpscaleOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  // Khởi tạo logic 3D để dùng trong Workspace
  const art3dLogic = useArt3DGenerator();

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-white/95 dark:bg-black/98 flex flex-col md:flex-row items-center justify-center overflow-hidden transition-colors duration-500"
      >
        {/* PHẦN TRÁI: VIEWPORT TRÌNH CHIẾU */}
        <div className="flex-grow w-full h-[45vh] md:h-full flex flex-col relative overflow-hidden group">
          {/* Mobile Controller Overlay */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50 md:hidden">
            <button 
              onClick={onClose}
              className="p-3 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full text-slate-900 dark:text-white border border-black/5 dark:border-white/10 shadow-lg"
            >
              <X size={20} />
            </button>
            <div className="flex gap-2">
              <button className="p-3 bg-brand-blue text-white rounded-full shadow-lg"><Heart size={16} fill="currentColor" /></button>
            </div>
          </div>

          <MediaViewport 
            mediaUrl={item.mediaUrl}
            thumbnailUrl={item.thumbnailUrl}
            type={item.type}
            title={item.title}
            views={item.views || 0}
          />
        </div>

        {/* PHẦN PHẢI: SIDEBAR THÔNG TIN CHI TIẾT */}
        <aside className="w-full md:w-[480px] h-[55vh] md:h-full bg-white dark:bg-[#0d0d0f] border-l border-black/5 dark:border-white/5 flex flex-col shrink-0 z-[60] shadow-2xl transition-colors duration-500">
          
          <SidebarHeader 
            authorName={item.authorName || 'Kiến trúc sư Skyverses'} 
            onClose={onClose} 
          />

          {/* Nội dung cuộn của Sidebar */}
          <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-10">
            <ContentInfo 
              title={item.title}
              description={item.description}
              prompt={item.prompt}
            />

            <TechnicalSpecs 
              modelKey={item.modelKey}
              engine={item.engine}
              resolution={item.resolution}
              seed={item.seed}
              createdAt={item.createdAt}
            />

            <TagSection 
              tags={item.tags}
              categories={item.categories}
            />
          </div>

          <ActionFooter 
            mediaUrl={item.mediaUrl || item.thumbnailUrl} 
            type={item.type}
            onUpscale={() => setIsUpscaleOpen(true)}
            onOpenStudio={() => setIsStudioOpen(true)}
          />
        </aside>

        {/* OVERLAY CÔNG CỤ UPSCALE */}
        <AnimatePresence>
          {isUpscaleOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-2xl overflow-hidden"
            >
              <UpscaleWorkspace 
                onClose={() => setIsUpscaleOpen(false)} 
                initialImage={item.mediaUrl || item.thumbnailUrl}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* OVERLAY CÔNG CỤ 3D STUDIO */}
        <AnimatePresence>
          {isStudioOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="fixed inset-0 z-[1200] bg-[#141519] overflow-hidden"
            >
              <Art3DWorkspace 
                onClose={() => setIsStudioOpen(false)} 
                logic={{
                  ...art3dLogic,
                  // Ghi đè model mặc định bằng model hiện tại từ Explorer
                  assets: [{
                    id: 'explorer-asset',
                    name: item.title,
                    thumb: item.thumbnailUrl,
                    type: 'Textured',
                    faces: 'Calculated...',
                    vertices: 'Calculated...'
                  }, ...art3dLogic.assets]
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExplorerDetailModal;
