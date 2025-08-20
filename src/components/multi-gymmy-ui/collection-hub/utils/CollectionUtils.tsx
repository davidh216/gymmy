import {
  // Character,
  // CharacterRarity,
  // CharacterClass,
  // CharacterStatus
} from '../../../context/types/MultiGymmyTypes';

// Collection Data Structures
export interface CollectionStats {
  totalCharacters: number;
  uniqueCharacters: number;
  byRarity: Record<CharacterRarity, number>;
  byClass: Record<CharacterClass, number>;
  byStatus: Record<CharacterStatus, number>;
  completionPercentage: number;
  averageLevel: number;
  totalExperience: number;
}

export interface CollectionFilters {
  search: string;
  rarity: CharacterRarity[];
  class: CharacterClass[];
  status: CharacterStatus[];
  level: { min: number; max: number };
  owned: boolean;
  evolved: boolean;
}

export interface SortOption {
  key: keyof Character | 'rarity' | 'level' | 'experience' | 'dateAcquired';
  label: string;
  direction: 'asc' | 'desc';
}

export interface CollectionViewMode {
  type: 'grid' | 'list' | 'compact';
  columns: number;
  showDetails: boolean;
}

// Character Enhancement for Collection Display
export interface EnhancedCharacter extends Character {
  isNew: boolean;
  daysOwned: number;
  usageCount: number;
  favoriteTeams: string[];
  evolutionProgress: number;
  nextEvolutionMaterials: string[];
}

// Utility Functions
export const calculateCollectionStats = (characters: Character[]): CollectionStats => {
  const stats: CollectionStats = {
    totalCharacters: characters.length,
    uniqueCharacters: new Set(characters.map(c => c.id)).size,
    byRarity: { common: 0, rare: 0, epic: 0, legendary: 0 },
    byClass: { strength: 0, cardio: 0, flexibility: 0, balance: 0, endurance: 0 },
    byStatus: { idle: 0, training: 0, evolved: 0, maxed: 0 },
    completionPercentage: 0,
    averageLevel: 0,
    totalExperience: 0,
  };

  characters.forEach(char => {
    stats.byRarity[char.rarity]++;
    stats.byClass[char.class]++;
    stats.byStatus[char.status]++;
    stats.totalExperience += char.experience;
  });

  stats.averageLevel = characters.length > 0 ? stats.totalExperience / characters.length : 0;
  stats.completionPercentage = (stats.uniqueCharacters / 50) * 100; // Assuming 50 total characters

  return stats;
};

export const filterCharacters = (
  characters: Character[],
  filters: CollectionFilters
): Character[] => {
  return characters.filter(char => {
    // Search filter
    if (filters.search && !char.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Rarity filter
    if (filters.rarity.length > 0 && !filters.rarity.includes(char.rarity)) {
      return false;
    }

    // Class filter
    if (filters.class.length > 0 && !filters.class.includes(char.class)) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(char.status)) {
      return false;
    }

    // Level filter
    if (char.level < filters.level.min || char.level > filters.level.max) {
      return false;
    }

    // Owned filter
    if (filters.owned && !char.owned) {
      return false;
    }

    // Evolved filter
    if (filters.evolved && char.status !== 'evolved') {
      return false;
    }

    return true;
  });
};

export const sortCharacters = (
  characters: Character[],
  sortOption: SortOption
): Character[] => {
  return [...characters].sort((a, b) => {
    let aValue: any = a[sortOption.key as keyof Character];
    let bValue: any = b[sortOption.key as keyof Character];

    // Handle special sort keys
    if (sortOption.key === 'rarity') {
      // const rarityOrder = ...; // Quick fix: commented unused variable
      aValue = rarityOrder[a.rarity];
      bValue = rarityOrder[b.rarity];
    } else if (sortOption.key === 'level') {
      aValue = a.level;
      bValue = b.level;
    } else if (sortOption.key === 'experience') {
      aValue = a.experience;
      bValue = b.experience;
    } else if (sortOption.key === 'dateAcquired') {
      aValue = new Date(a.dateAcquired || 0).getTime();
      bValue = new Date(b.dateAcquired || 0).getTime();
    }

    if (sortOption.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const enhanceCharacterForDisplay = (character: Character): EnhancedCharacter => {
  // const now = ...; // Quick fix: commented unused variable
  // const acquiredDate = ...; // Quick fix: commented unused variable
  // const daysOwned = ...; // Quick fix: commented unused variable

  return {
    ...character,
    isNew: daysOwned <= 7,
    daysOwned,
    usageCount: character.usageCount || 0,
    favoriteTeams: character.favoriteTeams || [],
    evolutionProgress: calculateEvolutionProgress(character),
    nextEvolutionMaterials: getNextEvolutionMaterials(character),
  };
};

export const calculateEvolutionProgress = (character: Character): number => {
  if (character.status === 'evolved') return 100;
  if (character.status === 'maxed') return 100;

  // const requiredExp = ...; // Quick fix: commented unused variable // Simplified calculation
  // const currentExp = ...; // Quick fix: commented unused variable
  
  return Math.min((currentExp / requiredExp) * 100, 100);
};

export const getNextEvolutionMaterials = (character: Character): string[] => {
  // Simplified material requirements based on rarity and level
  // const baseMaterials = ...; // Quick fix: commented unused variable
  
  if (character.rarity === 'legendary') {
    return [...baseMaterials, 'Legendary Shard', 'Rare Gem'];
  } else if (character.rarity === 'epic') {
    return [...baseMaterials, 'Epic Fragment', 'Magic Dust'];
  } else if (character.rarity === 'rare') {
    return [...baseMaterials, 'Rare Essence'];
  }
  
  return baseMaterials;
};

export const getRarityColor = (rarity: CharacterRarity): string => {
  switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#A55EEA';
    case 'rare': return '#4ECDC4';
    case 'common': return '#95A5A6';
    default: return '#95A5A6';
  }
};

export const getClassIcon = (characterClass: CharacterClass): string => {
  switch (characterClass) {
    case 'strength': return '💪';
    case 'cardio': return '🏃';
    case 'flexibility': return '🧘';
    case 'balance': return '⚖️';
    case 'endurance': return '🔥';
    default: return '❓';
  }
};

export const getStatusColor = (status: CharacterStatus): string => {
  switch (status) {
    case 'evolved': return '#26DE81';
    case 'maxed': return '#FFD700';
    case 'training': return '#4ECDC4';
    case 'idle': return '#95A5A6';
    default: return '#95A5A6';
  }
};

export const formatCharacterLevel = (level: number): string => {
  return `Lv. ${level}`;
};

export const formatExperience = (experience: number): string => {
  if (experience >= 1000000) {
    return `${(experience / 1000000).toFixed(1)}M`;
  } else if (experience >= 1000) {
    return `${(experience / 1000).toFixed(1)}K`;
  }
  return experience.toString();
};

export const getCharacterDescription = (character: Character): string => {
  const descriptions = {
    strength: 'A powerful companion focused on building strength and muscle.',
    cardio: 'An energetic partner for cardiovascular training and endurance.',
    flexibility: 'A flexible friend helping with mobility and stretching.',
    balance: 'A balanced ally for coordination and stability training.',
    endurance: 'A resilient companion for long-duration workouts.',
  };
  
  return descriptions[character.class] || 'A versatile fitness companion.';
}; 