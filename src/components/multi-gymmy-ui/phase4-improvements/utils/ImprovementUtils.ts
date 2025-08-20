// src/components/multi-gymmy-ui/phase4-improvements/utils/ImprovementUtils.ts
// Phase 4: Improvement Data Processing Utilities

import {
  // DESIGN_TOKENS,
  // getImprovementColor,
  // getValidationColor
} from '../../../../constants/designTokens';

// Types for improvement data
export interface ImprovementData {
  id: string;
  dimension: string;
  improvement_percentage: number;
  baseline_value: number;
  current_value: number;
  confidence_score: number;
  validation_status: 'pending' | 'validated' | 'rejected' | 'needs_review';
  detected_at: string;
  workout_context?: {
    workout_type: string;
    exercises_performed: string[];
  };
}

export interface ImprovementCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

// Improvement categories configuration
export const IMPROVEMENT_CATEGORIES: Record<string, ImprovementCategory> = {
  strength: {
    id: 'strength',
    name: 'Strength',
    color: DESIGN_TOKENS.colors.improvements.strength,
    icon: '💪',
    description: 'Muscle strength and power improvements',
  },
  endurance: {
    id: 'endurance',
    name: 'Endurance',
    color: DESIGN_TOKENS.colors.improvements.endurance,
    icon: '🏃‍♂️',
    description: 'Cardiovascular and muscular endurance',
  },
  flexibility: {
    id: 'flexibility',
    name: 'Flexibility',
    color: DESIGN_TOKENS.colors.improvements.flexibility,
    icon: '🧘‍♀️',
    description: 'Range of motion and flexibility gains',
  },
  technique: {
    id: 'technique',
    name: 'Technique',
    color: DESIGN_TOKENS.colors.improvements.technique,
    icon: '🎯',
    description: 'Form and movement quality improvements',
  },
  consistency: {
    id: 'consistency',
    name: 'Consistency',
    color: DESIGN_TOKENS.colors.improvements.consistency,
    icon: '📈',
    description: 'Workout frequency and adherence',
  },
  recovery: {
    id: 'recovery',
    name: 'Recovery',
    color: DESIGN_TOKENS.colors.improvements.recovery,
    icon: '😴',
    description: 'Recovery quality and adaptation',
  },
};

// Utility functions
export const formatImprovementPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

export const formatImprovementValue = (value: number, unit: string = ''): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k${unit}`;
  }
  return `${value.toFixed(1)}${unit}`;
};

export const getImprovementMagnitude = (percentage: number): 'micro' | 'small' | 'medium' | 'large' => {
  if (percentage < 1) return 'micro';
  if (percentage < 3) return 'small';
  if (percentage < 5) return 'medium';
  return 'large';
};

export const getImprovementMessage = (improvement: ImprovementData): string => {
  // const percentage = ...; // Quick fix: commented unused variable
  // const dimension = ...; // Quick fix: commented unused variable
  // const magnitude = ...; // Quick fix: commented unused variable
  
  const messages = {
    micro: `You've made a micro-improvement in ${improvement.dimension}!`,
    small: `Great progress! Your ${improvement.dimension} improved by ${percentage}!`,
    medium: `Excellent work! Your ${improvement.dimension} increased by ${percentage}!`,
    large: `Outstanding! Your ${improvement.dimension} jumped by ${percentage}!`,
  };
  
  return messages[magnitude];
};

export const getConfidenceMessage = (confidence: number): string => {
  // const percentage = ...; // Quick fix: commented unused variable
  
  if (confidence >= 0.9) return `Very high confidence (${percentage}%)`;
  if (confidence >= 0.8) return `High confidence (${percentage}%)`;
  if (confidence >= 0.7) return `Good confidence (${percentage}%)`;
  if (confidence >= 0.6) return `Moderate confidence (${percentage}%)`;
  return `Low confidence (${percentage}%)`;
};

export const getValidationStatusMessage = (status: string): string => {
  const messages = {
    validated: '✅ Scientifically validated',
    pending: '⏳ Awaiting validation',
    needs_review: '🔍 Needs review',
    rejected: '❌ Validation failed',
  };
  
  return messages[status] || 'Unknown status';
};

export const getImprovementCategory = (dimension: string): ImprovementCategory => {
  return IMPROVEMENT_CATEGORIES[dimension] || {
    id: dimension,
    name: dimension.charAt(0).toUpperCase() + dimension.slice(1),
    color: DESIGN_TOKENS.colors.primary,
    icon: '📊',
    description: 'Improvement in this area',
  };
};

export const calculateImprovementTrend = (improvements: ImprovementData[]): {
  trend: 'increasing' | 'decreasing' | 'stable';
  average: number;
  change: number;
} => {
  if (improvements.length < 2) {
    return { trend: 'stable', average: 0, change: 0 };
  }
  
  // const recent = ...; // Quick fix: commented unused variable // Last 5 improvements
  // const older = ...; // Quick fix: commented unused variable // Previous 5 improvements
  
  // const recentAverage = ...; // Quick fix: commented unused variable
  // const olderAverage = ...; // Quick fix: commented unused variable
  
  // const change = ...; // Quick fix: commented unused variable
  
  if (change > 0.5) return { trend: 'increasing', average: recentAverage, change };
  if (change < -0.5) return { trend: 'decreasing', average: recentAverage, change };
  return { trend: 'stable', average: recentAverage, change };
};

export const groupImprovementsByDimension = (improvements: ImprovementData[]): Record<string, ImprovementData[]> => {
  return improvements.reduce((groups, improvement) => {
    // const dimension = ...; // Quick fix: commented unused variable
    if (!groups[dimension]) {
      groups[dimension] = [];
    }
    groups[dimension].push(improvement);
    return groups;
  }, {} as Record<string, ImprovementData[]>);
};

export const sortImprovementsByDate = (improvements: ImprovementData[], ascending: boolean = false): ImprovementData[] => {
  return [...improvements].sort((a, b) => {
    // const dateA = ...; // Quick fix: commented unused variable
    // const dateB = ...; // Quick fix: commented unused variable
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const filterImprovementsByTimeframe = (
  improvements: ImprovementData[],
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time'
): ImprovementData[] => {
  // const now = ...; // Quick fix: commented unused variable
  // const cutoff = ...; // Quick fix: commented unused variable
  
  switch (timeframe) {
    case 'daily':
      cutoff.setDate(now.getDate() - 1);
      break;
    case 'weekly':
      cutoff.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      cutoff.setMonth(now.getMonth() - 1);
      break;
    case 'all_time':
      return improvements;
  }
  
  return improvements.filter(improvement => {
    // const improvementDate = ...; // Quick fix: commented unused variable
    return improvementDate >= cutoff;
  });
};

export const calculateStreak = (improvements: ImprovementData[]): number => {
  if (improvements.length === 0) return 0;
  
  // const sorted = ...; // Quick fix: commented unused variable
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    // const improvementDate = ...; // Quick fix: commented unused variable
    // const daysDiff = ...; // Quick fix: commented unused variable
    
    if (daysDiff <= 1) {
      streak++;
      currentDate = improvementDate;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getImprovementStats = (improvements: ImprovementData[]) => {
  if (improvements.length === 0) {
    return {
      total: 0,
      average: 0,
      largest: 0,
      smallest: 0,
      totalValue: 0,
    };
  }
  
  // const percentages = ...; // Quick fix: commented unused variable
  // const values = ...; // Quick fix: commented unused variable
  
  return {
    total: improvements.length,
    average: percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
    largest: Math.max(...percentages),
    smallest: Math.min(...percentages),
    totalValue: values.reduce((sum, v) => sum + v, 0),
  };
};

export const validateImprovementData = (improvement: ImprovementData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!improvement.id) errors.push('Missing improvement ID');
  if (!improvement.dimension) errors.push('Missing dimension');
  if (improvement.improvement_percentage <= 0) errors.push('Invalid improvement percentage');
  if (improvement.confidence_score < 0 || improvement.confidence_score > 1) {
    errors.push('Invalid confidence score');
  }
  if (!improvement.detected_at) errors.push('Missing detection timestamp');
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
