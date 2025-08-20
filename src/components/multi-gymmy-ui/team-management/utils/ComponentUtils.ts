// src/components/multi-gymmy-ui/team-management/utils/ComponentUtils.ts
// Common utility functions and helpers for team management components

import {
  // TextStyle,
  // ViewStyle
} from 'react-native';

// Color utilities
export const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common': return '#8E8E93';
    case 'uncommon': return '#34C759';
    case 'rare': return '#007AFF';
    case 'epic': return '#AF52DE';
    case 'legendary': return '#FF9500';
    default: return '#8E8E93';
  }
};

export const getStatColor = (stat: string): string => {
  switch (stat.toLowerCase()) {
    case 'strength': return '#FF3B30';
    case 'agility': return '#34C759';
    case 'endurance': return '#007AFF';
    case 'intelligence': return '#AF52DE';
    case 'charisma': return '#FF9500';
    default: return '#8E8E93';
  }
};

export const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'tank': return '#FF3B30';
    case 'dps': return '#FF9500';
    case 'support': return '#34C759';
    case 'healer': return '#007AFF';
    case 'utility': return '#AF52DE';
    default: return '#8E8E93';
  }
};

export const getRoleIcon = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'tank': return 'shield';
    case 'dps': return 'flash';
    case 'support': return 'heart';
    case 'healer': return 'medical';
    case 'utility': return 'settings';
    default: return 'person';
  }
};

export const getSuggestionIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'add': return 'add-circle';
    case 'remove': return 'remove-circle';
    case 'replace': return 'swap-horizontal';
    case 'optimize': return 'trending-up';
    case 'balance': return 'scale';
    default: return 'information-circle';
  }
};

// Priority utilities
export const getPriorityStyle = (priority: string): ViewStyle => {
  switch (priority.toLowerCase()) {
    case 'high':
      return { backgroundColor: '#FFE5E5', borderColor: '#FF3B30' };
    case 'medium':
      return { backgroundColor: '#FFF9E5', borderColor: '#FF9500' };
    case 'low':
      return { backgroundColor: '#E5F9FF', borderColor: '#007AFF' };
    default:
      return { backgroundColor: '#F2F2F7', borderColor: '#8E8E93' };
  }
};

export const getPriorityBadgeStyle = (priority: string): ViewStyle => {
  switch (priority.toLowerCase()) {
    case 'high':
      return { backgroundColor: '#FF3B30' };
    case 'medium':
      return { backgroundColor: '#FF9500' };
    case 'low':
      return { backgroundColor: '#007AFF' };
    default:
      return { backgroundColor: '#8E8E93' };
  }
};

// Text utilities
export const getStatEffectiveness = (value: number): string => {
  if (value >= 80) return 'Excellent';
  if (value >= 60) return 'Good';
  if (value >= 40) return 'Average';
  if (value >= 20) return 'Poor';
  return 'Very Poor';
};

export const getRoleEffectiveness = (count: number): string => {
  if (count >= 3) return 'Over-covered';
  if (count === 2) return 'Well-covered';
  if (count === 1) return 'Covered';
  return 'Missing';
};

// Animation utilities
export const createScaleAnimation = (scale: number, duration: number = 200) => {
  return {
    toValue: scale,
    duration,
    useNativeDriver: true,
  };
};

export const createFadeAnimation = (opacity: number, duration: number = 200) => {
  return {
    toValue: opacity,
    duration,
    useNativeDriver: true,
  };
};

// Validation utilities
export // const validateTeamName = ...; // Quick fix: commented unused variable error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Team name is required' };
  }
  if (name.length < 3) {
    return { isValid: false, error: 'Team name must be at least 3 characters' };
  }
  if (name.length > 50) {
    return { isValid: false, error: 'Team name must be less than 50 characters' };
  }
  return { isValid: true };
};

export // const validatePresetName = ...; // Quick fix: commented unused variable error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Preset name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Preset name must be at least 2 characters' };
  }
  if (name.length > 30) {
    return { isValid: false, error: 'Preset name must be less than 30 characters' };
  }
  return { isValid: true };
};
