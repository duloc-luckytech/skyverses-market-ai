/**
 * ProductToolModal — Quick-launch tool workspace from marketplace card hover.
 * Maps product slug → workspace component, renders fullscreen overlay.
 * Only includes workspaces that accept a simple { onClose: () => void } prop.
 */

import React, { Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Shared minimal workspace props shape
type WorkspaceProps = { onClose: () => void };

// ── Lazy-load workspace components (only those with compatible props) ────────
const WORKSPACE_MAP: Record<string, React.LazyExoticComponent<React.ComponentType<WorkspaceProps>>> = {
  // Images
  'ai-image-generator':    React.lazy(() => import('../AIImageGeneratorWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'image-upscale-ai':      React.lazy(() => import('../UpscaleWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'background-removal-ai': React.lazy(() => import('../BackgroundRemovalWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'poster-marketing-ai':   React.lazy(() => import('../PosterStudioWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'social-banner-ai':      React.lazy(() => import('../SocialBannerWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'fashion-center-ai':     React.lazy(() => import('../FashionStudioWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'ai-image-restorer':     React.lazy(() => import('../RestorationWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'ai-stylist':            React.lazy(() => import('../AIStylistWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'bat-dong-san-ai':       React.lazy(() => import('../RealEstateWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'character-sync-studio': React.lazy(() => import('../KineticWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'banana-pro-comic-engine': React.lazy(() => import('../BananaProWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),

  // Videos
  'ai-video-generator':    React.lazy(() => import('../AIVideoGeneratorWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'studio-architect':      React.lazy(() => import('../GenyuWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'avatar-sync-ai':        React.lazy(() => import('../AvatarLipsyncWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'video-animate-ai':      React.lazy(() => import('../VideoAnimateWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'storyboard-studio':     React.lazy(() => import('../StoryboardStudioWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'character-sync-ai':     React.lazy(() => import('../CharacterSyncWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'fibus-video-studio':    React.lazy(() => import('../TextToVideoWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),

  // Audio
  'text-to-speech':        React.lazy(() => import('../TTSWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'ai-music-generator':    React.lazy(() => import('../MusicWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'music-generator':       React.lazy(() => import('../MusicWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'voice-design-ai':       React.lazy(() => import('../VoiceDesignWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
  'ai-voice-studio':       React.lazy(() => import('../VoiceStudioWorkspace') as Promise<{ default: React.ComponentType<WorkspaceProps> }>),
};

// ── Loading Spinner ──────────────────────────────────────────────────────────
const WorkspaceLoader: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#0a0a0c]">
    <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">
      Initializing Workspace...
    </span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
interface ProductToolModalProps {
  slug: string | null;
  onClose: () => void;
}

const ProductToolModal: React.FC<ProductToolModalProps> = ({ slug, onClose }) => {
  const WorkspaceComponent = slug ? WORKSPACE_MAP[slug] : undefined;

  // Escape key + body scroll lock
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    if (slug) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [slug, onClose]);

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          key="tool-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[800] flex flex-col bg-white dark:bg-[#0a0a0c]"
        >
          {!WorkspaceComponent ? (
            /* ── Fallback: no workspace matched ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
                Workspace chưa khả dụng cho sản phẩm này.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-all"
              >
                Đóng
              </button>
            </div>
          ) : (
            <Suspense fallback={<WorkspaceLoader />}>
              <WorkspaceComponent onClose={onClose} />
            </Suspense>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductToolModal;
