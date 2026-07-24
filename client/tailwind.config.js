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
        background: '#0B0D18',
        surface: '#111427',
        'surface-elevated': '#161A2E',
        'surface-hover': '#1C2039',
        
        // Borders
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(255, 255, 255, 0.15)',
        
        // Brand / Primary
        primary: '#6366F1',
        'primary-light': '#818CF8',
        'primary-dark': '#4F46E5',
        
        // Accent colors
        accent: '#F43F5E',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#06B6D4',
        purple: '#A855F7',
        
        // Text
        'text-primary': '#F1F5F9',
        'text-secondary': '#64748B',
        'text-muted': '#475569',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
