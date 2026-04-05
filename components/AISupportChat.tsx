
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Bot, 
  Loader2, ChevronDown, User as UserIcon,
  Sparkles, Paperclip, Maximize2,
  MessageCircle, Copy, Terminal, Download, LogIn
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import FullChatModal from './FullChatModal';
import { systemConfigApi } from '../apis/config';

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
  const { user, isAuthenticated, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [input, setInput] = useState('');
  const STORAGE_KEY = 'skyverses_ai_chat_history';
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cmsContext, setCmsContext] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoUrl = "/assets/skyverses-logo.png";

  // Rate limiting: max 10 messages per 60s
  const RATE_LIMIT = 10;
  const RATE_WINDOW = 60; // seconds
  const sendTimestamps = useRef<number[]>([]);
  const [rateCooldown, setRateCooldown] = useState(0);

  // Persist messages to localStorage (keep last 50)
  useEffect(() => {
    try {
      const toSave = messages.slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch { /* quota exceeded, ignore */ }
  }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await systemConfigApi.getSystemConfig();
        if (res?.success && res.data?.aiSupportContext) {
          setCmsContext(res.data.aiSupportContext);
        }
      } catch (err) { console.error("Failed to load AI config", err); }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (isOpen || isFull) scrollToBottom();
  }, [messages, isOpen, isFull, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

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
      if (file.size > 5 * 1024 * 1024) { alert("File size exceeds 5MB limit."); return; }
      const base64 = await fileToBase64(file);
      setSelectedFile({ data: base64.split(',')[1], mimeType: file.type, preview: base64 });
    }
  };

  const handleClearChat = () => { setMessages([]); setSelectedFile(null); setInput(''); localStorage.removeItem(STORAGE_KEY); };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ═══ Export chat to Markdown ═══
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const lines: string[] = [`# Skyverses AI Chat — ${new Date().toLocaleDateString()}\n`];
    for (const msg of messages) {
      const label = msg.role === 'user' ? '👤 You' : '🤖 Skyverses AI';
      lines.push(`## ${label} (${msg.timestamp})`);
      for (const p of msg.parts) {
        if (p.type === 'text') lines.push(p.content);
        if (p.type === 'image') lines.push('[Image Attachment]');
      }
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skyverses-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (customText?: string, customFile?: {data: string, mimeType: string}) => {
    // Login gate
    if (!isAuthenticated) {
      login();
      return;
    }

    const userText = customText || input.trim();
    const currentFile = customFile || selectedFile;
    if ((!userText && !currentFile) || isLoading) return;

    // Rate limit check
    const now = Date.now();
    sendTimestamps.current = sendTimestamps.current.filter(t => now - t < RATE_WINDOW * 1000);
    if (sendTimestamps.current.length >= RATE_LIMIT) {
      const oldest = sendTimestamps.current[0];
      const waitSec = Math.ceil((oldest + RATE_WINDOW * 1000 - now) / 1000);
      setRateCooldown(waitSec);
      const timer = setInterval(() => {
        setRateCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
      }, 1000);
      return;
    }
    sendTimestamps.current.push(now);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userParts: ChatContentPart[] = [];
    if (userText) userParts.push({ type: 'text', content: userText });
    if (currentFile) {
      const previewUrl = currentFile.data.startsWith('data:') ? currentFile.data : `data:${currentFile.mimeType};base64,${currentFile.data}`;
      userParts.push({ type: 'image', content: previewUrl });
    }

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', parts: userParts, timestamp }]);
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    // Bot message placeholder for streaming
    const botMsgId = (Date.now() + 1).toString();

    try {
      // Build messages array (OpenAI format)
      const SYSTEM_CONTEXT = `You are **Skyverses AI Assistant** — the official support chatbot for Skyverses Marketplace (https://skyverses.io).
You help users navigate the platform, answer questions about products, pricing, credits, and troubleshoot issues.
Always respond in the SAME LANGUAGE the user uses (Vietnamese, English, Korean, Japanese, etc.).
Format output using Markdown. Be concise, professional, and friendly.

## \ud83c\udfe2 ABOUT SKYVERSES
Skyverses is an AI Marketplace platform with 30+ AI applications and 50+ AI models. It offers tools for video generation, image generation, voice/music creation, and automation — all in one place, at ~70% lower cost than competitors.

## \ud83c\udfac AI VIDEO GENERATION
- **Supported Models**: VEO3, Kling 2.1/2.0/1.6, Wan2.1 (1.3B/14B), Hailuo, Sora, Genyu, Pika
- **Features**: Text-to-Video, Image-to-Video, Start+End Frame, Video Extend, Character Sync (face swap in video)
- **Engines**: veo, gommo, kling, fxlab, wan, fxflow, grok
- **Route**: /product/ai-video-generator → AI Video Studio

## \ud83d\uddbc AI IMAGE GENERATION
- **Supported Models**: Gemini, Midjourney, Flux, Stable Diffusion, DALL-E, Leonardo, Grok
- **Special**: Users get **100 FREE images** on registration
- **Route**: /product/ai-image-generator → AI Image Studio

## \ud83d\udcb0 CREDIT SYSTEM
- Skyverses sử dụng hệ thống **Credits** để thanh toán.
- **Free perks**: 100 ảnh miễn phí khi đăng ký mới, daily claim.
- Route: /credits, /usage

## \ud83d\udcde SUPPORT CHANNELS
- **Telegram**: https://t.me/nhomhotrokythuat
- **Zalo**: https://zalo.me/g/brzhpkvbxtnvicdtgpkv
- **Email**: support@skyverses.com

## ⚠️ RULES
1. Luôn trả lời bằng ngôn ngữ người dùng sử dụng.
2. Không bịa thông tin. Nếu không biết, hướng dẫn liên hệ Telegram/Zalo.
3. Khi user hỏi về giá, luôn nhắc họ kiểm tra trang /credits.
4. Khi user gặp lỗi, hỏi thêm chi tiết.
5. Khuyến khích user tham gia nhóm Telegram.`;

      // Use CMS context if available, otherwise use hardcoded fallback
      const finalContext = cmsContext || SYSTEM_CONTEXT;

      const apiMessages: any[] = [
        { role: 'system', content: finalContext }
      ];

      // Add conversation history (last 20 messages for context)
      const history = messages.slice(-20);
      for (const msg of history) {
        const textParts = msg.parts.filter(p => p.type === 'text').map(p => p.content).join('\n');
        if (textParts) {
          apiMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: textParts });
        }
      }

      // Add current user message
      if (currentFile) {
        const imgData = currentFile.data.includes('base64,') ? currentFile.data.split('base64,')[1] : currentFile.data;
        apiMessages.push({
          role: 'user',
          content: [
            ...(userText ? [{ type: 'text', text: userText }] : []),
            { type: 'image_url', image_url: { url: `data:${currentFile.mimeType};base64,${imgData}` } }
          ]
        });
      } else {
        apiMessages.push({ role: 'user', content: userText });
      }

      // ═══ STREAMING via backend proxy (avoids CORS) ═══
      const token = localStorage.getItem('skyverses_auth_token');
      const API_BASE = import.meta.env.VITE_API_URL || 'https://api.skyverses.com';
      
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: apiMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error?.message || errData?.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const botText = data?.choices?.[0]?.message?.content || 'Không nhận được phản hồi. Vui lòng thử lại.';

      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', parts: [{ type: 'text', content: botText }], timestamp }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', parts: [{ type: 'text', content: `Lỗi: ${error?.message || 'Hệ thống đang bận. Vui lòng thử lại.'}` }], timestamp }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══ Render markdown-lite for bot messages ═══
  const renderBotText = (text: string) => {
    const blocks = text.split(/(```[\s\S]*?```)/g);
    return blocks.map((block, idx) => {
      if (block.startsWith('```')) {
        const match = block.match(/```(\w*)\n?([\s\S]*?)```/);
        const lang = match?.[1] || 'code';
        const code = match?.[2] || '';
        return (
          <div key={idx} className="my-2 rounded-lg overflow-hidden border border-black/[0.06] dark:border-white/[0.06] bg-[#f8f9fa] dark:bg-[#0e0e12]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[8px] font-bold uppercase text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                <Terminal size={9} /> {lang}
              </span>
              <button onClick={() => handleCopy(code, `code-${idx}`)} className="text-[8px] font-bold text-slate-400 hover:text-brand-blue transition-colors flex items-center gap-1">
                <Copy size={9} /> Copy
              </button>
            </div>
            <pre className="p-3 overflow-x-auto font-mono text-[10px] leading-relaxed text-slate-700 dark:text-gray-300 max-h-[200px]">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      let html = block
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/^\d+\. (.*)$/gm, '<li class="ml-4 list-decimal text-[11px] leading-relaxed mb-1">$1</li>')
        .replace(/^\- (.*)$/gm, '<li class="ml-4 list-disc text-[11px] leading-relaxed mb-1">$1</li>');

      return <div key={idx} className="text-[11px] leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  const QUICK_PROMPTS = [
    { emoji: '💡', text: 'Tư vấn chọn model AI phù hợp nhu cầu' },
    { emoji: '🎬', text: 'Hướng dẫn tạo video AI chất lượng cao' },
    { emoji: '🖼️', text: 'Cách viết prompt tạo ảnh đẹp' },
    { emoji: '💰', text: 'Bảng giá credits và các gói dịch vụ' },
  ];

  return (
    <>
      {/* ═══════════ FAB BUTTON ═══════════ */}
      <div className="fixed bottom-[5.5rem] right-[1.65rem] z-[600]">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Support Assistant"
          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-2xl rotate-90' 
              : 'bg-white dark:bg-[#161618] text-brand-blue shadow-xl hover:shadow-2xl'
          }`}
        >
          {/* Animated border ring */}
          {!isOpen && (
            <>
              <div className="absolute -inset-[3px] rounded-2xl animate-[ai-orbit_3s_linear_infinite]" style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #0090ff 300deg, #a855f7 330deg, transparent 360deg)',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
              }} />
              <div className="absolute inset-0 rounded-2xl bg-brand-blue/10 blur-lg animate-pulse" />
            </>
          )}
          {/* Border */}
          <div className={`absolute inset-0 rounded-2xl border ${isOpen ? 'border-transparent' : 'border-black/[0.06] dark:border-white/[0.08]'}`} />
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Bot size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Notification dot */}
          {!isOpen && messages.length === 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-blue rounded-full border-2 border-white dark:border-[#161618] animate-pulse" />
          )}
        </motion.button>
        <style>{`@keyframes ai-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* ═══════════ MINI CHAT MODAL ═══════════ */}
      <AnimatePresence>
        {isOpen && !isFull && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-[9rem] right-6 md:right-8 w-[calc(100vw-3rem)] md:w-[420px] h-[560px] max-h-[75dvh] flex flex-col overflow-hidden z-[700] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.5)]"
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/95 dark:bg-[#0d0d10]/95 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] rounded-2xl" />

            {/* ─── HEADER ─── */}
            <div className="relative z-10 px-5 py-4 flex items-center justify-between shrink-0 border-b border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 flex items-center justify-center p-1.5">
                    <img src={logoUrl} alt="S" className="w-full h-full object-contain" />
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0d0d10]" />
                </div>
                <div>
                  <h3 className="text-[12px] font-bold text-slate-900 dark:text-white tracking-tight">Skyverses AI</h3>
                  <p className="text-[9px] font-medium text-emerald-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block animate-pulse" /> Online · Claude 4.5
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={handleExportChat}
                    className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all" title="Export Chat">
                    <Download size={13} />
                  </button>
                )}
                <button onClick={() => { setIsFull(true); setIsOpen(false); }} 
                  className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all" title="Expand">
                  <Maximize2 size={14} />
                </button>
                <button onClick={() => setIsOpen(false)} 
                  className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* ─── MESSAGES AREA ─── */}
            <div className="relative z-10 flex-grow overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-4">

              {/* Welcome state */}
              {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 py-4">
                  {/* Logo + greeting */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-blue/10 blur-[20px] rounded-full animate-pulse" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/[0.04] dark:to-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center shadow-lg p-2.5">
                      <img src={logoUrl} alt="Skyverses" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="text-center space-y-1.5">
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Xin chào! 👋</h4>
                    <p className="text-[11px] text-slate-500 dark:text-gray-500 font-medium max-w-[260px] leading-relaxed">
                      {t('chat.welcome')}
                    </p>
                  </div>

                  {/* Quick prompts */}
                  <div className="w-full space-y-1.5 px-1">
                    {QUICK_PROMPTS.map((p, i) => (
                      <button key={i} onClick={() => handleSendMessage(p.text)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20 hover:bg-brand-blue/[0.03] transition-all text-left group">
                        <span className="text-sm shrink-0">{p.emoji}</span>
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-snug">{p.text}</span>
                      </button>
                    ))}
                  </div>

                  {/* Support channels */}
                  <div className="w-full px-1 pt-1">
                    <div className="flex gap-2">
                      <a href="https://t.me/nhomhotrokythuat" target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#2AABEE]/[0.06] border border-[#2AABEE]/12 hover:border-[#2AABEE]/30 transition-all group">
                        <Send size={11} className="text-[#2AABEE]" />
                        <span className="text-[9px] font-bold text-[#2AABEE]">Telegram</span>
                      </a>
                      <a href="https://zalo.me/g/brzhpkvbxtnvicdtgpkv" target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0068FF]/[0.06] border border-[#0068FF]/12 hover:border-[#0068FF]/30 transition-all group">
                        <MessageCircle size={11} className="text-[#0068FF]" />
                        <span className="text-[9px] font-bold text-[#0068FF]">Zalo</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 dark:bg-white/90 text-white dark:text-black'
                      : 'bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 p-1'
                  }`}>
                    {msg.role === 'user' 
                      ? <UserIcon size={12} /> 
                      : <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] group ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-slate-800 dark:bg-white/90 text-white dark:text-black rounded-tr-lg'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] text-slate-700 dark:text-gray-200 rounded-tl-lg'
                    }`}>
                      {msg.parts.map((part, pIdx) => (
                        <div key={pIdx}>
                          {part.type === 'image' && <img src={part.content} className="w-full rounded-lg mb-2 border border-white/10" alt="" />}
                          {part.type === 'text' && (
                            msg.role === 'bot' 
                              ? renderBotText(part.content) 
                              : <p className="text-[11px] font-medium leading-relaxed whitespace-pre-wrap">{part.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Actions */}
                    {msg.role === 'bot' && (
                      <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleCopy(msg.parts.map(p => p.content).join('\n'), msg.id)} 
                          className="flex items-center gap-1 text-[8px] font-semibold text-slate-400 hover:text-brand-blue transition-colors">
                          <Copy size={9} /> {copiedId === msg.id ? 'Copied!' : 'Copy'}
                        </button>
                        <span className="text-[8px] text-slate-300 dark:text-gray-700">{msg.timestamp}</span>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <p className="text-[8px] text-slate-400 dark:text-gray-600 mt-1 mr-1">{msg.timestamp}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 flex items-center justify-center p-1 shrink-0">
                    <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="px-4 py-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl rounded-tl-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-brand-blue/40 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-brand-blue/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-1.5 h-1.5 bg-brand-blue/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                      <span className="text-[9px] font-medium text-slate-400 dark:text-gray-500">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ─── INPUT BAR ─── */}
            <div className="relative z-10 px-4 pb-4 pt-2 shrink-0">
              {/* File preview */}
              <AnimatePresence>
                {selectedFile && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2.5 mb-2 px-3 py-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
                    <img src={selectedFile.preview} className="w-10 h-10 rounded-lg object-cover border border-black/[0.06] dark:border-white/[0.06]" alt="" />
                    <p className="text-[9px] font-medium text-slate-400 dark:text-gray-500 flex-1">Ảnh đính kèm</p>
                    <button onClick={() => setSelectedFile(null)} className="w-5 h-5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-all">
                      <X size={10} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Support mini links — persistent when messages exist */}
              {messages.length > 0 && (
                <div className="flex items-center justify-center gap-3 mb-2">
                  <a href="https://t.me/nhomhotrokythuat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[8px] font-semibold text-[#2AABEE] hover:underline">
                    <Send size={8} /> Telegram
                  </a>
                  <span className="text-slate-300 dark:text-gray-700 text-[8px]">·</span>
                  <a href="https://zalo.me/g/brzhpkvbxtnvicdtgpkv" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[8px] font-semibold text-[#0068FF] hover:underline">
                    <MessageCircle size={8} /> Zalo
                  </a>
                </div>
              )}

              {/* Input pill */}
              {/* Login gate overlay */}
              {!isAuthenticated && (
                <div className="mb-3 px-4 py-3 bg-brand-blue/[0.04] border border-brand-blue/10 rounded-xl flex items-center gap-3">
                  <LogIn size={14} className="text-brand-blue shrink-0" />
                  <p className="text-[10px] font-medium text-slate-600 dark:text-gray-400 flex-1">Đăng nhập để bắt đầu chat với AI</p>
                  <button onClick={login} className="px-3 py-1.5 bg-brand-blue text-white text-[9px] font-bold uppercase rounded-lg hover:brightness-110 transition-all">Đăng nhập</button>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-1.5 pl-2 focus-within:border-brand-blue/30 transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} 
                  className="w-8 h-8 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all shrink-0 hover:scale-105 active:scale-95">
                  <Paperclip size={14} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.csv" onChange={handleFileChange} />
                <input 
                  ref={inputRef}
                  type="text" value={input} onChange={(e) => setInput(e.target.value)} 
                  placeholder={isAuthenticated ? t('chat.placeholder') : 'Vui lòng đăng nhập...'} disabled={isLoading || !isAuthenticated}
                  className="flex-grow bg-transparent border-none py-2.5 px-2 text-[12px] font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-900 dark:text-white" 
                />
                <button type="submit"
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    input.trim() || selectedFile 
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20 hover:brightness-110 active:scale-95' 
                      : 'bg-black/[0.03] dark:bg-white/[0.03] text-slate-300 dark:text-gray-700'
                  }`}>
                  {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </form>

              {rateCooldown > 0 ? (
                <p className="text-center text-[8px] font-semibold text-amber-500 mt-2 animate-pulse">
                  ⏳ Bạn đang gửi quá nhanh. Vui lòng chờ {rateCooldown}s...
                </p>
              ) : (
                <p className="text-center text-[7px] font-medium text-slate-300 dark:text-gray-700 mt-2">
                  Powered by Claude · <span className="text-brand-blue">Skyverses</span>
                </p>
              )}
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
