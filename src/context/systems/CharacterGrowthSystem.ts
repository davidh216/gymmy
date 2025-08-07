// src/context/systems/CharacterGrowthSystem.ts
// Character growth mechanics - experience system, evolution trees, and visual progression

import {
  GymmyCharacter,
  GymmyRarity,
  EvolutionMaterials,
  SpecializationType
} from '../types/MultiGymmyTypes';

// ==============================================================================
// GROWTH INTERFACES
// ==============================================================================

export interface ExperienceGain {
  base_exp: number;
  bonus_exp: number;
  total_exp: number;
  source: ExperienceSource;
  multipliers: ExperienceMultiplier[];
}

export interface ExperienceSource {
  type: 'workout' | 'training' | 'milestone' | 'event' | 'daily_bonus' | 'team_synergy';
  activity: string;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
  performance_rating?: number; // 0-100
}

export interface ExperienceMultiplier {
  source: string;
  multiplier: number;
  description: string;
}

export interface LevelUpResult {
  character_id: string;
  old_level: number;
  new_level: number;
  stat_increases: Partial<Record<keyof GymmyCharacter['base_stats'], number>>;
  unlocked_abilities?: string[];
  evolution_available?: boolean;
  rewards?: EvolutionMaterials;
}

export interface EvolutionRequirement {
  level: number;
  materials: EvolutionMaterials;
  bond_points: number;
  special_conditions?: SpecialEvolutionCondition[];
}

export interface SpecialEvolutionCondition {
  type: 'workout_streak' | 'specific_activity' | 'team_composition' | 'milestone' | 'seasonal_event';
  description: string;
  requirement: any;
  met: boolean;
}

export interface EvolutionResult {
  character_id: string;
  old_stage: number;
  new_stage: number;
  stat_bonuses: Partial<Record<keyof GymmyCharacter['base_stats'], number>>;
  new_abilities: string[];
  visual_changes: VisualProgression;
  materials_consumed: EvolutionMaterials;
}

export interface VisualProgression {
  stage: number;
  visual_effects: VisualEffect[];
  appearance_changes: AppearanceChange[];
  animation_unlocks: string[];
}

export interface VisualEffect {
  id: string;
  name: string;
  type: 'aura' | 'particle' | 'glow' | 'distortion' | 'energy' | 'elemental';
  intensity: number;
  color_scheme: string[];
  trigger_conditions: string[];
}

export interface AppearanceChange {
  element: 'emoji' | 'background' | 'border' | 'accessory';
  change_type: 'color' | 'effect' | 'upgrade' | 'transformation';
  description: string;
}

export interface CharacterAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'synergy' | 'evolution_bonus';
  unlock_stage: number;
  effects: AbilityEffect[];
}

export interface AbilityEffect {
  stat: string;
  modifier: number;
  condition?: string;
  duration?: number;
}

// ==============================================================================
// CHARACTER GROWTH SYSTEM
// ==============================================================================

export class CharacterGrowthSystem {
  private static instance: CharacterGrowthSystem;

  private experienceTable: Record<number, number> = {};
  private evolutionRequirements: Record<GymmyRarity, EvolutionRequirement[]> = {};
  private characterAbilities: Record<string, CharacterAbility[]> = {};
  private visualProgressions: Record<string, VisualProgression[]> = {};

  constructor() {
    this.initializeGrowthTables();
    this.initializeEvolutionRequirements();
    this.initializeCharacterAbilities();
    this.initializeVisualProgressions();
  }

  public static getInstance(): CharacterGrowthSystem {
    if (!CharacterGrowthSystem.instance) {
      CharacterGrowthSystem.instance = new CharacterGrowthSystem();
    }
    return CharacterGrowthSystem.instance;
  }

  // ==============================================================================
  // EXPERIENCE SYSTEM
  // ==============================================================================

  public calculateExperienceGain(
    character: GymmyCharacter,
    source: ExperienceSource,
    teamContext?: GymmyCharacter[]
  ): ExperienceGain {
    // Base experience calculation
    let baseExp = this.getBaseExperience(source);

    // Apply character-specific multipliers
    const multipliers: ExperienceMultiplier[] = [];

    // Specialization bonus
    if (this.isSpecializationMatch(character.specialization, source)) {
      multipliers.push({
        source: 'Specialization Match',
        multiplier: 1.5,
        description: `${character.specialization} specialization bonus`
      });
    }

    // Rarity bonus
    const rarityMultiplier = this.getRarityExperienceMultiplier(character.rarity);
    if (rarityMultiplier > 1) {
      multipliers.push({
        source: 'Rarity Bonus',
        multiplier: rarityMultiplier,
        description: `${character.rarity} rarity experience bonus`
      });
    }

    // Team synergy bonus
    if (teamContext && teamContext.length > 1) {
      const synergyMultiplier = this.calculateTeamSynergyMultiplier(character, teamContext);
      if (synergyMultiplier > 1) {
        multipliers.push({
          source: 'Team Synergy',
          multiplier: synergyMultiplier,
          description: 'Working with compatible team members'
        });
      }
    }

    // Level difference penalty/bonus
    const levelMultiplier = this.getLevelBasedMultiplier(character.level, source);
    if (levelMultiplier !== 1) {
      multipliers.push({
        source: 'Level Scaling',
        multiplier: levelMultiplier,
        description: levelMultiplier > 1 ? 'Catch-up bonus' : 'High-level penalty'
      });
    }

    // Calculate bonus experience
    const totalMultiplier = multipliers.reduce((total, mult) => total * mult.multiplier, 1);
    const bonusExp = baseExp * (totalMultiplier - 1);
    const totalExp = baseExp + bonusExp;

    return {
      base_exp: Math.round(baseExp),
      bonus_exp: Math.round(bonusExp),
      total_exp: Math.round(totalExp),
      source,
      multipliers
    };
  }

  private getBaseExperience(source: ExperienceSource): number {
    const baseRates = {
      workout: { easy: 50, medium: 100, hard: 200, extreme: 400 },
      training: { easy: 30, medium: 60, hard: 120, extreme: 240 },
      milestone: { easy: 200, medium: 500, hard: 1000, extreme: 2000 },
      event: { easy: 100, medium: 250, hard: 500, extreme: 1000 },
      daily_bonus: { easy: 25, medium: 25, hard: 25, extreme: 25 },
      team_synergy: { easy: 20, medium: 40, hard: 80, extreme: 160 }
    };

    const base = baseRates[source.type]?.[source.difficulty || 'medium'] || 50;

    // Duration bonus for workout/training
    if (source.duration && (source.type === 'workout' || source.type === 'training')) {
      const durationMultiplier = Math.min(2.0, 1 + (source.duration - 30) / 60); // +100% max for 90+ min sessions
      return base * durationMultiplier;
    }

    // Performance rating bonus
    if (source.performance_rating) {
      const performanceMultiplier = 0.5 + (source.performance_rating / 100); // 50% to 150%
      return base * performanceMultiplier;
    }

    return base;
  }

  private isSpecializationMatch(specialization: SpecializationType, source: ExperienceSource): boolean {
    const matchMap: Record<SpecializationType, string[]> = {
      strength_training: ['strength', 'weight', 'powerlifting', 'resistance'],
      cardio_endurance: ['cardio', 'running', 'cycling', 'endurance'],
      flexibility_mobility: ['yoga', 'stretching', 'flexibility', 'mobility'],
      mental_wellness: ['meditation', 'mindfulness', 'stress', 'mental'],
      hybrid_training: ['crossfit', 'functional', 'mixed', 'varied'],
      recovery_restoration: ['recovery', 'rest', 'sleep', 'restoration']
    };

    const keywords = matchMap[specialization] || [];
    return keywords.some(keyword => 
      source.activity.toLowerCase().includes(keyword) ||
      source.type === 'workout' // General workout always matches
    );
  }

  private getRarityExperienceMultiplier(rarity: GymmyRarity): number {
    const multipliers = {
      common: 1.0,
      rare: 1.1,
      epic: 1.2,
      legendary: 1.3,
      mythical: 1.5
    };
    return multipliers[rarity];
  }

  private calculateTeamSynergyMultiplier(character: GymmyCharacter, team: GymmyCharacter[]): number {
    let synergy = 1.0;
    
    // Same specialization bonus
    const sameSpecCount = team.filter(c => 
      c.id !== character.id && c.specialization === character.specialization
    ).length;
    synergy += sameSpecCount * 0.05; // +5% per matching specialization
    
    // Rarity synergy
    const rarityMatches = team.filter(c => 
      c.id !== character.id && c.rarity === character.rarity
    ).length;
    synergy += rarityMatches * 0.03; // +3% per matching rarity
    
    // Team size bonus
    if (team.length >= 4) synergy += 0.1; // +10% for full team
    
    return Math.min(1.5, synergy); // Cap at +50%
  }

  private getLevelBasedMultiplier(level: number, source: ExperienceSource): number {
    // Catch-up mechanics for lower level characters
    if (level < 20) return 1.2; // +20% for levels 1-19
    if (level < 40) return 1.1; // +10% for levels 20-39
    if (level > 80) return 0.8; // -20% for levels 80+
    return 1.0;
  }

  public applyExperience(character: GymmyCharacter, experienceGain: ExperienceGain): LevelUpResult | null {
    const oldLevel = character.level;
    character.current_exp += experienceGain.total_exp;

    // Check for level ups
    let newLevel = oldLevel;
    const statIncreases: Partial<Record<keyof GymmyCharacter['base_stats'], number>> = {};
    const unlockedAbilities: string[] = [];
    let rewards: EvolutionMaterials | undefined;

    while (character.current_exp >= this.getExperienceForLevel(newLevel + 1) && newLevel < 100) {
      newLevel++;
      
      // Calculate stat increases for this level
      const levelStats = this.calculateLevelUpStats(character, newLevel);
      Object.keys(levelStats).forEach(stat => {
        const key = stat as keyof typeof statIncreases;
        statIncreases[key] = (statIncreases[key] || 0) + levelStats[key];
      });

      // Check for ability unlocks
      const abilities = this.getAbilitiesForLevel(character, newLevel);
      unlockedAbilities.push(...abilities);

      // Level milestone rewards
      if (newLevel % 10 === 0) {
        rewards = this.getLevelMilestoneRewards(newLevel, character.rarity);
      }
    }

    if (newLevel > oldLevel) {
      character.level = newLevel;
      
      // Apply stat increases to current stats
      Object.keys(statIncreases).forEach(stat => {
        const key = stat as keyof GymmyCharacter['current_stats'];
        character.current_stats[key] += statIncreases[key] || 0;
      });

      return {
        character_id: character.id,
        old_level: oldLevel,
        new_level: newLevel,
        stat_increases: statIncreases,
        unlocked_abilities: unlockedAbilities,
        evolution_available: this.canEvolve(character),
        rewards
      };
    }

    return null;
  }

  private calculateLevelUpStats(character: GymmyCharacter, level: number): Partial<Record<keyof GymmyCharacter['base_stats'], number>> {
    // Base growth rates per specialization
    const growthRates: Record<SpecializationType, Record<string, number>> = {
      strength_training: { strength: 2.5, cardio: 1.2, flexibility: 1.0, focus: 1.5, motivation: 1.8, loyalty: 1.3 },
      cardio_endurance: { strength: 1.2, cardio: 2.5, flexibility: 1.5, focus: 1.8, motivation: 2.0, loyalty: 1.3 },
      flexibility_mobility: { strength: 1.0, cardio: 1.5, flexibility: 2.5, focus: 2.2, motivation: 1.5, loyalty: 1.8 },
      mental_wellness: { strength: 1.0, cardio: 1.3, flexibility: 2.0, focus: 2.8, motivation: 2.2, loyalty: 2.0 },
      hybrid_training: { strength: 2.0, cardio: 2.0, flexibility: 1.8, focus: 1.8, motivation: 2.0, loyalty: 1.5 },
      recovery_restoration: { strength: 1.5, cardio: 1.8, flexibility: 2.2, focus: 2.0, motivation: 1.8, loyalty: 2.5 }
    };

    const rates = growthRates[character.specialization];
    const rarityMultiplier = { common: 0.8, rare: 1.0, epic: 1.2, legendary: 1.5, mythical: 2.0 }[character.rarity];

    const stats: any = {};
    Object.keys(rates).forEach(stat => {
      stats[stat] = Math.round(rates[stat] * rarityMultiplier);
    });

    return stats;
  }

  private getAbilitiesForLevel(character: GymmyCharacter, level: number): string[] {
    const abilities = this.characterAbilities[character.template_id] || [];
    return abilities
      .filter(ability => ability.unlock_stage === 0 && this.meetsLevelRequirement(level, ability))
      .map(ability => ability.id);
  }

  private meetsLevelRequirement(level: number, ability: CharacterAbility): boolean {
    // Abilities unlock at specific level thresholds
    const levelThresholds = [10, 25, 40, 60, 80];
    return levelThresholds.some(threshold => level >= threshold);
  }

  private getLevelMilestoneRewards(level: number, rarity: GymmyRarity): EvolutionMaterials {
    const baseRewards: Record<number, EvolutionMaterials> = {
      10: { basic_crystals: 10, training_essence: 5 },
      20: { basic_crystals: 20, training_essence: 10, bond_token: 2 },
      30: { rare_crystals: 5, power_essence: 3, bond_token: 3 },
      40: { rare_crystals: 10, power_essence: 8, bond_token: 5 },
      50: { epic_crystals: 3, legendary_crystals: 1, bond_token: 8 }
    };

    const baseReward = baseRewards[level] || {};
    const rarityMultiplier = { common: 1, rare: 1.2, epic: 1.5, legendary: 2, mythical: 3 }[rarity];

    const scaledReward: any = {};
    Object.keys(baseReward).forEach(material => {
      scaledReward[material] = Math.round((baseReward as any)[material] * rarityMultiplier);
    });

    return scaledReward;
  }

  // ==============================================================================
  // EVOLUTION SYSTEM
  // ==============================================================================

  public canEvolve(character: GymmyCharacter): boolean {
    if (character.evolution_stage >= 3) return false;
    
    const requirements = this.getEvolutionRequirements(character.rarity, character.evolution_stage + 1);
    if (!requirements) return false;

    // Check level requirement
    if (character.level < requirements.level) return false;

    // Check bond points
    if (character.bond_points < requirements.bond_points) return false;

    // Check special conditions
    if (requirements.special_conditions) {
      return requirements.special_conditions.every(condition => condition.met);
    }

    return true;
  }

  public getEvolutionRequirements(rarity: GymmyRarity, stage: number): EvolutionRequirement | null {
    const requirements = this.evolutionRequirements[rarity];
    return requirements?.[stage - 1] || null;
  }

  public evolveCharacter(
    character: GymmyCharacter,
    availableMaterials: EvolutionMaterials
  ): EvolutionResult | null {
    if (!this.canEvolve(character)) return null;

    const requirements = this.getEvolutionRequirements(character.rarity, character.evolution_stage + 1);
    if (!requirements) return null;

    // Check if materials are sufficient
    if (!this.hasSufficientMaterials(availableMaterials, requirements.materials)) {
      return null;
    }

    const oldStage = character.evolution_stage;
    const newStage = oldStage + 1;

    // Apply evolution
    character.evolution_stage = newStage;

    // Calculate stat bonuses
    const statBonuses = this.calculateEvolutionStatBonuses(character, newStage);
    Object.keys(statBonuses).forEach(stat => {
      const key = stat as keyof GymmyCharacter['current_stats'];
      character.current_stats[key] += statBonuses[key] || 0;
    });

    // Unlock new abilities
    const newAbilities = this.getEvolutionAbilities(character, newStage);

    // Get visual progression
    const visualChanges = this.getVisualProgression(character, newStage);

    return {
      character_id: character.id,
      old_stage: oldStage,
      new_stage: newStage,
      stat_bonuses: statBonuses,
      new_abilities: newAbilities,
      visual_changes: visualChanges,
      materials_consumed: requirements.materials
    };
  }

  private hasSufficientMaterials(available: EvolutionMaterials, required: EvolutionMaterials): boolean {
    return Object.keys(required).every(material => {
      const key = material as keyof EvolutionMaterials;
      return (available[key] || 0) >= (required[key] || 0);
    });
  }

  private calculateEvolutionStatBonuses(
    character: GymmyCharacter,
    stage: number
  ): Partial<Record<keyof GymmyCharacter['base_stats'], number>> {
    // Evolution stat bonuses scale with rarity and specialization
    const rarityMultiplier = { common: 1, rare: 1.2, epic: 1.5, legendary: 2, mythical: 2.5 }[character.rarity];
    const stageMultiplier = { 1: 1, 2: 1.5, 3: 2 }[stage] || 1;

    const baseBonuses: Record<SpecializationType, Record<string, number>> = {
      strength_training: { strength: 15, cardio: 8, flexibility: 5, focus: 10, motivation: 12, loyalty: 10 },
      cardio_endurance: { strength: 8, cardio: 15, flexibility: 10, focus: 12, motivation: 15, loyalty: 10 },
      flexibility_mobility: { strength: 5, cardio: 10, flexibility: 15, focus: 18, motivation: 10, loyalty: 12 },
      mental_wellness: { strength: 5, cardio: 8, flexibility: 12, focus: 20, motivation: 15, loyalty: 15 },
      hybrid_training: { strength: 12, cardio: 12, flexibility: 10, focus: 10, motivation: 15, loyalty: 8 },
      recovery_restoration: { strength: 8, cardio: 10, flexibility: 12, focus: 12, motivation: 10, loyalty: 18 }
    };

    const baseBonusSet = baseBonuses[character.specialization];
    const scaledBonuses: any = {};

    Object.keys(baseBonusSet).forEach(stat => {
      scaledBonuses[stat] = Math.round(baseBonusSet[stat] * rarityMultiplier * stageMultiplier);
    });

    return scaledBonuses;
  }

  private getEvolutionAbilities(character: GymmyCharacter, stage: number): string[] {
    const abilities = this.characterAbilities[character.template_id] || [];
    return abilities
      .filter(ability => ability.unlock_stage === stage)
      .map(ability => ability.id);
  }

  private getVisualProgression(character: GymmyCharacter, stage: number): VisualProgression {
    const progressions = this.visualProgressions[character.template_id] || [];
    return progressions[stage - 1] || this.getDefaultVisualProgression(stage);
  }

  private getDefaultVisualProgression(stage: number): VisualProgression {
    const effects: VisualEffect[] = [];
    const changes: AppearanceChange[] = [];
    const animations: string[] = [];

    switch (stage) {
      case 1:
        effects.push({
          id: 'evolution_sparkle',
          name: 'Awakening Sparkle',
          type: 'particle',
          intensity: 0.3,
          color_scheme: ['#FFD700', '#FFF'],
          trigger_conditions: ['on_display', 'on_level_up']
        });
        changes.push({
          element: 'border',
          change_type: 'effect',
          description: 'Subtle golden glow around character'
        });
        animations.push('awakening_pulse');
        break;

      case 2:
        effects.push({
          id: 'evolution_glow',
          name: 'Enhanced Aura',
          type: 'glow',
          intensity: 0.6,
          color_scheme: ['#4CAF50', '#8BC34A'],
          trigger_conditions: ['on_display', 'on_interaction']
        });
        changes.push({
          element: 'background',
          change_type: 'upgrade',
          description: 'Radiant energy background'
        });
        animations.push('power_surge', 'enhanced_idle');
        break;

      case 3:
        effects.push({
          id: 'evolution_transcendence',
          name: 'Transcendent Aura',
          type: 'distortion',
          intensity: 1.0,
          color_scheme: ['#9C27B0', '#E91E63', '#FF9800'],
          trigger_conditions: ['always', 'on_interaction', 'on_ability_use']
        });
        changes.push({
          element: 'accessory',
          change_type: 'transformation',
          description: 'Legendary crown or emblems'
        });
        animations.push('transcendence_idle', 'reality_pulse', 'legendary_flex');
        break;
    }

    return {
      stage,
      visual_effects: effects,
      appearance_changes: changes,
      animation_unlocks: animations
    };
  }

  // ==============================================================================
  // INITIALIZATION METHODS
  // ==============================================================================

  private initializeGrowthTables(): void {
    // Experience required for each level (exponential growth)
    for (let level = 1; level <= 100; level++) {
      this.experienceTable[level] = Math.floor(100 * Math.pow(level, 2.2));
    }
  }

  private initializeEvolutionRequirements(): void {
    this.evolutionRequirements = {
      common: [
        {
          level: 20,
          materials: { basic_crystals: 5, training_essence: 3, bond_token: 1 },
          bond_points: 500
        },
        {
          level: 40,
          materials: { rare_crystals: 3, power_essence: 2, bond_token: 2 },
          bond_points: 1200
        },
        {
          level: 60,
          materials: { epic_crystals: 2, legendary_crystals: 1, bond_token: 3 },
          bond_points: 2500
        }
      ],
      rare: [
        {
          level: 25,
          materials: { basic_crystals: 8, training_essence: 5, bond_token: 2 },
          bond_points: 800
        },
        {
          level: 45,
          materials: { rare_crystals: 5, power_essence: 3, bond_token: 3 },
          bond_points: 1800
        },
        {
          level: 65,
          materials: { epic_crystals: 3, legendary_crystals: 1, bond_token: 5 },
          bond_points: 3500
        }
      ],
      epic: [
        {
          level: 30,
          materials: { basic_crystals: 12, rare_crystals: 3, training_essence: 8, bond_token: 3 },
          bond_points: 1200
        },
        {
          level: 50,
          materials: { rare_crystals: 8, power_essence: 5, epic_crystals: 2, bond_token: 5 },
          bond_points: 2500
        },
        {
          level: 70,
          materials: { epic_crystals: 5, legendary_crystals: 2, transcendence_core: 1, bond_token: 8 },
          bond_points: 5000
        }
      ],
      legendary: [
        {
          level: 35,
          materials: { rare_crystals: 10, power_essence: 8, epic_crystals: 3, bond_token: 5 },
          bond_points: 2000
        },
        {
          level: 55,
          materials: { epic_crystals: 8, legendary_crystals: 3, transcendence_core: 1, bond_token: 8 },
          bond_points: 4000
        },
        {
          level: 75,
          materials: { legendary_crystals: 10, transcendence_core: 3, divine_essence: 1, bond_token: 15 },
          bond_points: 8000
        }
      ],
      mythical: [
        {
          level: 40,
          materials: { epic_crystals: 15, legendary_crystals: 5, transcendence_core: 2, bond_token: 10 },
          bond_points: 5000
        },
        {
          level: 60,
          materials: { legendary_crystals: 15, transcendence_core: 5, divine_essence: 2, bond_token: 15 },
          bond_points: 10000
        },
        {
          level: 80,
          materials: { transcendence_core: 10, divine_essence: 5, cosmic_fragment: 1, bond_token: 25 },
          bond_points: 20000
        }
      ]
    };
  }

  private initializeCharacterAbilities(): void {
    // This would be populated with character-specific abilities
    // For now, we'll initialize with empty arrays for all template IDs
    this.characterAbilities = {};
  }

  private initializeVisualProgressions(): void {
    // This would be populated with character-specific visual progressions
    // For now, we'll rely on the default progression system
    this.visualProgressions = {};
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  public getExperienceForLevel(level: number): number {
    return this.experienceTable[level] || 0;
  }

  public getExperienceToNextLevel(character: GymmyCharacter): number {
    if (character.level >= 100) return 0;
    return this.getExperienceForLevel(character.level + 1) - character.current_exp;
  }

  public getProgressToNextLevel(character: GymmyCharacter): number {
    if (character.level >= 100) return 100;
    
    const currentLevelExp = this.getExperienceForLevel(character.level);
    const nextLevelExp = this.getExperienceForLevel(character.level + 1);
    const expInCurrentLevel = character.current_exp - currentLevelExp;
    const expRequiredForLevel = nextLevelExp - currentLevelExp;

    return (expInCurrentLevel / expRequiredForLevel) * 100;
  }

  public simulateWorkout(
    characters: GymmyCharacter[],
    workoutData: ExperienceSource,
    availableMaterials?: EvolutionMaterials
  ): {
    experience_gains: ExperienceGain[];
    level_ups: LevelUpResult[];
    evolutions: EvolutionResult[];
  } {
    const experienceGains: ExperienceGain[] = [];
    const levelUps: LevelUpResult[] = [];
    const evolutions: EvolutionResult[] = [];

    characters.forEach(character => {
      // Calculate and apply experience
      const expGain = this.calculateExperienceGain(character, workoutData, characters);
      experienceGains.push(expGain);

      const levelUpResult = this.applyExperience(character, expGain);
      if (levelUpResult) {
        levelUps.push(levelUpResult);
      }

      // Check for evolution opportunity
      if (this.canEvolve(character) && availableMaterials) {
        const evolutionResult = this.evolveCharacter(character, availableMaterials);
        if (evolutionResult) {
          evolutions.push(evolutionResult);
          // Deduct consumed materials
          Object.keys(evolutionResult.materials_consumed).forEach(material => {
            const key = material as keyof EvolutionMaterials;
            if (availableMaterials[key]) {
              availableMaterials[key] -= evolutionResult.materials_consumed[key] || 0;
            }
          });
        }
      }
    });

    return {
      experience_gains: experienceGains,
      level_ups: levelUps,
      evolutions: evolutions
    };
  }
}

// ==============================================================================
// EXPORT SINGLETON INSTANCE
// ==============================================================================

export const characterGrowthSystem = CharacterGrowthSystem.getInstance();
export default characterGrowthSystem;