// src/context/contexts/WorkoutContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import StorageManager from '../../utils/StorageManager';
import {
  // Workout
} from '../types';

interface Exercise {
  name: string;
  sets?: any[];
  cardioData?: {
    totalTime: number;
    distance: number;
    pace: string;
    calories: number;
  };
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  category: string;
  createdAt: Date;
  estimatedDuration?: number;
}

interface RestDay {
  date: string;
  reason: string;
  notes?: string;
}

interface WorkoutState {
  workoutHistory: Workout[];
  exerciseHistory: Record<string, any[]>;
  workoutTemplates: WorkoutTemplate[];
  restDays: RestDay[];
  loading: boolean;
  error: string | null;
}

interface WorkoutContextValue {
  // State
  workoutHistory: Workout[];
  exerciseHistory: Record<string, any[]>;
  workoutTemplates: WorkoutTemplate[];
  restDays: RestDay[];
  loading: boolean;
  error: string | null;

  // Actions
  addWorkout: (workout: Workout) => Promise<void>;
  removeWorkout: (workoutId: string) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  updateExerciseHistory: (exercises: Exercise[]) => Promise<void>;
  addTemplate: (template: WorkoutTemplate) => Promise<void>;
  removeTemplate: (templateId: string) => Promise<void>;
  addRestDay: (restDay: RestDay) => Promise<void>;
  removeRestDay: (date: string) => Promise<void>;
  /** Replace entire workout history; useful for demo mode seeding */
  setWorkoutHistory: (workouts: Workout[]) => Promise<void>;
  clearAllWorkoutData: () => Promise<void>;
}

// Action types
type WorkoutAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WORKOUTS'; payload: Workout[] }
  | { type: 'ADD_WORKOUT'; payload: Workout }
  | { type: 'REMOVE_WORKOUT'; payload: string }
  | { type: 'SET_EXERCISE_HISTORY'; payload: Record<string, any[]> }
  | { type: 'UPDATE_EXERCISE_HISTORY'; payload: Exercise[] }
  | { type: 'SET_TEMPLATES'; payload: WorkoutTemplate[] }
  | { type: 'ADD_TEMPLATE'; payload: WorkoutTemplate }
  | { type: 'REMOVE_TEMPLATE'; payload: string }
  | { type: 'SET_REST_DAYS'; payload: RestDay[] }
  | { type: 'ADD_REST_DAY'; payload: RestDay }
  | { type: 'REMOVE_REST_DAY'; payload: string };

const initialWorkoutState: WorkoutState = {
  workoutHistory: [],
  exerciseHistory: {},
  workoutTemplates: [],
  restDays: [],
  loading: false,
  error: null,
};

const workoutReducer = (
  state: WorkoutState,
  action: WorkoutAction,
): WorkoutState => {
  switch (action.type) {
  case 'SET_LOADING':
    return { ...state, loading: action.payload };
  case 'SET_ERROR':
    return { ...state, error: action.payload };
  case 'SET_WORKOUTS':
    return { ...state, workoutHistory: action.payload };
  case 'ADD_WORKOUT':
    return {
      ...state,
      workoutHistory: [...state.workoutHistory, action.payload],
    };
  case 'REMOVE_WORKOUT':
    return {
      ...state,
      workoutHistory: state.workoutHistory.filter(
        w => w.id !== action.payload,
      ),
    };
  case 'SET_EXERCISE_HISTORY':
    return { ...state, exerciseHistory: action.payload };
  case 'UPDATE_EXERCISE_HISTORY':
    // const updatedHistory = ...; // Quick fix: commented unused variable
    action.payload.forEach(exercise => {
      if (!updatedHistory[exercise.name]) {
        updatedHistory[exercise.name] = [];
      }

      const sessionData = {
        date: new Date().toISOString(),
        ...(exercise.sets &&
            exercise.sets.length > 0 && {
          bestSet: exercise.sets.reduce((best, set) => {
            // const weight = ...; // Quick fix: commented unused variable
            // const reps = ...; // Quick fix: commented unused variable
            // const volume = ...; // Quick fix: commented unused variable
            // const bestVolume = ...; // Quick fix: commented unused variable
            return volume > bestVolume ? set : best;
          }, exercise.sets[0]),
          totalVolume: exercise.sets.reduce((sum, set) => {
            return (
              sum +
                  (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0)
            );
          }, 0),
        }),
        ...(exercise.cardioData && {
          totalTime: exercise.cardioData.totalTime,
          distance: exercise.cardioData.distance,
          calories: exercise.cardioData.calories,
          pace: exercise.cardioData.pace,
        }),
      };

      updatedHistory[exercise.name].push(sessionData);
    });
    return { ...state, exerciseHistory: updatedHistory };
  case 'SET_TEMPLATES':
    return { ...state, workoutTemplates: action.payload };
  case 'ADD_TEMPLATE':
    return {
      ...state,
      workoutTemplates: [...state.workoutTemplates, action.payload],
    };
  case 'REMOVE_TEMPLATE':
    return {
      ...state,
      workoutTemplates: state.workoutTemplates.filter(
        t => t.id !== action.payload,
      ),
    };
  case 'SET_REST_DAYS':
    return { ...state, restDays: action.payload };
  case 'ADD_REST_DAY':
    return { ...state, restDays: [...state.restDays, action.payload] };
  case 'REMOVE_REST_DAY':
    return {
      ...state,
      restDays: state.restDays.filter(r => r.date !== action.payload),
    };
  default:
    return state;
  }
};

const WorkoutContext = createContext<WorkoutContextValue | undefined>(
  undefined,
);

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState);

  // Load workout data on mount
  React.useEffect(() => {
    const loadWorkoutData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [workouts, exercises, templates, restDays] = await Promise.all([
          StorageManager.getWorkoutHistory(),
          StorageManager.getExerciseHistory(),
          StorageManager.getWorkoutTemplates(),
          StorageManager.getRestDays(),
        ]);

        dispatch({ type: 'SET_WORKOUTS', payload: workouts || [] });
        dispatch({ type: 'SET_EXERCISE_HISTORY', payload: exercises || {} });
        dispatch({ type: 'SET_TEMPLATES', payload: templates || [] });
        dispatch({ type: 'SET_REST_DAYS', payload: restDays || [] });
      } catch (error) {
        console.error('Error loading workout data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load workout data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadWorkoutData();
  }, []);

  const addWorkout = useCallback(async (workout: Workout) => {
    try {
      dispatch({ type: 'ADD_WORKOUT', payload: workout });
      await StorageManager.saveWorkout(workout);
    } catch (error) {
      console.error('Error adding workout:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save workout' });
    }
  }, []);

  const removeWorkout = useCallback(async (workoutId: string) => {
    try {
      dispatch({ type: 'REMOVE_WORKOUT', payload: workoutId });
      await StorageManager.removeWorkout(workoutId);
    } catch (error) {
      console.error('Error removing workout:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove workout' });
    }
  }, []);

  const updateWorkout = useCallback(async (workout: Workout) => {
    try {
      // const existing = ...; // Quick fix: commented unused variable
      let found = false;
      const updated = existing.map(w => {
        if (w.id === workout.id) {
          found = true;
          return { ...w, ...workout };
        }
        return w;
      });
      // const finalList = ...; // Quick fix: commented unused variable
      dispatch({ type: 'SET_WORKOUTS', payload: finalList });
      await StorageManager.saveWorkoutHistory(finalList);
    } catch (error) {
      console.error('Error updating workout:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update workout' });
    }
  }, [state.workoutHistory]);

  const updateExerciseHistory = useCallback(
    async (exercises: Exercise[]) => {
      try {
        dispatch({ type: 'UPDATE_EXERCISE_HISTORY', payload: exercises });
        await StorageManager.saveExerciseHistory(state.exerciseHistory);
      } catch (error) {
        console.error('Error updating exercise history:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update exercise history',
        });
      }
    },
    [state.exerciseHistory],
  );

  const addTemplate = useCallback(async (template: WorkoutTemplate) => {
    try {
      dispatch({ type: 'ADD_TEMPLATE', payload: template });
      await StorageManager.saveWorkoutTemplate(template);
    } catch (error) {
      console.error('Error adding template:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save template' });
    }
  }, []);

  const removeTemplate = useCallback(async (templateId: string) => {
    try {
      dispatch({ type: 'REMOVE_TEMPLATE', payload: templateId });
      await StorageManager.removeWorkoutTemplate(templateId);
    } catch (error) {
      console.error('Error removing template:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove template' });
    }
  }, []);

  const addRestDay = useCallback(async (restDay: RestDay) => {
    try {
      dispatch({ type: 'ADD_REST_DAY', payload: restDay });
      await StorageManager.saveRestDay(restDay);
    } catch (error) {
      console.error('Error adding rest day:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save rest day' });
    }
  }, []);

  const removeRestDay = useCallback(async (date: string) => {
    try {
      dispatch({ type: 'REMOVE_REST_DAY', payload: date });
      await StorageManager.removeRestDay(date);
    } catch (error) {
      console.error('Error removing rest day:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove rest day' });
    }
  }, []);

  const setWorkoutHistory = useCallback(async (workouts: Workout[]) => {
    try {
      dispatch({ type: 'SET_WORKOUTS', payload: workouts || [] });
      await StorageManager.saveWorkoutHistory(workouts || []);
    } catch (error) {
      console.error('Error setting workout history:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to set workout history' });
    }
  }, []);

  const clearAllWorkoutData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_WORKOUTS', payload: [] });
      dispatch({ type: 'SET_EXERCISE_HISTORY', payload: {} });
      dispatch({ type: 'SET_TEMPLATES', payload: [] });
      dispatch({ type: 'SET_REST_DAYS', payload: [] });

      await Promise.all([
        StorageManager.clearWorkoutHistory(),
        StorageManager.clearExerciseHistory(),
        StorageManager.clearWorkoutTemplates(),
        StorageManager.clearRestDays(),
      ]);
    } catch (error) {
      console.error('Error clearing workout data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear workout data' });
    }
  }, []);

  const value: WorkoutContextValue = {
    // State
    workoutHistory: state.workoutHistory,
    exerciseHistory: state.exerciseHistory,
    workoutTemplates: state.workoutTemplates,
    restDays: state.restDays,
    loading: state.loading,
    error: state.error,

    // Actions
    addWorkout,
    removeWorkout,
    updateWorkout,
    updateExerciseHistory,
    addTemplate,
    removeTemplate,
    addRestDay,
    removeRestDay,
    setWorkoutHistory,
    clearAllWorkoutData,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
};

export const useWorkout = (): WorkoutContextValue => {
  // const context = ...; // Quick fix: commented unused variable
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export default WorkoutContext;
