import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Copy, Search, Filter,
  Bot, Cpu, Brain, CheckCircle2, Zap, ChevronDown,
  Crown, AlertCircle, Users2,
} from 'lucide-react';
import type { CustomAgent, AgentTier } from '../../hooks/useAgentRegistry';
import { SKILL_LIBRARY } from '../../hooks/useAgentRegistry';
import AgentBuilderModal from './AgentBuilderModal';

// ─── Tier badge ─────────────────────────────────────────────────────────────────

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

// ─── Agent Card ─────────────────────────────────────────────────────────────────

const AgentCard: React.FC<{
  agent: CustomAgent;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ agent, isSelected, onSelect, onEdit, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const TierIcon = TIER_ICONS[agent.tier];
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
      {/* Default badge */}
      {agent.isDefault && (
        <div className="absolute top-2 right-2">
          <span className="text-[7px] font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/30 px-1.5 py-0.5 rounded-full">
            DEFAULT
          </span>
        </div>
      )}

      {/* Agent avatar + name row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border"
          style={{ backgroundColor: `${agent.color}15`, borderColor: `${agent.color}30` }}
        >
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight truncate">
            {agent.name}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-white/40 truncate mt-0.5">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Tier badge + model badge */}
      <div className="flex items-center gap-1.5 mb-3">
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
      </div>

      {/* Skills */}
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

      {/* Brief preview */}
      {agent.brief && (
        <p className="text-[9px] text-slate-400 dark:text-white/25 line-clamp-2 leading-snug border-t border-black/[0.04] dark:border-white/[0.04] pt-2">
          {agent.brief}
        </p>
      )}

      {/* Active indicator */}
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

// ─── Main tab component ─────────────────────────────────────────────────────────

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
  agents,
  selectedAgentId,
  onSelectAgent,
  onAddAgent,
  onUpdateAgent,
  onDeleteAgent,
  onDuplicateAgent,
}) => {
  const [showBuilder, setShowBuilder]         = useState(false);
  const [editingAgent, setEditingAgent]       = useState<CustomAgent | null>(null);
  const [searchQ, setSearchQ]                 = useState('');
  const [filterTier, setFilterTier]           = useState<AgentTier | 'all'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  return (
    <>
      <div className="flex flex-col h-full">

        {/* ── Header toolbar ── */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.04] shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Tìm agent..."
              className="w-full pl-8 pr-3 py-2 text-[11px] bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-transparent focus:border-brand-blue/30 focus:outline-none text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-white/20"
            />
          </div>

          {/* Tier filter */}
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

          {/* New agent button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setEditingAgent(null); setShowBuilder(true); }}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-white bg-brand-blue rounded-xl shadow-md shadow-brand-blue/20 hover:brightness-110 transition-all shrink-0"
          >
            <Plus size={13} />
            New Agent
          </motion.button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── Left: Agent grid ── */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Bot size={28} className="text-slate-300 dark:text-white/10" />
                <p className="text-[11px] text-slate-400 dark:text-white/25">
                  {searchQ ? `Không tìm thấy agent nào` : 'Chưa có agent'}
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

                {/* Add new card */}
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

          {/* ── Right: Selected agent detail ── */}
          <AnimatePresence mode="wait">
            {selectedAgent && (
              <motion.div
                key={selectedAgent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="w-[280px] shrink-0 border-l border-black/[0.05] dark:border-white/[0.04] overflow-y-auto bg-white/50 dark:bg-white/[0.01]"
              >
                {/* Agent header */}
                <div
                  className="p-5 flex flex-col items-center gap-3 border-b border-black/[0.05] dark:border-white/[0.04]"
                  style={{ background: `linear-gradient(160deg, ${selectedAgent.color}12 0%, transparent 60%)` }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2"
                    style={{ backgroundColor: `${selectedAgent.color}15`, borderColor: `${selectedAgent.color}40` }}
                  >
                    {selectedAgent.emoji}
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-black text-slate-800 dark:text-white">{selectedAgent.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedAgent.role}</p>
                    {!selectedAgent.isDefault && (
                      <button
                        onClick={() => { setEditingAgent(selectedAgent); setShowBuilder(true); }}
                        className="mt-2 flex items-center gap-1 mx-auto text-[9px] font-semibold text-brand-blue hover:text-brand-blue/70 transition-colors"
                      >
                        <Edit2 size={9} /> Edit Agent
                      </button>
                    )}
                  </div>
                </div>

                {/* Detail sections */}
                <div className="p-4 space-y-4">
                  {/* Model */}
                  <div>
                    <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 mb-1.5">Model</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-white/70">
                      <Zap size={11} className="text-brand-blue" />
                      {selectedAgent.model === 'claude-opus' ? 'Claude Opus 4' : 'Claude Sonnet 4'}
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

                  {/* System prompt preview */}
                  <div>
                    <p className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 mb-1.5">System Prompt</p>
                    <pre className="text-[9px] text-slate-500 dark:text-white/30 leading-relaxed bg-slate-50 dark:bg-white/[0.02] rounded-xl p-2.5 border border-black/[0.04] dark:border-white/[0.04] whitespace-pre-wrap font-mono line-clamp-6">
                      {selectedAgent.systemPrompt}
                    </pre>
                    {selectedAgent.isDefault && !editingAgent && (
                      <p className="text-[8px] text-slate-300 dark:text-white/20 mt-1">
                        Duplicate agent để customize system prompt
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Builder Modal ── */}
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
