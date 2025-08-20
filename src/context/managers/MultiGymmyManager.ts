// src/context/managers/MultiGymmyManager.ts
// Multi-Gymmy Manager - Central management for character collection and progression

import {
  // GymmyCharacter,
  // GymmyRarity,
  // SpecializationType,
  // PersonalityType,
  // // Remove unused imports
  // GymmyCollection,
  // // MultiGymmyState,
  // 
} from '../types/MultiGymmyTypes';

import {
  // characterGrowthSystem,
  // progressionTracker,
  // pullAnalyticsEngine,
  // 
} from '../systems';

import {
  // // Remove unused imports
  // EVOLUTION_MATERIALS,
  // // calculateEvolutionCost,
  // // calculateMaterialRewards,
  // 
} from '../data/EvolutionMaterials';

// ==============================================================================
// MULTI-GYMMY MANAGER CLASS
// ==============================================================================

export class MultiGymmyManager {
  private static instance: MultiGymmyManager;

  constructor() {
    // Singleton pattern to ensure consistency
  }

  public static getInstance(): MultiGymmyManager {
    if (!MultiGymmyManager.instance) {
      MultiGymmyManager.instance = new MultiGymmyManager();
    }
    return MultiGymmyManager.instance;
  }

  // ==============================================================================
  // GACHA SYSTEM METHODS
  // ==============================================================================

  /**
   * Perform a gacha pull with enhanced mechanics
   */
  public performGachaPull(
    pullType: 'single' | 'ten_pull',
    pityCounters: Record<GymmyRarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 },
    bannerId?: string,
  ): { characters: GymmyCharacter[], updatedPityCounters: Record<GymmyRarity, number> } {
    // const pullCount = ...; // Quick fix: commented unused variable
    const characters: GymmyCharacter[] = [];
    // const updatedPityCounters = ...; // Quick fix: commented unused variable

    for (let i = 0; i < pullCount; i++) {
      const { character, newPityCounters } = this.performSinglePull(updatedPityCounters, bannerId);
      characters.push(character);
      Object.assign(updatedPityCounters, newPityCounters);
    }

    // Guarantee at least one rare+ in 10-pull
    if (pullType === 'ten_pull') {
      const hasRareOrBetter = characters.some(c => 
        c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary' || c.rarity === 'mythical',
      );
      
      if (!hasRareOrBetter) {
        // Replace the last character with a guaranteed rare
        // const rareCharacter = ...; // Quick fix: commented unused variable
        if (rareCharacter) {
          characters[characters.length - 1] = rareCharacter;
        }
      }
    }

    return { characters, updatedPityCounters };
  }

  /**
   * Perform a single gacha pull with pity system
   */
  private performSinglePull(
    pityCounters: Record<GymmyRarity, number>,
    bannerId?: string,
  ): { character: GymmyCharacter, newPityCounters: Record<GymmyRarity, number> } {
    // const newPityCounters = ...; // Quick fix: commented unused variable
    
    // Increment pity counters
    Object.keys(newPityCounters).forEach(rarity => {
      newPityCounters[rarity as GymmyRarity]++;
    });

    // Check for pity triggers
    // const rarity = ...; // Quick fix: commented unused variable
    // const character = ...; // Quick fix: commented unused variable

    // Reset appropriate pity counters
    this.resetPityCounters(newPityCounters, rarity);

    return { character, newPityCounters };
  }

  /**
   * Determine rarity considering pity system
   */
  private determineRarityWithPity(
    pityCounters: Record<GymmyRarity, number>,
    bannerId?: string,
  ): GymmyRarity {
    // Pity thresholds
    const PITY_THRESHOLDS = {
      mythical: 500,  // Guaranteed mythical at 500 pulls
      legendary: 90,  // Guaranteed legendary at 90 pulls
      epic: 40,       // Guaranteed epic at 40 pulls
      rare: 10,       // Guaranteed rare at 10 pulls
      common: 1,       // Always get at least common
    };

    // Check pity triggers in order of rarity
    if (pityCounters.mythical >= PITY_THRESHOLDS.mythical) return 'mythical';
    if (pityCounters.legendary >= PITY_THRESHOLDS.legendary) return 'legendary';
    if (pityCounters.epic >= PITY_THRESHOLDS.epic) return 'epic';
    if (pityCounters.rare >= PITY_THRESHOLDS.rare) return 'rare';

    // Normal probability calculation
    // const random = ...; // Quick fix: commented unused variable
    let cumulativeProbability = 0;

    // const rates = ...; // Quick fix: commented unused variable

    for (const [rarity, rate] of Object.entries(rates)) {
      cumulativeProbability += rate;
      if (random <= cumulativeProbability) {
        return rarity as GymmyRarity;
      }
    }

    return 'common'; // Fallback
  }

  /**
   * Select a character by rarity
   */
  private selectCharacterByRarity(rarity: GymmyRarity, bannerId?: string): GymmyCharacter {
    if (bannerId) {
      // const bannerCharacter = ...; // Quick fix: commented unused variable
      if (bannerCharacter) return bannerCharacter;
    }

    // const character = ...; // Quick fix: commented unused variable
    if (!character) {
      // Fallback to common if no character found
      return this.getRandomGymmyByRarity('common') || Object.values(MULTI_GYMMY_DATABASE)[0];
    }

    return character;
  }

  /**
   * Reset pity counters based on pulled rarity
   */
  private resetPityCounters(pityCounters: Record<GymmyRarity, number>, pulledRarity: GymmyRarity): void {
    const rarityHierarchy: GymmyRarity[] = ['mythical', 'legendary', 'epic', 'rare', 'common'];
    // const pulledIndex = ...; // Quick fix: commented unused variable
    
    // Reset all counters for this rarity and higher
    for (let i = 0; i <= pulledIndex; i++) {
      pityCounters[rarityHierarchy[i]] = 0;
    }
  }

  /**
   * Get banner-specific rates (placeholder for future banner system)
   */
  private getBannerRates(bannerId: string): Record<GymmyRarity, number> {
    // TODO: Implement banner-specific rate modifications
    return MULTI_GYMMY_RARITY_RATES;
  }

  /**
   * Get banner-featured character (placeholder for future banner system)
   */
  private getBannerFeaturedCharacter(bannerId: string, rarity: GymmyRarity): GymmyCharacter | null {
    // TODO: Implement banner-specific character selection
    return null;
  }

  // ==============================================================================
  // CHARACTER MANAGEMENT METHODS
  // ==============================================================================

  /**
   * Create a character instance from a template
   */
  public createCharacterInstance(
    template: GymmyCharacter,
    userId: string = 'default_user',
  ): GymmyCharacter {
    // const now = ...; // Quick fix: commented unused variable
    
    return {
      ...template,
      instance_id: this.generateInstanceId(),
      user_id: userId,
      pulled_at: now,
      level: 1,
      experience: 0,
      evolution_stage: 0,
      current_stats: { ...template.base_stats },
      condition: {
        energy: 100,
        happiness: 80,
        hunger: 20,
        bond_level: 1,
        last_interaction: now,
      },
      is_favorite: false,
      total_workouts_together: 0,
      last_interaction: now,
      bond_points: 0,
      active_effects: [],
    };
  }

  /**
   * Level up a character
   */
  public levelUpCharacter(
    character: GymmyCharacter,
    experienceGained: number,
  ): { updatedCharacter: GymmyCharacter, leveledUp: boolean, materialsAwarded: EvolutionMaterials } {
    // const updatedCharacter = ...; // Quick fix: commented unused variable
    updatedCharacter.experience += experienceGained;

    // Calculate new level
    // const newLevel = ...; // Quick fix: commented unused variable
    // const leveledUp = ...; // Quick fix: commented unused variable
    
    if (leveledUp) {
      updatedCharacter.level = newLevel;
      
      // Update stats based on growth rates
      // const levelDifference = ...; // Quick fix: commented unused variable
      this.applyStatGrowth(updatedCharacter, levelDifference);
    }

    // Award materials for leveling up
    const materialsAwarded = leveledUp ? 
      this.calculateLevelUpMaterials(updatedCharacter, newLevel - character.level) : {};

    return { updatedCharacter, leveledUp, materialsAwarded };
  }

  /**
   * Calculate character level from experience
   */
  private calculateLevel(experience: number): number {
    // Exponential growth curve: level = sqrt(experience / 100) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  /**
   * Apply stat growth when leveling up
   */
  private applyStatGrowth(character: GymmyCharacter, levels: number): void {
    // const template = ...; // Quick fix: commented unused variable
    if (!template) return;

    Object.keys(character.current_stats).forEach(statKey => {
      // const key = ...; // Quick fix: commented unused variable
      // const growth = ...; // Quick fix: commented unused variable
      // const maxStat = ...; // Quick fix: commented unused variable
      
      character.current_stats[key] = Math.min(
        character.current_stats[key] + growth,
        maxStat,
      );
    });
  }

  /**
   * Calculate materials awarded for leveling up
   */
  private calculateLevelUpMaterials(character: GymmyCharacter, levelsGained: number): EvolutionMaterials {
    const materials: EvolutionMaterials = {};
    
    // Base materials per level
    materials.basic_crystals = levelsGained;
    materials.training_essence = Math.floor(levelsGained / 2);
    
    // Bonus materials for milestone levels
    if (character.level % 10 === 0) {
      materials.rare_crystals = 1;
    }
    
    if (character.level % 25 === 0) {
      materials.epic_crystals = 1;
    }

    return materials;
  }

  // ==============================================================================
  // EVOLUTION SYSTEM METHODS
  // ==============================================================================

  /**
   * Check if character can evolve
   */
  public canCharacterEvolve(
    character: GymmyCharacter,
    materials: Record<string, number>,
  ): boolean {
    // const nextStage = ...; // Quick fix: commented unused variable
    // const template = ...; // Quick fix: commented unused variable
    
    if (!template || nextStage >= template.evolution_stages.length) {
      return false;
    }

    // const stage = ...; // Quick fix: commented unused variable
    
    // Check level requirement
    if (character.level < stage.level_requirement) {
      return false;
    }

    // Check material requirements
    return canEvolve(template.rarity, nextStage, materials);
  }

  /**
   * Evolve a character
   */
  public evolveCharacter(
    character: GymmyCharacter,
    materials: Record<string, number>,
  ): { success: boolean, updatedCharacter?: GymmyCharacter, materialsUsed?: EvolutionMaterials, error?: string } {
    if (!this.canCharacterEvolve(character, materials)) {
      return { success: false, error: 'Character cannot evolve at this time' };
    }

    // const template = ...; // Quick fix: commented unused variable
    if (!template) {
      return { success: false, error: 'Character template not found' };
    }

    // const nextStage = ...; // Quick fix: commented unused variable
    // const evolutionStage = ...; // Quick fix: commented unused variable
    
    if (!evolutionStage) {
      return { success: false, error: 'Evolution stage not found' };
    }

    // Deduct materials
    // const materialsUsed = ...; // Quick fix: commented unused variable
    
    // Apply evolution
    const updatedCharacter: GymmyCharacter = {
      ...character,
      evolution_stage: nextStage,
      current_stats: {
        strength: Math.min(character.current_stats.strength + evolutionStage.stat_bonuses.strength, template.max_stats.strength),
        cardio: Math.min(character.current_stats.cardio + evolutionStage.stat_bonuses.cardio, template.max_stats.cardio),
        flexibility: Math.min(character.current_stats.flexibility + evolutionStage.stat_bonuses.flexibility, template.max_stats.flexibility),
        focus: Math.min(character.current_stats.focus + evolutionStage.stat_bonuses.focus, template.max_stats.focus),
        motivation: Math.min(character.current_stats.motivation + evolutionStage.stat_bonuses.motivation, template.max_stats.motivation),
        loyalty: Math.min(character.current_stats.loyalty + evolutionStage.stat_bonuses.loyalty, template.max_stats.loyalty),
      },
    };

    // Update visual appearance if specified
    if (evolutionStage.visual_changes.emoji) {
      updatedCharacter.emoji = evolutionStage.visual_changes.emoji;
    }

    return { success: true, updatedCharacter, materialsUsed };
  }

  // ==============================================================================
  // TEAM MANAGEMENT METHODS
  // ==============================================================================

  /**
   * Create a new team
   */
  public createTeam(
    name: string,
    primaryCharacterId: string,
    supportCharacterIds: string[] = [],
  ): GymmyTeam {
    // const now = ...; // Quick fix: commented unused variable
    
    return {
      id: this.generateInstanceId(),
      name,
      primary_gymmy: primaryCharacterId,
      support_gymmys: supportCharacterIds.slice(0, 4), // Max 4 support characters
      formation: {
        primary_position: 'leader',
        support_positions: supportCharacterIds.map(() => 'backup') as ('backup' | 'cheerleader' | 'analyst' | 'wildcard')[],
      },
      synergies: [],
      team_level: 1,
      total_experience: 0,
      created_at: now,
      last_used: now,
    };
  }

  /**
   * Calculate team synergies
   */
  public calculateTeamSynergies(
    team: GymmyTeam,
    characters: GymmyCharacter[],
  ): TeamSynergy[] {
    const teamCharacters = [
      characters.find(c => c.instance_id === team.primary_gymmy),
      ...team.support_gymmys.map(id => characters.find(c => c.instance_id === id)),
    ].filter(Boolean) as GymmyCharacter[];

    const synergies: TeamSynergy[] = [];

    // Rarity synergies
    // const rarityCount = ...; // Quick fix: commented unused variable
    synergies.push(...this.calculateRaritySynergies(rarityCount));

    // Type synergies
    // const typeCount = ...; // Quick fix: commented unused variable
    synergies.push(...this.calculateTypeSynergies(typeCount));

    // Specialization synergies
    // const specializationCount = ...; // Quick fix: commented unused variable
    synergies.push(...this.calculateSpecializationSynergies(specializationCount));

    return synergies;
  }

  private countByRarity(characters: GymmyCharacter[]): Record<GymmyRarity, number> {
    const count: Record<GymmyRarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 };
    characters.forEach(char => count[char.rarity]++);
    return count;
  }

  private countByType(characters: GymmyCharacter[]): Record<GymmyType, number> {
    const count: Record<GymmyType, number> = { 
      power: 0, blaze: 0, transform: 0, zen: 0, pace: 0, steady: 0, rally: 0,
      rookie: 0, specialist: 0, seasonal: 0, legendary: 0, community: 0, 
    };
    characters.forEach(char => count[char.type]++);
    return count;
  }

  private countBySpecialization(characters: GymmyCharacter[]): Record<SpecializationType, number> {
    const count: Record<SpecializationType, number> = {
      strength_training: 0, cardio_endurance: 0, flexibility_mobility: 0,
      mental_wellness: 0, athletic_performance: 0, habit_formation: 0,
      social_motivation: 0, versatile_training: 0,
    };
    characters.forEach(char => count[char.specialization]++);
    return count;
  }

  private calculateRaritySynergies(rarityCount: Record<GymmyRarity, number>): TeamSynergy[] {
    const synergies: TeamSynergy[] = [];

    if (rarityCount.legendary >= 2) {
      synergies.push({
        id: 'legendary_duo',
        name: 'Legendary Duo',
        description: '+50% XP from all activities when 2+ legendary characters are active',
        required_characters: [{ type: 'rarity', value: 'legendary', count: 2 }],
        effects: [{ type: 'xp_boost', value: 50 }],
        activation_conditions: ['team_active'],
      });
    }

    if (rarityCount.mythical >= 1) {
      synergies.push({
        id: 'mythical_presence',
        name: 'Mythical Presence',
        description: 'Reality bends to your will - all activities have enhanced success rates',
        required_characters: [{ type: 'rarity', value: 'mythical', count: 1 }],
        effects: [{ type: 'special_unlock', value: 25 }],
        activation_conditions: ['mythical_active'],
      });
    }

    return synergies;
  }

  private calculateTypeSynergies(typeCount: Record<GymmyType, number>): TeamSynergy[] {
    const synergies: TeamSynergy[] = [];

    if (typeCount.specialist >= 3) {
      synergies.push({
        id: 'specialist_mastery',
        name: 'Specialist Mastery',
        description: '+30% efficiency in specialized activities',
        required_characters: [{ type: 'type', value: 'specialist', count: 3 }],
        effects: [{ type: 'xp_boost', value: 30, conditions: ['specialized_activity'] }],
        activation_conditions: ['team_active'],
      });
    }

    return synergies;
  }

  private calculateSpecializationSynergies(specializationCount: Record<SpecializationType, number>): TeamSynergy[] {
    const synergies: TeamSynergy[] = [];

    // const totalSpecializations = ...; // Quick fix: commented unused variable
    
    if (totalSpecializations >= 4) {
      synergies.push({
        id: 'balanced_mastery',
        name: 'Balanced Mastery',
        description: '+25% XP from all fitness categories due to balanced team composition',
        required_characters: [{ type: 'specialization', value: 'diverse', count: 4 }],
        effects: [{ type: 'xp_boost', value: 25 }],
        activation_conditions: ['team_active'],
      });
    }

    return synergies;
  }

  // ==============================================================================
  // COLLECTION MANAGEMENT METHODS
  // ==============================================================================

  /**
   * Calculate collection statistics
   */
  public calculateCollectionStats(collection: GymmyCharacter[]): CollectionStats {
    // const rarityCount = ...; // Quick fix: commented unused variable
    // const typeCount = ...; // Quick fix: commented unused variable
    
    // const totalPossibleCharacters = ...; // Quick fix: commented unused variable
    // const uniqueCharacters = ...; // Quick fix: commented unused variable
    
    return {
      total_characters: collection.length,
      unique_characters: uniqueCharacters,
      completion_percentage: (uniqueCharacters / totalPossibleCharacters) * 100,
      rarity_counts: rarityCount,
      type_counts: typeCount,
      highest_level_character: Math.max(...collection.map(c => c.level), 0),
      total_bond_points: collection.reduce((sum, c) => sum + c.bond_points, 0),
      collection_value: this.calculateCollectionValue(collection),
    };
  }

  /**
   * Calculate total collection value for prestige
   */
  private calculateCollectionValue(collection: GymmyCharacter[]): number {
    return collection.reduce((total, character) => {
      // const baseValue = ...; // Quick fix: commented unused variable
      // const levelMultiplier = ...; // Quick fix: commented unused variable
      // const evolutionMultiplier = ...; // Quick fix: commented unused variable
      // const bondMultiplier = ...; // Quick fix: commented unused variable
      
      return total + (baseValue * levelMultiplier * evolutionMultiplier * bondMultiplier);
    }, 0);
  }

  private getRarityValue(rarity: GymmyRarity): number {
    const values = {
      common: 100,
      rare: 500,
      epic: 2000,
      legendary: 10000,
      mythical: 50000,
    };
    return values[rarity] || 100;
  }

  // ==============================================================================
  // INTERACTION SYSTEM METHODS
  // ==============================================================================

  /**
   * Get contextual message from character
   */
  public getCharacterMessage(
    character: GymmyCharacter,
    context: keyof GymmyMessage['messages'],
    additionalContext: Record<string, any> = {},
  ): GymmyMessage | null {
    // const template = ...; // Quick fix: commented unused variable
    if (!template) return null;

    // const messages = ...; // Quick fix: commented unused variable
    if (!messages || messages.length === 0) return null;

    // Filter messages based on conditions
    const eligibleMessages = messages.filter(message => 
      this.checkMessageConditions(message, character, additionalContext),
    );

    if (eligibleMessages.length === 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    // Weighted random selection
    // const totalWeight = ...; // Quick fix: commented unused variable
    let random = Math.random() * totalWeight;
    
    for (const message of eligibleMessages) {
      random -= message.weight;
      if (random <= 0) {
        return message;
      }
    }

    return eligibleMessages[0]; // Fallback
  }

  /**
   * Check if message conditions are met
   */
  private checkMessageConditions(
    message: GymmyMessage,
    character: GymmyCharacter,
    context: Record<string, any>,
  ): boolean {
    if (!message.conditions) return true;

    return message.conditions.every(condition => {
      switch (condition.type) {
      case 'time_of_day':
        // const hour = ...; // Quick fix: commented unused variable
        // const timeOfDay = ...; // Quick fix: commented unused variable
        return condition.operator === 'equals' && timeOfDay === condition.value;
        
      case 'user_mood':
        // const mood = ...; // Quick fix: commented unused variable
        return condition.operator === 'equals' && mood === condition.value;
        
      case 'streak':
        // const streak = ...; // Quick fix: commented unused variable
        return this.checkNumericCondition(streak, condition.operator, condition.value as number);
        
      default:
        return true;
      }
    });
  }

  private checkNumericCondition(value: number, operator: string, target: number): boolean {
    switch (operator) {
    case 'equals': return value === target;
    case 'greater_than': return value > target;
    case 'less_than': return value < target;
    default: return true;
    }
  }

  /**
   * Increase bond with character
   */
  public increaseBond(
    character: GymmyCharacter,
    points: number,
    reason: string = 'interaction',
  ): { updatedCharacter: GymmyCharacter, milestoneReached: BondMilestone | null } {
    // const updatedCharacter = ...; // Quick fix: commented unused variable
    updatedCharacter.bond_points += points;
    updatedCharacter.last_interaction = new Date().toISOString();

    // Update condition
    updatedCharacter.condition.bond_level = this.calculateBondLevel(updatedCharacter.bond_points);
    
    // Check for milestones
    // const previousLevel = ...; // Quick fix: commented unused variable
    // const newLevel = ...; // Quick fix: commented unused variable
    
    const milestoneReached = newLevel > previousLevel ? {
      character_id: character.instance_id,
      milestone: newLevel,
      unlocked_at: new Date().toISOString(),
      rewards: this.getBondMilestoneRewards(newLevel),
    } : null;

    return { updatedCharacter, milestoneReached };
  }

  private calculateBondLevel(bondPoints: number): number {
    // Bond levels: 0-99 = level 1, 100-299 = level 2, etc.
    return Math.floor(bondPoints / 100) + 1;
  }

  private getBondMilestoneRewards(level: number) {
    // const rewards = ...; // Quick fix: commented unused variable
    
    if (level % 5 === 0) {
      rewards.push({ type: 'currency', value: 'bond_token', quantity: level / 5 });
    }
    
    if (level % 10 === 0) {
      rewards.push({ type: 'title', value: `Bond Level ${level} Master`, quantity: 1 });
    }

    return rewards;
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  /**
   * Generate unique instance ID
   */
  private generateInstanceId(): string {
    return `gymmy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all available Gymmy templates
   */
  public getAllTemplates(): GymmyTemplate[] {
    return Object.values(MULTI_GYMMY_DATABASE);
  }

  /**
   * Search templates by criteria
   */
  public searchTemplates(criteria: {
    name?: string;
    rarity?: GymmyRarity;
    type?: GymmyType;
    specialization?: SpecializationType;
  }): GymmyTemplate[] {
    return Object.values(MULTI_GYMMY_DATABASE).filter(template => {
      if (criteria.name && !template.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }
      if (criteria.rarity && template.rarity !== criteria.rarity) {
        return false;
      }
      if (criteria.type && template.type !== criteria.type) {
        return false;
      }
      if (criteria.specialization && template.specialization !== criteria.specialization) {
        return false;
      }
      return true;
    });
  }

  /**
   * Calculate pull costs
   */
  public getPullCosts(): { single: number, ten_pull: number } {
    return {
      single: 160,    // 160 gems for single pull
      ten_pull: 1440,  // 1440 gems for 10-pull (10% discount)
    };
  }

  /**
   * Check if user can afford pull
   */
  public canAffordPull(gems: number, pullType: 'single' | 'ten_pull'): boolean {
    // const costs = ...; // Quick fix: commented unused variable
    return gems >= costs[pullType];
  }
}

// ==============================================================================
// EXPORT SINGLETON INSTANCE
// ==============================================================================

export // const multiGymmyManager = ...; // Quick fix: commented unused variable
export default multiGymmyManager;