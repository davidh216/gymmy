// src/context/data/EvolutionMaterials.ts
// Evolution materials system for Multi-Gymmy character progression

import {
  // EvolutionMaterial,
  // GymmyRarity
} from '../types/MultiGymmyTypes';

// ==============================================================================
// EVOLUTION MATERIALS DATABASE
// ==============================================================================

export const EVOLUTION_MATERIALS: Record<string, EvolutionMaterial> = {
  // Basic Materials (Common rewards)
  basic_crystals: {
    id: 'basic_crystals',
    name: 'Basic Crystals',
    description: 'Fundamental energy crystals formed from consistent training.',
    rarity: 'common',
    sources: ['daily_workout', 'streak_maintenance', 'basic_achievements'],
    icon: '💎',
    value: 1,
  },
  
  training_essence: {
    id: 'training_essence',
    name: 'Training Essence',
    description: 'Concentrated essence of dedication and effort.',
    rarity: 'common',
    sources: ['workout_completion', 'personal_records', 'consistent_training'],
    icon: '✨',
    value: 2,
  },

  sweat_drops: {
    id: 'sweat_drops',
    name: 'Crystallized Sweat',
    description: 'Every drop represents hard work and determination.',
    rarity: 'common',
    sources: ['intense_workouts', 'cardio_sessions', 'strength_training'],
    icon: '💧',
    value: 1,
  },

  // Rare Materials (Rare rewards)
  rare_crystals: {
    id: 'rare_crystals',
    name: 'Rare Crystals',
    description: 'Brilliant crystals that form during breakthrough moments.',
    rarity: 'rare',
    sources: ['achievement_unlock', 'streak_milestones', 'rare_achievements'],
    icon: '🔮',
    value: 5,
  },

  power_essence: {
    id: 'power_essence',
    name: 'Power Essence',
    description: 'Raw power crystallized from overcoming limitations.',
    rarity: 'rare',
    sources: ['strength_breakthroughs', 'heavy_lift_sessions', 'powerlifter_class'],
    icon: '⚡',
    value: 8,
  },

  endurance_essence: {
    id: 'endurance_essence',
    name: 'Endurance Essence',
    description: 'The spirit of never giving up, refined into pure form.',
    rarity: 'rare',
    sources: ['long_cardio_sessions', 'endurance_achievements', 'athlete_class'],
    icon: '🌊',
    value: 8,
  },

  flexibility_essence: {
    id: 'flexibility_essence',
    name: 'Flexibility Essence',
    description: 'Flowing energy that adapts to any challenge.',
    rarity: 'rare',
    sources: ['flexibility_improvements', 'yoga_sessions', 'yogi_class'],
    icon: '🍃',
    value: 8,
  },

  bond_token: {
    id: 'bond_token',
    name: 'Bond Token',
    description: 'A token representing the strong bond between trainer and Gymmy.',
    rarity: 'rare',
    sources: ['character_bonding', 'loyalty_milestones', 'daily_interactions'],
    icon: '🤝',
    value: 10,
  },

  // Epic Materials (Epic rewards)
  epic_crystals: {
    id: 'epic_crystals',
    name: 'Epic Crystals',
    description: 'Magnificent crystals that resonate with legendary power.',
    rarity: 'epic',
    sources: ['epic_achievements', 'major_milestones', 'transformation_moments'],
    icon: '💜',
    value: 15,
  },

  transformation_core: {
    id: 'transformation_core',
    name: 'Transformation Core',
    description: 'The crystallized moment of true transformation.',
    rarity: 'epic',
    sources: ['body_transformation', 'lifestyle_change', 'major_breakthroughs'],
    icon: '🔆',
    value: 20,
  },

  mastery_essence: {
    id: 'mastery_essence',
    name: 'Mastery Essence',
    description: 'The pure essence of achieving mastery in any discipline.',
    rarity: 'epic',
    sources: ['skill_mastery', 'perfect_form', 'expert_achievements'],
    icon: '🎯',
    value: 25,
  },

  team_synergy_core: {
    id: 'team_synergy_core',
    name: 'Team Synergy Core',
    description: 'Energy formed when multiple Gymmys work in perfect harmony.',
    rarity: 'epic',
    sources: ['team_workouts', 'synergy_achievements', 'group_milestones'],
    icon: '🌟',
    value: 30,
  },

  // Legendary Materials (Legendary rewards)
  legendary_crystals: {
    id: 'legendary_crystals',
    name: 'Legendary Crystals',
    description: 'Crystals of immense power, formed only through legendary achievements.',
    rarity: 'legendary',
    sources: ['legendary_achievements', 'ultimate_goals', 'transcendent_moments'],
    icon: '🏆',
    value: 50,
  },

  transcendence_core: {
    id: 'transcendence_core',
    name: 'Transcendence Core',
    description: 'The crystallized essence of transcending human limitations.',
    rarity: 'legendary',
    sources: ['transcendent_achievements', 'ultimate_transformation', 'legendary_status'],
    icon: '👑',
    value: 100,
  },

  eternal_bond: {
    id: 'eternal_bond',
    name: 'Eternal Bond',
    description: 'An unbreakable connection forged through countless shared victories.',
    rarity: 'legendary',
    sources: ['maximum_bond_level', 'loyalty_legend', 'eternal_companionship'],
    icon: '💖',
    value: 150,
  },

  infinity_shard: {
    id: 'infinity_shard',
    name: 'Infinity Shard',
    description: 'A fragment of infinite potential, containing boundless power.',
    rarity: 'legendary',
    sources: ['infinite_achievements', 'cosmic_events', 'reality_transcendence'],
    icon: '♾️',
    value: 200,
  },

  // Mythical Materials (Mythical rewards)
  cosmic_essence: {
    id: 'cosmic_essence',
    name: 'Cosmic Essence',
    description: 'The fundamental force that binds the universe together.',
    rarity: 'mythical',
    sources: ['cosmic_achievements', 'universe_alignment', 'dimensional_breakthrough'],
    icon: '🌌',
    value: 500,
  },

  reality_crystal: {
    id: 'reality_crystal',
    name: 'Reality Crystal',
    description: 'A crystal that can reshape reality itself through pure will.',
    rarity: 'mythical',
    sources: ['reality_manipulation', 'dimensional_mastery', 'cosmic_transcendence'],
    icon: '🔮',
    value: 1000,
  },
};

// ==============================================================================
// MATERIAL SOURCES CONFIGURATION
// ==============================================================================

export const MATERIAL_SOURCES: Record<string, { materials: string[], rates: number[] }> = {
  // Daily Activities
  daily_workout: {
    materials: ['basic_crystals', 'training_essence', 'sweat_drops'],
    rates: [0.8, 0.6, 0.9], // 80% basic crystals, 60% training essence, 90% sweat drops
  },
  
  personal_record: {
    materials: ['training_essence', 'power_essence', 'rare_crystals'],
    rates: [1.0, 0.3, 0.2], // 100% training essence, 30% power essence, 20% rare crystals
  },
  
  streak_milestone: {
    materials: ['rare_crystals', 'bond_token', 'epic_crystals'],
    rates: [0.7, 0.5, 0.1], // 70% rare crystals, 50% bond token, 10% epic crystals
  },

  // Specialized Training
  strength_session: {
    materials: ['sweat_drops', 'power_essence', 'basic_crystals'],
    rates: [1.0, 0.4, 0.8],
  },

  cardio_session: {
    materials: ['sweat_drops', 'endurance_essence', 'basic_crystals'],
    rates: [1.0, 0.4, 0.8],
  },

  flexibility_session: {
    materials: ['training_essence', 'flexibility_essence', 'basic_crystals'],
    rates: [0.9, 0.4, 0.8],
  },

  // Achievements
  major_achievement: {
    materials: ['epic_crystals', 'mastery_essence', 'transformation_core'],
    rates: [0.8, 0.6, 0.3],
  },

  legendary_achievement: {
    materials: ['legendary_crystals', 'transcendence_core', 'eternal_bond'],
    rates: [0.9, 0.5, 0.2],
  },

  cosmic_achievement: {
    materials: ['cosmic_essence', 'reality_crystal', 'infinity_shard'],
    rates: [0.7, 0.3, 0.5],
  },

  // Social & Team Activities
  team_workout: {
    materials: ['bond_token', 'team_synergy_core', 'training_essence'],
    rates: [0.8, 0.3, 1.0],
  },

  character_bonding: {
    materials: ['bond_token', 'training_essence', 'rare_crystals'],
    rates: [1.0, 0.7, 0.4],
  },
};

// ==============================================================================
// EVOLUTION RECIPES
// ==============================================================================

export const EVOLUTION_RECIPES: Record<string, Record<string, Record<string, number>>> = {
  common: {
    stage_1: {
      basic_crystals: 5,
      training_essence: 3,
      sweat_drops: 10,
    },
    stage_2: {
      rare_crystals: 3,
      bond_token: 1,
      training_essence: 8,
    },
  },
  
  rare: {
    stage_1: {
      basic_crystals: 8,
      rare_crystals: 3,
      power_essence: 2,
    },
    stage_2: {
      rare_crystals: 5,
      epic_crystals: 2,
      mastery_essence: 1,
    },
  },
  
  epic: {
    stage_1: {
      rare_crystals: 10,
      epic_crystals: 5,
      transformation_core: 2,
    },
    stage_2: {
      epic_crystals: 8,
      legendary_crystals: 3,
      transcendence_core: 1,
    },
  },
  
  legendary: {
    stage_1: {
      epic_crystals: 15,
      legendary_crystals: 8,
      transcendence_core: 3,
    },
    stage_2: {
      legendary_crystals: 12,
      eternal_bond: 2,
      infinity_shard: 1,
    },
    stage_3: {
      legendary_crystals: 20,
      cosmic_essence: 5,
      reality_crystal: 2,
    },
  },
  
  mythical: {
    stage_1: {
      legendary_crystals: 25,
      cosmic_essence: 10,
      infinity_shard: 5,
    },
    stage_2: {
      cosmic_essence: 15,
      reality_crystal: 8,
      transcendence_core: 10,
    },
    stage_3: {
      reality_crystal: 12,
      cosmic_essence: 20,
      eternal_bond: 5,
    },
  },
};

// ==============================================================================
// MATERIAL REWARDS BY ACTIVITY
// ==============================================================================

export const ACTIVITY_REWARDS: Record<string, { base_materials: string[], bonus_conditions: Record<string, string[]> }> = {
  workout_completion: {
    base_materials: ['basic_crystals', 'training_essence', 'sweat_drops'],
    bonus_conditions: {
      'perfect_form': ['power_essence'],
      'personal_record': ['rare_crystals'],
      'long_session': ['endurance_essence'],
      'team_workout': ['bond_token'],
    },
  },
  
  achievement_unlock: {
    base_materials: ['rare_crystals', 'mastery_essence'],
    bonus_conditions: {
      'first_achievement': ['epic_crystals'],
      'rare_achievement': ['transformation_core'],
      'legendary_achievement': ['legendary_crystals'],
    },
  },
  
  character_evolution: {
    base_materials: ['bond_token', 'transformation_core'],
    bonus_conditions: {
      'first_evolution': ['epic_crystals'],
      'max_evolution': ['legendary_crystals'],
    },
  },
};

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

export const getMaterialsByRarity = (rarity: GymmyRarity): EvolutionMaterial[] => {
  return Object.values(EVOLUTION_MATERIALS).filter(material => material.rarity === rarity);
};

export const getMaterialValue = (materialId: string): number => {
  // const material = ...; // Quick fix: commented unused variable
  return material ? material.value : 0;
};

export const calculateEvolutionCost = (rarity: GymmyRarity, stage: number): Record<string, number> => {
  // const recipeKey = ...; // Quick fix: commented unused variable
  return EVOLUTION_RECIPES[rarity]?.[recipeKey] || {};
};

export const canEvolve = (
  rarity: GymmyRarity, 
  stage: number, 
  inventory: Record<string, number>,
): boolean => {
  // const requirements = ...; // Quick fix: commented unused variable
  
  for (const [materialId, required] of Object.entries(requirements)) {
    if ((inventory[materialId] || 0) < required) {
      return false;
    }
  }
  
  return true;
};

export const calculateMaterialRewards = (
  activityType: string, 
  conditions: string[] = [],
): Record<string, number> => {
  // const activity = ...; // Quick fix: commented unused variable
  if (!activity) return {};
  
  const rewards: Record<string, number> = {};
  
  // Add base materials
  activity.base_materials.forEach(materialId => {
    // const source = ...; // Quick fix: commented unused variable
    if (source && source.materials.includes(materialId)) {
      // const index = ...; // Quick fix: commented unused variable
      // const rate = ...; // Quick fix: commented unused variable
      if (Math.random() < rate) {
        rewards[materialId] = (rewards[materialId] || 0) + 1;
      }
    }
  });
  
  // Add bonus materials based on conditions
  conditions.forEach(condition => {
    // const bonusMaterials = ...; // Quick fix: commented unused variable
    if (bonusMaterials) {
      bonusMaterials.forEach(materialId => {
        rewards[materialId] = (rewards[materialId] || 0) + 1;
      });
    }
  });
  
  return rewards;
};

export default EVOLUTION_MATERIALS;