export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B4332',
          90: '#2D6A4F',
          70: '#40916C',
          50: '#52B788',
          30: '#74C69D'
        },
        sage: {
          DEFAULT: '#6B7C6E',
          light: '#95A397'
        },
        cream: '#FAFAF7',
        off: '#F7F8F6',
        border: {
          DEFAULT: '#E5E8E3',
          light: '#EDEEE9'
        },
        text: {
          DEFAULT: '#1a1a1a',
          secondary: '#4a4a4a',
          tertiary: '#777777',
          placeholder: '#aaaaaa'
        },
        gold: '#D4A017',
        red: '#C8362E'
      },
      fontFamily: {
        heading: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '16px',
        input: '8px',
        pill: '100px'
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.04)'
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms'
      }
    }
  },
  plugins: []
}
