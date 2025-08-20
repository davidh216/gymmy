import {
  // Character,
  // CharacterRarity,
  // CharacterClass
} from '../../../context/types/MultiGymmyTypes';

// Evolution Data Structures
export interface EvolutionMaterial {
  id: string;
  name: string;
  description: string;
  rarity: CharacterRarity;
  icon: string;
  required: number;
  owned: number;
  source: string[];
}

export interface EvolutionPath {
  id: string;
  name: string;
  description: string;
  requirements: EvolutionRequirement[];
  benefits: EvolutionBenefit[];
  estimatedTime: number; // in days
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  isAvailable: boolean;
  progress: number;
}

export interface EvolutionRequirement {
  type: 'level' | 'experience' | 'material' | 'achievement' | 'team_usage';
  value: any;
  current: any;
  completed: boolean;
}

export interface EvolutionBenefit {
  type: 'stat_boost' | 'new_ability' | 'visual_upgrade' | 'team_bonus';
  description: string;
  value: any;
}

export interface EvolutionPlan {
  characterId: string;
  targetPath: EvolutionPath;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCompletion: Date;
  materialsNeeded: EvolutionMaterial[];
  dailyTasks: string[];
  progress: number;
}

// Evolution Paths Database
export const EVOLUTION_PATHS: Record<CharacterClass, EvolutionPath[]> = {
  strength: [
    {
      id: 'strength_warrior',
      name: 'Warrior Evolution',
      description: 'Transform into a mighty warrior with enhanced strength.',
      requirements: [
        { type: 'level', value: 20, current: 0, completed: false },
        { type: 'experience', value: 50000, current: 0, completed: false },
        { type: 'material', value: ['Strength Crystal', 'Warrior Essence'], current: [], completed: false },
      ],
      benefits: [
        { type: 'stat_boost', description: '+50% Strength Bonus', value: 50 },
        { type: 'new_ability', description: 'Unlock Warrior Strike', value: 'warrior_strike' },
      ],
      estimatedTime: 14,
      difficulty: 'medium',
      isAvailable: true,
      progress: 0,
    },
  ],
  cardio: [
    {
      id: 'cardio_speedster',
      name: 'Speedster Evolution',
      description: 'Evolve into a lightning-fast speedster.',
      requirements: [
        { type: 'level', value: 18, current: 0, completed: false },
        { type: 'experience', value: 45000, current: 0, completed: false },
        { type: 'material', value: ['Speed Crystal', 'Lightning Essence'], current: [], completed: false },
      ],
      benefits: [
        { type: 'stat_boost', description: '+40% Speed Bonus', value: 40 },
        { type: 'new_ability', description: 'Unlock Speed Burst', value: 'speed_burst' },
      ],
      estimatedTime: 12,
      difficulty: 'medium',
      isAvailable: true,
      progress: 0,
    },
  ],
  flexibility: [
    {
      id: 'flexibility_sage',
      name: 'Sage Evolution',
      description: 'Become a wise sage with enhanced flexibility.',
      requirements: [
        { type: 'level', value: 22, current: 0, completed: false },
        { type: 'experience', value: 55000, current: 0, completed: false },
        { type: 'material', value: ['Wisdom Crystal', 'Sage Essence'], current: [], completed: false },
      ],
      benefits: [
        { type: 'stat_boost', description: '+45% Flexibility Bonus', value: 45 },
        { type: 'new_ability', description: 'Unlock Mind Body Connection', value: 'mind_body' },
      ],
      estimatedTime: 16,
      difficulty: 'hard',
      isAvailable: true,
      progress: 0,
    },
  ],
  balance: [
    {
      id: 'balance_guardian',
      name: 'Guardian Evolution',
      description: 'Evolve into a balanced guardian protector.',
      requirements: [
        { type: 'level', value: 25, current: 0, completed: false },
        { type: 'experience', value: 60000, current: 0, completed: false },
        { type: 'material', value: ['Balance Crystal', 'Guardian Essence'], current: [], completed: false },
      ],
      benefits: [
        { type: 'stat_boost', description: '+35% Balance Bonus', value: 35 },
        { type: 'team_bonus', description: 'Team Protection Aura', value: 'protection_aura' },
      ],
      estimatedTime: 20,
      difficulty: 'hard',
      isAvailable: true,
      progress: 0,
    },
  ],
  endurance: [
    {
      id: 'endurance_phoenix',
      name: 'Phoenix Evolution',
      description: 'Rise as a legendary phoenix with unlimited endurance.',
      requirements: [
        { type: 'level', value: 30, current: 0, completed: false },
        { type: 'experience', value: 100000, current: 0, completed: false },
        { type: 'material', value: ['Phoenix Crystal', 'Legendary Essence'], current: [], completed: false },
      ],
      benefits: [
        { type: 'stat_boost', description: '+100% Endurance Bonus', value: 100 },
        { type: 'new_ability', description: 'Unlock Phoenix Rebirth', value: 'phoenix_rebirth' },
      ],
      estimatedTime: 30,
      difficulty: 'legendary',
      isAvailable: true,
      progress: 0,
    },
  ],
};

// Material Database
export const EVOLUTION_MATERIALS: EvolutionMaterial[] = [
  {
    id: 'strength_crystal',
    name: 'Strength Crystal',
    description: 'A crystal infused with pure strength energy.',
    rarity: 'rare',
    icon: '💎',
    required: 3,
    owned: 0,
    source: ['Strength Training', 'Gacha Pulls', 'Achievements'],
  },
  {
    id: 'warrior_essence',
    name: 'Warrior Essence',
    description: 'The essence of a true warrior.',
    rarity: 'epic',
    icon: '⚔️',
    required: 1,
    owned: 0,
    source: ['Warrior Challenges', 'Epic Gacha', 'Special Events'],
  },
  {
    id: 'speed_crystal',
    name: 'Speed Crystal',
    description: 'A crystal that pulses with speed energy.',
    rarity: 'rare',
    icon: '⚡',
    required: 3,
    owned: 0,
    source: ['Cardio Training', 'Gacha Pulls', 'Achievements'],
  },
  {
    id: 'lightning_essence',
    name: 'Lightning Essence',
    description: 'Pure lightning energy in material form.',
    rarity: 'epic',
    icon: '🌩️',
    required: 1,
    owned: 0,
    source: ['Speed Challenges', 'Epic Gacha', 'Special Events'],
  },
  {
    id: 'phoenix_crystal',
    name: 'Phoenix Crystal',
    description: 'A legendary crystal containing phoenix energy.',
    rarity: 'legendary',
    icon: '🔥',
    required: 1,
    owned: 0,
    source: ['Legendary Challenges', 'Legendary Gacha', 'Special Events'],
  },
];

// Utility Functions
export const getAvailableEvolutionPaths = (character: Character): EvolutionPath[] => {
  // const paths = ...; // Quick fix: commented unused variable
  
  return paths.map(path => ({
    ...path,
    requirements: path.requirements.map(req => ({
      ...req,
      current: getRequirementCurrentValue(character, req),
      completed: isRequirementCompleted(character, req),
    })),
    progress: calculateEvolutionPathProgress(character, path),
  }));
};

export const getRequirementCurrentValue = (character: Character, requirement: EvolutionRequirement): any => {
  switch (requirement.type) {
    case 'level':
      return character.level;
    case 'experience':
      return character.experience;
    case 'material':
      return []; // This would be fetched from user's material inventory
    case 'achievement':
      return 0; // This would be fetched from user's achievements
    case 'team_usage':
      return character.usageCount || 0;
    default:
      return 0;
  }
};

export const isRequirementCompleted = (character: Character, requirement: EvolutionRequirement): boolean => {
  // const current = ...; // Quick fix: commented unused variable
  
  switch (requirement.type) {
    case 'level':
    case 'experience':
    case 'team_usage':
      return current >= requirement.value;
    case 'material':
      return requirement.value.every((material: string) => 
        // This would check if user has the required materials
        true // Placeholder
      );
    case 'achievement':
      return current >= requirement.value;
    default:
      return false;
  }
};

export const calculateEvolutionPathProgress = (character: Character, path: EvolutionPath): number => {
  // const requirements = ...; // Quick fix: commented unused variable
  const completedRequirements = requirements.filter(req => 
    isRequirementCompleted(character, req)
  );
  
  return (completedRequirements.length / requirements.length) * 100;
};

export const createEvolutionPlan = (
  character: Character,
  targetPath: EvolutionPath,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): EvolutionPlan => {
  // const now = ...; // Quick fix: commented unused variable
  // const estimatedCompletion = ...; // Quick fix: commented unused variable
  
  return {
    characterId: character.id,
    targetPath,
    priority,
    estimatedCompletion,
    materialsNeeded: getMaterialsNeeded(targetPath),
    dailyTasks: generateDailyTasks(targetPath),
    progress: targetPath.progress,
  };
};

export const getMaterialsNeeded = (path: EvolutionPath): EvolutionMaterial[] => {
  // const materialRequirements = ...; // Quick fix: commented unused variable
  
  return materialRequirements.flatMap(req => {
    if (Array.isArray(req.value)) {
      return req.value.map(materialName => {
        // const material = ...; // Quick fix: commented unused variable
        return material || {
          id: materialName.toLowerCase().replace(' ', '_'),
          name: materialName,
          description: `Required material for ${path.name}`,
          rarity: 'common',
          icon: '📦',
          required: 1,
          owned: 0,
          source: ['Unknown'],
        };
      });
    }
    return [];
  });
};

export const generateDailyTasks = (path: EvolutionPath): string[] => {
  const tasks: string[] = [];
  
  path.requirements.forEach(req => {
    if (!req.completed) {
      switch (req.type) {
        case 'level':
          tasks.push(`Train ${path.name} character to gain levels`);
          break;
        case 'experience':
          tasks.push(`Complete workouts to earn experience`);
          break;
        case 'material':
          tasks.push(`Collect required evolution materials`);
          break;
        case 'achievement':
          tasks.push(`Complete achievements for evolution`);
          break;
        case 'team_usage':
          tasks.push(`Use character in team compositions`);
          break;
      }
    }
  });
  
  return tasks;
};

export const getEvolutionDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '#26DE81';
    case 'medium': return '#FED330';
    case 'hard': return '#FF6B6B';
    case 'legendary': return '#FFD700';
    default: return '#95A5A6';
  }
};

export const getEvolutionDifficultyIcon = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '⭐';
    case 'medium': return '⭐⭐';
    case 'hard': return '⭐⭐⭐';
    case 'legendary': return '👑';
    default: return '❓';
  }
};

export const formatEvolutionTime = (days: number): string => {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.ceil(days / 7)} weeks`;
  return `${Math.ceil(days / 30)} months`;
};

export const calculateEvolutionEfficiency = (plan: EvolutionPlan): number => {
  // const timeRemaining = ...; // Quick fix: commented unused variable
  // const daysRemaining = ...; // Quick fix: commented unused variable
  
  if (daysRemaining <= 0) return 100;
  
  // const progressRatio = ...; // Quick fix: commented unused variable
  // const timeRatio = ...; // Quick fix: commented unused variable
  
  return Math.min((progressRatio + timeRatio) * 50, 100);
}; 