import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Eye, EyeOff, Map as MapIcon, ChevronRight, ChevronLeft, 
  Folder, FolderOpen, Box, Grid, RefreshCw, Layers, Sliders,
  CheckCircle2, ChevronDown, ListTree, Package, MessageSquare,
  Send, Bot, User, Loader2, Sparkles, Terminal
} from 'lucide-react';
import { Node } from '@xyflow/react';
import { GoogleGenAI } from "@google/genai";

interface NodesMapSidebarProps {
  nodes: Node[];
  onToggleVisibility: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface LibraryFolder {
  id: string;
  name: string;
  count: number;
  isOpen: boolean;
  children?: { name: string; type: 'node' | 'folder' }[];
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export const NodesMapSidebar: React.FC<NodesMapSidebarProps> = ({ nodes, onToggleVisibility, isOpen, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<'LIBRARY' | 'MAP' | 'CHAT'>('LIBRARY');

  const [folders, setFolders] = useState<LibraryFolder[]>([
    { 
      id: 'bdx', 
      name: 'BDXNodes', 
      count: 2, 
      isOpen: false,
      children: [
        { name: 'BDX Model Loader', type: 'node' },
        { name: 'BDX Control Net', type: 'node' }
      ]
    },
    { 
      id: 'sampling', 
      name: 'sampling', 
      count: 141, 
      isOpen: true,
      children: [
        { name: 'KSampler', type: 'node' },
        { name: 'KSampler (Advanced)', type: 'node' },
        { name: 'LCM Sampler', type: 'node' },
        { name: 'custom_sampling', type: 'folder' },
        { name: 'video_models', type: 'folder' },
        { name: 'schedulers', type: 'folder' }
      ]
    },
    { id: 'loaders', name: 'loaders', count: 12, isOpen: false },
    { id: 'conditioning', name: 'conditioning', count: 8, isOpen: false },
    { id: 'upscaling', name: 'upscaling', count: 15, isOpen: false }
  ]);

  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Xin chào! Tôi có thể giúp gì cho bạn với quy trình workflow này?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "Bạn là một chuyên gia về ComfyUI và AI Workflow. Hãy trả lời ngắn gọn, chuyên nghiệp và tập trung vào kỹ thuật."
        }
      });
      setChatMessages(prev => [...prev, { role: 'bot', content: response.text || "Tôi không thể xử lý yêu cầu lúc này." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'bot', content: "Lỗi kết nối AI Core." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleFolder = (id: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f));
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => 
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.data?.label as string)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nodes, searchQuery]);

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeMenu, icon: any, label: string }) => (
    <button 
      onClick={() => {
        setActiveMenu(id);
        if (!isOpen) onToggle();
      }}
      className={`w-12 h-12 flex items-center justify-center transition-all relative group ${activeMenu === id ? 'text-brand-blue bg-brand-blue/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
      title={label}
    >
      <Icon size={20} />
      {activeMenu === id && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-brand-blue rounded-r-full" />}
      <div className="absolute left-14 bg-black border border-white/10 px-2 py-1 rounded text-[10px] font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[200]">
        {label}
      </div>
    </button>
  );

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? '25%' : 48 }}
      className="relative border-r border-white/5 bg-[#0f0f11] flex flex-row shrink-0 z-50 shadow-2xl transition-all duration-300 min-w-[48px] h-full"
    >
      {/* VERTICAL NAVIGATION BAR */}
      <div className="w-12 border-r border-white/5 flex flex-col items-center py-4 bg-black/40 shrink-0 h-full">
        <NavItem id="LIBRARY" icon={Package} label="Node Library" />
        <NavItem id="MAP" icon={MapIcon} label="Nodes Map" />
        <NavItem id="CHAT" icon={MessageSquare} label="Workflow Chat" />
        
        <div className="mt-auto">
          <button 
            onClick={onToggle}
            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-grow flex flex-col h-full overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 bg-black/20 shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeMenu === 'LIBRARY' && <Package size={16} className="text-brand-blue" />}
                  {activeMenu === 'MAP' && <MapIcon size={16} className="text-brand-blue" />}
                  {activeMenu === 'CHAT' && <MessageSquare size={16} className="text-brand-blue" />}
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">
                    {activeMenu === 'LIBRARY' ? 'NODE LIBRARY' : activeMenu === 'MAP' ? 'NODES MAP' : 'WORKFLOW ASSISTANT'}
                  </h3>
                </div>
                {activeMenu !== 'CHAT' && (
                  <button className="text-gray-500 hover:text-white transition-colors"><RefreshCw size={12} /></button>
                )}
              </div>

              {activeMenu !== 'CHAT' && (
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={14} />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeMenu === 'LIBRARY' ? "Search Nodes..." : "Search Instances..."}
                    className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 pl-9 pr-4 text-[10px] font-bold text-gray-300 outline-none focus:border-brand-blue/50 transition-all placeholder:text-gray-700 shadow-inner"
                  />
                </div>
              )}
            </div>

            {/* Scrolling container with min-h-0 to enable flex-grow scroll */}
            <div className="flex-grow overflow-y-auto no-scrollbar min-h-0">
               {activeMenu === 'LIBRARY' && (
                 <div className="p-2 space-y-1">
                    {folders.map(folder => (
                       <div key={folder.id} className="space-y-1">
                          <button 
                            onClick={() => toggleFolder(folder.id)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all group"
                          >
                             <div className="flex items-center gap-3">
                                {folder.isOpen ? <FolderOpen size={14} className="text-brand-blue" /> : <Folder size={14} className="text-gray-500" />}
                                <span className="text-[11px] font-bold text-gray-400 group-hover:text-white uppercase tracking-tight">{folder.name}</span>
                             </div>
                             <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded-full text-gray-600">{folder.count}</span>
                          </button>
                          
                          <AnimatePresence>
                             {folder.isOpen && folder.children && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="ml-6 space-y-0.5 overflow-hidden"
                                >
                                   {folder.children.map((child, idx) => (
                                      <button 
                                        key={idx}
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg transition-all text-left group"
                                      >
                                         <div className={`w-1.5 h-1.5 rounded-full ${child.type === 'node' ? 'bg-gray-600 group-hover:bg-brand-blue shadow-[0_0_8px_transparent] group-hover:shadow-brand-blue' : 'bg-transparent border border-gray-600 group-hover:border-brand-blue'}`}></div>
                                         <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-300">{child.name}</span>
                                      </button>
                                   ))}
                                </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                    ))}
                 </div>
               )}

               {activeMenu === 'MAP' && (
                 <div className="p-2 space-y-1">
                    {filteredNodes.length > 0 ? (
                      filteredNodes.map((node) => (
                        <div 
                          key={node.id}
                          className={`group flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5 ${node.hidden ? 'opacity-40' : 'opacity-100'}`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-6 h-6 bg-emerald-900/40 border border-emerald-500/20 flex items-center justify-center rounded text-[10px] font-black text-emerald-400 shrink-0">
                              {node.id}
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 group-hover:text-white truncate uppercase tracking-tight">
                              {node.data?.label as string}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => onToggleVisibility(node.id)}
                            className="p-2 text-gray-500 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/10"
                          >
                            {node.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center opacity-10">
                        <Search size={32} className="mx-auto mb-2" />
                        <p className="text-[8px] font-black uppercase tracking-widest">No Nodes Found</p>
                      </div>
                    )}
                 </div>
               )}

               {activeMenu === 'CHAT' && (
                 <div className="h-full flex flex-col">
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto no-scrollbar min-h-0">
                       {chatMessages.map((msg, i) => (
                         <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-blue text-white' : 'bg-white/5 text-brand-blue'}`}>
                               {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div className={`max-w-[85%] p-3 rounded-xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
                               {msg.content}
                            </div>
                         </div>
                       ))}
                       {isChatLoading && (
                          <div className="flex gap-3">
                             <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-brand-blue animate-pulse">
                                <Bot size={12} />
                             </div>
                             <div className="bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5">
                                <Loader2 size={12} className="animate-spin text-brand-blue" />
                             </div>
                          </div>
                       )}
                       <div ref={chatEndRef} />
                    </div>
                    
                    <div className="p-4 bg-black/40 border-t border-white/5 shrink-0">
                       <form onSubmit={handleSendChat} className="relative">
                          <input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Hỏi về cấu hình node..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-[11px] outline-none focus:border-brand-blue transition-all"
                          />
                          <button 
                            type="submit"
                            disabled={isChatLoading || !chatInput.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-blue hover:text-white transition-colors disabled:opacity-30"
                          >
                             <Send size={14} />
                          </button>
                       </form>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
              <div className="flex items-center justify-between text-[8px] font-black uppercase text-gray-600 tracking-widest italic">
                <span>{activeMenu === 'CHAT' ? 'Aether Assistant' : `Nodes: ${nodes.length}`}</span>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span>Secure_Uplink</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};