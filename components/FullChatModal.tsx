
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X, Send, Bot, Loader2, Paperclip, 
  Plus, Sun, Moon, ChevronDown, User as UserIcon,
  MessageSquare, MessageCircle, History,
  Sidebar as SidebarIcon,
  Copy, RotateCcw, Terminal,
  ArrowRight, ThumbsUp, ThumbsDown,
  Edit3, Shield
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
  isOpen, onClose, messages, isLoading, onSendMessage, onClearChat
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoUrl = "/assets/skyverses-logo.png";

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const suggestions = [
    { emoji: '💡', text: 'Tư vấn chọn model AI phù hợp nhu cầu' },
    { emoji: '🎬', text: 'Hướng dẫn tạo video AI chất lượng cao' },
    { emoji: '🖼️', text: 'Cách viết prompt tạo ảnh đẹp nhất' },
    { emoji: '💰', text: 'Bảng giá credits và các gói dịch vụ' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedFile({ data: base64.split(',')[1], mimeType: file.type, preview: base64 });
      };
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;
    onSendMessage(input.trim(), selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined);
    setInput('');
    setSelectedFile(null);
  };

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
  };

  // ═══ Markdown-lite renderer (synced with mini chat) ═══
  const renderMessageContent = (part: ChatContentPart) => {
    if (part.type === 'image') {
      return (
        <div className="my-3 overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.06] shadow-lg max-w-md">
           <img src={part.content} className="max-w-full h-auto object-cover" alt="" />
        </div>
      );
    }

    const text = part.content;
    const blocks = text.split(/(```[\s\S]*?```)/g);
    
    return blocks.map((block, idx) => {
      if (block.startsWith('```')) {
        const match = block.match(/```(\w*)\n?([\s\S]*?)```/);
        const lang = match?.[1] || 'code';
        const code = match?.[2] || '';
        
        return (
          <div key={idx} className="my-4 rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] bg-[#f8f9fa] dark:bg-[#0e0e12]">
            <div className="flex items-center justify-between px-4 py-2 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-gray-500 flex items-center gap-2">
                <Terminal size={10} /> {lang}
              </span>
              <button 
                onClick={() => handleCopy(code, `code-${idx}`)}
                className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 hover:text-brand-blue transition-colors"
              >
                <Copy size={10} /> {copiedId === `code-${idx}` ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-[12px] md:text-[13px] leading-relaxed text-slate-700 dark:text-gray-300 max-h-[400px]">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      let html = block
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-500 dark:text-gray-400">$1</em>')
        .replace(/^\d+\. (.*)$/gm, '<li class="ml-6 list-decimal mb-2 pl-2 text-[14px] leading-relaxed">$1</li>')
        .replace(/^\- (.*)$/gm, '<li class="ml-6 list-disc mb-2 pl-2 text-[14px] leading-relaxed">$1</li>');

      return (
        <div 
          key={idx} 
          className="text-[14px] md:text-[15px] text-slate-700 dark:text-gray-200 leading-relaxed break-words whitespace-pre-wrap" 
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex overflow-hidden font-sans">
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/98 dark:bg-[#0d0d10]/98 backdrop-blur-2xl" />
      
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[145]"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -280, width: isSidebarOpen ? 280 : 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 250 }}
        className="fixed lg:relative top-0 left-0 h-full flex flex-col shrink-0 z-[150] lg:z-10 overflow-hidden"
      >
        <div className="w-[280px] h-full flex flex-col bg-white/80 dark:bg-[#111114]/80 backdrop-blur-xl border-r border-black/[0.04] dark:border-white/[0.04]">
          {/* New Chat */}
          <div className="p-4">
            <button 
              onClick={() => { onClearChat(); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-all border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20"
            >
              <div className="flex items-center gap-3">
                <Plus size={16} className="text-brand-blue" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-gray-300">New Chat</span>
              </div>
              <Edit3 size={12} className="text-slate-400 dark:text-gray-600" />
            </button>
          </div>

          {/* History */}
          <div className="flex-grow overflow-y-auto no-scrollbar px-3 space-y-4">
             <div className="space-y-1">
                <div className="px-3 py-3 text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em]">Hôm nay</div>
                <div className="px-3 py-2.5 bg-brand-blue/[0.06] rounded-xl border border-brand-blue/10 flex items-center gap-3 cursor-pointer">
                   <MessageSquare size={13} className="text-brand-blue shrink-0" />
                   <span className="text-[11px] font-semibold truncate text-slate-700 dark:text-white">Hội thoại hiện tại</span>
                </div>
             </div>
             
             <div className="space-y-1 opacity-30 px-3 cursor-not-allowed">
                <div className="py-3 text-[8px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.3em]">Hôm qua</div>
                <div className="py-2.5 flex items-center gap-3">
                   <History size={13} />
                   <span className="text-[11px] font-medium truncate">Thiết kế Prompt VEO 3...</span>
                </div>
             </div>
          </div>

          {/* User card */}
          <div className="p-3 border-t border-black/[0.04] dark:border-white/[0.04] mt-auto">
             <div className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] rounded-xl transition-all cursor-pointer">
                <img src={user?.picture || "https://i.pravatar.cc/100"} className="w-8 h-8 rounded-lg border border-black/[0.06] dark:border-white/[0.06]" alt="" />
                <div className="flex-grow overflow-hidden">
                   <p className="text-[11px] font-bold truncate text-slate-800 dark:text-white">{user?.name || 'Guest'}</p>
                   <p className="text-[8px] text-emerald-500 font-medium flex items-center gap-1">
                     <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" /> Online
                   </p>
                </div>
             </div>
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 shrink-0 z-40 border-b border-black/[0.04] dark:border-white/[0.04] bg-white/60 dark:bg-[#0d0d10]/60 backdrop-blur-xl">
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSidebarOpen ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-400 hover:text-slate-600 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
              >
                <SidebarIcon size={16} />
              </button>
              
              {/* Logo + Model */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-lg transition-all cursor-pointer group">
                 <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 flex items-center justify-center p-0.5">
                   <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                 </div>
                 <span className="text-[12px] font-bold text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white">Claude Sonnet 4.5</span>
                 <ChevronDown size={12} className="text-slate-400 dark:text-gray-600" />
              </div>
           </div>

           <div className="flex items-center gap-1.5">
              {/* Status */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/[0.06] border border-emerald-500/12 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Online</span>
              </div>
              {/* Support */}
              <a href="https://t.me/nhomhotrokythuat" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-[#2AABEE]/10 items-center justify-center text-[#2AABEE] transition-all" title="Telegram">
                <Send size={14} />
              </a>
              <a href="https://zalo.me/g/brzhpkvbxtnvicdtgpkv" target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-[#0068FF]/10 items-center justify-center text-[#0068FF] transition-all" title="Zalo">
                <MessageCircle size={14} />
              </a>
              <div className="w-px h-5 bg-black/[0.06] dark:bg-white/[0.06] mx-1 hidden sm:block" />
              <button onClick={toggleTheme} className="w-8 h-8 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                 {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                 <X size={16} />
              </button>
           </div>
        </header>

        {/* Chat Scroll View */}
        <div className="flex-grow overflow-y-auto no-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col">
            {messages.length === 0 ? (
              /* ═══ WELCOME STATE ═══ */
              <div className="flex-grow flex flex-col items-center justify-center space-y-8 mt-10 md:mt-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-blue/10 blur-[30px] rounded-full animate-pulse" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/[0.04] dark:to-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center shadow-lg p-3">
                    <img src={logoUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Xin chào! 👋</h2>
                  <p className="text-sm text-slate-500 dark:text-gray-500 font-medium max-w-md">Skyverses AI sẵn sàng hỗ trợ bạn. Hỏi bất cứ điều gì về sản phẩm, tính năng, hoặc cách sử dụng.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-2">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => onSendMessage(s.text)}
                      className="p-4 border border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.02] hover:border-brand-blue/20 hover:bg-brand-blue/[0.03] rounded-2xl text-left transition-all group flex items-center gap-3"
                    >
                      <span className="text-lg shrink-0">{s.emoji}</span>
                      <p className="text-[12px] font-semibold text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white leading-relaxed flex-1">{s.text}</p>
                      <ArrowRight size={14} className="text-slate-300 dark:text-gray-700 group-hover:text-brand-blue transition-all shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Support channels */}
                <div className="flex gap-3 pt-2">
                  <a href="https://t.me/nhomhotrokythuat" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2AABEE]/[0.06] border border-[#2AABEE]/12 hover:border-[#2AABEE]/30 transition-all">
                    <Send size={12} className="text-[#2AABEE]" />
                    <span className="text-[10px] font-bold text-[#2AABEE]">Telegram</span>
                  </a>
                  <a href="https://zalo.me/g/brzhpkvbxtnvicdtgpkv" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0068FF]/[0.06] border border-[#0068FF]/12 hover:border-[#0068FF]/30 transition-all">
                    <MessageCircle size={12} className="text-[#0068FF]" />
                    <span className="text-[10px] font-bold text-[#0068FF]">Zalo</span>
                  </a>
                </div>
              </div>
            ) : (
              /* ═══ MESSAGES ═══ */
              <div className="space-y-6 pb-40">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 items-start group/msg ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === 'user' 
                        ? 'bg-slate-800 dark:bg-white/90 text-white dark:text-black overflow-hidden'
                        : 'bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 p-1.5'
                    }`}>
                      {msg.role === 'user' 
                        ? (user?.picture 
                          ? <img src={user.picture} className="w-full h-full rounded-xl object-cover" alt="" /> 
                          : <UserIcon size={14} />)
                        : <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                      }
                    </div>
                    
                    {/* Content */}
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {/* Name */}
                      <p className={`text-[10px] font-semibold mb-1.5 ${
                        msg.role === 'user' ? 'text-slate-400 dark:text-gray-500 mr-1' : 'text-brand-blue/60 ml-1'
                      }`}>
                        {msg.role === 'user' ? 'You' : 'Skyverses AI'}
                      </p>
                      
                      {/* Bubble */}
                      <div className={`px-5 py-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-slate-800 dark:bg-white/90 text-white dark:text-black rounded-tr-lg'
                          : 'bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] text-slate-700 dark:text-gray-200 rounded-tl-lg'
                      }`}>
                        {msg.parts.map((part, pIdx) => (
                          <div key={pIdx}>
                            {part.type === 'image' && <img src={part.content} className="max-w-full rounded-lg mb-2 border border-white/10" alt="" />}
                            {part.type === 'text' && (
                              msg.role === 'bot' 
                                ? renderMessageContent(part) 
                                : <p className="text-[14px] font-medium leading-relaxed whitespace-pre-wrap">{part.content}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {msg.role === 'bot' && (
                        <div className="flex items-center gap-3 mt-2 ml-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                           <button onClick={() => handleCopy(msg.parts.map(p => p.content).join('\n'), msg.id)} 
                             className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-brand-blue transition-colors">
                             <Copy size={10} /> {copiedId === msg.id ? 'Copied!' : 'Copy'}
                           </button>
                           <span className="text-[8px] text-slate-300 dark:text-gray-700">·</span>
                           <button className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                             <RotateCcw size={10} /> Regenerate
                           </button>
                           <span className="text-[8px] text-slate-300 dark:text-gray-700">·</span>
                           <button className="text-slate-400 hover:text-emerald-500 transition-colors"><ThumbsUp size={11} /></button>
                           <button className="text-slate-400 hover:text-red-400 transition-colors"><ThumbsDown size={11} /></button>
                           <span className="text-[8px] text-slate-300 dark:text-gray-700 ml-1">{msg.timestamp}</span>
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <p className="text-[8px] text-slate-400 dark:text-gray-600 mt-1.5 mr-1">{msg.timestamp}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {isLoading && (
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 flex items-center justify-center p-1.5 shrink-0">
                      <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-brand-blue/60 mb-1.5 ml-1">Skyverses AI</p>
                      <div className="px-5 py-4 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl rounded-tl-lg">
                        <div className="flex items-center gap-2.5">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-brand-blue/40 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-brand-blue/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="w-2 h-2 bg-brand-blue/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-gray-500">Đang suy nghĩ...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ INPUT BAR ═══ */}
        <div className="px-4 py-5 md:px-8 md:py-6 shrink-0 bg-gradient-to-t from-white dark:from-[#0d0d10] via-white/95 dark:via-[#0d0d10]/95 to-transparent z-50">
          <div className="max-w-3xl mx-auto space-y-3">
             {/* File Preview */}
             <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-3 px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl w-fit"
                  >
                    <img src={selectedFile.preview} className="w-10 h-10 rounded-lg object-cover border border-black/[0.06] dark:border-white/[0.06]" alt="" />
                    <p className="text-[10px] font-medium text-slate-400">Ảnh đính kèm</p>
                    <button onClick={() => setSelectedFile(null)} className="w-6 h-6 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-all">
                      <X size={11} />
                    </button>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Input pill — synced design with mini chat */}
             <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
               className="flex items-center gap-2.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-2 pl-3 focus-within:border-brand-blue/30 transition-all shadow-lg">
                <button type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all shrink-0 hover:scale-105 active:scale-95"
                >
                   <Paperclip size={17} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                
                <input 
                  ref={inputRef}
                  type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi Skyverses AI..."
                  className="flex-grow bg-transparent border-none py-3 px-3 text-[14px] font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-900 dark:text-white"
                />
                
                <button type="submit"
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    input.trim() || selectedFile 
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20 hover:brightness-110 active:scale-95' 
                      : 'bg-black/[0.03] dark:bg-white/[0.03] text-slate-300 dark:text-gray-700'
                  }`}>
                   {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
             </form>
             
             <div className="flex justify-between items-center px-3">
               <p className="text-[8px] font-medium text-slate-300 dark:text-gray-700">
                 Powered by Claude · <span className="text-brand-blue">Skyverses</span>
               </p>
               <div className="flex items-center gap-3 text-[8px] font-semibold text-slate-400 dark:text-gray-600">
                  <div className="flex items-center gap-1"><Shield size={9} /> Secure</div>
                  <Link to="/policy" className="hover:text-brand-blue transition-colors">Privacy</Link>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FullChatModal;
