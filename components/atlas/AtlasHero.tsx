import React from 'react';

/**
 * AtlasHero — the headline section pattern from atlascloud.ai.
 * - Centered max-width container
 * - Decorative purple gradient blob (top-right) + grid hint
 * - Tight tracking, big display headline
 * - Stagger reveal via .atlas-stagger
 *
 * Compose freely: pass headline / sub / actions / extra slots.
 */

export interface AtlasHeroProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  extra?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  decorative?: boolean;
}

export const AtlasHero: React.FC<AtlasHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  actions,
  extra,
  align = 'center',
  className = '',
  decorative = true,
}) => {
  const alignment =
    align === 'center'
      ? 'text-center items-center mx-auto'
      : 'text-left items-start';

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {decorative && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 right-[-10%] w-[520px] h-[520px] rounded-full opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(circle at center, rgba(201, 168, 76,.35) 0%, rgba(201, 168, 76,0) 70%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 left-[-10%] w-[480px] h-[480px] rounded-full opacity-40 blur-3xl"
            style={{
              background:
                'radial-gradient(circle at center, rgba(229, 199, 103,.25) 0%, rgba(229, 199, 103,0) 70%)',
            }}
          />
        </>
      )}

      <div className={`relative z-10 atlas-container py-16 md:py-28`}>
        <div className={`flex flex-col gap-6 atlas-stagger ${alignment} max-w-3xl`}>
          {eyebrow && (
            <div style={{ ['--i' as string]: 0 }}>
              {eyebrow}
            </div>
          )}
          <h1
            className="text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--atlas-text-primary)]"
            style={{ ['--i' as string]: 1 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-base md:text-lg text-[var(--atlas-text-secondary)] leading-relaxed max-w-2xl"
              style={{ ['--i' as string]: 2 }}
            >
              {subtitle}
            </p>
          )}
          {actions && (
            <div
              className={`flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''} mt-2`}
              style={{ ['--i' as string]: 3 }}
            >
              {actions}
            </div>
          )}
          {extra && (
            <div className="mt-8 w-full" style={{ ['--i' as string]: 4 }}>
              {extra}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AtlasHero;
