import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * AtlasButton — Atlas Cloud-style CTA.
 * - Default variant uses 135deg purple gradient + glow on hover.
 * - Border radius defaults to 4px (pill via `pill` prop).
 * - Polymorphic: renders <Link> if `to` is set, <a> if `href`, else <button>.
 *
 * NOTE: keeps logic untouched — drop in anywhere a <button> previously sat.
 */

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

interface ButtonProps
  extends CommonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  to?: undefined;
  href?: undefined;
}

interface LinkProps extends CommonProps {
  to: string;
  href?: undefined;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

interface AnchorProps
  extends CommonProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> {
  href: string;
  to?: undefined;
}

export type AtlasButtonProps = ButtonProps | LinkProps | AnchorProps;

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
};

const variantClasses: Record<Variant, string> = {
  primary:
    'text-white bg-[linear-gradient(135deg,#7036F0_0%,#5326B5_100%)] hover:bg-[linear-gradient(135deg,#5326B5_0%,#2E1670_100%)] hover:shadow-atlas-glow active:scale-[.98]',
  secondary:
    'text-white bg-[linear-gradient(135deg,#615EFF_0%,#4744CC_100%)] hover:shadow-atlas-glow active:scale-[.98]',
  outline:
    'text-[var(--atlas-text-primary)] bg-transparent border border-[var(--atlas-border)] hover:border-atlas-purple hover:text-atlas-purple hover:bg-atlas-purple/5',
  ghost:
    'text-[var(--atlas-text-primary)] bg-transparent hover:bg-[var(--atlas-bg-panel-hover)] hover:text-atlas-purple',
  danger:
    'text-white bg-atlas-error hover:bg-[#A11A01] active:scale-[.98]',
};

export const AtlasButton = forwardRef<HTMLElement, AtlasButtonProps>(function AtlasButton(
  props,
  ref,
) {
  const {
    variant = 'primary',
    size = 'md',
    pill = false,
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    className = '',
    children,
    ...rest
  } = props as CommonProps & Record<string, unknown>;

  const base =
    'inline-flex items-center justify-center font-semibold leading-none transition-all duration-200 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-atlas-purple/60 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const radius = pill ? 'rounded-full' : 'rounded';
  const width = fullWidth ? 'w-full' : '';
  const cn = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${radius} ${width} ${className}`;

  const content = (
    <>
      {loading ? (
        <span
          aria-hidden
          className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
        />
      ) : (
        leftIcon && <span className="flex-none">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {rightIcon && !loading && <span className="flex-none">{rightIcon}</span>}
    </>
  );

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as { to: string } & Record<string, unknown>;
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        to={to}
        className={cn}
        {...(linkRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as { href: string } & Record<string, unknown>;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cn}
        {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn}
      disabled={loading || (rest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

export default AtlasButton;
