/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                display: ['Fraunces', 'Georgia', 'serif'],
                heading: ['Outfit', '-apple-system', 'sans-serif'],
            },
            colors: {
                // Rezvo Brand Colors - Monzo/Starling inspired
                cream: {
                    DEFAULT: '#FDFBF7',
                    50: '#FFFFFF',
                    100: '#FDFBF7',
                    200: '#F5F0E8',
                },
                teal: {
                    DEFAULT: '#00BFA5',
                    50: '#E0FBF7',
                    100: '#B3F5EC',
                    200: '#80EEE0',
                    300: '#4DE7D4',
                    400: '#26E0C8',
                    500: '#00BFA5',
                    600: '#00A896',
                    700: '#008F80',
                    800: '#00766A',
                    900: '#005D54',
                },
                coral: {
                    DEFAULT: '#FF6B6B',
                    50: '#FFF0F0',
                    100: '#FFE0E0',
                    200: '#FFBFBF',
                    300: '#FF9F9F',
                    400: '#FF8080',
                    500: '#FF6B6B',
                    600: '#FF5252',
                    700: '#FF3838',
                },
                navy: {
                    DEFAULT: '#1A2B3C',
                    50: '#F0F4F8',
                    100: '#D9E2EC',
                    200: '#BCCCDC',
                    300: '#9FB3C8',
                    400: '#829AB1',
                    500: '#627D98',
                    600: '#486581',
                    700: '#334E68',
                    800: '#243B53',
                    900: '#1A2B3C',
                },
                // Semantic colors via CSS variables
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                success: '#10B981',
                warning: '#F59E0B',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
                '4xl': '2.5rem',
            },
            boxShadow: {
                'card': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
                'card-hover': '0 20px 50px -12px rgba(0, 0, 0, 0.12)',
                'button': '0 4px 12px rgba(0, 191, 165, 0.3)',
                'button-hover': '0 8px 20px rgba(0, 191, 165, 0.4)',
                'float': '0 20px 50px -12px rgba(0, 0, 0, 0.15)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' }
                },
                'fade-in-up': {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
