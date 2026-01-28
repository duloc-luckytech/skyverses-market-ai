import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, RotateCcw, Check, X, Loader2, Maximize2, Upload, Sparkles } from 'lucide-react';

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
      className={`flex-grow flex flex-col relative bg-slate-100 dark:bg-[#020209] overflow-hidden transition-colors ${activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : (activeTool === 'pen' || activeTool === 'eraser') ? 'cursor-crosshair' : ''}`} 
      onMouseDown={onMouseDown}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      
      {/* Zoom HUD - Moved down slightly to avoid mobile title overlapping */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e252b]/90 backdrop-blur-xl border border-white/5 rounded-full px-4 py-2 flex items-center gap-6 text-[11px] font-bold shadow-2xl">
           <div className="flex items-center gap-3 text-white">
              <button onClick={() => setZoom(z => Math.max(10, z-10))} className="text-gray-400 hover:text-cyan-400"><Search size={14} /></button>
              <span className="min-w-[40px] text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(400, z+10))} className="text-gray-400 hover:text-cyan-400"><Plus size={14} /></button>
              <button onClick={() => { setZoom(() => 100); setPanOffset({ x: 0, y: 0 }); }} className="text-gray-500 hover:text-white border-l border-white/10 pl-3"><RotateCcw size={14} /></button>
           </div>
      </div>

      {/* Crop Controls */}
      <AnimatePresence>
        {isCropping && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-4xl pointer-events-none px-4">
            <div className="bg-[#1a1f26]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex items-center gap-0.5 pointer-events-auto shadow-2xl overflow-x-auto no-scrollbar max-w-full">
              {ratioPresets.map(r => (
                <button key={r.label} onClick={() => handleRatioSelect(r.value)} className={`px-5 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${cropRatio === r.value ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{r.label}</button>
              ))}
            </div>
            <div className="bg-[#0d1117]/98 backdrop-blur-3xl border border-white/10 rounded-2xl p-3 flex items-center gap-8 pointer-events-auto shadow-2xl">
               <div className="flex items-center gap-3 pr-6 border-r border-white/5">
                  <span className="text-[12px] font-black italic text-gray-300">
                     {imageRef.current ? Math.round((cropBox.w / 100) * imageRef.current.naturalWidth) : 0} × {imageRef.current ? Math.round((cropBox.h / 100) * imageRef.current.naturalHeight) : 0}
                  </span>
               </div>
               <div className="flex gap-2">
                  <button onClick={applyCrop} className="bg-cyan-500 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase hover:brightness-110 transition-all"><Check size={16} strokeWidth={4} /> <span className="hidden sm:inline">Áp dụng</span></button>
                  <button onClick={() => setIsCropping(false)} className="bg-white/10 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase hover:bg-white/20 transition-all"><X size={16} strokeWidth={4} /> <span className="hidden sm:inline">Hủy</span></button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Area - Balanced padding for mobile */}
      <div className="flex-grow flex items-center justify-center p-4 pr-16 md:p-12 lg:pr-24 pb-32 lg:pb-12 overflow-auto no-scrollbar relative">
         <div className="relative shadow-2xl transition-transform duration-300 flex items-center justify-center" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})` }}>
            {result ? (
               <div ref={containerRef as any} className="relative inline-block bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 transition-all">
                  <img ref={imageRef as any} src={result} className={`max-w-[75vw] max-h-[70vh] object-contain pointer-events-none select-none ${visibleLayers.includes('bg') ? 'opacity-100' : 'opacity-0'}`} alt="Workspace" />
                  <canvas ref={canvasRef as any} className={`absolute inset-0 pointer-events-none ${visibleLayers.includes('mask') ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 10 }} />
                  
                  {/* TEXT LAYERS CONTAINER */}
                  <div className={`absolute inset-0 pointer-events-none ${visibleLayers.includes('text') ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 20 }}>
                     {textLayers.map(layer => (
                       <div 
                        key={layer.id} 
                        onMouseDown={(e) => handleTextMouseDown(e, layer)} 
                        className={`absolute pointer-events-auto cursor-move select-none p-2 border-2 transition-colors ${selectedTextId === layer.id ? 'border-dashed border-cyan-400 bg-cyan-400/10' : 'border-transparent hover:border-white/20'}`} 
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

                  <AnimatePresence>
                    {isCropping && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 pointer-events-none">
                        <div className="absolute inset-0 bg-black/60" style={{ clipPath: `polygon(0% 0%, 0% 100%, ${cropBox.x}% 100%, ${cropBox.x}% ${cropBox.y}%, ${cropBox.x + cropBox.w}% ${cropBox.y}%, ${cropBox.x + cropBox.w}% ${cropBox.y + cropBox.h}%, ${cropBox.x}% ${cropBox.y + cropBox.h}%, ${cropBox.x}% 100%, 100% 100%, 100% 0%)` }} />
                        <div className="absolute pointer-events-auto cursor-move border border-cyan-400" style={{ left: `${cropBox.x}%`, top: `${cropBox.y}%`, width: `${cropBox.w}%`, height: `${cropBox.h}%` }} onMouseDown={(e) => { e.stopPropagation(); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }}>
                           <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-sm cursor-nw-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('topleft'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                           <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-sm cursor-ne-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('topright'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                           <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-sm cursor-sw-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('bottomleft'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                           <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-sm cursor-se-resize" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('bottomright'); setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } }); }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            ) : isGenerating ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-8 text-center p-10 md:p-20">
                  <div className="relative">
                    <Loader2 size={100} className="text-brand-blue animate-spin" strokeWidth={1} />
                    <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/50 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl md:text-3xl font-black uppercase tracking-[0.5em] text-slate-800 dark:text-white animate-pulse italic">Đang tạo...</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest italic">Neural_Synthesis_In_Progress</p>
                  </div>
               </motion.div>
            ) : (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-6 p-10 md:p-20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 cursor-pointer group hover:border-brand-blue/50 transition-all" onClick={onUploadClick}>
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center text-slate-300 dark:text-gray-600 group-hover:text-brand-blue transition-all shadow-xl">
                    <Upload strokeWidth={1} className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                  <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 group-hover:text-brand-blue transition-colors text-center">Tải lên hoặc kéo thả ảnh vào đây</p>
               </motion.div>
            )}
         </div>
      </div>
    </div>
  );
};