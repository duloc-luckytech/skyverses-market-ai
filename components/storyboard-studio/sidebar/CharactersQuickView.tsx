import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';
import { ReferenceAsset, AssetStatus } from '../../../hooks/useStoryboardStudio';

const STATUS_DOT: Record<AssetStatus, string> = {
  idle:       'bg-white/20',
  processing: 'bg-amber-400 animate-pulse',
  done:       'bg-emerald-500',
  error:      'bg-rose-500',
};

interface CharactersQuickViewProps {
  assets: ReferenceAsset[];
  onNavigateToAssets: () => void;
}

export const CharactersQuickView: React.FC<CharactersQuickViewProps> = ({ assets, onNavigateToAssets }) => {
  const characters = assets.filter(a => a.type === 'CHARACTER').slice(0, 5);
  const locations  = assets.filter(a => a.type === 'LOCATION').slice(0, 2);
  const allPreview = [...characters, ...locations].slice(0, 5);

  return (
    <div className="px-5 py-4 border-b border-white/8 space-y-2.5">
      {/* Section header */}
      <button
        onClick={onNavigateToAssets}
        className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors group"
      >
        <span className="flex items-center gap-1.5">
          <Users size={12} />
          Nhân vật & Bối cảnh
          {assets.length > 0 && (
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-px text-white/40 normal-case tracking-normal font-bold text-[9px]">
              {assets.length}
            </span>
          )}
        </span>
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Asset list */}
      <AnimatePresence mode="popLayout">
        {allPreview.length === 0 ? (
          <p className="text-[10px] text-white/25 italic py-1">
            Chưa có nhân vật — thêm ở tab Assets
          </p>
        ) : (
          allPreview.map((asset, i) => (
            <motion.button
              key={asset.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ delay: i * 0.04 }}
              onClick={onNavigateToAssets}
              className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="w-7 h-7 rounded-md bg-white/10 shrink-0 overflow-hidden border border-white/10">
                {asset.url ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-white/30 text-[9px] font-black">
                    {asset.name[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name + type */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-semibold text-white/70 group-hover:text-white transition-colors truncate leading-none">
                  {asset.name}
                </p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5 leading-none">
                  {asset.type === 'CHARACTER' ? 'Nhân vật' : asset.type === 'LOCATION' ? 'Bối cảnh' : 'Vật thể'}
                </p>
              </div>

              {/* Status dot */}
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[asset.status]}`} title={asset.status} />
            </motion.button>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};
