import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TopNav } from './art-3d/TopNav';
import { LeftSidebar } from './art-3d/LeftSidebar';
import { RightSidebar } from './art-3d/RightSidebar';
import { Viewport } from './art-3d/Viewport';
import { ViewSettingsModal } from './art-3d/ViewSettingsModal';
import { ConfirmUploadModal } from './art-3d/ConfirmUploadModal';
import { BottomHUD } from './art-3d/BottomHUD';
import { QuickTools } from './art-3d/QuickTools';
import { useAuth } from '../context/AuthContext';

interface Art3DWorkspaceProps {
  onClose: () => void;
  logic: any;
}

const DEFAULT_MODEL_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb";

const Art3DWorkspace: React.FC<Art3DWorkspaceProps> = ({ onClose, logic }) => {
  const { credits, useCredits } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [activeAssetId, setActiveAssetId] = useState(logic.assets[0].id);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [currentModelUrl, setCurrentModelUrl] = useState<string | null>(DEFAULT_MODEL_URL);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Keep a map of asset IDs to their URLs (for user uploads)
  const [assetUrlMap, setAssetUrlMap] = useState<Record<string, string>>({
    'as-1': DEFAULT_MODEL_URL
  });

  const activeAsset = logic.assets.find((a: any) => a.id === activeAssetId) || logic.assets[0];

  // Sync currentModelUrl when activeAssetId changes
  useEffect(() => {
    if (assetUrlMap[activeAssetId]) {
      setCurrentModelUrl(assetUrlMap[activeAssetId]);
    }
  }, [activeAssetId, assetUrlMap]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    if (e.shiftKey) {
        logic.setRotationZ((prev: number) => prev + deltaX * 0.5);
    } else {
        logic.setRotationY((prev: number) => prev + deltaX * 0.5);
    }
    
    logic.setRotationX((prev: number) => prev - deltaY * 0.5);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    logic.setZoom((prev: number) => Math.max(0.1, Math.min(2, prev - e.deltaY * 0.001)));
  };

  const resetView = () => {
    logic.setRotationX(0);
    logic.setRotationY(0);
    logic.setRotationZ(0);
    logic.setZoom(1.0);
  };

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpload = (settings: any) => {
    if (pendingFile) {
      const url = URL.createObjectURL(pendingFile);
      const newId = `as-${Date.now()}`;
      
      setAssetUrlMap(prev => ({ ...prev, [newId]: url }));
      setCurrentModelUrl(url);

      const newAsset = {
        id: newId,
        name: pendingFile.name,
        thumb: settings.screenshot || url,
        type: 'Textured',
        faces: 'Calculated...',
        vertices: 'Calculated...'
      };
      
      logic.setAssets((prev: any) => [newAsset, ...prev]);
      setActiveAssetId(newId);
      setIsConfirmModalOpen(false);
      setPendingFile(null);
    }
  };

  const handleLoadComplete = (thumbnailUrl: string) => {
    logic.setAssets((prev: any) => prev.map((asset: any) => 
      asset.id === activeAssetId ? { ...asset, thumb: thumbnailUrl } : asset
    ));
  };

  return (
    <div 
      className="fixed inset-0 z-[600] flex flex-col bg-[#141519] text-slate-300 font-sans overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <TopNav activeTab={logic.activeTab} setActiveTab={logic.setActiveTab} onClose={onClose} />

      <div className="flex-grow flex overflow-hidden relative">
        <LeftSidebar 
          activeTab={logic.activeTab} 
          modelName={logic.modelName} 
          prompt={logic.prompt} 
          activeAsset={activeAsset} 
        />

        <Viewport 
          logic={logic} 
          activeAsset={activeAsset} 
          onMouseDown={handleMouseDown} 
          onWheel={handleWheel}
          modelUrl={currentModelUrl}
          onLoadComplete={handleLoadComplete}
        >
          <AnimatePresence>
            {showSettings && <ViewSettingsModal logic={logic} onClose={() => setShowSettings(false)} />}
          </AnimatePresence>
          
          <AnimatePresence>
            {isConfirmModalOpen && (
              <ConfirmUploadModal 
                file={pendingFile} 
                onClose={() => setIsConfirmModalOpen(false)} 
                onConfirm={handleConfirmUpload}
              />
            )}
          </AnimatePresence>

          <BottomHUD 
            onRotate={(val) => logic.setRotationY((p: number) => p + val)} 
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            credits={credits}
            useCredits={useCredits}
            modelUrl={currentModelUrl}
          />
          <QuickTools 
            showSettings={showSettings} 
            setShowSettings={setShowSettings} 
            onReset={resetView}
            showGrid={logic.showGrid}
            setShowGrid={logic.setShowGrid}
            showAxisGizmo={logic.showAxisGizmo}
            setShowAxisGizmo={logic.setShowAxisGizmo}
            showTopologyInfo={logic.showTopologyInfo}
            setShowTopologyInfo={logic.setShowTopologyInfo}
          />

          <button 
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="absolute top-1/2 -translate-y-1/2 right-0 z-50 w-6 h-12 bg-[#141519]/80 backdrop-blur-md border border-white/10 border-r-0 rounded-l-xl flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-2xl"
          >
            {rightSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </Viewport>

        <RightSidebar 
          assets={logic.assets} 
          activeAssetId={activeAssetId} 
          setActiveAssetId={setActiveAssetId} 
          onFileSelect={handleFileSelect}
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          logic={logic}
        />
      </div>

      <style>{`
        .perspective-[2000px] { perspective: 2000px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default Art3DWorkspace;