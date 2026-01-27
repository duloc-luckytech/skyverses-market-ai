
import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Settings, Zap, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Upload, RefreshCw, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeEditorToolbar } from './NodeEditorToolbar';

export const EditorNode = ({ id, data, selected }: any) => {
  const [editingField, setEditingField] = useState<{ key: string; value: any } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Common Auth Tokens for RunningHub
  const AUTH_TOKEN = "eyJ1c2VySWQiOiIyMmUxNjNlM2U3YjQ2MmI1YWNkYjVmOTgxNTNmMjRiMiIsInNpZ25FeHBpcmUiOjE3NzAxMjM5MDg1MjgsInRzIjoxNzY5NTE5MTA4NTI4LCJzaWduIjoiODYzNzJiOWJjN2IwODA3MGZmNTYzMjA2N2Y0YTAzYWYifQ==";
  const IDENTIFY_TOKEN = "22e163e3e7b462b5acdb5f98153f24b2";

  // Base URL template for RunningHub Image Viewing
  const getRunningHubImageUrl = (filename: string) => {
    if (filename.startsWith('/view')) {
      return `https://www.runninghub.ai${filename}`;
    }
    return `https://www.runninghub.ai/view?type=input&filename=${filename}&Auth=${AUTH_TOKEN}&Rh-Identify=${IDENTIFY_TOKEN}`;
  };

  // Base URL template for RunningHub Video Viewing
  const getRunningHubVideoUrl = (filename: string) => {
    if (filename.startsWith('/vhs/viewvideo')) {
      return `https://www.runninghub.ai${filename}`;
    }
    return `https://www.runninghub.ai/vhs/viewvideo?custom_height=0&force_rate=24&filename=${filename}&custom_width=0&select_every_nth=1&frame_load_cap=0&format=video%2Fmp4&skip_first_frames=0&type=input&timestamp=1769519141146&force_size=1100.0787353515625x%3F&deadline=realtime&Rh-Comfy-Auth=${AUTH_TOKEN}&Rh-Identify=${IDENTIFY_TOKEN}`;
  };

  // Kiểm tra xem node này có phải là node STRING chuyên dụng (Multiline) không
  const isStringNode = data.classType === 'PrimitiveStringMultiline' || 
                       data.outputs?.includes('STRING') ||
                       data.label?.toUpperCase() === 'PROMPT';

  const submitEdit = () => {
    if (!editingField) return;
    let finalValue: any = tempValue;
    if (typeof editingField.value === 'number') finalValue = parseFloat(tempValue) || 0;
    else if (typeof editingField.value === 'boolean') finalValue = tempValue.toLowerCase() === 'true';
    if (data.onUpdate) data.onUpdate(editingField.key, finalValue);
    setEditingField(null);
  };

  useEffect(() => {
    if (editingField) { 
      inputRef.current?.focus(); 
      inputRef.current?.select(); 
    }
  }, [editingField]);

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} align="end" offset={12}>
        <NodeEditorToolbar />
      </NodeToolbar>

      <div className={`min-w-[360px] bg-[#1a1b23]/95 backdrop-blur-2xl border-2 rounded-none transition-all duration-300 shadow-2xl ${selected ? 'border-indigo-500 ring-8 ring-indigo-500/10 scale-[1.02]' : 'border-white/5'}`}>
        
        {/* Node Header */}
        <div className={`px-5 py-3 flex items-center justify-between border-b border-white/5 ${data.headerColor || 'bg-[#2a2b33]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider text-white italic leading-none">{data.label}</span>
            </div>
          </div>
          <span className="text-[8px] font-mono font-bold text-white/20">ID: {id}</span>
        </div>
        
        <div className="p-4 space-y-4">
          {/* External Inputs (Connections) */}
          {data.inputs && data.inputs.length > 0 && (
            <div className="space-y-2 mb-2">
               {data.inputs.map((input: any, idx: number) => (
                 <div key={idx} className="relative py-1 flex items-center">
                    <Handle 
                      type="target" 
                      position={Position.Left} 
                      id={input.name} 
                      style={{ left: -14, top: '50%', background: '#6366f1', border: '3px solid #1a1b23', width: '12px', height: '12px' }} 
                    />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 italic">{input.name}</span>
                 </div>
               ))}
            </div>
          )}

          {/* Internal Widgets / Parameters */}
          {data.widgets && data.widgets.length > 0 && (
            <div className="space-y-4">
               {data.widgets.map((widget: any, idx: number) => {
                 const isVideoFile = typeof widget.value === 'string' && widget.value.toLowerCase().endsWith('.mp4');
                 const isLongText = typeof widget.value === 'string' && widget.value.length > 40;
                 
                 // Phát hiện ảnh dựa trên string hoặc cấu trúc mảng đối tượng phức tạp có trường 'url'
                 let imagePreviewUrl = null;
                 if (typeof widget.value === 'string' && /\.(png|jpg|jpeg|webp|gif)$/i.test(widget.value)) {
                    imagePreviewUrl = getRunningHubImageUrl(widget.value);
                 } else if (Array.isArray(widget.value) && widget.value.length > 0 && typeof widget.value[0] === 'object' && widget.value[0].url) {
                    const rawUrl = widget.value[0].url;
                    // Xử lý tự động thêm domain nếu là đường dẫn tương đối
                    imagePreviewUrl = rawUrl.startsWith('/') ? `https://www.runninghub.ai${rawUrl}` : rawUrl;
                 }

                 // Render VIDEO PREVIEW
                 if (isVideoFile) {
                    return (
                      <div key={idx} className="space-y-2 py-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-tighter italic flex items-center gap-2">
                          <Film size={10} className="text-purple-400" /> {widget.label}
                        </label>
                        <div className="relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/5 group/vid shadow-inner">
                           <video 
                             src={getRunningHubVideoUrl(widget.value)} 
                             autoPlay loop muted playsInline
                             className="w-full h-full object-cover transition-transform duration-700 group-hover/vid:scale-105" 
                           />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/vid:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl">
                                <Upload size={14} />
                              </button>
                              <button className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl">
                                <RefreshCw size={14} />
                              </button>
                           </div>
                        </div>
                        <div className="px-2 py-1 bg-black/20 rounded border border-white/[0.03]">
                           <p className="text-[8px] font-mono text-gray-500 truncate uppercase tracking-tighter">{String(widget.value)}</p>
                        </div>
                      </div>
                    );
                 }

                 // Render IMAGE PREVIEW
                 if (imagePreviewUrl) {
                    return (
                      <div key={idx} className="space-y-2 py-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-tighter italic flex items-center gap-2">
                          <ImageIcon size={10} className="text-indigo-400" /> {widget.label}
                        </label>
                        <div className="relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/5 group/img shadow-inner">
                           <img 
                            src={imagePreviewUrl} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover/img:scale-105" 
                            alt="Node Asset"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=400';
                            }}
                           />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl">
                                <Upload size={14} />
                              </button>
                              <button className="p-2.5 bg-white text-black rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl">
                                <RefreshCw size={14} />
                              </button>
                           </div>
                        </div>
                        <div className="px-2 py-1 bg-black/20 rounded border border-white/[0.03]">
                           <p className="text-[8px] font-mono text-gray-500 truncate uppercase tracking-tighter">
                             {typeof widget.value === 'string' ? widget.value : `Complex Object: ${widget.label}`}
                           </p>
                        </div>
                      </div>
                    );
                 }

                 // Render Textarea for Prompt/Long strings
                 if ((isStringNode || isLongText) && typeof widget.value === 'string') {
                   return (
                     <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[9px] font-black uppercase text-gray-500 tracking-tighter italic flex items-center gap-2">
                            <FileText size={10} className="text-indigo-400" /> {widget.label}
                          </label>
                        </div>
                        <textarea
                          value={widget.value}
                          onChange={(e) => data.onUpdate && data.onUpdate(widget.label, e.target.value)}
                          className="w-full h-32 bg-[#0d0d0f] border border-white/[0.05] rounded-lg p-4 text-[11px] font-mono text-indigo-100/80 focus:border-indigo-500/50 outline-none transition-all resize-none shadow-inner scrollbar-hide"
                          placeholder="Nhập nội dung..."
                        />
                     </div>
                   );
                 }

                 // Ngược lại render dạng Pill như cũ
                 return (
                   <div 
                    key={idx} 
                    onClick={() => { setEditingField({ key: widget.label, value: widget.value }); setTempValue(String(widget.value)); }}
                    className="group flex items-center bg-[#0d0d0f] border border-white/[0.03] rounded-full px-3 py-1.5 hover:border-indigo-500/40 transition-all cursor-pointer shadow-inner"
                   >
                      <ChevronLeft size={10} className="text-gray-600 group-hover:text-indigo-400" />
                      <div className="flex-grow flex justify-between items-center px-3 overflow-hidden">
                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-tighter group-hover:text-gray-300 truncate mr-4">
                          {widget.label}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-gray-200 tracking-tight whitespace-nowrap">
                           {String(widget.value)}
                        </span>
                      </div>
                      <ChevronRight size={10} className="text-gray-600 group-hover:text-indigo-400" />
                   </div>
                 );
               })}
            </div>
          )}

          {/* External Outputs */}
          {data.outputs && data.outputs.length > 0 && (
            <div className="space-y-2 pt-2">
               {data.outputs.map((out: string, idx: number) => (
                 <div key={idx} className="relative py-1 flex justify-end items-center">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic pr-2">{out}</span>
                    <Handle 
                      type="source" 
                      position={Position.Right} 
                      id={String(idx)} 
                      style={{ right: -14, top: '50%', background: '#10b981', border: '3px solid #1a1b23', width: '12px', height: '12px' }} 
                    />
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="px-5 py-2 bg-black/40 flex justify-between items-center text-[7px] font-black text-white/10 uppercase tracking-[0.4em] border-t border-white/[0.03]">
           <span>Neural Architecture Node</span>
           <Zap size={8} />
        </div>

        {/* Edit Modal for Parameters (Pill Mode only) */}
        <AnimatePresence>
          {editingField && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto" 
              onClick={() => setEditingField(null)}
            >
              <div className="bg-[#1a1b2e] rounded-none p-8 flex flex-col gap-6 shadow-3xl border border-white/10 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <Settings size={20} className="text-indigo-500"/>
                    <span className="text-white text-sm font-black uppercase tracking-widest italic">Cập nhật: {editingField.key}</span>
                 </div>
                 <input 
                   ref={inputRef} type="text" value={tempValue} 
                   onChange={e => setTempValue(e.target.value)} 
                   onKeyDown={e => e.key === 'Enter' && submitEdit()} 
                   className="w-full bg-black border border-white/10 rounded-none p-5 text-white font-bold outline-none focus:border-indigo-500 transition-all" 
                 />
                 <div className="flex gap-4">
                   <button onClick={() => setEditingField(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Hủy</button>
                   <button onClick={submitEdit} className="flex-1 bg-indigo-600 text-white py-4 rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Xác nhận</button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
