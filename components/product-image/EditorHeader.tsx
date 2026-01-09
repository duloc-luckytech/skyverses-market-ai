import React from 'react';
import { 
  Hand, MousePointer2, Crop, PenTool, Eraser, Type, Trash2, Upload, Download, X, Coins, RotateCcw,
  Undo2, Redo2, ChevronLeft, Sparkles
} from 'lucide-react';

interface EditorHeaderProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  isCropping: boolean;
  setIsCropping: (val: boolean) => void;
  brushSize: number;
  setBrushSize: (val: number) => void;
  selectedTextId: string | null;
  deleteSelectedText: () => void;
  onUpload: () => void;
  onExport: () => void;
  onClose: () => void;
  credits: number;
  isActionsDisabled: boolean;
  onAddText: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ToolIcon = ({ icon, active, onClick, tooltip, disabled = false }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`p-2 md:p-2.5 rounded-lg transition-all relative group ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : active ? 'bg-brand-blue/10 text-brand-blue shadow-inner' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
  >
    {icon}
    {!disabled && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-slate-800 text-[9px] font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 rounded shadow-2xl text-white hidden md:block">
        {tooltip}
      </div>
    )}
  </button>
);

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  activeTool, setActiveTool, isCropping, setIsCropping, brushSize, setBrushSize,
  selectedTextId, deleteSelectedText, onUpload, onExport, onClose, credits, isActionsDisabled, onAddText,
  onUndo, onRedo, canUndo, canRedo
}) => {
  return (
    <div className="flex flex-col shrink-0 z-[120] transition-colors">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-white dark:bg-[#0d151c] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors lg:hidden"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="hidden lg:flex items-center gap-2.5 mr-4">
             <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white shadow-lg">
                {/* Added missing import for Sparkles */}
                <Sparkles size={16} fill="currentColor" />
             </div>
             <span className="text-sm font-black uppercase tracking-tighter italic text-black dark:text-white">Product Editor</span>
          </div>

          <div className="lg:hidden">
             <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Product Editor</h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full transition-colors shrink-0">
            <Coins size={12} className="text-yellow-500" />
            <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-white">{(credits || 0).toLocaleString()} CR</span>
          </div>

          <button 
            onClick={onExport}
            disabled={isActionsDisabled}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-30 disabled:grayscale"
          >
            <Download size={14} strokeWidth={3} />
            <span className="hidden sm:inline">Xuất ảnh</span>
          </button>
          
          <button onClick={onClose} className="hidden lg:flex p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Tool Bar - Scrollable on mobile */}
      <div className="h-12 bg-slate-50 dark:bg-[#0a0f14] border-b border-slate-200 dark:border-white/5 flex items-center px-2 md:px-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 shrink-0">
          <ToolIcon onClick={onUndo} icon={<Undo2 size={16} />} tooltip="Undo" disabled={!canUndo} />
          <ToolIcon onClick={onRedo} icon={<Redo2 size={16} />} tooltip="Redo" disabled={!canRedo} />
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2 md:mx-3" />
          
          <ToolIcon active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} icon={<Hand size={16} />} tooltip="Hand Tool" />
          <ToolIcon active={activeTool === 'pointer'} onClick={() => setActiveTool('pointer')} icon={<MousePointer2 size={16} />} tooltip="Selection Tool" />
          <ToolIcon active={isCropping} onClick={() => setIsCropping(!isCropping)} icon={<Crop size={16} />} tooltip="Crop Tool" disabled={isActionsDisabled} />
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2 md:mx-3" />
          <ToolIcon active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} icon={<PenTool size={16} />} tooltip="Pen Mask" disabled={isActionsDisabled} />
          <ToolIcon active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} icon={<Eraser size={16} />} tooltip="Eraser" disabled={isActionsDisabled} />
          
          {(activeTool === 'pen' || activeTool === 'eraser') && (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-full ml-2">
               <input type="range" min="1" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-16 md:w-20 h-1 bg-slate-200 appearance-none rounded-full accent-brand-blue" />
               <span className="text-[10px] font-bold min-w-[20px] text-slate-500">{brushSize}</span>
            </div>
          )}
          
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2 md:mx-3" />
          <ToolIcon onClick={onAddText} icon={<Type size={16} />} tooltip="Add Text Layer" disabled={isActionsDisabled} />
          <ToolIcon onClick={deleteSelectedText} icon={<Trash2 size={16} />} tooltip="Delete Selection" disabled={!selectedTextId} />
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2 md:mx-3" />
          <ToolIcon onClick={onUpload} icon={<Upload size={16} />} tooltip="Upload Image" />
        </div>
      </div>
    </div>
  );
};