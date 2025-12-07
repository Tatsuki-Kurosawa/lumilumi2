/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // メインカラー（ネイビー）: #1E3A8A
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8191f8',
          500: '#1E3A8A', // メインカラー
          600: '#1e3a8a',
          700: '#1a2f6e',
          800: '#152552',
          900: '#0f1c36',
        },
        // アクセントカラー（アンバーイエロー）: #FBBF24
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FBBF24', // アクセントカラー
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // テキストカラー（スレートグレー）: #1E293B
        text: {
          primary: '#1E293B',
          secondary: '#64748b',
          tertiary: '#94a3b8',
        },
        // 背景色
        bg: {
          base: '#FFFFFF',
          secondary: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 8px rgba(30, 58, 138, 0.08)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
