import React from 'react';
import { HomeBlock, Solution } from '../../types';
import type { ShowcaseImage, ShowcaseVideo } from '../../src/constants/showcase-cdn';
import { HomepageKeyframes } from './homepage/shared';
import CreatorsShowcaseSection from './homepage/CreatorsShowcaseSection';
import PromptDemoSection from './homepage/PromptDemoSection';
import CmsBlockSection from './homepage/CmsBlockSection';
import SolutionSection from './homepage/SolutionSection';
import AppGameSection from './homepage/AppGameSection';
import TrustStripSection from './homepage/TrustStripSection';
import FinalCtaSection from './homepage/FinalCtaSection';

type HomepageV2SectionsProps = {
  solutions: Solution[];
  homeBlocks: HomeBlock[];
  loading: boolean;
  favorites: string[];
  likedItems: string[];
  showcaseImages: ShowcaseImage[];
  showcaseVideos: ShowcaseVideo[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onNavigateProduct: (slug: string) => void;
  onHoverProduct: (slug: string) => void;
  onQuickView: (e: React.MouseEvent, sol: Solution) => void;
  getStats: (id: string) => { users: string; likes: string };
};

/**
 * Homepage narrative (Option C — visual-first, A→Z):
 * Hero (HomePage) → ② Creators showcase → demo → catalog (pillar ②)
 * → ① Business AI solutions → ③ App & Game → trust band → final CTA.
 */
const HomepageV2Sections: React.FC<HomepageV2SectionsProps> = ({
  solutions,
  homeBlocks,
  loading,
  favorites,
  likedItems,
  showcaseImages,
  showcaseVideos,
  onToggleFavorite,
  onToggleLike,
  onNavigateProduct,
  onHoverProduct,
  onQuickView,
  getStats,
}) => (
  <>
    <HomepageKeyframes />
    <CreatorsShowcaseSection showcaseImages={showcaseImages} showcaseVideos={showcaseVideos} />
    <PromptDemoSection showcaseImages={showcaseImages} />
    <CmsBlockSection
      solutions={solutions}
      homeBlocks={homeBlocks}
      loading={loading}
      favorites={favorites}
      likedItems={likedItems}
      onToggleFavorite={onToggleFavorite}
      onToggleLike={onToggleLike}
      onNavigateProduct={onNavigateProduct}
      onHoverProduct={onHoverProduct}
      onQuickView={onQuickView}
      getStats={getStats}
    />
    <SolutionSection />
    <AppGameSection />
    <TrustStripSection />
    <FinalCtaSection />
  </>
);

export default HomepageV2Sections;
