
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Network, Play, Loader2, CheckCircle2,
  LayoutGrid, RotateCcw, X, AlertCircle,
  Crown, Sparkles, RefreshCw, Copy, ZoomIn, ZoomOut, Maximize2, Clock,
} from 'lucide-react';
import type { CustomAgent } from '../../hooks/useAgentRegistry';
import { SKILL_LIBRARY } from '../../hooks/useAgentRegistry';
import { useOrgBuilder, autoLayout } from '../../hooks/useOrgBuilder';
import type { OrgNode } from '../../hooks/useOrgBuilder';
import { aiChatStreamViaProxy, AI_MODELS, buildSystemMessage } from '../../apis/aiCommon';
import type { ChatMessage } from '../../apis/aiCommon';

// ─── Constants ─────────────────────────────────────────────────────────────────

const NODE_W = 154;
const NODE_H = 92;
const CANVAS_MIN_W = 900;
const CANVAS_MIN_H = 520;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.8;
const ZOOM_STEP = 0.1;
const MEMORY_KEY = (orgName: string) => `skyverses_org_memory_${orgName.replace(/\s+/g, '_')}`;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ActivationResult {
  nodeId: string;
  agentName: string;
  agentEmoji: string;
  agentColor: string;
  delegatedTask: string;
  output: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

interface ActivationMemoryEntry {
  mission: string;
  timestamp: string;
  results: { agentName: string; task: string; output: string }[];
}

// ─── Node card on canvas ────────────────────────────────────────────────────────

const OrgNodeCard: React.FC<{
  node: OrgNode;
  agent: CustomAgent | null;
  isSelected: boolean;
  isActivating: boolean;
  activationStatus?: ActivationResult['status'];
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: () => void;
  onAddChild: () => void;
  onDelete: () => void;
}> = ({ node, agent, isSelected, isActivating, activationStatus, onMouseDown, onClick, onAddChild, onDelete }) => {
  const color  = agent?.color ?? '#64748b';
  const emoji  = agent?.emoji ?? '❓';
  const name   = agent?.name  ?? 'Unassigned';
  const isRoot = !node.parentId;

  const statusColor = activationStatus === 'done'    ? '#10b981'
                    : activationStatus === 'running'  ? '#f59e0b'
                    : activationStatus === 'error'    ? '#ef4444'
                    : undefined;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: NODE_W,
        userSelect: 'none',
        cursor: isActivating ? 'default' : 'grab',
        zIndex: isSelected ? 20 : 10,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        className={`rounded-2xl border-2 transition-all duration-150 overflow-hidden ${
          isSelected
            ? 'shadow-xl'
            : 'shadow-md hover:shadow-lg'
        }`}
        style={isSelected ? {
          borderColor: color,
          boxShadow: `0 8px 28px ${color}30`,
          background: isActivating ? '#0d0d0f' : undefined,
        } : {}}
      >
        {/* Top stripe */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: statusColor ?? color }}
        />

        {/* Body */}
        <div className="px-3 py-2.5 bg-white dark:bg-[#111113] border-t-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 select-none"
              style={{ backgroundColor: `${color}16` }}
            >
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight truncate">
                {name}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-white/30 truncate">{node.label}</p>
            </div>
            {isRoot && (
              <Crown size={10} className="text-amber-400 shrink-0" />
            )}
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between">
            {activationStatus ? (
              <div className="flex items-center gap-1">
                {activationStatus === 'running' && <Loader2 size={9} className="animate-spin text-amber-400" />}
                {activationStatus === 'done'    && <CheckCircle2 size={9} className="text-emerald-400" />}
                {activationStatus === 'error'   && <AlertCircle size={9} className="text-red-400" />}
                {activationStatus === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20 animate-pulse" />}
                <span
                  className="text-[8px] font-bold capitalize"
                  style={{ color: statusColor ?? '#94a3b8' }}
                >
                  {activationStatus}
                </span>
              </div>
            ) : agent ? (
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border"
                style={{ backgroundColor: `${color}10`, borderColor: `${color}25`, color }}
              >
                {agent.model === 'claude-opus' ? 'Opus' : 'Sonnet'}
              </span>
            ) : (
              <span className="text-[8px] text-slate-400 italic">Click to assign</span>
            )}

            {/* Actions (only when not activating) */}
            {!isActivating && (
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onAddChild(); }}
                  title="Add child node"
                  className="w-5 h-5 rounded-lg bg-brand-blue/10 hover:bg-brand-blue/20 flex items-center justify-center text-brand-blue transition-colors"
                >
                  <Plus size={9} />
                </button>
                {!isRoot && (
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); onDelete(); }}
                    title="Delete node"
                    className="w-5 h-5 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                  >
                    <Trash2 size={9} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── SVG connections ────────────────────────────────────────────────────────────

const OrgConnections: React.FC<{
  nodes: OrgNode[];
  activationResults: ActivationResult[];
}> = ({ nodes, activationResults }) => {
  const getStatus = (id: string) => activationResults.find(r => r.nodeId === id)?.status;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      width="100%" height="100%"
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="rgba(100,116,139,0.5)" />
        </marker>
      </defs>
      {nodes.map(node => {
        if (!node.parentId) return null;
        const parent = nodes.find(n => n.id === node.parentId);
        if (!parent) return null;

        const x1 = parent.x + NODE_W / 2;
        const y1 = parent.y + NODE_H;
        const x2 = node.x + NODE_W / 2;
        const y2 = node.y;
        const mid = (y1 + y2) / 2;

        const childStatus = getStatus(node.id);
        const strokeColor = childStatus === 'done'    ? '#10b981'
                          : childStatus === 'running'  ? '#f59e0b'
                          : childStatus === 'error'    ? '#ef4444'
                          : 'rgba(100,116,139,0.35)';

        const strokeW = childStatus ? 2 : 1.5;

        return (
          <path
            key={`${parent.id}-${node.id}`}
            d={`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeW}
            strokeDasharray={childStatus === 'pending' ? '6 4' : undefined}
            markerEnd="url(#arrowhead)"
            style={{ transition: 'stroke 0.4s, stroke-width 0.3s' }}
          />
        );
      })}
    </svg>
  );
};

// ─── Activation Modal ──────────────────────────────────────────────────────────

const ActivationModal: React.FC<{
  results: ActivationResult[];
  orgName: string;
  mission: string;
  onClose: () => void;
  onRerunAgent: (nodeId: string) => void;
  isActivating: boolean;
  memoryEntries: ActivationMemoryEntry[];
}> = ({ results, orgName, mission, onClose, onRerunAgent, isActivating, memoryEntries }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const done   = results.filter(r => r.status === 'done').length;
  const total  = results.length;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = results.every(r => r.status === 'done' || r.status === 'error');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[800] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => { if (allDone) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0a0a0c] rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <Network size={16} className="text-brand-blue" />
            </div>
            <div>
              <p className="text-[13px] font-black text-white">{orgName} — Activation</p>
              <p className="text-[10px] text-white/30 truncate max-w-[300px]">{mission}</p>
            </div>
          </div>
          {allDone && (
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
              <X size={16} className="text-white/40" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 shrink-0">
          {(['current', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                activeTab === tab
                  ? 'bg-brand-blue/15 text-brand-blue'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {tab === 'current' ? <Network size={10} /> : <Clock size={10} />}
              {tab === 'current' ? 'Current Run' : `History (${memoryEntries.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'current' && (
          <>
            {/* Progress bar */}
            <div className="px-6 pt-3 pb-0">
              <div className="flex items-center justify-between text-[9px] font-bold text-white/40 mb-1.5">
                <span>Progress</span>
                <span>{done}/{total} agents</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-blue to-violet-500"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {results.map((result, i) => (
                  <motion.div
                    key={result.nodeId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl border overflow-hidden ${
                      result.status === 'running' ? 'border-amber-500/30 bg-amber-500/[0.04]'
                      : result.status === 'done'  ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
                      : result.status === 'error' ? 'border-red-500/25 bg-red-500/[0.03]'
                      : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    {/* Agent header */}
                    <div className="flex items-center gap-2.5 px-4 py-2.5">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: `${result.agentColor}20` }}
                      >
                        {result.agentEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white/80">{result.agentName}</p>
                        {result.delegatedTask && (
                          <p className="text-[9px] text-white/30 truncate mt-0.5">{result.delegatedTask}</p>
                        )}
                      </div>
                      {result.status === 'running' && <Loader2 size={12} className="animate-spin text-amber-400 shrink-0" />}
                      {result.status === 'done'    && <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />}
                      {result.status === 'error'   && <AlertCircle size={12} className="text-red-400 shrink-0" />}
                      {result.status === 'pending' && <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse shrink-0" />}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {result.output && (
                          <button
                            onClick={() => navigator.clipboard.writeText(result.output)}
                            className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
                            title="Copy output"
                          >
                            <Copy size={9} className="text-white/40" />
                          </button>
                        )}
                        {(result.status === 'done' || result.status === 'error') && !isActivating && (
                          <button
                            onClick={() => onRerunAgent(result.nodeId)}
                            className="w-6 h-6 rounded-lg bg-brand-blue/10 hover:bg-brand-blue/20 flex items-center justify-center transition-colors"
                            title="Re-run this agent"
                          >
                            <RefreshCw size={9} className="text-brand-blue" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Output */}
                    {result.output && (
                      <div className="px-4 pb-3 pt-0">
                        <div className="bg-black/40 rounded-xl p-3 font-mono text-[10px] text-emerald-300/80 leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap">
                          {result.output}
                          {result.status === 'running' && (
                            <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {memoryEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/20">
                <Clock size={28} className="mb-2" />
                <p className="text-[11px]">No activation history yet</p>
              </div>
            ) : (
              [...memoryEntries].reverse().map((entry, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/[0.04]">
                    <p className="text-[11px] font-bold text-white/70 truncate">{entry.mission}</p>
                    <p className="text-[9px] text-white/25 mt-0.5">
                      {new Date(entry.timestamp).toLocaleString('vi-VN')} · {entry.results.length} agents
                    </p>
                  </div>
                  <div className="px-4 py-2 space-y-1.5">
                    {entry.results.map((r, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-[9px] font-bold text-white/40 shrink-0 w-20 truncate">{r.agentName}</span>
                        <p className="text-[9px] text-white/25 truncate flex-1">{r.output.slice(0, 80)}…</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(r.output)}
                          className="shrink-0 text-white/20 hover:text-white/50 transition-colors"
                        >
                          <Copy size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        {allDone && (
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-[10px] text-white/30">
              {results.filter(r => r.status === 'done').length} agents completed · saved to history
            </p>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue text-white text-[11px] font-bold hover:brightness-110 transition-all"
            >
              <CheckCircle2 size={12} /> Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────────

interface Props {
  agents: CustomAgent[];
}

const OrgBuilderTab: React.FC<Props> = ({ agents }) => {
  const org = useOrgBuilder();
  const { config, updateMeta, addNode, removeNode, updateNode, moveNode, commitMove, applyAutoLayout, resetOrg } = org;

  // Canvas drag + zoom state
  const [selectedNodeId, setSelectedNodeId]   = useState<string | null>(null);
  const [zoom, setZoom]                       = useState(1);
  const draggingRef = useRef<{ nodeId: string; offX: number; offY: number } | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLDivElement>(null);

  // Right panel
  const [editingLabel, setEditingLabel] = useState<string>('');

  // Activate org
  const [showMissionInput, setShowMissionInput]     = useState(false);
  const [missionText, setMissionText]               = useState('');
  const [isActivating, setIsActivating]             = useState(false);
  const [activationResults, setActivationResults]   = useState<ActivationResult[]>([]);
  const [showActivation, setShowActivation]         = useState(false);
  const [memoryEntries, setMemoryEntries]           = useState<ActivationMemoryEntry[]>([]);
  const abortRefs = useRef<AbortController[]>([]);

  const selectedNode  = config.nodes.find(n => n.id === selectedNodeId) ?? null;

  // ── Load memory on mount ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEMORY_KEY(config.orgName));
      if (raw) setMemoryEntries(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [config.orgName]);

  const saveMemory = useCallback((entries: ActivationMemoryEntry[]) => {
    try {
      localStorage.setItem(MEMORY_KEY(config.orgName), JSON.stringify(entries.slice(-20)));
    } catch { /* ignore */ }
  }, [config.orgName]);

  // ── Canvas zoom (mouse wheel) ───────────────────────────────────────────────
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // Ctrl/Cmd + scroll to zoom
      e.preventDefault();
      setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - e.deltaY * 0.001)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── Canvas drag handlers ────────────────────────────────────────────────────

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const node = config.nodes.find(n => n.id === nodeId);
    if (!node) return;
    draggingRef.current = {
      nodeId,
      offX: (e.clientX - rect.left) / zoom - node.x,
      offY: (e.clientY - rect.top)  / zoom - node.y,
    };
  }, [config.nodes, zoom]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, (e.clientX - rect.left) / zoom - draggingRef.current.offX);
      const y = Math.max(0, (e.clientY - rect.top)  / zoom - draggingRef.current.offY);
      moveNode(draggingRef.current.nodeId, x, y);
    };
    const onUp = (e: MouseEvent) => {
      if (!draggingRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, (e.clientX - rect.left) / zoom - draggingRef.current.offX);
      const y = Math.max(0, (e.clientY - rect.top)  / zoom - draggingRef.current.offY);
      commitMove(draggingRef.current.nodeId, x, y);
      draggingRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [moveNode, commitMove, zoom]);

  // ── Selected node sync ─────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedNode) setEditingLabel(selectedNode.label);
  }, [selectedNode?.id]);

  // ── Org Summary ────────────────────────────────────────────────────────────

  const buildOrgSummary = useCallback(() => {
    const lines: string[] = [`Organization: ${config.orgName}`];
    if (config.orgDescription) lines.push(`Description: ${config.orgDescription}`);
    lines.push('\nStructure:');
    config.nodes.forEach(n => {
      const agent = agents.find(a => a.id === n.agentId);
      const parent = config.nodes.find(p => p.id === n.parentId);
      lines.push(`  - ${n.label} (${agent?.name ?? 'Unassigned'})${parent ? ` → reports to ${parent.label}` : ' [CEO]'}`);
    });
    return lines.join('\n');
  }, [config, agents]);

  // ── Helper: run a single dept agent ────────────────────────────────────────

  const runDeptAgent = useCallback(async (
    deptNode: OrgNode,
    deptAgent: CustomAgent,
    delegatedTask: string,
    orgSummary: string,
    abortSignal: AbortSignal,
  ) => {
    let deptOutput = '';

    setActivationResults(prev => prev.map(r =>
      r.nodeId === deptNode.id ? { ...r, status: 'running', delegatedTask } : r
    ));

    const deptMessages: ChatMessage[] = [
      {
        role: 'user',
        content: `${delegatedTask}\n\nContext:\n${orgSummary}`,
      },
    ];

    const deptSystemMsg = buildSystemMessage({
      role: deptAgent.systemPrompt || `You are ${deptAgent.name}, a department AI agent. ${deptAgent.brief || ''}`,
    });

    try {
      await aiChatStreamViaProxy(
        [deptSystemMsg, ...deptMessages],
        (token: string) => {
          deptOutput += token;
          setActivationResults(prev => prev.map(r =>
            r.nodeId === deptNode.id ? { ...r, output: deptOutput } : r
          ));
        },
        abortSignal,
        4096,
        AI_MODELS.SONNET,
      );
      setActivationResults(prev => prev.map(r =>
        r.nodeId === deptNode.id ? { ...r, status: 'done' } : r
      ));
    } catch {
      setActivationResults(prev => prev.map(r =>
        r.nodeId === deptNode.id ? { ...r, status: 'error' } : r
      ));
    }

    return deptOutput;
  }, []);

  // ── Re-run single agent ────────────────────────────────────────────────────

  const handleRerunAgent = useCallback(async (nodeId: string) => {
    const targetNode  = config.nodes.find(n => n.id === nodeId);
    const targetAgent = targetNode ? agents.find(a => a.id === targetNode.agentId) : null;
    if (!targetNode || !targetAgent) return;

    const orgSummary = buildOrgSummary();
    const currentResult = activationResults.find(r => r.nodeId === nodeId);
    const delegatedTask = currentResult?.delegatedTask || missionText;

    const abortCtrl = new AbortController();
    abortRefs.current.push(abortCtrl);

    // Reset this agent's output
    setActivationResults(prev => prev.map(r =>
      r.nodeId === nodeId ? { ...r, output: '', status: 'running' } : r
    ));

    await runDeptAgent(targetNode, targetAgent, delegatedTask, orgSummary, abortCtrl.signal);
  }, [config.nodes, agents, buildOrgSummary, activationResults, missionText, runDeptAgent]);

  // ── Activate Organization (full run) ───────────────────────────────────────

  const handleActivate = async () => {
    if (!missionText.trim()) return;
    setShowMissionInput(false);
    setIsActivating(true);
    setShowActivation(true);

    // Abort any in-progress
    abortRefs.current.forEach(a => a.abort());
    abortRefs.current = [];

    const deptNodes = config.nodes.filter(n => n.parentId !== null && n.agentId);
    const ceoNode   = config.nodes.find(n => !n.parentId);
    const allNodes  = ceoNode ? [ceoNode, ...deptNodes] : deptNodes;

    const initResults: ActivationResult[] = allNodes.map((n, i) => {
      const agent = agents.find(a => a.id === n.agentId);
      return {
        nodeId: n.id,
        agentName: agent?.name ?? 'Agent',
        agentEmoji: agent?.emoji ?? '🤖',
        agentColor: agent?.color ?? '#0090ff',
        delegatedTask: i === 0 ? `Mission: ${missionText}` : '',
        output: '',
        status: i === 0 ? 'running' : 'pending',
      };
    });
    setActivationResults(initResults);

    const orgSummary = buildOrgSummary();

    // ── 1. CEO agent ───────────────────────────────────────────────────────
    const ceoAgent = ceoNode ? agents.find(a => a.id === ceoNode.agentId) : null;
    let ceoOutput = '';

    if (ceoAgent && ceoNode) {
      const ceoAbort = new AbortController();
      abortRefs.current.push(ceoAbort);

      const ceoMessages: ChatMessage[] = [
        {
          role: 'user',
          content: `You are orchestrating the following organization:\n\n${orgSummary}\n\nMission: ${missionText}\n\nBreak this mission into ${deptNodes.length} specific sub-tasks — one for each direct report. For each sub-task, start a new line with the format:\n[ROLE]: task description\n\nKeep each sub-task clear, actionable, and scoped to that department's expertise.`,
        },
      ];

      const ceoSystemMsg = buildSystemMessage({
        role: ceoAgent.systemPrompt || `You are ${ceoAgent.name}, a CEO AI agent. ${ceoAgent.brief || ''}`,
      });

      try {
        await aiChatStreamViaProxy(
          [ceoSystemMsg, ...ceoMessages],
          (token: string) => {
            ceoOutput += token;
            setActivationResults(prev => prev.map(r => r.nodeId === ceoNode.id ? { ...r, output: ceoOutput } : r));
          },
          ceoAbort.signal,
          4096,
          AI_MODELS.OPUS,
        );
      } catch { /* abort */ }

      setActivationResults(prev => prev.map(r =>
        r.nodeId === ceoNode.id ? { ...r, status: 'done' } : r
      ));
    }

    // ── 2. Parse CEO output → per-dept tasks ──────────────────────────────
    const parseTask = (agentLabel: string): string => {
      if (!ceoOutput) return missionText;
      const lines = ceoOutput.split('\n');
      for (const line of lines) {
        const match = line.match(/^\[([^\]]+)\]:\s*(.+)/);
        if (match && match[1].toLowerCase().includes(agentLabel.toLowerCase())) {
          return match[2].trim();
        }
      }
      return `As part of the mission "${missionText}", apply your expertise and produce a detailed action plan`;
    };

    // Mark all dept nodes as pending → running will be set by runDeptAgent
    setActivationResults(prev => prev.map(r =>
      r.nodeId !== ceoNode?.id ? { ...r, status: 'pending' } : r
    ));

    // ── 3. Parallel dept agents ────────────────────────────────────────────
    const deptOutputs = await Promise.all(
      deptNodes.map(async deptNode => {
        const deptAgent = agents.find(a => a.id === deptNode.agentId);
        if (!deptAgent) return { nodeId: deptNode.id, agentName: 'Unknown', task: '', output: '' };

        const delegatedTask = parseTask(deptNode.label);
        const abortCtrl = new AbortController();
        abortRefs.current.push(abortCtrl);

        const output = await runDeptAgent(deptNode, deptAgent, delegatedTask, orgSummary, abortCtrl.signal);
        return { nodeId: deptNode.id, agentName: deptAgent.name, task: delegatedTask, output };
      })
    );

    // ── 4. Save to activation memory ──────────────────────────────────────
    const newEntry: ActivationMemoryEntry = {
      mission: missionText,
      timestamp: new Date().toISOString(),
      results: [
        ...(ceoAgent && ceoOutput
          ? [{ agentName: ceoAgent.name, task: `Mission: ${missionText}`, output: ceoOutput }]
          : []),
        ...deptOutputs.filter(d => d.output),
      ],
    };

    setMemoryEntries(prev => {
      const updated = [...prev, newEntry];
      saveMemory(updated);
      return updated;
    });

    setIsActivating(false);
  };

  // Canvas min dimensions (accounting for zoom)
  const canvasMinW = Math.max(CANVAS_MIN_W, ...config.nodes.map(n => n.x + NODE_W + 40));
  const canvasMinH = Math.max(CANVAS_MIN_H, ...config.nodes.map(n => n.y + NODE_H + 40));

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top toolbar ── */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.04] shrink-0">
        {/* Org name */}
        <input
          value={config.orgName}
          onChange={e => updateMeta({ orgName: e.target.value })}
          className="text-[13px] font-black text-slate-800 dark:text-white bg-transparent border-none outline-none w-[180px] truncate"
          placeholder="Organization name"
        />
        <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08]" />

        {/* Tools */}
        <button
          onClick={applyAutoLayout}
          title="Auto layout"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-blue transition-all"
        >
          <LayoutGrid size={12} /> Auto Layout
        </button>
        <button
          onClick={() => {
            const ceoNode = config.nodes.find(n => !n.parentId);
            if (ceoNode) addNode(ceoNode.id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          <Plus size={12} /> Add Node
        </button>
        <button
          onClick={resetOrg}
          title="Reset to default"
          className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <RotateCcw size={13} />
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-brand-blue transition-colors"
          >
            <ZoomOut size={11} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="text-[9px] font-bold text-slate-400 dark:text-white/30 hover:text-brand-blue w-10 text-center transition-colors"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-brand-blue transition-colors"
          >
            <ZoomIn size={11} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-brand-blue transition-colors"
            title="Fit to screen"
          >
            <Maximize2 size={11} />
          </button>
        </div>

        <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08]" />

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-3 text-[9px] font-semibold text-slate-400 dark:text-white/25">
          <span>{config.nodes.length} nodes</span>
          <span>{config.nodes.filter(n => n.agentId).length} assigned</span>
        </div>

        {/* Activate */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowMissionInput(true)}
          disabled={isActivating}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-violet-500 text-white text-[11px] font-bold shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isActivating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {isActivating ? 'Activating...' : 'Activate Org'}
        </motion.button>

        {showActivation && (
          <button
            onClick={() => setShowActivation(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold hover:bg-emerald-500/20 transition-all"
          >
            View Results
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Canvas ── */}
        <div ref={canvasWrapRef} className="flex-1 overflow-auto bg-slate-50 dark:bg-[#080809]">
          {/* Zoom hint */}
          {zoom !== 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full bg-black/60 text-white/60 text-[9px] font-bold pointer-events-none">
              {Math.round(zoom * 100)}% · Ctrl+scroll to zoom
            </div>
          )}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: canvasMinW,
              height: canvasMinH,
            }}
          >
            {/* Dot grid background */}
            <div
              ref={canvasRef}
              className="relative"
              style={{
                minWidth: canvasMinW,
                minHeight: canvasMinH,
                backgroundImage: 'radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
              onClick={() => setSelectedNodeId(null)}
            >
              {/* SVG connections */}
              <OrgConnections nodes={config.nodes} activationResults={activationResults} />

              {/* Nodes */}
              <AnimatePresence>
                {config.nodes.map(node => {
                  const agent = agents.find(a => a.id === node.agentId) ?? null;
                  const actResult = activationResults.find(r => r.nodeId === node.id);
                  return (
                    <OrgNodeCard
                      key={node.id}
                      node={node}
                      agent={agent}
                      isSelected={selectedNodeId === node.id}
                      isActivating={isActivating}
                      activationStatus={actResult?.status}
                      onMouseDown={e => { handleNodeMouseDown(e, node.id); setSelectedNodeId(node.id); }}
                      onClick={() => setSelectedNodeId(node.id)}
                      onAddChild={() => { const id = addNode(node.id); setSelectedNodeId(id); }}
                      onDelete={() => { removeNode(node.id); setSelectedNodeId(null); }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Right panel: Node editor ── */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ x: 280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-[260px] shrink-0 border-l border-black/[0.05] dark:border-white/[0.04] bg-white dark:bg-[#0d0d0f] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.04]">
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-white/30 tracking-widest">Node Settings</p>
                <button onClick={() => setSelectedNodeId(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <X size={13} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Label */}
                <div>
                  <label className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 block mb-1.5">Position Label</label>
                  <input
                    value={editingLabel}
                    onChange={e => setEditingLabel(e.target.value)}
                    onBlur={() => updateNode(selectedNode.id, { label: editingLabel })}
                    onKeyDown={e => e.key === 'Enter' && updateNode(selectedNode.id, { label: editingLabel })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-blue/40"
                  />
                </div>

                {/* Agent assignment */}
                <div>
                  <label className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 block mb-2">Assign Agent</label>
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
                    {/* None option */}
                    <button
                      onClick={() => updateNode(selectedNode.id, { agentId: null })}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                        !selectedNode.agentId
                          ? 'border-brand-blue/40 bg-brand-blue/[0.05]'
                          : 'border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/20'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                        <X size={12} />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-white/40 font-medium">Unassigned</span>
                    </button>

                    {agents.map(agent => {
                      const isAssigned = selectedNode.agentId === agent.id;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => updateNode(selectedNode.id, { agentId: agent.id })}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                            isAssigned
                              ? 'border-current shadow-sm'
                              : 'border-black/[0.06] dark:border-white/[0.06] hover:border-current/30'
                          }`}
                          style={isAssigned ? {
                            backgroundColor: `${agent.color}10`,
                            borderColor: agent.color,
                            color: agent.color,
                          } : { color: agent.color }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ backgroundColor: `${agent.color}18` }}
                          >
                            {agent.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{agent.name}</p>
                            <p className="text-[8px] text-slate-400 truncate">{agent.role}</p>
                          </div>
                          {isAssigned && <CheckCircle2 size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Parent display */}
                {selectedNode.parentId && (
                  <div>
                    <label className="text-[8px] font-bold uppercase text-slate-400 dark:text-white/25 block mb-1.5">Reports To</label>
                    <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[10px] text-slate-500 dark:text-white/40">
                      {config.nodes.find(n => n.id === selectedNode.parentId)?.label ?? '—'}
                    </div>
                  </div>
                )}

                {/* Delete node */}
                {selectedNode.parentId && (
                  <button
                    onClick={() => { removeNode(selectedNode.id); setSelectedNodeId(null); }}
                    className="w-full py-2 rounded-xl border border-red-500/25 text-red-400 text-[10px] font-semibold hover:bg-red-500/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={11} /> Delete Node (+ children)
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* ── Mission input dialog ── */}
    <AnimatePresence>
      {showMissionInput && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[750] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowMissionInput(false)}
        >
          <motion.div
            initial={{ scale: 0.93, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.93, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[480px] bg-white dark:bg-[#111113] rounded-3xl shadow-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-violet-500 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-black text-slate-800 dark:text-white">Activate Organization</p>
                  <p className="text-[10px] text-slate-400">{config.orgName} · {config.nodes.filter(n => n.agentId).length} agents ready · parallel execution</p>
                </div>
              </div>

              <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">Mission / Task for the whole org</label>
              <textarea
                autoFocus
                value={missionText}
                onChange={e => setMissionText(e.target.value)}
                rows={4}
                placeholder="e.g. Launch a new AI productivity app targeting SMBs in Q2 2025. Coordinate across marketing, engineering, sales, and HR."
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[12px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none"
              />
              <p className="text-[9px] text-slate-400 mt-1.5">
                CEO Agent (Opus) will delegate → all departments run in parallel ⚡
              </p>
            </div>
            <div className="flex items-center justify-between px-6 pb-6 pt-0 gap-3">
              <button
                onClick={() => setShowMissionInput(false)}
                className="px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[11px] font-semibold text-slate-500 hover:border-slate-300 transition-all"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleActivate}
                disabled={!missionText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-violet-500 text-white text-[12px] font-bold shadow-lg disabled:opacity-40"
              >
                <Play size={13} /> Activate All Agents
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── Activation results modal ── */}
    <AnimatePresence>
      {showActivation && activationResults.length > 0 && (
        <ActivationModal
          results={activationResults}
          orgName={config.orgName}
          mission={missionText}
          onClose={() => { setShowActivation(false); if (!isActivating) setActivationResults([]); }}
          onRerunAgent={handleRerunAgent}
          isActivating={isActivating}
          memoryEntries={memoryEntries}
        />
      )}
    </AnimatePresence>
    </>
  );
};

export default OrgBuilderTab;
