/** @type {import('tailwindcss').Config} */
export default {
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
        'card': '0 2px 8px rgba(0,0,0,0.15)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.2)',
        'panel': '0 0 40px rgba(0,0,0,0.3)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
