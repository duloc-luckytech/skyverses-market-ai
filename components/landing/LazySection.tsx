import React, { useRef, useState, useEffect } from 'react';

/**
 * LazySection — defers rendering children until the section scrolls into
 * (or near) the viewport.  While hidden it renders a skeleton placeholder.
 *
 * `rootMargin` controls how early the real content mounts — "200px" means
 * "start rendering when 200 px below the viewport".
 */
const LazySection: React.FC<{
  children: React.ReactNode;
  /** Skeleton shown before the section enters the viewport */
  skeleton?: React.ReactNode;
  /** Extra CSS class on the wrapper div */
  className?: string;
  /** IntersectionObserver rootMargin – how far ahead to start loading */
  rootMargin?: string;
  /** Minimum height for the skeleton wrapper (avoids layout jump) */
  minHeight?: number | string;
}> = ({ children, skeleton, className, rootMargin = '400px', minHeight }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  const wrapperStyle: React.CSSProperties = !visible
    ? {
        ...(minHeight ? { minHeight } : {}),
        contentVisibility: 'auto' as React.CSSProperties['contentVisibility'],
        containIntrinsicSize: typeof minHeight === 'number' ? `auto ${minHeight}px` : minHeight ? `auto ${minHeight}` : undefined,
      }
    : {};

  return (
    <div ref={ref} className={className} style={wrapperStyle}>
      {visible ? children : (skeleton ?? null)}
    </div>
  );
};

export default LazySection;
