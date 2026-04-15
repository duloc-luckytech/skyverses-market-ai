import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Copy, Search,
  Bot, Brain, CheckCircle2, Zap, Crown, Users2,
  MessageSquare, Globe, Thermometer,
} from 'lucide-react';
import type { CustomAgent, AgentTier } from '../../hooks/useAgentRegistry';
import { SKILL_LIBRARY } from '../../hooks/useAgentRegistry';
import AgentBuilderModal from './AgentBuilderModal';
import AgentSandbox from './AgentSandbox';


const TIER_ICONS: Record<AgentTier, React.ElementType> = {
  orchestrator: Crown,
  department: Users2,
  specialist: Brain,
};

const TIER_COLORS: Record<AgentTier, string> = {
  orchestrator: '#f59e0b',
  department: '#0090ff',
  specialist: '#8b5cf6',
};

const LANGUAGE_LABELS: Record<string, string> = {
  vi: '🇻🇳 VI', en: '🇺🇸 EN', ko: '🇰🇷 KO', ja: '🇯🇵 JA',
};

// ─── Agent Card ─────────────────────────────────────────────────────────────────

const AgentCard: React.FC<{
  agent: CustomAgent;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ agent, isSelected, onSelect, onEdit, onDelete, onDuplicate }) => {
  const TierIcon  = TIER_ICONS[agent.tier];
  const tierColor = TIER_COLORS[agent.tier];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      onClick={onSelect}
      className={`relative group cursor-pointer rounded-2xl border-2 p-4 transition-all hover:shadow-md ${
        isSelected
          ? 'shadow-lg'
          : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02]'
      }`}
      style={isSelected ? {
        borderColor: agent.color,
        backgroundColor: `${agent.color}08`,
        boxShadow: `0 4px 20px ${agent.color}20`,
      } : {}}
    >
      {agent.isDefault && (
        <div className="absolute top-2 right-2">
          <span className="text-[7px] font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/30 px-1.5 py-0.5 rounded-full">
            DEFAULT
          </span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border"
          style={{ backgroundColor: `${agent.color}15`, borderColor: `${agent.color}30` }}
        >
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight truncate">{agent.name}</p>
          <p className="text-[10px] text-slate-400 dark:text-white/40 truncate mt-0.5">{agent.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold border"
          style={{ backgroundColor: `${tierColor}12`, borderColor: `${tierColor}30`, color: tierColor }}
        >
          <TierIcon size={8} />
          {agent.tier}
        </div>
        <div className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/30 border border-black/[0.06] dark:border-white/[0.06]">
          {agent.model === 'claude-opus' ? 'Opus 4' : 'Sonnet 4'}
        </div>
        {agent.language && (
          <div className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            {LANGUAGE_LABELS[agent.language]}
          </div>
        )}
      </div>

      {agent.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.skills.slice(0, 3).map(id => {
            const sk = SKILL_LIBRARY.find(s => s.id === id);
            return sk ? (
              <span key={id} className="text-[8px] px-1.5 py-0.5 rounded-full bg-brand-blue/[0.08] text-brand-blue border border-brand-blue/20 font-semibold">
                {sk.label.split(' ')[0]}
              </span>
            ) : null;
          })}
          {agent.skills.length > 3 && (
            <span className="text-[8px] text-slate-400 dark:text-white/25">+{agent.skills.length - 3}</span>
          )}
        </div>
      )}

      {agent.brief && (
        <p className="text-[9px] text-slate-400 dark:text-white/25 line-clamp-2 leading-snug border-t border-black/[0.04] dark:border-white/[0.04] pt-2">
          {agent.brief}
        </p>
      )}

      {isSelected && (
        <div className="absolute bottom-3 right-3">
          <CheckCircle2 size={14} style={{ color: agent.color }} />
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {!agent.isDefault && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="w-6 h-6 rounded-lg bg-white dark:bg-[#1a1a1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-all shadow-sm"
          >
            <Trash2 size={10} />
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDuplicate(); }}
          title="Duplicate"
          className="w-6 h-6 rounded-lg bg-white dark:bg-[#1a1a1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center hover:bg-brand-blue/5 hover:text-brand-blue text-slate-400 transition-all shadow-sm"
        >
          <Copy size={10} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          title="Edit"
          className="w-6 h-6 rounded-lg bg-white dark:bg-[#1a1a1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center hover:bg-brand-blue/5 hover:text-brand-blue text-slate-400 transition-all shadow-sm"
        >
          <Edit2 size={10} />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Agent Sandbox (Test Chat) ──────────────────────────────────────────────────

// ─── Main Tab ──────────────────────────────────────────────────────────────────


interface Props {
  agents: CustomAgent[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  onAddAgent: (agent: Omit<CustomAgent, 'id' | 'createdAt' | 'isDefault'>) => void;
  onUpdateAgent: (id: string, patch: Partial<CustomAgent>) => void;
  onDeleteAgent: (id: string) => void;
  onDuplicateAgent: (id: string) => void;
}

const MyAgentsTab: React.FC<Props> = ({
  agents, selectedAgentId, onSelectAgent,
  onAddAgent, onUpdateAgent, onDeleteAgent, onDuplicateAgent,
}) => {
  const [showBuilder, setShowBuilder]         = useState(false);
  const [editingAgent, setEditingAgent]       = useState<CustomAgent | null>(null);
  const [searchQ, setSearchQ]                 = useState('');
  const [filterTier, setFilterTier]           = useState<AgentTier | 'all'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [rightTab, setRightTab]               = useState<'profile' | 'sandbox'>('profile');

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const filtered = agents.filter(a => {
    const matchTier   = filterTier === 'all' || a.tier === filterTier;
    const matchSearch = !searchQ ||
      a.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQ.toLowerCase());
    return matchTier && matchSearch;
  });

  const handleSaveNew = (data: Omit<CustomAgent, 'id' | 'createdAt' | 'isDefault'>) => {
    onAddAgent(data);
    setShowBuilder(false);
  };

  const handleSaveEdit = (data: Omit<CustomAgent, 'id' | 'createdAt' | 'isDefault'>) => {
    if (!editingAgent) return;
    onUpdateAgent(editingAgent.id, data);
    setEditingAgent(null);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDeleteAgent(id);
      setConfirmDeleteId(null);
      if (selectedAgentId === id) {
        const next = agents.find(a => a.id !== id);
        if (next) onSelectAgent(next.id);
      }
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  // Reset sandbox tab when switching agents
  useEffect(() => { setRightTab('profile'); }, [selectedAgentId]);

  return (
    <>
      <div className="flex flex-col h-full">

        {/* ── Header toolbar ── */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.04] shrink-0">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search agents…"
              className="w-full pl-8 pr-3 py-2 text-[11px] bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-transparent focus:border-brand-blue/30 focus:outline-none text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-white/20"
            />
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/[0.04] rounded-xl p-0.5">
            {(['all', 'orchestrator', 'department', 'specialist'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterTier(t)}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all ${
                  filterTier === t
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'all' ? 'All' : t.slice(0, 4)}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setEditingAgent(null); setShowBuilder(true); }}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-white bg-brand-blue rounded-xl shadow-md shadow-brand-blue/20 hover:brightness-110 transition-all shrink-0"
          >
            <Plus size={13} /> New Agent
          </motion.button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── Agent grid ── */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Bot size={28} className="text-slate-300 dark:text-white/10" />
                <p className="text-[11px] text-slate-400 dark:text-white/25">
                  {searchQ ? 'No agents found' : 'No agents yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                <AnimatePresence>
                  {filtered.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgentId === agent.id}
                      onSelect={() => onSelectAgent(agent.id)}
                      onEdit={() => { setEditingAgent(agent); setShowBuilder(true); }}
                      onDelete={() => handleDelete(agent.id)}
                      onDuplicate={() => onDuplicateAgent(agent.id)}
                    />
                  ))}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02, borderColor: 'rgba(0,144,255,0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setEditingAgent(null); setShowBuilder(true); }}
                  className="rounded-2xl border-2 border-dashed border-black/[0.08] dark:border-white/[0.08] p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-brand-blue transition-all min-h-[140px] group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors">
                    <Plus size={18} className="group-hover:text-brand-blue transition-colors" />
                  </div>
                  <p className="text-[11px] font-semibold">New Agent</p>
                </motion.button>
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <AnimatePresence mode="wait">
            {selectedAgent && (
              <motion.div
                key={selectedAgent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="w-[280px] shrink-0 border-l border-black/[0.05] dark:border-white/[0.04] bg-white dark:bg-[#0d0d0f] flex flex-col overflow-hidden"
              >
                {/* Agent header */}
                <div
                  className="p-4 flex flex-col items-center gap-2 border-b border-black/[0.05] dark:border-white/[0.04] shrink-0"
                  style={{ background: `linear-gradient(160deg, ${selectedAgent.color}12 0%, transparent 60%)` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2"
                    style={{ backgroundColor: `${selectedAgent.color}15`, borderColor: `${selectedAgent.color}40` }}
                  >
                    {selectedAgent.emoji}
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-black text-slate-800 dark:text-white">{selectedAgent.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedAgent.role}</p>
                  </div>
                  {!selectedAgent.isDefault && (
                    <button
                      onClick={() => { setEditingAgent(selectedAgent); setShowBuilder(true); }}
                      className="flex items-center gap-1 text-[9px] font-semibold text-brand-blue hover:text-brand-blue/70 transition-colors"
                    >
                      <Edit2 size={9} /> Edit Agent
                    </button>
                  )}
                </div>

                {/* Tabs: Profile | Sandbox */}
                <div className="flex items-center gap-1 px-3 pt-2.5 pb-0 shrink-0">
                  {([
                    { id: 'profile', icon: Zap,           label: 'Profile' },
                    { id: 'sandbox', icon: MessageSquare,  label: '🧪 Test' },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setRightTab(tab.id)}
                      className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                        rightTab === tab.id
                          ? 'bg-brand-blue/10 text-brand-blue'
                          : 'text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <tab.icon size={10} /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-hidden min-h-0">
                  <AnimatePresence mode="wait">
                    {rightTab === 'profile' ? (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full overflow-y-auto p-4 space-y-4"
                      >
                        {/* Model + Config */}
                        <div>
                          <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 mb-1.5">Model & Config</p>
                          <div className="flex flex-wrap gap-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700 dark:text-white/70 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                              <Zap size={10} className="text-brand-blue" />
                              {selectedAgent.model === 'claude-opus' ? 'Opus 4' : 'Sonnet 4'}
                            </div>
                            {selectedAgent.temperature !== undefined && (
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                                <Thermometer size={10} />
                                T={selectedAgent.temperature.toFixed(1)}
                              </div>
                            )}
                            {selectedAgent.maxTokens && (
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                {selectedAgent.maxTokens.toLocaleString()}tok
                              </div>
                            )}
                            {selectedAgent.language && (
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                <Globe size={10} />
                                {LANGUAGE_LABELS[selectedAgent.language]}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Skills */}
                        {selectedAgent.skills.length > 0 && (
                          <div>
                            <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 mb-1.5">Skill Modules</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedAgent.skills.map(id => {
                                const sk = SKILL_LIBRARY.find(s => s.id === id);
                                return sk ? (
                                  <span
                                    key={id}
                                    title={sk.rule}
                                    className="text-[8px] px-2 py-1 rounded-full bg-brand-blue/[0.08] text-brand-blue border border-brand-blue/15 font-semibold"
                                  >
                                    {sk.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Brief */}
                        {selectedAgent.brief && (
                          <div>
                            <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 mb-1.5">Context Brief</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 leading-relaxed bg-slate-50 dark:bg-white/[0.02] rounded-xl p-2.5 border border-black/[0.04] dark:border-white/[0.04]">
                              {selectedAgent.brief}
                            </p>
                          </div>
                        )}

                        {/* System prompt */}
                        <div>
                          <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 mb-1.5">System Prompt</p>
                          <pre className="text-[9px] text-slate-500 dark:text-white/30 leading-relaxed bg-slate-50 dark:bg-white/[0.02] rounded-xl p-2.5 border border-black/[0.04] dark:border-white/[0.04] whitespace-pre-wrap font-mono line-clamp-8">
                            {selectedAgent.systemPrompt}
                          </pre>
                          {selectedAgent.isDefault && (
                            <p className="text-[8px] text-slate-300 dark:text-white/20 mt-1">
                              Duplicate agent để customize
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sandbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                      >
                        <AgentSandbox agent={selectedAgent} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <AgentBuilderModal
            initial={editingAgent ?? undefined}
            onSave={editingAgent ? handleSaveEdit : handleSaveNew}
            onClose={() => { setShowBuilder(false); setEditingAgent(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MyAgentsTab;
