import React, { useState, useCallback } from 'react';

/**
 * LazyImage — shows a shimmer skeleton while the image is loading,
 * then fades in the actual image.  Uses native `loading="lazy"`.
 */
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({ src, alt, className = '', style, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);

  return (
    <div className={`relative overflow-hidden ${className}`} style={style} onClick={onClick}>
      {/* Shimmer skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200/60 dark:bg-white/[0.04] animate-pulse">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={onLoad}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default LazyImage;
