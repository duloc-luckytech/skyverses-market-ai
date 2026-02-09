
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  X, Send, Bot, 
  Loader2, Activity, Terminal, 
  ChevronDown, User as UserIcon,
  Shield, Sparkles, Paperclip, ImageIcon, Trash2,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GoogleGenAI } from "@google/genai";
import FullChatModal from './FullChatModal';
import { systemConfigApi } from '../apis/config';
import { GeminiKey } from '../types';

export interface ChatContentPart {
  type: 'text' | 'image' | 'code' | 'table';
  content: string;
  language?: string; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  parts: ChatContentPart[];
  timestamp: string;
}

const AISupportChat: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [apiKeys, setApiKeys] = useState<GeminiKey[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = "https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await systemConfigApi.getSystemConfig();
        if (res?.success && res.data?.listKeyGommoGenmini) {
          setApiKeys(res.data.listKeyGommoGenmini);
        }
      } catch (err) {
        console.error("Failed to load AI keys from config", err);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (isOpen || isFull) {
      scrollToBottom();
    }
  }, [messages, isOpen, isFull, isLoading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const base64 = await fileToBase64(file);
      setSelectedFile({
        data: base64.split(',')[1],
        mimeType: file.type,
        preview: base64
      });
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setSelectedFile(null);
    setInput('');
  };

  const getRandomKey = () => {
    const activeKeys = apiKeys.filter(k => k.isActive && k.key);
    if (activeKeys.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeKeys.length);
      return activeKeys[randomIndex].key;
    }
    return process.env.API_KEY || '';
  };

  const handleSendMessage = async (customText?: string, customFile?: {data: string, mimeType: string}) => {
    const userText = customText || input.trim();
    const currentFile = customFile || selectedFile;
    
    if ((!userText && !currentFile) || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userParts: ChatContentPart[] = [];
    if (userText) userParts.push({ type: 'text', content: userText });
    if (currentFile) {
        const previewUrl = currentFile.data.startsWith('data:') ? currentFile.data : `data:${currentFile.mimeType};base64,${currentFile.data}`;
        userParts.push({ type: 'image', content: previewUrl });
    }

    const newUserMessage: ChatMessage = { 
      id: Date.now().toString(),
      role: 'user', 
      parts: userParts,
      timestamp
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const selectedKey = getRandomKey();
      const ai = new GoogleGenAI({ apiKey: selectedKey });
      
      const apiParts: any[] = [];
      if (userText) apiParts.push({ text: userText });
      if (currentFile) {
        apiParts.push({
          inlineData: {
            data: currentFile.data.includes('base64,') ? currentFile.data.split('base64,')[1] : currentFile.data,
            mimeType: currentFile.mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: apiParts },
        config: {
          systemInstruction: `You are a helpful and professional AI Assistant of Skyverses.
          Format your output using Markdown. Use code blocks for code, tables for data, and lists for steps.
          Always be concise and efficient.`,
        },
      });

      const botParts: ChatContentPart[] = [];
      const botText = response.text || "I encountered an issue generating a response.";
      
      botParts.push({ type: 'text', content: botText });

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'bot', 
        parts: botParts, 
        timestamp 
      }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'bot', 
        parts: [{ type: 'text', content: "Hệ thống đang bận hoặc giới hạn API đã đạt ngưỡng. Vui lòng thử lại sau giây lát." }], 
        timestamp 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-1/2 right-0 -translate-y-1/2 z-[600] pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Support Assistant"
          className={`relative w-14 h-16 md:w-16 md:h-20 rounded-l-[1.8rem] rounded-r-none flex items-center justify-center overflow-hidden group shadow-[-10px_0_40px_rgba(0,144,255,0.15)] transition-all duration-500 border-y border-l ${
            isOpen 
            ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' 
            : 'bg-white/90 dark:bg-[#0d0d10]/90 backdrop-blur-md border-black/5 dark:border-white/10'
          }`}
        >
          {!isOpen && (
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#0090ff_360deg)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity"></div>
          )}
          <div className={`relative flex flex-col items-center justify-center transition-all duration-500 z-10 ${
            isOpen ? 'text-white dark:text-black' : 'text-brand-blue'
          }`}>
            {isOpen ? (
              <X size={24} />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <img src={logoUrl} alt="Skyverses Assistant" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
                <span className="text-[7px] font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100">AI</span>
              </div>
            )}
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && !isFull && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed top-1/2 -translate-y-1/2 right-4 md:right-8 w-[calc(100vw-2rem)] md:w-[400px] h-[600px] max-h-[85dvh] flex flex-col overflow-hidden bg-white dark:bg-[#0c0c0e] border border-black/5 dark:border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.2)] rounded-[2rem] md:rounded-lg z-[700]"
          >
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#111114] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center p-1 bg-brand-blue/5 border border-brand-blue/10">
                  <img src={logoUrl} alt="Skyverses" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Skyverses AI</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIsFull(true); setIsOpen(false); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-400 hover:text-brand-blue transition-all"><Maximize2 size={16} /></button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"><ChevronDown size={20} className="text-gray-400" /></button>
              </div>
            </div>

            <div className="flex-grow p-5 md:p-6 overflow-y-auto bg-white dark:bg-[#0c0c0e] flex flex-col gap-6 no-scrollbar relative">
              {messages.length === 0 && (
                <div className="flex gap-3 items-start relative z-10">
                  <div className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0"><Sparkles size={14} /></div>
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-4 rounded-xl rounded-tl-none shadow-sm max-w-[85%]">
                    <p className="text-[12px] font-medium leading-relaxed text-slate-600 dark:text-slate-300 italic">{t('chat.welcome')}</p>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 items-start relative z-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' : 'bg-brand-blue/5 dark:bg-brand-blue/10 text-brand-blue border-brand-blue/10'}`}>{msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}</div>
                  <div className={`space-y-2 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 rounded-xl shadow-sm border ${msg.role === 'user' ? 'bg-brand-blue text-white border-transparent text-left rounded-tr-none' : 'bg-gray-50 dark:bg-white/[0.02] border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-tl-none'}`}>
                      {msg.parts.map((part, pIdx) => (
                        <div key={pIdx}>
                          {part.type === 'image' && <img src={part.content} className="w-full rounded-lg mb-3 border border-white/10" alt="" />}
                          {part.type === 'text' && <p className="text-[12px] font-bold leading-relaxed whitespace-pre-wrap">{part.content}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 items-start animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue"><Loader2 size={12} className="animate-spin" /></div>
                  <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl rounded-tl-none w-16">
                    <div className="flex gap-1.5 justify-center">
                      <div className="w-1 h-1 bg-brand-blue/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-brand-blue/40 rounded-full animate-bounce delay-75" />
                      <div className="w-1 h-1 bg-brand-blue/40 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 md:p-6 border-t border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#111114] shrink-0 space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center gap-3">
                <div className="relative flex-grow">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('chat.placeholder')} disabled={isLoading} className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl pl-5 pr-12 py-4 text-[12px] font-bold focus:ring-1 focus:ring-brand-blue outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700 text-black dark:text-white shadow-sm" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors"><Paperclip size={18} /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <button type="submit" className="w-14 h-14 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:brightness-110 shadow-lg disabled:opacity-30" disabled={(!input.trim() && !selectedFile) || isLoading}>{isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} fill="currentColor" />}</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FullChatModal 
        isOpen={isFull} 
        onClose={() => setIsFull(false)}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
      />
    </>
  );
};

export default AISupportChat;
