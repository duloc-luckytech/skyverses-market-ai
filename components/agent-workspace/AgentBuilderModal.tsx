import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles,
  Brain, Bot, Cpu, Settings2, Zap, Wand2, Eye, EyeOff,
  Loader2, Globe, Thermometer, Hash, ChevronDown,
} from 'lucide-react';
import type { CustomAgent, AgentTier } from '../../hooks/useAgentRegistry';
import { SKILL_LIBRARY } from '../../hooks/useAgentRegistry';
import { aiChatStreamViaProxy, AI_MODELS, buildSystemMessage } from '../../apis/aiCommon';

// ─── Presets ───────────────────────────────────────────────────────────────────

const EMOJI_PRESETS = [
  '🤖','🧠','🎯','💼','📊','⚙️','🔬','🎨',
  '📣','💹','⚖️','🌍','🔒','🔍','✍️','🏗️',
  '🚀','💡','🛡️','📱','🤝','💰','👥','🏢',
];

const COLOR_PRESETS = [
  '#0090ff','#8b5cf6','#10b981','#f59e0b','#06b6d4',
  '#f43f5e','#84cc16','#ec4899','#6366f1','#14b8a6',
  '#fb923c','#a855f7','#22c55e','#eab308','#3b82f6',
];

const TIER_OPTIONS: { id: AgentTier; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'orchestrator', label: 'Orchestrator', desc: 'Điều phối & delegate (CEO level)', icon: Cpu },
  { id: 'department',   label: 'Department',   desc: 'Quản lý phòng ban chuyên biệt',    icon: Bot },
  { id: 'specialist',   label: 'Specialist',   desc: 'Chuyên gia một lĩnh vực cụ thể',   icon: Brain },
];

const MODEL_OPTIONS = [
  { id: 'claude-sonnet', label: 'Claude Sonnet 4', badge: 'Fast & Balanced', color: '#f97316' },
  { id: 'claude-opus',   label: 'Claude Opus 4',   badge: 'Most Powerful',   color: '#8b5cf6' },
];

const LANGUAGE_OPTIONS = [
  { id: 'vi', label: '🇻🇳 Tiếng Việt' },
  { id: 'en', label: '🇺🇸 English' },
  { id: 'ko', label: '🇰🇷 한국어' },
  { id: 'ja', label: '🇯🇵 日本語' },
] as const;

// Personality archetypes — quick-start inject prefix
const PERSONALITY_PRESETS = [
  { id: 'analytical', emoji: '🧮', label: 'Analytical', desc: 'Data-focused, precise', color: '#0090ff',
    inject: 'You communicate in a data-driven, precise manner. Always support claims with evidence and numbers. Structure responses with clear logical flow.' },
  { id: 'creative',   emoji: '🎨', label: 'Creative',   desc: 'Innovative, lateral', color: '#ec4899',
    inject: 'You think laterally and unconventionally. Propose bold, creative ideas. Challenge assumptions and explore unexpected angles.' },
  { id: 'assertive',  emoji: '⚔️', label: 'Assertive',  desc: 'Direct, decisive',   color: '#f59e0b',
    inject: 'You are direct, confident, and decisive. Give clear recommendations without hedging. Lead with the conclusion first (BLUF: Bottom Line Up Front).' },
  { id: 'coaching',   emoji: '🤝', label: 'Coaching',   desc: 'Empathetic, guiding', color: '#10b981',
    inject: 'You guide with empathy and questions. Help users discover answers themselves using Socratic method. Acknowledge feelings before solutions.' },
  { id: 'research',   emoji: '🔬', label: 'Research',   desc: 'Deep-dive, academic', color: '#6366f1',
    inject: 'You research deeply before answering. Cite sources, acknowledge uncertainty, present multiple perspectives, and distinguish facts from opinions.' },
  { id: 'storyteller',emoji: '🎭', label: 'Storyteller', desc: 'Narrative, engaging', color: '#a855f7',
    inject: 'You communicate through stories and analogies. Make complex concepts accessible by wrapping them in relatable narratives and vivid examples.' },
];

const STEPS = [
  { id: 'identity', label: 'Identity',   icon: Bot       },
  { id: 'persona',  label: 'Persona',    icon: Brain     },
  { id: 'config',   label: 'Config',     icon: Settings2 },
];

const DEFAULT_PROMPTS: Record<AgentTier, string> = {
  orchestrator: `You are a strategic orchestrator AI.\nYou analyze business objectives, break them down into actionable sub-tasks, delegate to specialized agents, and synthesize results into executive-level reports.\nAlways think long-term, back decisions with data, and communicate with clarity and authority.`,
  department: `You are a specialized department AI agent.\nYou handle tasks in your domain with deep expertise, produce structured outputs, and collaborate with other agents.\nBe concise, data-driven, and action-oriented in all responses.`,
  specialist: `You are a specialist AI with deep expertise in a specific field.\nYou provide highly detailed, technically precise, and actionable insights.\nAlways cite evidence, provide examples, and format output for easy consumption.`,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildPreviewPrompt(systemPrompt: string, skills: string[], language?: string): string {
  const parts = [systemPrompt.trim()];
  const agentSkills = SKILL_LIBRARY.filter(s => skills.includes(s.id));
  if (agentSkills.length > 0) {
    parts.push(`RULES:\n${agentSkills.map(s => `- ${s.rule}`).join('\n')}`);
  }
  if (language) {
    const langMap: Record<string, string> = { vi: 'Vietnamese', en: 'English', ko: 'Korean', ja: 'Japanese' };
    parts.push(`LANGUAGE: Respond in ${langMap[language]}`);
  }
  return parts.join('\n\n');
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  initial?: Partial<CustomAgent>;
  onSave: (agent: Omit<CustomAgent, 'id' | 'createdAt' | 'isDefault'>) => void;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const AgentBuilderModal: React.FC<Props> = ({ initial, onSave, onClose }) => {
  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 0 — Identity
  const [name,  setName]  = useState(initial?.name  ?? '');
  const [role,  setRole]  = useState(initial?.role  ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🤖');
  const [color, setColor] = useState(initial?.color ?? '#0090ff');
  const [tier,  setTier]  = useState<AgentTier>(initial?.tier ?? 'department');
  const [personalityId, setPersonalityId] = useState<string | null>(null);

  // Step 1 — Persona
  const [systemPrompt, setSystemPrompt]   = useState(initial?.systemPrompt ?? DEFAULT_PROMPTS[tier]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initial?.skills ?? []);
  const [showSkillRules, setShowSkillRules] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  // AI prompt generation
  const [aiDesc, setAiDesc]           = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const aiAbortRef = useRef<AbortController | null>(null);

  // Step 2 — Config
  const [model,       setModel]       = useState(initial?.model    ?? 'claude-sonnet');
  const [brief,       setBrief]       = useState(initial?.brief    ?? '');
  const [language,    setLanguage]    = useState<string>(initial?.language ?? '');
  const [temperature, setTemperature] = useState(initial?.temperature ?? 0.7);
  const [maxTokens,   setMaxTokens]   = useState(initial?.maxTokens   ?? 2048);

  const isEditing = !!initial?.name;

  const goNext = () => { setDirection(1);  setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const handleTierChange = (t: AgentTier) => {
    setTier(t);
    if (!systemPrompt || systemPrompt === DEFAULT_PROMPTS[tier]) {
      setSystemPrompt(DEFAULT_PROMPTS[t]);
    }
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const applyPersonality = (preset: typeof PERSONALITY_PRESETS[0]) => {
    if (personalityId === preset.id) {
      // Toggle off — remove the inject prefix
      setPersonalityId(null);
      setSystemPrompt(s => s.replace(`${preset.inject}\n\n`, '').replace(`\n\n${preset.inject}`, ''));
    } else {
      setPersonalityId(preset.id);
      // Prepend personality inject
      setSystemPrompt(s => `${preset.inject}\n\n${s}`);
    }
  };

  // ── AI Prompt Generator ──────────────────────────────────────────────────
  const handleGeneratePrompt = async () => {
    if (!aiDesc.trim()) return;
    setIsGenerating(true);
    setSystemPrompt('');

    const abort = new AbortController();
    aiAbortRef.current = abort;

    const tierDesc = TIER_OPTIONS.find(t => t.id === tier)?.desc ?? tier;
    const metaPrompt = `You are an expert AI system prompt engineer. Create a professional system prompt for an AI agent with the following specifications:

Agent Name: ${name || 'AI Agent'}
Role/Title: ${role || 'Specialist'}
Tier: ${tier} (${tierDesc})
Description: ${aiDesc}

Write a clear, specific, and effective system prompt that:
- Defines the agent's identity and core expertise
- Specifies their communication style and tone
- Lists specific capabilities and responsibilities
- Sets behavioral constraints if needed
- Is 150-250 words

Return ONLY the system prompt text. No labels, no quotes, no preamble.`;

    try {
      let output = '';
      await aiChatStreamViaProxy(
        [
          { role: 'system', content: 'You are an expert at writing AI system prompts. Be concise, specific, and professional.' },
          { role: 'user', content: metaPrompt },
        ],
        (token) => {
          output += token;
          setSystemPrompt(output);
        },
        abort.signal,
        2048,
        AI_MODELS.SONNET,
      );
    } catch { /* abort */ }

    setIsGenerating(false);
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 1 && role.trim().length > 1;
    if (step === 1) return systemPrompt.trim().length > 20;
    return true;
  };

  const handleSave = () => {
    onSave({
      name, role, emoji, color, tier, systemPrompt,
      skills: selectedSkills, model, brief,
      language: language as CustomAgent['language'] || undefined,
      temperature,
      maxTokens,
    });
  };

  const activeTier = TIER_OPTIONS.find(t => t.id === tier)!;
  const fullPromptPreview = buildPreviewPrompt(systemPrompt, selectedSkills, language);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[580px] bg-white dark:bg-[#111113] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-black/[0.06] dark:border-white/[0.06]"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border-2"
              style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
            >
              {emoji}
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-800 dark:text-white leading-tight">
                {name || 'New Agent'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/30">
                {role || 'Define role below'} · {activeTier.label}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* ── Steps ── */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone   = i < step;
            const isActive = i === step;
            return (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    isActive ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30'
                    : isDone  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-white/20'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={10} /> : <Icon size={10} />}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px transition-colors ${i < step ? 'bg-emerald-400/50' : 'bg-slate-200 dark:bg-white/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Step Content ── */}
        <div className="flex-1 overflow-y-auto min-h-[360px] max-h-[520px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="p-6 space-y-5"
            >

              {/* ═══════════════════════════════════════════════════════
                  STEP 0 — Identity
              ═══════════════════════════════════════════════════════ */}
              {step === 0 && (
                <>
                  {/* Name + Role */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">Agent Name *</label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Marketing AI"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[12px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">Role / Title *</label>
                      <input
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        placeholder="Head of Marketing"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[12px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40"
                      />
                    </div>
                  </div>

                  {/* Emoji picker */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">Avatar Emoji</label>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOJI_PRESETS.map(e => (
                        <button
                          key={e}
                          onClick={() => setEmoji(e)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all border-2 ${
                            emoji === e
                              ? 'border-brand-blue bg-brand-blue/10 shadow-sm scale-110'
                              : 'border-transparent bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">Accent Color</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white dark:ring-slate-700 ring-offset-1' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tier */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">Agent Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIER_OPTIONS.map(t => {
                        const Icon = t.icon;
                        const isActive = tier === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => handleTierChange(t.id)}
                            className={`p-3 rounded-2xl border-2 text-left transition-all ${
                              isActive
                                ? 'border-brand-blue/60 bg-brand-blue/[0.07]'
                                : 'border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30'
                            }`}
                          >
                            <Icon size={16} className={`${isActive ? 'text-brand-blue' : 'text-slate-400'} mb-1.5`} />
                            <p className={`text-[10px] font-bold ${isActive ? 'text-brand-blue' : 'text-slate-700 dark:text-white/80'}`}>{t.label}</p>
                            <p className="text-[8px] text-slate-400 dark:text-white/25 mt-0.5 leading-snug">{t.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personality Presets */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">
                      Personality Style <span className="normal-case font-normal">(optional — injects communication style)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PERSONALITY_PRESETS.map(p => {
                        const isActive = personalityId === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => applyPersonality(p)}
                            className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                              isActive
                                ? 'border-current'
                                : 'border-black/[0.06] dark:border-white/[0.06] hover:border-current/30'
                            }`}
                            style={isActive ? {
                              backgroundColor: `${p.color}10`,
                              borderColor: p.color,
                              color: p.color,
                            } : { color: p.color }}
                          >
                            <span className="text-base">{p.emoji}</span>
                            <p className={`text-[10px] font-bold mt-0.5 ${isActive ? '' : 'text-slate-700 dark:text-white/70'}`}>{p.label}</p>
                            <p className="text-[8px] text-slate-400 dark:text-white/25">{p.desc}</p>
                            {isActive && <CheckCircle2 size={10} className="mt-1" style={{ color: p.color }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ═══════════════════════════════════════════════════════
                  STEP 1 — Persona
              ═══════════════════════════════════════════════════════ */}
              {step === 1 && (
                <>
                  {/* AI Prompt Generator */}
                  <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.04] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand2 size={13} className="text-violet-500" />
                      <p className="text-[10px] font-bold text-violet-500">AI Prompt Generator</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={aiDesc}
                        onChange={e => setAiDesc(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGeneratePrompt()}
                        placeholder={`Describe what this ${role || 'agent'} should do...`}
                        disabled={isGenerating}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-[11px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-violet-400/50 disabled:opacity-50"
                      />
                      <button
                        onClick={handleGeneratePrompt}
                        disabled={!aiDesc.trim() || isGenerating}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500 text-white text-[10px] font-bold hover:brightness-110 transition-all disabled:opacity-40 shrink-0"
                      >
                        {isGenerating ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                        {isGenerating ? 'Writing...' : 'Generate'}
                      </button>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30">System Prompt *</label>
                      <button
                        onClick={() => setSystemPrompt(DEFAULT_PROMPTS[tier])}
                        className="text-[8px] text-brand-blue hover:text-brand-blue/80 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles size={9} /> Reset default
                      </button>
                    </div>
                    <textarea
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      rows={7}
                      placeholder="Describe the agent's personality, expertise, and behavior..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none font-mono"
                    />
                    <p className="text-[8px] text-slate-400 mt-1">{systemPrompt.length} chars</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30">
                        Skill Modules <span className="normal-case font-normal text-slate-300 dark:text-white/15">({selectedSkills.length} selected)</span>
                      </label>
                      <button
                        onClick={() => setShowSkillRules(v => !v)}
                        className="flex items-center gap-1 text-[8px] font-semibold text-slate-400 hover:text-brand-blue transition-colors"
                      >
                        {showSkillRules ? <EyeOff size={9} /> : <Eye size={9} />}
                        {showSkillRules ? 'Hide rules' : 'Show rules'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILL_LIBRARY.map(skill => {
                        const isActive = selectedSkills.includes(skill.id);
                        return (
                          <div key={skill.id} className="relative group">
                            <button
                              onClick={() => toggleSkill(skill.id)}
                              className={`px-2.5 py-1.5 rounded-full text-[10px] font-semibold border transition-all ${
                                isActive
                                  ? 'bg-brand-blue/15 border-brand-blue/50 text-brand-blue'
                                  : 'bg-slate-100 dark:bg-white/[0.04] border-transparent text-slate-600 dark:text-white/50 hover:border-brand-blue/30 hover:text-brand-blue'
                              }`}
                            >
                              {isActive && <CheckCircle2 size={8} className="inline mr-1" />}
                              {skill.label}
                            </button>
                            {/* Rule tooltip */}
                            {showSkillRules && isActive && (
                              <div className="mt-1 text-[8px] text-slate-400 dark:text-white/30 bg-slate-50 dark:bg-white/[0.03] rounded-lg px-2 py-1 border border-black/[0.05] dark:border-white/[0.05] max-w-[200px] break-words">
                                {skill.rule}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full Prompt Preview */}
                  <div>
                    <button
                      onClick={() => setShowFullPrompt(v => !v)}
                      className="flex items-center justify-between w-full text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 hover:text-brand-blue transition-colors mb-1.5"
                    >
                      <span>Full Effective Prompt Preview</span>
                      <ChevronDown size={11} className={`transition-transform ${showFullPrompt ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showFullPrompt && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <pre className="text-[9px] text-emerald-600 dark:text-emerald-400/80 leading-relaxed bg-slate-900 rounded-xl p-3 whitespace-pre-wrap font-mono max-h-[140px] overflow-y-auto">
                            {fullPromptPreview}
                          </pre>
                          <p className="text-[8px] text-slate-400 mt-1">{fullPromptPreview.length} chars total (with skills injected)</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* ═══════════════════════════════════════════════════════
                  STEP 2 — Config
              ═══════════════════════════════════════════════════════ */}
              {step === 2 && (
                <>
                  {/* Model */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">LLM Model</label>
                    <div className="grid grid-cols-2 gap-3">
                      {MODEL_OPTIONS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setModel(m.id)}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                            model === m.id
                              ? 'border-current shadow-md'
                              : 'border-black/[0.07] dark:border-white/[0.07] hover:border-current'
                          }`}
                          style={model === m.id ? {
                            backgroundColor: `${m.color}10`,
                            borderColor: m.color,
                            color: m.color,
                          } : { color: m.color }}
                        >
                          <Zap size={16} className="mb-2" />
                          <p className="text-[12px] font-bold text-slate-800 dark:text-white">{m.label}</p>
                          <p
                            className="text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block"
                            style={{ backgroundColor: `${m.color}20`, color: m.color }}
                          >
                            {m.badge}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Output Language */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">
                      <Globe size={9} className="inline mr-1" />
                      Response Language <span className="normal-case font-normal">(overrides prompt language)</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setLanguage('')}
                        className={`px-3 py-2 rounded-xl border text-[10px] font-semibold transition-all ${
                          !language
                            ? 'border-brand-blue/50 bg-brand-blue/10 text-brand-blue'
                            : 'border-black/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:border-brand-blue/30'
                        }`}
                      >
                        Auto
                      </button>
                      {LANGUAGE_OPTIONS.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => setLanguage(lang.id)}
                          className={`px-3 py-2 rounded-xl border text-[10px] font-semibold transition-all ${
                            language === lang.id
                              ? 'border-brand-blue/50 bg-brand-blue/10 text-brand-blue'
                              : 'border-black/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:border-brand-blue/30'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30">
                        <Thermometer size={9} className="inline mr-1" />
                        Temperature (Creativity)
                      </label>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-white/60">{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min={0} max={1} step={0.1}
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-brand-blue"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                      <span>0.0 Precise</span>
                      <span>0.5 Balanced</span>
                      <span>1.0 Creative</span>
                    </div>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30">
                        <Hash size={9} className="inline mr-1" />
                        Max Response Length
                      </label>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-white/60">{maxTokens.toLocaleString()} tokens</span>
                    </div>
                    <input
                      type="range"
                      min={512} max={8192} step={512}
                      value={maxTokens}
                      onChange={e => setMaxTokens(parseInt(e.target.value))}
                      className="w-full accent-brand-blue"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                      <span>512 Short</span>
                      <span>2048 Medium</span>
                      <span>8192 Long</span>
                    </div>
                  </div>

                  {/* Brief */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      Context Brief <span className="normal-case font-normal text-slate-300 dark:text-white/15">(persistent memory — optional)</span>
                    </label>
                    <textarea
                      value={brief}
                      onChange={e => setBrief(e.target.value)}
                      rows={3}
                      placeholder="e.g. Our company sells B2B SaaS to HR teams in Vietnam. Primary market: enterprises 200-2000 employees. Brand tone: professional, friendly."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none"
                    />
                  </div>

                  {/* Summary box */}
                  <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                    <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 mb-2">Agent Summary</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl text-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 dark:text-white">{name}</p>
                        <p className="text-[10px] text-slate-400">{role}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {language && (
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-semibold">
                              {LANGUAGE_OPTIONS.find(l => l.id === language)?.label}
                            </span>
                          )}
                          <span className="text-[8px] bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40 px-1.5 py-0.5 rounded-full font-semibold">
                            T={temperature.toFixed(1)}
                          </span>
                          {selectedSkills.slice(0, 3).map(id => {
                            const sk = SKILL_LIBRARY.find(s => s.id === id);
                            return sk ? (
                              <span key={id} className="text-[8px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded-full font-semibold">
                                {sk.label.split(' ')[0]}
                              </span>
                            ) : null;
                          })}
                          {selectedSkills.length > 3 && (
                            <span className="text-[8px] text-slate-400">+{selectedSkills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="text-[9px] font-bold px-2 py-1 rounded-full border shrink-0"
                        style={{ backgroundColor: `${color}10`, borderColor: `${color}30`, color }}
                      >
                        {MODEL_OPTIONS.find(m => m.id === model)?.label.split(' ').slice(-2).join(' ')}
                      </div>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.05] dark:border-white/[0.05]">
          <button
            onClick={step === 0 ? onClose : goBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[11px] font-semibold text-slate-500 dark:text-white/40 hover:border-slate-300 dark:hover:border-white/20 transition-all"
          >
            <ChevronLeft size={13} />
            {step === 0 ? 'Huỷ' : 'Quay lại'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-blue text-white text-[11px] font-bold shadow-md shadow-brand-blue/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tiếp theo <ChevronRight size={13} />
            </button>
          ) : (
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-white text-[11px] font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-500/90 transition-all"
            >
              <CheckCircle2 size={13} />
              {isEditing ? 'Lưu thay đổi' : 'Tạo Agent'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgentBuilderModal;
