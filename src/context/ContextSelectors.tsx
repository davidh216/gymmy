// src/context/ContextSelectors.tsx
// Context selector hooks for optimized data access and performance

import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkout } from './contexts/WorkoutContext';
import { useUserStats } from './contexts/UserStatsContext';
import { useGacha } from './contexts/GachaContext';
import { useSegmentation } from './contexts/SegmentationContext';

// ==============================================================================
// CONTEXT SELECTOR INTERFACES
// ==============================================================================

interface SelectorsContextValue {
  // Workout selectors
  useWorkoutHistory: () => any[];
  useWorkoutActions: () => any;
  
  // User stats selectors
  useUserStatsData: () => any;
  useUserStatsActions: () => any;
  
  // Gacha selectors
  useCharacterCollection: () => any[];
  useGachaActions: () => any;
  
  // Segmentation selectors
  useUserSegment: () => any;
}

// ==============================================================================
// SELECTOR HOOKS
// ==============================================================================

// Workout selectors
export const useWorkoutHistory = () => {
  const { workoutHistory } = useWorkout();
  return workoutHistory;
};

export const useWorkoutActions = () => {
  const workoutContext = useWorkout();
  return {
    addWorkout: workoutContext.addWorkout,
    removeWorkout: workoutContext.removeWorkout,
    updateWorkout: workoutContext.updateWorkout,
    updateExerciseHistory: workoutContext.updateExerciseHistory,
    addTemplate: workoutContext.addTemplate,
    removeTemplate: workoutContext.removeTemplate,
    addRestDay: workoutContext.addRestDay,
    removeRestDay: workoutContext.removeRestDay,
    setWorkoutHistory: workoutContext.setWorkoutHistory,
    clearAllWorkoutData: workoutContext.clearAllWorkoutData,
  };
};

// User stats selectors
export const useUserStatsData = () => {
  const userStatsContext = useUserStats();
  return {
    userStats: userStatsContext.userStats,
    achievements: userStatsContext.achievements,
    quests: userStatsContext.quests,
    loading: userStatsContext.loading,
    error: userStatsContext.error,
  };
};

export const useUserStatsActions = () => {
  const userStatsContext = useUserStats();
  return {
    updateUserStats: userStatsContext.updateUserStats,
    addExperience: userStatsContext.addExperience,
    selectClass: userStatsContext.selectClass,
    updateBodyWeight: userStatsContext.updateBodyWeight,
    updateGoal: userStatsContext.updateGoal,
    unlockAchievement: userStatsContext.unlockAchievement,
    updateAchievementProgress: userStatsContext.updateAchievementProgress,
    updateQuestProgress: userStatsContext.updateQuestProgress,
    completeQuest: userStatsContext.completeQuest,
    generateDailyQuests: userStatsContext.generateDailyQuests,
    resetUserStats: userStatsContext.resetUserStats,
    loadDemoStats: userStatsContext.loadDemoStats,
  };
};

// Gacha selectors
export const useCharacterCollection = () => {
  const { characterCollection } = useGacha();
  return characterCollection;
};

export const useGachaActions = () => {
  const gachaContext = useGacha();
  return {
    performPull: gachaContext.performPull,
    performEnhancedPull: gachaContext.performEnhancedPull,
    evolveCharacter: gachaContext.evolveCharacter,
    addCharacter: gachaContext.addCharacter,
    updateCharacter: gachaContext.updateCharacter,
    favoriteCharacter: gachaContext.favoriteCharacter,
    updateCurrencies: gachaContext.updateCurrencies,
    spendGems: gachaContext.spendGems,
    earnGems: gachaContext.earnGems,
    createPost: gachaContext.createPost,
    likePost: gachaContext.likePost,
    deletePost: gachaContext.deletePost,
    activateBanner: gachaContext.activateBanner,
    getAvailableBanners: gachaContext.getAvailableBanners,
    claimDailyBonus: gachaContext.claimDailyBonus,
    resetDailyBonuses: gachaContext.resetDailyBonuses,
    clearGachaData: gachaContext.clearGachaData,
    loadDemoData: gachaContext.loadDemoData,
  };
};

// Segmentation selectors
export const useUserSegment = () => {
  const segmentationContext = useSegmentation();
  return {
    currentSegment: segmentationContext.currentSegment,
    segmentProfile: segmentationContext.segmentProfile,
    personalizedGoals: segmentationContext.personalizedGoals,
    segmentPreferences: segmentationContext.segmentPreferences,
    segmentMetrics: segmentationContext.segmentMetrics,
    adaptiveSettings: segmentationContext.adaptiveSettings,
    loading: segmentationContext.loading,
    error: segmentationContext.error,
  };
};

// ==============================================================================
// ALL SELECTORS PROVIDER
// ==============================================================================

const SelectorsContext = createContext<SelectorsContextValue | null>(null);

interface AllSelectorsProviderProps {
  children: ReactNode;
}

export const AllSelectorsProvider: React.FC<AllSelectorsProviderProps> = ({ children }) => {
  const value: SelectorsContextValue = {
    useWorkoutHistory,
    useWorkoutActions,
    useUserStatsData,
    useUserStatsActions,
    useCharacterCollection,
    useGachaActions,
    useUserSegment,
  };

  return (
    <SelectorsContext.Provider value={value}>
      {children}
    </SelectorsContext.Provider>
  );
};

// Hook to access all selectors
export const useAllSelectors = (): SelectorsContextValue => {
  const context = useContext(SelectorsContext);
  if (!context) {
    throw new Error('useAllSelectors must be used within an AllSelectorsProvider');
  }
  return context;
};

export default SelectorsContext; 