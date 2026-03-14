import React, { useState } from "react";
import Header from "./Header";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleOpenEditorFromLibrary = (url: string) => {
    setSelectedImageUrl(url);
    setIsEditorOpen(true);
    setIsLibraryOpen(false); // Đóng thư viện để tập trung vào việc chỉnh sửa
  };

  const handleResetSearch = () => {
    // Phát ra event để MarketPage lắng nghe và reset
    window.dispatchEvent(new CustomEvent("resetMarketSearch"));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenLibrary={() => setIsLibraryOpen(true)}
        resetSearch={handleResetSearch}
      />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
