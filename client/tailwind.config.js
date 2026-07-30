/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clean, editorial color palette
        primary: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
        },
        surface: {
          50: '#fafbfc',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        success: {
          50: '#d3f9d8',
          100: '#b2f2bb',
          400: '#51cf66',
          500: '#40c057',
          600: '#2f9e44',
        },
        warning: {
          50: '#fff9db',
          100: '#fff3bf',
          400: '#fcc419',
          500: '#fab005',
          600: '#f59f00',
        },
        danger: {
          50: '#ffe3e3',
          100: '#ffc9c9',
          400: '#ff6b6b',
          500: '#fa5252',
          600: '#e03131',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(92, 124, 250, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'checkmark': 'checkmark 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        checkmark: {
          '0%': { strokeDashoffset: '50' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
