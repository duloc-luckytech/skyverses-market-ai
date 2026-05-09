import React from 'react';

/**
 * AtlasCard — Atlas Cloud-style surface.
 * - 8px radius, soft border, hover lifts with brand-purple glow.
 * - `variant` controls padding density and accent.
 */

type Variant = 'default' | 'soft' | 'outlined' | 'gradient' | 'glass';
type Padding = 'none' | 'sm' | 'md' | 'lg';

export interface AtlasCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  hover?: boolean;
  as?: React.ElementType;
}

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variants: Record<Variant, string> = {
  default:
    'bg-[var(--atlas-bg-panel)] border border-[var(--atlas-border)]',
  soft:
    'bg-[var(--atlas-bg-panel-hover)] border border-transparent',
  outlined:
    'bg-transparent border border-[var(--atlas-border)]',
  gradient:
    'border border-[var(--atlas-border-soft)] bg-gradient-to-br from-white via-[#FDF9EE] to-[#FBF8F0] dark:from-[#111111] dark:via-[#1A1A1A] dark:to-[#0A0A0A]',
  glass:
    'atlas-glass',
};

export const AtlasCard: React.FC<AtlasCardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) => {
  const Component: React.ElementType = Tag;
  const hoverClass = hover
    ? 'transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:shadow-atlas-glow-soft hover:border-[var(--atlas-border-soft)]'
    : '';
  return (
    <Component
      className={`rounded-atlas-card ${variants[variant]} ${paddings[padding]} ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default AtlasCard;
