import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X, Send, Bot, Loader2, Sparkles, Paperclip, 
  Mic, Search, Plus, Sun, Moon, 
  ChevronDown, User as UserIcon,
  MessageSquare, History,
  Sidebar as SidebarIcon, Trash2,
  Copy, RotateCcw, Share2, Terminal,
  CheckCircle, Calendar, Clock, Image as ImageIcon,
  ArrowRight, Maximize2, ThumbsUp, ThumbsDown,
  Info, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ChatMessage, ChatContentPart } from './AISupportChat';

interface FullChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text?: string, file?: {data: string, mimeType: string}) => void;
  onClearChat: () => void;
}

const FullChatModal: React.FC<FullChatModalProps> = ({ 
  isOpen, 
  onClose, 
  messages, 
  isLoading, 
  onSendMessage,
  onClearChat
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const suggestions = [
    "Viết code React component cho một Dashboard chuyên nghiệp",
    "Tạo bảng so sánh các tính năng của Gemini và GPT-4o",
    "Phân tích kịch bản video marketing cho Studio phim",
    "Tạo prompt vẽ nhân vật Cyberpunk cho Midjourney"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedFile({
          data: base64.split(',')[1],
          mimeType: file.type,
          preview: base64
        });
      };
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;
    onSendMessage(input.trim(), selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined);
    setInput('');
    setSelectedFile(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- CONTENT RENDERER ENGINE (CHATGPT STYLE) ---
  const renderMessageContent = (part: ChatContentPart) => {
    if (part.type === 'image') {
      return (
        <div className="my-4 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-full">
           <img src={part.content} className="max-w-full h-auto object-cover" alt="AI Context" />
        </div>
      );
    }

    const text = part.content;
    const blocks = text.split(/(```[\s\S]*?```)/g);
    
    return blocks.map((block, idx) => {
      if (block.startsWith('```')) {
        const match = block.match(/```(\w*)\n?([\s\S]*?)```/);
        const lang = match?.[1] || 'text';
        const code = match?.[2] || '';
        
        return (
          <div key={idx} className="my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d0d0f] flex flex-col shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                <Terminal size={12} /> {lang}
              </span>
              <button 
                onClick={() => copyToClipboard(code)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Copy size={12} /> Copy code
              </button>
            </div>
            <pre className="p-4 overflow-x-auto overflow-y-auto font-mono text-[13px] leading-relaxed text-slate-800 dark:text-blue-100/90 max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      if (block.includes('|') && block.includes('\n|')) {
         const rows = block.trim().split('\n').filter(r => r.includes('|'));
         if (rows.length > 2) {
            return (
              <div key={idx} className="my-6 overflow-x-auto border border-slate-200 dark:border-white/10 rounded-lg shadow-sm">
                <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-white/5">
                    <tr>
                      {rows[0].split('|').filter(c => c.trim()).map((cell, i) => (
                        <th key={i} className="p-3 font-black uppercase text-[10px] tracking-widest text-slate-500 dark:text-gray-400 border-r border-slate-200 dark:border-white/5">{cell.trim()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {rows.slice(2).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        {row.split('|').filter(c => c.trim()).map((cell, j) => (
                          <td key={j} className="p-3 border-r border-slate-100 dark:border-white/5 text-slate-700 dark:text-gray-300 font-medium">{cell.trim()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
         }
      }

      let html = block
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-black">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-500 dark:text-gray-400">$1</em>')
        .replace(/^\d+\. (.*)$/gm, '<li class="ml-6 list-decimal mb-2 pl-2">$1</li>')
        .replace(/^\- (.*)$/gm, '<li class="ml-6 list-disc mb-2 pl-2">$1</li>');

      return (
        <div 
          key={idx} 
          className="prose-slate dark:prose-invert max-w-none space-y-4 text-slate-800 dark:text-gray-200 leading-relaxed font-medium text-[15px] break-words" 
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-[#0d0d0f] text-slate-900 dark:text-white flex overflow-hidden font-sans transition-all duration-500">
      
      {/* SIDEBAR - HISTORY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 bg-slate-50 dark:bg-[#171717]"
          >
            <div className="p-4 space-y-4">
              <button 
                onClick={onClearChat}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-white/5 font-black text-[11px] uppercase tracking-widest"
              >
                <div className="flex items-center gap-3">
                  <Plus size={18} className="text-brand-blue" /> New Chat
                </div>
                <Edit3 size={14} className="text-slate-400 dark:text-gray-500" />
              </button>
            </div>

            <div className="flex-grow flex flex-col overflow-y-auto no-scrollbar px-3 space-y-6">
               <div className="space-y-1">
                  <div className="px-3 py-4 text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">Hôm nay</div>
                  <div className="px-3 py-3 bg-slate-200 dark:bg-white/[0.03] rounded-lg border border-slate-300 dark:border-white/10 flex items-center gap-3 cursor-pointer group">
                     <MessageSquare size={14} className="text-brand-blue" />
                     <span className="text-[12px] font-bold truncate text-slate-700 dark:text-white">Hội thoại hiện tại...</span>
                  </div>
               </div>
               
               <div className="space-y-1 opacity-40 grayscale group cursor-not-allowed">
                  <div className="px-3 py-4 text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">Hôm qua</div>
                  <div className="px-3 py-3 border border-transparent flex items-center gap-3">
                     <History size={14} />
                     <span className="text-[12px] font-bold truncate">Thiết kế Prompt VEO 3...</span>
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-white/5 mt-auto">
               <div className="flex items-center gap-3 p-3 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                  <img src={user?.picture || "https://i.pravatar.cc/100"} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10" alt="" />
                  <div className="flex-grow overflow-hidden">
                     <p className="text-xs font-black truncate text-slate-900 dark:text-white">{user?.name || 'Guest User'}</p>
                     <p className="text-[9px] text-slate-400 dark:text-gray-500 truncate font-bold uppercase">Pro Account</p>
                  </div>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col relative bg-white dark:bg-[#212121] overflow-hidden">
        {/* Header - Minimalist */}
        <header className="h-14 flex items-center justify-between px-6 shrink-0 z-40 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
           <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <SidebarIcon size={18} />
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                 <span className="text-[13px] font-black text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white italic">Gemini 3.0 Pro</span>
                 <ChevronDown size={14} className="text-slate-400 dark:text-gray-500" />
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[8px] font-black uppercase text-green-600 dark:text-green-500 tracking-widest">Active Node</span>
              </div>
              <button onClick={toggleTheme} className="p-2 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 dark:text-gray-400 hover:text-red-500 transition-colors">
                 <X size={20} />
              </button>
           </div>
        </header>

        {/* Chat Scroll View */}
        <div className="flex-grow overflow-y-auto no-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto w-full px-6 py-12 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center space-y-12 mt-20">
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-blue blur-[40px] opacity-10 rounded-full animate-pulse"></div>
                  <div className="w-16 h-16 bg-slate-100 dark:bg-[#333] rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
                     <img src="https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268" className="w-10 h-10 object-contain" alt="" />
                  </div>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic text-center text-slate-900 dark:text-white">Làm thế nào tôi có thể <br /> giúp <span className="text-brand-blue">bạn xây dựng?</span></h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => onSendMessage(s)}
                      className="p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-2xl text-left transition-all group flex items-center justify-between shadow-sm"
                    >
                      <p className="text-[13px] font-bold text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white leading-relaxed pr-6">{s}</p>
                      <ArrowRight size={16} className="text-slate-300 dark:text-gray-700 group-hover:text-brand-blue transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12 pb-40">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-6 items-start animate-in fade-in slide-in-from-bottom-2 group/message">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1 shadow-lg overflow-hidden ${
                      msg.role === 'user' ? 'bg-slate-200 dark:bg-[#333] border-slate-300 dark:border-white/10' : 'bg-transparent border-transparent'
                    }`}>
                      {msg.role === 'user' ? (
                        <img src={user?.picture || "https://i.pravatar.cc/100"} className="w-full h-full rounded-full" alt="" />
                      ) : (
                        <div className="w-8 h-8 bg-slate-100 dark:bg-[#333] rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/5 p-1">
                            <img src="https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268" className="w-full h-full object-contain" alt="" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-4 min-w-0">
                      <div className="text-[14px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 leading-none">
                         {msg.role === 'user' ? 'You' : 'Skyverses AI'}
                      </div>
                      
                      <div className="space-y-4 max-w-full overflow-x-hidden">
                        {msg.parts.map((part, pIdx) => (
                          <div key={pIdx} className="max-w-full">
                            {renderMessageContent(part)}
                          </div>
                        ))}
                      </div>

                      {msg.role === 'bot' && (
                        <div className="flex items-center gap-6 pt-4 opacity-0 group-hover/message:opacity-100 transition-opacity">
                           <button onClick={() => copyToClipboard(msg.parts.map(p => p.content).join('\n'))} className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"><Copy size={14}/> <span className="text-[10px] font-black uppercase">Copy</span></button>
                           <button className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"><RotateCcw size={14}/> <span className="text-[10px] font-black uppercase">Regenerate</span></button>
                           <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-6">
                              <button className="text-slate-400 dark:text-gray-600 hover:text-green-500 transition-colors"><ThumbsUp size={14}/></button>
                              <button className="text-slate-400 dark:text-gray-600 hover:text-red-500 transition-colors"><ThumbsDown size={14}/></button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-6 items-start animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#333] border border-slate-200 dark:border-white/5 flex items-center justify-center mt-1">
                      <Loader2 size={16} className="animate-spin text-brand-blue" />
                    </div>
                    <div className="flex-grow space-y-4">
                       <div className="text-[15px] font-black uppercase tracking-widest text-brand-blue animate-pulse">Thinking...</div>
                       <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-3/4"></div>
                       <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-1/2"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT BAR - CHATGPT PILL STYLE */}
        <div className="p-8 lg:p-12 shrink-0 bg-gradient-to-t from-white dark:from-[#212121] via-white dark:via-[#212121] to-transparent z-50 transition-colors">
          <div className="max-w-3xl mx-auto space-y-4">
             {/* File Preview */}
             <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-fit group"
                  >
                    <div className="relative">
                      <img src={selectedFile.preview} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10" alt="" />
                      <button onClick={() => setSelectedFile(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-all text-white"><X size={10} /></button>
                    </div>
                    <div className="pr-4">
                       <p className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest italic">Attachment Locked</p>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>

             <div className="relative flex items-center bg-slate-100 dark:bg-[#2f2f2f] border border-slate-200 dark:border-white/5 rounded-[2rem] p-3 pl-5 group focus-within:border-slate-300 dark:focus-within:border-white/10 transition-all shadow-xl dark:shadow-2xl">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all bg-white dark:bg-white/5 rounded-full hover:scale-105 active:scale-95 shrink-0 shadow-sm"
                >
                   <Paperclip size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi Skyverses AI bất cứ điều gì..."
                  className="flex-grow bg-transparent border-none py-3 px-5 text-sm font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white transition-colors"
                />
                
                <div className="flex items-center gap-2 pr-1">
                   <button className="p-3 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-white dark:hover:bg-white/5 rounded-full hidden sm:flex">
                      <Mic size={20} />
                   </button>
                   <button 
                     onClick={handleSend}
                     disabled={(!input.trim() && !selectedFile) || isLoading}
                     className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                       input.trim() || selectedFile 
                       ? 'bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                       : 'bg-white/50 dark:bg-white/5 text-slate-300 dark:text-gray-700'
                     }`}
                   >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={22} fill="currentColor" className="ml-0.5" />}
                   </button>
                </div>
             </div>
             
             <div className="flex flex-col sm:flex-row justify-between items-center px-4 gap-2">
               <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] italic">
                  Model: GEMINI_3_PRO_ULTRA_CORE
               </p>
               <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">
                  <div className="flex items-center gap-1.5"><Shield size={10} /> Data Secure</div>
                  <div className="h-3 w-px bg-slate-200 dark:bg-white/10"></div>
                  <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Terms</Link>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Edit3 = ({ size, className }: { size?: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const Shield = ({ size }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

export default FullChatModal;