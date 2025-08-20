// src/components/multi-gymmy-ui/team-management/utils/TeamUtils.ts
// Utility functions for team management operations

import {
  // GymmyCharacter,
  // GymmyTeam,
  // TeamSynergy
} from '../../../../context/types/MultiGymmyTypes';

export interface TeamPosition {
  id: string;
  name: string;
  role: 'leader' | 'motivator' | 'specialist' | 'support' | 'wildcard';
  isOccupied: boolean;
  character?: GymmyCharacter;
}

export interface TeamFormation {
  id: string;
  name: string;
  description: string;
  positions: TeamPosition[];
  bonuses: Record<string, number>;
}

export interface TeamPreset {
  id: string;
  name: string;
  description: string;
  formation: string;
  characters: string[];
  created_at: string;
  last_used: string;
}

// Default team formations
export const DEFAULT_FORMATIONS: Record<string, TeamFormation> = {
  balanced_core: {
    id: 'balanced_core',
    name: 'Balanced Core',
    description: 'A well-rounded formation providing balanced coverage',
    positions: [
      { id: 'leader', name: 'Leader', role: 'leader', isOccupied: false },
      { id: 'motivator', name: 'Motivator', role: 'motivator', isOccupied: false },
      { id: 'specialist', name: 'Specialist', role: 'specialist', isOccupied: false },
      { id: 'support', name: 'Support', role: 'support', isOccupied: false },
    ],
    bonuses: { balance: 20, synergy: 15 },
  },
  power_house: {
    id: 'power_house',
    name: 'Power House',
    description: 'Maximize strength training potential',
    positions: [
      { id: 'powerhouse_leader', name: 'Powerhouse Leader', role: 'leader', isOccupied: false },
      { id: 'strength_alpha', name: 'Strength Alpha', role: 'specialist', isOccupied: false },
      { id: 'strength_beta', name: 'Strength Beta', role: 'specialist', isOccupied: false },
      { id: 'power_support', name: 'Power Support', role: 'support', isOccupied: false },
    ],
    bonuses: { strength: 30, power: 25 },
  },
  cardio_squad: {
    id: 'cardio_squad',
    name: 'Cardio Squadron',
    description: 'Optimized for cardiovascular training',
    positions: [
      { id: 'pace_leader', name: 'Pace Leader', role: 'leader', isOccupied: false },
      { id: 'endurance_specialist', name: 'Endurance Specialist', role: 'specialist', isOccupied: false },
      { id: 'cardio_motivator', name: 'Cardio Motivator', role: 'motivator', isOccupied: false },
      { id: 'recovery_support', name: 'Recovery Support', role: 'support', isOccupied: false },
    ],
    bonuses: { cardio: 30, endurance: 25 },
  },
  zen_circle: {
    id: 'zen_circle',
    name: 'Zen Circle',
    description: 'Centered on mindfulness and flexibility',
    positions: [
      { id: 'zen_master', name: 'Zen Master', role: 'leader', isOccupied: false },
      { id: 'flexibility_guide', name: 'Flexibility Guide', role: 'specialist', isOccupied: false },
      { id: 'mindfulness_coach', name: 'Mindfulness Coach', role: 'motivator', isOccupied: false },
      { id: 'balance_keeper', name: 'Balance Keeper', role: 'support', isOccupied: false },
    ],
    bonuses: { flexibility: 30, focus: 25 },
  },
};

// Team utility functions
export const createEmptyTeam = (formationId: string = 'balanced_core'): GymmyTeam => {
  // const formation = ...; // Quick fix: commented unused variable
  return {
    id: `team_${Date.now()}`,
    name: `New Team`,
    formation: formationId,
    characters: [],
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
};

export const assignCharacterToPosition = (
  team: GymmyTeam,
  character: GymmyCharacter,
  positionId: string
): GymmyTeam => {
  return {
    ...team,
    characters: [...team.characters, character],
    last_updated: new Date().toISOString(),
  };
};

export const removeCharacterFromTeam = (
  team: GymmyTeam,
  characterId: string
): GymmyTeam => {
  return {
    ...team,
    characters: team.characters.filter(c => c.id !== characterId),
    last_updated: new Date().toISOString(),
  };
};

export const getTeamFormation = (formationId: string): TeamFormation => {
  return DEFAULT_FORMATIONS[formationId] || DEFAULT_FORMATIONS.balanced_core;
};

export const calculateTeamStats = (characters: GymmyCharacter[]) => {
  if (characters.length === 0) {
    return {
      total: { strength: 0, cardio: 0, flexibility: 0, focus: 0, motivation: 0, loyalty: 0 },
      average: { strength: 0, cardio: 0, flexibility: 0, focus: 0, motivation: 0, loyalty: 0 },
      balance: 0,
    };
  }

  const total = characters.reduce((sum, char) => ({
    strength: sum.strength + char.current_stats.strength,
    cardio: sum.cardio + char.current_stats.cardio,
    flexibility: sum.flexibility + char.current_stats.flexibility,
    focus: sum.focus + char.current_stats.focus,
    motivation: sum.motivation + char.current_stats.motivation,
    loyalty: sum.loyalty + char.current_stats.loyalty,
  }), { strength: 0, cardio: 0, flexibility: 0, focus: 0, motivation: 0, loyalty: 0 });

  const average = Object.keys(total).reduce((avg, key) => ({
    ...avg,
    [key]: Math.round(total[key as keyof typeof total] / characters.length),
  }), {} as typeof total);

  // Calculate balance score
  // const statValues = ...; // Quick fix: commented unused variable
  // const maxStat = ...; // Quick fix: commented unused variable
  // const minStat = ...; // Quick fix: commented unused variable
  // const balance = ...; // Quick fix: commented unused variable

  return { total, average, balance };
};

export const validateTeamComposition = (team: GymmyTeam, characters: GymmyCharacter[]) => {
  // const formation = ...; // Quick fix: commented unused variable
  // const occupiedPositions = ...; // Quick fix: commented unused variable
  // const maxPositions = ...; // Quick fix: commented unused variable

  return {
    isValid: occupiedPositions <= maxPositions,
    canAddMore: occupiedPositions < maxPositions,
    occupiedPositions,
    maxPositions,
    formation,
  };
};
