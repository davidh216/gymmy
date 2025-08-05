// src/context/AppContext.tsx

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  FitnessSegment, 
  SegmentProfile, 
  OnboardingSurvey, 
  SegmentPreferences, 
  SegmentMetrics,
  PersonalizedGoal,
  AdaptiveSettings,
  SEGMENT_CONFIGS 
} from './segmentationTypes';
import { SegmentationEngine } from './SegmentationEngine';

// Extended interfaces for the enhanced context
interface RestDay {
  id: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedUserStats {
  // Existing user stats
  level: number;
  experience: number;
  selectedClass: string;
  classLevel: number;
  classExperience: number;
  currencies: {
    gems: number;
  };
  characterCollection: string[];
  achievements: string[];
  quests: string[];
  
  // NEW: Segmentation data
  segmentProfile?: SegmentProfile;
  surveyHistory: OnboardingSurvey[];
  segmentPreferences?: SegmentPreferences;
  segmentMetrics?: SegmentMetrics;
  
  // NEW: Personalization data
  personalizedGoals: PersonalizedGoal[];
  adaptiveSettings?: AdaptiveSettings;
  
  // NEW: Onboarding state
  onboardingCompleted: boolean;
  onboardingStep: 'welcome' | 'survey' | 'results' | 'completed';
}

interface AppState {
  // Existing state
  workoutHistory: any[];
  currentWorkout: any;
  userStats: EnhancedUserStats;
  exerciseHistory: any;
  achievements: any[];
  quests: any[];
  characterCollection: any[];
  restDays: RestDay[];
  loading: boolean;
  error: string | null;
  
  // NEW: Segmentation state
  availableSegments: FitnessSegment[];
  segmentationLoaded: boolean;
  surveyInProgress: boolean;
  
  // NEW: Personalization state
  personalizedExperience: boolean;
  adaptiveGoalsEnabled: boolean;
}

// Action types
type AppAction = 
  // Existing actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_STATS'; payload: EnhancedUserStats }
  | { type: 'UPDATE_USER_STATS'; payload: Partial<EnhancedUserStats> }
  | { type: 'ADD_WORKOUT'; payload: any }
  | { type: 'UPDATE_WORKOUT'; payload: any }
  | { type: 'DELETE_WORKOUT'; payload: string }
  | { type: 'SET_CURRENT_WORKOUT'; payload: any }
  | { type: 'ADD_REST_DAY'; payload: RestDay }
  | { type: 'UPDATE_REST_DAY'; payload: RestDay }
  | { type: 'REMOVE_REST_DAY'; payload: string }
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  
  // NEW: Segmentation actions
  | { type: 'START_SURVEY'; payload?: any }
  | { type: 'COMPLETE_SURVEY'; payload: OnboardingSurvey }
  | { type: 'UPDATE_SEGMENT_PROFILE'; payload: SegmentProfile }
  | { type: 'UPDATE_SEGMENT_PREFERENCES'; payload: SegmentPreferences }
  | { type: 'UPDATE_SEGMENT_METRICS'; payload: SegmentMetrics }
  | { type: 'SET_SEGMENTATION_LOADED'; payload: boolean }
  
  // NEW: Goal management actions
  | { type: 'ADD_PERSONALIZED_GOAL'; payload: PersonalizedGoal }
  | { type: 'UPDATE_PERSONALIZED_GOAL'; payload: PersonalizedGoal }
  | { type: 'COMPLETE_GOAL'; payload: string }
  | { type: 'REMOVE_GOAL'; payload: string }
  | { type: 'GENERATE_NEW_GOALS'; payload: PersonalizedGoal[] }
  
  // NEW: Onboarding actions
  | { type: 'SET_ONBOARDING_STEP'; payload: 'welcome' | 'survey' | 'results' | 'completed' }
  | { type: 'COMPLETE_ONBOARDING'; payload: any };

// Default states
const getDefaultUserStats = (): EnhancedUserStats => ({
  level: 1,
  experience: 0,
  selectedClass: '',
  classLevel: 1,
  classExperience: 0,
  currencies: { gems: 50 },
  characterCollection: [],
  achievements: [],
  quests: [],
  
  // Segmentation defaults
  surveyHistory: [],
  personalizedGoals: [],
  
  // Onboarding defaults
  onboardingCompleted: false,
  onboardingStep: 'welcome'
});

const getDefaultSegmentPreferences = (): SegmentPreferences => ({
  preferredMetrics: [],
  goalTimeframe: 'weekly',
  difficultyPreference: 'adaptive',
  celebrationStyle: 'moderate',
  reminderFrequency: 'daily',
  socialSharing: false,
  dashboardFocus: 'progress',
  chartTypes: ['line', 'bar'],
  gymmyPersonality: 'encouraging'
});

const getDefaultSegmentMetrics = (): SegmentMetrics => ({
  dailyActiveRate: 0,
  weeklyRetentionRate: 0,
  goalCompletionRate: 0,
  featureUsageRates: {},
  satisfactionScore: 0,
  averageProgressRate: 0,
  milestoneHitRate: 0,
  consistencyScore: 0,
  lastCalculated: new Date().toISOString()
});

const getDefaultAdaptiveSettings = (): AdaptiveSettings => ({
  currentDifficulty: 50,
  difficultyAdjustmentRate: 5,
  lastDifficultyUpdate: new Date().toISOString(),
  goalGenerationFrequency: 'weekly',
  maxActiveGoals: 5,
  goalComplexityPreference: 50,
  motivationLevel: 75,
  lastMotivationUpdate: new Date().toISOString(),
  responsiveToStreaks: true,
  responsiveToFailures: true
});

// Initial state
const initialState: AppState = {
  workoutHistory: [],
  currentWorkout: null,
  userStats: getDefaultUserStats(),
  exerciseHistory: {},
  achievements: [],
  quests: [],
  characterCollection: [],
  restDays: [],
  loading: false,
  error: null,
  
  // Segmentation state
  availableSegments: Object.keys(SEGMENT_CONFIGS) as FitnessSegment[],
  segmentationLoaded: false,
  surveyInProgress: false,
  
  // Personalization state
  personalizedExperience: false,
  adaptiveGoalsEnabled: false
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_USER_STATS':
      return { 
        ...state, 
        userStats: action.payload,
        personalizedExperience: !!action.payload.segmentProfile,
        adaptiveGoalsEnabled: action.payload.personalizedGoals.length > 0
      };
      
    case 'UPDATE_USER_STATS':
      const updatedStats = { ...state.userStats, ...action.payload };
      return { 
        ...state, 
        userStats: updatedStats,
        personalizedExperience: !!updatedStats.segmentProfile,
        adaptiveGoalsEnabled: updatedStats.personalizedGoals.length > 0
      };
      
    case 'ADD_WORKOUT':
      const newWorkoutHistory = [...state.workoutHistory, action.payload];
      return { 
        ...state, 
        workoutHistory: newWorkoutHistory,
        currentWorkout: null
      };
      
    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workoutHistory: state.workoutHistory.map(w => 
          w.id === action.payload.id ? action.payload : w
        )
      };
      
    case 'DELETE_WORKOUT':
      return {
        ...state,
        workoutHistory: state.workoutHistory.filter(w => w.id !== action.payload)
      };
      
    case 'SET_CURRENT_WORKOUT':
      return { ...state, currentWorkout: action.payload };
      
    case 'ADD_REST_DAY':
      return {
        ...state,
        restDays: [...state.restDays, action.payload]
      };
      
    case 'UPDATE_REST_DAY':
      return {
        ...state,
        restDays: state.restDays.map(rd => 
          rd.id === action.payload.id ? action.payload : rd
        )
      };
      
    case 'REMOVE_REST_DAY':
      return {
        ...state,
        restDays: state.restDays.filter(rd => rd.id !== action.payload)
      };
      
    // NEW: Segmentation actions
    case 'START_SURVEY':
      return {
        ...state,
        surveyInProgress: true,
        userStats: {
          ...state.userStats,
          onboardingStep: 'survey'
        }
      };
      
    case 'COMPLETE_SURVEY':
      return {
        ...state,
        surveyInProgress: false,
        userStats: {
          ...state.userStats,
          surveyHistory: [...state.userStats.surveyHistory, action.payload],
          onboardingStep: 'results'
        }
      };
      
    case 'UPDATE_SEGMENT_PROFILE':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          segmentProfile: action.payload
        },
        personalizedExperience: true
      };
      
    case 'UPDATE_SEGMENT_PREFERENCES':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          segmentPreferences: action.payload
        }
      };
      
    case 'UPDATE_SEGMENT_METRICS':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          segmentMetrics: action.payload
        }
      };
      
    case 'SET_SEGMENTATION_LOADED':
      return {
        ...state,
        segmentationLoaded: action.payload
      };
      
    // NEW: Goal management actions
    case 'ADD_PERSONALIZED_GOAL':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          personalizedGoals: [...state.userStats.personalizedGoals, action.payload]
        },
        adaptiveGoalsEnabled: true
      };
      
    case 'UPDATE_PERSONALIZED_GOAL':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          personalizedGoals: state.userStats.personalizedGoals.map(goal =>
            goal.id === action.payload.id ? action.payload : goal
          )
        }
      };
      
    case 'COMPLETE_GOAL':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          personalizedGoals: state.userStats.personalizedGoals.map(goal =>
            goal.id === action.payload 
              ? { ...goal, completedAt: new Date().toISOString(), isActive: false }
              : goal
          )
        }
      };
      
    case 'REMOVE_GOAL':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          personalizedGoals: state.userStats.personalizedGoals.filter(
            goal => goal.id !== action.payload
          )
        }
      };
      
    case 'GENERATE_NEW_GOALS':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          personalizedGoals: [
            ...state.userStats.personalizedGoals.filter(g => !g.isActive),
            ...action.payload
          ]
        }
      };
      
    // NEW: Onboarding actions
    case 'SET_ONBOARDING_STEP':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          onboardingStep: action.payload
        }
      };
      
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        userStats: {
          ...state.userStats,
          onboardingCompleted: true,
          onboardingStep: 'completed'
        },
        personalizedExperience: true
      };
      
    case 'SET_DEMO_MODE':
      if (action.payload) {
        return {
          ...state,
          userStats: getDemoUserStats(),
          workoutHistory: getDemoWorkoutHistory(),
          personalizedExperience: true,
          adaptiveGoalsEnabled: true
        };
      }
      return {
        ...state,
        userStats: getDefaultUserStats(),
        workoutHistory: [],
        personalizedExperience: false,
        adaptiveGoalsEnabled: false
      };
      
    default:
      return state;
  }
};

// Demo data with segmentation
const getDemoUserStats = (): EnhancedUserStats => ({
  level: 15,
  experience: 2340,
  selectedClass: 'powerlifter',
  classLevel: 8,
  classExperience: 1200,
  currencies: { gems: 250 },
  characterCollection: ['rookie_gymmy', 'power_gymmy', 'coach_gymmy'],
  achievements: ['first_workout', 'week_streak', 'pr_achieved'],
  quests: ['daily_movement', 'weekly_strength'],
  
  // Demo segmentation data
  segmentProfile: {
    primarySegment: 'strength_seeker',
    secondarySegment: 'habit_builder',
    segmentStrength: 85,
    segmentHistory: [{
      fromSegment: null,
      toSegment: 'strength_seeker',
      transitionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'onboarding',
      confidence: 85
    }],
    lastSegmentUpdate: new Date().toISOString(),
    onboardingCompleted: true
  },
  
  surveyHistory: [{
    id: 'demo_survey',
    responses: [],
    calculatedSegments: {
      strength_seeker: 85,
      calorie_crusher: 30,
      body_optimizer: 45,
      wellness_seeker: 20,
      endurance_athlete: 25,
      habit_builder: 60,
      social_enthusiast: 35,
      unassigned: 0
    },
    recommendedSegment: 'strength_seeker',
    confidence: 85,
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    version: '1.0.0'
  }],
  
  segmentPreferences: {
    preferredMetrics: ['weight_lifted', 'one_rep_max', 'total_volume'],
    goalTimeframe: 'weekly',
    difficultyPreference: 'challenging',
    celebrationStyle: 'enthusiastic',
    reminderFrequency: 'daily',
    socialSharing: true,
    dashboardFocus: 'progress',
    chartTypes: ['line', 'bar'],
    gymmyPersonality: 'coaching'
  },
  
  segmentMetrics: {
    dailyActiveRate: 0.8,
    weeklyRetentionRate: 0.95,
    goalCompletionRate: 0.7,
    featureUsageRates: {
      workout_tracking: 0.9,
      goal_setting: 0.8,
      progress_charts: 0.6
    },
    satisfactionScore: 4.5,
    averageProgressRate: 0.15,
    milestoneHitRate: 0.6,
    consistencyScore: 0.85,
    lastCalculated: new Date().toISOString()
  },
  
  personalizedGoals: getDemoPersonalizedGoals(),
  adaptiveSettings: getDefaultAdaptiveSettings(),
  
  onboardingCompleted: true,
  onboardingStep: 'completed'
});

const getDemoPersonalizedGoals = (): PersonalizedGoal[] => [
  {
    id: 'demo_goal_1',
    segment: 'strength_seeker',
    title: 'Increase Squat by 10 lbs',
    description: 'Progressive overload for strength gains',
    targetValue: 10,
    currentValue: 5,
    unit: 'lbs',
    timeframe: 'monthly',
    priority: 'high',
    category: 'strength',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'demo_goal_2',
    segment: 'strength_seeker',
    title: 'Perfect Deadlift Form',
    description: 'Focus on technique and movement quality',
    targetValue: 1,
    currentValue: 0,
    unit: 'milestone',
    timeframe: 'weekly',
    priority: 'medium',
    category: 'technique',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
];

const getDemoWorkoutHistory = () => [
  // Existing demo workouts would remain the same
  // This is just to show the integration point
];

// Context
interface AppContextType {
  state: AppState;
  
  // Existing methods
  updateUserStats: (stats: Partial<EnhancedUserStats>) => Promise<void>;
  addWorkout: (workout: any) => Promise<void>;
  updateWorkout: (workout: any) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  startWorkout: () => void;
  completeWorkout: (workout: any) => Promise<void>;
  addRestDay: (date: string, notes?: string) => Promise<void>;
  updateRestDay: (restDay: RestDay) => Promise<void>;
  removeRestDay: (restDayId: string) => Promise<void>;
  setDemoMode: (enabled: boolean) => Promise<void>;
  
  // NEW: Segmentation methods
  startOnboardingSurvey: () => void;
  completeSurvey: (surveyData: OnboardingSurvey) => Promise<void>;
  updateSegmentProfile: (profile: SegmentProfile) => Promise<void>;
  updateSegmentPreferences: (preferences: SegmentPreferences) => Promise<void>;
  updateSegmentMetrics: (metrics: SegmentMetrics) => Promise<void>;
  
  // NEW: Goal management methods
  addPersonalizedGoal: (goal: PersonalizedGoal) => Promise<void>;
  updatePersonalizedGoal: (goal: PersonalizedGoal) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  removeGoal: (goalId: string) => Promise<void>;
  generateNewGoals: () => Promise<void>;
  
  // NEW: Onboarding methods
  setOnboardingStep: (step: 'welcome' | 'survey' | 'results' | 'completed') => void;
  completeOnboarding: () => Promise<void>;
  
  // NEW: Utility methods
  getCurrentSegment: () => FitnessSegment | null;
  getSegmentConfig: () => any | null;
  isOnboardingComplete: () => boolean;
  shouldShowOnboarding: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on app start
  useEffect(() => {
    loadAppData();
  }, []);

  // Save data when state changes
  useEffect(() => {
    if (state.segmentationLoaded) {
      saveAppData();
    }
  }, [state.userStats, state.workoutHistory, state.restDays]);

  const loadAppData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [userStatsData, workoutHistoryData, restDaysData] = await Promise.all([
        AsyncStorage.getItem('userStats'),
        AsyncStorage.getItem('workoutHistory'),
        AsyncStorage.getItem('restDays')
      ]);

      if (userStatsData) {
        const parsedStats = JSON.parse(userStatsData);
        
        // Ensure backward compatibility
        const enhancedStats: EnhancedUserStats = {
          ...getDefaultUserStats(),
          ...parsedStats,
          // Ensure new properties exist
          surveyHistory: parsedStats.surveyHistory || [],
          personalizedGoals: parsedStats.personalizedGoals || [],
          onboardingCompleted: parsedStats.onboardingCompleted || false,
          onboardingStep: parsedStats.onboardingStep || 'welcome'
        };
        
        dispatch({ type: 'SET_USER_STATS', payload: enhancedStats });
      }

      if (workoutHistoryData) {
        const parsedHistory = JSON.parse(workoutHistoryData);
        // Handle workout history loading...
      }

      if (restDaysData) {
        const parsedRestDays = JSON.parse(restDaysData);
        // Handle rest days loading...
      }

      dispatch({ type: 'SET_SEGMENTATION_LOADED', payload: true });
    } catch (error) {
      console.error('Error loading app data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveAppData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('userStats', JSON.stringify(state.userStats)),
        AsyncStorage.setItem('workoutHistory', JSON.stringify(state.workoutHistory)),
        AsyncStorage.setItem('restDays', JSON.stringify(state.restDays))
      ]);
    } catch (error) {
      console.error('Error saving app data:', error);
    }
  };

  // Existing methods (simplified for brevity)
  const updateUserStats = async (stats: Partial<EnhancedUserStats>) => {
    dispatch({ type: 'UPDATE_USER_STATS', payload: stats });
  };

  const addWorkout = async (workout: any) => {
    dispatch({ type: 'ADD_WORKOUT', payload: workout });
  };

  const updateWorkout = async (workout: any) => {
    dispatch({ type: 'UPDATE_WORKOUT', payload: workout });
  };

  const deleteWorkout = async (workoutId: string) => {
    dispatch({ type: 'DELETE_WORKOUT', payload: workoutId });
  };

  const startWorkout = () => {
    dispatch({ type: 'SET_CURRENT_WORKOUT', payload: { id: Date.now().toString(), exercises: [] } });
  };

  const completeWorkout = async (workout: any) => {
    dispatch({ type: 'ADD_WORKOUT', payload: workout });
    
    // NEW: Update segment metrics based on workout
    if (state.userStats.segmentProfile) {
      await updateSegmentMetricsFromWorkout(workout);
    }
    
    // NEW: Generate new goals if needed
    await checkAndGenerateNewGoals();
  };

  const addRestDay = async (date: string, notes?: string) => {
    const restDay: RestDay = {
      id: Date.now().toString(),
      date,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_REST_DAY', payload: restDay });
  };

  const updateRestDay = async (restDay: RestDay) => {
    dispatch({ type: 'UPDATE_REST_DAY', payload: { ...restDay, updatedAt: new Date().toISOString() } });
  };

  const removeRestDay = async (restDayId: string) => {
    dispatch({ type: 'REMOVE_REST_DAY', payload: restDayId });
  };

  const setDemoMode = async (enabled: boolean) => {
    dispatch({ type: 'SET_DEMO_MODE', payload: enabled });
  };

  // NEW: Segmentation methods
  const startOnboardingSurvey = () => {
    dispatch({ type: 'START_SURVEY' });
  };

  const completeSurvey = async (surveyData: OnboardingSurvey) => {
    dispatch({ type: 'COMPLETE_SURVEY', payload: surveyData });
    
    // Generate segment profile from survey
    const segmentResult = SegmentationEngine.determinePrimarySegment(surveyData.calculatedSegments);
    const segmentProfile = SegmentationEngine.createSegmentProfile(
      surveyData,
      segmentResult.primarySegment,
      segmentResult.confidence,
      segmentResult.secondarySegment
    );
    
    // Generate personalized goals
    const personalizedGoals = SegmentationEngine.generatePersonalizedGoals(
      segmentResult.primarySegment,
      state.workoutHistory,
      state.userStats.level
    );
    
    // Update user stats with segmentation data
    const updatedStats: Partial<EnhancedUserStats> = {
      segmentProfile,
      personalizedGoals,
      segmentPreferences: getSegmentPreferences(segmentResult.primarySegment),
      segmentMetrics: getDefaultSegmentMetrics(),
      adaptiveSettings: getDefaultAdaptiveSettings()
    };
    
    await updateUserStats(updatedStats);
  };

  const updateSegmentProfile = async (profile: SegmentProfile) => {
    dispatch({ type: 'UPDATE_SEGMENT_PROFILE', payload: profile });
  };

  const updateSegmentPreferences = async (preferences: SegmentPreferences) => {
    dispatch({ type: 'UPDATE_SEGMENT_PREFERENCES', payload: preferences });
  };

  const updateSegmentMetrics = async (metrics: SegmentMetrics) => {
    dispatch({ type: 'UPDATE_SEGMENT_METRICS', payload: metrics });
  };

  // NEW: Goal management methods
  const addPersonalizedGoal = async (goal: PersonalizedGoal) => {
    dispatch({ type: 'ADD_PERSONALIZED_GOAL', payload: goal });
  };

  const updatePersonalizedGoal = async (goal: PersonalizedGoal) => {
    dispatch({ type: 'UPDATE_PERSONALIZED_GOAL', payload: { ...goal, updatedAt: new Date().toISOString() } });
  };

  const completeGoal = async (goalId: string) => {
    dispatch({ type: 'COMPLETE_GOAL', payload: goalId });
    
    // Celebrate goal completion
    // Could trigger achievement or celebration here
  };

  const removeGoal = async (goalId: string) => {
    dispatch({ type: 'REMOVE_GOAL', payload: goalId });
  };

  const generateNewGoals = async () => {
    if (!state.userStats.segmentProfile) return;
    
    const newGoals = SegmentationEngine.generatePersonalizedGoals(
      state.userStats.segmentProfile.primarySegment,
      state.workoutHistory,
      state.userStats.level
    );
    
    dispatch({ type: 'GENERATE_NEW_GOALS', payload: newGoals });
  };

  // NEW: Onboarding methods
  const setOnboardingStep = (step: 'welcome' | 'survey' | 'results' | 'completed') => {
    dispatch({ type: 'SET_ONBOARDING_STEP', payload: step });
  };

  const completeOnboarding = async () => {
    dispatch({ type: 'COMPLETE_ONBOARDING', payload: null });
  };

  // NEW: Utility methods
  const getCurrentSegment = (): FitnessSegment | null => {
    return state.userStats.segmentProfile?.primarySegment || null;
  };

  const getSegmentConfig = () => {
    const segment = getCurrentSegment();
    return segment ? SEGMENT_CONFIGS[segment] : null;
  };

  const isOnboardingComplete = (): boolean => {
    return state.userStats.onboardingCompleted;
  };

  const shouldShowOnboarding = (): boolean => {
    return !state.userStats.onboardingCompleted || state.userStats.onboardingStep !== 'completed';
  };

  // Helper methods
  const getSegmentPreferences = (segment: FitnessSegment): SegmentPreferences => {
    const config = SEGMENT_CONFIGS[segment];
    return {
      ...getDefaultSegmentPreferences(),
      preferredMetrics: config.primaryMetrics,
      celebrationStyle: config.celebrationStyle,
      gymmyPersonality: config.gymmyPersonality,
      dashboardFocus: segment === 'social_enthusiast' ? 'social' : 
                      segment === 'body_optimizer' ? 'progress' : 
                      segment === 'endurance_athlete' ? 'analytics' : 'progress'
    };
  };

  const updateSegmentMetricsFromWorkout = async (workout: any) => {
    // Update metrics based on workout completion
    // This could analyze workout quality, consistency, etc.
  };

  const checkAndGenerateNewGoals = async () => {
    // Check if user needs new goals and generate them
    const activeGoals = state.userStats.personalizedGoals.filter(g => g.isActive);
    if (activeGoals.length < 3) {
      await generateNewGoals();
    }
  };

  const contextValue: AppContextType = {
    state,
    
    // Existing methods
    updateUserStats,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    startWorkout,
    completeWorkout,
    addRestDay,
    updateRestDay,
    removeRestDay,
    setDemoMode,
    
    // NEW: Segmentation methods
    startOnboardingSurvey,
    completeSurvey,
    updateSegmentProfile,
    updateSegmentPreferences,
    updateSegmentMetrics,
    
    // NEW: Goal management methods
    addPersonalizedGoal,
    updatePersonalizedGoal,
    completeGoal,
    removeGoal,
    generateNewGoals,
    
    // NEW: Onboarding methods
    setOnboardingStep,
    completeOnboarding,
    
    // NEW: Utility methods
    getCurrentSegment,
    getSegmentConfig,
    isOnboardingComplete,
    shouldShowOnboarding
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Export types for use in other components
export type { 
  AppState, 
  EnhancedUserStats, 
  RestDay,
  AppContextType 
};