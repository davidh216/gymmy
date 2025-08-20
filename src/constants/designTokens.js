// src/constants/designTokens.js
export const DESIGN_TOKENS = {
  // Spacing system (based on 4px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Typography scale
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 28,
  },
  
  // Color palette
  colors: {
    // Primary brand colors
    primary: '#007AFF',
    primaryLight: '#4DA6FF',
    primaryDark: '#0056CC',
      
    // Status colors
    success: '#22c55e',
    successLight: '#4ade80',
    successDark: '#16a34a',
      
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',
      
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
      
    // Special colors for gamification
    gold: '#ffd700',
    purple: '#8b5cf6',
    orange: '#ff6b35',
    blue: '#1E90FF',
    green: '#10b981',
      
    // Neutral colors
    background: '#f8f9fa',
    backgroundSecondary: '#f1f3f4',
    card: '#ffffff',
    cardSecondary: '#f9fafb',
      
    // Text colors
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#cccccc',
    textInverse: '#ffffff',
      
    // Border colors
    border: '#e9ecef',
    borderLight: '#f1f3f4',
    borderDark: '#dee2e6',
      
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
      
    // Rating colors (dynamic)
    ratingExcellent: '#22c55e',  // 8-10
    ratingGood: '#84cc16',       // 6-7
    ratingFair: '#eab308',       // 4-5
    ratingPoor: '#f97316',       // 2-3
    ratingBad: '#ef4444',        // 0-1

    // Phase 4: 1% Better System Colors
    // Celebration colors
    celebration: {
      primary: '#FF6B35',      // Energetic orange
      secondary: '#4ECDC4',    // Fresh teal
      accent: '#FFE66D',       // Bright yellow
      success: '#95E1D3',      // Soft mint
      highlight: '#FF8A80',    // Coral pink
    },

    // Improvement categories
    improvements: {
      strength: '#FF6B35',     // Power orange
      endurance: '#4ECDC4',    // Endurance teal
      flexibility: '#A8E6CF',  // Flexibility mint
      technique: '#FFE66D',    // Skill yellow
      consistency: '#FF8A80',  // Consistency coral
      recovery: '#B8E6B8',     // Recovery green
    },

    // Scientific validation colors
    validation: {
      high: '#4CAF50',         // High confidence green
      medium: '#FF9800',       // Medium confidence orange
      low: '#F44336',          // Low confidence red
      pending: '#9E9E9E',      // Pending gray
    },

    // Segment-specific themes
    segments: {
      strength_seeker: '#FF6B35',    // Power orange
      calorie_crusher: '#FF4757',    // Energy red
      body_optimizer: '#8B5CF6',     // Transformation purple
      wellness_seeker: '#4ECDC4',    // Wellness teal
      endurance_athlete: '#10B981',  // Endurance green
      habit_builder: '#FFA726',      // Consistency orange
      social_enthusiast: '#FF69B4',  // Social pink
    },
  },
  
  // Component dimensions
  cardWidth: {
    achievement: 160,
    template: 120,
    stat: 'flex-1',  // For flex containers
  },
  
  // Border radius system
  borderRadius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,  // For circular elements
  },
  
  // Shadow system
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Icon sizes
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Animation durations (in milliseconds)
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    // Phase 4: Celebration animations
    celebration: {
      duration: 3000,
      easing: 'bounce',
      particleCount: 25,
      scale: 1.2,
    },
    microImprovement: {
      duration: 1500,
      easing: 'elastic',
      particleCount: 15,
      scale: 1.1,
    },
    validation: {
      duration: 2000,
      easing: 'ease-in-out',
      particleCount: 10,
      scale: 1.05,
    },
  },
  
  // Screen breakpoints (for responsive design)
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  },
};
  
// Utility functions for working with design tokens
export const getSpacing = (...values) => {
  return values.map(value => DESIGN_TOKENS.spacing[value] || value).join(' ');
};
  
export const getFontSize = (size) => {
  return DESIGN_TOKENS.fontSize[size] || size;
};
  
export const getColor = (color, variant = '') => {
  if (variant) {
    return DESIGN_TOKENS.colors[`${color}${variant}`] || DESIGN_TOKENS.colors[color];
  }
  return DESIGN_TOKENS.colors[color] || color;
};
  
export const getShadow = (size) => {
  return DESIGN_TOKENS.shadows[size] || DESIGN_TOKENS.shadows.md;
};

// Phase 4: Get celebration color
export const getCelebrationColor = (type = 'primary') => {
  return DESIGN_TOKENS.colors.celebration[type] || DESIGN_TOKENS.colors.celebration.primary;
};

// Phase 4: Get improvement color
export const getImprovementColor = (category) => {
  return DESIGN_TOKENS.colors.improvements[category] || DESIGN_TOKENS.colors.celebration.primary;
};

// Phase 4: Get validation color
export const getValidationColor = (confidence) => {
  if (confidence >= 0.8) return DESIGN_TOKENS.colors.validation.high;
  if (confidence >= 0.6) return DESIGN_TOKENS.colors.validation.medium;
  if (confidence >= 0.4) return DESIGN_TOKENS.colors.validation.low;
  return DESIGN_TOKENS.colors.validation.pending;
};

// Phase 4: Get segment color
export const getSegmentColor = (segment) => {
  return DESIGN_TOKENS.colors.segments[segment] || DESIGN_TOKENS.colors.primary;
};
  
// Common style combinations
export const COMMON_STYLES = {
  // Card styles
  card: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
  },
    
  cardLight: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.sm,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: DESIGN_TOKENS.borderRadius.xl,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.backgroundSecondary,
    borderRadius: DESIGN_TOKENS.borderRadius.xl,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
  },
  
  // Text styles
  headingLarge: {
    fontSize: DESIGN_TOKENS.fontSize.xxxl,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.text,
    lineHeight: DESIGN_TOKENS.fontSize.xxxl * 1.2,
  },
  
  headingMedium: {
    fontSize: DESIGN_TOKENS.fontSize.xl,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.text,
    lineHeight: DESIGN_TOKENS.fontSize.xl * 1.3,
  },
  
  bodyText: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    color: DESIGN_TOKENS.colors.textSecondary,
    lineHeight: DESIGN_TOKENS.fontSize.md * 1.5,
  },
  
  captionText: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    color: DESIGN_TOKENS.colors.textTertiary,
    lineHeight: DESIGN_TOKENS.fontSize.sm * 1.4,
  },
  
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  
  section: {
    marginVertical: DESIGN_TOKENS.spacing.md,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Phase 4: Celebration styles
  celebrationCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    padding: DESIGN_TOKENS.spacing.lg,
    ...DESIGN_TOKENS.shadows.lg,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.colors.celebration.primary,
  },

  celebrationText: {
    fontSize: DESIGN_TOKENS.fontSize.xxl,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.celebration.primary,
    textAlign: 'center',
  },

  validationCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN_TOKENS.colors.validation.high,
  },

  analyticsCard: {
    backgroundColor: DESIGN_TOKENS.colors.card,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    padding: DESIGN_TOKENS.spacing.md,
    ...DESIGN_TOKENS.shadows.md,
    marginVertical: DESIGN_TOKENS.spacing.sm,
  },
};
  
export default DESIGN_TOKENS;