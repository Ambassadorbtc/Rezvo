export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Reeve Now brand */
        primary: '#1A2744',
        'primary-hover': '#0F1A2E',
        accent: '#FFB627',
        'accent-hover': '#E5A020',
        background: '#FEFBF6',
        card: '#FFFFFF',
        border: '#E2E5EB',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        text: {
          main: '#1A2744',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        /* Deep Indigo spectrum */
        forest: {
          DEFAULT: '#1A2744',
          dark: '#0F1A2E',
          darker: '#080E1A'
        },
        sage: '#2A3F66',
        green: '#3A5588',
        mint: '#FFB627',
        'light-green': '#FFD166',
        'pale-green': '#FFF4D6',
        cream: '#FEFBF6',
        warm: '#F8F5EE',
        sand: '#E8E0D0',
        latte: '#D4C5A9',
        brown: '#8B7355',
        espresso: '#5C4A32',
        gold: '#FFB627',
        amber: '#E5A020',
        coral: '#E8634A',
        'off-white': '#F5F6FA',
        border: '#E2E5EB',
        'warm-border': '#DDD5C5',
        text: '#1A2744',
        muted: '#6B706D',
        subtle: '#9CA09E'
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        display: ['Figtree', 'system-ui', 'sans-serif'],
        heading: ['Figtree', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        input: '8px',
        pill: '100px'
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(26, 39, 68, 0.08)',
        'card-hover': '0 12px 40px -4px rgba(26, 39, 68, 0.15)'
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms'
      }
    }
  },
  plugins: []
}
