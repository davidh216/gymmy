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
  SET_ERROR: 'SET_ERROR'
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
    totalExperience: 0
  }
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
      const updatedWorkoutHistory = state.workoutHistory.map(workout =>
        workout.id === action.payload.id ? action.payload : workout
      );
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
        userStats
      ] = await Promise.all([
        StorageManager.loadWorkoutHistory(),
        StorageManager.loadExerciseHistory(),
        StorageManager.loadOneRepMaxes(),
        StorageManager.loadSettings(),
        StorageManager.loadUserStats()
      ]);

      console.log('loadAllData - loaded userStats:', userStats);

      dispatch({
        type: ActionTypes.LOAD_DATA,
        payload: {
          workoutHistory,
          exerciseHistory,
          oneRepMaxes,
          settings,
          userStats
        }
      });
    } catch (error) {
      console.error('Error loading app data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
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
    if (state.userStats.streaks.current > 0) {
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
      
      // Update user stats with all changes at once
      const updatedStats = {
        ...state.userStats,
        totalWorkouts: state.userStats.totalWorkouts + 1,
        totalDuration: state.userStats.totalDuration + (workout.duration || 0),
        experience: state.userStats.experience + experienceGained,
        level: newLevel,
        totalExperience: newTotalExperience,
        streaks: {
          ...state.userStats.streaks,
          current: state.userStats.streaks.current + 1,
          best: Math.max(state.userStats.streaks.best, state.userStats.streaks.current + 1),
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
      dispatch({ type: ActionTypes.UPDATE_WORKOUT, payload: updatedWorkout });
      
      // Save updated workout history to storage
      const updatedHistory = state.workoutHistory.map(workout =>
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      );
      await StorageManager.saveWorkoutHistory(updatedHistory);
      
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
    updateUserStats
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