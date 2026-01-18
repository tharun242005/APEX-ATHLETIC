export const theme = {
  colors: {
    // Energetic dark theme colors
    primary: '#0D1B2A', // Very dark navy blue
    surface: '#1B263B', // Lighter blue-gray
    accent: '#00F5D4', // Vibrant cyan
    text: {
      primary: '#FFFFFF', // Pure white
      secondary: '#E0E6ED', // Light blue-gray
      muted: '#8A9BA8' // Muted blue-gray
    },
    success: '#00F5D4', // Cyan for success
    warning: '#FFD700', // Gold for warnings
    error: '#FF6B6B', // Coral red for errors
    info: '#4ECDC4', // Teal for info
    // Additional energetic colors
    purple: '#8B5CF6', // Purple accent
    orange: '#FF8C42', // Orange accent
    pink: '#FF6B9D', // Pink accent
    // Background variations
    background: {
      primary: '#0D1B2A',
      secondary: '#1B263B',
      tertiary: '#2A3441',
      surface: '#1B263B'
    },
    // Border colors
    border: {
      primary: '#2A3441',
      secondary: '#3A4552',
      accent: '#00F5D4'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Bebas Neue', 'Impact', 'Arial Black', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    }
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(0, 245, 212, 0.3)',
    'glow-lg': '0 0 40px rgba(0, 245, 212, 0.4)',
    'glow-xl': '0 0 60px rgba(0, 245, 212, 0.5)',
    neon: '0 0 5px #00F5D4, 0 0 10px #00F5D4, 0 0 15px #00F5D4'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
    surface: 'linear-gradient(135deg, #1B263B 0%, #0D1B2A 100%)',
    accent: 'linear-gradient(135deg, #8B5CF6 0%, #FF6B9D 100%)',
    energy: 'linear-gradient(135deg, #00F5D4 0%, #8B5CF6 50%, #FF6B9D 100%)'
  }
}

export type Theme = typeof theme