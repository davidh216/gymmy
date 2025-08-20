// src/context/GameData.ts
// Game data constants and templates

import {
  // FitnessClass,
  // FitnessClassKey,
  // CharacterTemplate,
  // CharacterRarity,
  // UserCurrencies,
  // 
} from './types';

// ==============================================================================
// FITNESS CLASSES
// ==============================================================================

export const FITNESS_CLASSES: Record<FitnessClassKey, FitnessClass> = {
  powerlifter: {
    name: 'POWERLIFTER',
    subtitle: 'The Iron Warrior',
    emoji: '🏋️‍♂️',
    quote: 'Strength is earned, not given.',
    description: 'Master of raw strength. Dominates the big three: squat, bench, deadlift.',
    philosophy: 'STRENGTH ABOVE ALL',
    color: '#8B0000',
    bgGradient: ['#8B0000', '#4A0000'],
    bonuses: {
      compoundLiftXP: 2.0,
      strengthTrainingXP: 1.5,
      maxWeightBonus: 1.25,
      powerMoveXP: 1.8,
    },
    preferredExercises: ['squat', 'deadlift', 'bench_press', 'overhead_press'],
    skillTree: 'strength_mastery',
    stats: { power: 10, technique: 6, endurance: 4, flexibility: 2, mental: 8 },
  },
  bodybuilder: {
    name: 'BODYBUILDER',
    subtitle: 'The Sculptor',
    emoji: '💪',
    quote: 'Perfection through precision.',
    description: 'Artist of aesthetics. Masters isolation and perfect form.',
    philosophy: 'AESTHETICS THROUGH PRECISION',
    color: '#FFD700',
    bgGradient: ['#FFD700', '#B8860B'],
    bonuses: {
      isolationXP: 1.8,
      volumeBonus: 1.4,
      varietyXP: 1.6,
      aestheticXP: 2.0,
    },
    preferredExercises: ['cable_fly', 'lateral_raise', 'bicep_curl', 'tricep_extension'],
    skillTree: 'aesthetic_mastery',
    stats: { power: 6, technique: 10, endurance: 5, flexibility: 4, mental: 5 },
  },
  athlete: {
    name: 'ATHLETE',
    subtitle: 'The Competitor',
    emoji: '🏃‍♂️',
    quote: 'Train like you compete.',
    description: 'Peak performance through functional movement and conditioning.',
    philosophy: 'PERFORMANCE IS EVERYTHING',
    color: '#1E90FF',
    bgGradient: ['#1E90FF', '#0047AB'],
    bonuses: {
      cardioXP: 2.0,
      functionalXP: 1.7,
      recoveryBonus: 1.3,
      explosiveXP: 1.9,
    },
    preferredExercises: ['burpees', 'box_jumps', 'battle_ropes', 'sprints'],
    skillTree: 'performance_mastery',
    stats: { power: 7, technique: 7, endurance: 10, flexibility: 6, mental: 7 },
  },
  yogi: {
    name: 'YOGI',
    subtitle: 'The Harmonizer',
    emoji: '🧘‍♀️',
    quote: 'Strength through serenity.',
    description: 'Balance of mind, body, and spirit through flow and control.',
    philosophy: 'MIND BODY SPIRIT UNITY',
    color: '#9370DB',
    bgGradient: ['#9370DB', '#4B0082'],
    bonuses: {
      flexibilityXP: 2.2,
      mindfulnessXP: 1.8,
      recoveryXP: 1.5,
      balanceXP: 2.0,
    },
    preferredExercises: ['yoga_flow', 'meditation', 'stretching', 'balance_poses'],
    skillTree: 'harmony_mastery',
    stats: { power: 3, technique: 8, endurance: 6, flexibility: 10, mental: 10 },
  },
  hybrid: {
    name: 'HYBRID',
    subtitle: 'The Adaptor',
    emoji: '⚡',
    quote: 'Adaptability is the ultimate strength.',
    description: 'Master of all trades. Adapts to any challenge with versatility.',
    philosophy: 'INFINITE POSSIBILITIES',
    color: '#FF6347',
    bgGradient: ['#FF6347', '#B22222'],
    bonuses: {
      varietyXP: 1.5,
      adaptabilityXP: 1.4,
      allAroundBonus: 1.2,
      masteryXP: 1.3,
    },
    preferredExercises: [],
    skillTree: 'versatility_mastery',
    stats: { power: 7, technique: 7, endurance: 7, flexibility: 7, mental: 7 },
  },
};

// ==============================================================================
// CHARACTER TEMPLATES
// ==============================================================================

export const CHARACTER_TEMPLATES: Record<CharacterRarity, CharacterTemplate[]> = {
  legendary: [
    {
      id: 'leg_titan',
      name: 'The Iron Titan',
      rarity: 'legendary',
      class: 'powerlifter',
      description: 'A legendary warrior who can deadlift mountains',
      base_stats: { strength: 95, cardio: 60, flexibility: 40, focus: 90 },
      personality: { motivation: 'competitive', style: 'intense', time: 'morning' },
      special_ability: 'Titan Strength: +50% XP from compound lifts',
      artwork: '🏔️💪',
      rarity_color: '#FFD700',
    },
    {
      id: 'leg_zen_master',
      name: 'Master Zenith',
      rarity: 'legendary',
      class: 'yogi',
      description: 'Achieved perfect balance between mind, body, and spirit',
      base_stats: { strength: 50, cardio: 70, flexibility: 98, focus: 99 },
      personality: { motivation: 'personal', style: 'chill', time: 'evening' },
      special_ability: 'Perfect Balance: Immune to mood penalties',
      artwork: '🧘‍♂️✨',
      rarity_color: '#FFD700',
    },
  ],
  epic: [
    {
      id: 'epic_beast',
      name: 'Cardio Beast',
      rarity: 'epic',
      class: 'athlete',
      description: 'Never gets tired, always ready for the next mile',
      base_stats: { strength: 70, cardio: 92, flexibility: 65, focus: 75 },
      personality: { motivation: 'competitive', style: 'intense', time: 'morning' },
      special_ability: 'Endless Endurance: +25% cardio XP, slower energy drain',
      artwork: '🏃‍♂️💨',
      rarity_color: '#9932CC',
    },
    {
      id: 'epic_sculptor',
      name: 'The Sculptor',
      rarity: 'epic',
      class: 'bodybuilder',
      description: 'Perfection through precision, every rep counts',
      base_stats: { strength: 85, cardio: 60, flexibility: 70, focus: 88 },
      personality: { motivation: 'personal', style: 'moderate', time: 'afternoon' },
      special_ability: 'Perfect Form: +30% XP from isolation exercises',
      artwork: '🎨💪',
      rarity_color: '#9932CC',
    },
  ],
  rare: [
    {
      id: 'rare_warrior',
      name: 'Gym Warrior',
      rarity: 'rare',
      class: 'hybrid',
      description: 'Reliable training partner who adapts to any workout',
      base_stats: { strength: 75, cardio: 75, flexibility: 75, focus: 75 },
      personality: { motivation: 'social', style: 'moderate', time: 'flexible' },
      special_ability: 'Adaptation: Gains bonus XP from variety workouts',
      artwork: '⚔️🏋️',
      rarity_color: '#4169E1',
    },
    {
      id: 'rare_coach',
      name: 'Motivational Coach',
      rarity: 'rare',
      class: 'hybrid',
      description: 'Always knows exactly what to say to keep you going',
      base_stats: { strength: 65, cardio: 70, flexibility: 60, focus: 85 },
      personality: { motivation: 'social', style: 'moderate', time: 'flexible' },
      special_ability: 'Motivation Boost: +20% XP on low mood days',
      artwork: '📣💪',
      rarity_color: '#4169E1',
    },
  ],
  common: [
    {
      id: 'com_buddy',
      name: 'Workout Buddy',
      rarity: 'common',
      class: 'beginner',
      description: 'Just happy to be here and sweat together',
      base_stats: { strength: 50, cardio: 50, flexibility: 50, focus: 50 },
      personality: { motivation: 'social', style: 'chill', time: 'flexible' },
      special_ability: 'Friendship: Small XP bonus from social workouts',
      artwork: '😊🏃',
      rarity_color: '#808080',
    },
    {
      id: 'com_newbie',
      name: 'Eager Newbie',
      rarity: 'common',
      class: 'beginner',
      description: 'New to fitness but full of enthusiasm',
      base_stats: { strength: 30, cardio: 40, flexibility: 60, focus: 70 },
      personality: { motivation: 'personal', style: 'chill', time: 'morning' },
      special_ability: 'Beginner Gains: Extra XP for first 10 workouts',
      artwork: '🌟💪',
      rarity_color: '#808080',
    },
  ],
};

// ==============================================================================
// GACHA SYSTEM
// ==============================================================================

export const GACHA_RATES: Record<CharacterRarity, number> = {
  legendary: 0.005,  // 0.5%
  epic: 0.02,        // 2%
  rare: 0.10,        // 10% 
  common: 0.875,      // 87.5%
};

// ==============================================================================
// CURRENCY REWARDS
// ==============================================================================

export const CURRENCY_REWARDS: Record<string, Partial<UserCurrencies>> = {
  workout_basic: { gems: 15, coins: 25 },
  workout_verified: { gems: 35, coins: 50, crystals: 1 },
  workout_liked: { gems: 5, coins: 10 },
  daily_login: { coins: 20 },
  streak_bonus: { gems: 10, coins: 30 },
  first_workout_day: { gems: 25, coins: 50 },
  perfect_form: { gems: 50, coins: 100, crystals: 3 },
  social_interaction: { coins: 5 },
};

// ==============================================================================
// PULL COSTS
// ==============================================================================

export const getPullCosts = (): Record<string, Partial<UserCurrencies>> => ({
  single: { gems: 160, coins: 0 },
  ten_pull: { gems: 1600, coins: 0 },
  coin_pull: { gems: 0, coins: 2000 },
}); 