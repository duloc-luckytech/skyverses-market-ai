
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import AISupportChat from './AISupportChat';
import ImageLibraryModal from './ImageLibraryModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import CommandPalette from './CommandPalette';
import WelcomeBonusModal from './WelcomeBonusModal';
import GlobalEventBonusModal from './GlobalEventBonusModal';
import { QuickImageGenModal } from './QuickImageGenModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showQuickImageGen, setShowQuickImageGen] = useState(false);

  // ⭐ Listen for 'openQuickImageGen' event from AuthContext (new user first login)
  useEffect(() => {
    const handler = () => setShowQuickImageGen(true);
    window.addEventListener('openQuickImageGen', handler);
    return () => window.removeEventListener('openQuickImageGen', handler);
  }, []);

  const handleOpenEditorFromLibrary = (url: string) => {
    setSelectedImageUrl(url);
    setIsEditorOpen(true);
    setIsLibraryOpen(false); // Đóng thư viện để tập trung vào việc chỉnh sửa
  };

  const handleResetSearch = () => {
    // Phát ra event để MarketPage lắng nghe và reset
    window.dispatchEvent(new CustomEvent('resetMarketSearch'));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenLibrary={() => setIsLibraryOpen(true)} resetSearch={handleResetSearch} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <AISupportChat />
      <CommandPalette />
      <WelcomeBonusModal />
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
          // Xử lý sau khi ảnh được áp dụng chỉnh sửa thành công
          // Thường là cập nhật lại danh sách hoặc thông báo cho người dùng
          setIsEditorOpen(false);
          setIsLibraryOpen(true); // Quay lại thư viện để xem kết quả
        }}
      />
    </div>
  );
};

export default Layout;
