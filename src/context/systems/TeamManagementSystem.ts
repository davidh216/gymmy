// src/context/systems/TeamManagementSystem.ts
// Advanced team management system with squad composition, synergies, and strategic gameplay

import {
  GymmyCharacter,
  GymmyTeam,
  TeamSynergy,
  GymmyRarity,
  GymmyType,
  SpecializationType,
  GymmyStats,
  EvolutionMaterials
} from '../types/MultiGymmyTypes';

import { multiGymmyManager } from '../managers/MultiGymmyManager';

// ==============================================================================
// TEAM MANAGEMENT TYPES
// ==============================================================================

export interface TeamConfiguration {
  formation: TeamFormation;
  role_assignments: RoleAssignment[];
  synergy_focus: SynergyFocus;
  strategy_type: StrategyType;
}

export interface TeamFormation {
  name: string;
  layout: FormationLayout;
  position_bonuses: Record<string, PositionBonus>;
  description: string;
}

export interface FormationLayout {
  primary: Position;
  support: Position[];
  reserve?: Position[];
}

export interface Position {
  id: string;
  name: string;
  role: 'leader' | 'motivator' | 'specialist' | 'support' | 'wildcard';
  stat_multipliers: Partial<GymmyStats>;
  special_abilities: string[];
}

export interface PositionBonus {
  stat_boost: Partial<GymmyStats>;
  ability_unlock?: string;
  synergy_requirement?: string;
}

export interface RoleAssignment {
  character_id: string;
  position_id: string;
  role_compatibility: number; // 0-100
  assignment_date: string;
}

export interface SynergyFocus {
  primary_focus: 'power' | 'balance' | 'synergy' | 'flexibility';
  target_synergies: string[];
  avoided_conflicts: string[];
}

export interface StrategyType {
  name: string;
  description: string;
  ideal_compositions: CompositionRequirement[];
  bonuses: StrategyBonus[];
}

export interface CompositionRequirement {
  type: 'rarity' | 'specialization' | 'character_type' | 'level';
  condition: string;
  minimum: number;
  weight: number;
}

export interface StrategyBonus {
  condition: string;
  effect: TeamEffect;
  description: string;
}

export interface TeamEffect {
  type: 'stat_boost' | 'xp_bonus' | 'material_bonus' | 'special_ability';
  value: number;
  duration?: number;
  conditions?: string[];
}

export interface TeamPerformanceMetrics {
  overall_rating: number;
  synergy_score: number;
  balance_score: number;
  potential_score: number;
  
  // Detailed breakdowns
  stat_distribution: TeamStatDistribution;
  role_coverage: RoleCoverage;
  synergy_analysis: SynergyAnalysis;
  optimization_suggestions: OptimizationSuggestion[];
}

export interface TeamStatDistribution {
  total_stats: GymmyStats;
  average_stats: GymmyStats;
  stat_balance: Record<keyof GymmyStats, 'excellent' | 'good' | 'balanced' | 'weak' | 'critical'>;
  strongest_areas: (keyof GymmyStats)[];
  weakest_areas: (keyof GymmyStats)[];
}

export interface RoleCoverage {
  covered_roles: string[];
  missing_roles: string[];
  role_redundancy: Record<string, number>;
  coverage_score: number;
}

export interface SynergyAnalysis {
  active_synergies: ActiveSynergy[];
  potential_synergies: PotentialSynergy[];
  synergy_conflicts: SynergyConflict[];
  synergy_effectiveness: number;
}

export interface ActiveSynergy {
  synergy: TeamSynergy;
  contributing_characters: string[];
  effectiveness: number;
  bonus_value: number;
}

export interface PotentialSynergy {
  synergy: TeamSynergy;
  missing_requirements: string[];
  characters_needed: number;
  potential_benefit: number;
}

export interface SynergyConflict {
  conflicting_synergies: string[];
  characters_involved: string[];
  resolution_options: string[];
}

export interface OptimizationSuggestion {
  type: 'formation' | 'character_swap' | 'role_change' | 'synergy_focus';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expected_improvement: number;
  implementation_cost: 'free' | 'low' | 'medium' | 'high';
  specific_actions: string[];
}

// ==============================================================================
// PREDEFINED FORMATIONS
// ==============================================================================

export const TEAM_FORMATIONS: Record<string, TeamFormation> = {
  balanced_core: {
    name: 'Balanced Core',
    layout: {
      primary: {
        id: 'leader',
        name: 'Team Leader',
        role: 'leader',
        stat_multipliers: { strength: 1.2, cardio: 1.2, flexibility: 1.2, focus: 1.3, motivation: 1.4, loyalty: 1.3 },
        special_abilities: ['leadership_aura', 'team_coordination']
      },
      support: [
        {
          id: 'motivator',
          name: 'Team Motivator',
          role: 'motivator',
          stat_multipliers: { motivation: 1.5, loyalty: 1.3, focus: 1.2 },
          special_abilities: ['motivation_boost', 'morale_support']
        },
        {
          id: 'specialist',
          name: 'Specialist',
          role: 'specialist',
          stat_multipliers: { strength: 1.3, cardio: 1.3, flexibility: 1.3 },
          special_abilities: ['expertise_share', 'technique_guidance']
        },
        {
          id: 'support_main',
          name: 'Main Support',
          role: 'support',
          stat_multipliers: { loyalty: 1.4, focus: 1.2, motivation: 1.2 },
          special_abilities: ['team_support', 'backup_assistance']
        }
      ]
    },
    position_bonuses: {
      leader: {
        stat_boost: { motivation: 10, focus: 10 },
        ability_unlock: 'team_rally',
        synergy_requirement: 'leadership_synergy'
      },
      motivator: {
        stat_boost: { motivation: 15, loyalty: 10 },
        ability_unlock: 'inspirational_speech'
      },
      specialist: {
        stat_boost: { strength: 10, cardio: 10, flexibility: 10 },
        ability_unlock: 'expert_guidance'
      },
      support_main: {
        stat_boost: { loyalty: 12, focus: 8 },
        ability_unlock: 'reliable_backup'
      }
    },
    description: 'A well-rounded formation that provides balanced coverage across all aspects of fitness training.'
  },

  power_house: {
    name: 'Power House',
    layout: {
      primary: {
        id: 'powerhouse_leader',
        name: 'Powerhouse Leader',
        role: 'leader',
        stat_multipliers: { strength: 1.5, focus: 1.3, motivation: 1.2 },
        special_abilities: ['strength_dominance', 'power_coordination']
      },
      support: [
        {
          id: 'strength_specialist_1',
          name: 'Strength Specialist Alpha',
          role: 'specialist',
          stat_multipliers: { strength: 1.4, focus: 1.2 },
          special_abilities: ['compound_mastery', 'heavy_lift_support']
        },
        {
          id: 'strength_specialist_2',
          name: 'Strength Specialist Beta',
          role: 'specialist',
          stat_multipliers: { strength: 1.4, motivation: 1.2 },
          special_abilities: ['power_training', 'pr_pursuit']
        },
        {
          id: 'power_support',
          name: 'Power Support',
          role: 'support',
          stat_multipliers: { strength: 1.3, loyalty: 1.3 },
          special_abilities: ['spotting_assistance', 'safety_focus']
        }
      ]
    },
    position_bonuses: {
      powerhouse_leader: {
        stat_boost: { strength: 20, focus: 15 },
        ability_unlock: 'powerhouse_command',
        synergy_requirement: 'strength_mastery'
      },
      strength_specialist_1: {
        stat_boost: { strength: 15, focus: 10 },
        ability_unlock: 'alpha_strength'
      },
      strength_specialist_2: {
        stat_boost: { strength: 15, motivation: 10 },
        ability_unlock: 'beta_power'
      },
      power_support: {
        stat_boost: { strength: 12, loyalty: 12 },
        ability_unlock: 'power_backup'
      }
    },
    description: 'Maximize strength training potential with specialized roles focused on power and heavy lifting.'
  },

  cardio_squad: {
    name: 'Cardio Squadron',
    layout: {
      primary: {
        id: 'pace_leader',
        name: 'Pace Leader',
        role: 'leader',
        stat_multipliers: { cardio: 1.5, motivation: 1.3, focus: 1.2 },
        special_abilities: ['pace_setting', 'endurance_leadership']
      },
      support: [
        {
          id: 'endurance_specialist',
          name: 'Endurance Specialist',
          role: 'specialist',
          stat_multipliers: { cardio: 1.4, focus: 1.2 },
          special_abilities: ['endurance_mastery', 'stamina_support']
        },
        {
          id: 'cardio_motivator',
          name: 'Cardio Motivator',
          role: 'motivator',
          stat_multipliers: { cardio: 1.3, motivation: 1.4 },
          special_abilities: ['cardio_enthusiasm', 'energy_boost']
        },
        {
          id: 'recovery_support',
          name: 'Recovery Support',
          role: 'support',
          stat_multipliers: { cardio: 1.2, loyalty: 1.3, flexibility: 1.2 },
          special_abilities: ['recovery_assistance', 'cool_down_guidance']
        }
      ]
    },
    position_bonuses: {
      pace_leader: {
        stat_boost: { cardio: 20, motivation: 15 },
        ability_unlock: 'pace_mastery',
        synergy_requirement: 'cardio_leadership'
      },
      endurance_specialist: {
        stat_boost: { cardio: 18, focus: 12 },
        ability_unlock: 'endurance_expert'
      },
      cardio_motivator: {
        stat_boost: { cardio: 15, motivation: 15 },
        ability_unlock: 'cardio_inspiration'
      },
      recovery_support: {
        stat_boost: { cardio: 10, loyalty: 12, flexibility: 10 },
        ability_unlock: 'recovery_mastery'
      }
    },
    description: 'Optimized for cardiovascular training with focus on endurance, pacing, and recovery.'
  },

  zen_circle: {
    name: 'Zen Circle',
    layout: {
      primary: {
        id: 'zen_master',
        name: 'Zen Master',
        role: 'leader',
        stat_multipliers: { flexibility: 1.5, focus: 1.5, motivation: 1.3 },
        special_abilities: ['inner_peace', 'mindful_guidance']
      },
      support: [
        {
          id: 'flexibility_guide',
          name: 'Flexibility Guide',
          role: 'specialist',
          stat_multipliers: { flexibility: 1.4, focus: 1.3 },
          special_abilities: ['flexibility_mastery', 'mobility_support']
        },
        {
          id: 'mindfulness_coach',
          name: 'Mindfulness Coach',
          role: 'motivator',
          stat_multipliers: { focus: 1.4, motivation: 1.3, loyalty: 1.2 },
          special_abilities: ['mindfulness_training', 'mental_clarity']
        },
        {
          id: 'balance_keeper',
          name: 'Balance Keeper',
          role: 'support',
          stat_multipliers: { flexibility: 1.3, focus: 1.3, loyalty: 1.3 },
          special_abilities: ['balance_maintenance', 'harmony_preservation']
        }
      ]
    },
    position_bonuses: {
      zen_master: {
        stat_boost: { flexibility: 20, focus: 20, motivation: 15 },
        ability_unlock: 'zen_mastery',
        synergy_requirement: 'mindful_harmony'
      },
      flexibility_guide: {
        stat_boost: { flexibility: 18, focus: 15 },
        ability_unlock: 'flexibility_wisdom'
      },
      mindfulness_coach: {
        stat_boost: { focus: 18, motivation: 15, loyalty: 10 },
        ability_unlock: 'mindful_coaching'
      },
      balance_keeper: {
        stat_boost: { flexibility: 15, focus: 15, loyalty: 15 },
        ability_unlock: 'perfect_balance'
      }
    },
    description: 'Centered on mindfulness, flexibility, and mental wellness for holistic fitness development.'
  },

  adaptive_hybrid: {
    name: 'Adaptive Hybrid',
    layout: {
      primary: {
        id: 'hybrid_commander',
        name: 'Hybrid Commander',
        role: 'leader',
        stat_multipliers: { strength: 1.25, cardio: 1.25, flexibility: 1.25, focus: 1.3, motivation: 1.3, loyalty: 1.2 },
        special_abilities: ['adaptive_leadership', 'versatile_command']
      },
      support: [
        {
          id: 'power_adapter',
          name: 'Power Adapter',
          role: 'specialist',
          stat_multipliers: { strength: 1.3, cardio: 1.2, focus: 1.2 },
          special_abilities: ['power_adaptation', 'strength_flexibility']
        },
        {
          id: 'cardio_adapter',
          name: 'Cardio Adapter',
          role: 'specialist',
          stat_multipliers: { cardio: 1.3, flexibility: 1.2, motivation: 1.2 },
          special_abilities: ['cardio_adaptation', 'endurance_flexibility']
        },
        {
          id: 'flex_supporter',
          name: 'Flexibility Supporter',
          role: 'support',
          stat_multipliers: { flexibility: 1.3, focus: 1.2, loyalty: 1.3 },
          special_abilities: ['adaptive_support', 'versatile_assistance']
        }
      ]
    },
    position_bonuses: {
      hybrid_commander: {
        stat_boost: { strength: 12, cardio: 12, flexibility: 12, focus: 15, motivation: 15, loyalty: 10 },
        ability_unlock: 'hybrid_mastery',
        synergy_requirement: 'adaptive_synergy'
      },
      power_adapter: {
        stat_boost: { strength: 15, cardio: 10, focus: 10 },
        ability_unlock: 'power_adaptation'
      },
      cardio_adapter: {
        stat_boost: { cardio: 15, flexibility: 10, motivation: 10 },
        ability_unlock: 'cardio_adaptation'
      },
      flex_supporter: {
        stat_boost: { flexibility: 15, focus: 10, loyalty: 12 },
        ability_unlock: 'flexible_support'
      }
    },
    description: 'Versatile formation that adapts to any training style with balanced stat distribution.'
  }
};

// ==============================================================================
// STRATEGY TYPES
// ==============================================================================

export const STRATEGY_TYPES: Record<string, StrategyType> = {
  synergy_maximizer: {
    name: 'Synergy Maximizer',
    description: 'Focus on achieving maximum synergy bonuses through strategic character combinations.',
    ideal_compositions: [
      { type: 'rarity', condition: 'same_rarity_count >= 3', minimum: 3, weight: 30 },
      { type: 'specialization', condition: 'diverse_specializations', minimum: 3, weight: 25 },
      { type: 'character_type', condition: 'complementary_types', minimum: 2, weight: 20 }
    ],
    bonuses: [
      {
        condition: 'active_synergies >= 3',
        effect: { type: 'xp_bonus', value: 25 },
        description: '+25% XP when 3+ synergies are active'
      },
      {
        condition: 'synergy_effectiveness >= 80',
        effect: { type: 'stat_boost', value: 15 },
        description: '+15% to all stats when synergy effectiveness is high'
      }
    ]
  },

  power_focused: {
    name: 'Power Focused',
    description: 'Maximize raw power output for strength training and heavy lifting sessions.',
    ideal_compositions: [
      { type: 'specialization', condition: 'strength_training >= 3', minimum: 3, weight: 40 },
      { type: 'rarity', condition: 'rare_plus >= 2', minimum: 2, weight: 25 },
      { type: 'character_type', condition: 'power_types', minimum: 2, weight: 15 }
    ],
    bonuses: [
      {
        condition: 'team_strength >= 400',
        effect: { type: 'stat_boost', value: 20 },
        description: '+20% strength bonus when team strength exceeds 400'
      },
      {
        condition: 'strength_specialists >= 3',
        effect: { type: 'xp_bonus', value: 30, conditions: ['strength_exercises'] },
        description: '+30% XP for strength exercises with 3+ strength specialists'
      }
    ]
  },

  balanced_growth: {
    name: 'Balanced Growth',
    description: 'Achieve steady progress across all fitness areas with balanced development.',
    ideal_compositions: [
      { type: 'specialization', condition: 'all_specializations_covered', minimum: 4, weight: 35 },
      { type: 'character_type', condition: 'diverse_types', minimum: 3, weight: 25 },
      { type: 'level', condition: 'average_level >= 15', minimum: 15, weight: 20 }
    ],
    bonuses: [
      {
        condition: 'stat_balance_score >= 80',
        effect: { type: 'xp_bonus', value: 20 },
        description: '+20% XP when team has excellent stat balance'
      },
      {
        condition: 'all_stats >= 50_average',
        effect: { type: 'material_bonus', value: 15 },
        description: '+15% evolution materials when all stats are well developed'
      }
    ]
  },

  efficiency_optimizer: {
    name: 'Efficiency Optimizer',
    description: 'Maximize training efficiency and resource generation for optimal progression.',
    ideal_compositions: [
      { type: 'character_type', condition: 'specialist_types >= 3', minimum: 3, weight: 30 },
      { type: 'rarity', condition: 'high_rarity_mix', minimum: 2, weight: 25 },
      { type: 'specialization', condition: 'complementary_specs', minimum: 3, weight: 25 }
    ],
    bonuses: [
      {
        condition: 'team_efficiency >= 85',
        effect: { type: 'material_bonus', value: 25 },
        description: '+25% evolution materials from efficient team composition'
      },
      {
        condition: 'synergy_count >= 2',
        effect: { type: 'xp_bonus', value: 15 },
        description: '+15% XP when multiple synergies create efficiency'
      }
    ]
  }
};

// ==============================================================================
// TEAM MANAGEMENT SYSTEM CLASS
// ==============================================================================

export class TeamManagementSystem {
  private static instance: TeamManagementSystem;
  
  private activeTeams: Map<string, GymmyTeam> = new Map();
  private teamConfigurations: Map<string, TeamConfiguration> = new Map();
  private teamPerformanceHistory: Map<string, any[]> = new Map();

  constructor() {
    this.initializeDefaultConfigurations();
  }

  public static getInstance(): TeamManagementSystem {
    if (!TeamManagementSystem.instance) {
      TeamManagementSystem.instance = new TeamManagementSystem();
    }
    return TeamManagementSystem.instance;
  }

  // ==============================================================================
  // TEAM CREATION AND MANAGEMENT
  // ==============================================================================

  public createTeam(
    name: string,
    characters: GymmyCharacter[],
    formationId: string = 'balanced_core',
    strategyId: string = 'balanced_growth'
  ): GymmyTeam {
    if (characters.length === 0 || characters.length > 5) {
      throw new Error('Team must have 1-5 characters');
    }

    const formation = TEAM_FORMATIONS[formationId];
    if (!formation) {
      throw new Error('Invalid formation ID');
    }

    const strategy = STRATEGY_TYPES[strategyId];
    if (!strategy) {
      throw new Error('Invalid strategy ID');
    }

    // Create basic team structure
    const team = multiGymmyManager.createTeam(
      name,
      characters[0].instance_id,
      characters.slice(1).map(c => c.instance_id)
    );

    // Create team configuration
    const configuration: TeamConfiguration = {
      formation,
      role_assignments: this.generateRoleAssignments(characters, formation),
      synergy_focus: this.determineSynergyFocus(characters),
      strategy_type: strategy
    };

    // Store team and configuration
    this.activeTeams.set(team.id, team);
    this.teamConfigurations.set(team.id, configuration);

    // Calculate initial synergies
    team.synergies = this.calculateTeamSynergies(team, characters);

    return team;
  }

  public updateTeamFormation(teamId: string, formationId: string): boolean {
    const team = this.activeTeams.get(teamId);
    const config = this.teamConfigurations.get(teamId);
    
    if (!team || !config) return false;

    const formation = TEAM_FORMATIONS[formationId];
    if (!formation) return false;

    // Update configuration
    config.formation = formation;
    config.role_assignments = this.regenerateRoleAssignments(team, formation);

    this.teamConfigurations.set(teamId, config);
    return true;
  }

  public updateTeamStrategy(teamId: string, strategyId: string): boolean {
    const config = this.teamConfigurations.get(teamId);
    if (!config) return false;

    const strategy = STRATEGY_TYPES[strategyId];
    if (!strategy) return false;

    config.strategy_type = strategy;
    this.teamConfigurations.set(teamId, config);
    return true;
  }

  // ==============================================================================
  // ROLE ASSIGNMENT SYSTEM
  // ==============================================================================

  private generateRoleAssignments(
    characters: GymmyCharacter[],
    formation: TeamFormation
  ): RoleAssignment[] {
    const assignments: RoleAssignment[] = [];
    const positions = [formation.layout.primary, ...formation.layout.support];
    
    // Sort characters by their suitability for different roles
    const characterScores = characters.map(char => ({
      character: char,
      scores: this.calculateRoleScores(char, positions)
    }));

    // Assign characters to positions using Hungarian algorithm approximation
    const assignedPositions = new Set<string>();
    const assignedCharacters = new Set<string>();

    // First pass: Assign characters to their best-fit positions
    characterScores.sort((a, b) => Math.max(...Object.values(b.scores)) - Math.max(...Object.values(a.scores)));

    for (const { character, scores } of characterScores) {
      if (assignedCharacters.has(character.instance_id)) continue;

      // Find the best available position for this character
      const availablePositions = positions.filter(pos => !assignedPositions.has(pos.id));
      if (availablePositions.length === 0) break;

      const bestPosition = availablePositions.reduce((best, pos) => 
        scores[pos.id] > scores[best.id] ? pos : best
      );

      assignments.push({
        character_id: character.instance_id,
        position_id: bestPosition.id,
        role_compatibility: scores[bestPosition.id],
        assignment_date: new Date().toISOString()
      });

      assignedPositions.add(bestPosition.id);
      assignedCharacters.add(character.instance_id);
    }

    return assignments;
  }

  private calculateRoleScores(character: GymmyCharacter, positions: Position[]): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const position of positions) {
      let score = 50; // Base compatibility score

      // Role-based scoring
      switch (position.role) {
        case 'leader':
          score += this.calculateLeadershipScore(character);
          break;
        case 'motivator':
          score += this.calculateMotivationScore(character);
          break;
        case 'specialist':
          score += this.calculateSpecialistScore(character);
          break;
        case 'support':
          score += this.calculateSupportScore(character);
          break;
        case 'wildcard':
          score += this.calculateWildcardScore(character);
          break;
      }

      // Stat compatibility
      score += this.calculateStatCompatibility(character, position);

      // Rarity bonus
      score += this.getRarityBonus(character.rarity);

      scores[position.id] = Math.max(0, Math.min(100, score));
    }

    return scores;
  }

  private calculateLeadershipScore(character: GymmyCharacter): number {
    let score = 0;
    
    // High loyalty and motivation are key for leaders
    score += (character.current_stats.loyalty / 100) * 30;
    score += (character.current_stats.motivation / 100) * 25;
    score += (character.current_stats.focus / 100) * 20;
    
    // Level and experience matter for leadership
    score += Math.min(character.level / 50, 1) * 15;
    score += Math.min(character.bond_points / 1000, 1) * 10;

    return score;
  }

  private calculateMotivationScore(character: GymmyCharacter): number {
    let score = 0;
    
    // Motivation stat is primary
    score += (character.current_stats.motivation / 100) * 40;
    score += (character.current_stats.loyalty / 100) * 20;
    
    // Personality matters for motivation roles
    if (character.personality.type === 'encouraging' || character.personality.type === 'cheerleader') {
      score += 20;
    }
    
    return score;
  }

  private calculateSpecialistScore(character: GymmyCharacter): number {
    let score = 0;
    
    // Specialization alignment
    const highestStat = Math.max(
      character.current_stats.strength,
      character.current_stats.cardio,
      character.current_stats.flexibility
    );
    score += (highestStat / 100) * 30;
    
    // Focus is important for specialists
    score += (character.current_stats.focus / 100) * 25;
    
    // Level indicates specialization development
    score += Math.min(character.level / 30, 1) * 20;
    
    return score;
  }

  private calculateSupportScore(character: GymmyCharacter): number {
    let score = 0;
    
    // Loyalty is key for support roles
    score += (character.current_stats.loyalty / 100) * 35;
    score += (character.current_stats.motivation / 100) * 20;
    
    // Balanced stats work well for support
    const statVariance = this.calculateStatVariance(character);
    score += (1 - statVariance) * 20; // Lower variance = better balance
    
    return score;
  }

  private calculateWildcardScore(character: GymmyCharacter): number {
    let score = 0;
    
    // Wildcards benefit from balanced or unique characteristics
    const statVariance = this.calculateStatVariance(character);
    score += (1 - statVariance) * 25; // Balanced characters work as wildcards
    
    // Versatile types are natural wildcards
    if (character.type === 'rookie' || character.specialization === 'versatile_training') {
      score += 25;
    }
    
    // Evolution stage can indicate adaptability
    score += character.evolution_stage * 10;
    
    return score;
  }

  private calculateStatCompatibility(character: GymmyCharacter, position: Position): number {
    let score = 0;
    
    Object.entries(position.stat_multipliers).forEach(([stat, multiplier]) => {
      if (multiplier > 1) {
        // Position benefits from this stat
        const statValue = character.current_stats[stat as keyof GymmyStats];
        score += (statValue / 100) * (multiplier - 1) * 20;
      }
    });
    
    return score;
  }

  private calculateStatVariance(character: GymmyCharacter): number {
    const stats = Object.values(character.current_stats);
    const mean = stats.reduce((sum, stat) => sum + stat, 0) / stats.length;
    const variance = stats.reduce((sum, stat) => sum + Math.pow(stat - mean, 2), 0) / stats.length;
    return Math.sqrt(variance) / 100; // Normalize to 0-1 range
  }

  private getRarityBonus(rarity: GymmyRarity): number {
    const bonuses = { common: 0, rare: 5, epic: 10, legendary: 20, mythical: 30 };
    return bonuses[rarity];
  }

  private regenerateRoleAssignments(team: GymmyTeam, formation: TeamFormation): RoleAssignment[] {
    // This would need to fetch the actual characters for the team
    // For now, return empty array as placeholder
    return [];
  }

  // ==============================================================================
  // SYNERGY CALCULATION
  // ==============================================================================

  public calculateTeamSynergies(team: GymmyTeam, characters: GymmyCharacter[]): TeamSynergy[] {
    return multiGymmyManager.calculateTeamSynergies(team, characters);
  }

  private determineSynergyFocus(characters: GymmyCharacter[]): SynergyFocus {
    // Analyze character composition to determine optimal synergy focus
    const rarityCount = this.countByRarity(characters);
    const specializationCount = this.countBySpecialization(characters);
    const typeCount = this.countByType(characters);

    // Determine primary focus based on team composition
    let primaryFocus: 'power' | 'balance' | 'synergy' | 'flexibility' = 'balance';
    
    if (rarityCount.legendary >= 2 || rarityCount.mythical >= 1) {
      primaryFocus = 'power';
    } else if (Object.keys(specializationCount).length >= 4) {
      primaryFocus = 'balance';
    } else if (this.hasComplementaryTypes(typeCount)) {
      primaryFocus = 'synergy';
    } else {
      primaryFocus = 'flexibility';
    }

    return {
      primary_focus: primaryFocus,
      target_synergies: this.identifyTargetSynergies(characters, primaryFocus),
      avoided_conflicts: this.identifyAvoidedConflicts(characters)
    };
  }

  private countByRarity(characters: GymmyCharacter[]): Record<GymmyRarity, number> {
    const count: Record<GymmyRarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 };
    characters.forEach(char => count[char.rarity]++);
    return count;
  }

  private countBySpecialization(characters: GymmyCharacter[]): Record<SpecializationType, number> {
    const count: Record<SpecializationType, number> = {
      strength_training: 0, cardio_endurance: 0, flexibility_mobility: 0,
      mental_wellness: 0, athletic_performance: 0, habit_formation: 0,
      social_motivation: 0, versatile_training: 0
    };
    characters.forEach(char => count[char.specialization]++);
    return count;
  }

  private countByType(characters: GymmyCharacter[]): Record<GymmyType, number> {
    const count: Record<GymmyType, number> = {
      power: 0, blaze: 0, transform: 0, zen: 0, pace: 0, steady: 0, rally: 0,
      rookie: 0, specialist: 0, seasonal: 0, legendary: 0, community: 0
    };
    characters.forEach(char => count[char.type]++);
    return count;
  }

  private hasComplementaryTypes(typeCount: Record<GymmyType, number>): boolean {
    // Check for complementary type combinations
    const activeTypes = Object.keys(typeCount).filter(type => typeCount[type as GymmyType] > 0);
    
    // Specific complementary combinations
    const complementaryPairs = [
      ['power', 'zen'], ['blaze', 'steady'], ['transform', 'rally'],
      ['specialist', 'community'], ['legendary', 'rookie']
    ];
    
    return complementaryPairs.some(pair => 
      activeTypes.includes(pair[0]) && activeTypes.includes(pair[1])
    );
  }

  private identifyTargetSynergies(characters: GymmyCharacter[], focus: string): string[] {
    const synergies: string[] = [];
    
    switch (focus) {
      case 'power':
        synergies.push('legendary_dominance', 'power_overwhelming', 'elite_mastery');
        break;
      case 'balance':
        synergies.push('balanced_harmony', 'versatile_mastery', 'adaptive_excellence');
        break;
      case 'synergy':
        synergies.push('perfect_synergy', 'complementary_boost', 'team_resonance');
        break;
      case 'flexibility':
        synergies.push('adaptive_formation', 'flexible_strategy', 'dynamic_composition');
        break;
    }
    
    return synergies;
  }

  private identifyAvoidedConflicts(characters: GymmyCharacter[]): string[] {
    const conflicts: string[] = [];
    
    // Identify potential conflicts based on character personalities and types
    const personalities = characters.map(c => c.personality.type);
    
    if (personalities.includes('competitive') && personalities.includes('zen')) {
      conflicts.push('personality_clash_competitive_zen');
    }
    
    if (personalities.includes('drill_sergeant') && personalities.includes('buddy')) {
      conflicts.push('training_style_conflict');
    }
    
    return conflicts;
  }

  // ==============================================================================
  // TEAM PERFORMANCE ANALYSIS
  // ==============================================================================

  public analyzeTeamPerformance(
    team: GymmyTeam, 
    characters: GymmyCharacter[]
  ): TeamPerformanceMetrics {
    const statDistribution = this.calculateStatDistribution(characters);
    const roleCoverage = this.analyzeRoleCoverage(team, characters);
    const synergyAnalysis = this.analyzeSynergies(team, characters);
    
    // Calculate overall scores
    const balanceScore = this.calculateBalanceScore(statDistribution);
    const synergyScore = synergyAnalysis.synergy_effectiveness;
    const potentialScore = this.calculatePotentialScore(characters);
    
    const overallRating = (balanceScore + synergyScore + potentialScore + roleCoverage.coverage_score) / 4;
    
    return {
      overall_rating: Math.round(overallRating),
      synergy_score: Math.round(synergyScore),
      balance_score: Math.round(balanceScore),
      potential_score: Math.round(potentialScore),
      stat_distribution: statDistribution,
      role_coverage: roleCoverage,
      synergy_analysis: synergyAnalysis,
      optimization_suggestions: this.generateOptimizationSuggestions(team, characters)
    };
  }

  private calculateStatDistribution(characters: GymmyCharacter[]): TeamStatDistribution {
    const totalStats: GymmyStats = {
      strength: 0, cardio: 0, flexibility: 0, focus: 0, motivation: 0, loyalty: 0
    };
    
    // Sum all stats
    characters.forEach(char => {
      Object.keys(totalStats).forEach(stat => {
        totalStats[stat as keyof GymmyStats] += char.current_stats[stat as keyof GymmyStats];
      });
    });
    
    // Calculate averages
    const averageStats: GymmyStats = { ...totalStats };
    Object.keys(averageStats).forEach(stat => {
      averageStats[stat as keyof GymmyStats] = Math.round(totalStats[stat as keyof GymmyStats] / characters.length);
    });
    
    // Analyze stat balance
    const statBalance: Record<keyof GymmyStats, 'excellent' | 'good' | 'balanced' | 'weak' | 'critical'> = {} as any;
    const statValues = Object.values(averageStats);
    const maxStat = Math.max(...statValues);
    const minStat = Math.min(...statValues);
    const statRange = maxStat - minStat;
    
    Object.keys(averageStats).forEach(stat => {
      const value = averageStats[stat as keyof GymmyStats];
      const relativePosition = (value - minStat) / (statRange || 1);
      
      if (value >= 90) statBalance[stat as keyof GymmyStats] = 'excellent';
      else if (value >= 75) statBalance[stat as keyof GymmyStats] = 'good';
      else if (value >= 50 && relativePosition >= 0.3) statBalance[stat as keyof GymmyStats] = 'balanced';
      else if (value >= 30) statBalance[stat as keyof GymmyStats] = 'weak';
      else statBalance[stat as keyof GymmyStats] = 'critical';
    });
    
    // Identify strongest and weakest areas
    const sortedStats = Object.entries(averageStats).sort((a, b) => b[1] - a[1]);
    const strongestAreas = sortedStats.slice(0, 3).map(([stat]) => stat as keyof GymmyStats);
    const weakestAreas = sortedStats.slice(-3).map(([stat]) => stat as keyof GymmyStats).reverse();
    
    return {
      total_stats: totalStats,
      average_stats: averageStats,
      stat_balance: statBalance,
      strongest_areas: strongestAreas,
      weakest_areas: weakestAreas
    };
  }

  private analyzeRoleCoverage(team: GymmyTeam, characters: GymmyCharacter[]): RoleCoverage {
    const config = this.teamConfigurations.get(team.id);
    if (!config) {
      return {
        covered_roles: [],
        missing_roles: [],
        role_redundancy: {},
        coverage_score: 0
      };
    }
    
    const requiredRoles = [
      config.formation.layout.primary.role,
      ...config.formation.layout.support.map(p => p.role)
    ];
    
    const assignedRoles = config.role_assignments.map(assignment => {
      const position = [config.formation.layout.primary, ...config.formation.layout.support]
        .find(p => p.id === assignment.position_id);
      return position?.role || 'unknown';
    });
    
    const coveredRoles = [...new Set(assignedRoles)];
    const missingRoles = requiredRoles.filter(role => !assignedRoles.includes(role));
    
    // Calculate role redundancy
    const roleRedundancy: Record<string, number> = {};
    assignedRoles.forEach(role => {
      roleRedundancy[role] = (roleRedundancy[role] || 0) + 1;
    });
    
    // Calculate coverage score
    const coverageScore = ((requiredRoles.length - missingRoles.length) / requiredRoles.length) * 100;
    
    return {
      covered_roles: coveredRoles,
      missing_roles: missingRoles,
      role_redundancy: roleRedundancy,
      coverage_score: Math.round(coverageScore)
    };
  }

  private analyzeSynergies(team: GymmyTeam, characters: GymmyCharacter[]): SynergyAnalysis {
    const activeSynergies = team.synergies.map(synergy => ({
      synergy,
      contributing_characters: characters.map(c => c.instance_id), // Simplified
      effectiveness: 85, // Placeholder calculation
      bonus_value: 20 // Placeholder calculation
    }));
    
    // This would be much more complex in a real implementation
    return {
      active_synergies: activeSynergies,
      potential_synergies: [], // Would calculate potential synergies
      synergy_conflicts: [], // Would identify conflicts
      synergy_effectiveness: activeSynergies.length > 0 ? 
        activeSynergies.reduce((sum, s) => sum + s.effectiveness, 0) / activeSynergies.length : 0
    };
  }

  private calculateBalanceScore(statDistribution: TeamStatDistribution): number {
    const stats = Object.values(statDistribution.average_stats);
    const mean = stats.reduce((sum, stat) => sum + stat, 0) / stats.length;
    const variance = stats.reduce((sum, stat) => sum + Math.pow(stat - mean, 2), 0) / stats.length;
    const coefficient = Math.sqrt(variance) / mean;
    
    // Lower coefficient of variation = better balance
    // Convert to 0-100 score where lower variance = higher score
    return Math.max(0, Math.min(100, 100 - (coefficient * 100)));
  }

  private calculatePotentialScore(characters: GymmyCharacter[]): number {
    let potentialScore = 0;
    
    characters.forEach(char => {
      // Level progression potential
      const levelPotential = Math.min(char.level / 50, 1) * 25;
      
      // Evolution potential
      const evolutionPotential = (char.evolution_stage / char.max_evolution) * 25;
      
      // Rarity potential
      const rarityValues = { common: 5, rare: 10, epic: 15, legendary: 20, mythical: 25 };
      const rarityPotential = rarityValues[char.rarity];
      
      // Bond potential
      const bondPotential = Math.min(char.bond_points / 1000, 1) * 25;
      
      potentialScore += (levelPotential + evolutionPotential + rarityPotential + bondPotential) / 4;
    });
    
    return potentialScore / characters.length;
  }

  private generateOptimizationSuggestions(
    team: GymmyTeam, 
    characters: GymmyCharacter[]
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const performance = this.analyzeTeamPerformance(team, characters);
    
    // Stat balance suggestions
    if (performance.balance_score < 70) {
      const weakestStat = performance.stat_distribution.weakest_areas[0];
      suggestions.push({
        type: 'character_swap',
        priority: 'medium',
        title: `Improve ${weakestStat} Balance`,
        description: `Consider adding a character with higher ${weakestStat} stats to improve team balance.`,
        expected_improvement: 15,
        implementation_cost: 'medium',
        specific_actions: [`Find character with ${weakestStat} > 70`, 'Replace weakest team member', 'Reassess team composition']
      });
    }
    
    // Synergy suggestions
    if (performance.synergy_score < 60) {
      suggestions.push({
        type: 'synergy_focus',
        priority: 'high',
        title: 'Activate More Synergies',
        description: 'Your team has low synergy effectiveness. Consider restructuring for better character combinations.',
        expected_improvement: 25,
        implementation_cost: 'low',
        specific_actions: ['Review character compatibility', 'Adjust team formation', 'Focus on complementary specializations']
      });
    }
    
    // Formation suggestions
    const config = this.teamConfigurations.get(team.id);
    if (config && performance.role_coverage.coverage_score < 80) {
      suggestions.push({
        type: 'formation',
        priority: 'medium',
        title: 'Improve Role Coverage',
        description: 'Some key roles are missing or poorly filled. Consider changing formation or reassigning characters.',
        expected_improvement: 20,
        implementation_cost: 'free',
        specific_actions: ['Try different formation', 'Reassign character roles', 'Fill missing role gaps']
      });
    }
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  private initializeDefaultConfigurations(): void {
    // Default configurations would be set up here
    // This is a placeholder for initial system setup
  }

  // ==============================================================================
  // DATA MANAGEMENT
  // ==============================================================================

  public exportTeamData(): any {
    return {
      activeTeams: Array.from(this.activeTeams.entries()),
      teamConfigurations: Array.from(this.teamConfigurations.entries()),
      performanceHistory: Array.from(this.teamPerformanceHistory.entries())
    };
  }

  public importTeamData(data: any): void {
    if (data.activeTeams) this.activeTeams = new Map(data.activeTeams);
    if (data.teamConfigurations) this.teamConfigurations = new Map(data.teamConfigurations);
    if (data.performanceHistory) this.teamPerformanceHistory = new Map(data.performanceHistory);
  }

  public clearTeamData(): void {
    this.activeTeams.clear();
    this.teamConfigurations.clear();
    this.teamPerformanceHistory.clear();
  }
}

// ==============================================================================
// EXPORT SINGLETON INSTANCE
// ==============================================================================

export const teamManagementSystem = TeamManagementSystem.getInstance();
export default teamManagementSystem;