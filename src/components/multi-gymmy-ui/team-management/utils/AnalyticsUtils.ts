// src/components/multi-gymmy-ui/team-management/utils/AnalyticsUtils.ts
// Utility functions for team performance analytics and metrics

import { GymmyCharacter, GymmyTeam } from '../../../../context/types/MultiGymmyTypes';

export interface TeamPerformanceMetrics {
  overallRating: number;
  synergyScore: number;
  balanceScore: number;
  potentialScore: number;
  effectivenessScore: number;
  statDistribution: TeamStatDistribution;
  roleCoverage: RoleCoverage;
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface TeamStatDistribution {
  total: Record<string, number>;
  average: Record<string, number>;
  balance: number;
  strongestAreas: string[];
  weakestAreas: string[];
}

export interface RoleCoverage {
  coveredRoles: string[];
  missingRoles: string[];
  roleRedundancy: Record<string, number>;
  coverageScore: number;
}

export interface OptimizationSuggestion {
  type: 'formation' | 'character_swap' | 'role_change' | 'synergy_focus';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImprovement: number;
  implementationCost: 'free' | 'low' | 'medium' | 'high';
  specificActions: string[];
}

export interface TeamAnalytics {
  performanceHistory: PerformanceHistoryEntry[];
  effectivenessTrends: EffectivenessTrend[];
  characterContributions: CharacterContribution[];
  teamComparisons: TeamComparison[];
}

export interface PerformanceHistoryEntry {
  date: string;
  teamId: string;
  performanceScore: number;
  synergyScore: number;
  balanceScore: number;
  characters: string[];
}

export interface EffectivenessTrend {
  metric: string;
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
  period: string;
}

export interface CharacterContribution {
  characterId: string;
  contributionScore: number;
  primaryRole: string;
  synergyValue: number;
  statContribution: Record<string, number>;
}

export interface TeamComparison {
  teamId: string;
  comparisonScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// Analytics calculation functions
export const calculateTeamPerformance = (
  team: GymmyTeam,
  characters: GymmyCharacter[]
): TeamPerformanceMetrics => {
  if (characters.length === 0) {
    return {
      overallRating: 0,
      synergyScore: 0,
      balanceScore: 0,
      potentialScore: 0,
      effectivenessScore: 0,
      statDistribution: {
        total: {},
        average: {},
        balance: 0,
        strongestAreas: [],
        weakestAreas: [],
      },
      roleCoverage: {
        coveredRoles: [],
        missingRoles: [],
        roleRedundancy: {},
        coverageScore: 0,
      },
      optimizationSuggestions: [],
    };
  }

  // Calculate stat distribution
  const statDistribution = calculateStatDistribution(characters);
  
  // Calculate role coverage
  const roleCoverage = calculateRoleCoverage(team, characters);
  
  // Calculate synergy score (simplified)
  const synergyScore = calculateSynergyScore(characters);
  
  // Calculate balance score
  const balanceScore = statDistribution.balance;
  
  // Calculate potential score
  const potentialScore = calculatePotentialScore(characters);
  
  // Calculate effectiveness score
  const effectivenessScore = calculateEffectivenessScore(characters, team);
  
  // Calculate overall rating
  const overallRating = Math.round(
    (synergyScore + balanceScore + potentialScore + effectivenessScore) / 4
  );
  
  // Generate optimization suggestions
  const optimizationSuggestions = generateOptimizationSuggestions(
    team,
    characters,
    statDistribution,
    roleCoverage
  );

  return {
    overallRating,
    synergyScore,
    balanceScore,
    potentialScore,
    effectivenessScore,
    statDistribution,
    roleCoverage,
    optimizationSuggestions,
  };
};

const calculateStatDistribution = (characters: GymmyCharacter[]): TeamStatDistribution => {
  const statKeys = ['strength', 'cardio', 'flexibility', 'focus', 'motivation', 'loyalty'];
  
  const total = statKeys.reduce((acc, stat) => {
    acc[stat] = characters.reduce((sum, char) => sum + char.current_stats[stat as keyof typeof char.current_stats], 0);
    return acc;
  }, {} as Record<string, number>);

  const average = Object.keys(total).reduce((acc, stat) => {
    acc[stat] = Math.round(total[stat] / characters.length);
    return acc;
  }, {} as Record<string, number>);

  // Calculate balance
  const statValues = Object.values(average);
  const maxStat = Math.max(...statValues);
  const minStat = Math.min(...statValues);
  const balance = Math.max(0, 100 - ((maxStat - minStat) / maxStat * 100));

  // Find strongest and weakest areas
  const sortedStats = Object.entries(average).sort(([,a], [,b]) => b - a);
  const strongestAreas = sortedStats.slice(0, 2).map(([stat]) => stat);
  const weakestAreas = sortedStats.slice(-2).map(([stat]) => stat);

  return {
    total,
    average,
    balance,
    strongestAreas,
    weakestAreas,
  };
};

const calculateRoleCoverage = (team: GymmyTeam, characters: GymmyCharacter[]): RoleCoverage => {
  const roles = ['leader', 'motivator', 'specialist', 'support', 'wildcard'];
  const roleCounts: Record<string, number> = {};
  
  // Count characters by their primary role (simplified)
  characters.forEach(char => {
    const role = determineCharacterRole(char);
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const coveredRoles = Object.keys(roleCounts).filter(role => roleCounts[role] > 0);
  const missingRoles = roles.filter(role => !coveredRoles.includes(role));
  
  const coverageScore = Math.round((coveredRoles.length / roles.length) * 100);

  return {
    coveredRoles,
    missingRoles,
    roleRedundancy: roleCounts,
    coverageScore,
  };
};

const determineCharacterRole = (character: GymmyCharacter): string => {
  const stats = character.current_stats;
  const statEntries = Object.entries(stats);
  const strongestStat = statEntries.reduce((strongest, [stat, value]) => 
    value > stats[strongest as keyof typeof stats] ? stat : strongest
  );

  // Map strongest stat to role
  switch (strongestStat) {
    case 'strength':
      return 'leader';
    case 'motivation':
      return 'motivator';
    case 'focus':
      return 'specialist';
    case 'loyalty':
      return 'support';
    default:
      return 'wildcard';
  }
};

const calculateSynergyScore = (characters: GymmyCharacter[]): number => {
  if (characters.length < 2) return 0;
  
  let score = 50; // Base score
  
  // Rarity synergies
  const rarityCounts = characters.reduce((counts, char) => {
    counts[char.rarity] = (counts[char.rarity] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  if (rarityCounts.legendary >= 2) score += 20;
  if (rarityCounts.epic >= 2) score += 15;
  if (rarityCounts.rare >= 3) score += 10;

  // Type diversity
  const uniqueTypes = new Set(characters.map(c => c.type)).size;
  if (uniqueTypes >= 3) score += 15;

  return Math.min(100, score);
};

const calculatePotentialScore = (characters: GymmyCharacter[]): number => {
  if (characters.length === 0) return 0;
  
  let score = 0;
  
  // Level-based potential
  const averageLevel = characters.reduce((sum, char) => sum + char.level, 0) / characters.length;
  score += Math.min(30, averageLevel * 2);
  
  // Evolution potential
  const evolutionPotential = characters.reduce((sum, char) => {
    const maxLevel = char.evolution_stage === 3 ? 100 : 50;
    return sum + (char.level / maxLevel) * 100;
  }, 0) / characters.length;
  
  score += Math.min(40, evolutionPotential * 0.4);
  
  // Rarity potential
  const rarityPotential = characters.reduce((sum, char) => {
    const rarityValues = { common: 10, rare: 25, epic: 50, legendary: 100 };
    return sum + (rarityValues[char.rarity] || 10);
  }, 0) / characters.length;
  
  score += Math.min(30, rarityPotential * 0.3);
  
  return Math.min(100, score);
};

const calculateEffectivenessScore = (characters: GymmyCharacter[], team: GymmyTeam): number => {
  if (characters.length === 0) return 0;
  
  let score = 0;
  
  // Formation effectiveness
  const formation = team.formation;
  const formationBonus = formation === 'balanced_core' ? 20 : 
                        formation === 'power_house' ? 25 :
                        formation === 'cardio_squad' ? 25 :
                        formation === 'zen_circle' ? 20 : 15;
  score += formationBonus;
  
  // Team size effectiveness
  const sizeEffectiveness = Math.min(30, characters.length * 7.5);
  score += sizeEffectiveness;
  
  // Stat balance effectiveness
  const statDistribution = calculateStatDistribution(characters);
  score += Math.min(30, statDistribution.balance * 0.3);
  
  // Synergy effectiveness
  const synergyScore = calculateSynergyScore(characters);
  score += Math.min(20, synergyScore * 0.2);
  
  return Math.min(100, score);
};

const generateOptimizationSuggestions = (
  team: GymmyTeam,
  characters: GymmyCharacter[],
  statDistribution: TeamStatDistribution,
  roleCoverage: RoleCoverage
): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];

  // Check for missing roles
  if (roleCoverage.missingRoles.length > 0) {
    suggestions.push({
      type: 'character_swap',
      priority: 'high',
      title: 'Complete Role Coverage',
      description: `Add characters to cover missing roles: ${roleCoverage.missingRoles.join(', ')}`,
      expectedImprovement: 15,
      implementationCost: 'medium',
      specificActions: [`Add ${roleCoverage.missingRoles[0]} character`],
    });
  }

  // Check for stat balance
  if (statDistribution.balance < 60) {
    suggestions.push({
      type: 'character_swap',
      priority: 'medium',
      title: 'Improve Stat Balance',
      description: 'Team stats are imbalanced. Consider characters with complementary strengths.',
      expectedImprovement: 10,
      implementationCost: 'low',
      specificActions: ['Add character with different primary stat'],
    });
  }

  // Check for synergy opportunities
  if (characters.length < 4) {
    suggestions.push({
      type: 'synergy_focus',
      priority: 'medium',
      title: 'Expand Team Size',
      description: 'Add more characters to unlock powerful synergies',
      expectedImprovement: 20,
      implementationCost: 'medium',
      specificActions: ['Add 1-2 more characters'],
    });
  }

  return suggestions;
};

// Analytics tracking functions
export const trackTeamPerformance = (
  teamId: string,
  performance: TeamPerformanceMetrics,
  characters: GymmyCharacter[]
): PerformanceHistoryEntry => {
  return {
    date: new Date().toISOString(),
    teamId,
    performanceScore: performance.overallRating,
    synergyScore: performance.synergyScore,
    balanceScore: performance.balanceScore,
    characters: characters.map(c => c.id),
  };
};

export const calculateEffectivenessTrends = (
  history: PerformanceHistoryEntry[]
): EffectivenessTrend[] => {
  if (history.length < 2) return [];

  const trends: EffectivenessTrend[] = [];
  const recent = history.slice(-5);
  const older = history.slice(-10, -5);

  if (older.length > 0) {
    const recentAvg = recent.reduce((sum, entry) => sum + entry.performanceScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.performanceScore, 0) / older.length;
    const changeRate = ((recentAvg - olderAvg) / olderAvg) * 100;

    trends.push({
      metric: 'Overall Performance',
      trend: changeRate > 5 ? 'improving' : changeRate < -5 ? 'declining' : 'stable',
      changeRate: Math.round(changeRate),
      period: 'Last 5 sessions',
    });
  }

  return trends;
};
