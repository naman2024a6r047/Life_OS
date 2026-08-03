/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        background: '#090A0F',
        surface: '#11131A',
        'surface-elevated': '#161821',
        'surface-hover': '#1A1D27',
        
        // Borders
        'border-subtle': '#1F2332',
        'border-hover': '#92F13B40', // 25% opacity neon green
        
        // Brand / Primary (Neon Green)
        primary: '#92F13B',
        'primary-light': '#B2FF66',
        'primary-dark': '#75D124',
        
        // Accent colors
        accent: '#92F13B', // Changed accent to primary as well to keep the theme tight
        success: '#92F13B', // Green for success
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#06B6D4',
        purple: '#A855F7',
        
        // Text
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(146, 241, 59, 0.15)', // Neon green glow
        'glow-success': '0 0 20px rgba(146, 241, 59, 0.15)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(146, 241, 59, 0.1)', // Subtle green glow on hover
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
