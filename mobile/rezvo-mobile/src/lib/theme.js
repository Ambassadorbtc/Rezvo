// Rezvo Mobile Theme - Matching Web App
export const colors = {
  // Primary palette
  primary: '#00BFA5',
  primaryLight: '#4DE7D4',
  primaryDark: '#008F80',
  
  // Secondary
  secondary: '#FF6B6B',
  secondaryLight: '#FF9F9F',
  
  // Neutrals
  background: '#FDFBF7',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F0E8',
  
  // Text
  text: '#0A1626',
  textMuted: '#627D98',
  textLight: '#9FB3C8',
  
  // Navy accents
  navy: '#1A2B3C',
  navyLight: '#334E68',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Overlays
  overlay: 'rgba(10, 22, 38, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    display: 'SpaceGrotesk_700Bold',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
