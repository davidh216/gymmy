// src/context/ContextSelectors.tsx
// Performance-optimized context selectors to prevent unnecessary re-renders

import React, { createContext, useContext, useMemo, useRef, useEffect, ReactNode } from 'react';
import { useUnifiedApp } from './UnifiedAppProvider';

// ==============================================================================
// SELECTOR TYPES
// ==============================================================================

type SelectorFunction<T, R> = (state: T) => R;
type EqualityFunction<T> = (prev: T, next: T) => boolean;

interface ContextSelectorValue<T> {
  state: T;
  select: <R>(selector: SelectorFunction<T, R>, equality?: EqualityFunction<R>) => R;
}

// ==============================================================================
// EQUALITY FUNCTIONS
// ==============================================================================

const shallowEqual = <T>(prev: T, next: T): boolean => {
  if (prev === next) return true;
  
  if (typeof prev !== 'object' || typeof next !== 'object' || prev === null || next === null) {
    return false;
  }
  
  const prevKeys = Object.keys(prev as any);
  const nextKeys = Object.keys(next as any);
  
  if (prevKeys.length !== nextKeys.length) return false;
  
  for (const key of prevKeys) {
    if ((prev as any)[key] !== (next as any)[key]) return false;
  }
  
  return true;
};

const deepEqual = <T>(prev: T, next: T): boolean => {
  return JSON.stringify(prev) === JSON.stringify(next);
};

// ==============================================================================
// CONTEXT SELECTOR HOOK
// ==============================================================================

function useContextSelector<T, R>(
  context: React.Context<ContextSelectorValue<T>>,
  selector: SelectorFunction<T, R>,
  equality: EqualityFunction<R> = Object.is
): R {
  const contextValue = useContext(context);
  
  if (!contextValue) {
    throw new Error('useContextSelector must be used within the appropriate provider');
  }
  
  const { state } = contextValue;
  const selectedRef = useRef<R>();
  const selected = selector(state);
  
  if (selectedRef.current === undefined || !equality(selectedRef.current, selected)) {
    selectedRef.current = selected;
  }
  
  return selectedRef.current;
}

// ==============================================================================
// WORKOUT CONTEXT SELECTOR
// ==============================================================================

const WorkoutSelectorContext = createContext<ContextSelectorValue<any> | undefined>(undefined);

export const WorkoutSelectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { workout } = useUnifiedApp();
  
  const contextValue = useMemo((): ContextSelectorValue<any> => ({
    state: workout,
    select: (selector, equality = Object.is) => {
      return selector(workout);
    }
  }), [workout]);
  
  return (
    <WorkoutSelectorContext.Provider value={contextValue}>
      {children}
    </WorkoutSelectorContext.Provider>
  );
};

// Workout selectors
export const useWorkoutHistory = () => 
  useContextSelector(WorkoutSelectorContext, state => state?.workoutHistory || [], shallowEqual);

export const useExerciseHistory = () =>
  useContextSelector(WorkoutSelectorContext, state => state?.exerciseHistory || {}, shallowEqual);

export const useWorkoutTemplates = () =>
  useContextSelector(WorkoutSelectorContext, state => state?.workoutTemplates || [], shallowEqual);

export const useRestDays = () =>
  useContextSelector(WorkoutSelectorContext, state => state?.restDays || [], shallowEqual);

export const useWorkoutActions = () =>
  useContextSelector(WorkoutSelectorContext, state => ({
    addWorkout: state?.addWorkout,
    removeWorkout: state?.removeWorkout,
    updateExerciseHistory: state?.updateExerciseHistory,
    addTemplate: state?.addTemplate,
    removeTemplate: state?.removeTemplate,
    addRestDay: state?.addRestDay,
    removeRestDay: state?.removeRestDay,
  }), shallowEqual);

// ==============================================================================
// USER STATS CONTEXT SELECTOR
// ==============================================================================

const UserStatsSelectorContext = createContext<ContextSelectorValue<any> | undefined>(undefined);

export const UserStatsSelectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userStats } = useUnifiedApp();
  
  const contextValue = useMemo((): ContextSelectorValue<any> => ({
    state: userStats,
    select: (selector, equality = Object.is) => {
      return selector(userStats);
    }
  }), [userStats]);
  
  return (
    <UserStatsSelectorContext.Provider value={contextValue}>
      {children}
    </UserStatsSelectorContext.Provider>
  );
};

// User stats selectors
export const useUserStatsData = () =>
  useContextSelector(UserStatsSelectorContext, state => state?.userStats || {}, shallowEqual);

export const useAchievements = () =>
  useContextSelector(UserStatsSelectorContext, state => state?.achievements || [], shallowEqual);

export const useQuests = () =>
  useContextSelector(UserStatsSelectorContext, state => state?.quests || [], shallowEqual);

export const useUserLevel = () =>
  useContextSelector(UserStatsSelectorContext, state => state?.userStats?.level || 1);

export const useUserExperience = () =>
  useContextSelector(UserStatsSelectorContext, state => state?.userStats?.experience || 0);

export const useUserClass = () =>
  useContextSelector(UserStatsSelectorContext, state => state?.userStats?.selectedClass || null);

export const useUserStatsActions = () =>
  useContextSelector(UserStatsSelectorContext, state => ({
    updateUserStats: state?.updateUserStats,
    addAchievement: state?.addAchievement,
    completeQuest: state?.completeQuest,
    addQuest: state?.addQuest,
  }), shallowEqual);

// ==============================================================================
// GACHA CONTEXT SELECTOR
// ==============================================================================

const GachaSelectorContext = createContext<ContextSelectorValue<any> | undefined>(undefined);

export const GachaSelectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { gacha } = useUnifiedApp();
  
  const contextValue = useMemo((): ContextSelectorValue<any> => ({
    state: gacha,
    select: (selector, equality = Object.is) => {
      return selector(gacha);
    }
  }), [gacha]);
  
  return (
    <GachaSelectorContext.Provider value={contextValue}>
      {children}
    </GachaSelectorContext.Provider>
  );
};

// Gacha selectors
export const useCharacterCollection = () =>
  useContextSelector(GachaSelectorContext, state => state?.characterCollection || [], shallowEqual);

export const useUserCurrencies = () =>
  useContextSelector(GachaSelectorContext, state => state?.userCurrencies || { gems: 0, coins: 0 }, shallowEqual);

export const useSocialPosts = () =>
  useContextSelector(GachaSelectorContext, state => state?.socialPosts || [], shallowEqual);

export const useCurrentBanner = () =>
  useContextSelector(GachaSelectorContext, state => state?.currentBanner || null, shallowEqual);

export const useDailyBonuses = () =>
  useContextSelector(GachaSelectorContext, state => state?.dailyBonuses || null, shallowEqual);

export const useGachaActions = () =>
  useContextSelector(GachaSelectorContext, state => ({
    performPull: state?.performPull,
    addCharacter: state?.addCharacter,
    updateCurrencies: state?.updateCurrencies,
    addSocialPost: state?.addSocialPost,
    claimDailyBonus: state?.claimDailyBonus,
  }), shallowEqual);

// ==============================================================================
// SEGMENTATION CONTEXT SELECTOR
// ==============================================================================

const SegmentationSelectorContext = createContext<ContextSelectorValue<any> | undefined>(undefined);

export const SegmentationSelectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { segmentation } = useUnifiedApp();
  
  const contextValue = useMemo((): ContextSelectorValue<any> => ({
    state: segmentation,
    select: (selector, equality = Object.is) => {
      return selector(segmentation);
    }
  }), [segmentation]);
  
  return (
    <SegmentationSelectorContext.Provider value={contextValue}>
      {children}
    </SegmentationSelectorContext.Provider>
  );
};

// Segmentation selectors
export const useUserSegment = () =>
  useContextSelector(SegmentationSelectorContext, state => state?.currentSegment || null);

export const useSegmentConfig = () =>
  useContextSelector(SegmentationSelectorContext, state => state?.segmentConfig || null, shallowEqual);

export const usePersonalizedGoals = () =>
  useContextSelector(SegmentationSelectorContext, state => state?.personalizedGoals || [], shallowEqual);

export const useOnboardingStatus = () =>
  useContextSelector(SegmentationSelectorContext, state => ({
    completed: state?.onboardingCompleted || false,
    step: state?.onboardingStep || 'welcome',
    inProgress: state?.surveyInProgress || false,
  }), shallowEqual);

export const useSegmentationActions = () =>
  useContextSelector(SegmentationSelectorContext, state => ({
    completeSurvey: state?.completeSurvey,
    updateSegment: state?.updateSegment,
    generateGoals: state?.generateGoals,
    startOnboarding: state?.startOnboarding,
    completeOnboarding: state?.completeOnboarding,
  }), shallowEqual);

// ==============================================================================
// COMBINED SELECTOR PROVIDER
// ==============================================================================

export const AllSelectorsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WorkoutSelectorProvider>
      <UserStatsSelectorProvider>
        <GachaSelectorProvider>
          <SegmentationSelectorProvider>
            {children}
          </SegmentationSelectorProvider>
        </GachaSelectorProvider>
      </UserStatsSelectorProvider>
    </WorkoutSelectorProvider>
  );
};

// ==============================================================================
// PERFORMANCE MONITORING SELECTORS
// ==============================================================================

export const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
      console.warn(`${componentName} has rendered ${renderCount.current} times. Consider optimization.`);
    }
  });
  
  return renderCount.current;
};

export const useComponentPerformance = (componentName: string) => {
  const startTime = useRef<number>();
  
  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        
        if (process.env.NODE_ENV === 'development' && renderTime > 50) {
          console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render. Consider optimization.`);
        }
      }
    };
  });
};

// ==============================================================================
// MEMOIZATION UTILITIES
// ==============================================================================

export const useMemoizedSelector = <T, R>(
  selector: () => R,
  dependencies: any[],
  equalityFn: EqualityFunction<R> = Object.is
): R => {
  const previousValue = useRef<R>();
  const previousDeps = useRef<any[]>();
  
  const currentValue = useMemo(() => {
    const newValue = selector();
    
    if (
      previousValue.current !== undefined &&
      previousDeps.current &&
      dependencies.length === previousDeps.current.length &&
      dependencies.every((dep, index) => Object.is(dep, previousDeps.current![index])) &&
      equalityFn(previousValue.current, newValue)
    ) {
      return previousValue.current;
    }
    
    previousValue.current = newValue;
    previousDeps.current = [...dependencies];
    return newValue;
  }, dependencies);
  
  return currentValue;
};

// ==============================================================================
// DEBUG UTILITIES
// ==============================================================================

export const useContextDebugger = (contextName: string) => {
  const { appState } = useUnifiedApp();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`Context Debug: ${contextName}`);
      console.log('App State:', appState);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }, [contextName, appState]);
};

export default {
  AllSelectorsProvider,
  WorkoutSelectorProvider,
  UserStatsSelectorProvider,
  GachaSelectorProvider,
  SegmentationSelectorProvider,
  useWorkoutHistory,
  useExerciseHistory,
  useWorkoutTemplates,
  useUserStatsData,
  useAchievements,
  useCharacterCollection,
  useUserSegment,
  useRenderCount,
  useComponentPerformance,
  useMemoizedSelector,
};