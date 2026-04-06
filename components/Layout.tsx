
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './Header';
import Footer from './Footer';

// ═══ Lazy-loaded overlays (not needed for first paint) ═══
const AISupportChat = lazy(() => import('./AISupportChat'));
const ImageLibraryModal = lazy(() => import('./ImageLibraryModal'));
const ProductImageWorkspace = lazy(() => import('./ProductImageWorkspace'));
const CommandPalette = lazy(() => import('./CommandPalette'));
const GlobalEventBonusModal = lazy(() => import('./GlobalEventBonusModal'));
const QuickImageGenModal = lazy(() => import('./QuickImageGenModal').then(m => ({ default: m.QuickImageGenModal })));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showQuickImageGen, setShowQuickImageGen] = useState(false);

  // ⭐ Listen for 'openQuickImageGen' event from GlobalEventBonusModal
  useEffect(() => {
    const handler = () => setShowQuickImageGen(true);
    window.addEventListener('openQuickImageGen', handler);
    return () => window.removeEventListener('openQuickImageGen', handler);
  }, []);

  const handleOpenEditorFromLibrary = (url: string) => {
    setSelectedImageUrl(url);
    setIsEditorOpen(true);
    setIsLibraryOpen(false);
  };

  const handleResetSearch = () => {
    window.dispatchEvent(new CustomEvent('resetMarketSearch'));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenLibrary={() => setIsLibraryOpen(true)} resetSearch={handleResetSearch} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Suspense fallback={null}>
        <AISupportChat />
        <CommandPalette />
        <GlobalEventBonusModal />

        {/* ⭐ Quick Image Gen Modal — opens after new user claims 100 free images */}
        <QuickImageGenModal 
          isOpen={showQuickImageGen} 
          onClose={() => setShowQuickImageGen(false)} 
          onSuccess={() => setShowQuickImageGen(false)} 
        />
        
        {/* Thư viện hình ảnh toàn cục */}
        <ImageLibraryModal 
          isOpen={isLibraryOpen} 
          onClose={() => setIsLibraryOpen(false)} 
          onEdit={handleOpenEditorFromLibrary}
        />

        {/* Trình biên tập ảnh toàn cục (Product Image Editor) */}
        <ProductImageWorkspace 
          isOpen={isEditorOpen} 
          onClose={() => setIsEditorOpen(false)} 
          initialImage={selectedImageUrl}
          onApply={(editedUrl) => {
            setIsEditorOpen(false);
            setIsLibraryOpen(true);
          }}
        />
      </Suspense>
    </div>
  );
};

export default Layout;
