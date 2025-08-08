// src/components/multi-gymmy-ui/shared/CharacterUtils.tsx
// Character-specific utilities and helper functions for Multi-Gymmy UI components

import { useMemo } from 'react';
import { GymmyCharacter, GymmyRarity, SpecializationType } from '../../../context/types/MultiGymmyTypes';

// ==============================================================================
// CHARACTER VISUAL CONFIGURATIONS
// ==============================================================================

export const CHARACTER_VISUAL_CONFIG = {
  rarity: {
    common: {
      borderColor: '#8E8E93',
      backgroundColor: '#F2F2F7',
      glowColor: '#8E8E93',
      textColor: '#3C3C43',
      intensity: 0.1,
    },
    rare: {
      borderColor: '#007AFF',
      backgroundColor: '#E5F2FF',
      glowColor: '#007AFF',
      textColor: '#007AFF',
      intensity: 0.3,
    },
    epic: {
      borderColor: '#AF52DE',
      backgroundColor: '#F5E8FF',
      glowColor: '#AF52DE',
      textColor: '#AF52DE',
      intensity: 0.5,
    },
    legendary: {
      borderColor: '#FF9500',
      backgroundColor: '#FFF1E5',
      glowColor: '#FF9500',
      textColor: '#FF9500',
      intensity: 0.7,
    },
    mythical: {
      borderColor: '#FF2D92',
      backgroundColor: '#FFE5F1',
      glowColor: '#FF2D92',
      textColor: '#FF2D92',
      intensity: 1.0,
    },
  },
  
  specialization: {
    strength_training: {
      emoji: '💪',
      color: '#FF3B30',
      gradient: ['#FF3B30', '#FF9500'],
      icon: 'dumbbell',
    },
    cardio_endurance: {
      emoji: '🏃',
      color: '#007AFF',
      gradient: ['#007AFF', '#5AC8FA'],
      icon: 'heart-pulse',
    },
    flexibility_mobility: {
      emoji: '🧘',
      color: '#34C759',
      gradient: ['#34C759', '#30D158'],
      icon: 'leaf',
    },
    mental_wellness: {
      emoji: '🧠',
      color: '#AF52DE',
      gradient: ['#AF52DE', '#BF5AF2'],
      icon: 'brain',
    },
    athletic_performance: {
      emoji: '⚡',
      color: '#FF9500',
      gradient: ['#FF9500', '#FFCC02'],
      icon: 'zap',
    },
    habit_formation: {
      emoji: '📊',
      color: '#5AC8FA',
      gradient: ['#5AC8FA', '#007AFF'],
      icon: 'trending-up',
    },
    social_motivation: {
      emoji: '🤝',
      color: '#FF2D92',
      gradient: ['#FF2D92', '#FF375F'],
      icon: 'users',
    },
    versatile_training: {
      emoji: '🎯',
      color: '#8E8E93',
      gradient: ['#8E8E93', '#AEAEB2'],
      icon: 'target',
    },
  },
  
  mood: {
    excited: {
      emoji: '✨',
      color: '#FFD60A',
      effect: 'sparkle',
    },
    happy: {
      emoji: '😊',
      color: '#30D158',
      effect: 'glow',
    },
    focused: {
      emoji: '🎯',
      color: '#007AFF',
      effect: 'pulse',
    },
    tired: {
      emoji: '😴',
      color: '#8E8E93',
      effect: 'fade',
    },
    motivated: {
      emoji: '🔥',
      color: '#FF3B30',
      effect: 'flame',
    },
  },
} as const;

// ==============================================================================
// CHARACTER STATE UTILITIES
// ==============================================================================

/**
 * Get character visual theme based on rarity and specialization
 */
export const useCharacterTheme = (character: GymmyCharacter) => {
  return useMemo(() => {
    const rarityConfig = CHARACTER_VISUAL_CONFIG.rarity[character.rarity];
    const specializationConfig = CHARACTER_VISUAL_CONFIG.specialization[character.specialization];
    
    return {
      rarity: rarityConfig,
      specialization: specializationConfig,
      combined: {
        primaryColor: specializationConfig.color,
        secondaryColor: rarityConfig.borderColor,
        backgroundColor: rarityConfig.backgroundColor,
        gradient: specializationConfig.gradient,
        glowIntensity: rarityConfig.intensity,
        emoji: specializationConfig.emoji,
      },
    };
  }, [character.rarity, character.specialization]);
};

/**
 * Calculate character display stats for UI
 */
export const useCharacterDisplayStats = (character: GymmyCharacter) => {
  return useMemo(() => {
    const stats = character.current_stats;
    const totalStats = Object.values(stats).reduce((sum, stat) => sum + stat, 0);
    const averageStat = totalStats / Object.keys(stats).length;
    
    // Find dominant stat
    const statEntries = Object.entries(stats);
    const dominantStat = statEntries.reduce((highest, [key, value]) => 
      value > highest.value ? { key, value } : highest,
      { key: statEntries[0][0], value: statEntries[0][1] }
    );
    
    return {
      totalStats,
      averageStat: Math.round(averageStat),
      dominantStat: dominantStat.key as keyof typeof stats,
      dominantValue: dominantStat.value,
      statDistribution: Object.entries(stats).map(([key, value]) => ({
        stat: key,
        value,
        percentage: Math.round((value / totalStats) * 100),
        isHighest: key === dominantStat.key,
      })),
    };
  }, [character.current_stats]);
};

/**
 * Get character mood based on recent activity and stats
 */
export const useCharacterMood = (
  character: GymmyCharacter, 
  recentWorkout?: boolean,
  experienceGained?: number
) => {
  return useMemo(() => {
    let moodKey: keyof typeof CHARACTER_VISUAL_CONFIG.mood = 'happy';
    
    // Determine mood based on various factors
    if (experienceGained && experienceGained > 50) {
      moodKey = 'excited';
    } else if (recentWorkout) {
      moodKey = character.current_stats.motivation > 80 ? 'motivated' : 'focused';
    } else if (character.current_stats.focus < 30) {
      moodKey = 'tired';
    } else if (character.current_stats.motivation > 70) {
      moodKey = 'motivated';
    }
    
    return {
      key: moodKey,
      config: CHARACTER_VISUAL_CONFIG.mood[moodKey],
      description: getMoodDescription(moodKey, character),
    };
  }, [character, recentWorkout, experienceGained]);
};

/**
 * Calculate evolution progress for UI display
 */
export const useEvolutionProgress = (character: GymmyCharacter) => {
  return useMemo(() => {
    const currentStage = character.evolution_stage || 0;
    const maxStage = character.max_evolution || 3;
    const progressPercentage = (currentStage / maxStage) * 100;
    
    return {
      currentStage,
      maxStage,
      progressPercentage: Math.round(progressPercentage),
      canEvolve: currentStage < maxStage,
      isMaxEvolution: currentStage >= maxStage,
      nextStageName: getEvolutionStageName(currentStage + 1),
      currentStageName: getEvolutionStageName(currentStage),
    };
  }, [character.evolution_stage, character.max_evolution]);
};

/**
 * Get character level progress for experience visualization
 */
export const useLevelProgress = (character: GymmyCharacter, experienceTable?: Record<number, number>) => {
  return useMemo(() => {
    const currentLevel = character.level;
    const currentExp = character.current_exp || 0;
    
    // If no experience table provided, use simple calculation
    const expForCurrentLevel = experienceTable?.[currentLevel] || (currentLevel * 100);
    const expForNextLevel = experienceTable?.[currentLevel + 1] || ((currentLevel + 1) * 100);
    
    const expInCurrentLevel = currentExp - expForCurrentLevel;
    const expRequiredForLevel = expForNextLevel - expForCurrentLevel;
    const progressPercentage = Math.max(0, Math.min(100, (expInCurrentLevel / expRequiredForLevel) * 100));
    
    return {
      currentLevel,
      currentExp,
      expForNextLevel,
      expToNextLevel: Math.max(0, expForNextLevel - currentExp),
      progressPercentage: Math.round(progressPercentage),
      isMaxLevel: currentLevel >= 100,
    };
  }, [character.level, character.current_exp, experienceTable]);
};

// ==============================================================================
// CHARACTER FORMATTING UTILITIES
// ==============================================================================

/**
 * Format character name with rarity indicator
 */
export const formatCharacterName = (character: GymmyCharacter, showRarity = true) => {
  const rarityIndicator = showRarity ? getRarityStars(character.rarity) : '';
  return `${character.display_name}${rarityIndicator ? ` ${rarityIndicator}` : ''}`;
};

/**
 * Get rarity visual representation
 */
export const getRarityStars = (rarity: GymmyRarity): string => {
  const stars = {
    common: '⭐',
    rare: '⭐⭐',
    epic: '⭐⭐⭐',
    legendary: '⭐⭐⭐⭐',
    mythical: '⭐⭐⭐⭐⭐',
  };
  return stars[rarity];
};

/**
 * Get character type display name
 */
export const getCharacterTypeDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    power: 'Power Gymmy',
    blaze: 'Blaze Gymmy',
    transform: 'Transform Gymmy',
    zen: 'Zen Gymmy',
    pace: 'Pace Gymmy',
    steady: 'Steady Gymmy',
    rally: 'Rally Gymmy',
    rookie: 'Rookie Gymmy',
    specialist: 'Specialist',
    seasonal: 'Seasonal',
    legendary: 'Legendary',
    community: 'Community',
  };
  return displayNames[type] || type;
};

/**
 * Get specialization display name
 */
export const getSpecializationDisplayName = (specialization: SpecializationType): string => {
  const displayNames: Record<SpecializationType, string> = {
    strength_training: 'Strength Training',
    cardio_endurance: 'Cardio & Endurance',
    flexibility_mobility: 'Flexibility & Mobility',
    mental_wellness: 'Mental Wellness',
    athletic_performance: 'Athletic Performance',
    habit_formation: 'Habit Formation',
    social_motivation: 'Social Motivation',
    versatile_training: 'Versatile Training',
  };
  return displayNames[specialization];
};

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

function getMoodDescription(mood: keyof typeof CHARACTER_VISUAL_CONFIG.mood, character: GymmyCharacter): string {
  const descriptions = {
    excited: `${character.display_name} is buzzing with energy!`,
    happy: `${character.display_name} is feeling great!`,
    focused: `${character.display_name} is in the zone.`,
    tired: `${character.display_name} needs some rest.`,
    motivated: `${character.display_name} is fired up!`,
  };
  return descriptions[mood];
}

function getEvolutionStageName(stage: number): string {
  const stageNames = {
    0: 'Base Form',
    1: 'First Evolution',
    2: 'Second Evolution',
    3: 'Final Form',
  };
  return stageNames[stage as keyof typeof stageNames] || `Stage ${stage}`;
}

/**
 * Character comparison utility for sorting/filtering
 */
export const compareCharacters = (a: GymmyCharacter, b: GymmyCharacter, sortBy: 'level' | 'rarity' | 'name' | 'type') => {
  switch (sortBy) {
    case 'level':
      return b.level - a.level;
    case 'rarity':
      const rarityOrder = { mythical: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    case 'name':
      return a.display_name.localeCompare(b.display_name);
    case 'type':
      return a.type.localeCompare(b.type);
    default:
      return 0;
  }
};

/**
 * Character filter utility
 */
export const filterCharacters = (
  characters: GymmyCharacter[], 
  filters: {
    rarity?: GymmyRarity[];
    specialization?: SpecializationType[];
    minLevel?: number;
    maxLevel?: number;
    searchTerm?: string;
  }
) => {
  return characters.filter(character => {
    // Rarity filter
    if (filters.rarity && filters.rarity.length > 0 && !filters.rarity.includes(character.rarity)) {
      return false;
    }
    
    // Specialization filter
    if (filters.specialization && filters.specialization.length > 0 && !filters.specialization.includes(character.specialization)) {
      return false;
    }
    
    // Level range filter
    if (filters.minLevel !== undefined && character.level < filters.minLevel) {
      return false;
    }
    if (filters.maxLevel !== undefined && character.level > filters.maxLevel) {
      return false;
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const nameMatch = character.display_name.toLowerCase().includes(searchLower);
      const typeMatch = character.type.toLowerCase().includes(searchLower);
      const specializationMatch = character.specialization.toLowerCase().includes(searchLower);
      
      if (!nameMatch && !typeMatch && !specializationMatch) {
        return false;
      }
    }
    
    return true;
  });
};

export default {
  CHARACTER_VISUAL_CONFIG,
  useCharacterTheme,
  useCharacterDisplayStats,
  useCharacterMood,
  useEvolutionProgress,
  useLevelProgress,
  formatCharacterName,
  getRarityStars,
  getCharacterTypeDisplayName,
  getSpecializationDisplayName,
  compareCharacters,
  filterCharacters,
};