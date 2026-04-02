/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#44AADF',
        },
        status: {
          todo: '#6B7280',
          in_progress: '#3B82F6',
          in_review: '#8B5CF6',
          done: '#22C55E',
          blocked: '#EF4444',
        },
        priority: {
          urgent: '#EF4444',
          high: '#F97316',
          medium: '#EAB308',
          low: '#3B82F6',
          none: '#6B7280',
        },
      },
      fontFamily: {
        heading: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 28px rgba(0,0,0,0.14), 0 3px 8px rgba(0,0,0,0.08)',
        'panel':      '0 0 40px rgba(0,0,0,0.3)',
        'lift':       '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        'lift-lg':    '0 16px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.10)',
        'glow-blue':  '0 4px 14px rgba(68,170,223,0.35)',
      },
      animation: {
        'slide-in':       'slideIn 0.32s cubic-bezier(0,0,0.2,1)',
        'slide-out':      'slideOut 0.25s cubic-bezier(0.4,0,1,1)',
        'fade-in':        'fadeIn 0.2s ease-out',
        'scale-in':       'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-slide-up':  'fadeSlideUp 0.35s cubic-bezier(0,0,0.2,1) both',
        'pop-in':         'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        slideOut: {
          '0%':   { transform: 'translateX(0)',    opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '60%':  { transform: 'scale(1.02)' },
          '80%':  { transform: 'scale(0.99)' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        fadeSlideUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92) translateY(6px)' },
          '65%':  {               transform: 'scale(1.02) translateY(-1px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '60px',
        'task-panel': '480px',
      },
    },
  },
  plugins: [],
};
