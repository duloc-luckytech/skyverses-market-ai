import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Building2, Code2, Megaphone, Users, BarChart3,
  CheckCircle2, ChevronLeft, ChevronRight, Play, X, Zap,
} from 'lucide-react';

// ─── Shared dept/model data (mirrored from Workspace) ────────────────────────

const WIZARD_DEPTS = [
  {
    id: 'marketing',
    label: 'Marketing AI',
    icon: Megaphone,
    color: '#8b5cf6',
    agent: 'Marketing Agent',
    desc: 'Tạo content SEO, social media, email campaign',
    tasks: ['Viết content SEO', 'Social media posts', 'Email campaign', 'Competitor analysis'],
  },
  {
    id: 'devops',
    label: 'DevOps AI',
    icon: Code2,
    color: '#10b981',
    agent: 'DevOps Agent',
    desc: 'CI/CD pipeline, code review, deploy automation',
    tasks: ['CI/CD pipeline', 'Code review', 'Deploy automation', 'Performance audit'],
  },
  {
    id: 'sales',
    label: 'Sales AI',
    icon: BarChart3,
    color: '#f59e0b',
    agent: 'Sales Agent',
    desc: 'Lead outreach, CRM, proposal drafting',
    tasks: ['Lead outreach', 'CRM follow-up', 'Proposal drafting', 'Deal analysis'],
  },
  {
    id: 'hr',
    label: 'HR AI',
    icon: Users,
    color: '#06b6d4',
    agent: 'HR Agent',
    desc: 'Job description, screening, onboarding docs',
    tasks: ['Job description', 'Screening filter', 'Onboarding docs', 'Policy drafts'],
  },
];

const COST_EXAMPLES = [
  { min: 1,  label: '~$1  = 3–5 tasks nhỏ',            icon: '🌱' },
  { min: 5,  label: '~$5  = 15–20 tasks (recommended)', icon: '⭐' },
  { min: 10, label: '~$10 = 30+ tasks + Canvas runs',   icon: '🚀' },
  { min: 20, label: '~$20 = 60+ tasks, production use', icon: '🏢' },
];

const STEPS = [
  { id: 'welcome', title: 'Chào mừng đến Paperclip AI' },
  { id: 'dept',    title: 'Chọn Agent của bạn'          },
  { id: 'task',    title: 'Task đầu tiên của bạn'        },
  { id: 'budget',  title: 'Cài giới hạn Budget'          },
  { id: 'ready',   title: 'Sẵn sàng rồi! 🚀'            },
];

// ─── Exported types ───────────────────────────────────────────────────────────

export interface WizardResult {
  dept: string;
  budget: number;
  prompt: string;
  runDemo: boolean;
}

interface OnboardingWizardProps {
  onComplete: (result: WizardResult) => void;
  onSkip: () => void;
}

// ─── Step content components ──────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
        <Network size={28} className="text-brand-blue" />
      </div>
      <p className="text-[13px] text-slate-600 dark:text-white/60 leading-relaxed">
        Paperclip AI Agents là workspace điều phối nhiều AI agents — mỗi phòng ban một agent chuyên biệt, hoạt động song song dưới sự chỉ huy của CEO Agent.
      </p>
      <ul className="space-y-3">
        {[
          ['🤖', 'Điều phối nhiều AI agents song song (CEO → Marketing / DevOps / Sales / HR)'],
          ['🛡️', 'Budget Guard — hard limit tự động, mọi action đều có audit log'],
          ['📊', 'Analytics & lịch sử task đầy đủ với export JSON'],
          ['⚡', 'Canvas multi-agent orchestration với drag & drop'],
        ].map(([emoji, text]) => (
          <li key={String(text)} className="flex items-start gap-3 text-[12px] text-slate-700 dark:text-white/70">
            <span className="text-base shrink-0 leading-snug">{emoji}</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepDept({ selectedDept, onSelect }: { selectedDept: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] text-slate-500 dark:text-[#888]">
        Chọn agent phù hợp với task đầu tiên của bạn. Bạn có thể thay đổi bất cứ lúc nào.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {WIZARD_DEPTS.map(d => {
          const Icon = d.icon;
          const isSelected = selectedDept === d.id;
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className="p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={isSelected ? {
                borderColor: d.color,
                backgroundColor: `${d.color}10`,
                boxShadow: `0 4px 20px ${d.color}25`,
              } : {
                borderColor: 'rgba(0,0,0,0.07)',
                backgroundColor: 'transparent',
              }}
            >
              <Icon size={22} style={{ color: d.color }} className="mb-2" />
              <p className="text-[12px] font-bold text-slate-800 dark:text-white">{d.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{d.desc}</p>
              {isSelected && (
                <div className="mt-2.5 flex items-center gap-1 text-[9px] font-bold" style={{ color: d.color }}>
                  <CheckCircle2 size={10} /> Đã chọn
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTask({ selectedDept }: { selectedDept: string }) {
  const dept = WIZARD_DEPTS.find(d => d.id === selectedDept)!;
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-slate-500 dark:text-[#888]">
        Workspace sẽ tự động điền task này khi bạn bắt đầu:
      </p>
      <textarea
        readOnly
        value={dept.tasks[0]}
        rows={2}
        className="w-full text-[13px] bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-700 dark:text-white/80 resize-none focus:outline-none"
      />
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hoặc chọn task khác:</p>
        <div className="flex gap-2 flex-wrap">
          {dept.tasks.map(t => (
            <span
              key={t}
              className="px-3 py-1 rounded-full border border-brand-blue/20 bg-brand-blue/[0.05] text-[10px] font-semibold text-brand-blue"
            >
              <Zap size={8} className="inline mr-1 opacity-60" />
              {t}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-[#555] bg-slate-50 dark:bg-white/[0.03] rounded-xl px-3 py-2 border border-slate-100 dark:border-white/[0.05]">
        💡 Bạn có thể thay đổi task bất cứ lúc nào trong workspace. Đây chỉ là gợi ý để bắt đầu nhanh.
      </p>
    </div>
  );
}

function StepBudget({ budget, onChange }: { budget: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-[12px] text-slate-500 dark:text-[#888]">
        Budget Guard sẽ tự động dừng agent khi sắp vượt limit để bảo vệ chi phí.
      </p>
      <div className="text-center py-2">
        <p className="text-[48px] font-black text-slate-800 dark:text-white leading-none">${budget}</p>
        <p className="text-[11px] text-slate-400 mt-1">spending limit</p>
      </div>
      <input
        type="range"
        min={1}
        max={20}
        step={1}
        value={budget}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-brand-blue h-2 rounded-full"
      />
      <div className="flex justify-between text-[9px] text-slate-300 dark:text-[#444] -mt-2 px-0.5">
        <span>$1</span><span>$5</span><span>$10</span><span>$15</span><span>$20</span>
      </div>
      <div className="space-y-2 pt-1">
        {COST_EXAMPLES.map(ex => (
          <div
            key={ex.min}
            className={`flex items-center gap-2.5 text-[11px] transition-colors duration-200 ${
              budget >= ex.min ? 'text-slate-700 dark:text-white/70' : 'text-slate-300 dark:text-[#333]'
            }`}
          >
            <span className="text-base">{budget >= ex.min ? '✅' : '○'}</span>
            <span className="font-mono">{ex.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepReady({ selectedDept, budget }: { selectedDept: string; budget: number }) {
  const dept = WIZARD_DEPTS.find(d => d.id === selectedDept)!;
  const Icon = dept.icon;
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: `${dept.color}40`, backgroundColor: `${dept.color}08` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${dept.color}20` }}
          >
            <Icon size={24} style={{ color: dept.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-black text-slate-800 dark:text-white">{dept.label}</p>
            <p className="text-[10px] text-slate-400">{dept.agent} · Sẵn sàng</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full border shrink-0"
            style={{ backgroundColor: `${dept.color}12`, borderColor: `${dept.color}35` }}
          >
            <p className="text-[13px] font-black" style={{ color: dept.color }}>${budget}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Task đầu tiên</p>
          <p className="text-[12px] text-slate-700 dark:text-white/80">"{dept.tasks[0]}"</p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-[#555] text-center px-2">
        Nhấn <strong className="text-brand-blue">Bắt đầu!</strong> để chạy demo ngay — hoặc khám phá workspace tự do sau khi đóng.
      </p>
    </div>
  );
}

// ─── Main wizard component ────────────────────────────────────────────────────

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep]             = useState(0);
  const [direction, setDirection]   = useState(1);
  const [selectedDept, setSelectedDept] = useState('marketing');
  const [budget, setBudget]         = useState(5);

  const goNext = () => { setDirection(1);  setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const handleStart = () => {
    const dept = WIZARD_DEPTS.find(d => d.id === selectedDept)!;
    onComplete({ dept: selectedDept, budget, prompt: dept.tasks[0], runDemo: true });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-[580px] bg-white dark:bg-[#111113] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-1.5 px-7 pt-6 pb-0">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className="h-1.5 flex-1 rounded-full transition-all duration-400"
              style={{
                backgroundColor: i <= step ? '#0090ff' : 'rgba(0,0,0,0.07)',
              }}
            />
          ))}
          <button
            onClick={onSkip}
            className="ml-3 p-1 text-slate-300 hover:text-slate-500 dark:text-[#444] dark:hover:text-[#888] transition-colors shrink-0"
            title="Bỏ qua"
          >
            <X size={14} />
          </button>
        </div>

        {/* Step header */}
        <div className="px-7 pt-5 pb-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-widest">
            Bước {step + 1} / {STEPS.length}
          </p>
          <h2 className="text-[20px] font-black text-slate-800 dark:text-white mt-0.5 leading-tight">
            {STEPS[step].title}
          </h2>
        </div>

        {/* Step content — slide animation */}
        <div className="flex-1 overflow-hidden min-h-[300px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 50 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="px-7 py-4"
            >
              {step === 0 && <StepWelcome />}
              {step === 1 && <StepDept selectedDept={selectedDept} onSelect={setSelectedDept} />}
              {step === 2 && <StepTask selectedDept={selectedDept} />}
              {step === 3 && <StepBudget budget={budget} onChange={setBudget} />}
              {step === 4 && <StepReady selectedDept={selectedDept} budget={budget} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-7 pb-7 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-slate-500 dark:text-[#666] text-[11px] font-semibold disabled:opacity-30 hover:border-slate-300 dark:hover:border-white/20 transition-all"
          >
            <ChevronLeft size={13} /> Quay lại
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-blue text-white text-[11px] font-bold shadow-md shadow-brand-blue/20 hover:brightness-110 transition-all"
            >
              Tiếp theo <ChevronRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[12px] font-bold uppercase tracking-wider shadow-lg shadow-brand-blue/25 hover:brightness-110 transition-all"
              style={{ background: 'linear-gradient(135deg, #0090ff, #3b82f6)' }}
            >
              <Play size={14} /> Bắt đầu!
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
