// src/context/EnhancedGachaIntegration.ts
// Integration of enhanced gacha system with existing AppContext

import { EnhancedGachaEngine, EnhancedGachaState, EVOLUTION_MATERIALS } from './EnhancedGachaSystem';
import { Character, UserCurrencies, Workout } from './types';

// ==============================================================================
// ENHANCED GACHA STATE ADDITIONS FOR APPCONTEXT
// ==============================================================================

export interface EnhancedAppState {
  // Add these to your existing AppState interface
  enhancedGacha: EnhancedGachaState;
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
// ENHANCED GACHA CONTEXT FUNCTIONS
// ==============================================================================

export class EnhancedGachaManager {
  private engine: EnhancedGachaEngine;
  
  constructor(gachaState: EnhancedGachaState) {
    this.engine = new EnhancedGachaEngine(gachaState);
  }
  
  // Enhanced pull with all new mechanics
  public performEnhancedPull(pullType: 'single' | 'ten_pull' = 'single') {
    const results = this.engine.performEnhancedPull(pullType);
    
    // Return comprehensive results
    return {
      characters: results.characters,
      materials: results.materials,
      pity_reset: results.pity_reset,
      special_effects: results.special_effects,
      xp_bonus: this.calculatePullXPBonus(results.characters),
      currency_refund: this.calculateLuckyRefund(results.characters),
    };
  }
  
  // Calculate XP bonus for high rarity pulls
  private calculatePullXPBonus(characters: Character[]): number {
    return characters.reduce((total, char) => {
      switch (char.rarity) {
        case 'legendary': return total + 1000;
        case 'epic': return total + 500;
        case 'rare': return total + 200;
        case 'common': return total + 50;
        default: return total;
      }
    }, 0);
  }
  
  // Lucky refund system - chance to get gems back on good pulls
  private calculateLuckyRefund(characters: Character[]): Partial<UserCurrencies> {
    const hasLegendary = characters.some(c => c.rarity === 'legendary');
    const hasMultipleEpic = characters.filter(c => c.rarity === 'epic').length >= 2;
    
    if (hasLegendary && Math.random() < 0.1) { // 10% chance
      return { gems: 500 }; // Major refund for legendary
    }
    
    if (hasMultipleEpic && Math.random() < 0.2) { // 20% chance  
      return { gems: 200 }; // Minor refund for double epic
    }
    
    return {};
  }
  
  // Character evolution
  public evolveCharacter(character: Character): { 
    success: boolean; 
    evolved_character?: Character; 
    materials_used?: Record<string, number>;
    error?: string;
  } {
    if (!this.engine.canEvolveCharacter(character)) {
      return { 
        success: false, 
        error: 'Character does not meet evolution requirements' 
      };
    }
    
    const evolvedCharacter = this.engine.evolveCharacter(character);
    
    if (!evolvedCharacter) {
      return { 
        success: false, 
        error: 'Evolution failed' 
      };
    }
    
    // Calculate materials used (you'd implement this based on requirements)
    const materialsUsed = this.getEvolutionMaterialsUsed(character.rarity);
    
    return {
      success: true,
      evolved_character: evolvedCharacter,
      materials_used: materialsUsed,
    };
  }
  
  private getEvolutionMaterialsUsed(rarity: string): Record<string, number> {
    switch (rarity) {
      case 'common':
        return { 'strength_essence': 1 };
      case 'rare':
        return { 'strength_essence': 2, 'rare_crystal': 1 };
      case 'epic':
        return { 'strength_essence': 5, 'rare_crystal': 3, 'epic_shard': 1 };
      case 'legendary':
        return { 'strength_essence': 10, 'rare_crystal': 5, 'epic_shard': 3, 'legendary_core': 1 };
      default:
        return { 'strength_essence': 1 };
    }
  }
  
  // Banner management
  public activateBanner(bannerId: string): {
    success: boolean;
    banner?: any;
    error?: string;
  } {
    // This would load banner configuration from your data
    const banners = {
      'strength_legends': {
        id: 'strength_legends',
        name: 'Strength Legends',
        featured_characters: ['leg_titan', 'epic_beast'],
        rate_up_active: true,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        special_mechanics: {
          step_up_system: true,
          guaranteed_featured: 90
        }
      }
    };
    
    const banner = banners[bannerId];
    if (!banner) {
      return { success: false, error: 'Banner not found' };
    }
    
    return { success: true, banner };
  }
  
  // Pity statistics and insights
  public getPityInsights(gachaState: EnhancedGachaState): {
    legendary_probability: number;
    epic_probability: number;
    rare_probability: number;
    pulls_to_guaranteed_legendary: number;
    luck_rating: 'Very Lucky' | 'Lucky' | 'Average' | 'Unlucky' | 'Very Unlucky';
  } {
    const pity = gachaState.pity_counters;
    const stats = gachaState.lifetime_stats;
    
    // Calculate enhanced probabilities based on pity
    let legendaryProb = 0.005; // Base 0.5%
    if (pity.legendary > 60) {
      legendaryProb += (pity.legendary - 60) * 0.005; // Increase by 0.5% per pull
    }
    legendaryProb = Math.min(legendaryProb, 0.1); // Cap at 10%
    
    // Calculate luck rating based on actual vs expected pulls
    const expectedLegendaryPulls = stats.total_pulls * 0.005;
    const actualLegendaryPulls = stats.legendary_pulled;
    const luckRatio = actualLegendaryPulls / Math.max(expectedLegendaryPulls, 1);
    
    let luckRating: 'Very Lucky' | 'Lucky' | 'Average' | 'Unlucky' | 'Very Unlucky';
    if (luckRatio >= 2.0) luckRating = 'Very Lucky';
    else if (luckRatio >= 1.3) luckRating = 'Lucky';
    else if (luckRatio >= 0.7) luckRating = 'Average';
    else if (luckRatio >= 0.3) luckRating = 'Unlucky';
    else luckRating = 'Very Unlucky';
    
    return {
      legendary_probability: legendaryProb * 100,
      epic_probability: Math.min(2.0 + (pity.epic > 20 ? 1.0 : 0), 5.0),
      rare_probability: pity.rare >= 9 ? 50.0 : 10.0,
      pulls_to_guaranteed_legendary: Math.max(0, 90 - pity.legendary),
      luck_rating: luckRating,
    };
  }
}