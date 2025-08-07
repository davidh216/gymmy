// src/context/UnifiedAppProvider.tsx
// Unified context architecture with performance optimization and proper state management

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { UserStatsProvider } from './contexts/UserStatsContext';
import { GachaProvider } from './contexts/GachaContext';
import { SegmentationProvider } from './contexts/SegmentationContext';

// Multi-Gymmy imports
import { characterGrowthSystem } from './systems/CharacterGrowthSystem';
import { progressionTracker } from './systems/ProgressionTracker';
import { pullAnalyticsEngine } from './systems/PullAnalytics';

// ==============================================================================
// UNIFIED STATE INTERFACES
// ==============================================================================

interface UnifiedAppState {
  // Core app state
  initialized: boolean;
  loading: boolean;
  error: string | null;
  
  // Multi-Gymmy integration state
  characterSystemEnabled: boolean;
  activeCharacters: string[];
  currentTeam: string | null;
  
  // Real-time progression
  pendingExperience: Record<string, number>;
  pendingLevelUps: string[];
  pendingEvolutions: string[];
  
  // Cross-system integration
  workoutCharacterIntegration: boolean;
  progressionSyncEnabled: boolean;
  analyticsEnabled: boolean;
}

interface UnifiedAppContextValue {
  // Unified state
  appState: UnifiedAppState;
  
  // Context selectors for performance
  workout: any; // Will be populated by WorkoutProvider
  userStats: any; // Will be populated by UserStatsProvider  
  gacha: any; // Will be populated by GachaProvider
  segmentation: any; // Will be populated by SegmentationProvider
  
  // Unified actions
  initializeApp: () => Promise<void>;
  syncCharacterProgression: (workoutData: any) => Promise<void>;
  handleWorkoutComplete: (workout: any) => Promise<void>;
  handleCharacterAction: (action: string, data: any) => Promise<void>;
  
  // Performance utilities
  refreshContext: (contextName: string) => void;
  resetAppState: () => void;
  
  // Error handling
  handleError: (error: Error, context?: string) => void;
  clearError: () => void;
}

// ==============================================================================
// UNIFIED APP REDUCER
// ==============================================================================

type UnifiedAppAction = 
  | { type: 'INITIALIZE_APP' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ENABLE_CHARACTER_SYSTEM'; payload: boolean }
  | { type: 'SET_ACTIVE_CHARACTERS'; payload: string[] }
  | { type: 'SET_CURRENT_TEAM'; payload: string | null }
  | { type: 'ADD_PENDING_EXPERIENCE'; payload: { characterId: string; experience: number } }
  | { type: 'CLEAR_PENDING_EXPERIENCE'; payload: string }
  | { type: 'ADD_PENDING_LEVELUP'; payload: string }
  | { type: 'CLEAR_PENDING_LEVELUPS' }
  | { type: 'ADD_PENDING_EVOLUTION'; payload: string }
  | { type: 'CLEAR_PENDING_EVOLUTIONS' }
  | { type: 'TOGGLE_WORKOUT_INTEGRATION'; payload: boolean }
  | { type: 'TOGGLE_PROGRESSION_SYNC'; payload: boolean }
  | { type: 'TOGGLE_ANALYTICS'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialUnifiedState: UnifiedAppState = {
  initialized: false,
  loading: false,
  error: null,
  characterSystemEnabled: false,
  activeCharacters: [],
  currentTeam: null,
  pendingExperience: {},
  pendingLevelUps: [],
  pendingEvolutions: [],
  workoutCharacterIntegration: true,
  progressionSyncEnabled: true,
  analyticsEnabled: true,
};

function unifiedAppReducer(state: UnifiedAppState, action: UnifiedAppAction): UnifiedAppState {
  switch (action.type) {
    case 'INITIALIZE_APP':
      return { ...state, initialized: true, loading: false };
      
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      
    case 'ENABLE_CHARACTER_SYSTEM':
      return { ...state, characterSystemEnabled: action.payload };
      
    case 'SET_ACTIVE_CHARACTERS':
      return { ...state, activeCharacters: action.payload };
      
    case 'SET_CURRENT_TEAM':
      return { ...state, currentTeam: action.payload };
      
    case 'ADD_PENDING_EXPERIENCE':
      return {
        ...state,
        pendingExperience: {
          ...state.pendingExperience,
          [action.payload.characterId]: (state.pendingExperience[action.payload.characterId] || 0) + action.payload.experience
        }
      };
      
    case 'CLEAR_PENDING_EXPERIENCE':
      const { [action.payload]: removed, ...remainingExp } = state.pendingExperience;
      return { ...state, pendingExperience: remainingExp };
      
    case 'ADD_PENDING_LEVELUP':
      return {
        ...state,
        pendingLevelUps: [...state.pendingLevelUps, action.payload]
      };
      
    case 'CLEAR_PENDING_LEVELUPS':
      return { ...state, pendingLevelUps: [] };
      
    case 'ADD_PENDING_EVOLUTION':
      return {
        ...state,
        pendingEvolutions: [...state.pendingEvolutions, action.payload]
      };
      
    case 'CLEAR_PENDING_EVOLUTIONS':
      return { ...state, pendingEvolutions: [] };
      
    case 'TOGGLE_WORKOUT_INTEGRATION':
      return { ...state, workoutCharacterIntegration: action.payload };
      
    case 'TOGGLE_PROGRESSION_SYNC':
      return { ...state, progressionSyncEnabled: action.payload };
      
    case 'TOGGLE_ANALYTICS':
      return { ...state, analyticsEnabled: action.payload };
      
    case 'RESET_STATE':
      return { ...initialUnifiedState, initialized: state.initialized };
      
    default:
      return state;
  }
}

// ==============================================================================
// CONTEXT CREATION
// ==============================================================================

const UnifiedAppContext = createContext<UnifiedAppContextValue | undefined>(undefined);

// ==============================================================================
// UNIFIED APP PROVIDER COMPONENT
// ==============================================================================

interface UnifiedAppProviderProps {
  children: ReactNode;
  enableMultiGymmy?: boolean;
  enableAnalytics?: boolean;
}

export const UnifiedAppProvider: React.FC<UnifiedAppProviderProps> = ({
  children,
  enableMultiGymmy = true,
  enableAnalytics = true
}) => {
  const [appState, dispatch] = useReducer(unifiedAppReducer, {
    ...initialUnifiedState,
    characterSystemEnabled: enableMultiGymmy,
    analyticsEnabled: enableAnalytics
  });

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  const initializeApp = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Initialize Multi-Gymmy systems if enabled
      if (enableMultiGymmy) {
        // Initialize character growth system
        characterGrowthSystem.getInstance();
        
        // Initialize progression tracker
        progressionTracker.getInstance();
        
        // Initialize pull analytics if analytics enabled
        if (enableAnalytics) {
          pullAnalyticsEngine.getInstance();
        }
      }
      
      dispatch({ type: 'INITIALIZE_APP' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [enableMultiGymmy, enableAnalytics]);

  // ==============================================================================
  // MULTI-GYMMY INTEGRATION FUNCTIONS
  // ==============================================================================

  const syncCharacterProgression = useCallback(async (workoutData: any): Promise<void> => {
    if (!appState.characterSystemEnabled || !appState.workoutCharacterIntegration) return;

    try {
      const activeCharacters = appState.activeCharacters;
      if (activeCharacters.length === 0) return;

      // Create experience source from workout data
      const experienceSource = {
        type: 'workout' as const,
        activity: workoutData.category || 'general_workout',
        duration: workoutData.duration,
        difficulty: workoutData.difficulty || 'medium' as const,
        performance_rating: workoutData.rating || 75
      };

      // Calculate experience for each active character
      for (const characterId of activeCharacters) {
        // This would need to get actual character data
        // For now, we'll simulate the experience calculation
        const mockCharacter = { id: characterId, specialization: 'strength_training', rarity: 'common', level: 1 };
        
        const experienceGain = characterGrowthSystem.calculateExperienceGain(
          mockCharacter as any,
          experienceSource,
          activeCharacters.map(id => ({ id, specialization: 'strength_training' })) as any[]
        );

        // Add pending experience
        dispatch({
          type: 'ADD_PENDING_EXPERIENCE',
          payload: { characterId, experience: experienceGain.total_exp }
        });

        // Check for level up (simplified)
        if (experienceGain.total_exp > 100) {
          dispatch({ type: 'ADD_PENDING_LEVELUP', payload: characterId });
        }
      }

      // Track progression if enabled
      if (appState.progressionSyncEnabled) {
        const sessionId = progressionTracker.startSession(
          experienceSource.activity,
          activeCharacters
        );
        
        // End session with experience gains (this would be more complex in reality)
        progressionTracker.endSession(
          sessionId,
          activeCharacters.map(id => ({ 
            base_exp: 50, 
            bonus_exp: 25, 
            total_exp: 75,
            source: experienceSource,
            multipliers: []
          })),
          [], // level ups would be calculated
          [], // evolutions would be calculated
          workoutData.duration || 30,
          workoutData.rating || 75
        );
      }

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Character progression sync failed: ${error.message}` });
    }
  }, [appState]);

  const handleWorkoutComplete = useCallback(async (workout: any): Promise<void> => {
    // Sync character progression
    await syncCharacterProgression(workout);

    // Handle analytics if enabled
    if (appState.analyticsEnabled) {
      // This would integrate with analytics systems
      console.log('Analytics: Workout completed', { workout, characters: appState.activeCharacters });
    }

    // Clear pending states after processing
    setTimeout(() => {
      dispatch({ type: 'CLEAR_PENDING_LEVELUPS' });
      dispatch({ type: 'CLEAR_PENDING_EVOLUTIONS' });
    }, 5000); // Show animations for 5 seconds

  }, [appState, syncCharacterProgression]);

  const handleCharacterAction = useCallback(async (action: string, data: any): Promise<void> => {
    try {
      switch (action) {
        case 'SET_ACTIVE_TEAM':
          dispatch({ type: 'SET_CURRENT_TEAM', payload: data.teamId });
          dispatch({ type: 'SET_ACTIVE_CHARACTERS', payload: data.characterIds });
          break;
          
        case 'ADD_ACTIVE_CHARACTER':
          if (!appState.activeCharacters.includes(data.characterId)) {
            dispatch({ 
              type: 'SET_ACTIVE_CHARACTERS', 
              payload: [...appState.activeCharacters, data.characterId] 
            });
          }
          break;
          
        case 'REMOVE_ACTIVE_CHARACTER':
          dispatch({
            type: 'SET_ACTIVE_CHARACTERS',
            payload: appState.activeCharacters.filter(id => id !== data.characterId)
          });
          break;
          
        case 'EVOLVE_CHARACTER':
          // Handle character evolution
          dispatch({ type: 'ADD_PENDING_EVOLUTION', payload: data.characterId });
          break;
          
        default:
          console.warn(`Unknown character action: ${action}`);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Character action failed: ${error.message}` });
    }
  }, [appState]);

  // ==============================================================================
  // UTILITY FUNCTIONS
  // ==============================================================================

  const refreshContext = useCallback((contextName: string): void => {
    // This would trigger a refresh of specific contexts
    console.log(`Refreshing context: ${contextName}`);
  }, []);

  const resetAppState = useCallback((): void => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const handleError = useCallback((error: Error, context?: string): void => {
    const errorMessage = context ? `${context}: ${error.message}` : error.message;
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    
    // Log error for debugging
    console.error('App Error:', { error, context });
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // ==============================================================================
  // INITIALIZATION EFFECT
  // ==============================================================================

  useEffect(() => {
    if (!appState.initialized) {
      initializeApp();
    }
  }, [initializeApp, appState.initialized]);

  // ==============================================================================
  // MEMOIZED CONTEXT VALUE
  // ==============================================================================

  const contextValue = useMemo((): UnifiedAppContextValue => ({
    appState,
    workout: undefined, // Will be populated by nested providers
    userStats: undefined, // Will be populated by nested providers
    gacha: undefined, // Will be populated by nested providers
    segmentation: undefined, // Will be populated by nested providers
    initializeApp,
    syncCharacterProgression,
    handleWorkoutComplete,
    handleCharacterAction,
    refreshContext,
    resetAppState,
    handleError,
    clearError,
  }), [
    appState,
    initializeApp,
    syncCharacterProgression,
    handleWorkoutComplete,
    handleCharacterAction,
    refreshContext,
    resetAppState,
    handleError,
    clearError,
  ]);

  // ==============================================================================
  // NESTED PROVIDER STRUCTURE
  // ==============================================================================

  return (
    <UnifiedAppContext.Provider value={contextValue}>
      <SegmentationProvider>
        <UserStatsProvider>
          <GachaProvider>
            <WorkoutProvider>
              <ContextBridge>
                {children}
              </ContextBridge>
            </WorkoutProvider>
          </GachaProvider>
        </UserStatsProvider>
      </SegmentationProvider>
    </UnifiedAppContext.Provider>
  );
};

// ==============================================================================
// CONTEXT BRIDGE COMPONENT
// ==============================================================================

// This component bridges the individual contexts with the unified context
const ContextBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const unifiedContext = useContext(UnifiedAppContext);
  const workout = useContext(WorkoutProvider as any); // This would need proper typing
  const userStats = useContext(UserStatsProvider as any);
  const gacha = useContext(GachaProvider as any);
  const segmentation = useContext(SegmentationProvider as any);

  // Update the unified context with individual context values
  useEffect(() => {
    if (unifiedContext) {
      // This is a simplified approach - in reality, we'd need more sophisticated state bridging
      (unifiedContext as any).workout = workout;
      (unifiedContext as any).userStats = userStats;
      (unifiedContext as any).gacha = gacha;
      (unifiedContext as any).segmentation = segmentation;
    }
  }, [unifiedContext, workout, userStats, gacha, segmentation]);

  return <>{children}</>;
};

// ==============================================================================
// CUSTOM HOOKS
// ==============================================================================

export const useUnifiedApp = (): UnifiedAppContextValue => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    throw new Error('useUnifiedApp must be used within a UnifiedAppProvider');
  }
  return context;
};

// Context selectors for performance optimization
export const useAppState = (): UnifiedAppState => {
  const { appState } = useUnifiedApp();
  return appState;
};

export const useCharacterSystem = () => {
  const { appState, handleCharacterAction, syncCharacterProgression } = useUnifiedApp();
  
  return useMemo(() => ({
    enabled: appState.characterSystemEnabled,
    activeCharacters: appState.activeCharacters,
    currentTeam: appState.currentTeam,
    pendingExperience: appState.pendingExperience,
    pendingLevelUps: appState.pendingLevelUps,
    pendingEvolutions: appState.pendingEvolutions,
    setActiveTeam: (teamId: string, characterIds: string[]) => 
      handleCharacterAction('SET_ACTIVE_TEAM', { teamId, characterIds }),
    addActiveCharacter: (characterId: string) =>
      handleCharacterAction('ADD_ACTIVE_CHARACTER', { characterId }),
    removeActiveCharacter: (characterId: string) =>
      handleCharacterAction('REMOVE_ACTIVE_CHARACTER', { characterId }),
    syncProgression: syncCharacterProgression,
  }), [appState, handleCharacterAction, syncCharacterProgression]);
};

export const useWorkoutIntegration = () => {
  const { appState, handleWorkoutComplete } = useUnifiedApp();
  
  return useMemo(() => ({
    enabled: appState.workoutCharacterIntegration,
    onWorkoutComplete: handleWorkoutComplete,
  }), [appState.workoutCharacterIntegration, handleWorkoutComplete]);
};

// ==============================================================================
// PERFORMANCE MONITORING UTILITIES
// ==============================================================================

export const usePerformanceMonitor = () => {
  const { appState } = useUnifiedApp();
  
  useEffect(() => {
    // Monitor context performance
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Warn if render takes longer than 100ms
        console.warn(`Slow context render detected: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [appState]);
};

export default UnifiedAppProvider;