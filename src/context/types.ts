// src/context/types.ts
// Comprehensive TypeScript type definitions for the workout journal app

// ==============================================================================
// CORE DATA TYPES
// ==============================================================================

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: Array<{
    reps: number;
    weight: number;
    completed: boolean;
  }>;
  notes?: string;
}

export interface WorkoutRating {
  workoutRating: number;
  difficultyRating: number;
  enjoymentRating: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  exercises: Exercise[];
  ratings?: WorkoutRating;
  notes?: string;
  templateId?: string;
  verification_photo?: string;
  class_bonus?: number;
}

export interface UserStreaks {
  current: number;
  best: number;
  lastWorkout: string | null;
}

export interface UserCurrencies {
  gems: number;
  coins: number;
  crystals: number;
  energy_potions: number;
}

export interface UserStats {
  totalWorkouts: number;
  totalDuration: number;
  favoriteExercises: string[];
  streaks: UserStreaks;
  experience: number;
  level: number;
  totalExperience: number;
  avgWorkoutsPerWeek: number;
  avgRating: number;
  
  // Class system properties
  selectedClass: string | null;
  classLevel: number;
  classXP: number;
  skillPoints: number;
  unlockedSkills: string[];
  classSelectionDate: string | null;
  classPrestige: number;
  
  // Gacha system properties
  currencies: UserCurrencies;
  total_workouts_verified: number;
  total_likes_received: number;
  social_reputation: number;
}

// ==============================================================================
// FITNESS CLASS SYSTEM
// ==============================================================================

export interface ClassBonuses {
  compoundLiftXP?: number;
  strengthTrainingXP?: number;
  maxWeightBonus?: number;
  powerMoveXP?: number;
  isolationXP?: number;
  volumeBonus?: number;
  varietyXP?: number;
  aestheticXP?: number;
  cardioXP?: number;
  functionalXP?: number;
  recoveryBonus?: number;
  explosiveXP?: number;
  flexibilityXP?: number;
  mindfulnessXP?: number;
  recoveryXP?: number;
  balanceXP?: number;
  adaptabilityXP?: number;
  allAroundBonus?: number;
  masteryXP?: number;
}

export interface ClassStats {
  power: number;
  technique: number;
  endurance: number;
  flexibility: number;
  mental: number;
}

export interface FitnessClass {
  name: string;
  subtitle: string;
  emoji: string;
  quote: string;
  description: string;
  philosophy: string;
  color: string;
  bgGradient: [string, string];
  bonuses: ClassBonuses;
  preferredExercises: string[];
  skillTree: string;
  stats: ClassStats;
}

export type FitnessClassKey = 'powerlifter' | 'bodybuilder' | 'athlete' | 'yogi' | 'hybrid';

// ==============================================================================
// GACHA SYSTEM
// ==============================================================================

export type CharacterRarity = 'legendary' | 'epic' | 'rare' | 'common';

export interface CharacterPersonality {
  motivation: 'competitive' | 'personal' | 'social';
  style: 'intense' | 'moderate' | 'chill';
  time: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

export interface CharacterStats {
  strength: number;
  cardio: number;
  flexibility: number;
  focus: number;
}

export interface CharacterCondition {
  energy: number;
  stamina: number;
  mood: number;
  hunger: number;
  rest: number;
}

export interface CharacterTemplate {
  id: string;
  name: string;
  rarity: CharacterRarity;
  class: FitnessClassKey | 'beginner';
  description: string;
  base_stats: CharacterStats;
  personality: CharacterPersonality;
  special_ability: string;
  artwork: string;
  rarity_color: string;
}

export interface Character extends CharacterTemplate {
  instance_id: string;
  pulled_at: string;
  level: number;
  experience: number;
  current_stats: CharacterStats;
  condition: CharacterCondition;
  last_interaction: string;
}

export interface GachaPull {
  character: Character;
  timestamp: string;
}

export interface GachaState {
  total_pulls: number;
  legendary_pity: number;
  last_pull_timestamp: string | null;
  pull_history: GachaPull[];
}

export interface CharacterCollection {
  collection: Character[];
  active_character: string | null;
  character_slots: number;
}

// ==============================================================================
// SOCIAL VERIFICATION SYSTEM
// ==============================================================================

export interface WorkoutSummary {
  exercises: number;
  duration: number;
  rating: number;
  class_bonus: number;
}

export interface SocialPost {
  id: string;
  user_id: string;
  workout_id: string;
  photo_url: string;
  caption: string;
  timestamp: string;
  likes: string[];
  reports: string[];
  verified: boolean;
  workout_summary: WorkoutSummary;
}

export interface SocialState {
  workout_posts: SocialPost[];
  likes_given: string[];
  reports_made: string[];
  trust_score: number;
}

// ==============================================================================
// APP STATE
// ==============================================================================

export interface AppSettings {
  units: 'lbs' | 'kg';
  notifications: boolean;
  darkMode: boolean;
  autoTimer: boolean;
  exportFormat: 'JSON' | 'CSV';
  demoMode: boolean;
}

export interface AppState {
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  workoutHistory: Workout[];
  exerciseHistory: Record<string, any>;
  oneRepMaxes: Record<string, number>;
  settings: AppSettings;
  userStats: UserStats;
  characters: CharacterCollection;
  gacha: GachaState;
  social: SocialState;
  workoutTemplates: any[];
  restDays: any[];
  bodyWeights: any[];
}

// ==============================================================================
// ACTION TYPES
// ==============================================================================

export type ActionType = 
  | 'LOAD_DATA'
  | 'SET_LOADING'
  | 'ADD_WORKOUT'
  | 'UPDATE_WORKOUT'
  | 'REMOVE_WORKOUT'
  | 'UPDATE_USER_STATS'
  | 'SELECT_CLASS'
  | 'UNLOCK_SKILL'
  | 'AWARD_CLASS_XP'
  | 'AWARD_CURRENCY'
  | 'SPEND_CURRENCY'
  | 'GACHA_PULL'
  | 'SET_ACTIVE_CHARACTER'
  | 'POST_WORKOUT_VERIFICATION'
  | 'LIKE_WORKOUT_POST'
  | 'RECEIVE_LIKE'
  | 'UPDATE_CHARACTER'
  | 'SET_DEMO_MODE'
  | 'LOAD_DEMO_DATA'
  | 'CLEAR_ALL_DATA'
  | 'SET_ERROR';

export interface BaseAction {
  type: ActionType;
}

export interface LoadDataAction extends BaseAction {
  type: 'LOAD_DATA';
  payload: Partial<AppState>;
}

export interface SetLoadingAction extends BaseAction {
  type: 'SET_LOADING';
  payload: boolean;
}

export interface AddWorkoutAction extends BaseAction {
  type: 'ADD_WORKOUT';
  payload: Workout;
}

export interface UpdateWorkoutAction extends BaseAction {
  type: 'UPDATE_WORKOUT';
  payload: Workout;
}

export interface RemoveWorkoutAction extends BaseAction {
  type: 'REMOVE_WORKOUT';
  payload: string;
}

export interface UpdateUserStatsAction extends BaseAction {
  type: 'UPDATE_USER_STATS';
  payload: Partial<UserStats>;
}

export interface SelectClassAction extends BaseAction {
  type: 'SELECT_CLASS';
  payload: { classKey: FitnessClassKey };
}

export interface UnlockSkillAction extends BaseAction {
  type: 'UNLOCK_SKILL';
  payload: { skillId: string; cost: number };
}

export interface AwardClassXPAction extends BaseAction {
  type: 'AWARD_CLASS_XP';
  payload: { xp: number };
}

export interface AwardCurrencyAction extends BaseAction {
  type: 'AWARD_CURRENCY';
  payload: Partial<UserCurrencies>;
}

export interface SpendCurrencyAction extends BaseAction {
  type: 'SPEND_CURRENCY';
  payload: Partial<UserCurrencies>;
}

export interface GachaPullAction extends BaseAction {
  type: 'GACHA_PULL';
  payload: { character: Character; cost: Partial<UserCurrencies> };
}

export interface SetActiveCharacterAction extends BaseAction {
  type: 'SET_ACTIVE_CHARACTER';
  payload: { characterId: string };
}

export interface PostWorkoutVerificationAction extends BaseAction {
  type: 'POST_WORKOUT_VERIFICATION';
  payload: SocialPost;
}

export interface LikeWorkoutPostAction extends BaseAction {
  type: 'LIKE_WORKOUT_POST';
  payload: { postId: string };
}

export interface ReceiveLikeAction extends BaseAction {
  type: 'RECEIVE_LIKE';
}

export interface UpdateCharacterAction extends BaseAction {
  type: 'UPDATE_CHARACTER';
  payload: { characterId: string; updates: Partial<Character> };
}

export interface SetDemoModeAction extends BaseAction {
  type: 'SET_DEMO_MODE';
  payload: { isDemo: boolean };
}

export interface LoadDemoDataAction extends BaseAction {
  type: 'LOAD_DEMO_DATA';
  payload: {
    workoutHistory: Workout[];
    exerciseHistory: Record<string, any>;
    oneRepMaxes: Record<string, number>;
    userStats: UserStats;
    workoutTemplates: any[];
    restDays: any[];
    bodyWeights: any[];
  };
}

export interface ClearAllDataAction extends BaseAction {
  type: 'CLEAR_ALL_DATA';
}

export interface SetErrorAction extends BaseAction {
  type: 'SET_ERROR';
  payload: string;
}

export type Action = 
  | LoadDataAction
  | SetLoadingAction
  | AddWorkoutAction
  | UpdateWorkoutAction
  | RemoveWorkoutAction
  | UpdateUserStatsAction
  | SelectClassAction
  | UnlockSkillAction
  | AwardClassXPAction
  | AwardCurrencyAction
  | SpendCurrencyAction
  | GachaPullAction
  | SetActiveCharacterAction
  | PostWorkoutVerificationAction
  | LikeWorkoutPostAction
  | ReceiveLikeAction
  | UpdateCharacterAction
  | SetDemoModeAction
  | LoadDemoDataAction
  | ClearAllDataAction
  | SetErrorAction;

// ==============================================================================
// FUNCTION TYPES
// ==============================================================================

export type CalculateExperienceFunction = (workout: Workout, userStats: UserStats) => number;
export type CalculateClassXPFunction = (workout: Workout, userStats: UserStats) => number;
export type CalculateLevelFunction = (totalExperience: number) => number;
export type GenerateCharacterFunction = (rarity: CharacterRarity) => Character;
export type PerformGachaPullFunction = (pullType: 'single' | 'ten_pull') => Character[];
export type WorkoutWithCharacterFunction = (character: Character, workout: Workout) => Character;
export type CreateWorkoutPostFunction = (workout: Workout, photo: string, caption?: string) => SocialPost;

// ==============================================================================
// CONTEXT TYPES
// ==============================================================================

// ==============================================================================
// MEMOIZED SELECTOR TYPES
// ==============================================================================

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  totalHours: number;
  avgRating: number;
  currentStreak: number;
  longestStreak: number;
  weeklyConsistency: number;
  favoriteExercises: string[];
  workoutsWithRatings: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  condition: boolean;
  progress: number;
  maxProgress: number;
  category: string;
  xpReward: number;
}

export interface MonthlyStats {
  count: number;
  duration: number;
  avgRating: number;
}

export interface CharacterStats {
  totalCharacters: number;
  rarityCounts: Record<string, number>;
  completionPercentage: number;
  activeCharacter: string | null;
}

export interface GachaStats {
  totalPulls: number;
  legendaryPity: number;
  availableGems: number;
  availableCoins: number;
  canPullSingle: boolean;
  canPullTen: boolean;
}

export interface ContextValue extends AppState {
  // Workout functions
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  removeWorkout: (workoutId: string) => Promise<void>;
  updateUserStats: (stats: Partial<UserStats>) => Promise<void>;
  
  // Class system functions
  selectClass: (classKey: FitnessClassKey) => void;
  unlockSkill: (skillId: string, cost?: number) => void;
  awardClassXP: (xp: number) => void;
  calculateClassXPRequired: (level: number) => number;
  
  // Gacha system functions
  pullGacha: (pullType?: 'single' | 'ten_pull') => Character[];
  awardCurrency: (rewards: Partial<UserCurrencies>) => void;
  setActiveCharacter: (characterId: string) => void;
  postWorkoutVerification: (workout: Workout, photo: string, caption?: string) => SocialPost;
  likePost: (postId: string) => void;
  
  // Demo functions
  setDemoMode: (isDemo: boolean) => Promise<void>;
  loadDemoData: () => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // Constants
  FITNESS_CLASSES: Record<FitnessClassKey, FitnessClass>;
  CHARACTER_TEMPLATES: Record<CharacterRarity, CharacterTemplate[]>;
  GACHA_RATES: Record<CharacterRarity, number>;
  CURRENCY_REWARDS: Record<string, Partial<UserCurrencies>>;
  getPullCosts: () => Record<string, Partial<UserCurrencies>>;
  
  // Memoized selectors for performance
  workoutStats: WorkoutStats;
  achievements: Achievement[];
  recentWorkouts: Workout[];
  monthlyStats: MonthlyStats;
  characterStats: CharacterStats;
  gachaStats: GachaStats;
} 