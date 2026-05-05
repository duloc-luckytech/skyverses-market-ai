import React from 'react';

/**
 * AtlasSection — page section wrapper.
 * Renders an outer <section> with vertical spacing and an optional centered container.
 */

type Width = 'narrow' | 'default' | 'wide' | 'full';
type Tone = 'page' | 'soft' | 'panel' | 'gradient';

export interface AtlasSectionProps extends React.HTMLAttributes<HTMLElement> {
  width?: Width;
  tone?: Tone;
  paddingY?: string; // tailwind override e.g. 'py-24'
  containerClassName?: string;
  noContainer?: boolean;
}

const widths: Record<Width, string> = {
  narrow: 'max-w-atlas-content',
  default: 'max-w-atlas-narrow',
  wide: 'max-w-atlas',
  full: 'max-w-none',
};

const tones: Record<Tone, string> = {
  page: 'bg-[var(--atlas-bg-page)]',
  soft: 'bg-[var(--atlas-bg-panel-hover)]',
  panel: 'bg-[var(--atlas-bg-panel)]',
  gradient:
    'bg-gradient-to-br from-white via-[#F5F0FF] to-[#EBF4FB] dark:from-[#0D0D1A] dark:via-[#1A1A2E] dark:to-[#0D0D1A]',
};

export const AtlasSection: React.FC<AtlasSectionProps> = ({
  width = 'default',
  tone = 'page',
  paddingY = 'py-12 md:py-20',
  containerClassName = '',
  noContainer = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <section className={`relative ${tones[tone]} ${paddingY} ${className}`} {...rest}>
      {noContainer ? (
        children
      ) : (
        <div className={`${widths[width]} mx-auto px-5 md:px-8 ${containerClassName}`}>
          {children}
        </div>
      )}
    </section>
  );
};

export default AtlasSection;
