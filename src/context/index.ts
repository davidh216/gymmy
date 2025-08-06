// src/context/index.ts
// Main exports from the context module

export { default as AppContext, AppProvider, useApp } from './AppContext';
export { 
  FITNESS_CLASSES, 
  CHARACTER_TEMPLATES, 
  GACHA_RATES, 
  CURRENCY_REWARDS,
  getPullCosts, 
} from './GameData';
export {
  calculateExperience,
  calculateClassXP,
  calculateLevel,
  calculateLevelRequirement,
  calculateTotalXPForLevel,
  calculateClassXPRequired,
  performGachaPull,
  generateCharacter,
  workoutWithCharacter,
  createWorkoutPost,
} from './GameLogic';
export { 
  ActionTypes, 
  initialState, 
  appReducer, 
} from './GameReducer';

// Export all types
export type {
  // Core data types
  Exercise,
  WorkoutRating,
  Workout,
  UserStreaks,
  UserCurrencies,
  UserStats,
  
  // Fitness class system
  ClassBonuses,
  ClassStats,
  FitnessClass,
  FitnessClassKey,
  
  // Gacha system
  CharacterRarity,
  CharacterPersonality,
  CharacterStats,
  CharacterCondition,
  CharacterTemplate,
  Character,
  GachaPull,
  GachaState,
  CharacterCollection,
  
  // Social verification system
  WorkoutSummary,
  SocialPost,
  SocialState,
  
  // App state
  AppSettings,
  AppState,
  
  // Action types
  ActionType,
  BaseAction,
  LoadDataAction,
  SetLoadingAction,
  AddWorkoutAction,
  UpdateWorkoutAction,
  RemoveWorkoutAction,
  UpdateUserStatsAction,
  SelectClassAction,
  UnlockSkillAction,
  AwardClassXPAction,
  AwardCurrencyAction,
  SpendCurrencyAction,
  GachaPullAction,
  SetActiveCharacterAction,
  PostWorkoutVerificationAction,
  LikeWorkoutPostAction,
  ReceiveLikeAction,
  UpdateCharacterAction,
  SetDemoModeAction,
  LoadDemoDataAction,
  ClearAllDataAction,
  SetErrorAction,
  Action,
  
  // Function types
  CalculateExperienceFunction,
  CalculateClassXPFunction,
  CalculateLevelFunction,
  GenerateCharacterFunction,
  PerformGachaPullFunction,
  WorkoutWithCharacterFunction,
  CreateWorkoutPostFunction,
  
  // Context types
  ContextValue,
} from './types'; 