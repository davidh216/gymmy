// src/context/types/MultiGymmyTypes.ts
// Comprehensive type definitions for the Multi-Gymmy character collection system

import { FitnessClassKey } from '../types';

// ==============================================================================
// CORE MULTI-GYMMY TYPES
// ==============================================================================

export type GymmyRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';

export type GymmyType = 
  | 'power' | 'blaze' | 'transform' | 'zen' | 'pace' | 'steady' | 'rally'
  | 'rookie' | 'specialist' | 'seasonal' | 'legendary' | 'community';

export type SpecializationType =
  | 'strength_training' | 'cardio_endurance' | 'flexibility_mobility'
  | 'mental_wellness' | 'athletic_performance' | 'habit_formation'
  | 'social_motivation' | 'versatile_training';

export type PersonalityType = 
  | 'encouraging' | 'analytical' | 'buddy' | 'competitive'
  | 'zen' | 'drill_sergeant' | 'cheerleader' | 'mentor';

export interface GymmyAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'triggered';
  effect: GymmyAbilityEffect;
  cooldown?: number;
  requirements?: string[];
}

export interface GymmyAbilityEffect {
  type: 'xp_boost' | 'motivation_bonus' | 'streak_protection' | 'currency_bonus' | 'special_unlock';
  value: number;
  duration?: number;
  conditions?: string[];
}

export interface EvolutionStage {
  stage: number;
  name: string;
  level_requirement: number;
  experience_requirement: number;
  materials_required: EvolutionMaterials;
  stat_bonuses: GymmyStats;
  new_abilities: string[];
  visual_changes: VisualChanges;
}

export interface EvolutionMaterials {
  [material: string]: number;
}

export interface VisualChanges {
  emoji?: string;
  color_scheme?: string[];
  animation?: string;
  effects?: string[];
}

export interface GymmyStats {
  strength: number;
  cardio: number;
  flexibility: number;
  focus: number;
  motivation: number;
  loyalty: number;
}

export interface GymmyCondition {
  energy: number;
  happiness: number;
  hunger: number;
  bond_level: number;
  last_interaction: string;
}

export interface GymmyPersonality {
  type: PersonalityType;
  traits: string[];
  motivation_style: 'encouraging' | 'analytical' | 'competitive' | 'supportive';
  coaching_approach: 'gentle' | 'firm' | 'adaptive' | 'intense';
  communication_style: 'casual' | 'formal' | 'energetic' | 'calm';
}

// ==============================================================================
// CHARACTER DEFINITION TYPES
// ==============================================================================

export interface GymmyTemplate {
  id: string;
  name: string;
  rarity: GymmyRarity;
  type: GymmyType;
  specialization: SpecializationType;
  fitness_class: FitnessClassKey | 'versatile';
  
  // Profile Information
  description: string;
  backstory: string;
  catchphrase: string;
  
  // Visual Design
  emoji: string;
  color_primary: string;
  color_secondary: string;
  avatar_style: string;
  
  // Base Stats
  base_stats: GymmyStats;
  growth_rates: GymmyStats;
  max_stats: GymmyStats;
  
  // Personality & Behavior
  personality: GymmyPersonality;
  abilities: GymmyAbility[];
  
  // Evolution Information
  evolution_stages: EvolutionStage[];
  max_evolution: number;
  
  // Contextual Messages
  messages: GymmyMessageSet;
  
  // Unlock Requirements
  unlock_requirements?: UnlockRequirement[];
  availability: AvailabilityWindow;
}

export interface GymmyCharacter extends GymmyTemplate {
  // Instance-specific data
  instance_id: string;
  user_id: string;
  pulled_at: string;
  
  // Current State
  level: number;
  experience: number;
  evolution_stage: number;
  current_stats: GymmyStats;
  condition: GymmyCondition;
  
  // User Interaction
  is_favorite: boolean;
  nickname?: string;
  total_workouts_together: number;
  last_interaction: string;
  bond_points: number;
  
  // Status Effects
  active_effects: StatusEffect[];
  
  // Equipment/Items (for future expansion)
  equipped_items?: string[];
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'neutral';
  effect: GymmyAbilityEffect;
  expires_at: string;
  stacks?: number;
}

export interface UnlockRequirement {
  type: 'level' | 'workouts_completed' | 'achievement' | 'event' | 'purchase';
  value: number | string;
  description: string;
}

export interface AvailabilityWindow {
  type: 'always' | 'limited' | 'seasonal' | 'event' | 'unlock';
  start_date?: string;
  end_date?: string;
  conditions?: string[];
}

// ==============================================================================
// MESSAGING SYSTEM
// ==============================================================================

export interface GymmyMessageSet {
  greetings: GymmyMessage[];
  workout_start: GymmyMessage[];
  workout_encouragement: GymmyMessage[];
  workout_completion: GymmyMessage[];
  rest_day: GymmyMessage[];
  achievement: GymmyMessage[];
  motivation: GymmyMessage[];
  bond_level_up: GymmyMessage[];
  evolution: GymmyMessage[];
  idle: GymmyMessage[];
}

export interface GymmyMessage {
  id: string;
  text: string;
  emoji?: string;
  conditions?: MessageCondition[];
  weight: number; // For random selection
  context_tags?: string[];
}

export interface MessageCondition {
  type: 'time_of_day' | 'workout_type' | 'user_mood' | 'streak' | 'weather' | 'achievement';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number;
}

// ==============================================================================
// TEAM MANAGEMENT TYPES
// ==============================================================================

export interface GymmyTeam {
  id: string;
  name: string;
  primary_gymmy: string; // Character ID
  support_gymmys: string[]; // Up to 4 support characters
  formation: TeamFormation;
  synergies: TeamSynergy[];
  team_level: number;
  total_experience: number;
  created_at: string;
  last_used: string;
}

export interface TeamFormation {
  primary_position: 'leader' | 'motivator' | 'specialist';
  support_positions: ('backup' | 'cheerleader' | 'analyst' | 'wildcard')[];
}

export interface TeamSynergy {
  id: string;
  name: string;
  description: string;
  required_characters: SynergyRequirement[];
  effects: GymmyAbilityEffect[];
  activation_conditions: string[];
}

export interface SynergyRequirement {
  type: 'specific_character' | 'rarity' | 'specialization' | 'personality';
  value: string;
  count?: number;
}

// ==============================================================================
// COLLECTION MANAGEMENT
// ==============================================================================

export interface GymmyCollection {
  characters: GymmyCharacter[];
  teams: GymmyTeam[];
  active_team_id: string | null;
  favorites: string[];
  collection_stats: CollectionStats;
  achievements: CollectionAchievement[];
}

export interface CollectionStats {
  total_characters: number;
  unique_characters: number;
  completion_percentage: number;
  rarity_counts: Record<GymmyRarity, number>;
  type_counts: Record<GymmyType, number>;
  highest_level_character: number;
  total_bond_points: number;
  collection_value: number; // For prestige/bragging rights
}

export interface CollectionAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: UnlockRequirement[];
  rewards: CollectionReward[];
  unlocked: boolean;
  unlocked_at?: string;
}

export interface CollectionReward {
  type: 'currency' | 'character' | 'title' | 'cosmetic' | 'ability';
  value: string | number;
  quantity?: number;
}

// ==============================================================================
// EVOLUTION SYSTEM TYPES
// ==============================================================================

export interface EvolutionPath {
  character_id: string;
  stages: EvolutionStage[];
  current_stage: number;
  materials_inventory: EvolutionMaterials;
  evolution_history: EvolutionRecord[];
}

export interface EvolutionRecord {
  from_stage: number;
  to_stage: number;
  evolved_at: string;
  materials_used: EvolutionMaterials;
  stat_gains: GymmyStats;
}

export interface EvolutionMaterial {
  id: string;
  name: string;
  description: string;
  rarity: GymmyRarity;
  sources: string[];
  icon: string;
  value: number;
}

// ==============================================================================
// SEASONAL & EVENT TYPES
// ==============================================================================

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  featured_characters: string[];
  exclusive_rewards: CollectionReward[];
  special_mechanics: EventMechanic[];
  completion_requirements: UnlockRequirement[];
}

export interface EventMechanic {
  id: string;
  type: 'bonus_rates' | 'special_currency' | 'limited_pulls' | 'community_goal';
  description: string;
  parameters: Record<string, any>;
}

// ==============================================================================
// MULTI-GYMMY SYSTEM STATE
// ==============================================================================

export interface MultiGymmyState {
  collection: GymmyCollection;
  active_events: SeasonalEvent[];
  evolution_materials: Record<string, number>;
  team_presets: GymmyTeam[];
  daily_interactions: Record<string, number>;
  bond_milestones: BondMilestone[];
  character_unlock_progress: Record<string, number>;
}

export interface BondMilestone {
  character_id: string;
  milestone: number;
  unlocked_at: string;
  rewards: CollectionReward[];
}

// ==============================================================================
// CONTEXT INTEGRATION TYPES
// ==============================================================================

export interface MultiGymmyContextValue {
  // State
  collection: GymmyCollection;
  activeTeam: GymmyTeam | null;
  selectedCharacter: GymmyCharacter | null;
  
  // Character Management
  getCharacter: (id: string) => GymmyCharacter | null;
  addCharacter: (template: GymmyTemplate) => Promise<GymmyCharacter>;
  updateCharacter: (id: string, updates: Partial<GymmyCharacter>) => Promise<void>;
  evolveCharacter: (id: string) => Promise<boolean>;
  
  // Team Management
  createTeam: (name: string, characters: string[]) => Promise<GymmyTeam>;
  updateTeam: (id: string, updates: Partial<GymmyTeam>) => Promise<void>;
  setActiveTeam: (id: string) => Promise<void>;
  calculateTeamSynergies: (team: GymmyTeam) => TeamSynergy[];
  
  // Collection Management
  getCollectionStats: () => CollectionStats;
  checkCollectionAchievements: () => Promise<CollectionAchievement[]>;
  
  // Interaction System
  interactWithCharacter: (id: string, type: string) => Promise<GymmyMessage>;
  getBondLevel: (id: string) => number;
  increaseBond: (id: string, points: number) => Promise<void>;
  
  // Evolution System
  canEvolveCharacter: (id: string) => boolean;
  getEvolutionRequirements: (id: string) => EvolutionMaterials;
  awardEvolutionMaterials: (materials: EvolutionMaterials) => Promise<void>;
  
  // Event System
  getActiveEvents: () => SeasonalEvent[];
  participateInEvent: (eventId: string) => Promise<void>;
}

export default GymmyTemplate;