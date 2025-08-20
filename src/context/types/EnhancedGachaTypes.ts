// src/context/types/EnhancedGachaTypes.ts
// State interface extensions for enhanced gacha system

import {
  // Character,
  // UserCurrencies
} from '../types';

// ==============================================================================
// ENHANCED GACHA STATE ADDITIONS FOR APPCONTEXT
// ==============================================================================

export interface EnhancedAppState {
  // Add these to your existing AppState interface
  enhancedGacha: {
    pity_counters: {
      legendary: number;
      epic: number;
      rare: number;
    };
    lifetime_stats: {
      total_pulls: number;
      gems_spent: number;
      legendary_pulled: number;
      epic_pulled: number;
      rare_pulled: number;
      common_pulled: number;
    };
    evolution_materials: Record<string, number>;
    achievements: {
      evolution_master: boolean;
    };
  };
  currentBanner: {
    id: string;
    name: string;
    featured_characters: string[];
    rate_up_active: boolean;
    start_date: string;
    end_date: string;
  } | null;
  dailyBonuses: {
    free_pull_available: boolean;
    discount_active: boolean;
    streak_bonus: number;
    last_bonus_claim: string;
  };
}

// ==============================================================================
// ENHANCED GACHA ACTION TYPES
// ==============================================================================

export const EnhancedGachaActions = {
  ENHANCED_GACHA_PULL: 'ENHANCED_GACHA_PULL',
  UPDATE_PITY_COUNTERS: 'UPDATE_PITY_COUNTERS',
  AWARD_EVOLUTION_MATERIALS: 'AWARD_EVOLUTION_MATERIALS',
  EVOLVE_CHARACTER: 'EVOLVE_CHARACTER',
  ACTIVATE_BANNER: 'ACTIVATE_BANNER',
  CLAIM_DAILY_BONUS: 'CLAIM_DAILY_BONUS',
  UPDATE_GACHA_STATS: 'UPDATE_GACHA_STATS',
} as const;

// ==============================================================================
// RESULT INTERFACES
// ==============================================================================

export interface EnhancedPullResult {
  characters: Character[];
  materials: Record<string, number>;
  pity_reset: boolean;
  special_effects: string[];
  xp_bonus: number;
  currency_refund: Partial<UserCurrencies>;
}

export interface EvolutionResult {
  success: boolean;
  evolved_character?: Character;
  materials_used?: Record<string, number>;
  error?: string;
}

export interface BannerActivationResult {
  success: boolean;
  banner?: any;
  error?: string;
}

export interface PityInsights {
  legendary_probability: number;
  epic_probability: number;
  rare_probability: number;
  pulls_to_guaranteed_legendary: number;
  luck_rating: 'Very Lucky' | 'Lucky' | 'Average' | 'Unlucky' | 'Very Unlucky';
}