import {
  // Character
} from '../../../context/types/MultiGymmyTypes';

// Mock character data for demonstration
export const mockCharacters: Character[] = [
  {
    id: '1',
    name: 'Power Gymmy',
    emoji: '💪',
    rarity: 'legendary',
    class: 'strength',
    status: 'evolved',
    level: 45,
    experience: 125000,
    owned: true,
    dateAcquired: new Date('2024-01-15').getTime(),
    usageCount: 89,
  },
  {
    id: '2',
    name: 'Speed Runner',
    emoji: '🏃',
    rarity: 'epic',
    class: 'cardio',
    status: 'training',
    level: 32,
    experience: 78000,
    owned: true,
    dateAcquired: new Date('2024-02-20').getTime(),
    usageCount: 67,
  },
  {
    id: '3',
    name: 'Flex Master',
    emoji: '🧘',
    rarity: 'rare',
    class: 'flexibility',
    status: 'idle',
    level: 28,
    experience: 65000,
    owned: true,
    dateAcquired: new Date('2024-03-10').getTime(),
    usageCount: 45,
  },
  {
    id: '4',
    name: 'Balance Pro',
    emoji: '⚖️',
    rarity: 'rare',
    class: 'balance',
    status: 'training',
    level: 25,
    experience: 52000,
    owned: true,
    dateAcquired: new Date('2024-03-25').getTime(),
    usageCount: 38,
  },
  {
    id: '5',
    name: 'Endurance Beast',
    emoji: '🔥',
    rarity: 'epic',
    class: 'endurance',
    status: 'evolved',
    level: 38,
    experience: 95000,
    owned: true,
    dateAcquired: new Date('2024-01-30').getTime(),
    usageCount: 72,
  },
  {
    id: '6',
    name: 'Common Trainer',
    emoji: '👤',
    rarity: 'common',
    class: 'strength',
    status: 'idle',
    level: 15,
    experience: 25000,
    owned: true,
    dateAcquired: new Date('2024-04-05').getTime(),
    usageCount: 12,
  },
];

// Filter options
export // const rarityOptions = ...; // Quick fix: commented unused variable
export // const classOptions = ...; // Quick fix: commented unused variable
export // const statusOptions = ...; // Quick fix: commented unused variable

// Default filter states
export const defaultFilters = {
  search: '',
  rarity: [],
  class: [],
  status: [],
  level: { min: 0, max: 100 },
  owned: false,
  evolved: false,
};

// Default sort option
export const defaultSortOption = {
  key: 'level' as const,
  label: 'Level',
  direction: 'desc' as const,
};

// Default view mode
export const defaultViewMode = {
  type: 'grid' as const,
  columns: 2,
  showDetails: true,
}; 