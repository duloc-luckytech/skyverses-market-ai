
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Package, Image, Cpu, Send } from 'lucide-react';
import { SUBMISSION_STEPS } from '../../hooks/useAppsPage';

interface StepIndicatorProps {
  currentStep: number;
  onGoToStep: (step: number) => void;
  completionPercent: number;
}

const STEP_ICONS = [Package, Image, Cpu, Send];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onGoToStep, completionPercent }) => {
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Tiến trình</span>
        <span className="text-[11px] font-bold text-brand-blue">{completionPercent}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-blue to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-1.5 mt-4">
        {SUBMISSION_STEPS.map((step) => {
          const Icon = STEP_ICONS[step.id - 1];
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => onGoToStep(step.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                  : isCompleted
                    ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/[0.1]'
                    : 'text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                isActive
                  ? 'bg-white/20'
                  : isCompleted
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                    : 'bg-slate-100 dark:bg-white/[0.04]'
              }`}>
                {isCompleted ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Icon size={14} className={isActive ? 'text-white' : ''} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[12px] font-bold truncate ${isActive ? 'text-white' : ''}`}>
                  {step.title}
                </p>
                <p className={`text-[10px] truncate ${
                  isActive ? 'text-white/60' : 'text-slate-300 dark:text-gray-600'
                }`}>
                  {step.desc}
                </p>
              </div>
              <span className={`text-[10px] font-bold shrink-0 ${
                isActive ? 'text-white/40' : isCompleted ? 'text-emerald-500' : 'text-slate-300 dark:text-gray-600'
              }`}>
                {isCompleted ? '✓' : `${step.id}/4`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
