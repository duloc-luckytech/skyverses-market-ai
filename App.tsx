
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import { ToastProvider } from './context/ToastContext';

// ═══ Lazy-loaded Pages (code-splitting) ═══
// Core pages
const MarketPage = React.lazy(() => import('./pages/MarketPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const ExplorerPage = React.lazy(() => import('./pages/ExplorerPage'));
const ModelsPage = React.lazy(() => import('./pages/ModelsPage'));
const AppsPage = React.lazy(() => import('./pages/AppsPage'));
const AppInterfacePage = React.lazy(() => import('./pages/AppInterfacePage'));
const CreditsPage = React.lazy(() => import('./pages/CreditsPage'));
const CreditUsagePage = React.lazy(() => import('./pages/CreditUsagePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SolutionDetail = React.lazy(() => import('./pages/SolutionDetail'));
const UseCasesPage = React.lazy(() => import('./pages/UseCasesPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const ReferralPage = React.lazy(() => import('./pages/ReferralPage'));
const PolicyPage = React.lazy(() => import('./pages/PolicyPage'));
const MarketsPage = React.lazy(() => import('./pages/MarketsPage'));

// Product pages — images
const AIImageGenerator = React.lazy(() => import('./pages/images/AIImageGenerator'));
const EventStudioPage = React.lazy(() => import('./pages/images/EventStudioPage'));
const ProductImage = React.lazy(() => import('./pages/images/ProductImage'));
const PosterMarketingAI = React.lazy(() => import('./pages/images/PosterMarketingAI'));
const FashionCenterAI = React.lazy(() => import('./pages/images/FashionCenterAI'));
const ImageUpscaleAI = React.lazy(() => import('./pages/images/ImageUpscaleAI'));
const Product6Image = React.lazy(() => import('./pages/images/Product6Image'));
const Product7Comic = React.lazy(() => import('./pages/images/Product7Comic'));
const AIStylistPage = React.lazy(() => import('./pages/images/AIStylistPage'));
const AIImageRestoration = React.lazy(() => import('./pages/images/AIImageRestoration'));
const RealEstateAI = React.lazy(() => import('./pages/images/RealEstateAI'));
const BackgroundRemovalAI = React.lazy(() => import('./pages/images/BackgroundRemovalAI'));

// Product pages — videos
const AIVideoGenerator = React.lazy(() => import('./pages/videos/AIVideoGenerator'));
const GenyuProduct = React.lazy(() => import('./pages/videos/GenyuProduct'));
const AvatarLipsyncAI = React.lazy(() => import('./pages/videos/AvatarLipsyncAI'));
const VideoAnimateAI = React.lazy(() => import('./pages/videos/VideoAnimateAI'));
const StoryboardStudioPage = React.lazy(() => import('./pages/videos/StoryboardStudioPage'));

// Product pages — audio
const TextToSpeech = React.lazy(() => import('./pages/audio/TextToSpeech'));
const MusicGenerator = React.lazy(() => import('./pages/audio/MusicGenerator'));
const VoiceDesignAI = React.lazy(() => import('./pages/audio/VoiceDesignAI'));
const VoiceStudio = React.lazy(() => import('./pages/audio/VoiceStudio'));

// Product pages — other
const SpatialArchitectPage = React.lazy(() => import('./pages/SpatialArchitectPage'));
const ProductCharacterSync = React.lazy(() => import('./pages/ProductCharacterSync'));
const ProductAIAgentWorkflow = React.lazy(() => import('./pages/ProductAIAgentWorkflow'));
const ProductCaptchaToken = React.lazy(() => import('./pages/ProductCaptchaToken'));

// ═══ Suspense fallback ═══
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  return (
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
                      <Route path="/" element={<MarketPage />} />
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
                      <Route path="/product/ai-agent-workflow" element={<ProductAIAgentWorkflow />} />
                      <Route path="/product/captcha-veo3" element={<ProductCaptchaToken />} />
                      
                      {/* CÁC TUYẾN ĐƯỜNG SỰ KIỆN HỢP NHẤT */}
                      <Route path="/product/ai-birthday-generator" element={<EventStudioPage type="birthday" />} />
                      <Route path="/product/ai-wedding-generator" element={<EventStudioPage type="wedding" />} />
                      <Route path="/product/ai-noel-generator" element={<EventStudioPage type="noel" />} />
                      <Route path="/product/ai-tet-generator" element={<EventStudioPage type="tet" />} />

                      <Route path="/product/bat-dong-san-ai" element={<RealEstateAI />} />
                      <Route path="/product/ai-music-generator" element={<MusicGenerator />} />
                      <Route path="/product/ai-image-restorer" element={<AIImageRestoration />} />
                      <Route path="/product/storyboard-studio" element={<StoryboardStudioPage />} />
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
  );
};

export default App;
