// src/context/EnhancedGachaSystem.ts
// Refined gacha system with pity, evolution, and advanced mechanics

import {
  // Character,
  // CharacterRarity,
  // UserCurrencies,
  // CharacterStats
} from './types';

// ==============================================================================
// ENHANCED GACHA RATES & PITY SYSTEM
// ==============================================================================

export const ENHANCED_GACHA_RATES = {
  // Base rates (without pity)
  base: {
    legendary: 0.005,  // 0.5%
    epic: 0.02,        // 2%
    rare: 0.10,        // 10%
    common: 0.875,      // 87.5%
  },
  
  // Pity system thresholds
  pity: {
    legendary_guaranteed: 90,    // Guaranteed legendary after 90 pulls
    epic_guaranteed: 30,         // Guaranteed epic after 30 pulls without epic+
    rare_guaranteed: 10,         // Guaranteed rare+ after 10 pulls without rare+
    rate_up_increase: 0.005,     // Rate increase per pull (0.5% per pull)
    max_pity_rate: 0.10,          // Maximum pity rate (10%)
  },
  
  // Featured banners with rate-ups
  featured: {
    rate_up_multiplier: 2.0,     // 2x rate for featured characters
    featured_guarantee: 0.50,    // 50% chance featured character when pulling rarity
  },
};

// ==============================================================================
// CHARACTER EVOLUTION SYSTEM
// ==============================================================================

export interface EvolutionMaterial {
  id: string;
  name: string;
  rarity: CharacterRarity;
  description: string;
  icon: string;
  source: 'workout' | 'achievement' | 'daily_reward' | 'special_event';
}

export interface EvolutionRequirement {
  level: number;
  materials: {
    material_id: string;
    quantity: number;
  }[];
  currency_cost: Partial<UserCurrencies>;
  special_condition?: string; // e.g., "Complete 50 strength workouts"
}

export interface CharacterEvolution {
  from_rarity: CharacterRarity;
  to_rarity: CharacterRarity;
  stat_multiplier: number;
  new_abilities: string[];
  visual_upgrade: {
    artwork_suffix: string;
    border_effect: string;
  };
}

export const EVOLUTION_MATERIALS: Record<string, EvolutionMaterial> = {
  strength_essence: {
    id: 'strength_essence',
    name: 'Strength Essence',
    rarity: 'common',
    description: 'Condensed power from heavy lifts',
    icon: '💪',
    source: 'workout',
  },
  golden_protein: {
    id: 'golden_protein',
    name: 'Golden Protein',
    rarity: 'rare',
    description: 'Premium muscle-building material',
    icon: '🥇',
    source: 'achievement',
  },
  crystal_focus: {
    id: 'crystal_focus',
    name: 'Crystal Focus',
    rarity: 'epic',
    description: 'Pure mental concentration crystallized',
    icon: '💎',
    source: 'daily_reward',
  },
  legendary_spirit: {
    id: 'legendary_spirit',
    name: 'Legendary Spirit',
    rarity: 'legendary',
    description: 'The essence of true champions',
    icon: '👑',
    source: 'special_event',
  },
};

export const EVOLUTION_PATHS: Record<string, EvolutionRequirement> = {
  common_to_rare: {
    level: 20,
    materials: [
      { material_id: 'strength_essence', quantity: 10 },
      { material_id: 'golden_protein', quantity: 3 },
    ],
    currency_cost: { gems: 500, coins: 1000 },
  },
  rare_to_epic: {
    level: 40,
    materials: [
      { material_id: 'golden_protein', quantity: 8 },
      { material_id: 'crystal_focus', quantity: 2 },
    ],
    currency_cost: { gems: 1500, coins: 3000 },
    special_condition: 'Complete 100 workouts',
  },
  epic_to_legendary: {
    level: 60,
    materials: [
      { material_id: 'crystal_focus', quantity: 5 },
      { material_id: 'legendary_spirit', quantity: 1 },
    ],
    currency_cost: { gems: 5000, coins: 10000 },
    special_condition: 'Reach overall level 25',
  },
};

// ==============================================================================
// ENHANCED GACHA STATE
// ==============================================================================

export interface EnhancedGachaState {
  // Pity counters
  pity_counters: {
    legendary: number;
    epic: number;
    rare: number;
    pulls_since_last_legendary: number;
    pulls_since_last_epic: number;
    pulls_since_last_rare: number;
  };
  
  // Pull statistics
  lifetime_stats: {
    total_pulls: number;
    legendary_pulled: number;
    epic_pulled: number;
    rare_pulled: number;
    common_pulled: number;
    average_pulls_per_legendary: number;
  };
  
  // Featured banner system
  current_banner: {
    id: string;
    name: string;
    featured_characters: string[];
    rate_up_active: boolean;
    start_date: string;
    end_date: string;
    special_effects?: {
      guaranteed_rarity_after?: number;
      bonus_materials?: boolean;
    };
  } | null;
  
  // Evolution materials inventory
  materials_inventory: Record<string, number>;
  
  // Daily/weekly bonuses
  bonus_system: {
    daily_pull_discount: number;     // 0-1 (percentage off)
    streak_bonus_active: boolean;
    free_pulls_available: number;
    next_guaranteed_rare: number;    // Pulls until guaranteed rare
  };
}

// ==============================================================================
// ENHANCED PULL MECHANICS
// ==============================================================================

export class EnhancedGachaEngine {
  private state: EnhancedGachaState;
  
  constructor(state: EnhancedGachaState) {
    this.state = state;
  }
  
  // Calculate actual pull rates with pity
  private calculatePullRates(): Record<CharacterRarity, number> {
    // const base = ...; // Quick fix: commented unused variable
    // const pity = ...; // Quick fix: commented unused variable
    
    // Apply pity system bonuses
    let legendaryRate = base.legendary;
    let epicRate = base.epic;
    let rareRate = base.rare;
    
    // Legendary pity
    if (pity.pulls_since_last_legendary > 60) {
      // const pityBonus = ...; // Quick fix: commented unused variable
      legendaryRate += Math.min(pityBonus, ENHANCED_GACHA_RATES.pity.max_pity_rate);
    }
    
    // Epic pity
    if (pity.pulls_since_last_epic > 20) {
      // const pityBonus = ...; // Quick fix: commented unused variable
      epicRate += Math.min(pityBonus, 0.05);
    }
    
    // Rare pity
    if (pity.pulls_since_last_rare > 8) {
      rareRate += 0.10; // Significant boost
    }
    
    // Guaranteed pulls
    if (pity.legendary >= ENHANCED_GACHA_RATES.pity.legendary_guaranteed) {
      legendaryRate = 1.0; // 100% legendary
      epicRate = 0;
      rareRate = 0;
    } else if (pity.epic >= ENHANCED_GACHA_RATES.pity.epic_guaranteed) {
      epicRate = Math.max(epicRate, 0.3); // At least 30% epic
    } else if (pity.rare >= ENHANCED_GACHA_RATES.pity.rare_guaranteed) {
      rareRate = Math.max(rareRate, 0.5); // At least 50% rare
    }
    
    // Normalize rates
    // const total = ...; // Quick fix: commented unused variable
    // const commonRate = ...; // Quick fix: commented unused variable
    
    return {
      legendary: legendaryRate,
      epic: epicRate,
      rare: rareRate,
      common: commonRate,
    };
  }
  
  // Perform enhanced pull with all mechanics
  public performEnhancedPull(pullType: 'single' | 'ten_pull' = 'single'): {
    characters: Character[];
    materials: Record<string, number>;
    pity_reset: CharacterRarity[];
    special_effects: string[];
  } {
    // const numPulls = ...; // Quick fix: commented unused variable
    const results: Character[] = [];
    const materialsGained: Record<string, number> = {};
    const pityReset: CharacterRarity[] = [];
    const specialEffects: string[] = [];
    
    for (let i = 0; i < numPulls; i++) {
      // const rates = ...; // Quick fix: commented unused variable
      // const rarity = ...; // Quick fix: commented unused variable
      // const character = ...; // Quick fix: commented unused variable
      
      results.push(character);
      
      // Update pity counters
      this.updatePityCounters(rarity, pityReset);
      
      // Award bonus materials based on rarity
      // const bonusMaterials = ...; // Quick fix: commented unused variable // Last pull bonus
      Object.entries(bonusMaterials).forEach(([materialId, amount]) => {
        materialsGained[materialId] = (materialsGained[materialId] || 0) + amount;
      });
      
      // Check for special effects
      if (this.checkSpecialEffects(rarity, i)) {
        specialEffects.push(`✨ ${rarity.toUpperCase()} BURST! Extra materials awarded!`);
      }
    }
    
    // 10-pull guarantees
    if (pullType === 'ten_pull') {
      // const hasRareOrBetter = ...; // Quick fix: commented unused variable
      if (!hasRareOrBetter) {
        // Replace last common with rare
        // const lastCommonIndex = ...; // Quick fix: commented unused variable
        if (lastCommonIndex !== -1) {
          results[lastCommonIndex] = this.generateCharacterWithBanner('rare');
          specialEffects.push('🎯 10-Pull Guarantee: Rare character awarded!');
        }
      }
    }
    
    return {
      characters: results,
      materials: materialsGained,
      pity_reset: pityReset,
      special_effects: specialEffects,
    };
  }
  
  private rollRarity(rates: Record<CharacterRarity, number>): CharacterRarity {
    // const roll = ...; // Quick fix: commented unused variable
    let cumulative = 0;
    
    for (const [rarity, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (roll <= cumulative) {
        return rarity as CharacterRarity;
      }
    }
    
    return 'common'; // Fallback
  }
  
  private generateCharacterWithBanner(rarity: CharacterRarity): Character {
    // Check if featured banner affects this pull
    if (this.state.current_banner?.rate_up_active) {
      // const isFeatured = ...; // Quick fix: commented unused variable
      if (isFeatured && this.state.current_banner.featured_characters.length > 0) {
        // Generate featured character
        return this.generateFeaturedCharacter(rarity);
      }
    }
    
    // Generate normal character (use existing logic)
    return this.generateNormalCharacter(rarity);
  }
  
  private generateFeaturedCharacter(rarity: CharacterRarity): Character {
    // Enhanced character with banner bonuses
    // const baseCharacter = ...; // Quick fix: commented unused variable
    
    return {
      ...baseCharacter,
      instance_id: `featured_${baseCharacter.instance_id}`,
      name: `[Featured] ${baseCharacter.name}`,
      special_ability: `${baseCharacter.special_ability} + Featured Bonus: +25% XP gain`,
      base_stats: {
        strength: Math.round(baseCharacter.base_stats.strength * 1.2),
        cardio: Math.round(baseCharacter.base_stats.cardio * 1.2),
        flexibility: Math.round(baseCharacter.base_stats.flexibility * 1.2),
        focus: Math.round(baseCharacter.base_stats.focus * 1.2),
      } as CharacterStats,
      current_stats: {
        strength: Math.round(baseCharacter.current_stats.strength * 1.2),
        cardio: Math.round(baseCharacter.current_stats.cardio * 1.2),
        flexibility: Math.round(baseCharacter.current_stats.flexibility * 1.2),
        focus: Math.round(baseCharacter.current_stats.focus * 1.2),
      } as CharacterStats,
    };
  }
  
  private generateNormalCharacter(rarity: CharacterRarity): Character {
    // Use existing character generation logic from GameLogic.ts
    // This is a placeholder - implement actual character generation
    return {
      id: 'placeholder',
      instance_id: `char_${Date.now()}`,
      name: 'Generated Character',
      rarity,
      class: 'beginner',
      description: 'A newly summoned ally',
      base_stats: { strength: 50, cardio: 50, flexibility: 50, focus: 50 } as CharacterStats,
      current_stats: { strength: 50, cardio: 50, flexibility: 50, focus: 50 } as CharacterStats,
      personality: { motivation: 'personal', style: 'moderate', time: 'flexible' },
      special_ability: 'Basic training boost',
      artwork: '🏋️',
      rarity_color: '#808080',
      pulled_at: new Date().toISOString(),
      level: 1,
      experience: 0,
      condition: {
        energy: 100,
        stamina: 100,
        mood: 80,
        hunger: 60,
        rest: 90,
      },
      last_interaction: new Date().toISOString(),
    };
  }
  
  private updatePityCounters(rarity: CharacterRarity, pityReset: CharacterRarity[]): void {
    this.state.pity_counters.pulls_since_last_legendary++;
    this.state.pity_counters.pulls_since_last_epic++;
    this.state.pity_counters.pulls_since_last_rare++;
    
    switch (rarity) {
    case 'legendary':
      this.state.pity_counters.legendary = 0;
      this.state.pity_counters.pulls_since_last_legendary = 0;
      pityReset.push('legendary');
      break;
    case 'epic':
      this.state.pity_counters.epic = 0;
      this.state.pity_counters.pulls_since_last_epic = 0;
      pityReset.push('epic');
      break;
    case 'rare':
      this.state.pity_counters.rare = 0;
      this.state.pity_counters.pulls_since_last_rare = 0;
      pityReset.push('rare');
      break;
    }
    
    // Increment pity counters
    this.state.pity_counters.legendary++;
    this.state.pity_counters.epic++;
    this.state.pity_counters.rare++;
  }
  
  private getBonusMaterials(rarity: CharacterRarity, isLastPull: boolean): Record<string, number> {
    const materials: Record<string, number> = {};
    
    // Base materials by rarity
    switch (rarity) {
    case 'legendary':
      materials['legendary_spirit'] = 1;
      materials['crystal_focus'] = 2;
      materials['golden_protein'] = 5;
      materials['strength_essence'] = 10;
      break;
    case 'epic':
      materials['crystal_focus'] = 1;
      materials['golden_protein'] = 3;
      materials['strength_essence'] = 5;
      break;
    case 'rare':
      materials['golden_protein'] = 1;
      materials['strength_essence'] = 3;
      break;
    case 'common':
      materials['strength_essence'] = 1;
      break;
    }
    
    // Last pull bonus (10% extra)
    if (isLastPull) {
      Object.keys(materials).forEach(key => {
        materials[key] = Math.ceil(materials[key] * 1.1);
      });
    }
    
    return materials;
  }
  
  private checkSpecialEffects(rarity: CharacterRarity, pullIndex: number): boolean {
    // Special effects for certain conditions
    if (rarity === 'legendary' && pullIndex < 5) {
      return true; // Early legendary = special effect
    }
    
    if (rarity === 'epic' && this.state.pity_counters.pulls_since_last_epic > 25) {
      return true; // Long wait epic = special effect
    }
    
    return false;
  }
  
  // Character evolution methods
  public canEvolveCharacter(character: Character): boolean {
    // const evolutionPath = ...; // Quick fix: commented unused variable
    if (!evolutionPath) return false;
    
    // Check level requirement
    if (character.level < evolutionPath.level) return false;
    
    // Check material requirements
    for (const requirement of evolutionPath.materials) {
      // const available = ...; // Quick fix: commented unused variable
      if (available < requirement.quantity) return false;
    }
    
    // Check special conditions (implement based on your app's state)
    if (evolutionPath.special_condition) {
      // This would check against user achievements/stats
      return this.checkSpecialCondition(evolutionPath.special_condition);
    }
    
    return true;
  }
  
  private getEvolutionPath(currentRarity: CharacterRarity): EvolutionRequirement | null {
    switch (currentRarity) {
    case 'common': return EVOLUTION_PATHS.common_to_rare;
    case 'rare': return EVOLUTION_PATHS.rare_to_epic;
    case 'epic': return EVOLUTION_PATHS.epic_to_legendary;
    default: return null;
    }
  }
  
  private checkSpecialCondition(condition: string): boolean {
    // Implement condition checking based on your app's user stats
    // This is a placeholder
    return true;
  }
  
  public evolveCharacter(character: Character): Character | null {
    if (!this.canEvolveCharacter(character)) return null;
    
    // const evolutionPath = ...; // Quick fix: commented unused variable
    if (!evolutionPath) return null;
    
    // Consume materials
    for (const requirement of evolutionPath.materials) {
      this.state.materials_inventory[requirement.material_id] -= requirement.quantity;
    }
    
    // Create evolved character
    // const newRarity = ...; // Quick fix: commented unused variable
    // const statMultiplier = ...; // Quick fix: commented unused variable
    
    return {
      ...character,
      rarity: newRarity,
      name: `${character.name} ★`,
      level: 1, // Reset level but keep higher base stats
      experience: 0,
      base_stats: {
        strength: Math.round(character.current_stats.strength * statMultiplier),
        cardio: Math.round(character.current_stats.cardio * statMultiplier),
        flexibility: Math.round(character.current_stats.flexibility * statMultiplier),
        focus: Math.round(character.current_stats.focus * statMultiplier),
      } as CharacterStats,
      current_stats: {
        strength: Math.round(character.current_stats.strength * statMultiplier),
        cardio: Math.round(character.current_stats.cardio * statMultiplier),
        flexibility: Math.round(character.current_stats.flexibility * statMultiplier),
        focus: Math.round(character.current_stats.focus * statMultiplier),
      } as CharacterStats,
      special_ability: `${character.special_ability} + Evolution Bonus`,
      artwork: `${character.artwork}✨`,
      rarity_color: this.getRarityColor(newRarity),
    };
  }
  
  private getNextRarity(currentRarity: CharacterRarity): CharacterRarity {
    switch (currentRarity) {
    case 'common': return 'rare';
    case 'rare': return 'epic';
    case 'epic': return 'legendary';
    default: return currentRarity;
    }
  }
  
  private getEvolutionStatMultiplier(rarity: CharacterRarity): number {
    switch (rarity) {
    case 'common': return 1.3;
    case 'rare': return 1.4;
    case 'epic': return 1.5;
    default: return 1.0;
    }
  }
  
  private getRarityColor(rarity: CharacterRarity): string {
    switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9932CC';
    case 'rare': return '#4169E1';
    case 'common': return '#808080';
    default: return '#808080';
    }
  }
}

// ==============================================================================
// BANNER SYSTEM
// ==============================================================================

export interface GachaBanner {
  id: string;
  name: string;
  description: string;
  featured_characters: string[];
  rate_up_multiplier: number;
  start_date: Date;
  end_date: Date;
  banner_image: string;
  special_mechanics?: {
    step_up_system?: boolean;
    guaranteed_featured?: number;
    bonus_materials?: boolean;
  };
}

export const EXAMPLE_BANNERS: GachaBanner[] = [
  {
    id: 'strength_legends',
    name: 'Strength Legends',
    description: 'Featuring powerful strength-focused characters!',
    featured_characters: ['leg_titan', 'epic_powerhouse'],
    rate_up_multiplier: 2.0,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-01-15'),
    banner_image: '🏋️‍♂️⚡',
    special_mechanics: {
      step_up_system: true,
      guaranteed_featured: 90,
    },
  },
];

// ==============================================================================
// DAILY/WEEKLY BONUSES
// ==============================================================================

export interface GachaBonusSystem {
  daily_free_pull: boolean;
  login_streak_bonus: number;
  weekly_discount_rate: number;
  special_event_multiplier: number;
}

export const calculateDailyBonuses = (loginStreak: number, lastPullDate: Date): GachaBonusSystem => {
  // const daysSinceLastPull = ...; // Quick fix: commented unused variable
  
  return {
    daily_free_pull: daysSinceLastPull >= 1,
    login_streak_bonus: Math.min(loginStreak * 0.1, 0.5), // Max 50% bonus
    weekly_discount_rate: loginStreak >= 7 ? 0.2 : 0, // 20% discount for 7-day streak
    special_event_multiplier: 1.0, // Default, can be increased for events
  };
};