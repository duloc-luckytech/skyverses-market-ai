
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
  Info, ExternalLink, Edit3, Shield
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
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  
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
    "Viết code React component cho Dashboard chuyên nghiệp",
    "Tạo bảng so sánh tính năng của Gemini và GPT-4o",
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
          <div key={idx} className="my-4 md:my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d0d0f] flex flex-col shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                <Terminal size={12} /> {lang}
              </span>
              <button 
                onClick={() => copyToClipboard(code)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto overflow-y-auto font-mono text-[12px] md:text-[13px] leading-relaxed text-slate-800 dark:text-blue-100/90 max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      let html = block
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-black">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-500 dark:text-gray-400">$1</em>')
        .replace(/^\d+\. (.*)$/gm, '<li class="ml-6 list-decimal mb-2 pl-2">$1</li>')
        .replace(/^\- (.*)$/gm, '<li class="ml-6 list-disc mb-2 pl-2">$1</li>');

      return (
        <div 
          key={idx} 
          className="prose-slate dark:prose-invert max-w-none space-y-4 text-slate-800 dark:text-gray-200 leading-relaxed font-medium text-[14px] md:text-[15px] break-words" 
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-[#0d0d0f] text-slate-900 dark:text-white flex overflow-hidden font-sans transition-all duration-500">
      
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[145]"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR - HISTORY (Responsive Drawer on Mobile) */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : -280,
          width: isSidebarOpen ? 280 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed lg:relative top-0 left-0 h-full border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 bg-slate-50 dark:bg-[#171717] z-[150] lg:z-10 shadow-2xl lg:shadow-none overflow-hidden`}
      >
        <div className="w-[280px] h-full flex flex-col">
          <div className="p-4 space-y-4">
            <button 
              onClick={() => { onClearChat(); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
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
             
             <div className="space-y-1 opacity-40 grayscale group cursor-not-allowed px-3">
                <div className="py-4 text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">Hôm qua</div>
                <div className="py-3 border border-transparent flex items-center gap-3">
                   <History size={14} />
                   <span className="text-[12px] font-bold truncate">Thiết kế Prompt VEO 3...</span>
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/5 mt-auto bg-slate-50 dark:bg-[#171717]">
             <div className="flex items-center gap-3 p-3 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                <img src={user?.picture || "https://i.pravatar.cc/100"} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10" alt="" />
                <div className="flex-grow overflow-hidden">
                   <p className="text-xs font-black truncate text-slate-900 dark:text-white">{user?.name || 'Guest User'}</p>
                   <p className="text-[9px] text-slate-400 dark:text-gray-500 truncate font-bold uppercase">Pro Account</p>
                </div>
             </div>
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col relative bg-white dark:bg-[#212121] overflow-hidden">
        {/* Header - Compact for Mobile */}
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-40 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 transition-all">
           <div className="flex items-center gap-1 md:gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className={`p-2 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full ${isSidebarOpen ? 'bg-brand-blue/10 text-brand-blue' : ''}`}
              >
                <SidebarIcon size={18} />
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                 <span className="text-[12px] md:text-[13px] font-black text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white italic truncate max-w-[120px] sm:max-w-none">Gemini 3.0 Pro</span>
                 <ChevronDown size={14} className="text-slate-400 dark:text-gray-500 shrink-0" />
              </div>
           </div>

           <div className="flex items-center gap-2 md:gap-4">
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
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center space-y-8 md:space-y-12 mt-10 md:mt-20">
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-blue blur-[40px] opacity-10 rounded-full animate-pulse"></div>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 dark:bg-[#333] rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
                     <img src="https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268" className="w-8 h-8 md:w-10 md:h-10 object-contain" alt="" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight italic text-center text-slate-900 dark:text-white">Làm thế nào tôi có thể <br /> giúp <span className="text-brand-blue">bạn xây dựng?</span></h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-2">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => onSendMessage(s)}
                      className="p-4 md:p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-2xl text-left transition-all group flex items-center justify-between shadow-sm"
                    >
                      <p className="text-[12px] md:text-[13px] font-bold text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white leading-relaxed pr-6">{s}</p>
                      <ArrowRight size={16} className="text-slate-300 dark:text-gray-700 group-hover:text-brand-blue transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 md:space-y-12 pb-40">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4 md:gap-6 items-start animate-in fade-in slide-in-from-bottom-2 group/message">
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 border mt-1 shadow-md overflow-hidden ${
                      msg.role === 'user' ? 'bg-slate-200 dark:bg-[#333] border-slate-300 dark:border-white/10' : 'bg-transparent border-transparent'
                    }`}>
                      {msg.role === 'user' ? (
                        <img src={user?.picture || "https://i.pravatar.cc/100"} className="w-full h-full rounded-full" alt="" />
                      ) : (
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-100 dark:bg-[#333] rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/5 p-1">
                            <img src="https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268" className="w-full h-full object-contain" alt="" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow space-y-3 md:space-y-4 min-w-0">
                      <div className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 leading-none">
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
                        <div className="flex items-center gap-4 md:gap-6 pt-2 opacity-0 group-hover/message:opacity-100 transition-opacity overflow-x-auto no-scrollbar pb-2">
                           <button onClick={() => copyToClipboard(msg.parts.map(p => p.content).join('\n'))} className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"><Copy size={13}/> <span className="text-[9px] font-black uppercase">Copy</span></button>
                           <button className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"><RotateCcw size={13}/> <span className="text-[9px] font-black uppercase">Regenerate</span></button>
                           <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-4 md:pl-6 shrink-0">
                              <button className="text-slate-400 dark:text-gray-600 hover:text-green-500 transition-colors"><ThumbsUp size={13}/></button>
                              <button className="text-slate-400 dark:text-gray-600 hover:text-red-500 transition-colors"><ThumbsDown size={13}/></button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 md:gap-6 items-start animate-pulse">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 dark:bg-[#333] border border-slate-200 dark:border-white/5 flex items-center justify-center mt-1">
                      <Loader2 size={16} className="animate-spin text-brand-blue" />
                    </div>
                    <div className="flex-grow space-y-4">
                       <div className="text-[13px] md:text-[15px] font-black uppercase tracking-widest text-brand-blue animate-pulse">Thinking...</div>
                       <div className="h-3 md:h-4 bg-slate-100 dark:bg-white/5 rounded-full w-3/4"></div>
                       <div className="h-3 md:h-4 bg-slate-100 dark:bg-white/5 rounded-full w-1/2"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT BAR - CHATGPT PILL STYLE */}
        <div className="px-4 py-6 md:p-8 lg:p-12 shrink-0 bg-gradient-to-t from-white dark:from-[#212121] via-white dark:via-[#212121] to-transparent z-50 transition-colors">
          <div className="max-w-3xl mx-auto space-y-4">
             {/* File Preview */}
             <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-fit group mb-2"
                  >
                    <div className="relative">
                      <img src={selectedFile.preview} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10" alt="" />
                      <button onClick={() => setSelectedFile(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-all text-white"><X size={10} /></button>
                    </div>
                    <div className="pr-4 hidden sm:block">
                       <p className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest italic">Attachment Locked</p>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>

             <div className="relative flex items-center bg-slate-100 dark:bg-[#2f2f2f] border border-slate-200 dark:border-white/5 rounded-[2rem] p-2 md:p-3 pl-4 md:pl-5 group focus-within:border-slate-300 dark:focus-within:border-white/10 transition-all shadow-xl dark:shadow-2xl">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 md:p-2.5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all bg-white dark:bg-white/5 rounded-full hover:scale-105 active:scale-95 shrink-0 shadow-sm"
                >
                   <Paperclip size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi Skyverses AI..."
                  className="flex-grow bg-transparent border-none py-3 px-3 md:px-5 text-[14px] md:text-sm font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white transition-colors"
                />
                
                <div className="flex items-center gap-1 md:gap-2 pr-1">
                   <button className="p-3 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-white dark:hover:bg-white/5 rounded-full hidden md:flex">
                      <Mic size={20} />
                   </button>
                   <button 
                     onClick={handleSend}
                     disabled={(!input.trim() && !selectedFile) || isLoading}
                     className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                       input.trim() || selectedFile 
                       ? 'bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                       : 'bg-white/50 dark:bg-white/5 text-slate-300 dark:text-gray-700'
                     }`}
                   >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} fill="currentColor" className="ml-0.5" />}
                   </button>
                </div>
             </div>
             
             <div className="flex flex-row justify-between items-center px-4 gap-2">
               <p className="text-[8px] md:text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] italic truncate max-w-[150px] sm:max-w-none">
                  Model: GEMINI_3_PRO_ULTRA
               </p>
               <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">
                  <div className="flex items-center gap-1"><Shield size={10} /> <span className="hidden xs:inline">Secure</span></div>
                  <div className="h-3 w-px bg-slate-200 dark:bg-white/10"></div>
                  <Link to="/policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FullChatModal;
