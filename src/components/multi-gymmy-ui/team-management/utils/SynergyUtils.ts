// src/components/multi-gymmy-ui/team-management/utils/SynergyUtils.ts
// Utility functions for synergy calculations and visualization

import {
  // GymmyCharacter,
  // TeamSynergy,
  // GymmyRarity,
  // GymmyType,
  // SpecializationType
} from '../../../../context/types/MultiGymmyTypes';

export interface SynergyConnection {
  id: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  synergyType: string;
  strength: number; // 0-100
  color: string;
  isActive: boolean;
}

export interface SynergyAnalysis {
  activeSynergies: SynergyConnection[];
  potentialSynergies: SynergyConnection[];
  synergyScore: number;
  recommendations: string[];
}

// Synergy color mapping
export const SYNERGY_COLORS = {
  legendary: '#FFD700', // Gold
  epic: '#9370DB', // Purple
  rare: '#4169E1', // Blue
  common: '#32CD32', // Green
  type: '#FF6347', // Orange
  specialization: '#FF69B4', // Pink
  complementary: '#20B2AA', // Light Sea Green
};

// Synergy calculation functions
export const calculateTeamSynergies = (characters: GymmyCharacter[]): SynergyAnalysis => {
  if (characters.length < 2) {
    return {
      activeSynergies: [],
      potentialSynergies: [],
      synergyScore: 0,
      recommendations: ['Add more characters to unlock synergies'],
    };
  }

  const activeSynergies: SynergyConnection[] = [];
  const potentialSynergies: SynergyConnection[] = [];
  let totalSynergyScore = 0;

  // Calculate rarity synergies
  // const rarityCounts = ...; // Quick fix: commented unused variable
  // const raritySynergies = ...; // Quick fix: commented unused variable
  activeSynergies.push(...raritySynergies.active);
  potentialSynergies.push(...raritySynergies.potential);
  totalSynergyScore += raritySynergies.score;

  // Calculate type synergies
  // const typeCounts = ...; // Quick fix: commented unused variable
  // const typeSynergies = ...; // Quick fix: commented unused variable
  activeSynergies.push(...typeSynergies.active);
  potentialSynergies.push(...typeSynergies.potential);
  totalSynergyScore += typeSynergies.score;

  // Calculate specialization synergies
  // const specCounts = ...; // Quick fix: commented unused variable
  // const specSynergies = ...; // Quick fix: commented unused variable
  activeSynergies.push(...specSynergies.active);
  potentialSynergies.push(...specSynergies.potential);
  totalSynergyScore += specSynergies.score;

  // Calculate complementary synergies
  // const complementarySynergies = ...; // Quick fix: commented unused variable
  activeSynergies.push(...complementarySynergies.active);
  potentialSynergies.push(...complementarySynergies.potential);
  totalSynergyScore += complementarySynergies.score;

  // const recommendations = ...; // Quick fix: commented unused variable

  return {
    activeSynergies,
    potentialSynergies,
    synergyScore: Math.min(100, totalSynergyScore),
    recommendations,
  };
};

const countByRarity = (characters: GymmyCharacter[]): Record<GymmyRarity, number> => {
  return characters.reduce((counts, char) => {
    counts[char.rarity] = (counts[char.rarity] || 0) + 1;
    return counts;
  }, {} as Record<GymmyRarity, number>);
};

const countByType = (characters: GymmyCharacter[]): Record<GymmyType, number> => {
  return characters.reduce((counts, char) => {
    counts[char.type] = (counts[char.type] || 0) + 1;
    return counts;
  }, {} as Record<GymmyType, number>);
};

const countBySpecialization = (characters: GymmyCharacter[]): Record<SpecializationType, number> => {
  return characters.reduce((counts, char) => {
    counts[char.specialization] = (counts[char.specialization] || 0) + 1;
    return counts;
  }, {} as Record<SpecializationType, number>);
};

const calculateRaritySynergies = (rarityCounts: Record<GymmyRarity, number>) => {
  const active: SynergyConnection[] = [];
  const potential: SynergyConnection[] = [];
  let score = 0;

  // Legendary synergies
  if (rarityCounts.legendary >= 2) {
    score += 25;
    active.push({
      id: 'legendary_synergy',
      sourceCharacterId: 'legendary_1',
      targetCharacterId: 'legendary_2',
      synergyType: 'Legendary Duo',
      strength: 90,
      color: SYNERGY_COLORS.legendary,
      isActive: true,
    });
  }

  // Epic synergies
  if (rarityCounts.epic >= 2) {
    score += 20;
    active.push({
      id: 'epic_synergy',
      sourceCharacterId: 'epic_1',
      targetCharacterId: 'epic_2',
      synergyType: 'Epic Pair',
      strength: 75,
      color: SYNERGY_COLORS.epic,
      isActive: true,
    });
  }

  // Rare synergies
  if (rarityCounts.rare >= 3) {
    score += 15;
    active.push({
      id: 'rare_synergy',
      sourceCharacterId: 'rare_1',
      targetCharacterId: 'rare_2',
      synergyType: 'Rare Trio',
      strength: 60,
      color: SYNERGY_COLORS.rare,
      isActive: true,
    });
  }

  return { active, potential, score };
};

const calculateTypeSynergies = (typeCounts: Record<GymmyType, number>) => {
  const active: SynergyConnection[] = [];
  const potential: SynergyConnection[] = [];
  let score = 0;

  // const uniqueTypes = ...; // Quick fix: commented unused variable
  
  if (uniqueTypes >= 3) {
    score += 15;
    active.push({
      id: 'type_diversity',
      sourceCharacterId: 'type_1',
      targetCharacterId: 'type_2',
      synergyType: 'Type Diversity',
      strength: 70,
      color: SYNERGY_COLORS.type,
      isActive: true,
    });
  }

  return { active, potential, score };
};

const calculateSpecializationSynergies = (specCounts: Record<SpecializationType, number>) => {
  const active: SynergyConnection[] = [];
  const potential: SynergyConnection[] = [];
  let score = 0;

  // const uniqueSpecs = ...; // Quick fix: commented unused variable
  
  if (uniqueSpecs >= 2) {
    score += 10;
    active.push({
      id: 'spec_diversity',
      sourceCharacterId: 'spec_1',
      targetCharacterId: 'spec_2',
      synergyType: 'Specialization Mix',
      strength: 50,
      color: SYNERGY_COLORS.specialization,
      isActive: true,
    });
  }

  return { active, potential, score };
};

const calculateComplementarySynergies = (characters: GymmyCharacter[]) => {
  const active: SynergyConnection[] = [];
  const potential: SynergyConnection[] = [];
  let score = 0;

  // Find complementary stat pairs
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      // const char1 = ...; // Quick fix: commented unused variable
      // const char2 = ...; // Quick fix: commented unused variable
      
      // Check for complementary strengths
      // const char1Strongest = ...; // Quick fix: commented unused variable
      // const char2Strongest = ...; // Quick fix: commented unused variable
      
      if (char1Strongest !== char2Strongest) {
        score += 5;
        active.push({
          id: `complementary_${i}_${j}`,
          sourceCharacterId: char1.id,
          targetCharacterId: char2.id,
          synergyType: 'Complementary Strengths',
          strength: 40,
          color: SYNERGY_COLORS.complementary,
          isActive: true,
        });
      }
    }
  }

  return { active, potential, score };
};

const getStrongestStat = (character: GymmyCharacter): string => {
  // const stats = ...; // Quick fix: commented unused variable
  // const statEntries = ...; // Quick fix: commented unused variable
  return statEntries.reduce((strongest, [stat, value]) => 
    value > stats[strongest as keyof typeof stats] ? stat : strongest
  );
};

const generateSynergyRecommendations = (
  characters: GymmyCharacter[],
  activeSynergies: SynergyConnection[],
  potentialSynergies: SynergyConnection[]
): string[] => {
  const recommendations: string[] = [];

  if (activeSynergies.length === 0) {
    recommendations.push('Add characters of different rarities to unlock synergies');
  }

  if (characters.length < 4) {
    recommendations.push('Complete your team to maximize synergy potential');
  }

  // const rarityCounts = ...; // Quick fix: commented unused variable
  if (rarityCounts.legendary === 0) {
    recommendations.push('Add a legendary character for powerful synergies');
  }

  return recommendations;
};

// Visualization utilities
export const getSynergyColor = (synergyType: string): string => {
  switch (synergyType.toLowerCase()) {
    case 'legendary':
      return SYNERGY_COLORS.legendary;
    case 'epic':
      return SYNERGY_COLORS.epic;
    case 'rare':
      return SYNERGY_COLORS.rare;
    case 'type':
      return SYNERGY_COLORS.type;
    case 'specialization':
      return SYNERGY_COLORS.specialization;
    case 'complementary':
      return SYNERGY_COLORS.complementary;
    default:
      return SYNERGY_COLORS.common;
  }
};

export const getSynergyStrength = (synergyType: string): number => {
  switch (synergyType.toLowerCase()) {
    case 'legendary duo':
      return 90;
    case 'epic pair':
      return 75;
    case 'rare trio':
      return 60;
    case 'type diversity':
      return 70;
    case 'specialization mix':
      return 50;
    case 'complementary strengths':
      return 40;
    default:
      return 30;
  }
};
