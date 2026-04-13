import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Loader2, ImageUp, Wand2 } from 'lucide-react';

interface EditorViewportProps {
  result: string | null;
  zoom: number;
  setZoom: (val: (z: number) => number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (val: { x: number; y: number }) => void;
  activeTool: string;
  isCropping: boolean;
  setIsCropping: (val: boolean) => void;
  cropBox: any;
  setDragStart: any;
  setResizeHandle: any;
  applyCrop: () => void;
  cropRatio: number;
  handleRatioSelect: (val: number) => void;
  ratioPresets: any[];
  textLayers: any[];
  handleTextMouseDown: (e: any, layer: any) => void;
  selectedTextId: string | null;
  visibleLayers: string[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onUploadClick: () => void;
  isGenerating: boolean;
  updateTextLayer: (id: string, newText: string) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const EditorViewport: React.FC<EditorViewportProps> = ({
  result, zoom, setZoom, panOffset, setPanOffset, activeTool, isCropping, setIsCropping,
  cropBox, setDragStart, setResizeHandle, applyCrop, cropRatio, handleRatioSelect, ratioPresets,
  textLayers, handleTextMouseDown, selectedTextId, visibleLayers, canvasRef, imageRef, containerRef,
  onMouseDown, onUploadClick, isGenerating, updateTextLayer, onDrop
}) => {
  return (
    <div 
      className={`flex-grow flex flex-col relative bg-slate-100/50 dark:bg-[#080910] overflow-hidden transition-colors ${activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : (activeTool === 'pen' || activeTool === 'eraser') ? 'cursor-crosshair' : ''}`} 
      onMouseDown={onMouseDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      
      {/* Zoom HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-[#14151a]/90 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-1.5 flex items-center gap-4 text-[11px] font-bold shadow-lg">
           <div className="flex items-center gap-2.5 text-slate-600 dark:text-white">
              <button onClick={() => setZoom(z => Math.max(10, z-10))} className="text-slate-400 dark:text-white/40 hover:text-brand-blue transition-colors" title="Thu nhỏ"><ZoomOut size={13} /></button>
              <span className="min-w-[36px] text-center text-xs font-bold">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(400, z+10))} className="text-slate-400 dark:text-white/40 hover:text-brand-blue transition-colors" title="Phóng to"><ZoomIn size={13} /></button>
              <button onClick={() => { setZoom(() => 100); setPanOffset({ x: 0, y: 0 }); }} className="text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white border-l border-slate-200 dark:border-white/[0.06] pl-2.5 transition-colors" title="Về gốc"><RotateCcw size={13} /></button>
           </div>
      </div>

      {/* Crop Controls */}
      <AnimatePresence>
        {isCropping && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2.5 w-full max-w-4xl pointer-events-none px-4">
            <div className="bg-white/95 dark:bg-[#14151a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-xl p-1 flex items-center gap-0.5 pointer-events-auto shadow-xl overflow-x-auto no-scrollbar max-w-full">
              {ratioPresets.map(r => (
                <button key={r.label} onClick={() => handleRatioSelect(r.value)} className={`px-4 py-2 text-[10px] font-bold uppercase rounded-lg transition-all whitespace-nowrap ${cropRatio === r.value ? 'bg-brand-blue text-white shadow-md' : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>{r.label}</button>
              ))}
            </div>
            <div className="bg-white/95 dark:bg-[#14151a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-xl p-2.5 flex items-center gap-6 pointer-events-auto shadow-xl">
               <div className="flex items-center gap-3 pr-5 border-r border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[12px] font-bold text-slate-700 dark:text-white/80">
                     {imageRef.current ? Math.round((cropBox.w / 100) * imageRef.current.naturalWidth) : 0} × {imageRef.current ? Math.round((cropBox.h / 100) * imageRef.current.naturalHeight) : 0}
                  </span>
               </div>
               <div className="flex gap-2">
                  <button onClick={applyCrop} className="bg-brand-blue text-white px-5 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase hover:brightness-110 transition-all shadow-md"><Check size={14} strokeWidth={3} /> <span className="hidden sm:inline">Xác nhận cắt</span></button>
                  <button onClick={() => setIsCropping(false)} className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white px-5 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase hover:bg-slate-200 dark:hover:bg-white/20 transition-all"><X size={14} strokeWidth={3} /> <span className="hidden sm:inline">Hủy bỏ</span></button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Area */}
      <div className="flex-grow flex items-center justify-center p-4 pr-16 md:p-12 lg:pr-24 pb-32 lg:pb-12 overflow-auto no-scrollbar relative">
         <div className="relative shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-transform duration-300 flex items-center justify-center" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})` }}>
            {result ? (
               <div ref={containerRef as any} className="relative inline-block bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/[0.06] rounded-lg transition-all overflow-hidden">
                  <img ref={imageRef as any} src={result} className={`max-w-[75vw] max-h-[70vh] object-contain pointer-events-none select-none ${visibleLayers.includes('bg') ? 'opacity-100' : 'opacity-0'}`} alt="Workspace" />
                  <canvas ref={canvasRef as any} className={`absolute inset-0 pointer-events-none ${visibleLayers.includes('mask') ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 10 }} />
                  
                  {/* TEXT LAYERS */}
                  <div className={`absolute inset-0 pointer-events-none ${visibleLayers.includes('text') ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 20 }}>
                     {textLayers.map(layer => (
                       <div 
                        key={layer.id} 
                        onMouseDown={(e) => handleTextMouseDown(e, layer)} 
                        className={`absolute pointer-events-auto cursor-move select-none p-2 border-2 transition-colors rounded ${selectedTextId === layer.id ? 'border-dashed border-brand-blue bg-brand-blue/10' : 'border-transparent hover:border-white/20'}`} 
                        style={{ 
                          left: `${layer.x}%`, 
                          top: `${layer.y}%`, 
                          fontSize: `${layer.fontSize}px`, 
                          color: layer.color, 
                          fontWeight: '900', 
                          textTransform: 'uppercase', 
                          lineHeight: 1,
                          whiteSpace: 'nowrap'
                        }}
                       >
                         {layer.text}
                       </div>
                     ))}
                  </div>

                  {/* Crop overlay */}
                  <AnimatePresence>
                    {isCropping && !isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 pointer-events-none">
                        <div className="absolute inset-0 bg-black/50" style={{ clipPath: `polygon(0% 0%, 0% 100%, ${cropBox.x}% 100%, ${cropBox.x}% ${cropBox.y}%, ${cropBox.x + cropBox.w}% ${cropBox.y}%, ${cropBox.x + cropBox.w}% ${cropBox.y + cropBox.h}%, ${cropBox.x}% ${cropBox.y + cropBox.h}%, ${cropBox.x}% 100%, 100% 100%, 100% 0%)` }} />
                        <div className="absolute pointer-events-auto cursor-move border border-brand-blue" style={{ left: `${cropBox.x}%`, top: `${cropBox.y}%`, width: `${cropBox.w}%`, height: `${cropBox.h}%` }} onMouseDown={(e) => { e.stopPropagation(); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }}>
                           <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-nw-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('topleft'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                           <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-ne-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('topright'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                           <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-sw-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('bottomleft'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                           <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-brand-blue rounded-sm cursor-se-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('bottomright'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ✅ Loading overlay khi crop/draw đang xử lý */}
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-sm rounded-lg"
                      >
                        <div className="relative">
                          <Loader2 size={56} className="text-brand-blue animate-spin" strokeWidth={1.5} />
                          <Wand2 size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/60 animate-pulse" />
                        </div>
                        <div className="text-center space-y-1.5">
                          <p className="text-sm font-bold text-white animate-pulse">AI đang xử lý ảnh...</p>
                          <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Vui lòng chờ trong giây lát</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            ) : isGenerating ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-8 text-center p-10 md:p-20">
                  <div className="relative">
                    <Loader2 size={80} className="text-brand-blue animate-spin" strokeWidth={1} />
                    <Wand2 size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/40 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg md:text-xl font-bold text-slate-700 dark:text-white/80 animate-pulse">AI đang xử lý ảnh...</p>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-white/20 uppercase tracking-widest">Vui lòng chờ trong giây lát</p>
                  </div>
               </motion.div>
            ) : (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-6 p-10 md:p-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#14151a]/50 cursor-pointer group hover:border-brand-blue/30 transition-all" onClick={onUploadClick}>
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/[0.06] rounded-2xl flex items-center justify-center text-slate-300 dark:text-white/15 group-hover:text-brand-blue group-hover:border-brand-blue/20 transition-all shadow-inner">
                    <ImageUp strokeWidth={1} className="w-10 h-10 md:w-14 md:h-14" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm md:text-base font-bold text-slate-400 dark:text-white/30 group-hover:text-brand-blue transition-colors">Nhấn hoặc kéo thả ảnh vào đây</p>
                    <p className="text-[10px] text-slate-300 dark:text-white/15 font-medium">Hỗ trợ JPG, PNG, WEBP — Tối đa 10MB</p>
                  </div>
               </motion.div>
            )}
         </div>

      </div>
    </div>
  );
};