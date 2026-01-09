
import React from 'react';
import { Sun, Camera, HelpCircle, Grid3X3, Box, BarChart3 } from 'lucide-react';

interface QuickToolsProps {
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  onReset: () => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  showAxisGizmo: boolean;
  setShowAxisGizmo: (val: boolean) => void;
  showTopologyInfo: boolean;
  setShowTopologyInfo: (val: boolean) => void;
}

export const QuickTools: React.FC<QuickToolsProps> = ({ 
  showSettings, 
  setShowSettings, 
  onReset,
  showGrid,
  setShowGrid,
  showAxisGizmo,
  setShowAxisGizmo,
  showTopologyInfo,
  setShowTopologyInfo
}) => {
  const SettingsIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
  );

  const stopPropa = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      className="absolute top-40 right-6 flex flex-col gap-3 z-[100]" 
      onMouseDown={stopPropa}
    >
      {/* Settings */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className={`w-10 h-10 backdrop-blur-3xl border flex items-center justify-center transition-all rounded-xl shadow-2xl ${showSettings ? 'bg-purple-600 border-purple-400 text-white' : 'bg-[#141519]/60 border-white/10 text-gray-400 hover:text-white'}`}
        title="View Settings"
      >
        <SettingsIcon size={18} />
      </button>

      {/* Reset view */}
      <button 
        onClick={onReset} 
        className="w-10 h-10 bg-[#141519]/60 backdrop-blur-3xl border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 shadow-xl"
        title="Reset View"
      >
        <Camera size={18} />
      </button>

      {/* Axis Gizmo Toggle */}
      <button 
        onClick={() => setShowAxisGizmo(!showAxisGizmo)}
        className={`w-10 h-10 backdrop-blur-3xl border flex items-center justify-center transition-all rounded-xl shadow-2xl ${showAxisGizmo ? 'bg-purple-500 border-purple-400 text-white' : 'bg-[#141519]/60 border-white/10 text-gray-400 hover:text-white'}`}
        title="Toggle Axis Gizmo"
      >
        <Box size={18} />
      </button>

      {/* Topology Info Toggle */}
      <button 
        onClick={() => setShowTopologyInfo(!showTopologyInfo)}
        className={`w-10 h-10 backdrop-blur-3xl border flex items-center justify-center transition-all rounded-xl shadow-2xl ${showTopologyInfo ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-[#141519]/60 border-white/10 text-gray-400 hover:text-white'}`}
        title="Toggle Topology Info"
      >
        <BarChart3 size={18} />
      </button>

      {/* Grid Toggle */}
      <button 
        onClick={() => setShowGrid(!showGrid)}
        className={`w-10 h-10 backdrop-blur-3xl border flex items-center justify-center transition-all rounded-xl shadow-2xl ${showGrid ? 'bg-brand-blue border-brand-blue/50 text-white' : 'bg-[#141519]/60 border-white/10 text-gray-400 hover:text-white'}`}
        title="Toggle Grid"
      >
        <Grid3X3 size={18} />
      </button>

      {/* Lighting / Sun */}
      <button 
        className="w-10 h-10 bg-[#141519]/60 backdrop-blur-3xl border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-xl hover:bg-white/5"
        title="Adjust Lighting"
      >
        <Sun size={18} />
      </button>

      {/* Help */}
      <button 
        className="w-10 h-10 bg-[#141519]/60 backdrop-blur-3xl border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-xl hover:bg-white/5"
        title="Help"
      >
        <HelpCircle size={18} />
      </button>
    </div>
  );
};
