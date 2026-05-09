
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Bot,
  Loader2, ChevronDown, User as UserIcon,
  Sparkles, Paperclip, Maximize2,
  MessageCircle, Copy, Terminal, Download, LogIn, RotateCcw, Trash2, AlertTriangle,
  WifiOff, History, Plus, ChevronRight,
  Gift, Headphones, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import FullChatModal from './FullChatModal';
import { systemConfigApi } from '../apis/config';
import { aiChatOnce, type ChatMessage as AIChatMessage } from '../apis/aiChat';

export interface ChatContentPart {
  type: 'text' | 'image' | 'code' | 'table';
  content: string;
  language?: string;
}

export interface UIChatMessage {
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
  const SESSIONS_KEY = 'skyverses_ai_sessions';
  const ACTIVE_SESSION_KEY = 'skyverses_ai_active_session';

  // Multi-session management
  interface ChatSession { id: string; title: string; messages: UIChatMessage[]; updatedAt: number; }
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch { return []; }
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || Date.now().toString();
  });

  const [messages, setMessages] = useState<UIChatMessage[]>(() => {
    try {
      // Try loading from active session first
      const allSessions: ChatSession[] = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
      const active = allSessions.find(s => s.id === localStorage.getItem(ACTIVE_SESSION_KEY));
      if (active) return active.messages;
      // Fallback to legacy single-session
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cmsContext, setCmsContext] = useState<string>('');
  const [typingMsgId, setTypingMsgId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showInviteCard, setShowInviteCard] = useState(false);
  const [inviteSlide, setInviteSlide] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const typingRef = useRef<{ fullText: string; index: number; timer: ReturnType<typeof setTimeout> | null }>({ fullText: '', index: 0, timer: null });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoUrl = "/assets/skyverses-logo.png";

  // Rate limiting: max 10 messages per 60s
  const RATE_LIMIT = 10;
  const RATE_WINDOW = 60; // seconds
  const sendTimestamps = useRef<number[]>([]);
  const [rateCooldown, setRateCooldown] = useState(0);

  // Persist messages to session + localStorage
  useEffect(() => {
    try {
      const toSave = messages.slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      // Update active session
      setSessions(prev => {
        const title = messages.find(m => m.role === 'user')?.parts.find(p => p.type === 'text')?.content.slice(0, 30) || 'New Chat';
        const updated = prev.filter(s => s.id !== activeSessionId);
        if (messages.length > 0) {
          updated.unshift({ id: activeSessionId, title, messages: toSave, updatedAt: Date.now() });
        }
        const capped = updated.slice(0, 10); // keep max 10 sessions
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(capped));
        return capped;
      });
    } catch { /* quota exceeded */ }
  }, [messages, activeSessionId]);

  // Online/Offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isFull) { setIsOpen(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isFull]);

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

  const handleClearChat = () => { setShowClearConfirm(true); };
  const confirmClearChat = () => { 
    setMessages([]); setSelectedFile(null); setInput(''); setSuggestedFollowUps([]);
    localStorage.removeItem(STORAGE_KEY); setShowClearConfirm(false);
  };

  // Multi-session: start new chat
  const startNewSession = () => {
    const newId = Date.now().toString();
    setActiveSessionId(newId);
    localStorage.setItem(ACTIVE_SESSION_KEY, newId);
    setMessages([]); setInput(''); setSelectedFile(null); setSuggestedFollowUps([]);
  };

  // Multi-session: switch to existing session
  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
      setMessages(session.messages);
      setSuggestedFollowUps([]);
    }
  };

  // Generate follow-up suggestions based on last bot message
  const generateFollowUps = useCallback((botText: string) => {
    const followUps: string[] = [];
    if (botText.includes('credit') || botText.includes('Credits') || botText.includes('giá')) {
      followUps.push('Cách nạp credits?', 'Có ưu đãi gì không?');
    } else if (botText.includes('video') || botText.includes('Video')) {
      followUps.push('So sánh các model video', 'Giá tạo video bao nhiêu?');
    } else if (botText.includes('image') || botText.includes('ảnh') || botText.includes('Image')) {
      followUps.push('Viết prompt ảnh đẹp', 'Model nào tạo ảnh tốt nhất?');
    } else if (botText.includes('API') || botText.includes('tích hợp')) {
      followUps.push('Tài liệu API ở đâu?', 'Có SDK cho Python không?');
    } else {
      followUps.push('Cho tôi biết thêm', 'Có tính năng gì khác?');
    }
    if (followUps.length > 0) followUps.push('Liên hệ hỗ trợ');
    setSuggestedFollowUps(followUps.slice(0, 3));
  }, []);

  // ═══ Sound notification ═══
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch { /* silent fail */ }
  }, []);

  // ═══ Typewriter effect ═══
  const startTypewriter = useCallback((msgId: string, fullText: string) => {
    setTypingMsgId(msgId);
    setTypingText('');
    typingRef.current = { fullText, index: 0, timer: null };
    const tick = () => {
      const ref = typingRef.current;
      if (ref.index >= ref.fullText.length) {
        setTypingMsgId(null);
        return;
      }
      // Speed: 2-4 chars per tick for natural feel
      const charsPerTick = ref.fullText.length > 500 ? 4 : ref.fullText.length > 200 ? 3 : 2;
      ref.index = Math.min(ref.index + charsPerTick, ref.fullText.length);
      setTypingText(ref.fullText.slice(0, ref.index));
      ref.timer = setTimeout(tick, 12);
    };
    tick();
  }, []);

  // ═══ Retry failed message ═══
  const handleRetry = useCallback((msgId: string) => {
    // Find the user message right before this bot error
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx <= 0) return;
    const prevUserMsg = messages[idx - 1];
    if (prevUserMsg.role !== 'user') return;
    // Remove error message
    setMessages(prev => prev.filter(m => m.id !== msgId));
    // Re-send
    const text = prevUserMsg.parts.find(p => p.type === 'text')?.content || '';
    const img = prevUserMsg.parts.find(p => p.type === 'image');
    if (text || img) {
      handleSendMessage(text, img ? { data: img.content, mimeType: 'image/png' } : undefined);
    }
  }, [messages]);

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
    setSuggestedFollowUps([]); // Clear follow-ups when user sends

    // Bot message placeholder for streaming
    const botMsgId = (Date.now() + 1).toString();

    try {
      // Build messages array (OpenAI format)
      const SYSTEM_CONTEXT = `You are **Skyverses AI Assistant** — the official support chatbot for Skyverses Marketplace (https://skyverses.io).
You help users navigate the platform, answer questions about products, pricing, credits, and troubleshoot issues.
Always respond in the SAME LANGUAGE the user uses (Vietnamese, English, Korean, Japanese, etc.).
Format output using Markdown. Be concise, professional, and friendly.

## 🏢 ABOUT SKYVERSES
Skyverses is an AI Marketplace platform with 30+ AI applications and 50+ AI models. It offers tools for video generation, image generation, voice/music creation, and automation — all in one place, at ~70% lower cost than competitors.

## 🎬 AI VIDEO GENERATION
- **Supported Models**: VEO3, Kling 2.1/2.0/1.6, Wan2.1 (1.3B/14B), Hailuo, Sora, Genyu, Pika
- **Features**: Text-to-Video, Image-to-Video, Start+End Frame, Video Extend, Character Sync (face swap in video)
- **Engines**: veo, gommo, kling, fxlab, wan, fxflow, grok
- **Route**: /product/ai-video-generator → AI Video Studio

## 🖼 AI IMAGE GENERATION
- **Supported Models**: Gemini, Midjourney, Flux, Stable Diffusion, DALL-E, Leonardo, Grok
- **Special**: Users get **99 FREE images** on registration
- **Route**: /product/ai-image-generator → AI Image Studio

## 💰 CREDIT SYSTEM
- Skyverses sử dụng hệ thống **Credits** để thanh toán.
- **Free perks**: 99 ảnh miễn phí khi đăng ký mới, daily claim.
- Route: /credits, /usage

## 📞 SUPPORT CHANNELS
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

      const apiMessages: AIChatMessage[] = [
        { role: 'system', content: finalContext }
      ];

      // Add conversation history (last 20 messages for context)
      const history = messages.slice(-20);
      for (const msg of history) {
        const textParts = msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.content).join('\n');
        if (textParts) {
          apiMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: textParts });
        }
      }

      // Add current user message (supports multipart image+text)
      if (currentFile) {
        const imgData = currentFile.data.includes('base64,') ? currentFile.data.split('base64,')[1] : currentFile.data;
        apiMessages.push({
          role: 'user',
          content: [
            ...(userText ? [{ type: 'text' as const, text: userText }] : []),
            { type: 'image_url' as const, image_url: { url: `data:${currentFile.mimeType};base64,${imgData}` } }
          ]
        });
      } else {
        apiMessages.push({ role: 'user', content: userText });
      }

      // ═══ Gọi API qua common aiChatOnce ═══
      const botText = await aiChatOnce(apiMessages) || 'Không nhận được phản hồi. Vui lòng thử lại.';

      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', parts: [{ type: 'text', content: botText }], timestamp }]);
      startTypewriter(botMsgId, botText);
      playNotificationSound();
      generateFollowUps(botText);
    } catch (error: any) {
      console.error("AI Error:", error);
      const errText = `⚠️ ${error?.message || 'Hệ thống đang bận. Vui lòng thử lại.'}`;
      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', parts: [{ type: 'text', content: errText }], timestamp }]);
      playNotificationSound();
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
          <div key={idx} className="my-2 rounded-lg overflow-hidden border border-black/[0.06] dark:border-white/[0.06] bg-[var(--atlas-bg-panel-hover)] dark:bg-[var(--atlas-bg-panel)]">
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
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded text-[10px] font-mono text-brand-blue">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-brand-blue underline underline-offset-2 hover:brightness-110">$1</a>')
        .replace(/^### (.*)$/gm, '<h4 class="text-[11px] font-bold text-slate-800 dark:text-white mt-2 mb-1">$1</h4>')
        .replace(/^## (.*)$/gm, '<h3 class="text-[12px] font-bold text-slate-800 dark:text-white mt-3 mb-1">$1</h3>')
        .replace(/^\d+\. (.*)$/gm, '<li class="ml-4 list-decimal text-[11px] leading-relaxed mb-1">$1</li>')
        .replace(/^\- (.*)$/gm, '<li class="ml-4 list-disc text-[11px] leading-relaxed mb-1">$1</li>');

      return <div key={idx} className="text-[11px] leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  // ═══ Invite card slides ═══
  const INVITE_SLIDES = [
    { title: 'Share Skyverses', subtitle: 'Invite a Friend · Earn $5', cta: 'Invite & Earn $5', to: '/referral' },
    { title: 'Free 99 Images', subtitle: 'Sign up and get 99 AI images free', cta: 'Start Creating', to: '/product/ai-image-generator' },
    { title: 'AI Video Studio', subtitle: 'Create stunning videos with 10+ models', cta: 'Try Video AI', to: '/product/ai-video-generator' },
  ];

  // Auto-rotate invite slides
  useEffect(() => {
    if (!showInviteCard) return;
    const timer = setInterval(() => {
      setInviteSlide(prev => (prev + 1) % INVITE_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [showInviteCard]);

  const QUICK_PROMPTS = [
    { emoji: '💡', text: 'Tư vấn chọn model AI phù hợp nhu cầu' },
    { emoji: '🎬', text: 'Hướng dẫn tạo video AI chất lượng cao' },
    { emoji: '🖼️', text: 'Cách viết prompt tạo ảnh đẹp' },
    { emoji: '💰', text: 'Bảng giá credits và các gói dịch vụ' },
  ];

  return (
    <>
      {/* ═══════════ FLOATING DOCK (vertical icon stack) ═══════════ */}
      <div className="fixed bottom-6 right-5 z-[600] flex flex-col items-center gap-2.5">
        {/* Gift / Referral — toggles invite card */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => { setShowInviteCard(v => !v); setIsOpen(false); }}
            className={`group relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
              showInviteCard
                ? 'bg-[#7036F0] border-[#7036F0] text-white'
                : 'bg-white dark:bg-[#1a1a1e] border-black/[0.06] dark:border-white/[0.08]'
            }`}
            title="Referral & Rewards"
          >
            <Gift size={17} className={showInviteCard ? 'text-white' : 'text-[#7036F0]'} />
            <span className="pointer-events-none absolute right-full mr-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              Referral
            </span>
          </button>
        </motion.div>

        {/* ═══ Invite Card Popup ═══ */}
        <AnimatePresence>
          {showInviteCard && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="absolute right-[3.5rem] top-0 w-[280px] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setShowInviteCard(false)}
                className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-all"
              >
                <X size={12} />
              </button>

              {/* Slide content */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={inviteSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3 }}
                    className="relative px-5 pt-6 pb-5"
                    style={{
                      background: 'linear-gradient(135deg, #7036F0 0%, #9333EA 40%, #7C3AED 100%)',
                    }}
                  >
                    {/* Confetti decorations */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-3 left-6 w-2 h-2 bg-yellow-300/60 rounded-sm rotate-12" />
                      <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-pink-300/50 rounded-full" />
                      <div className="absolute bottom-4 left-10 w-1 h-3 bg-green-300/40 rounded-full rotate-45" />
                      <div className="absolute top-5 left-[45%] w-1.5 h-1.5 bg-blue-300/50 rounded-sm -rotate-12" />
                      <div className="absolute bottom-6 right-8 w-2 h-1 bg-orange-300/40 rounded-full rotate-[30deg]" />
                      <div className="absolute top-12 left-3 w-1 h-1 bg-cyan-300/50 rounded-full" />
                      <div className="absolute bottom-3 left-[55%] w-1.5 h-1 bg-red-300/40 rounded-sm rotate-[60deg]" />
                    </div>

                    {/* Text */}
                    <h4 className="relative z-10 text-[18px] font-extrabold text-white leading-tight tracking-tight">
                      {INVITE_SLIDES[inviteSlide].title}
                    </h4>
                    <p className="relative z-10 text-[13px] text-white/80 font-medium mt-1.5">
                      {INVITE_SLIDES[inviteSlide].subtitle}
                    </p>

                    {/* CTA */}
                    <Link
                      to={INVITE_SLIDES[inviteSlide].to}
                      onClick={() => setShowInviteCard(false)}
                      className="relative z-10 inline-flex items-center gap-1.5 mt-4 text-[13px] font-bold text-white hover:underline underline-offset-2 transition-all"
                    >
                      {INVITE_SLIDES[inviteSlide].cta}
                      <ChevronRight size={14} />
                    </Link>

                    {/* Dot indicators */}
                    <div className="relative z-10 flex items-center gap-1.5 mt-4">
                      {INVITE_SLIDES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setInviteSlide(i)}
                          className={`rounded-full transition-all duration-300 ${
                            i === inviteSlide
                              ? 'w-5 h-2 bg-white'
                              : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discord */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <a
            href="https://discord.gg/skyverses"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-[#1a1a1e] shadow-lg hover:shadow-xl border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 hover:scale-105 active:scale-95"
            title="Discord"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[17px] h-[17px] text-[#5865F2] group-hover:text-[#7289DA] transition-colors">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="pointer-events-none absolute right-full mr-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              Discord
            </span>
          </a>
        </motion.div>

        {/* Support Chat (main FAB) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setIsOpen(!isOpen); setShowInviteCard(false); }}
            aria-label="Support Assistant"
            className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isOpen
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-2xl'
                : 'bg-white dark:bg-[#1a1a1e] shadow-lg hover:shadow-xl border border-black/[0.06] dark:border-white/[0.08]'
            }`}
            title="AI Support"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={17} />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Headphones size={17} className="text-brand-blue" />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Notification dot */}
            {!isOpen && messages.length === 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1a1e] animate-pulse" />
            )}
            <span className="pointer-events-none absolute right-full mr-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              Support
            </span>
          </motion.button>
        </motion.div>

        {/* Docs */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <a
            href="https://insights.skyverses.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-[#1a1a1e] shadow-lg hover:shadow-xl border border-black/[0.06] dark:border-white/[0.08] transition-all duration-200 hover:scale-105 active:scale-95"
            title="Documentation"
          >
            <FileText size={17} className="text-slate-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors" />
            <span className="pointer-events-none absolute right-full mr-2.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              Docs
            </span>
          </a>
        </motion.div>
      </div>

      {/* ═══════════ MINI CHAT MODAL ═══════════ */}
      <AnimatePresence>
        {isOpen && !isFull && (
          <>
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[690] bg-black/20 dark:bg-black/40 backdrop-blur-[2px]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed bottom-6 right-[4.5rem] md:right-[4.75rem] w-[calc(100vw-5.5rem)] md:w-[420px] h-[560px] max-h-[75dvh] flex flex-col overflow-hidden z-[700] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.5)]"
            >
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/95 dark:bg-[var(--atlas-bg-panel)]/95 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] rounded-2xl" />

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
                {messages.length > 0 && (
                  <button onClick={handleClearChat}
                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all" title="Clear Chat">
                    <Trash2 size={13} />
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

            {/* Session switcher bar */}
            {sessions.length > 1 && (
              <div className="relative z-10 px-3 py-2 flex items-center gap-1.5 border-b border-black/[0.04] dark:border-white/[0.04] overflow-x-auto no-scrollbar shrink-0">
                <button onClick={startNewSession}
                  className="shrink-0 w-6 h-6 rounded-md bg-brand-blue/10 text-brand-blue flex items-center justify-center hover:bg-brand-blue/20 transition-all" title="New Chat">
                  <Plus size={12} />
                </button>
                {sessions.slice(0, 5).map(s => (
                  <button key={s.id} onClick={() => switchSession(s.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[8px] font-semibold truncate max-w-[100px] transition-all border ${
                      s.id === activeSessionId 
                        ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' 
                        : 'bg-black/[0.01] dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] text-slate-400 dark:text-gray-500 hover:border-brand-blue/15'
                    }`}>
                    {s.title.slice(0, 20)}{s.title.length > 20 ? '...' : ''}
                  </button>
                ))}
              </div>
            )}

            {/* ─── MESSAGES AREA ─── */}
            <div className="relative z-10 flex-grow overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-4">

              {/* Welcome state */}
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                  className="flex-1 flex flex-col items-center justify-center gap-5 py-4"
                >
                  {/* Logo + greeting */}
                  <motion.div className="relative"
                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}>
                    <div className="absolute inset-0 bg-brand-blue/10 blur-[20px] rounded-full animate-pulse" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/[0.04] dark:to-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center shadow-lg p-2.5">
                      <img src={logoUrl} alt="Skyverses" className="w-full h-full object-contain" />
                    </div>
                  </motion.div>
                  <motion.div className="text-center space-y-1.5"
                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Xin chào! 👋</h4>
                    <p className="text-[11px] text-slate-500 dark:text-gray-500 font-medium max-w-[260px] leading-relaxed">
                      {t('chat.welcome')}
                    </p>
                  </motion.div>

                  {/* Quick prompts */}
                  <div className="w-full space-y-1.5 px-1">
                    {QUICK_PROMPTS.map((p, i) => (
                      <motion.button key={i} onClick={() => handleSendMessage(p.text)}
                        initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.08, type: 'spring', damping: 20 }}
                        whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20 hover:bg-brand-blue/[0.03] transition-colors text-left group">
                        <span className="text-sm shrink-0">{p.emoji}</span>
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-snug">{p.text}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Support channels */}
                  <motion.div className="w-full px-1 pt-1"
                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.3 }}>
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
                  </motion.div>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((msg, idx) => (
                <motion.div key={msg.id} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 30 : -30, y: 8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 280, delay: idx === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex gap-2.5 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <motion.div 
                    initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 dark:bg-white/90 text-white dark:text-black'
                      : 'bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 p-1'
                  }`}>
                    {msg.role === 'user' 
                      ? (user?.picture 
                        ? <img src={user.picture} alt="" className="w-full h-full object-cover rounded-lg" />
                        : <UserIcon size={12} />)
                      : <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                    }
                  </motion.div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] group ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className={`px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-slate-800 dark:bg-white/90 text-white dark:text-black rounded-tr-lg'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] text-slate-700 dark:text-gray-200 rounded-tl-lg'
                    }`}>
                      {msg.parts.map((part, pIdx) => (
                        <div key={pIdx}>
                          {part.type === 'image' && <img src={part.content} className="w-full rounded-lg mb-2 border border-white/10" alt="" />}
                          {part.type === 'text' && (
                            msg.role === 'bot' 
                              ? renderBotText(typingMsgId === msg.id ? typingText : part.content) 
                              : <p className="text-[11px] font-medium leading-relaxed whitespace-pre-wrap">{part.content}</p>
                          )}
                        </div>
                      ))}
                      {/* Typing cursor */}
                      {typingMsgId === msg.id && (
                        <span className="inline-block w-[2px] h-[13px] bg-brand-blue animate-pulse ml-0.5 align-middle" />
                      )}
                    </motion.div>
                    {/* Actions */}
                    {msg.role === 'bot' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleCopy(msg.parts.map(p => p.content).join('\n'), msg.id)} 
                          className="flex items-center gap-1 text-[8px] font-semibold text-slate-400 hover:text-brand-blue transition-colors">
                          <Copy size={9} /> {copiedId === msg.id ? 'Copied!' : 'Copy'}
                        </button>
                        {/* Retry button for error messages */}
                        {msg.parts.some(p => p.content.startsWith('⚠️')) && (
                          <button onClick={() => handleRetry(msg.id)}
                            className="flex items-center gap-1 text-[8px] font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                            <RotateCcw size={9} /> Thử lại
                          </button>
                        )}
                        <span className="text-[8px] text-slate-300 dark:text-gray-700">{msg.timestamp}</span>
                      </motion.div>
                    )}
                    {msg.role === 'user' && (
                      <p className="text-[8px] text-slate-400 dark:text-gray-600 mt-1 mr-1">{msg.timestamp}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="flex gap-2.5 items-start"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue/10 to-purple-500/10 border border-brand-blue/15 flex items-center justify-center p-1 shrink-0"
                  >
                    <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                  </motion.div>
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
                </motion.div>
              )}

              {/* Follow-up suggestions */}
              <AnimatePresence>
                {suggestedFollowUps.length > 0 && !isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-1.5 mt-1"
                  >
                    {suggestedFollowUps.map((q, i) => (
                      <motion.button key={i}
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => { handleSendMessage(q); setSuggestedFollowUps([]); }}
                        className="px-3 py-1.5 text-[9px] font-semibold text-brand-blue bg-brand-blue/[0.05] border border-brand-blue/15 rounded-full hover:bg-brand-blue/10 hover:border-brand-blue/25 transition-all flex items-center gap-1"
                      >
                        {q} <ChevronRight size={10} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Offline indicator */}
            <AnimatePresence>
              {!isOnline && (
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
                  className="absolute top-14 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm">
                  <WifiOff size={12} className="text-amber-500" />
                  <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">Mất kết nối internet</span>
                </motion.div>
              )}
            </AnimatePresence>

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
          </>
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

      {/* ═══════════ CLEAR CHAT CONFIRMATION ═══════════ */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[var(--atlas-bg-panel)] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 w-[320px] shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Xóa lịch sử chat?</h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">Toàn bộ tin nhắn sẽ bị xóa và không thể khôi phục.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-semibold text-slate-600 dark:text-gray-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all">
                  Hủy
                </button>
                <button onClick={confirmClearChat}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-[11px] font-semibold hover:bg-red-600 transition-all shadow-md shadow-red-500/20">
                  Xóa tất cả
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AISupportChat;
