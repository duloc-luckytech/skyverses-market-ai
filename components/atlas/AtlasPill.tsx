import React from 'react';

type Tone = 'purple' | 'orange' | 'success' | 'info' | 'warning' | 'neutral';

export interface AtlasPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: React.ReactNode;
}

const tones: Record<Tone, string> = {
  purple: 'bg-atlas-purple/10 text-atlas-purple border-atlas-purple/20 dark:text-atlas-purpleSoft',
  orange: 'bg-atlas-orange/10 text-atlas-orangeBright border-atlas-orange/20',
  success: 'bg-atlas-success/10 text-atlas-success border-atlas-success/20',
  info: 'bg-atlas-info/10 text-atlas-info border-atlas-info/20',
  warning: 'bg-atlas-warning/10 text-atlas-warning border-atlas-warning/20',
  neutral: 'bg-[var(--atlas-bg-panel-hover)] text-[var(--atlas-text-secondary)] border-[var(--atlas-border)]',
};

export const AtlasPill: React.FC<AtlasPillProps> = ({
  tone = 'purple',
  icon,
  className = '',
  children,
  ...rest
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${tones[tone]} ${className}`}
    {...rest}
  >
    {icon && <span className="flex-none">{icon}</span>}
    {children}
  </span>
);

export default AtlasPill;
