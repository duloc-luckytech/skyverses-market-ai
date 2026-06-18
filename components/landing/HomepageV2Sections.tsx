import React from 'react';
import { HomeBlock, Solution } from '../../types';
import type { ShowcaseImage, ShowcaseVideo } from '../../src/constants/showcase-cdn';
import { HomepageKeyframes } from './homepage/shared';
import SocialProofSection from './homepage/SocialProofSection';
import HubSection from './homepage/HubSection';
import BusinessSection from './homepage/BusinessSection';
import EnterpriseSection from './homepage/EnterpriseSection';
import HowItWorksSection from './homepage/HowItWorksSection';
import CreatorsShowcaseSection from './homepage/CreatorsShowcaseSection';
import PromptDemoSection from './homepage/PromptDemoSection';
import BuildAppsSection from './homepage/BuildAppsSection';
import StatsBandSection from './homepage/StatsBandSection';
import OsStripSection from './homepage/OsStripSection';
import WhySection from './homepage/WhySection';
import CmsBlockSection from './homepage/CmsBlockSection';
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
    <SocialProofSection />
    <HubSection />
    <BusinessSection />
    <EnterpriseSection />
    <HowItWorksSection />
    <CreatorsShowcaseSection showcaseImages={showcaseImages} showcaseVideos={showcaseVideos} />
    <PromptDemoSection showcaseImages={showcaseImages} />
    <BuildAppsSection />
    <StatsBandSection />
    <OsStripSection />
    <WhySection />
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
    <FinalCtaSection />
  </>
);

export default HomepageV2Sections;
