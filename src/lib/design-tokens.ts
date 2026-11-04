/**
 * The Evidence OS - Design Tokens
 * Premium, futuristic, editorial-style AI operations platform
 */

export const tokens = {
  colors: {
    background: {
      primary: '#080A10',
      secondary: '#0D111B',
      surface: '#121824',
      elevated: '#192232',
    },
    brand: {
      violet: '#8B7CFF',
      cyan: '#62DCEB',
    },
    status: {
      success: '#29D6A0',
      warning: '#F2BB5B',
      danger: '#F16D7A',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      tertiary: '#64748B',
    },
    border: {
      subtle: 'rgba(148, 163, 184, 0.1)',
      default: 'rgba(148, 163, 184, 0.2)',
      hover: 'rgba(148, 163, 184, 0.3)',
    },
  },

  typography: {
    display: {
      font: "'Space Grotesk', system-ui, -apple-system, sans-serif",
      tracking: '-0.02em',
    },
    sans: {
      font: "'Inter', system-ui, -apple-system, sans-serif",
    },
    mono: {
      font: "'JetBrains Mono', monospace",
    },
    label: {
      size: '0.75rem',
      weight: '600',
      tracking: '0.05em',
      transform: 'uppercase',
    },
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
  },

  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(139, 124, 255, 0.15)',
  },
};

export const gradients = {
  violet: 'linear-gradient(135deg, #8B7CFF 0%, #7C8CFF 100%)',
  cyan: 'linear-gradient(135deg, #62DCEB 0%, #4DD9E8 100%)',
  blend: 'linear-gradient(135deg, #8B7CFF 0%, #62DCEB 100%)',
  subtle: 'linear-gradient(180deg, rgba(139, 124, 255, 0.05) 0%, transparent 100%)',
};
