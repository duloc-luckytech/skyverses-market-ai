import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Maximize, Minimize, LayoutTemplate, Plus, Grid } from 'lucide-react';

export const ViewportToolbar: React.FC = () => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleZoomFit = () => fitView({ duration: 800 });

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 bg-[#1a1b23]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-3xl">
      <button 
        onClick={() => zoomIn()}
        className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        title="Zoom In"
      >
        <Plus size={18} />
      </button>
      <button 
        onClick={() => zoomOut()}
        className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        title="Zoom Out"
      >
        <Minimize size={18} />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1"></div>
      <button 
        onClick={handleZoomFit}
        className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        title="Fit View"
      >
        <Maximize size={18} />
      </button>
      <div className="w-px h-6 bg-white/10 mx-1"></div>
      <button 
        className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        title="Auto Layout"
      >
        <LayoutTemplate size={18} />
      </button>
      <button 
        className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        title="Toggle Grid"
      >
        <Grid size={18} />
      </button>
    </div>
  );
};