// src/context/data/BannerDatabase.ts
// Banner configurations and seasonal event system

import { BannerConfiguration, StepUpReward } from '../systems/AdvancedGachaSystem';
import { EvolutionMaterials } from '../types/MultiGymmyTypes';

// ==============================================================================
// BANNER TEMPLATES
// ==============================================================================

export const BANNER_DATABASE: Record<string, BannerConfiguration> = {
  // ========================================
  // LAUNCH CELEBRATION BANNER
  // ========================================
  
  launch_celebration: {
    id: 'launch_celebration',
    name: 'Launch Celebration Festival',
    description: 'Welcome to the Multi-Gymmy world! Increased rates for all legendary companions!',
    banner_art: '🎉🌟🎊',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-01-15T23:59:59Z',
    is_active: false,
    
    // Featured content
    featured_characters: ['titan_forge', 'infinite_runner', 'zen_master'],
    rate_up_multiplier: 0.75, // 75% chance for featured when pulling their rarity
    guaranteed_featured_at: 100, // Guaranteed featured character at 100 pulls
    
    // Special mechanics
    special_rates: {
      common: 0.55,      // Reduced common rate
      rare: 0.25,        // Normal rare rate
      epic: 0.15,        // Increased epic rate
      legendary: 0.045,  // Significantly increased legendary rate
      mythical: 0.005,    // Normal mythical rate
    },
    
    bonus_materials: {
      basic_crystals: 2,
      training_essence: 1,
    } as EvolutionMaterials,
    
    step_up_rewards: [
      {
        step: 1,
        pulls_required: 1,
        bonus_materials: { basic_crystals: 5, training_essence: 3 } as EvolutionMaterials,
        discount: 0,
      },
      {
        step: 2,
        pulls_required: 10,
        guaranteed_rarity: 'rare',
        bonus_materials: { rare_crystals: 2, power_essence: 1 } as EvolutionMaterials,
        discount: 10,
      },
      {
        step: 3,
        pulls_required: 20,
        guaranteed_rarity: 'epic',
        bonus_materials: { epic_crystals: 1, mastery_essence: 1 } as EvolutionMaterials,
        discount: 15,
      },
      {
        step: 4,
        pulls_required: 50,
        guaranteed_rarity: 'legendary',
        bonus_materials: { legendary_crystals: 1, transcendence_core: 1 } as EvolutionMaterials,
        discount: 25,
      },
    ] as StepUpReward[],
  },

  // ========================================
  // STRENGTH MASTERS BANNER
  // ========================================

  strength_masters: {
    id: 'strength_masters',
    name: 'Strength Masters Summit',
    description: 'The ultimate gathering of strength-focused Gymmys! Power up your lifting game!',
    banner_art: '💪🏋️‍♂️⚡',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-02-14T23:59:59Z',
    is_active: false,
    
    // Featured content - strength specialists
    featured_characters: ['titan_forge', 'iron_giant', 'rookie_power', 'storm_breaker'],
    rate_up_multiplier: 0.6, // 60% chance for featured when pulling their rarity
    guaranteed_featured_at: 80, // Guaranteed featured at 80 pulls
    
    // Strength-focused bonuses
    bonus_materials: {
      power_essence: 2,
      basic_crystals: 1,
      sweat_drops: 3,
    } as EvolutionMaterials,
    
    step_up_rewards: [
      {
        step: 1,
        pulls_required: 5,
        bonus_materials: { power_essence: 3, basic_crystals: 10 } as EvolutionMaterials,
        discount: 5,
      },
      {
        step: 2,
        pulls_required: 15,
        guaranteed_rarity: 'rare',
        bonus_materials: { rare_crystals: 3, power_essence: 5 } as EvolutionMaterials,
        discount: 15,
      },
      {
        step: 3,
        pulls_required: 30,
        guaranteed_rarity: 'epic',
        bonus_materials: { transformation_core: 1, mastery_essence: 2 } as EvolutionMaterials,
        discount: 20,
      },
    ] as StepUpReward[],
  },

  // ========================================
  // CARDIO CHAMPIONS BANNER
  // ========================================

  cardio_champions: {
    id: 'cardio_champions',
    name: 'Cardio Champions Marathon',
    description: 'Run with the legends! Endurance-focused Gymmys ready to boost your cardio game!',
    banner_art: '🏃‍♀️💨🌟',
    start_date: '2024-02-15T00:00:00Z',
    end_date: '2024-02-28T23:59:59Z',
    is_active: false,
    
    // Featured content - cardio specialists
    featured_characters: ['infinite_runner', 'cardio_queen', 'rookie_cardio', 'storm_breaker'],
    rate_up_multiplier: 0.6, // 60% chance for featured when pulling their rarity
    guaranteed_featured_at: 75, // Guaranteed featured at 75 pulls
    
    // Cardio-focused bonuses
    bonus_materials: {
      endurance_essence: 2,
      sweat_drops: 4,
      training_essence: 1,
    } as EvolutionMaterials,
    
    step_up_rewards: [
      {
        step: 1,
        pulls_required: 3,
        bonus_materials: { endurance_essence: 2, sweat_drops: 5 } as EvolutionMaterials,
        discount: 0,
      },
      {
        step: 2,
        pulls_required: 12,
        guaranteed_rarity: 'rare',
        bonus_materials: { rare_crystals: 2, endurance_essence: 4 } as EvolutionMaterials,
        discount: 10,
      },
      {
        step: 3,
        pulls_required: 25,
        guaranteed_rarity: 'epic',
        bonus_materials: { epic_crystals: 1, team_synergy_core: 1 } as EvolutionMaterials,
        discount: 20,
      },
    ] as StepUpReward[],
  },

  // ========================================
  // ZEN MASTERS BANNER
  // ========================================

  zen_masters: {
    id: 'zen_masters',
    name: 'Zen Masters Retreat',
    description: 'Find your inner peace with wisdom-focused Gymmys. Balance your mind, body, and spirit.',
    banner_art: '🧘‍♀️✨🕯️',
    start_date: '2024-03-01T00:00:00Z',
    end_date: '2024-03-14T23:59:59Z',
    is_active: false,
    
    // Featured content - zen/wisdom specialists
    featured_characters: ['zen_master', 'rookie_zen', 'flex_master', 'habit_guardian'],
    rate_up_multiplier: 0.65, // 65% chance for featured when pulling their rarity
    guaranteed_featured_at: 70, // Guaranteed featured at 70 pulls
    
    // Zen-focused bonuses
    bonus_materials: {
      flexibility_essence: 2,
      bond_token: 1,
      training_essence: 2,
    } as EvolutionMaterials,
    
    special_rates: {
      common: 0.50,      // Lower common rate for more premium experience
      rare: 0.30,        // Higher rare rate
      epic: 0.15,        // Higher epic rate
      legendary: 0.04,   // Higher legendary rate
      mythical: 0.01,     // Doubled mythical rate!
    },
  },

  // ========================================
  // ROOKIE RECRUITMENT BANNER
  // ========================================

  rookie_recruitment: {
    id: 'rookie_recruitment',
    name: 'Rookie Recruitment Drive',
    description: 'Perfect for beginners! Higher rates for starter Gymmys and bonus materials!',
    banner_art: '⭐🌟💫',
    start_date: '2024-03-15T00:00:00Z',
    end_date: '2024-03-31T23:59:59Z',
    is_active: false,
    
    // Featured content - rookie types
    featured_characters: ['rookie_power', 'rookie_cardio', 'rookie_zen', 'social_buddy'],
    rate_up_multiplier: 0.8, // 80% chance for featured when pulling their rarity
    guaranteed_featured_at: 50, // Guaranteed featured at 50 pulls (more accessible)
    
    // Beginner-friendly rates
    special_rates: {
      common: 0.40,      // Much lower common rate
      rare: 0.40,        // Much higher rare rate - perfect for beginners
      epic: 0.15,        // Higher epic rate
      legendary: 0.04,   // Higher legendary rate
      mythical: 0.01,     // Doubled mythical rate
    },
    
    // Generous materials for new players
    bonus_materials: {
      basic_crystals: 3,
      training_essence: 2,
      rare_crystals: 1,
      bond_token: 1,
    } as EvolutionMaterials,
    
    step_up_rewards: [
      {
        step: 1,
        pulls_required: 1,
        guaranteed_rarity: 'rare',
        bonus_materials: { basic_crystals: 10, training_essence: 5 } as EvolutionMaterials,
        discount: 50, // 50% discount for first pull!
      },
      {
        step: 2,
        pulls_required: 5,
        guaranteed_rarity: 'epic',
        bonus_materials: { rare_crystals: 5, bond_token: 3 } as EvolutionMaterials,
        discount: 30,
      },
      {
        step: 3,
        pulls_required: 20,
        guaranteed_rarity: 'legendary',
        bonus_materials: { epic_crystals: 2, mastery_essence: 1 } as EvolutionMaterials,
        discount: 25,
      },
    ] as StepUpReward[],
  },

  // ========================================
  // COSMIC AWAKENING BANNER (Ultra Rare)
  // ========================================

  cosmic_awakening: {
    id: 'cosmic_awakening',
    name: 'Cosmic Awakening Event',
    description: 'The rarest of events! Mythical Gymmy rate UP! Reality bends to your determination!',
    banner_art: '🌌⭐🔮',
    start_date: '2024-12-24T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    is_active: false,
    
    // Featured content - mythical focus
    featured_characters: ['cosmic_gymmy', 'titan_forge', 'infinite_runner', 'zen_master'],
    rate_up_multiplier: 0.9, // 90% chance for featured when pulling their rarity
    guaranteed_featured_at: 200, // Very high threshold for ultimate reward
    
    // Incredible rates for this special event
    special_rates: {
      common: 0.30,      // Drastically reduced common
      rare: 0.35,        // High rare rate
      epic: 0.25,        // Very high epic rate
      legendary: 0.08,   // Tripled legendary rate
      mythical: 0.02,     // 4x mythical rate!
    },
    
    // Cosmic materials
    bonus_materials: {
      cosmic_essence: 1,
      legendary_crystals: 1,
      transcendence_core: 1,
      infinity_shard: 1,
    } as EvolutionMaterials,
    
    // Modified pity system for this banner
    pity_override: {
      counters: { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 },
      thresholds: { 
        common: 1, 
        rare: 8,  // Faster rare pity
        epic: 25, // Faster epic pity
        legendary: 60, // Much faster legendary pity
        mythical: 300,  // Faster mythical pity
      },
      soft_pity_start: { 
        common: 1, 
        rare: 6, 
        epic: 20, 
        legendary: 45, 
        mythical: 250, 
      },
      rate_increase_per_pull: { 
        common: 0, 
        rare: 0.03, 
        epic: 0.08, 
        legendary: 0.15, 
        mythical: 0.05, 
      },
    },
    
    step_up_rewards: [
      {
        step: 1,
        pulls_required: 10,
        guaranteed_rarity: 'epic',
        bonus_materials: { cosmic_essence: 1, legendary_crystals: 2 } as EvolutionMaterials,
        discount: 20,
      },
      {
        step: 2,
        pulls_required: 30,
        guaranteed_rarity: 'legendary',
        bonus_materials: { cosmic_essence: 3, reality_crystal: 1 } as EvolutionMaterials,
        discount: 30,
      },
      {
        step: 3,
        pulls_required: 100,
        guaranteed_rarity: 'mythical',
        bonus_materials: { cosmic_essence: 10, reality_crystal: 5, infinity_shard: 3 } as EvolutionMaterials,
        discount: 50,
      },
    ] as StepUpReward[],
  },
};

// ==============================================================================
// SEASONAL EVENT SYSTEM
// ==============================================================================

export interface SeasonalEventConfig {
  id: string;
  name: string;
  theme: string;
  duration_days: number;
  associated_banners: string[];
  special_mechanics: {
    login_bonus_multiplier: number;
    xp_bonus: number;
    material_drop_bonus: number;
  };
  exclusive_rewards: EvolutionMaterials;
}

export const SEASONAL_EVENTS: Record<string, SeasonalEventConfig> = {
  new_year_resolution: {
    id: 'new_year_resolution',
    name: 'New Year, New Gains',
    theme: 'Resolution and Fresh Starts',
    duration_days: 14,
    associated_banners: ['launch_celebration', 'rookie_recruitment'],
    special_mechanics: {
      login_bonus_multiplier: 2.0,
      xp_bonus: 50,
      material_drop_bonus: 25,
    },
    exclusive_rewards: {
      basic_crystals: 100,
      rare_crystals: 20,
      epic_crystals: 5,
      bond_token: 10,
    } as EvolutionMaterials,
  },

  spring_training: {
    id: 'spring_training',
    name: 'Spring Training Camp',
    theme: 'Renewal and Growth',
    duration_days: 21,
    associated_banners: ['strength_masters', 'cardio_champions'],
    special_mechanics: {
      login_bonus_multiplier: 1.5,
      xp_bonus: 30,
      material_drop_bonus: 40,
    },
    exclusive_rewards: {
      power_essence: 20,
      endurance_essence: 20,
      flexibility_essence: 15,
      mastery_essence: 5,
    } as EvolutionMaterials,
  },

  summer_body_challenge: {
    id: 'summer_body_challenge',
    name: 'Summer Body Challenge',
    theme: 'Transformation and Achievement',
    duration_days: 30,
    associated_banners: ['cardio_champions', 'zen_masters'],
    special_mechanics: {
      login_bonus_multiplier: 1.8,
      xp_bonus: 40,
      material_drop_bonus: 35,
    },
    exclusive_rewards: {
      transformation_core: 3,
      team_synergy_core: 2,
      legendary_crystals: 3,
    } as EvolutionMaterials,
  },

  cosmic_convergence: {
    id: 'cosmic_convergence',
    name: 'Cosmic Convergence',
    theme: 'Universal Alignment',
    duration_days: 7,
    associated_banners: ['cosmic_awakening'],
    special_mechanics: {
      login_bonus_multiplier: 5.0,
      xp_bonus: 100,
      material_drop_bonus: 100,
    },
    exclusive_rewards: {
      cosmic_essence: 5,
      reality_crystal: 2,
      infinity_shard: 1,
      transcendence_core: 3,
    } as EvolutionMaterials,
  },
};

// ==============================================================================
// BANNER MANAGEMENT UTILITIES
// ==============================================================================

export const getBannersByDateRange = (startDate: Date, endDate: Date): BannerConfiguration[] => {
  return Object.values(BANNER_DATABASE).filter(banner => {
    const bannerStart = new Date(banner.start_date);
    const bannerEnd = new Date(banner.end_date);
    
    return (bannerStart <= endDate && bannerEnd >= startDate);
  });
};

export const getActiveBannersForDate = (date: Date = new Date()): BannerConfiguration[] => {
  return Object.values(BANNER_DATABASE).filter(banner => {
    const bannerStart = new Date(banner.start_date);
    const bannerEnd = new Date(banner.end_date);
    
    return date >= bannerStart && date <= bannerEnd;
  });
};

export const getBannerById = (bannerId: string): BannerConfiguration | null => {
  return BANNER_DATABASE[bannerId] || null;
};

export const getUpcomingBanners = (daysAhead: number = 30): BannerConfiguration[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
  
  return Object.values(BANNER_DATABASE).filter(banner => {
    const bannerStart = new Date(banner.start_date);
    return bannerStart > now && bannerStart <= futureDate;
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
};

export const getSeasonalEventForDate = (date: Date = new Date()): SeasonalEventConfig | null => {
  // This would typically check against a database or API
  // For now, return null as events would be dynamically activated
  return null;
};

export const createCustomBanner = (
  name: string,
  featuredCharacters: string[],
  duration: number,
  specialRates?: Record<string, number>,
): BannerConfiguration => {
  const now = new Date();
  const endDate = new Date(now.getTime() + (duration * 24 * 60 * 60 * 1000));
  
  return {
    id: `custom_${Date.now()}`,
    name,
    description: `Custom banner featuring ${featuredCharacters.join(', ')}`,
    banner_art: '🎯✨🌟',
    start_date: now.toISOString(),
    end_date: endDate.toISOString(),
    is_active: false,
    featured_characters: featuredCharacters,
    rate_up_multiplier: 0.6,
    guaranteed_featured_at: 80,
    special_rates: specialRates as any,
    bonus_materials: {
      basic_crystals: 2,
      training_essence: 1,
    } as EvolutionMaterials,
  };
};

export default BANNER_DATABASE;