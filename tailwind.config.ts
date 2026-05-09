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
          blue: '#C9A84C',          // legacy alias → gold primary
          blueHover: '#B8963F',
          dark: '#0A0A0A',           // near-black
          gray: '#111111',           // dark surface
          muted: '#6B7280',
        },
        atlas: {
          // Primary gold (signature)
          DEFAULT: '#C9A84C',
          purple: '#C9A84C',        // kept key name for compat, now gold
          purpleHover: '#B8963F',
          purpleSoft: '#D4B85A',
          purpleLight: '#E5C767',
          // Secondary gold tones
          indigo: '#D4B85A',
          indigoHover: '#B8963F',
          deep: '#8B7635',
          // Surfaces (light theme)
          page: '#FFFFFF',
          panel: '#FFFFFF',
          panelHover: '#F5F5F7',
          card: '#FAF7F8',
          softBg: '#FBF8F0',
          // Borders & strokes
          border: '#E5E7EB',
          borderSoft: '#E8DDB8',
          // Text
          ink: '#0A0A0A',
          inkSoft: 'rgba(10,10,10,0.6)',
          inkMuted: 'rgba(10,10,10,0.45)',
          // Accent gold (sale/promo)
          orange: '#C9A84C',
          orangeBright: '#E5C767',
          orangeSoft: '#D4B85A',
          // Status
          success: '#01CE0F',
          info: '#0186CE',
          warning: '#CE7C01',
          error: '#CE2301',
          // Code / mono
          codeBg: '#0A0A0A',
          codeHeader: '#1A1A1A',
          codeText: '#C9A84C',
          // Dark surfaces (signature black)
          navy: '#0A0A0A',
          navyDeep: '#050505',
          navySoft: '#111111',
          // Pale backgrounds
          paleBlue: '#FBF8F0',
          palePurple: '#FDF9EE',
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
        // Brand glow (gold)
        'atlas-glow': '0 6px 16px rgba(201,168,76,.35), 0 4px 12px rgba(201,168,76,.40)',
        'atlas-glow-soft': '0 8px 24px rgba(201,168,76,.20)',
      },
      backgroundImage: {
        'atlas-cta': 'linear-gradient(135deg, #C9A84C 0%, #B8963F 100%)',
        'atlas-cta-hover': 'linear-gradient(135deg, #B8963F 0%, #8B7635 100%)',
        'atlas-banner': 'linear-gradient(135deg, #D4B85A 0%, #B8963F 100%)',
        'atlas-hero': 'linear-gradient(135deg, #FFFFFF 0%, #FDF9EE 50%, #FBF8F0 100%)',
        'atlas-hero-dark': 'linear-gradient(135deg, #111111 0%, #0A0A0A 100%)',
        'atlas-text': 'linear-gradient(135deg, #0A0A0A 0%, #C9A84C 50%, #E5C767 100%)',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,.4)' },
          '50%': { boxShadow: '0 0 0 18px rgba(201,168,76,0)' },
        },
        atlasShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
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
