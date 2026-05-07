/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Brand tokens — Atlas Cloud-inspired palette.
         * `brand-blue` is kept as an alias for backward-compat (now points to Atlas purple)
         * so 300+ existing usages of `bg-brand-blue / text-brand-blue / border-brand-blue`
         * automatically pick up the new accent without manual edits.
         */
        brand: {
          blue: '#7036F0',          // legacy alias → Atlas primary
          blueHover: '#5326B5',
          dark: '#1A2330',           // near-black (Atlas headline color)
          gray: '#1A1A2E',           // dark surface (used in dark mode hero)
          muted: '#6B7280',
        },
        atlas: {
          // Primary purple (Atlas Cloud signature)
          DEFAULT: '#7036F0',
          purple: '#7036F0',
          purpleHover: '#5326B5',
          purpleSoft: '#7B5AF6',
          purpleLight: '#7F72F7',
          // Indigo / lavender accents
          indigo: '#615EFF',
          indigoHover: '#4744CC',
          deep: '#2E1670',
          // Surfaces (light theme)
          page: '#FFFFFF',
          panel: '#FFFFFF',
          panelHover: '#F5F5F7',
          card: '#FAF7F8',
          softBg: '#EBF4FB',
          // Borders & strokes
          border: '#E5E7EB',
          borderSoft: '#DAD0FF',
          // Text
          ink: '#1A2330',
          inkSoft: 'rgba(26,35,48,0.6)',
          inkMuted: 'rgba(26,35,48,0.45)',
          // Accent orange (sale/promo)
          orange: '#F38236',
          orangeBright: '#FE6C11',
          orangeSoft: '#FF8356',
          // Status
          success: '#01CE0F',
          info: '#0186CE',
          warning: '#CE7C01',
          error: '#CE2301',
          // Code / mono
          codeBg: '#1E1E1E',
          codeHeader: '#2D2D2D',
          codeText: '#00C2A5',
          // Dark navy for CTA + footer (atlas signature)
          navy: '#0D0D1A',
          navyDeep: '#08080F',
          navySoft: '#1A1A2E',
          // Pale page bg (atlas left-side wash)
          paleBlue: '#EBF4FB',
          palePurple: '#F4F0FF',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        mono: ['"Fragment Mono"', '"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // Atlas headline scale
        'hero': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'hero-mobile': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        'section': ['1.375rem', { lineHeight: '1.4', fontWeight: '700' }],
      },
      letterSpacing: {
        tightest: '-0.02em',
        tight2: '-0.015em',
      },
      borderRadius: {
        // Atlas dominant 4px — set as default
        DEFAULT: '4px',
        sm: '2px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        atlas: '4px',
        'atlas-card': '8px',
      },
      boxShadow: {
        // Atlas 4-tier shadow scale
        'atlas-xs': '0 0 4px 0 rgba(0,0,0,.05)',
        'atlas-sm': '0 1px 2px -1px rgba(10,13,18,.10), 0 1px 3px 0 rgba(10,13,18,.10)',
        'atlas-md': '0 4px 12px rgba(0,0,0,.15)',
        'atlas-lg': '0 20px 25px -5px rgba(0,0,0,.10), 0 8px 10px -6px rgba(0,0,0,.10)',
        'atlas-xl': '0 24px 48px -12px rgba(0,0,0,.18), 0 12px 24px -8px rgba(0,0,0,.12)',
        // Brand glow
        'atlas-glow': '0 6px 16px rgba(123,90,246,.35), 0 4px 12px rgba(112,54,240,.40)',
        'atlas-glow-soft': '0 8px 24px rgba(95,65,207,.20)',
      },
      backgroundImage: {
        'atlas-cta': 'linear-gradient(135deg, #7036F0 0%, #5326B5 100%)',
        'atlas-cta-hover': 'linear-gradient(135deg, #5326B5 0%, #2E1670 100%)',
        'atlas-banner': 'linear-gradient(135deg, #615EFF 0%, #4744CC 100%)',
        'atlas-hero': 'linear-gradient(135deg, #FFFFFF 0%, #F5F0FF 50%, #EBF4FB 100%)',
        'atlas-hero-dark': 'linear-gradient(135deg, #1A1A2E 0%, #0D0D1A 100%)',
        'atlas-text': 'linear-gradient(135deg, #1A2330 0%, #7036F0 50%, #FE6C11 100%)',
      },
      transitionTimingFunction: {
        'atlas': 'cubic-bezier(.22,1,.36,1)',
        'atlas-spring': 'cubic-bezier(.34,1.56,.64,1)',
        'atlas-modal': 'cubic-bezier(.215,.61,.355,1)',
      },
      transitionDuration: {
        'atlas': '200ms',
      },
      maxWidth: {
        'atlas': '1300px',
        'atlas-narrow': '1200px',
        'atlas-content': '1024px',
      },
      keyframes: {
        atlasFadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        atlasFadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        atlasPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(112,54,240,.4)' },
          '50%': { boxShadow: '0 0 0 18px rgba(112,54,240,0)' },
        },
        atlasShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'atlas-fade-in-up': 'atlasFadeInUp .6s cubic-bezier(.22,1,.36,1) forwards',
        'atlas-fade-in': 'atlasFadeIn .4s ease-out forwards',
        'atlas-pulse': 'atlasPulse 2s ease-in-out infinite',
        'atlas-shimmer': 'atlasShimmer 2s linear infinite',
      },
    }
  },
  plugins: [],
}
