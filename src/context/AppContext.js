// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageManager from '../utils/StorageManager';

// Action types
const ActionTypes = {
  LOAD_DATA: 'LOAD_DATA',
  SET_LOADING: 'SET_LOADING',
  ADD_WORKOUT: 'ADD_WORKOUT',
  UPDATE_WORKOUT: 'UPDATE_WORKOUT',
  REMOVE_WORKOUT: 'REMOVE_WORKOUT',
  UPDATE_EXERCISE_HISTORY: 'UPDATE_EXERCISE_HISTORY',
  UPDATE_ONE_REP_MAX: 'UPDATE_ONE_REP_MAX',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_USER_STATS: 'UPDATE_USER_STATS',
  UPDATE_EXPERIENCE: 'UPDATE_EXPERIENCE',
  CLEAR_ALL_DATA: 'CLEAR_ALL_DATA',
  SET_ERROR: 'SET_ERROR',
  // New action types for templates and rest days
  ADD_TEMPLATE: 'ADD_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  REMOVE_TEMPLATE: 'REMOVE_TEMPLATE',
  ADD_REST_DAY: 'ADD_REST_DAY',
  REMOVE_REST_DAY: 'REMOVE_REST_DAY',
  UPDATE_REST_DAY: 'UPDATE_REST_DAY'
};

// Initial state
const initialState = {
  loading: true,
  error: null,
  workoutHistory: [],
  exerciseHistory: {},
  oneRepMaxes: {},
  settings: {
    units: 'lbs',
    notifications: true,
    darkMode: false,
    autoTimer: true,
    exportFormat: 'JSON'
  },
  userStats: {
    totalWorkouts: 0,
    totalDuration: 0,
    favoriteExercises: [],
    streaks: {
      current: 0,
      best: 0,
      lastWorkout: null
    },
    experience: 0,
    level: 1,
    totalExperience: 0,
    avgWorkoutsPerWeek: 0,
    avgRating: 0
  },
  workoutTemplates: [],
  restDays: []
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOAD_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ActionTypes.ADD_WORKOUT:
      const newWorkoutHistory = [action.payload, ...state.workoutHistory];
      return {
        ...state,
        workoutHistory: newWorkoutHistory
      };

    case ActionTypes.UPDATE_WORKOUT:
      console.log('AppContext - UPDATE_WORKOUT reducer - action.payload:', action.payload);
      console.log('AppContext - UPDATE_WORKOUT reducer - action.payload.workoutDate:', action.payload.workoutDate);
      const updatedWorkoutHistory = state.workoutHistory.map(workout =>
        workout.id === action.payload.id ? action.payload : workout
      );
      console.log('AppContext - UPDATE_WORKOUT reducer - updatedWorkoutHistory length:', updatedWorkoutHistory.length);
      console.log('AppContext - UPDATE_WORKOUT reducer - updated workout in history:', updatedWorkoutHistory.find(w => w.id === action.payload.id));
      return {
        ...state,
        workoutHistory: updatedWorkoutHistory
      };

    case ActionTypes.REMOVE_WORKOUT:
      const filteredWorkoutHistory = state.workoutHistory.filter(workout =>
        workout.id !== action.payload
      );
      return {
        ...state,
        workoutHistory: filteredWorkoutHistory
      };

    case ActionTypes.UPDATE_EXERCISE_HISTORY:
      return {
        ...state,
        exerciseHistory: {
          ...state.exerciseHistory,
          ...action.payload
        }
      };

    case ActionTypes.UPDATE_ONE_REP_MAX:
      return {
        ...state,
        oneRepMaxes: {
          ...state.oneRepMaxes,
          ...action.payload
        }
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case ActionTypes.UPDATE_USER_STATS:
      console.log('UPDATE_USER_STATS reducer - payload:', action.payload);
      const updatedUserStats = {
        ...state.userStats,
        ...action.payload
      };
      console.log('UPDATE_USER_STATS reducer - updated userStats:', updatedUserStats);
      return {
        ...state,
        userStats: updatedUserStats
      };

    case ActionTypes.UPDATE_EXPERIENCE:
      const { experienceGained, newLevel } = action.payload;
      const currentExp = state.userStats.experience + experienceGained;
      const currentLevel = newLevel || state.userStats.level;
      const totalExp = state.userStats.totalExperience + experienceGained;
      
      return {
        ...state,
        userStats: {
          ...state.userStats,
          experience: currentExp,
          level: currentLevel,
          totalExperience: totalExp
        }
      };

    case ActionTypes.ADD_TEMPLATE:
      return {
        ...state,
        workoutTemplates: [...state.workoutTemplates, action.payload]
      };

    case ActionTypes.UPDATE_TEMPLATE:
      return {
        ...state,
        workoutTemplates: state.workoutTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        )
      };

    case ActionTypes.REMOVE_TEMPLATE:
      return {
        ...state,
        workoutTemplates: state.workoutTemplates.filter(template =>
          template.id !== action.payload
        )
      };

    case ActionTypes.ADD_REST_DAY:
      return {
        ...state,
        restDays: [...state.restDays, action.payload]
      };

    case ActionTypes.REMOVE_REST_DAY:
      return {
        ...state,
        restDays: state.restDays.filter(day =>
          day.date !== action.payload
        )
      };

    case ActionTypes.UPDATE_REST_DAY:
      return {
        ...state,
        restDays: state.restDays.map(day =>
          day.date === action.payload.date ? action.payload : day
        )
      };

    case ActionTypes.CLEAR_ALL_DATA:
      return {
        ...initialState,
        loading: false
      };

    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on app start
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      const [
        workoutHistory,
        exerciseHistory,
        oneRepMaxes,
        settings,
        userStats,
        workoutTemplates,
        restDays
      ] = await Promise.all([
        StorageManager.loadWorkoutHistory(),
        StorageManager.loadExerciseHistory(),
        StorageManager.loadOneRepMaxes(),
        StorageManager.loadSettings(),
        StorageManager.loadUserStats(),
        StorageManager.loadWorkoutTemplates(),
        StorageManager.loadRestDays()
      ]);

      // Ensure userStats has all required properties with proper defaults
      const validatedUserStats = {
        totalWorkouts: userStats?.totalWorkouts || 0,
        totalDuration: userStats?.totalDuration || 0,
        favoriteExercises: userStats?.favoriteExercises || [],
        streaks: {
          current: userStats?.streaks?.current || 0,
          best: userStats?.streaks?.best || 0,
          lastWorkout: userStats?.streaks?.lastWorkout || null
        },
        experience: userStats?.experience || 0,
        level: userStats?.level || 1,
        totalExperience: userStats?.totalExperience || 0,
        avgWorkoutsPerWeek: userStats?.avgWorkoutsPerWeek || 0,
        avgRating: userStats?.avgRating || 0
      };

      console.log('loadAllData - loaded userStats:', validatedUserStats);

      dispatch({
        type: ActionTypes.LOAD_DATA,
        payload: {
          workoutHistory,
          exerciseHistory,
          oneRepMaxes,
          settings,
          userStats: validatedUserStats,
          workoutTemplates,
          restDays
        }
      });

      // Initialize base templates for new users
      await initializeBaseTemplates();
    } catch (error) {
      console.error('Error loading app data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Calculate average workouts per week
  const calculateAvgWorkoutsPerWeek = (workoutHistory) => {
    if (workoutHistory.length === 0) return 0;
    
    // Sort workouts by date
    const sortedWorkouts = [...workoutHistory].sort((a, b) => 
      new Date(a.workoutDate || a.startTime) - new Date(b.workoutDate || b.startTime)
    );
    
    const firstWorkoutDate = new Date(sortedWorkouts[0].workoutDate || sortedWorkouts[0].startTime);
    const lastWorkoutDate = new Date(sortedWorkouts[sortedWorkouts.length - 1].workoutDate || sortedWorkouts[sortedWorkouts.length - 1].startTime);
    
    // Calculate weeks between first and last workout
    const daysDiff = (lastWorkoutDate - firstWorkoutDate) / (1000 * 60 * 60 * 24);
    const weeksDiff = Math.max(1, Math.ceil(daysDiff / 7)); // At least 1 week
    
    return Math.round((workoutHistory.length / weeksDiff) * 10) / 10; // Round to 1 decimal
  };

  // Calculate average rating
  const calculateAvgRating = (workoutHistory) => {
    if (workoutHistory.length === 0) return 0;
    
    const totalRating = workoutHistory.reduce((sum, workout) => 
      sum + (workout.ratings?.workoutRating || 5), 0
    );
    
    return Math.round((totalRating / workoutHistory.length) * 10) / 10; // Round to 1 decimal
  };

  // Experience calculation function
  const calculateExperience = (workout) => {
    let experience = 0;
    
    // Base experience for completing a workout
    experience += 50;
    
    // Bonus for workout duration (more time = more exp)
    if (workout.duration) {
      experience += Math.floor(workout.duration / 5); // 1 exp per 5 minutes
    }
    
    // Bonus for number of exercises
    if (workout.exercises) {
      experience += workout.exercises.length * 10; // 10 exp per exercise
    }
    
    // Bonus for high workout rating
    if (workout.ratings && workout.ratings.workoutRating) {
      if (workout.ratings.workoutRating >= 8) experience += 25;
      else if (workout.ratings.workoutRating >= 6) experience += 15;
      else if (workout.ratings.workoutRating >= 4) experience += 5;
    }
    
    // Bonus for streak
    if (state.userStats.streaks?.current > 0) {
      experience += Math.min(state.userStats.streaks.current * 5, 50); // Max 50 exp for streak
    }
    
    console.log('calculateExperience - workout:', workout);
    console.log('calculateExperience - calculated experience:', experience);
    
    return experience;
  };

  // Level calculation function
  const calculateLevel = (totalExperience) => {
    // Level 1: 0-99 exp
    // Level 2: 100-299 exp
    // Level 3: 300-599 exp
    // And so on...
    const level = Math.floor(totalExperience / 100) + 1;
    console.log('calculateLevel - totalExperience:', totalExperience, 'calculated level:', level);
    return level;
  };

  // Action creators
  const addWorkout = async (workout) => {
    try {
      dispatch({ type: ActionTypes.ADD_WORKOUT, payload: workout });
      
      // Save to storage
      const newWorkoutHistory = [workout, ...state.workoutHistory];
      await StorageManager.saveWorkoutHistory(newWorkoutHistory);
      
      // Calculate experience and level
      const experienceGained = calculateExperience(workout);
      const newTotalExperience = state.userStats.totalExperience + experienceGained;
      const newLevel = calculateLevel(newTotalExperience);
      
      // Calculate new KPIs
      const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(newWorkoutHistory);
      const avgRating = calculateAvgRating(newWorkoutHistory);
      
      // Update user stats with all changes at once
      const updatedStats = {
        ...state.userStats,
        totalWorkouts: state.userStats.totalWorkouts + 1,
        totalDuration: state.userStats.totalDuration + (workout.duration || 0),
        experience: state.userStats.experience + experienceGained,
        level: newLevel,
        totalExperience: newTotalExperience,
        avgWorkoutsPerWeek,
        avgRating,
        streaks: {
          current: (state.userStats.streaks?.current || 0) + 1,
          best: Math.max(state.userStats.streaks?.best || 0, (state.userStats.streaks?.current || 0) + 1),
          lastWorkout: workout.endTime
        }
      };
      
      // Dispatch all updates at once
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: updatedStats });
      await StorageManager.saveUserStats(updatedStats);
      
      console.log('Workout added with experience:', experienceGained, 'New level:', newLevel);
      
    } catch (error) {
      console.error('Error adding workout:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateWorkout = async (updatedWorkout) => {
    try {
      console.log('AppContext - updateWorkout - updatedWorkout:', updatedWorkout);
      console.log('AppContext - updateWorkout - updatedWorkout.workoutDate:', updatedWorkout.workoutDate);
      
      dispatch({ type: ActionTypes.UPDATE_WORKOUT, payload: updatedWorkout });
      
      // Save updated workout history to storage
      const updatedHistory = state.workoutHistory.map(workout =>
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      );
      await StorageManager.saveWorkoutHistory(updatedHistory);
      
      console.log('AppContext - updateWorkout - updatedHistory saved to storage');
      
      // Recalculate KPIs
      const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(updatedHistory);
      const avgRating = calculateAvgRating(updatedHistory);
      
      const updatedStats = {
        ...state.userStats,
        avgWorkoutsPerWeek,
        avgRating
      };
      
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: updatedStats });
      await StorageManager.saveUserStats(updatedStats);
      
    } catch (error) {
      console.error('Error updating workout:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeWorkout = async (workoutId) => {
    try {
      console.log('removeWorkout called with workoutId:', workoutId);
      console.log('Current workout history length:', state.workoutHistory.length);
      
      // Get the current workout history before dispatching
      const currentHistory = state.workoutHistory;
      const updatedHistory = currentHistory.filter(workout => workout.id !== workoutId);
      
      console.log('Updated workout history length:', updatedHistory.length);
      
      // Dispatch the action to update state
      dispatch({ type: ActionTypes.REMOVE_WORKOUT, payload: workoutId });
      
      // Save updated workout history to storage
      await StorageManager.saveWorkoutHistory(updatedHistory);
      console.log('Workout history saved to storage');
      
      // Recalculate KPIs
      const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(updatedHistory);
      const avgRating = calculateAvgRating(updatedHistory);
      
      const updatedStats = {
        ...state.userStats,
        totalWorkouts: updatedHistory.length,
        avgWorkoutsPerWeek,
        avgRating
      };
      
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: updatedStats });
      await StorageManager.saveUserStats(updatedStats);
      
    } catch (error) {
      console.error('Error removing workout:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateExerciseHistory = async (exerciseHistory) => {
    try {
      dispatch({ type: ActionTypes.UPDATE_EXERCISE_HISTORY, payload: exerciseHistory });
      await StorageManager.saveExerciseHistory({
        ...state.exerciseHistory,
        ...exerciseHistory
      });
    } catch (error) {
      console.error('Error updating exercise history:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateOneRepMax = async (oneRepMaxData) => {
    try {
      dispatch({ type: ActionTypes.UPDATE_ONE_REP_MAX, payload: oneRepMaxData });
      await StorageManager.saveOneRepMaxes({
        ...state.oneRepMaxes,
        ...oneRepMaxData
      });
    } catch (error) {
      console.error('Error updating one rep max:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: newSettings });
      await StorageManager.saveSettings({
        ...state.settings,
        ...newSettings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Template management functions
  const addTemplate = async (template) => {
    try {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: ActionTypes.ADD_TEMPLATE, payload: newTemplate });
      const updatedTemplates = [...state.workoutTemplates, newTemplate];
      await StorageManager.saveWorkoutTemplates(updatedTemplates);
      
      return newTemplate;
    } catch (error) {
      console.error('Error adding template:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return null;
    }
  };

  const updateTemplate = async (templateId, updates) => {
    try {
      const updatedTemplate = {
        ...state.workoutTemplates.find(t => t.id === templateId),
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: ActionTypes.UPDATE_TEMPLATE, payload: updatedTemplate });
      const updatedTemplates = state.workoutTemplates.map(t =>
        t.id === templateId ? updatedTemplate : t
      );
      await StorageManager.saveWorkoutTemplates(updatedTemplates);
      
    } catch (error) {
      console.error('Error updating template:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeTemplate = async (templateId) => {
    try {
      dispatch({ type: ActionTypes.REMOVE_TEMPLATE, payload: templateId });
      const updatedTemplates = state.workoutTemplates.filter(t => t.id !== templateId);
      await StorageManager.saveWorkoutTemplates(updatedTemplates);
      
    } catch (error) {
      console.error('Error removing template:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const initializeBaseTemplates = async () => {
    try {
      // Only initialize if user has no templates
      if (state.workoutTemplates.length === 0) {
        const baseTemplates = [
          {
            id: 'template_beginner_full_body',
            name: 'Beginner Full Body',
            description: 'Complete full body workout for beginners. Focus on form and building strength.',
            exercises: [
              { name: 'Bench Press', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Barbell Squat', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Lat Pulldown (Wide-grip)', sets: 3, targetReps: 10, targetWeight: 0 },
              { name: 'Standing Barbell Shoulder Press', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Standing Barbell Bicep Curl', sets: 3, targetReps: 10, targetWeight: 0 },
              { name: 'Tricep Pushdowns', sets: 3, targetReps: 12, targetWeight: 0 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_push_pull_legs',
            name: 'Push Pull Legs',
            description: 'Classic PPL split for intermediate lifters. 3-day rotation.',
            exercises: [
              { name: 'Bench Press', sets: 4, targetReps: 6, targetWeight: 0 },
              { name: 'Incline Bench Press', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Standing Barbell Shoulder Press', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Lateral Raise', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Tricep Pushdowns', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Skullcrushers', sets: 3, targetReps: 10, targetWeight: 0 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_upper_lower',
            name: 'Upper Lower Split',
            description: '4-day split alternating upper and lower body workouts.',
            exercises: [
              { name: 'Bench Press', sets: 4, targetReps: 6, targetWeight: 0 },
              { name: 'Lat Pulldown (Wide-grip)', sets: 4, targetReps: 8, targetWeight: 0 },
              { name: 'Upright Barbell Row', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Standing Barbell Shoulder Press', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Standing Barbell Bicep Curl', sets: 3, targetReps: 10, targetWeight: 0 },
              { name: 'Tricep Dips', sets: 3, targetReps: 10, targetWeight: 0 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_chest_back',
            name: 'Chest & Back',
            description: 'Focus on major pushing and pulling movements.',
            exercises: [
              { name: 'Bench Press', sets: 4, targetReps: 6, targetWeight: 0 },
              { name: 'Incline Bench Press', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Cable Fly (Middle)', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Lat Pulldown (Wide-grip)', sets: 4, targetReps: 8, targetWeight: 0 },
              { name: 'Bent-Over Rows', sets: 3, targetReps: 8, targetWeight: 0 },
              { name: 'Single Arm Dumbbell Row', sets: 3, targetReps: 10, targetWeight: 0 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_legs_focus',
            name: 'Legs Focus',
            description: 'Comprehensive leg day with squats, presses, and accessories.',
            exercises: [
              { name: 'Barbell Squat', sets: 4, targetReps: 6, targetWeight: 0 },
              { name: 'Seated Leg Press', sets: 3, targetReps: 10, targetWeight: 0 },
              { name: 'Leg Extension', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Seated Calf Raise', sets: 4, targetReps: 15, targetWeight: 0 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_shoulders_arms',
            name: 'Shoulders & Arms',
            description: 'Isolation work for shoulders, biceps, and triceps.',
            exercises: [
              { name: 'Standing Barbell Shoulder Press', sets: 4, targetReps: 8, targetWeight: 0 },
              { name: 'Lateral Raise', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Face Pulls', sets: 3, targetReps: 15, targetWeight: 0 },
              { name: 'Standing Barbell Bicep Curl', sets: 3, targetReps: 10, targetWeight: 0 },
              { name: 'Preacher Curls', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Tricep Pushdowns', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Skullcrushers', sets: 3, targetReps: 10, targetWeight: 0 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_cardio_mix',
            name: 'Cardio Mix',
            description: 'Variety of cardio exercises for endurance and fat burning.',
            exercises: [
              { name: 'Running', isCardio: true, targetDuration: 20, targetCalories: 200 },
              { name: 'Cycling', isCardio: true, targetDuration: 15, targetCalories: 150 },
              { name: 'Rowing', isCardio: true, targetDuration: 10, targetCalories: 100 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_hiit_workout',
            name: 'HIIT Workout',
            description: 'High-intensity interval training for maximum calorie burn.',
            exercises: [
              { name: 'Running', isCardio: true, targetDuration: 30, targetCalories: 300 },
              { name: 'Elliptical', isCardio: true, targetDuration: 20, targetCalories: 200 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_abs_core',
            name: 'Abs & Core',
            description: 'Core strengthening workout with bodyweight and weighted exercises.',
            exercises: [
              { name: 'Hanging Leg Raises', sets: 3, targetReps: 12, targetWeight: 0 },
              { name: 'Upright Ab Pulldowns', sets: 3, targetReps: 15, targetWeight: 0 }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'template_beginner_cardio',
            name: 'Beginner Cardio',
            description: 'Low-impact cardio for beginners starting their fitness journey.',
            exercises: [
              { name: 'Walking', isCardio: true, targetDuration: 30, targetCalories: 150 },
              { name: 'Cycling', isCardio: true, targetDuration: 20, targetCalories: 120 }
            ],
            createdAt: new Date().toISOString()
          }
        ];

        // Add all base templates
        for (const template of baseTemplates) {
          dispatch({ type: ActionTypes.ADD_TEMPLATE, payload: template });
        }
        
        await StorageManager.saveWorkoutTemplates(baseTemplates);
        console.log('Base templates initialized for new user');
      }
    } catch (error) {
      console.error('Error initializing base templates:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Rest day management functions
  const addRestDay = async (date, notes = '', planned = false) => {
    try {
      const restDay = {
        date,
        notes,
        planned,
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: ActionTypes.ADD_REST_DAY, payload: restDay });
      const updatedRestDays = [...state.restDays, restDay];
      await StorageManager.saveRestDays(updatedRestDays);
      
    } catch (error) {
      console.error('Error adding rest day:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeRestDay = async (date) => {
    try {
      dispatch({ type: ActionTypes.REMOVE_REST_DAY, payload: date });
      const updatedRestDays = state.restDays.filter(day => day.date !== date);
      await StorageManager.saveRestDays(updatedRestDays);
      
    } catch (error) {
      console.error('Error removing rest day:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateRestDay = async (date, updates) => {
    try {
      const updatedRestDay = {
        ...state.restDays.find(d => d.date === date),
        ...updates,
        date // Ensure date doesn't change
      };
      
      dispatch({ type: ActionTypes.UPDATE_REST_DAY, payload: updatedRestDay });
      const updatedRestDays = state.restDays.map(d =>
        d.date === date ? updatedRestDay : d
      );
      await StorageManager.saveRestDays(updatedRestDays);
      
    } catch (error) {
      console.error('Error updating rest day:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const exportData = async () => {
    try {
      return await StorageManager.exportAllData();
    } catch (error) {
      console.error('Error exporting data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return null;
    }
  };

  const importData = async (importData) => {
    try {
      const success = await StorageManager.importAllData(importData);
      if (success) {
        await loadAllData(); // Reload all data from storage
      }
      return success;
    } catch (error) {
      console.error('Error importing data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return false;
    }
  };

  const clearAllData = async () => {
    try {
      await StorageManager.clearAllData();
      dispatch({ type: ActionTypes.CLEAR_ALL_DATA });
    } catch (error) {
      console.error('Error clearing data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const resetToDummyData = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      await StorageManager.resetToDummyData();
      await loadAllData();
    } catch (error) {
      console.error('Error resetting to dummy data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateUserStats = async (newStats) => {
    try {
      console.log('updateUserStats called with:', newStats);
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: newStats });
      await StorageManager.saveUserStats(newStats);
      console.log('User stats updated and saved');
    } catch (error) {
      console.error('Error updating user stats:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const value = {
    // State
    ...state,
    
    // Actions
    addWorkout,
    updateWorkout,
    removeWorkout,
    updateExerciseHistory,
    updateOneRepMax,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    resetToDummyData,
    loadAllData,
    updateUserStats,
    // Template actions
    addTemplate,
    updateTemplate,
    removeTemplate,
    initializeBaseTemplates,
    // Rest day actions
    addRestDay,
    removeRestDay,
    updateRestDay
  };

  return (
    <AppContext.Provider value={value}>
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

export default AppContext;