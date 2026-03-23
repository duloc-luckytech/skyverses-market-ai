
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
        className="fixed inset-0 z-[1000] bg-white dark:bg-[#0a0a0c] flex flex-col md:flex-row overflow-hidden transition-colors"
      >
        {/* LEFT: MEDIA VIEWPORT */}
        <div className="flex-grow w-full h-[45vh] md:h-full flex flex-col relative overflow-hidden">
          {/* Mobile close button */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 md:hidden">
            <button onClick={onClose} className="p-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-xl text-slate-700 dark:text-white border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
              <X size={18} />
            </button>
            <button className="p-2.5 bg-brand-blue text-white rounded-xl shadow-sm">
              <Heart size={14} fill="currentColor" />
            </button>
          </div>

          <MediaViewport 
            mediaUrl={item.mediaUrl}
            thumbnailUrl={item.thumbnailUrl}
            type={item.type}
            title={item.title}
            views={item.views || 0}
          />
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="w-full md:w-[420px] h-[55vh] md:h-full bg-white dark:bg-[#0e0e12] border-l border-black/[0.04] dark:border-white/[0.04] flex flex-col shrink-0 z-[60] transition-colors">
          
          <SidebarHeader 
            authorName={item.authorName || 'Skyverses Creator'} 
            onClose={onClose} 
          />

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto no-scrollbar px-5 py-5 space-y-6">
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
