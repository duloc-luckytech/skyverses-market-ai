import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, CheckCircle2 } from 'lucide-react';
import { FadeInUp, SectionLabel } from '../_shared/SectionAnimations';

// ─── Types ─────────────────────────────────────────────────────
interface AgentRunItem {
  id: string;
  label: string;
  category: string;
  status: 'running' | 'completed' | 'waiting';
  model: string;
  department: string;
  cost: string;
  desc: string;
  tags?: string[];
}

// ─── Data ──────────────────────────────────────────────────────
const AGENT_RUNS: AgentRunItem[] = [
  {
    id: 'blog-campaign',
    label: 'Blog Content Campaign',
    category: 'Marketing',
    status: 'completed',
    model: 'claude-sonnet',
    department: 'Marketing AI',
    cost: '$0.24',
    desc: 'Marketing AI tự viết 5 blog posts SEO từ brief của CEO Agent. Output: 5 drafts + meta descriptions + internal links.',
    tags: ['Content', 'SEO', 'Marketing'],
  },
  {
    id: 'ci-pipeline',
    label: 'CI/CD Pipeline Refactor',
    category: 'DevOps',
    status: 'running',
    model: 'cursor + gpt-4o',
    department: 'DevOps AI',
    cost: '$0.18',
    desc: 'DevOps AI phân tích GitHub Actions config, refactor pipeline, giảm build time từ 8 phút xuống 3 phút.',
    tags: ['CI/CD', 'GitHub', 'DevOps'],
  },
  {
    id: 'crm-outreach',
    label: 'CRM Lead Outreach',
    category: 'Sales',
    status: 'completed',
    model: 'gpt-4o',
    department: 'Sales AI',
    cost: '$0.09',
    desc: 'Sales AI gửi 50 personalized email sequences từ HubSpot leads, track open rate, auto-follow-up sau 3 ngày.',
    tags: ['CRM', 'Email', 'Sales'],
  },
  {
    id: 'perf-audit',
    label: 'Performance Audit Report',
    category: 'DevOps',
    status: 'completed',
    model: 'claude-sonnet',
    department: 'DevOps AI',
    cost: '$0.31',
    desc: 'Tự động chạy Lighthouse audit cho 12 pages, phân tích Core Web Vitals, tạo báo cáo + fix recommendations.',
    tags: ['Performance', 'Web', 'Audit'],
  },
  {
    id: 'social-posts',
    label: 'Social Media Content Batch',
    category: 'Marketing',
    status: 'running',
    model: 'claude-sonnet',
    department: 'Marketing AI',
    cost: '$0.07',
    desc: 'Tạo 30 social posts (LinkedIn + X + Facebook) cho tháng 5. Brand voice consistent, hashtags optimized.',
    tags: ['Social', 'Content', 'Batch'],
  },
  {
    id: 'support-kb',
    label: 'Support Knowledge Base',
    category: 'Operations',
    status: 'waiting',
    model: 'gpt-4o',
    department: 'Ops AI',
    cost: '$0.00',
    desc: 'Đang chờ human approval để truy cập Notion database. Sẽ tổng hợp 200 support tickets thành FAQ docs.',
    tags: ['Support', 'Knowledge', 'Docs'],
  },
  {
    id: 'competitor-research',
    label: 'Competitor Analysis Q2',
    category: 'Marketing',
    status: 'completed',
    model: 'claude-sonnet',
    department: 'Marketing AI',
    cost: '$0.42',
    desc: 'Research 10 competitors: pricing, features, positioning. Output: 15-page analysis deck + SWOT matrix.',
    tags: ['Research', 'Strategy', 'Q2'],
  },
  {
    id: 'api-docs',
    label: 'API Documentation Update',
    category: 'DevOps',
    status: 'completed',
    model: 'cursor',
    department: 'DevOps AI',
    cost: '$0.15',
    desc: 'Cursor agent đọc toàn bộ codebase, tự update OpenAPI spec, generate code examples cho 45 endpoints.',
    tags: ['Docs', 'API', 'Code'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Marketing: '#8b5cf6',
  DevOps: '#10b981',
  Sales: '#f59e0b',
  Operations: '#ef4444',
};

const STATUS_CONFIG = {
  running: { color: '#0090ff', label: 'Running', pulse: true },
  completed: { color: '#10b981', label: 'Done', pulse: false },
  waiting: { color: '#f59e0b', label: 'Awaiting Approval', pulse: true },
};

const FILTERS = ['All', 'Marketing', 'DevOps', 'Sales', 'Operations'];

// ─── Single Run Card ───────────────────────────────────────────
const RunCard: React.FC<{ item: AgentRunItem; index: number }> = ({ item, index }) => {
  const catColor = CATEGORY_COLORS[item.category] ?? '#0090ff';
  const statusCfg = STATUS_CONFIG[item.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-black/[0.06] dark:border-white/[0.05] bg-white dark:bg-white/[0.015] overflow-hidden group hover:border-brand-blue/30 transition-colors"
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ backgroundColor: catColor, opacity: 0.5 }} />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-slate-800 dark:text-white/90 truncate">{item.label}</p>
            <p className="text-[10px] text-slate-400 dark:text-[#555] mt-0.5">{item.department} · {item.model}</p>
          </div>
          {/* Status badge */}
          <div
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${statusCfg.color}15`, border: `1px solid ${statusCfg.color}35` }}
          >
            {statusCfg.pulse ? (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.3, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusCfg.color }}
              />
            ) : (
              <CheckCircle2 size={9} style={{ color: statusCfg.color }} />
            )}
            <span className="text-[8px] font-bold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
          </div>
        </div>

        {/* Desc */}
        <p className="text-[11px] text-slate-500 dark:text-[#666] leading-relaxed line-clamp-2">{item.desc}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {item.tags?.slice(0, 2).map(t => (
              <span
                key={t}
                className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${catColor}15`,
                  color: catColor,
                  border: `1px solid ${catColor}35`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#555] flex items-center gap-1">
            <Cpu size={9} className="opacity-60" />
            {item.cost}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Section ───────────────────────────────────────────────
export const ShowcaseSection: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? AGENT_RUNS
    : AGENT_RUNS.filter(r => r.category === filter);

  const runningCount = filtered.filter(r => r.status === 'running').length;
  const doneCount = filtered.filter(r => r.status === 'completed').length;

  return (
    <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <FadeInUp className="mb-8">
          <SectionLabel>KẾT QUẢ THỰC TẾ</SectionLabel>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
            <div>
              <h2 className="text-3xl font-bold">
                Agent runs — đa phòng ban, đa LLM
              </h2>
              <p className="text-sm text-slate-500 dark:text-[#666] mt-1 max-w-lg">
                Mỗi card là một task thực tế — agents tự chạy, tự report, tự optimize cost
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue bg-brand-blue/[0.08] border border-brand-blue/15 px-3 py-1.5 rounded-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-2 h-2 rounded-full border border-brand-blue border-t-transparent"
                />
                {runningCount} running
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <Activity size={11} />
                {doneCount} done
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Filter pills */}
        <FadeInUp delay={0.07} className="mb-8">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                  filter === f
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/25'
                    : 'bg-transparent border-black/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-[#666] hover:border-brand-blue/40 hover:text-brand-blue'
                }`}
              >
                {f}
              </motion.button>
            ))}
            <span className="ml-auto self-center text-[10px] text-slate-400 dark:text-[#555]">
              {filtered.length} runs
            </span>
          </div>
        </FadeInUp>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {filtered.map((item, idx) => (
              <RunCard key={item.id} item={item} index={idx} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
