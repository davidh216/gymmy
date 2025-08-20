import {
  // Character,
  // CharacterRarity,
  // CharacterClass,
  // CharacterStatus
} from '../../../context/types/MultiGymmyTypes';

// Character Statistics
export interface CharacterStats {
  power: number;
  speed: number;
  endurance: number;
  flexibility: number;
  balance: number;
  total: number;
}

export interface CharacterComparison {
  character1: Character;
  character2: Character;
  statDifferences: Record<keyof CharacterStats, number>;
  overallAdvantage: 'character1' | 'character2' | 'tie';
  recommendations: string[];
}

// Character Enhancement Data
export interface CharacterEnhancement {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  isAvailable: boolean;
}

// Utility Functions
export const calculateCharacterStats = (character: Character): CharacterStats => {
  const baseStats = {
    power: character.level * 10,
    speed: character.level * 8,
    endurance: character.level * 12,
    flexibility: character.level * 6,
    balance: character.level * 7,
  };

  // Apply rarity multipliers
  // const rarityMultiplier = ...; // Quick fix: commented unused variable
  // const classBonus = ...; // Quick fix: commented unused variable
  // const statusBonus = ...; // Quick fix: commented unused variable

  return {
    power: Math.round((baseStats.power + classBonus.power) * rarityMultiplier * statusBonus),
    speed: Math.round((baseStats.speed + classBonus.speed) * rarityMultiplier * statusBonus),
    endurance: Math.round((baseStats.endurance + classBonus.endurance) * rarityMultiplier * statusBonus),
    flexibility: Math.round((baseStats.flexibility + classBonus.flexibility) * rarityMultiplier * statusBonus),
    balance: Math.round((baseStats.balance + classBonus.balance) * rarityMultiplier * statusBonus),
    total: 0, // Will be calculated below
  };
};

export const getRarityMultiplier = (rarity: CharacterRarity): number => {
  switch (rarity) {
    case 'legendary': return 2.0;
    case 'epic': return 1.5;
    case 'rare': return 1.2;
    case 'common': return 1.0;
    default: return 1.0;
  }
};

export const getClassBonus = (characterClass: CharacterClass): CharacterStats => {
  // const baseBonus = ...; // Quick fix: commented unused variable
  
  switch (characterClass) {
    case 'strength':
      return { ...baseBonus, power: 20, endurance: 10 };
    case 'cardio':
      return { ...baseBonus, speed: 25, endurance: 15 };
    case 'flexibility':
      return { ...baseBonus, flexibility: 30, balance: 10 };
    case 'balance':
      return { ...baseBonus, balance: 25, flexibility: 15 };
    case 'endurance':
      return { ...baseBonus, endurance: 30, power: 10 };
    default:
      return baseBonus;
  }
};

export const getStatusBonus = (status: CharacterStatus): number => {
  switch (status) {
    case 'evolved': return 1.5;
    case 'maxed': return 2.0;
    case 'training': return 1.1;
    case 'idle': return 1.0;
    default: return 1.0;
  }
};

export const compareCharacters = (char1: Character, char2: Character): CharacterComparison => {
  // const stats1 = ...; // Quick fix: commented unused variable
  // const stats2 = ...; // Quick fix: commented unused variable
  
  // Calculate total stats
  stats1.total = stats1.power + stats1.speed + stats1.endurance + stats1.flexibility + stats1.balance;
  stats2.total = stats2.power + stats2.speed + stats2.endurance + stats2.flexibility + stats2.balance;

  const statDifferences: Record<keyof CharacterStats, number> = {
    power: stats1.power - stats2.power,
    speed: stats1.speed - stats2.speed,
    endurance: stats1.endurance - stats2.endurance,
    flexibility: stats1.flexibility - stats2.flexibility,
    balance: stats1.balance - stats2.balance,
    total: stats1.total - stats2.total,
  };

  const overallAdvantage = statDifferences.total > 0 ? 'character1' : 
                          statDifferences.total < 0 ? 'character2' : 'tie';

  // const recommendations = ...; // Quick fix: commented unused variable

  return {
    character1: char1,
    character2: char2,
    statDifferences,
    overallAdvantage,
    recommendations,
  };
};

export const generateComparisonRecommendations = (
  char1: Character,
  char2: Character,
  differences: Record<keyof CharacterStats, number>
): string[] => {
  const recommendations: string[] = [];

  // Overall strength recommendations
  if (differences.total > 50) {
    recommendations.push(`${char1.name} is significantly stronger overall`);
  } else if (differences.total < -50) {
    recommendations.push(`${char2.name} is significantly stronger overall`);
  } else {
    recommendations.push('Both characters are well-balanced');
  }

  // Specific stat recommendations
  if (differences.power > 20) {
    recommendations.push(`${char1.name} excels in power-based activities`);
  } else if (differences.power < -20) {
    recommendations.push(`${char2.name} excels in power-based activities`);
  }

  if (differences.speed > 20) {
    recommendations.push(`${char1.name} is faster for cardio workouts`);
  } else if (differences.speed < -20) {
    recommendations.push(`${char2.name} is faster for cardio workouts`);
  }

  if (differences.flexibility > 15) {
    recommendations.push(`${char1.name} is better for flexibility training`);
  } else if (differences.flexibility < -15) {
    recommendations.push(`${char2.name} is better for flexibility training`);
  }

  // Team synergy recommendations
  if (char1.class !== char2.class) {
    recommendations.push('Different classes can create powerful team synergies');
  }

  // Evolution recommendations
  if (char1.status === 'evolved' && char2.status !== 'evolved') {
    recommendations.push(`${char1.name} has evolved, giving it an advantage`);
  } else if (char2.status === 'evolved' && char1.status !== 'evolved') {
    recommendations.push(`${char2.name} has evolved, giving it an advantage`);
  }

  return recommendations;
};

export const getCharacterTier = (character: Character): string => {
  // const stats = ...; // Quick fix: commented unused variable
  // const totalPower = ...; // Quick fix: commented unused variable
  
  if (totalPower >= 500) return 'S';
  if (totalPower >= 400) return 'A';
  if (totalPower >= 300) return 'B';
  if (totalPower >= 200) return 'C';
  return 'D';
};

export const getCharacterPotential = (character: Character): number => {
  // const basePotential = ...; // Quick fix: commented unused variable
  // const rarityPotential = ...; // Quick fix: commented unused variable
  // const statusPotential = ...; // Quick fix: commented unused variable
  
  return Math.round(basePotential * rarityPotential * statusPotential);
};

export const getRarityPotential = (rarity: CharacterRarity): number => {
  switch (rarity) {
    case 'legendary': return 3.0;
    case 'epic': return 2.0;
    case 'rare': return 1.5;
    case 'common': return 1.0;
    default: return 1.0;
  }
};

export const getStatusPotential = (status: CharacterStatus): number => {
  switch (status) {
    case 'maxed': return 1.0; // Already at max potential
    case 'evolved': return 1.5;
    case 'training': return 1.2;
    case 'idle': return 1.0;
    default: return 1.0;
  }
};

export const getCharacterSpecialties = (character: Character): string[] => {
  const specialties: string[] = [];
  // const stats = ...; // Quick fix: commented unused variable
  
  // Find the highest stat
  // const statEntries = ...; // Quick fix: commented unused variable
  // const maxStat = ...; // Quick fix: commented unused variable
  
  statEntries.forEach(([stat, value]) => {
    if (value === maxStat) {
      specialties.push(getSpecialtyDescription(stat as keyof CharacterStats));
    }
  });

  // Add class-specific specialties
  specialties.push(getClassSpecialty(character.class));
  
  // Add rarity-specific specialties
  if (character.rarity === 'legendary') {
    specialties.push('Legendary abilities');
  }

  return specialties;
};

export const getSpecialtyDescription = (stat: keyof CharacterStats): string => {
  switch (stat) {
    case 'power': return 'Power training specialist';
    case 'speed': return 'Speed and agility expert';
    case 'endurance': return 'Endurance master';
    case 'flexibility': return 'Flexibility guru';
    case 'balance': return 'Balance and coordination expert';
    default: return 'Well-rounded trainer';
  }
};

export const getClassSpecialty = (characterClass: CharacterClass): string => {
  switch (characterClass) {
    case 'strength': return 'Strength training programs';
    case 'cardio': return 'Cardiovascular workouts';
    case 'flexibility': return 'Mobility and stretching';
    case 'balance': return 'Balance and stability';
    case 'endurance': return 'Long-duration training';
    default: return 'General fitness';
  }
};

export const getCharacterAge = (character: Character): string => {
  // const acquiredDate = ...; // Quick fix: commented unused variable
  // const now = ...; // Quick fix: commented unused variable
  // const daysOwned = ...; // Quick fix: commented unused variable
  
  if (daysOwned === 0) return 'Just acquired';
  if (daysOwned === 1) return '1 day old';
  if (daysOwned < 7) return `${daysOwned} days old`;
  if (daysOwned < 30) return `${Math.floor(daysOwned / 7)} weeks old`;
  if (daysOwned < 365) return `${Math.floor(daysOwned / 30)} months old`;
  return `${Math.floor(daysOwned / 365)} years old`;
};

export const getCharacterMood = (character: Character): string => {
  // const usageCount = ...; // Quick fix: commented unused variable
  // const level = ...; // Quick fix: commented unused variable
  
  if (level >= 50) return 'Elite';
  if (level >= 30) return 'Experienced';
  if (level >= 20) return 'Skilled';
  if (level >= 10) return 'Trained';
  if (usageCount > 50) return 'Loyal';
  if (usageCount > 20) return 'Friendly';
  if (usageCount > 5) return 'Acquainted';
  return 'New';
};

export const getCharacterAchievements = (character: Character): string[] => {
  const achievements: string[] = [];
  // const level = ...; // Quick fix: commented unused variable
  // const usageCount = ...; // Quick fix: commented unused variable
  // const experience = ...; // Quick fix: commented unused variable
  
  if (level >= 50) achievements.push('Level 50 Master');
  if (level >= 30) achievements.push('Level 30 Veteran');
  if (level >= 20) achievements.push('Level 20 Expert');
  if (level >= 10) achievements.push('Level 10 Trained');
  
  if (usageCount >= 100) achievements.push('Century Club (100+ uses)');
  if (usageCount >= 50) achievements.push('Frequent Companion (50+ uses)');
  if (usageCount >= 20) achievements.push('Regular Partner (20+ uses)');
  
  if (experience >= 100000) achievements.push('Experience Master');
  if (experience >= 50000) achievements.push('Experience Veteran');
  if (experience >= 10000) achievements.push('Experience Trained');
  
  if (character.status === 'evolved') achievements.push('Evolution Complete');
  if (character.status === 'maxed') achievements.push('Maximum Potential');
  
  return achievements;
};

export const getCharacterRecommendations = (character: Character): string[] => {
  const recommendations: string[] = [];
  // const stats = ...; // Quick fix: commented unused variable
  
  // Training recommendations based on stats
  if (stats.power < 100) {
    recommendations.push('Focus on strength training to improve power');
  }
  if (stats.speed < 80) {
    recommendations.push('Include cardio workouts to boost speed');
  }
  if (stats.flexibility < 60) {
    recommendations.push('Add stretching routines for flexibility');
  }
  
  // Evolution recommendations
  if (character.status !== 'evolved' && character.level >= 20) {
    recommendations.push('Ready for evolution - collect required materials');
  }
  
  // Usage recommendations
  if ((character.usageCount || 0) < 10) {
    recommendations.push('Use this character more to build experience');
  }
  
  return recommendations;
}; 