// src/context/AppContextRefactored.tsx
import React, { createContext, useContext, ReactNode } from 'react';

// Import specialized contexts
import { WorkoutProvider, useWorkout } from './contexts/WorkoutContext';
import { UserStatsProvider, useUserStats } from './contexts/UserStatsContext';
import { GachaProvider, useGacha } from './contexts/GachaContext';
import {
  SegmentationProvider,
  useSegmentation,
} from './contexts/SegmentationContext';

// Combined context value interface
interface AppContextValue {
  // Workout context
  workout: ReturnType<typeof useWorkout>;

  // User stats context
  userStats: ReturnType<typeof useUserStats>;

  // Gacha context
  gacha: ReturnType<typeof useGacha>;

  // Segmentation context
  segmentation: ReturnType<typeof useSegmentation>;

  // Legacy compatibility methods (for gradual migration)
  // Workout methods
  workoutHistory: ReturnType<typeof useWorkout>['workoutHistory'];
  exerciseHistory: ReturnType<typeof useWorkout>['exerciseHistory'];
  addWorkout: ReturnType<typeof useWorkout>['addWorkout'];
  removeWorkout: ReturnType<typeof useWorkout>['removeWorkout'];
  updateExerciseHistory: ReturnType<typeof useWorkout>['updateExerciseHistory'];
  workoutTemplates: ReturnType<typeof useWorkout>['workoutTemplates'];
  addTemplate: ReturnType<typeof useWorkout>['addTemplate'];
  removeTemplate: ReturnType<typeof useWorkout>['removeTemplate'];

  // User stats methods (legacy compatibility)
  userStats: ReturnType<typeof useUserStats>['userStats'];
  updateUserStats: ReturnType<typeof useUserStats>['updateUserStats'];
  achievements: ReturnType<typeof useUserStats>['achievements'];
  quests: ReturnType<typeof useUserStats>['quests'];

  // Gacha methods (legacy compatibility)
  characterCollection: ReturnType<typeof useGacha>['characterCollection'];
  socialPosts: ReturnType<typeof useGacha>['socialPosts'];
  userCurrencies: ReturnType<typeof useGacha>['userCurrencies'];
  performPull: ReturnType<typeof useGacha>['performPull'];

  // Segmentation methods (legacy compatibility)
  getCurrentSegment: ReturnType<typeof useSegmentation>['getCurrentSegment'];
  getSegmentConfig: ReturnType<typeof useSegmentation>['getSegmentConfig'];
  personalizedGoals: ReturnType<typeof useSegmentation>['personalizedGoals'];
  onboardingCompleted: ReturnType<
    typeof useSegmentation
  >['onboardingCompleted'];

  // Global utility methods
  resetToDummyData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Inner component that provides the combined context
const AppContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const workout = useWorkout();
  const userStatsContext = useUserStats();
  const gacha = useGacha();
  const segmentation = useSegmentation();

  // Global utility methods
  const resetToDummyData = React.useCallback(async () => {
    try {
      await Promise.all([
        workout.clearAllWorkoutData(),
        userStatsContext.resetUserStats(),
        gacha.clearGachaData(),
        segmentation.clearSegmentationData(),
      ]);

      // Load demo data for all contexts
      await Promise.all([
        userStatsContext.loadDemoStats(),
        gacha.loadDemoData(),
        segmentation.loadDemoSegmentation(),
      ]);
    } catch (error) {
      console.error('Error resetting to dummy data:', error);
    }
  }, [workout, userStatsContext, gacha, segmentation]);

  const clearAllData = React.useCallback(async () => {
    try {
      await Promise.all([
        workout.clearAllWorkoutData(),
        userStatsContext.resetUserStats(),
        gacha.clearGachaData(),
        segmentation.clearSegmentationData(),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }, [workout, userStatsContext, gacha, segmentation]);

  const loadDemoData = React.useCallback(async () => {
    try {
      await Promise.all([
        userStatsContext.loadDemoStats(),
        gacha.loadDemoData(),
        segmentation.loadDemoSegmentation(),
      ]);
    } catch (error) {
      console.error('Error loading demo data:', error);
    }
  }, [userStatsContext, gacha, segmentation]);

  const value: AppContextValue = {
    // Specialized contexts
    workout,
    userStats: userStatsContext,
    gacha,
    segmentation,

    // Legacy compatibility - Workout methods
    workoutHistory: workout.workoutHistory,
    exerciseHistory: workout.exerciseHistory,
    addWorkout: workout.addWorkout,
    removeWorkout: workout.removeWorkout,
    updateExerciseHistory: workout.updateExerciseHistory,
    workoutTemplates: workout.workoutTemplates,
    addTemplate: workout.addTemplate,
    removeTemplate: workout.removeTemplate,

    // Legacy compatibility - User stats methods
    userStats: userStatsContext.userStats,
    updateUserStats: userStatsContext.updateUserStats,
    achievements: userStatsContext.achievements,
    quests: userStatsContext.quests,

    // Legacy compatibility - Gacha methods
    characterCollection: gacha.characterCollection,
    socialPosts: gacha.socialPosts,
    userCurrencies: gacha.userCurrencies,
    performPull: gacha.performPull,

    // Legacy compatibility - Segmentation methods
    getCurrentSegment: segmentation.getCurrentSegment,
    getSegmentConfig: segmentation.getSegmentConfig,
    personalizedGoals: segmentation.personalizedGoals,
    onboardingCompleted: segmentation.onboardingCompleted,

    // Global utility methods
    resetToDummyData,
    clearAllData,
    loadDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Main provider that wraps all specialized providers
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <WorkoutProvider>
      <UserStatsProvider>
        <GachaProvider>
          <SegmentationProvider>
            <AppContextProvider>{children}</AppContextProvider>
          </SegmentationProvider>
        </GachaProvider>
      </UserStatsProvider>
    </WorkoutProvider>
  );
};

// Hook to use the combined app context
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Export individual context hooks for direct access
export { useWorkout, useUserStats, useGacha, useSegmentation };

export default AppContext;

// Export types for TypeScript support
export type { AppContextValue };
