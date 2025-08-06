// src/context/contexts/SegmentationContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import StorageManager from '../../utils/StorageManager';
import { SegmentationEngine } from '../SegmentationEngine';
import {
  FitnessSegment,
  SegmentProfile,
  OnboardingSurvey,
  PersonalizedGoal,
  SegmentPreferences,
  SegmentMetrics,
  AdaptiveSettings,
  SurveyResponse,
} from '../segmentationTypes';

interface SegmentationState {
  availableSegments: FitnessSegment[];
  segmentationLoaded: boolean;
  surveyInProgress: boolean;
  personalizedExperience: boolean;
  adaptiveGoalsEnabled: boolean;
  currentSegment: FitnessSegment | null;
  segmentProfile: SegmentProfile | null;
  surveyHistory: OnboardingSurvey[];
  personalizedGoals: PersonalizedGoal[];
  segmentPreferences: SegmentPreferences | null;
  segmentMetrics: SegmentMetrics | null;
  adaptiveSettings: AdaptiveSettings | null;
  onboardingCompleted: boolean;
  onboardingStep: string;
  loading: boolean;
  error: string | null;
}

interface SegmentationContextValue {
  // State
  availableSegments: FitnessSegment[];
  segmentationLoaded: boolean;
  surveyInProgress: boolean;
  personalizedExperience: boolean;
  adaptiveGoalsEnabled: boolean;
  currentSegment: FitnessSegment | null;
  segmentProfile: SegmentProfile | null;
  surveyHistory: OnboardingSurvey[];
  personalizedGoals: PersonalizedGoal[];
  segmentPreferences: SegmentPreferences | null;
  segmentMetrics: SegmentMetrics | null;
  adaptiveSettings: AdaptiveSettings | null;
  onboardingCompleted: boolean;
  onboardingStep: string;
  loading: boolean;
  error: string | null;

  // Survey Actions
  startSurvey: () => Promise<void>;
  submitSurveyResponse: (
    questionId: string,
    responses: SurveyResponse[]
  ) => Promise<void>;
  completeSurvey: (
    responses: Record<string, SurveyResponse[]>
  ) => Promise<void>;
  retakeSurvey: () => Promise<void>;

  // Segmentation Actions
  updateSegmentProfile: (updates: Partial<SegmentProfile>) => Promise<void>;
  switchSegment: (segment: FitnessSegment) => Promise<void>;
  analyzeWorkoutBehavior: (workoutHistory: any[]) => Promise<void>;

  // Goal Actions
  generatePersonalizedGoals: (
    segment: FitnessSegment,
    userHistory: any[],
    level: number
  ) => Promise<void>;
  updatePersonalizedGoal: (
    goalId: string,
    updates: Partial<PersonalizedGoal>
  ) => Promise<void>;
  completePersonalizedGoal: (goalId: string) => Promise<void>;

  // Preferences Actions
  updateSegmentPreferences: (
    updates: Partial<SegmentPreferences>
  ) => Promise<void>;
  updateAdaptiveSettings: (updates: Partial<AdaptiveSettings>) => Promise<void>;

  // Onboarding Actions
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;

  // Analytics Actions
  trackSegmentMetric: (metric: string, value: number) => Promise<void>;
  getSegmentInsights: () => any;
  getPersonalizationEffectiveness: () => any;

  // Utility Actions
  getCurrentSegment: () => FitnessSegment | null;
  getSegmentConfig: (segment?: FitnessSegment) => any;
  clearSegmentationData: () => Promise<void>;
  loadDemoSegmentation: () => Promise<void>;
}

type SegmentationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AVAILABLE_SEGMENTS'; payload: FitnessSegment[] }
  | { type: 'SET_SEGMENTATION_LOADED'; payload: boolean }
  | { type: 'SET_SURVEY_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_PERSONALIZED_EXPERIENCE'; payload: boolean }
  | { type: 'SET_ADAPTIVE_GOALS_ENABLED'; payload: boolean }
  | { type: 'SET_CURRENT_SEGMENT'; payload: FitnessSegment | null }
  | { type: 'SET_SEGMENT_PROFILE'; payload: SegmentProfile | null }
  | { type: 'UPDATE_SEGMENT_PROFILE'; payload: Partial<SegmentProfile> }
  | { type: 'SET_SURVEY_HISTORY'; payload: OnboardingSurvey[] }
  | { type: 'ADD_SURVEY_RESPONSE'; payload: OnboardingSurvey }
  | { type: 'SET_PERSONALIZED_GOALS'; payload: PersonalizedGoal[] }
  | {
      type: 'UPDATE_PERSONALIZED_GOAL';
      payload: { goalId: string; updates: Partial<PersonalizedGoal> };
    }
  | { type: 'SET_SEGMENT_PREFERENCES'; payload: SegmentPreferences | null }
  | { type: 'UPDATE_SEGMENT_PREFERENCES'; payload: Partial<SegmentPreferences> }
  | { type: 'SET_SEGMENT_METRICS'; payload: SegmentMetrics | null }
  | { type: 'UPDATE_SEGMENT_METRICS'; payload: Partial<SegmentMetrics> }
  | { type: 'SET_ADAPTIVE_SETTINGS'; payload: AdaptiveSettings | null }
  | { type: 'UPDATE_ADAPTIVE_SETTINGS'; payload: Partial<AdaptiveSettings> }
  | { type: 'SET_ONBOARDING_COMPLETED'; payload: boolean }
  | { type: 'SET_ONBOARDING_STEP'; payload: string };

const initialSegmentationState: SegmentationState = {
  availableSegments: [
    'strength_seeker',
    'calorie_crusher',
    'body_optimizer',
    'wellness_seeker',
    'endurance_athlete',
    'habit_builder',
    'social_enthusiast',
  ],
  segmentationLoaded: false,
  surveyInProgress: false,
  personalizedExperience: false,
  adaptiveGoalsEnabled: true,
  currentSegment: null,
  segmentProfile: null,
  surveyHistory: [],
  personalizedGoals: [],
  segmentPreferences: null,
  segmentMetrics: null,
  adaptiveSettings: null,
  onboardingCompleted: false,
  onboardingStep: 'welcome',
  loading: false,
  error: null,
};

const segmentationReducer = (
  state: SegmentationState,
  action: SegmentationAction
): SegmentationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AVAILABLE_SEGMENTS':
      return { ...state, availableSegments: action.payload };
    case 'SET_SEGMENTATION_LOADED':
      return { ...state, segmentationLoaded: action.payload };
    case 'SET_SURVEY_IN_PROGRESS':
      return { ...state, surveyInProgress: action.payload };
    case 'SET_PERSONALIZED_EXPERIENCE':
      return { ...state, personalizedExperience: action.payload };
    case 'SET_ADAPTIVE_GOALS_ENABLED':
      return { ...state, adaptiveGoalsEnabled: action.payload };
    case 'SET_CURRENT_SEGMENT':
      return { ...state, currentSegment: action.payload };
    case 'SET_SEGMENT_PROFILE':
      return { ...state, segmentProfile: action.payload };
    case 'UPDATE_SEGMENT_PROFILE':
      return {
        ...state,
        segmentProfile: state.segmentProfile
          ? { ...state.segmentProfile, ...action.payload }
          : null,
      };
    case 'SET_SURVEY_HISTORY':
      return { ...state, surveyHistory: action.payload };
    case 'ADD_SURVEY_RESPONSE':
      return {
        ...state,
        surveyHistory: [...state.surveyHistory, action.payload],
      };
    case 'SET_PERSONALIZED_GOALS':
      return { ...state, personalizedGoals: action.payload };
    case 'UPDATE_PERSONALIZED_GOAL':
      return {
        ...state,
        personalizedGoals: state.personalizedGoals.map(goal =>
          goal.id === action.payload.goalId
            ? { ...goal, ...action.payload.updates }
            : goal
        ),
      };
    case 'SET_SEGMENT_PREFERENCES':
      return { ...state, segmentPreferences: action.payload };
    case 'UPDATE_SEGMENT_PREFERENCES':
      return {
        ...state,
        segmentPreferences: state.segmentPreferences
          ? { ...state.segmentPreferences, ...action.payload }
          : null,
      };
    case 'SET_SEGMENT_METRICS':
      return { ...state, segmentMetrics: action.payload };
    case 'UPDATE_SEGMENT_METRICS':
      return {
        ...state,
        segmentMetrics: state.segmentMetrics
          ? { ...state.segmentMetrics, ...action.payload }
          : null,
      };
    case 'SET_ADAPTIVE_SETTINGS':
      return { ...state, adaptiveSettings: action.payload };
    case 'UPDATE_ADAPTIVE_SETTINGS':
      return {
        ...state,
        adaptiveSettings: state.adaptiveSettings
          ? { ...state.adaptiveSettings, ...action.payload }
          : null,
      };
    case 'SET_ONBOARDING_COMPLETED':
      return { ...state, onboardingCompleted: action.payload };
    case 'SET_ONBOARDING_STEP':
      return { ...state, onboardingStep: action.payload };
    default:
      return state;
  }
};

const SegmentationContext = createContext<SegmentationContextValue | undefined>(
  undefined
);

interface SegmentationProviderProps {
  children: ReactNode;
}

export const SegmentationProvider: React.FC<SegmentationProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    segmentationReducer,
    initialSegmentationState
  );

  // Load segmentation data on mount
  React.useEffect(() => {
    const loadSegmentationData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [
          segmentProfile,
          surveyHistory,
          personalizedGoals,
          segmentPreferences,
          segmentMetrics,
          adaptiveSettings,
          onboardingCompleted,
        ] = await Promise.all([
          StorageManager.getSegmentProfile(),
          StorageManager.getSurveyHistory(),
          StorageManager.getPersonalizedGoals(),
          StorageManager.getSegmentPreferences(),
          StorageManager.getSegmentMetrics(),
          StorageManager.getAdaptiveSettings(),
          StorageManager.getOnboardingStatus(),
        ]);

        if (segmentProfile) {
          dispatch({ type: 'SET_SEGMENT_PROFILE', payload: segmentProfile });
          dispatch({
            type: 'SET_CURRENT_SEGMENT',
            payload: segmentProfile.primarySegment,
          });
          dispatch({ type: 'SET_PERSONALIZED_EXPERIENCE', payload: true });
        }

        dispatch({ type: 'SET_SURVEY_HISTORY', payload: surveyHistory || [] });
        dispatch({
          type: 'SET_PERSONALIZED_GOALS',
          payload: personalizedGoals || [],
        });
        dispatch({
          type: 'SET_SEGMENT_PREFERENCES',
          payload: segmentPreferences,
        });
        dispatch({ type: 'SET_SEGMENT_METRICS', payload: segmentMetrics });
        dispatch({ type: 'SET_ADAPTIVE_SETTINGS', payload: adaptiveSettings });
        dispatch({
          type: 'SET_ONBOARDING_COMPLETED',
          payload: onboardingCompleted || false,
        });
        dispatch({ type: 'SET_SEGMENTATION_LOADED', payload: true });
      } catch (error) {
        console.error('Error loading segmentation data:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load segmentation data',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadSegmentationData();
  }, []);

  const startSurvey = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SURVEY_IN_PROGRESS', payload: true });
      dispatch({ type: 'SET_ONBOARDING_STEP', payload: 'survey' });
    } catch (error) {
      console.error('Error starting survey:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start survey' });
    }
  }, []);

  const submitSurveyResponse = useCallback(
    async (questionId: string, responses: SurveyResponse[]) => {
      try {
        // This would typically update the current survey state
        console.log(`Survey response for ${questionId}:`, responses);
      } catch (error) {
        console.error('Error submitting survey response:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to submit survey response',
        });
      }
    },
    []
  );

  const completeSurvey = useCallback(
    async (responses: Record<string, SurveyResponse[]>) => {
      try {
        // Calculate segment scores and determine primary segment
        const allResponses = Object.values(responses).flat();
        const segmentScores =
          SegmentationEngine.calculateSegmentScores(allResponses);
        const segmentResult =
          SegmentationEngine.determinePrimarySegment(segmentScores);

        // Create survey record
        const survey: OnboardingSurvey = {
          id: Date.now().toString(),
          responses: allResponses,
          completedAt: new Date().toISOString(),
          segmentScores,
          primarySegment: segmentResult.segment,
          confidence: segmentResult.confidence,
        };

        // Create segment profile
        const segmentProfile = SegmentationEngine.createSegmentProfile(
          survey,
          segmentResult.segment,
          segmentResult.confidence
        );

        // Generate personalized goals
        const personalizedGoals = SegmentationEngine.generatePersonalizedGoals(
          segmentResult.segment,
          [], // User history would be passed here
          1 // User level would be passed here
        );

        dispatch({ type: 'ADD_SURVEY_RESPONSE', payload: survey });
        dispatch({ type: 'SET_SEGMENT_PROFILE', payload: segmentProfile });
        dispatch({
          type: 'SET_CURRENT_SEGMENT',
          payload: segmentResult.segment,
        });
        dispatch({
          type: 'SET_PERSONALIZED_GOALS',
          payload: personalizedGoals,
        });
        dispatch({ type: 'SET_PERSONALIZED_EXPERIENCE', payload: true });
        dispatch({ type: 'SET_SURVEY_IN_PROGRESS', payload: false });
        dispatch({ type: 'SET_ONBOARDING_STEP', payload: 'results' });

        // Save to storage
        await Promise.all([
          StorageManager.saveSurveyHistory([...state.surveyHistory, survey]),
          StorageManager.saveSegmentProfile(segmentProfile),
          StorageManager.savePersonalizedGoals(personalizedGoals),
        ]);
      } catch (error) {
        console.error('Error completing survey:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to complete survey' });
      }
    },
    [state.surveyHistory]
  );

  const retakeSurvey = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SURVEY_IN_PROGRESS', payload: true });
      dispatch({ type: 'SET_ONBOARDING_STEP', payload: 'survey' });
    } catch (error) {
      console.error('Error retaking survey:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to retake survey' });
    }
  }, []);

  const updateSegmentProfile = useCallback(
    async (updates: Partial<SegmentProfile>) => {
      try {
        dispatch({ type: 'UPDATE_SEGMENT_PROFILE', payload: updates });
        if (state.segmentProfile) {
          const updatedProfile = { ...state.segmentProfile, ...updates };
          await StorageManager.saveSegmentProfile(updatedProfile);
        }
      } catch (error) {
        console.error('Error updating segment profile:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update segment profile',
        });
      }
    },
    [state.segmentProfile]
  );

  const switchSegment = useCallback(
    async (segment: FitnessSegment) => {
      try {
        dispatch({ type: 'SET_CURRENT_SEGMENT', payload: segment });

        if (state.segmentProfile) {
          const updates = {
            primarySegment: segment,
            lastUpdated: new Date().toISOString(),
          };
          await updateSegmentProfile(updates);
        }
      } catch (error) {
        console.error('Error switching segment:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to switch segment' });
      }
    },
    [state.segmentProfile, updateSegmentProfile]
  );

  const analyzeWorkoutBehavior = useCallback(
    async (workoutHistory: any[]) => {
      try {
        if (!state.currentSegment) return;

        const analysis = SegmentationEngine.analyzeBehaviorForSegmentAdjustment(
          state.currentSegment,
          workoutHistory
        );

        // Update segment metrics based on analysis
        const metricsUpdate = {
          lastAnalysis: new Date().toISOString(),
          workoutAlignment: analysis.alignmentScore,
          behaviorTrends: analysis.trends,
        };

        dispatch({ type: 'UPDATE_SEGMENT_METRICS', payload: metricsUpdate });
      } catch (error) {
        console.error('Error analyzing workout behavior:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to analyze workout behavior',
        });
      }
    },
    [state.currentSegment]
  );

  const generatePersonalizedGoals = useCallback(
    async (segment: FitnessSegment, userHistory: any[], level: number) => {
      try {
        const goals = SegmentationEngine.generatePersonalizedGoals(
          segment,
          userHistory,
          level
        );
        dispatch({ type: 'SET_PERSONALIZED_GOALS', payload: goals });
        await StorageManager.savePersonalizedGoals(goals);
      } catch (error) {
        console.error('Error generating personalized goals:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to generate personalized goals',
        });
      }
    },
    []
  );

  const updatePersonalizedGoal = useCallback(
    async (goalId: string, updates: Partial<PersonalizedGoal>) => {
      try {
        dispatch({
          type: 'UPDATE_PERSONALIZED_GOAL',
          payload: { goalId, updates },
        });
        await StorageManager.savePersonalizedGoals(state.personalizedGoals);
      } catch (error) {
        console.error('Error updating personalized goal:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update personalized goal',
        });
      }
    },
    [state.personalizedGoals]
  );

  const completePersonalizedGoal = useCallback(
    async (goalId: string) => {
      try {
        const updates = {
          completed: true,
          completedAt: new Date().toISOString(),
        };
        await updatePersonalizedGoal(goalId, updates);
      } catch (error) {
        console.error('Error completing personalized goal:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to complete personalized goal',
        });
      }
    },
    [updatePersonalizedGoal]
  );

  const updateSegmentPreferences = useCallback(
    async (updates: Partial<SegmentPreferences>) => {
      try {
        dispatch({ type: 'UPDATE_SEGMENT_PREFERENCES', payload: updates });
        const updatedPreferences = state.segmentPreferences
          ? { ...state.segmentPreferences, ...updates }
          : (updates as SegmentPreferences);
        await StorageManager.saveSegmentPreferences(updatedPreferences);
      } catch (error) {
        console.error('Error updating segment preferences:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update segment preferences',
        });
      }
    },
    [state.segmentPreferences]
  );

  const updateAdaptiveSettings = useCallback(
    async (updates: Partial<AdaptiveSettings>) => {
      try {
        dispatch({ type: 'UPDATE_ADAPTIVE_SETTINGS', payload: updates });
        const updatedSettings = state.adaptiveSettings
          ? { ...state.adaptiveSettings, ...updates }
          : (updates as AdaptiveSettings);
        await StorageManager.saveAdaptiveSettings(updatedSettings);
      } catch (error) {
        console.error('Error updating adaptive settings:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update adaptive settings',
        });
      }
    },
    [state.adaptiveSettings]
  );

  const completeOnboarding = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: true });
      dispatch({ type: 'SET_ONBOARDING_STEP', payload: 'completed' });
      await StorageManager.saveOnboardingStatus(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete onboarding' });
    }
  }, []);

  const skipOnboarding = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: true });
      dispatch({ type: 'SET_ONBOARDING_STEP', payload: 'skipped' });
      await StorageManager.saveOnboardingStatus(true);
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to skip onboarding' });
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: false });
      dispatch({ type: 'SET_ONBOARDING_STEP', payload: 'welcome' });
      dispatch({ type: 'SET_PERSONALIZED_EXPERIENCE', payload: false });
      dispatch({ type: 'SET_CURRENT_SEGMENT', payload: null });
      dispatch({ type: 'SET_SEGMENT_PROFILE', payload: null });

      await Promise.all([
        StorageManager.saveOnboardingStatus(false),
        StorageManager.clearSegmentProfile(),
        StorageManager.clearPersonalizedGoals(),
      ]);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset onboarding' });
    }
  }, []);

  const trackSegmentMetric = useCallback(
    async (metric: string, value: number) => {
      try {
        const metricsUpdate = {
          [metric]: value,
          lastTracked: new Date().toISOString(),
        };

        dispatch({ type: 'UPDATE_SEGMENT_METRICS', payload: metricsUpdate });
      } catch (error) {
        console.error('Error tracking segment metric:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to track segment metric',
        });
      }
    },
    []
  );

  const getSegmentInsights = useCallback(() => {
    if (!state.segmentProfile || !state.segmentMetrics) return null;

    return {
      segment: state.segmentProfile.primarySegment,
      confidence: state.segmentProfile.confidence,
      goalsCompleted: state.personalizedGoals.filter(g => g.completed).length,
      totalGoals: state.personalizedGoals.length,
      engagementScore: state.segmentMetrics.workoutAlignment || 0,
    };
  }, [state.segmentProfile, state.segmentMetrics, state.personalizedGoals]);

  const getPersonalizationEffectiveness = useCallback(() => {
    if (!state.segmentProfile || !state.segmentMetrics) return null;

    return {
      personalizationActive: state.personalizedExperience,
      segmentMatch: state.segmentProfile.confidence,
      goalCompletionRate:
        state.personalizedGoals.length > 0
          ? state.personalizedGoals.filter(g => g.completed).length /
            state.personalizedGoals.length
          : 0,
      userSatisfaction: state.segmentMetrics.userSatisfaction || 0,
    };
  }, [
    state.segmentProfile,
    state.segmentMetrics,
    state.personalizedGoals,
    state.personalizedExperience,
  ]);

  const getCurrentSegment = useCallback((): FitnessSegment | null => {
    return state.currentSegment;
  }, [state.currentSegment]);

  const getSegmentConfig = useCallback(
    (segment?: FitnessSegment) => {
      const targetSegment = segment || state.currentSegment;
      if (!targetSegment) return null;

      // This would typically return the segment configuration from a constants file
      return SegmentationEngine.getSegmentConfig(targetSegment);
    },
    [state.currentSegment]
  );

  const clearSegmentationData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CURRENT_SEGMENT', payload: null });
      dispatch({ type: 'SET_SEGMENT_PROFILE', payload: null });
      dispatch({ type: 'SET_SURVEY_HISTORY', payload: [] });
      dispatch({ type: 'SET_PERSONALIZED_GOALS', payload: [] });
      dispatch({ type: 'SET_SEGMENT_PREFERENCES', payload: null });
      dispatch({ type: 'SET_SEGMENT_METRICS', payload: null });
      dispatch({ type: 'SET_ADAPTIVE_SETTINGS', payload: null });
      dispatch({ type: 'SET_PERSONALIZED_EXPERIENCE', payload: false });
      dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: false });
      dispatch({ type: 'SET_ONBOARDING_STEP', payload: 'welcome' });

      await Promise.all([
        StorageManager.clearSegmentProfile(),
        StorageManager.clearSurveyHistory(),
        StorageManager.clearPersonalizedGoals(),
        StorageManager.clearSegmentPreferences(),
        StorageManager.clearSegmentMetrics(),
        StorageManager.clearAdaptiveSettings(),
        StorageManager.saveOnboardingStatus(false),
      ]);
    } catch (error) {
      console.error('Error clearing segmentation data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to clear segmentation data',
      });
    }
  }, []);

  const loadDemoSegmentation = useCallback(async () => {
    try {
      const demoSegment: FitnessSegment = 'strength_seeker';
      const demoProfile: SegmentProfile = {
        primarySegment: demoSegment,
        confidence: 85,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        characteristics: {
          primaryMotivation: 'strength_gains',
          preferredWorkouts: ['strength_training', 'powerlifting'],
          fitnessExperience: 'intermediate',
          availableTime: 'moderate',
        },
      };

      dispatch({ type: 'SET_CURRENT_SEGMENT', payload: demoSegment });
      dispatch({ type: 'SET_SEGMENT_PROFILE', payload: demoProfile });
      dispatch({ type: 'SET_PERSONALIZED_EXPERIENCE', payload: true });
      dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: true });

      await Promise.all([
        StorageManager.saveSegmentProfile(demoProfile),
        StorageManager.saveOnboardingStatus(true),
      ]);
    } catch (error) {
      console.error('Error loading demo segmentation:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load demo segmentation',
      });
    }
  }, []);

  const value: SegmentationContextValue = {
    // State
    availableSegments: state.availableSegments,
    segmentationLoaded: state.segmentationLoaded,
    surveyInProgress: state.surveyInProgress,
    personalizedExperience: state.personalizedExperience,
    adaptiveGoalsEnabled: state.adaptiveGoalsEnabled,
    currentSegment: state.currentSegment,
    segmentProfile: state.segmentProfile,
    surveyHistory: state.surveyHistory,
    personalizedGoals: state.personalizedGoals,
    segmentPreferences: state.segmentPreferences,
    segmentMetrics: state.segmentMetrics,
    adaptiveSettings: state.adaptiveSettings,
    onboardingCompleted: state.onboardingCompleted,
    onboardingStep: state.onboardingStep,
    loading: state.loading,
    error: state.error,

    // Survey Actions
    startSurvey,
    submitSurveyResponse,
    completeSurvey,
    retakeSurvey,

    // Segmentation Actions
    updateSegmentProfile,
    switchSegment,
    analyzeWorkoutBehavior,

    // Goal Actions
    generatePersonalizedGoals,
    updatePersonalizedGoal,
    completePersonalizedGoal,

    // Preferences Actions
    updateSegmentPreferences,
    updateAdaptiveSettings,

    // Onboarding Actions
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,

    // Analytics Actions
    trackSegmentMetric,
    getSegmentInsights,
    getPersonalizationEffectiveness,

    // Utility Actions
    getCurrentSegment,
    getSegmentConfig,
    clearSegmentationData,
    loadDemoSegmentation,
  };

  return (
    <SegmentationContext.Provider value={value}>
      {children}
    </SegmentationContext.Provider>
  );
};

export const useSegmentation = (): SegmentationContextValue => {
  const context = useContext(SegmentationContext);
  if (!context) {
    throw new Error(
      'useSegmentation must be used within a SegmentationProvider'
    );
  }
  return context;
};

export default SegmentationContext;
