// src/context/systems/AdvancedGachaSystem.ts
// Advanced gacha system with multi-type pulls, pity system, banner rotation, and analytics

import {
  // GymmyTemplate,
  // GymmyCharacter,
  // GymmyRarity,
  // EvolutionMaterials,
  // 
} from '../types/MultiGymmyTypes';

import {
  // multiGymmyManager
} from '../managers/MultiGymmyManager';
import {
  // calculateMaterialRewards
} from '../data/EvolutionMaterials';

// ==============================================================================
// ADVANCED GACHA TYPES
// ==============================================================================

export interface PitySystem {
  counters: Record<GymmyRarity, number>;
  thresholds: Record<GymmyRarity, number>;
  soft_pity_start: Record<GymmyRarity, number>;
  rate_increase_per_pull: Record<GymmyRarity, number>;
}

export interface BannerConfiguration {
  id: string;
  name: string;
  description: string;
  banner_art: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  
  // Featured content
  featured_characters: string[];
  rate_up_multiplier: number;
  guaranteed_featured_at: number; // Guaranteed featured character at X pulls
  
  // Special mechanics
  special_rates?: Record<GymmyRarity, number>;
  bonus_materials?: EvolutionMaterials;
  step_up_rewards?: StepUpReward[];
  
  // Pity modifications
  pity_override?: Partial<PitySystem>;
}

export interface StepUpReward {
  step: number;
  pulls_required: number;
  guaranteed_rarity?: GymmyRarity;
  bonus_materials?: EvolutionMaterials;
  discount?: number; // Percentage discount
}

export interface PullResult {
  characters: GymmyCharacter[];
  materials: EvolutionMaterials;
  gems_spent: number;
  pull_type: 'single' | 'ten_pull' | 'step_up';
  banner_id?: string;
  pity_breaks: GymmyRarity[];
  guaranteed_triggers: string[];
  timestamp: string;
}

export interface PullHistory {
  total_pulls: number;
  total_gems_spent: number;
  characters_obtained: Record<GymmyRarity, number>;
  materials_obtained: EvolutionMaterials;
  banner_pulls: Record<string, number>;
  pity_breaks_history: PityBreakRecord[];
  average_gems_per_legendary: number;
  current_streak: {
    pulls_since_legendary: number;
    pulls_since_epic: number;
    pulls_since_rare: number;
  };
}

export interface PityBreakRecord {
  rarity: GymmyRarity;
  character_id: string;
  pulls_required: number;
  banner_id?: string;
  timestamp: string;
}

export interface GachaAnalytics {
  pull_distribution: Record<GymmyRarity, number>;
  expected_vs_actual_rates: Record<GymmyRarity, { expected: number, actual: number }>;
  banner_performance: Record<string, BannerAnalytics>;
  pity_effectiveness: {
    average_pulls_to_legendary: number;
    pity_breaks_percentage: number;
    soft_pity_effectiveness: number;
  };
  user_patterns: {
    preferred_pull_type: 'single' | 'ten_pull';
    average_session_pulls: number;
    most_active_time: string;
  };
}

export interface BannerAnalytics {
  total_pulls: number;
  featured_character_rate: number;
  user_satisfaction_score: number;
  revenue_generated: number;
  completion_rate: number;
}

// ==============================================================================
// ADVANCED GACHA SYSTEM CLASS
// ==============================================================================

export class AdvancedGachaSystem {
  private static instance: AdvancedGachaSystem;
  
  private pitySystem: PitySystem;
  private activeBanners: Map<string, BannerConfiguration>;
  private pullHistory: PullHistory;
  private analytics: GachaAnalytics;

  constructor() {
    this.initializePitySystem();
    this.activeBanners = new Map();
    this.initializePullHistory();
    this.initializeAnalytics();
  }

  public static getInstance(): AdvancedGachaSystem {
    if (!AdvancedGachaSystem.instance) {
      AdvancedGachaSystem.instance = new AdvancedGachaSystem();
    }
    return AdvancedGachaSystem.instance;
  }

  // ==============================================================================
  // PITY SYSTEM INITIALIZATION
  // ==============================================================================

  private initializePitySystem(): void {
    this.pitySystem = {
      counters: { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 },
      thresholds: { 
        common: 1, 
        rare: 10, 
        epic: 40, 
        legendary: 90, 
        mythical: 500, 
      },
      soft_pity_start: { 
        common: 1, 
        rare: 8, 
        epic: 30, 
        legendary: 75, 
        mythical: 400, 
      },
      rate_increase_per_pull: { 
        common: 0, 
        rare: 0.02, 
        epic: 0.05, 
        legendary: 0.1, 
        mythical: 0.02, 
      },
    };
  }

  private initializePullHistory(): void {
    this.pullHistory = {
      total_pulls: 0,
      total_gems_spent: 0,
      characters_obtained: { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 },
      materials_obtained: {},
      banner_pulls: {},
      pity_breaks_history: [],
      average_gems_per_legendary: 0,
      current_streak: {
        pulls_since_legendary: 0,
        pulls_since_epic: 0,
        pulls_since_rare: 0,
      },
    };
  }

  private initializeAnalytics(): void {
    this.analytics = {
      pull_distribution: { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 },
      expected_vs_actual_rates: {
        common: { expected: 0.60, actual: 0 },
        rare: { expected: 0.25, actual: 0 },
        epic: { expected: 0.12, actual: 0 },
        legendary: { expected: 0.025, actual: 0 },
        mythical: { expected: 0.005, actual: 0 },
      },
      banner_performance: {},
      pity_effectiveness: {
        average_pulls_to_legendary: 0,
        pity_breaks_percentage: 0,
        soft_pity_effectiveness: 0,
      },
      user_patterns: {
        preferred_pull_type: 'single',
        average_session_pulls: 0,
        most_active_time: '00:00',
      },
    };
  }

  // ==============================================================================
  // BANNER MANAGEMENT
  // ==============================================================================

  public createBanner(config: BannerConfiguration): boolean {
    try {
      // Validate banner configuration
      if (!this.validateBannerConfig(config)) {
        return false;
      }

      this.activeBanners.set(config.id, config);
      
      // Initialize banner analytics
      this.analytics.banner_performance[config.id] = {
        total_pulls: 0,
        featured_character_rate: 0,
        user_satisfaction_score: 0,
        revenue_generated: 0,
        completion_rate: 0,
      };

      return true;
    } catch (error) {
      console.error('Error creating banner:', error);
      return false;
    }
  }

  public activateBanner(bannerId: string): boolean {
    // const banner = ...; // Quick fix: commented unused variable
    if (!banner) return false;

    // Deactivate other banners
    this.activeBanners.forEach(b => b.is_active = false);
    
    // Activate this banner
    banner.is_active = true;
    this.activeBanners.set(bannerId, banner);
    
    return true;
  }

  public getActiveBanner(): BannerConfiguration | null {
    for (const banner of this.activeBanners.values()) {
      if (banner.is_active && this.isBannerActive(banner)) {
        return banner;
      }
    }
    return null;
  }

  private validateBannerConfig(config: BannerConfiguration): boolean {
    // Check required fields
    if (!config.id || !config.name || !config.start_date || !config.end_date) {
      return false;
    }

    // Check date validity
    // const startDate = ...; // Quick fix: commented unused variable
    // const endDate = ...; // Quick fix: commented unused variable
    
    if (startDate >= endDate) {
      return false;
    }

    // Check featured characters exist
    if (config.featured_characters) {
      for (const charId of config.featured_characters) {
        if (!multiGymmyManager.getAllTemplates().some(t => t.id === charId)) {
          return false;
        }
      }
    }

    return true;
  }

  private isBannerActive(banner: BannerConfiguration): boolean {
    // const now = ...; // Quick fix: commented unused variable
    // const startDate = ...; // Quick fix: commented unused variable
    // const endDate = ...; // Quick fix: commented unused variable
    
    return now >= startDate && now <= endDate;
  }

  // ==============================================================================
  // ADVANCED PULL MECHANICS
  // ==============================================================================

  public performAdvancedPull(
    pullType: 'single' | 'ten_pull' | 'step_up',
    userGems: number,
    stepUpLevel?: number,
  ): { success: boolean, result?: PullResult, error?: string } {
    try {
      // const cost = ...; // Quick fix: commented unused variable
      
      if (userGems < cost) {
        return { success: false, error: 'Insufficient gems' };
      }

      // const activeBanner = ...; // Quick fix: commented unused variable
      // const pullCount = ...; // Quick fix: commented unused variable
      
      // Perform the pulls
      const characters: GymmyCharacter[] = [];
      const materials: EvolutionMaterials = {};
      const pityBreaks: GymmyRarity[] = [];
      const guaranteedTriggers: string[] = [];

      for (let i = 0; i < pullCount; i++) {
        // const pullResult = ...; // Quick fix: commented unused variable
        
        characters.push(pullResult.character);
        this.mergeMaterials(materials, pullResult.materials);
        
        if (pullResult.isPityBreak) {
          pityBreaks.push(pullResult.character.rarity);
        }
        
        if (pullResult.isGuaranteed) {
          guaranteedTriggers.push(pullResult.guaranteedReason || 'system');
        }
      }

      // Apply step-up bonuses
      if (pullType === 'step_up' && activeBanner?.step_up_rewards && stepUpLevel) {
        this.applyStepUpBonuses(characters, materials, activeBanner, stepUpLevel);
      }

      // 10-pull guarantee
      if (pullType === 'ten_pull') {
        this.apply10PullGuarantee(characters);
      }

      const result: PullResult = {
        characters,
        materials,
        gems_spent: cost,
        pull_type: pullType,
        banner_id: activeBanner?.id,
        pity_breaks: pityBreaks,
        guaranteed_triggers: guaranteedTriggers,
        timestamp: new Date().toISOString(),
      };

      // Update history and analytics
      this.updatePullHistory(result);
      this.updateAnalytics(result);

      return { success: true, result };
    } catch (error) {
      console.error('Error performing advanced pull:', error);
      return { success: false, error: 'Pull failed due to system error' };
    }
  }

  private performSingleAdvancedPull(
    banner?: BannerConfiguration | null,
  ): { 
    character: GymmyCharacter, 
    materials: EvolutionMaterials, 
    isPityBreak: boolean, 
    isGuaranteed: boolean,
    guaranteedReason?: string 
  } {
    // Increment pity counters
    Object.keys(this.pitySystem.counters).forEach(rarity => {
      this.pitySystem.counters[rarity as GymmyRarity]++;
    });

    // Check for guarantees and pity
    const { rarity, isPityBreak, isGuaranteed, guaranteedReason } = this.determineAdvancedRarity(banner);
    
    // Select character
    // const template = ...; // Quick fix: commented unused variable
    // const character = ...; // Quick fix: commented unused variable

    // Reset appropriate pity counters
    if (isPityBreak || isGuaranteed) {
      this.resetPityCountersForRarity(rarity);
    }

    // Calculate materials
    // const materials = ...; // Quick fix: commented unused variable

    return { character, materials, isPityBreak, isGuaranteed, guaranteedReason };
  }

  private determineAdvancedRarity(
    banner?: BannerConfiguration | null,
  ): { rarity: GymmyRarity, isPityBreak: boolean, isGuaranteed: boolean, guaranteedReason?: string } {
    // Check hard pity first
    for (const [rarityKey, threshold] of Object.entries(this.pitySystem.thresholds)) {
      // const rarity = ...; // Quick fix: commented unused variable
      if (this.pitySystem.counters[rarity] >= threshold) {
        return { rarity, isPityBreak: true, isGuaranteed: true, guaranteedReason: 'hard_pity' };
      }
    }

    // Check banner guarantees
    if (banner?.guaranteed_featured_at && banner.featured_characters.length > 0) {
      // const bannerPulls = ...; // Quick fix: commented unused variable
      if (bannerPulls >= banner.guaranteed_featured_at) {
        const featuredChar = multiGymmyManager.getAllTemplates()
          .find(t => banner.featured_characters.includes(t.id));
        if (featuredChar) {
          return { 
            rarity: featuredChar.rarity, 
            isPityBreak: false, 
            isGuaranteed: true, 
            guaranteedReason: 'banner_guarantee', 
          };
        }
      }
    }

    // Calculate rates with soft pity
    // const modifiedRates = ...; // Quick fix: commented unused variable
    
    // Random selection with modified rates
    // const random = ...; // Quick fix: commented unused variable
    let cumulativeProbability = 0;

    const rarityOrder: GymmyRarity[] = ['mythical', 'legendary', 'epic', 'rare', 'common'];
    
    for (const rarity of rarityOrder) {
      cumulativeProbability += modifiedRates[rarity];
      if (random <= cumulativeProbability) {
        // const isSoftPity = ...; // Quick fix: commented unused variable
        return { rarity, isPityBreak: isSoftPity, isGuaranteed: false };
      }
    }

    return { rarity: 'common', isPityBreak: false, isGuaranteed: false };
  }

  private calculateSoftPityRates(banner?: BannerConfiguration | null): Record<GymmyRarity, number> {
    // Start with base rates or banner rates
    const baseRates = banner?.special_rates || {
      common: 0.60,
      rare: 0.25,
      epic: 0.12,
      legendary: 0.025,
      mythical: 0.005,
    };

    // const modifiedRates = ...; // Quick fix: commented unused variable

    // Apply soft pity increases
    Object.keys(modifiedRates).forEach(rarityKey => {
      // const rarity = ...; // Quick fix: commented unused variable
      // const counter = ...; // Quick fix: commented unused variable
      // const softStart = ...; // Quick fix: commented unused variable
      // const rateIncrease = ...; // Quick fix: commented unused variable

      if (counter >= softStart) {
        // const softPityPulls = ...; // Quick fix: commented unused variable
        // const multiplier = ...; // Quick fix: commented unused variable
        modifiedRates[rarity] *= multiplier;
      }
    });

    // Normalize rates to ensure they sum to 1
    // const totalRate = ...; // Quick fix: commented unused variable
    Object.keys(modifiedRates).forEach(rarity => {
      modifiedRates[rarity as GymmyRarity] /= totalRate;
    });

    return modifiedRates;
  }

  private selectCharacterWithBanner(
    rarity: GymmyRarity,
    banner?: BannerConfiguration | null,
  ): GymmyTemplate {
    // If banner is active and has featured characters of this rarity
    if (banner && banner.featured_characters.length > 0) {
      const featuredOfRarity = multiGymmyManager.getAllTemplates()
        .filter(t => banner.featured_characters.includes(t.id) && t.rarity === rarity);
      
      if (featuredOfRarity.length > 0) {
        // Rate up chance
        // const rateUpChance = ...; // Quick fix: commented unused variable
        if (Math.random() < rateUpChance) {
          return featuredOfRarity[Math.floor(Math.random() * featuredOfRarity.length)];
        }
      }
    }

    // Normal character selection
    // const character = ...; // Quick fix: commented unused variable
    if (!character) {
      // Fallback to any character of lower rarity
      return multiGymmyManager.getAllTemplates()[0];
    }
    
    return character;
  }

  private resetPityCountersForRarity(rarity: GymmyRarity): void {
    const rarityHierarchy: GymmyRarity[] = ['mythical', 'legendary', 'epic', 'rare', 'common'];
    // const resetIndex = ...; // Quick fix: commented unused variable
    
    // Reset this rarity and all higher rarities
    for (let i = 0; i <= resetIndex; i++) {
      this.pitySystem.counters[rarityHierarchy[i]] = 0;
    }
  }

  private calculatePullMaterials(
    rarity: GymmyRarity,
    banner?: BannerConfiguration | null,
  ): EvolutionMaterials {
    // const materials = ...; // Quick fix: commented unused variable
    
    // Add banner bonus materials
    if (banner?.bonus_materials) {
      this.mergeMaterials(materials, banner.bonus_materials);
    }

    return materials;
  }

  private applyStepUpBonuses(
    characters: GymmyCharacter[],
    materials: EvolutionMaterials,
    banner: BannerConfiguration,
    stepLevel: number,
  ): void {
    // const stepReward = ...; // Quick fix: commented unused variable
    if (!stepReward) return;

    // Add guaranteed rarity if specified
    if (stepReward.guaranteed_rarity) {
      // const guaranteedTemplate = ...; // Quick fix: commented unused variable
      characters.push(multiGymmyManager.createCharacterInstance(guaranteedTemplate));
    }

    // Add bonus materials
    if (stepReward.bonus_materials) {
      this.mergeMaterials(materials, stepReward.bonus_materials);
    }
  }

  private apply10PullGuarantee(characters: GymmyCharacter[]): void {
    const hasRareOrBetter = characters.some(c => 
      c.rarity !== 'common',
    );

    if (!hasRareOrBetter) {
      // Replace last character with guaranteed rare
      // const rareTemplate = ...; // Quick fix: commented unused variable
      if (rareTemplate) {
        characters[characters.length - 1] = multiGymmyManager.createCharacterInstance(rareTemplate);
      }
    }
  }

  private mergeMaterials(target: EvolutionMaterials, source: EvolutionMaterials): void {
    Object.entries(source).forEach(([materialId, amount]) => {
      target[materialId] = (target[materialId] || 0) + amount;
    });
  }

  // ==============================================================================
  // COST CALCULATION
  // ==============================================================================

  private calculatePullCost(pullType: 'single' | 'ten_pull' | 'step_up', stepUpLevel?: number): number {
    // const baseCosts = ...; // Quick fix: commented unused variable
    
    switch (pullType) {
    case 'single':
      return baseCosts.single;
      
    case 'ten_pull':
      return baseCosts.ten_pull;
      
    case 'step_up':
      if (!stepUpLevel) return baseCosts.single;
        
      // const activeBanner = ...; // Quick fix: commented unused variable
      // const stepReward = ...; // Quick fix: commented unused variable
      // const baseCost = ...; // Quick fix: commented unused variable
      // const discount = ...; // Quick fix: commented unused variable
        
      return Math.floor(baseCost * (1 - discount / 100));
      
    default:
      return baseCosts.single;
    }
  }

  private getPullCount(pullType: 'single' | 'ten_pull' | 'step_up'): number {
    switch (pullType) {
    case 'single':
    case 'step_up':
      return 1;
    case 'ten_pull':
      return 10;
    default:
      return 1;
    }
  }

  // ==============================================================================
  // HISTORY AND ANALYTICS
  // ==============================================================================

  private updatePullHistory(result: PullResult): void {
    this.pullHistory.total_pulls += result.characters.length;
    this.pullHistory.total_gems_spent += result.gems_spent;

    // Update character counts
    result.characters.forEach(character => {
      this.pullHistory.characters_obtained[character.rarity]++;
      
      // Update streak tracking
      if (character.rarity === 'legendary' || character.rarity === 'mythical') {
        this.pullHistory.current_streak.pulls_since_legendary = 0;
        this.pullHistory.current_streak.pulls_since_epic = 0;
        this.pullHistory.current_streak.pulls_since_rare = 0;
      } else if (character.rarity === 'epic') {
        this.pullHistory.current_streak.pulls_since_epic = 0;
        this.pullHistory.current_streak.pulls_since_rare = 0;
      } else if (character.rarity === 'rare') {
        this.pullHistory.current_streak.pulls_since_rare = 0;
      }
    });

    // Update streak counters
    this.pullHistory.current_streak.pulls_since_legendary += result.characters.length;
    this.pullHistory.current_streak.pulls_since_epic += result.characters.length;
    this.pullHistory.current_streak.pulls_since_rare += result.characters.length;

    // Update materials
    this.mergeMaterials(this.pullHistory.materials_obtained, result.materials);

    // Update banner pulls
    if (result.banner_id) {
      this.pullHistory.banner_pulls[result.banner_id] = 
        (this.pullHistory.banner_pulls[result.banner_id] || 0) + result.characters.length;
    }

    // Update pity break records
    result.pity_breaks.forEach(rarity => {
      // const character = ...; // Quick fix: commented unused variable
      if (character) {
        this.pullHistory.pity_breaks_history.push({
          rarity,
          character_id: character.id,
          pulls_required: this.pitySystem.counters[rarity],
          banner_id: result.banner_id,
          timestamp: result.timestamp,
        });
      }
    });

    // Recalculate averages
    const legendaryCount = this.pullHistory.characters_obtained.legendary + 
                          this.pullHistory.characters_obtained.mythical;
    
    if (legendaryCount > 0) {
      this.pullHistory.average_gems_per_legendary = 
        this.pullHistory.total_gems_spent / legendaryCount;
    }
  }

  private updateAnalytics(result: PullResult): void {
    // Update pull distribution
    result.characters.forEach(character => {
      this.analytics.pull_distribution[character.rarity]++;
    });

    // Update actual rates
    // const totalPulls = ...; // Quick fix: commented unused variable
    if (totalPulls > 0) {
      Object.keys(this.analytics.pull_distribution).forEach(rarityKey => {
        // const rarity = ...; // Quick fix: commented unused variable
        this.analytics.expected_vs_actual_rates[rarity].actual = 
          this.analytics.pull_distribution[rarity] / totalPulls;
      });
    }

    // Update banner performance
    if (result.banner_id && this.analytics.banner_performance[result.banner_id]) {
      // const bannerAnalytics = ...; // Quick fix: commented unused variable
      bannerAnalytics.total_pulls += result.characters.length;
      bannerAnalytics.revenue_generated += result.gems_spent;

      // Calculate featured character rate
      // const banner = ...; // Quick fix: commented unused variable
      if (banner) {
        const featuredPulls = result.characters.filter(c => 
          banner.featured_characters.includes(c.id),
        ).length;
        bannerAnalytics.featured_character_rate = featuredPulls / result.characters.length;
      }
    }

    // Update pity effectiveness
    if (result.pity_breaks.length > 0) {
      // const pityBreaks = ...; // Quick fix: commented unused variable
      const totalLegendary = this.pullHistory.characters_obtained.legendary + 
                            this.pullHistory.characters_obtained.mythical;
      
      if (totalLegendary > 0) {
        this.analytics.pity_effectiveness.pity_breaks_percentage = 
          (pityBreaks / totalLegendary) * 100;
        
        this.analytics.pity_effectiveness.average_pulls_to_legendary =
          this.pullHistory.total_pulls / totalLegendary;
      }
    }

    // Update user patterns
    this.updateUserPatterns(result);
  }

  private updateUserPatterns(result: PullResult): void {
    // Track preferred pull type
    const pullTypeCounts = {
      single: 0,
      ten_pull: 0,
      step_up: 0,
    };

    // This is a simplified approach - in a real app, you'd track this over time
    if (result.pull_type === 'ten_pull') {
      pullTypeCounts.ten_pull++;
      this.analytics.user_patterns.preferred_pull_type = 'ten_pull';
    } else if (result.pull_type === 'single') {
      pullTypeCounts.single++;
      if (pullTypeCounts.single > pullTypeCounts.ten_pull) {
        this.analytics.user_patterns.preferred_pull_type = 'single';
      }
    }

    // Update most active time
    // const hour = ...; // Quick fix: commented unused variable
    this.analytics.user_patterns.most_active_time = `${hour.toString().padStart(2, '0')}:00`;

    // Update average session pulls
    this.analytics.user_patterns.average_session_pulls = 
      (this.analytics.user_patterns.average_session_pulls + result.characters.length) / 2;
  }

  // ==============================================================================
  // GETTERS AND UTILITIES
  // ==============================================================================

  public getPityStatus(): PitySystem {
    return { ...this.pitySystem };
  }

  public getPullHistory(): PullHistory {
    return { ...this.pullHistory };
  }

  public getAnalytics(): GachaAnalytics {
    return { ...this.analytics };
  }

  public getActiveBanners(): BannerConfiguration[] {
    return Array.from(this.activeBanners.values()).filter(b => 
      b.is_active && this.isBannerActive(b),
    );
  }

  public canAffordPull(gems: number, pullType: 'single' | 'ten_pull' | 'step_up', stepUpLevel?: number): boolean {
    // const cost = ...; // Quick fix: commented unused variable
    return gems >= cost;
  }

  public resetPitySystem(): void {
    this.initializePitySystem();
  }

  public resetAnalytics(): void {
    this.initializeAnalytics();
    this.initializePullHistory();
  }

  // Import/Export for data persistence
  public exportData(): any {
    return {
      pitySystem: this.pitySystem,
      pullHistory: this.pullHistory,
      analytics: this.analytics,
      activeBanners: Array.from(this.activeBanners.entries()),
    };
  }

  public importData(data: any): void {
    if (data.pitySystem) this.pitySystem = data.pitySystem;
    if (data.pullHistory) this.pullHistory = data.pullHistory;
    if (data.analytics) this.analytics = data.analytics;
    if (data.activeBanners) {
      this.activeBanners = new Map(data.activeBanners);
    }
  }
}

// ==============================================================================
// EXPORT SINGLETON INSTANCE
// ==============================================================================

export // const advancedGachaSystem = ...; // Quick fix: commented unused variable
export default advancedGachaSystem;