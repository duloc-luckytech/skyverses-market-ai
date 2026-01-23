
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';
import { ToastProvider } from './context/ToastContext';

// Page Imports
import LandingPage from './pages/LandingPage';
import MarketPage from './pages/MarketPage';
import ExplorerPage from './pages/ExplorerPage';
import AppsPage from './pages/AppsPage';
import AppInterfacePage from './pages/AppInterfacePage';
import CreditsPage from './pages/CreditsPage';
import CreditUsagePage from './pages/CreditUsagePage';
import LoginPage from './pages/LoginPage';
import SolutionDetail from './pages/SolutionDetail';
import UseCasesPage from './pages/UseCasesPage';
import PricingPage from './pages/PricingPage';
import DemoPlayground from './pages/DemoPlayground';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import FavoritesPage from './pages/FavoritesPage';
import CMSAdminPage from './pages/CMSAdminPage';
import AdminCmsProPage from './pages/AdminCmsProPage';
import ReferralPage from './pages/ReferralPage';
import PolicyPage from './pages/PolicyPage';

// Product Page Imports
import AIImageGenerator from './pages/images/AIImageGenerator';
import AIVideoGenerator from './pages/videos/AIVideoGenerator';
import ProductSintax from './pages/ProductSintax';
import ProductPrompt2 from './pages/ProductPrompt2';
import MotionGenProduct from './pages/videos/MotionGenProduct';
import GenyuProduct from './pages/videos/GenyuProduct';
import KineticProduct from './pages/videos/KineticProduct';
import SequenceProduct from './pages/videos/SequenceProduct';
import AvatarLipsyncAI from './pages/videos/AvatarLipsyncAI';
import VideoAnimateAI from './pages/videos/VideoAnimateAI';
import TextToSpeech from './pages/audio/TextToSpeech';
import MusicGenerator from './pages/audio/MusicGenerator';
import VoiceDesignAI from './pages/audio/VoiceDesignAI';
import VoiceStudio from './pages/audio/VoiceStudio';
import ProductImage from './pages/images/ProductImage';
import PosterMarketingAI from './pages/images/PosterMarketingAI';
import FashionCenterAI from './pages/images/FashionCenterAI';
import ImageUpscaleAI from './pages/images/ImageUpscaleAI';
import ImageComposer from './pages/images/ImageComposer';
import Product6Image from './pages/images/Product6Image';
import Product7Comic from './pages/images/Product7Comic';
import Art3DPage from './pages/Art3DPage';
import SpatialArchitectPage from './pages/SpatialArchitectPage';
import ProductCharacterSync from './pages/ProductCharacterSync';
import AIStylistPage from './pages/images/AIStylistPage';
import StoryboardStudioPage from './pages/videos/StoryboardStudioPage';
import AIImageRestoration from './pages/images/AIImageRestoration';
import RealEstateAI from './pages/images/RealEstateAI';

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
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<MarketPage />} />
                      <Route path="/studio" element={<LandingPage />} />
                      <Route path="/explorer" element={<ExplorerPage />} />
                      <Route path="/apps" element={<AppsPage />} />
                      <Route path="/app/:id" element={<AppInterfacePage />} />
                      <Route path="/credits" element={<CreditsPage />} />
                      <Route path="/usage" element={<CreditUsagePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/cms-admin" element={<CMSAdminPage />} />
                      <Route path="/cms-admin-pro" element={<AdminCmsProPage />} />
                      <Route path="/referral" element={<ReferralPage />} />
                      <Route path="/policy" element={<PolicyPage />} />
                      
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
                      <Route path="/product/sintax-prompt-builder" element={<ProductSintax />} />
                      <Route path="/product/sintax-architect-diagnostics" element={<ProductPrompt2 />} />
                      <Route path="/product/motion-1-pro" element={<MotionGenProduct />} />
                      <Route path="/product/studio-architect" element={<GenyuProduct />} />
                      <Route path="/product/kinetic-core-engine" element={<KineticProduct />} />
                      <Route path="/product/sequence-story-engine" element={<SequenceProduct />} />
                      <Route path="/product/avatar-sync-ai" element={<AvatarLipsyncAI />} />
                      <Route path="/product/video-animate-ai" element={<VideoAnimateAI />} />
                      <Route path="/product/text-to-speech" element={<TextToSpeech />} />
                      <Route path="/product/music-generator" element={<MusicGenerator />} />
                      <Route path="/product/product-image" element={<ProductImage />} />
                      <Route path="/product/poster-marketing-ai" element={<PosterMarketingAI />} />
                      <Route path="/product/fashion-center-ai" element={<FashionCenterAI />} />
                      <Route path="/product/image-upscale-ai" element={<ImageUpscaleAI />} />
                      <Route path="/product/nexus-ideation-engine" element={<ImageComposer />} />
                      <Route path="/product/character-sync-studio" element={<Product6Image />} />
                      <Route path="/product/banana-pro-comic-engine" element={<Product7Comic />} />
                      <Route path="/product/neural-game-architect" element={<Art3DPage />} />
                      <Route path="/product/3d-spatial-architect" element={<SpatialArchitectPage />} />
                      
                      <Route path="/product/:slug" element={<SolutionDetail />} />
                      
                      <Route path="/use-cases" element={<UseCasesPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/demo" element={<DemoPlayground />} />
                      <Route path="/booking" element={<BookingPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
