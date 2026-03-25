import React from 'react';
import { 
  Hand, MousePointer2, Crop, Paintbrush, Eraser, Type, Trash2, ImageUp, Download, X, Wallet,
  Undo2, Redo2, ChevronLeft, ImageIcon
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
    className={`p-2 md:p-2.5 rounded-xl transition-all relative group ${disabled ? 'opacity-20 cursor-not-allowed' : active ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
  >
    {icon}
    {!disabled && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-[9px] font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 rounded-lg shadow-2xl text-white hidden md:block tracking-wider">
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
      <div className="h-14 md:h-16 bg-white dark:bg-[#0b0c10] border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors lg:hidden"
          >
            <ChevronLeft size={22} />
          </button>
          
          <div className="hidden lg:flex items-center gap-3 mr-4">
             <div className="w-9 h-9 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                <ImageIcon size={18} />
             </div>
             <div className="space-y-0.5">
               <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">AI Image Editor</h2>
               <p className="text-[9px] font-medium text-slate-400 dark:text-white/30 uppercase tracking-widest">Neural Canvas</p>
             </div>
          </div>

          <div className="lg:hidden">
             <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">AI Image Editor</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/[0.06] rounded-xl transition-colors shrink-0">
            <Wallet size={12} className="text-amber-500" />
            <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-white">{(credits || 0).toLocaleString()}</span>
          </div>

          <button 
            onClick={onExport}
            disabled={isActionsDisabled}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-blue/10 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Lưu ảnh</span>
          </button>
          
          <button onClick={onClose} className="hidden lg:flex p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Tool Bar */}
      <div className="h-11 bg-slate-50/80 dark:bg-[#0e0f14] border-b border-slate-100 dark:border-white/[0.04] flex items-center px-2 md:px-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolIcon onClick={onUndo} icon={<Undo2 size={15} />} tooltip="Hoàn tác" disabled={!canUndo} />
          <ToolIcon onClick={onRedo} icon={<Redo2 size={15} />} tooltip="Làm lại" disabled={!canRedo} />
          <div className="w-px h-5 bg-slate-200 dark:bg-white/[0.06] mx-1.5 md:mx-2" />
          
          <ToolIcon active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} icon={<Hand size={15} />} tooltip="Di chuyển canvas" />
          <ToolIcon active={activeTool === 'pointer'} onClick={() => setActiveTool('pointer')} icon={<MousePointer2 size={15} />} tooltip="Chọn vùng" />
          <ToolIcon active={isCropping} onClick={() => setIsCropping(!isCropping)} icon={<Crop size={15} />} tooltip="Cắt ảnh" disabled={isActionsDisabled} />
          <div className="w-px h-5 bg-slate-200 dark:bg-white/[0.06] mx-1.5 md:mx-2" />
          <ToolIcon active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} icon={<Paintbrush size={15} />} tooltip="Vẽ mask AI" disabled={isActionsDisabled} />
          <ToolIcon active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} icon={<Eraser size={15} />} tooltip="Tẩy mask" disabled={isActionsDisabled} />
          
          {(activeTool === 'pen' || activeTool === 'eraser') && (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/[0.06] rounded-xl ml-2">
               <input type="range" min="1" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-16 md:w-20 h-1 bg-slate-200 dark:bg-white/10 appearance-none rounded-full accent-brand-blue" />
               <span className="text-[10px] font-bold min-w-[20px] text-slate-500 dark:text-white/40">{brushSize}</span>
            </div>
          )}
          
          <div className="w-px h-5 bg-slate-200 dark:bg-white/[0.06] mx-1.5 md:mx-2" />
          <ToolIcon onClick={onAddText} icon={<Type size={15} />} tooltip="Chèn chữ" disabled={isActionsDisabled} />
          <ToolIcon onClick={deleteSelectedText} icon={<Trash2 size={15} />} tooltip="Xóa chọn" disabled={!selectedTextId} />
          <div className="w-px h-5 bg-slate-200 dark:bg-white/[0.06] mx-1.5 md:mx-2" />
          <ToolIcon onClick={onUpload} icon={<ImageUp size={15} />} tooltip="Tải ảnh lên" />
        </div>
      </div>
    </div>
  );
};