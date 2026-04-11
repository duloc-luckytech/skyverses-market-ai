
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import LoadingScreen from './components/LoadingScreen';
import HomepageSkeleton from './components/HomepageSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { ToastProvider } from './context/ToastContext';

// ═══ Lazy-loaded Pages (code-splitting) ═══
// Store import functions for prefetching
const pageImports = {
  market: () => import('./pages/MarketPage'),
  category: () => import('./pages/CategoryPage'),
  explorer: () => import('./pages/ExplorerPage'),
  models: () => import('./pages/ModelsPage'),
  apps: () => import('./pages/AppsPage'),
  appInterface: () => import('./pages/AppInterfacePage'),
  credits: () => import('./pages/CreditsPage'),
  creditUsage: () => import('./pages/CreditUsagePage'),
  login: () => import('./pages/LoginPage'),
  solutionDetail: () => import('./pages/SolutionDetail'),
  useCases: () => import('./pages/UseCasesPage'),
  pricing: () => import('./pages/PricingPage'),
  booking: () => import('./pages/BookingPage'),
  about: () => import('./pages/AboutPage'),
  settings: () => import('./pages/SettingsPage'),
  favorites: () => import('./pages/FavoritesPage'),
  referral: () => import('./pages/ReferralPage'),
  policy: () => import('./pages/PolicyPage'),
  markets: () => import('./pages/MarketsPage'),
  // Images
  aiImageGenerator: () => import('./pages/images/AIImageGenerator'),
  eventStudio: () => import('./pages/images/EventStudioPage'),
  productImage: () => import('./pages/images/ProductImage'),
  posterMarketing: () => import('./pages/images/PosterMarketingAI'),
  fashionCenter: () => import('./pages/images/FashionCenterAI'),
  imageUpscale: () => import('./pages/images/ImageUpscaleAI'),
  product6: () => import('./pages/images/Product6Image'),
  product7: () => import('./pages/images/Product7Comic'),
  aiStylist: () => import('./pages/images/AIStylistPage'),
  aiRestoration: () => import('./pages/images/AIImageRestoration'),
  realEstate: () => import('./pages/images/RealEstateAI'),
  realEstateVisual: () => import('./pages/images/RealEstateVisualAI'),
  bgRemoval: () => import('./pages/images/BackgroundRemovalAI'),
  socialBanner: () => import('./pages/images/SocialBannerAI'),
  // Videos
  aiVideo: () => import('./pages/videos/AIVideoGenerator'),
  genyu: () => import('./pages/videos/GenyuProduct'),
  avatarLipsync: () => import('./pages/videos/AvatarLipsyncAI'),
  videoAnimate: () => import('./pages/videos/VideoAnimateAI'),
  storyboard: () => import('./pages/videos/StoryboardStudioPage'),
  fibusVideo: () => import('./pages/videos/FibusVideoStudio'),
  // Audio
  tts: () => import('./pages/audio/TextToSpeech'),
  music: () => import('./pages/audio/MusicGenerator'),
  voiceDesign: () => import('./pages/audio/VoiceDesignAI'),
  voiceStudio: () => import('./pages/audio/VoiceStudio'),
  // Other
  spatial: () => import('./pages/SpatialArchitectPage'),
  charSync: () => import('./pages/ProductCharacterSync'),
  aiAgent: () => import('./pages/ProductAIAgentWorkflow'),
  captcha: () => import('./pages/ProductCaptchaToken'),
  noCodeExport: () => import('./pages/NoCodeExportPage'),
  qwenChat: () => import('./pages/QwenChatAIPage'),
  // Slides
  aiSlideCreator: () => import('./pages/slides/AISlideCreatorPage'),
};

// Core pages
const MarketPage = React.lazy(pageImports.market);
const CategoryPage = React.lazy(pageImports.category);
const ExplorerPage = React.lazy(pageImports.explorer);
const ModelsPage = React.lazy(pageImports.models);
const AppsPage = React.lazy(pageImports.apps);
const AppInterfacePage = React.lazy(pageImports.appInterface);
const CreditsPage = React.lazy(pageImports.credits);
const CreditUsagePage = React.lazy(pageImports.creditUsage);
const LoginPage = React.lazy(pageImports.login);
const SolutionDetail = React.lazy(pageImports.solutionDetail);
const UseCasesPage = React.lazy(pageImports.useCases);
const PricingPage = React.lazy(pageImports.pricing);
const BookingPage = React.lazy(pageImports.booking);
const AboutPage = React.lazy(pageImports.about);
const SettingsPage = React.lazy(pageImports.settings);
const FavoritesPage = React.lazy(pageImports.favorites);
const ReferralPage = React.lazy(pageImports.referral);
const PolicyPage = React.lazy(pageImports.policy);
const MarketsPage = React.lazy(pageImports.markets);

// Product pages — images
const AIImageGenerator = React.lazy(pageImports.aiImageGenerator);
const EventStudioPage = React.lazy(pageImports.eventStudio);
const ProductImage = React.lazy(pageImports.productImage);
const PosterMarketingAI = React.lazy(pageImports.posterMarketing);
const FashionCenterAI = React.lazy(pageImports.fashionCenter);
const ImageUpscaleAI = React.lazy(pageImports.imageUpscale);
const Product6Image = React.lazy(pageImports.product6);
const Product7Comic = React.lazy(pageImports.product7);
const AIStylistPage = React.lazy(pageImports.aiStylist);
const AIImageRestoration = React.lazy(pageImports.aiRestoration);
const RealEstateAI = React.lazy(pageImports.realEstate);
const RealEstateVisualAI = React.lazy(pageImports.realEstateVisual);
const BackgroundRemovalAI = React.lazy(pageImports.bgRemoval);
const SocialBannerAI = React.lazy(pageImports.socialBanner);

// Product pages — videos
const AIVideoGenerator = React.lazy(pageImports.aiVideo);
const GenyuProduct = React.lazy(pageImports.genyu);
const AvatarLipsyncAI = React.lazy(pageImports.avatarLipsync);
const VideoAnimateAI = React.lazy(pageImports.videoAnimate);
const StoryboardStudioPage = React.lazy(pageImports.storyboard);
const FibusVideoStudio = React.lazy(pageImports.fibusVideo);

// Product pages — audio
const TextToSpeech = React.lazy(pageImports.tts);
const MusicGenerator = React.lazy(pageImports.music);
const VoiceDesignAI = React.lazy(pageImports.voiceDesign);
const VoiceStudio = React.lazy(pageImports.voiceStudio);

// Product pages — other
const SpatialArchitectPage = React.lazy(pageImports.spatial);
const ProductCharacterSync = React.lazy(pageImports.charSync);
const ProductAIAgentWorkflow = React.lazy(pageImports.aiAgent);
const ProductCaptchaToken = React.lazy(pageImports.captcha);
const NoCodeExportPage = React.lazy(pageImports.noCodeExport);
const QwenChatAIPage = React.lazy(pageImports.qwenChat);
const AISlideCreatorPage = React.lazy(pageImports.aiSlideCreator);

// ═══ Ultra-fast page transition bar (no blank page) ═══
const PageLoader = () => (
  <div className="fixed top-0 left-0 right-0 z-[999] pointer-events-none">
    <div className="h-[2px] bg-brand-blue/20 w-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: '40%',
          background: 'linear-gradient(90deg, transparent, #0090ff, transparent)',
          animation: 'pageLoadShimmer 0.8s ease-in-out infinite',
        }}
      />
    </div>
    <style>{`
      @keyframes pageLoadShimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(350%); }
      }
    `}</style>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// ═══ Prefetch critical routes on idle ═══
const prefetchCriticalRoutes = () => {
  const critical = [
    pageImports.markets,
    pageImports.credits,
    pageImports.solutionDetail,
    pageImports.aiImageGenerator,
    pageImports.aiVideo,
  ];
  critical.forEach((importFn) => {
    try { importFn(); } catch { /* silently swallow */ }
  });
};

// Prefetch when browser is idle
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => prefetchCriticalRoutes(), { timeout: 3000 });
  } else {
    setTimeout(prefetchCriticalRoutes, 2000);
  }
}

const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  return (
    <ErrorBoundary>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            {isInitialLoading && <LoadingScreen onFinished={() => setIsInitialLoading(false)} />}
            <Router>
              <SearchProvider>
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
                <Route path="*" element={
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Suspense fallback={<HomepageSkeleton />}><MarketPage /></Suspense>} />
                      <Route path="/category/:id" element={<CategoryPage />} />
                      <Route path="/explorer" element={<ExplorerPage />} />
                      <Route path="/markets" element={<MarketsPage />} />
                      <Route path="/models" element={<ModelsPage />} />
                      <Route path="/apps" element={<AppsPage />} />
                      <Route path="/app/:id" element={<AppInterfacePage />} />
                      <Route path="/credits" element={<CreditsPage />} />
                      <Route path="/usage" element={<CreditUsagePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/referral" element={<ReferralPage />} />
                      <Route path="/policy" element={<PolicyPage />} />
                      
                      

                      <Route path="/product/background-removal-ai" element={<BackgroundRemovalAI />} />
                      <Route path="/product/social-banner-ai" element={<SocialBannerAI />} />
                      <Route path="/product/ai-agent-workflow" element={<ProductAIAgentWorkflow />} />
                      <Route path="/product/captcha-veo3" element={<ProductCaptchaToken />} />
                      <Route path="/product/nocode-export" element={<NoCodeExportPage />} />
                      <Route path="/product/qwen-chat-ai" element={<QwenChatAIPage />} />
                      <Route path="/product/ai-slide-creator" element={<AISlideCreatorPage />} />
                      
                      {/* CÁC TUYẾN ĐƯỜNG SỰ KIỆN HỢP NHẤT */}
                      <Route path="/product/ai-birthday-generator" element={<EventStudioPage type="birthday" />} />
                      <Route path="/product/ai-wedding-generator" element={<EventStudioPage type="wedding" />} />
                      <Route path="/product/ai-noel-generator" element={<EventStudioPage type="noel" />} />
                      <Route path="/product/ai-tet-generator" element={<EventStudioPage type="tet" />} />

                      <Route path="/product/bat-dong-san-ai" element={<RealEstateAI />} />
                      <Route path="/product/realestate-visual-ai" element={<RealEstateVisualAI />} />
                      <Route path="/product/ai-music-generator" element={<MusicGenerator />} />
                      <Route path="/product/ai-image-restorer" element={<AIImageRestoration />} />
                      <Route path="/product/storyboard-studio" element={<StoryboardStudioPage />} />
                      <Route path="/product/fibus-video-studio" element={<FibusVideoStudio />} />
                      <Route path="/product/ai-stylist" element={<AIStylistPage />} />
                      <Route path="/product/character-sync-ai" element={<ProductCharacterSync />} />
                      <Route path="/product/ai-video-generator" element={<AIVideoGenerator />} />
                      <Route path="/product/ai-image-generator" element={<AIImageGenerator />} />
                      <Route path="/product/voice-design-ai" element={<VoiceDesignAI />} />
                      <Route path="/product/ai-voice-studio" element={<VoiceStudio />} />
                      <Route path="/product/studio-architect" element={<GenyuProduct />} />
                      <Route path="/product/avatar-sync-ai" element={<AvatarLipsyncAI />} />
                      <Route path="/product/video-animate-ai" element={<VideoAnimateAI />} />
                      <Route path="/product/text-to-speech" element={<TextToSpeech />} />
                      <Route path="/product/music-generator" element={<MusicGenerator />} />
                      <Route path="/product/product-image" element={<ProductImage />} />
                      <Route path="/product/poster-marketing-ai" element={<PosterMarketingAI />} />
                      <Route path="/product/fashion-center-ai" element={<FashionCenterAI />} />
                      <Route path="/product/image-upscale-ai" element={<ImageUpscaleAI />} />
                      <Route path="/product/character-sync-studio" element={<Product6Image />} />
                      <Route path="/product/banana-pro-comic-engine" element={<Product7Comic />} />
                      <Route path="/product/3d-spatial-architect" element={<SpatialArchitectPage />} />
                      
                      <Route path="/product/:slug" element={<SolutionDetail />} />
                      
                      <Route path="/use-cases" element={<UseCasesPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/booking" element={<BookingPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    </Suspense>
                  </Layout>
                } />
              </Routes>
              </SearchProvider>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
