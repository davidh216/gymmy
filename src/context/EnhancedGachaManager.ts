// src/context/EnhancedGachaManager.ts
// Main integration class that brings all managers together

import {
  // EnhancedGachaState
} from './EnhancedGachaSystem';
import {
  // PullManager
} from './managers/PullManager';
import {
  // EvolutionManager
} from './managers/EvolutionManager';
import {
  // BannerManager
} from './managers/BannerManager';
import {
  // AnalyticsManager
} from './managers/AnalyticsManager';
import {
  // Character
} from './types';
import {
  // EnhancedPullResult,
  // EvolutionResult,
  // BannerActivationResult,
  // PityInsights,
  // 
} from './types/EnhancedGachaTypes';

export class EnhancedGachaManager {
  private pullManager: PullManager;
  private evolutionManager: EvolutionManager;
  private bannerManager: BannerManager;
  private analyticsManager: AnalyticsManager;
  
  constructor(gachaState: EnhancedGachaState) {
    this.pullManager = new PullManager(gachaState);
    this.evolutionManager = new EvolutionManager(gachaState);
    this.bannerManager = new BannerManager();
    this.analyticsManager = new AnalyticsManager();
  }
  
  // =============================================================================
  // PULL OPERATIONS
  // =============================================================================
  
  public performEnhancedPull(pullType: 'single' | 'ten_pull' = 'single'): EnhancedPullResult {
    return this.pullManager.performEnhancedPull(pullType);
  }
  
  // =============================================================================
  // EVOLUTION OPERATIONS  
  // =============================================================================
  
  public evolveCharacter(character: Character): EvolutionResult {
    return this.evolutionManager.evolveCharacter(character);
  }
  
  public getEvolutionRequirements(character: Character): Record<string, number> {
    return this.evolutionManager.getEvolutionRequirements(character);
  }
  
  public canAffordEvolution(character: Character, playerMaterials: Record<string, number>): boolean {
    return this.evolutionManager.canAffordEvolution(character, playerMaterials);
  }
  
  // =============================================================================
  // BANNER OPERATIONS
  // =============================================================================
  
  public activateBanner(bannerId: string): BannerActivationResult {
    return this.bannerManager.activateBanner(bannerId);
  }
  
  public getAvailableBanners() {
    return this.bannerManager.getAvailableBanners();
  }
  
  public getBanner(bannerId: string) {
    return this.bannerManager.getBanner(bannerId);
  }
  
  public isCharacterFeatured(characterId: string, bannerId: string): boolean {
    return this.bannerManager.isCharacterFeatured(characterId, bannerId);
  }
  
  public getBannerTimeRemaining(bannerId: string) {
    return this.bannerManager.getBannerTimeRemaining(bannerId);
  }
  
  // =============================================================================
  // ANALYTICS OPERATIONS
  // =============================================================================
  
  public getPityInsights(gachaState: EnhancedGachaState): PityInsights {
    return this.analyticsManager.getPityInsights(gachaState);
  }
  
  public getDetailedStats(gachaState: EnhancedGachaState) {
    return this.analyticsManager.getDetailedStats(gachaState);
  }
  
  public getExpectedValueAnalysis(gachaState: EnhancedGachaState) {
    return this.analyticsManager.getExpectedValueAnalysis(gachaState);
  }
  
  public getRecommendations(gachaState: EnhancedGachaState): string[] {
    return this.analyticsManager.getRecommendations(gachaState);
  }
  
  // =============================================================================
  // CONVENIENCE METHODS
  // =============================================================================
  
  // Get a complete overview for UI display
  public getGachaOverview(gachaState: EnhancedGachaState) {
    return {
      insights: this.getPityInsights(gachaState),
      stats: this.getDetailedStats(gachaState),
      recommendations: this.getRecommendations(gachaState),
      availableBanners: this.getAvailableBanners(),
      expectedValue: this.getExpectedValueAnalysis(gachaState),
    };
  }
  
  // Check if player can perform a pull
  public canPerformPull(pullType: 'single' | 'ten_pull', playerGems: number): boolean {
    // const cost = ...; // Quick fix: commented unused variable
    return playerGems >= cost;
  }
  
  // Get pull cost
  public getPullCost(pullType: 'single' | 'ten_pull'): number {
    return pullType === 'single' ? 160 : 1600;
  }
}