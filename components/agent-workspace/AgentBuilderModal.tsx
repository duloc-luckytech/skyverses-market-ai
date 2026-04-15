import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, Sparkles,
  Brain, Bot, Cpu, Settings2, Zap,
} from 'lucide-react';
import type { CustomAgent, AgentTier } from '../../hooks/useAgentRegistry';
import { SKILL_LIBRARY } from '../../hooks/useAgentRegistry';

// ─── Emoji presets ─────────────────────────────────────────────────────────────

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

const STEPS = [
  { id: 'identity', label: 'Identity',   icon: Bot      },
  { id: 'persona',  label: 'Persona',    icon: Brain    },
  { id: 'config',   label: 'Config',     icon: Settings2 },
];

// ─── Default prompts by tier ───────────────────────────────────────────────────

const DEFAULT_PROMPTS: Record<AgentTier, string> = {
  orchestrator: `You are a strategic orchestrator AI.\nYou analyze business objectives, break them down into actionable sub-tasks, delegate to specialized agents, and synthesize results into executive-level reports.\nAlways think long-term, back decisions with data, and communicate with clarity and authority.`,
  department: `You are a specialized department AI agent.\nYou handle tasks in your domain with deep expertise, produce structured outputs, and collaborate with other agents.\nBe concise, data-driven, and action-oriented in all responses.`,
  specialist: `You are a specialist AI with deep expertise in a specific field.\nYou provide highly detailed, technically precise, and actionable insights.\nAlways cite evidence, provide examples, and format output for easy consumption.`,
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  initial?: Partial<CustomAgent>;
  onSave: (agent: Omit<CustomAgent, 'id' | 'createdAt' | 'isDefault'>) => void;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const AgentBuilderModal: React.FC<Props> = ({ initial, onSave, onClose }) => {
  const [step, setStep]             = useState(0);
  const [direction, setDirection]   = useState(1);

  // Step 1 — Identity
  const [name, setName]             = useState(initial?.name ?? '');
  const [role, setRole]             = useState(initial?.role ?? '');
  const [emoji, setEmoji]           = useState(initial?.emoji ?? '🤖');
  const [color, setColor]           = useState(initial?.color ?? '#0090ff');
  const [tier, setTier]             = useState<AgentTier>(initial?.tier ?? 'department');

  // Step 2 — Persona
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? DEFAULT_PROMPTS[tier]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initial?.skills ?? []);

  // Step 3 — Config
  const [model, setModel]           = useState(initial?.model ?? 'claude-sonnet');
  const [brief, setBrief]           = useState(initial?.brief ?? '');

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

  const canProceed = () => {
    if (step === 0) return name.trim().length > 1 && role.trim().length > 1;
    if (step === 1) return systemPrompt.trim().length > 20;
    return true;
  };

  const handleSave = () => {
    onSave({ name, role, emoji, color, tier, systemPrompt, skills: selectedSkills, model, brief });
  };

  const activeTier = TIER_OPTIONS.find(t => t.id === tier)!;

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
        className="w-full max-w-[560px] bg-white dark:bg-[#111113] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-black/[0.06] dark:border-white/[0.06]"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-black/[0.05] dark:border-white/[0.05]">
          {/* Agent preview pill */}
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
                {role || 'Define role in Step 1'} · {activeTier.label}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* ── Step progress ── */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isActive = i === step;
            return (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30'
                      : isDone
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
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

        {/* ── Step content ── */}
        <div className="flex-1 overflow-y-auto min-h-[340px] max-h-[480px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="p-6 space-y-5"
            >

              {/* ── STEP 0: Identity ── */}
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
                            <Icon size={16} className={isActive ? 'text-brand-blue mb-1.5' : 'text-slate-400 mb-1.5'} />
                            <p className={`text-[10px] font-bold ${isActive ? 'text-brand-blue' : 'text-slate-700 dark:text-white/80'}`}>
                              {t.label}
                            </p>
                            <p className="text-[8px] text-slate-400 dark:text-white/25 mt-0.5 leading-snug">{t.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 1: Persona ── */}
              {step === 1 && (
                <>
                  {/* System prompt */}
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
                      rows={8}
                      placeholder="Describe the agent's personality, expertise, and behavior..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none font-mono"
                    />
                    <p className="text-[8px] text-slate-400 mt-1">{systemPrompt.length} chars</p>
                  </div>

                  {/* Skill chips */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">
                      Skill Modules <span className="normal-case text-slate-300 dark:text-white/15">({selectedSkills.length} selected · injected into system prompt)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILL_LIBRARY.map(skill => {
                        const isActive = selectedSkills.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.id)}
                            title={skill.rule}
                            className={`px-2.5 py-1.5 rounded-full text-[10px] font-semibold border transition-all ${
                              isActive
                                ? 'bg-brand-blue/15 border-brand-blue/50 text-brand-blue'
                                : 'bg-slate-100 dark:bg-white/[0.04] border-transparent text-slate-600 dark:text-white/50 hover:border-brand-blue/30 hover:text-brand-blue'
                            }`}
                          >
                            {isActive && <CheckCircle2 size={8} className="inline mr-1" />}
                            {skill.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 2: Config ── */}
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

                  {/* Brief / Context memo */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      Context Brief <span className="normal-case text-slate-300 dark:text-white/15">(persistent memory hint — optional)</span>
                    </label>
                    <textarea
                      value={brief}
                      onChange={e => setBrief(e.target.value)}
                      rows={4}
                      placeholder="e.g. Our company sells B2B SaaS to HR teams in Vietnam. Primary market is enterprises 200-2000 employees. Brand tone: professional, friendly."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[11px] leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                    <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 mb-2">Agent summary</p>
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
                          {selectedSkills.slice(0, 4).map(id => {
                            const sk = SKILL_LIBRARY.find(s => s.id === id);
                            return sk ? (
                              <span key={id} className="text-[8px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded-full font-semibold">{sk.label.split(' ')[0]}</span>
                            ) : null;
                          })}
                          {selectedSkills.length > 4 && (
                            <span className="text-[8px] text-slate-400">+{selectedSkills.length - 4} more</span>
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
