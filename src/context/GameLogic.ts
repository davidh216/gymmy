// src/context/GameLogic.ts
// Game logic functions for XP calculations, gacha, and character interactions

import {
  // FITNESS_CLASSES,
  // CHARACTER_TEMPLATES,
  // GACHA_RATES,
  // 
} from './GameData';

import {
  // Workout,
  // UserStats,
  // Character,
  // CharacterRarity,
  // SocialPost,
  // FitnessClassKey,
  // CalculateExperienceFunction,
  // CalculateClassXPFunction,
  // CalculateLevelFunction,
  // GenerateCharacterFunction,
  // PerformGachaPullFunction,
  // WorkoutWithCharacterFunction,
  // CreateWorkoutPostFunction,
  // 
} from './types';

// ==============================================================================
// XP CALCULATION FUNCTIONS
// ==============================================================================

// WoW-style exponential XP curve calculation
export const calculateLevelRequirement = (level: number): number => {
  // const baseXP = ...; // Quick fix: commented unused variable
  return Math.floor(baseXP * Math.pow(level - 1, 1.5));
};

export const calculateTotalXPForLevel = (level: number): number => {
  let totalXP = 0;
  for (let i = 1; i <= level; i++) {
    totalXP += calculateLevelRequirement(i);
  }
  return totalXP;
};

export const calculateLevel: CalculateLevelFunction = (totalExperience: number): number => {
  let level = 1;
  let requiredXP = 0;
  
  while (requiredXP <= totalExperience) {
    level++;
    requiredXP = calculateTotalXPForLevel(level);
  }
  
  return Math.max(1, level - 1);
};

// Calculate class XP required for next level
export const calculateClassXPRequired = (level: number): number => {
  return Math.floor(200 * Math.pow(level - 1, 1.2));
};

// Enhanced XP calculation with class bonuses
export const calculateExperience: CalculateExperienceFunction = (workout: Workout, userStats: UserStats): number => {
  let experience = 0;
  
  // Base experience
  experience += 100;
  
  // Duration bonus
  if (workout.duration) {
    experience += Math.floor(workout.duration / 3);
  }
  
  // Exercise bonus
  if (workout.exercises) {
    experience += workout.exercises.length * 15;
  }
  
  // Rating bonus
  if (workout.ratings && workout.ratings.workoutRating) {
    if (workout.ratings.workoutRating >= 9) experience += 50;
    else if (workout.ratings.workoutRating >= 8) experience += 35;
    else if (workout.ratings.workoutRating >= 7) experience += 25;
    else if (workout.ratings.workoutRating >= 6) experience += 15;
    else if (workout.ratings.workoutRating >= 5) experience += 10;
  }
  
  // Streak bonus
  if (userStats.streaks?.current > 0) {
    // const streakBonus = ...; // Quick fix: commented unused variable
    experience += streakBonus;
  }
  
  // Template completion bonus
  if (workout.templateId) {
    experience += 50;
  }
  
  // Exercise variety bonus
  if (workout.exercises) {
    // const uniqueExercises = ...; // Quick fix: commented unused variable
    if (uniqueExercises >= 5) experience += 25;
  }
  
  // Apply class bonuses if class is selected
  if (userStats.selectedClass) {
    // const classData = ...; // Quick fix: commented unused variable
    experience = applyClassBonuses(experience, workout, classData, userStats);
  }
  
  return Math.floor(experience);
};

export const calculateClassXP: CalculateClassXPFunction = (workout: Workout, userStats: UserStats): number => {
  if (!userStats.selectedClass) return 0;
  
  // const classData = ...; // Quick fix: commented unused variable
  let classXP = 50;
  
  // Check for preferred exercises
  const hasPreferredExercises = workout.exercises?.some(ex => 
    classData.preferredExercises.includes(ex.name.toLowerCase().replace(/\s+/g, '_')),
  );
  
  if (hasPreferredExercises) {
    classXP *= 1.5;
  }
  
  return Math.floor(classXP);
};

export const applyClassBonuses = (
  baseXP: number, 
  workout: Workout, 
  classData: typeof FITNESS_CLASSES[FitnessClassKey], 
  userStats: UserStats,
): number => {
  let multiplier = 1.0;
  
  // const exerciseTypes = ...; // Quick fix: commented unused variable
  
  if (exerciseTypes.includes('chest') || exerciseTypes.includes('back') || exerciseTypes.includes('legs')) {
    if (classData.bonuses.compoundLiftXP) {
      multiplier *= classData.bonuses.compoundLiftXP;
    }
  }
  
  if (exerciseTypes.length >= 5 && classData.bonuses.varietyXP) {
    multiplier *= classData.bonuses.varietyXP;
  }
  
  if (workout.exercises?.some(ex => ex.category === 'cardio') && classData.bonuses.cardioXP) {
    multiplier *= classData.bonuses.cardioXP;
  }
  
  return baseXP * multiplier;
};

// ==============================================================================
// GACHA SYSTEM FUNCTIONS
// ==============================================================================

// Generate character from template
export const generateCharacter: GenerateCharacterFunction = (rarity: CharacterRarity): Character => {
  // const templates = ...; // Quick fix: commented unused variable
  // const template = ...; // Quick fix: commented unused variable
  
  return {
    ...template,
    instance_id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pulled_at: new Date().toISOString(),
    level: 1,
    experience: 0,
    current_stats: { ...template.base_stats },
    condition: {
      energy: 100,
      stamina: 100,
      mood: 80,
      hunger: 60,
      rest: 90,
    },
    last_interaction: new Date().toISOString(),
  };
};

// Perform gacha pull
export const performGachaPull: PerformGachaPullFunction = (pullType: 'single' | 'ten_pull' = 'single'): Character[] => {
  // const numPulls = ...; // Quick fix: commented unused variable
  const results: Character[] = [];
  
  for (let i = 0; i < numPulls; i++) {
    // const roll = ...; // Quick fix: commented unused variable
    let rarity: CharacterRarity;
    
    if (roll < GACHA_RATES.legendary) {
      rarity = 'legendary';
    } else if (roll < GACHA_RATES.legendary + GACHA_RATES.epic) {
      rarity = 'epic';
    } else if (roll < GACHA_RATES.legendary + GACHA_RATES.epic + GACHA_RATES.rare) {
      rarity = 'rare';
    } else {
      rarity = 'common';
    }
    
    // const newCharacter = ...; // Quick fix: commented unused variable
    results.push(newCharacter);
  }
  
  return results;
};

// ==============================================================================
// CHARACTER INTERACTION FUNCTIONS
// ==============================================================================

// Character workout interaction
export const workoutWithCharacter: WorkoutWithCharacterFunction = (character: Character, workout: Workout): Character => {
  // const xpGained = ...; // Quick fix: commented unused variable
  // const newLevel = ...; // Quick fix: commented unused variable
  
  // const energyDrain = ...; // Quick fix: commented unused variable
  // const moodBoost = ...; // Quick fix: commented unused variable
  
  return {
    ...character,
    experience: character.experience + xpGained,
    level: Math.max(character.level, newLevel),
    condition: {
      energy: Math.max(10, character.condition.energy - energyDrain),
      stamina: Math.min(100, character.condition.stamina + 5),
      mood: Math.min(100, character.condition.mood + moodBoost),
      hunger: Math.min(100, character.condition.hunger + 15),
      rest: Math.max(0, character.condition.rest - 10),
    },
  };
};

// ==============================================================================
// SOCIAL VERIFICATION FUNCTIONS
// ==============================================================================

export const createWorkoutPost: CreateWorkoutPostFunction = (workout: Workout, photo: string, caption?: string): SocialPost => {
  return {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'current_user',
    workout_id: workout.id,
    photo_url: photo,
    caption: caption || '',
    timestamp: new Date().toISOString(),
    likes: [],
    reports: [],
    verified: true,
    workout_summary: {
      exercises: workout.exercises?.length || 0,
      duration: workout.duration || 0,
      rating: workout.ratings?.workoutRating || 0,
      class_bonus: workout.class_bonus || 0,
    },
  };
}; 