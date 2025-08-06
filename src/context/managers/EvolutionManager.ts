// src/context/managers/EvolutionManager.ts
// Handles character evolution logic

import { EnhancedGachaEngine, EnhancedGachaState } from '../EnhancedGachaSystem';
import { Character } from '../types';
import { EvolutionResult } from '../types/EnhancedGachaTypes';

export class EvolutionManager {
  private engine: EnhancedGachaEngine;
  
  constructor(gachaState: EnhancedGachaState) {
    this.engine = new EnhancedGachaEngine(gachaState);
  }
  
  // Character evolution
  public evolveCharacter(character: Character): EvolutionResult {
    if (!this.engine.canEvolveCharacter(character)) {
      return { 
        success: false, 
        error: 'Character does not meet evolution requirements', 
      };
    }
    
    const evolvedCharacter = this.engine.evolveCharacter(character);
    
    if (!evolvedCharacter) {
      return { 
        success: false, 
        error: 'Evolution failed', 
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
      return { 
        'strength_essence': 1,
        'basic_crystal': 5, 
      };
    case 'rare':
      return { 
        'strength_essence': 3,
        'refined_crystal': 3,
        'power_core': 1,
      };
    case 'epic':
      return { 
        'strength_essence': 5,
        'refined_crystal': 8,
        'power_core': 3,
        'legendary_fragment': 1,
      };
    case 'legendary':
      return { 
        'strength_essence': 10,
        'refined_crystal': 15,
        'power_core': 8,
        'legendary_fragment': 5,
        'divine_essence': 1,
      };
    default:
      return {};
    }
  }
  
  // Get evolution requirements for display
  public getEvolutionRequirements(character: Character): Record<string, number> {
    return this.getEvolutionMaterialsUsed(character.rarity);
  }
  
  // Check if player has materials for evolution
  public canAffordEvolution(character: Character, playerMaterials: Record<string, number>): boolean {
    const requirements = this.getEvolutionRequirements(character);
    
    return Object.entries(requirements).every(([material, amount]) => 
      (playerMaterials[material] || 0) >= amount,
    );
  }
}