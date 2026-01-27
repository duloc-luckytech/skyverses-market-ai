
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
      id: 'sampling', 
      name: 'Bộ lấy mẫu (Sampling)', 
      count: 141, 
      isOpen: true,
      children: [
        { name: 'KSampler', type: 'node' },
        { name: 'KSampler (Nâng cao)', type: 'node' },
        { name: 'LCM Sampler', type: 'node' }
      ]
    },
    { id: 'loaders', name: 'Bộ nạp (Loaders)', count: 12, isOpen: false },
    { id: 'conditioning', name: 'Điều kiện (Conditioning)', count: 8, isOpen: false },
    { id: 'upscaling', name: 'Nâng cấp (Upscaling)', count: 15, isOpen: false }
  ]);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Chào bạn! Tôi là trợ lý kịch bản AI. Bạn cần hỗ trợ gì về quy trình này?' }
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
        config: { systemInstruction: "Bạn là chuyên gia về AI Workflow. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện." }
      });
      setChatMessages(prev => [...prev, { role: 'bot', content: response.text || "Xin lỗi, tôi chưa hiểu ý bạn." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'bot', content: "Không thể kết nối với trí tuệ nhân tạo." }]);
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
      className={`w-12 h-12 flex items-center justify-center transition-all relative group ${activeMenu === id ? 'text-indigo-600 bg-indigo-500/5' : 'text-gray-500 hover:text-indigo-600 hover:bg-black/5 dark:hover:bg-white/5'}`}
      title={label}
    >
      <Icon size={20} />
      {activeMenu === id && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-indigo-600 rounded-r-full" />}
    </button>
  );

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? '25%' : 48 }}
      className="relative border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0f0f11] flex flex-row shrink-0 z-50 transition-all duration-300 min-w-[48px] h-full"
    >
      <div className="w-12 border-r border-black/5 dark:border-white/5 flex flex-col items-center py-4 bg-slate-50 dark:bg-black/40 shrink-0 h-full">
        <NavItem id="LIBRARY" icon={Package} label="Thư viện khối" />
        <NavItem id="MAP" icon={MapIcon} label="Sơ đồ khối" />
        <NavItem id="CHAT" icon={MessageSquare} label="Trợ lý quy trình" />
        <div className="mt-auto">
          <button onClick={onToggle} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-indigo-600">
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            className="flex-grow flex flex-col h-full overflow-hidden"
          >
            <div className="p-5 border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/20 shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">
                    {activeMenu === 'LIBRARY' ? 'THƯ VIỆN KHỐI' : activeMenu === 'MAP' ? 'DANH SÁCH KHỐI' : 'TRỢ LÝ THÔNG MINH'}
                  </h3>
                </div>
              </div>
              {activeMenu !== 'CHAT' && (
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg py-2.5 pl-9 pr-4 text-[10px] font-bold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar min-h-0 bg-white dark:bg-transparent">
               {activeMenu === 'LIBRARY' && (
                 <div className="p-2 space-y-1">
                    {folders.map(folder => (
                       <div key={folder.id} className="space-y-1">
                          <button onClick={() => toggleFolder(folder.id)} className="w-full flex items-center justify-between p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all group">
                             <div className="flex items-center gap-3">
                                {folder.isOpen ? <FolderOpen size={14} className="text-indigo-600" /> : <Folder size={14} className="text-gray-400" />}
                                <span className="text-[11px] font-bold text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase">{folder.name}</span>
                             </div>
                             <span className="text-[9px] font-black bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">{folder.count}</span>
                          </button>
                          <AnimatePresence>
                             {folder.isOpen && folder.children && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="ml-6 space-y-0.5 overflow-hidden">
                                   {folder.children.map((child, idx) => (
                                      <button key={idx} className="w-full flex items-center gap-3 p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all text-left group">
                                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-indigo-600"></div>
                                         <span className="text-[10px] font-medium text-slate-500 dark:text-gray-500 group-hover:text-slate-900 dark:group-hover:text-gray-300">{child.name}</span>
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
                    {filteredNodes.length > 0 ? filteredNodes.map((node) => (
                        <div key={node.id} className={`group flex items-center justify-between p-3 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 ${node.hidden ? 'opacity-40' : 'opacity-100'}`}>
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center rounded text-[10px] font-black text-indigo-600 dark:text-indigo-400 shrink-0">{node.id}</div>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white truncate uppercase tracking-tight">{node.data?.label as string}</span>
                          </div>
                          <button onClick={() => onToggleVisibility(node.id)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Eye size={14} /></button>
                        </div>
                    )) : <div className="py-20 text-center opacity-10"><p className="text-[8px] font-black uppercase">Không có dữ liệu</p></div>}
                 </div>
               )}

               {activeMenu === 'CHAT' && (
                 <div className="h-full flex flex-col">
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto no-scrollbar min-h-0">
                       {chatMessages.map((msg, i) => (
                         <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-indigo-600'}`}>
                               {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div className={`max-w-[85%] p-3 rounded-xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 rounded-tl-none border border-black/5 dark:border-white/5'}`}>
                               {msg.content}
                            </div>
                         </div>
                       ))}
                       {isChatLoading && <div className="flex gap-3"><div className="w-6 h-6 rounded bg-slate-100 dark:bg-white/5 flex items-center justify-center text-indigo-600 animate-pulse"><Bot size={12} /></div><div className="bg-slate-100 dark:bg-white/5 p-3 rounded-xl rounded-tl-none border border-black/5 dark:border-white/5"><Loader2 size={12} className="animate-spin text-indigo-600" /></div></div>}
                       <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-black/40 border-t border-black/5 dark:border-white/5 shrink-0">
                       <form onSubmit={handleSendChat} className="relative">
                          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Hỏi gì đó về quy trình..." className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-[11px] outline-none focus:border-indigo-600 transition-all text-slate-900 dark:text-white" />
                          <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-30"><Send size={14} /></button>
                       </form>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/20 shrink-0">
              <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest italic">
                <span>{activeMenu === 'CHAT' ? 'Trợ lý ảo' : `Tổng: ${nodes.length} khối`}</span>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span>Hoạt động</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};
