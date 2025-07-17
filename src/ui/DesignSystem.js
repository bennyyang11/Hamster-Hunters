// Hamster Hunter Unified Design System
// Central source of truth for all UI styling

export const COLORS = {
  // Primary Brand Colors
  primary: '#4ecdc4',      // Teal
  secondary: '#ff6b6b',    // Coral Red
  accent: '#ffe66d',       // Golden Yellow
  success: '#4CAF50',      // Green
  warning: '#ffc107',      // Amber
  danger: '#f44336',       // Red
  
  // Background Gradients
  background: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%)',
    lobby: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #764ba2 100%)',
    dark: 'rgba(0,0,0,0.9)',
    overlay: 'rgba(0,0,0,0.8)',
    blur: 'rgba(0,0,0,0.6)',
  },
  
  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: '#e0e0e0',
    muted: '#ccc',
    dark: '#000000',
  },
  
  // Class-specific Colors
  classes: {
    'Tactical Chewer': '#4ecdc4',
    'Fluff \'n\' reload': '#ff6b6b',
    'Squeak or be Squeakened': '#ffe66d',
    'Guns and Whiskers': '#95e1d3'
  },
  
  // Team Colors
  teams: {
    'cheek-stuffers': '#4ecdc4',
    'wheel-warriors': '#ff6b6b'
  }
};

export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    primary: "'Orbitron', 'Arial', sans-serif",
    secondary: "'Rajdhani', 'Arial', sans-serif",
    fallback: "'Arial', sans-serif"
  },
  
  // Font Sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
    '5xl': '64px'
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  
  // Text Shadows
  textShadow: {
    sm: '1px 1px 2px rgba(0,0,0,0.5)',
    base: '2px 2px 4px rgba(0,0,0,0.5)',
    lg: '3px 3px 6px rgba(0,0,0,0.5)',
    xl: '4px 4px 8px rgba(0,0,0,0.8)'
  }
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  base: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px'
};

export const RADIUS = {
  sm: '4px',
  base: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px'
};

export const SHADOWS = {
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  base: '0 3px 6px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.23)',
  lg: '0 6px 12px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.23)',
  xl: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  glow: (color) => `0 0 20px ${color}40, 0 0 40px ${color}20`
};

export const ANIMATIONS = {
  transition: {
    fast: 'all 0.15s ease',
    base: 'all 0.3s ease',
    slow: 'all 0.5s ease'
  },
  
  hover: {
    scale: 'scale(1.05)',
    scaleDown: 'scale(0.95)',
    glow: 'brightness(1.1) drop-shadow(0 0 10px currentColor)'
  }
};

// Reusable Component Styles
export const COMPONENTS = {
  // Button Styles
  button: {
    base: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      fontSize: TYPOGRAPHY.fontSize.lg,
      padding: `${SPACING.base} ${SPACING.xl}`,
      borderRadius: RADIUS.lg,
      border: 'none',
      cursor: 'pointer',
      transition: ANIMATIONS.transition.base,
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.text.primary,
      boxShadow: SHADOWS.base
    },
    
    secondary: {
      backgroundColor: COLORS.secondary,
      color: COLORS.text.primary,
      boxShadow: SHADOWS.base
    },
    
    success: {
      backgroundColor: COLORS.success,
      color: COLORS.text.primary,
      boxShadow: SHADOWS.base
    },
    
    back: {
      backgroundColor: '#666',
      color: COLORS.text.primary,
      boxShadow: SHADOWS.base
    },
    
    disabled: {
      backgroundColor: '#333',
      color: '#666',
      cursor: 'not-allowed',
      boxShadow: 'none'
    }
  },
  
  // Card Styles
  card: {
    base: {
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      boxShadow: SHADOWS.lg,
      transition: ANIMATIONS.transition.base,
      border: '2px solid transparent'
    },
    
    hover: {
      transform: ANIMATIONS.hover.scale,
      boxShadow: SHADOWS.xl
    },
    
    selected: {
      transform: ANIMATIONS.hover.scale,
      boxShadow: SHADOWS.xl
    }
  },
  
  // Header Styles
  header: {
    title: {
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      fontSize: TYPOGRAPHY.fontSize['4xl'],
      fontWeight: TYPOGRAPHY.fontWeight.extrabold,
      textShadow: TYPOGRAPHY.textShadow.lg,
      margin: '0 0 20px 0',
      background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    
    subtitle: {
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.text.secondary,
      margin: '10px 0'
    }
  },
  
  // Navigation Breadcrumb
  breadcrumb: {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.text.muted
    },
    
    item: {
      padding: `${SPACING.xs} ${SPACING.base}`,
      borderRadius: RADIUS.base,
      backgroundColor: COLORS.background.blur,
      margin: `0 ${SPACING.xs}`
    },
    
    active: {
      backgroundColor: COLORS.primary,
      color: COLORS.text.primary,
      fontWeight: TYPOGRAPHY.fontWeight.bold
    }
  }
};

// Utility Functions
export const createGradientBackground = (color1, color2, angle = 135) => 
  `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;

export const createClassColorStyle = (className) => ({
  color: COLORS.classes[className] || COLORS.primary,
  borderColor: COLORS.classes[className] || COLORS.primary,
  background: `linear-gradient(135deg, ${COLORS.classes[className] || COLORS.primary}20, ${COLORS.classes[className] || COLORS.primary}40)`
});

export const createTeamColorStyle = (teamId) => ({
  color: COLORS.teams[teamId] || COLORS.primary,
  borderColor: COLORS.teams[teamId] || COLORS.primary,
  background: `linear-gradient(135deg, ${COLORS.teams[teamId] || COLORS.primary}20, ${COLORS.teams[teamId] || COLORS.primary}40)`
});

export const mergeStyles = (...styles) => Object.assign({}, ...styles); 