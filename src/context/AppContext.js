// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageManager from '../utils/StorageManager';
import { FITNESS_CLASSES, SKILL_TREES } from '../screens/ClassSelectionScreen';

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
  UPDATE_REST_DAY: 'UPDATE_REST_DAY',
  // Body weight tracking
  ADD_BODY_WEIGHT: 'ADD_BODY_WEIGHT',
  UPDATE_BODY_WEIGHT: 'UPDATE_BODY_WEIGHT',
  REMOVE_BODY_WEIGHT: 'REMOVE_BODY_WEIGHT',
  // Demo mode
  SET_DEMO_MODE: 'SET_DEMO_MODE',
  LOAD_DEMO_DATA: 'LOAD_DEMO_DATA',
  // Class system
  SELECT_CLASS: 'SELECT_CLASS',
  UNLOCK_SKILL: 'UNLOCK_SKILL',
  AWARD_CLASS_XP: 'AWARD_CLASS_XP'
};

// Initial state
const initialState = {
  loading: true,
  error: null,
  isDemo: false,
  workoutHistory: [],
  exerciseHistory: {},
  oneRepMaxes: {},
  settings: {
    units: 'lbs',
    notifications: true,
    darkMode: false,
    autoTimer: true,
    exportFormat: 'JSON',
    demoMode: false
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
    avgRating: 0,
    // NEW CLASS SYSTEM PROPERTIES
    selectedClass: null,
    classLevel: 1,
    classXP: 0,
    skillPoints: 0,
    unlockedSkills: [],
    classSelectionDate: null,
    classPrestige: 0,
  },
  workoutTemplates: [],
  restDays: [],
  bodyWeights: []
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

    case ActionTypes.ADD_BODY_WEIGHT:
      const newBodyWeights = [...state.bodyWeights, action.payload].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      return {
        ...state,
        bodyWeights: newBodyWeights
      };

    case ActionTypes.UPDATE_BODY_WEIGHT:
      return {
        ...state,
        bodyWeights: state.bodyWeights.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        )
      };

    case ActionTypes.REMOVE_BODY_WEIGHT:
      return {
        ...state,
        bodyWeights: state.bodyWeights.filter(entry =>
          entry.id !== action.payload
        )
      };

    case ActionTypes.CLEAR_ALL_DATA:
      return {
        ...initialState,
        loading: false
      };

    case ActionTypes.SET_DEMO_MODE:
      return {
        ...state,
        isDemo: action.payload.isDemo,
        settings: {
          ...state.settings,
          demoMode: action.payload.isDemo
        }
      };

    case ActionTypes.LOAD_DEMO_DATA:
      return {
        ...state,
        workoutHistory: action.payload.workoutHistory,
        exerciseHistory: action.payload.exerciseHistory,
        oneRepMaxes: action.payload.oneRepMaxes,
        userStats: action.payload.userStats,
        workoutTemplates: action.payload.workoutTemplates,
        restDays: action.payload.restDays,
        bodyWeights: action.payload.bodyWeights,
        isDemo: true,
        settings: {
          ...state.settings,
          demoMode: true
        }
      };

    // Class system cases
    case ActionTypes.SELECT_CLASS:
      return {
        ...state,
        userStats: {
          ...state.userStats,
          selectedClass: action.payload.classKey,
          classLevel: 1,
          classXP: 0,
          skillPoints: 3, // Starting skill points
          unlockedSkills: [],
          classSelectionDate: new Date().toISOString(),
        }
      };

    case ActionTypes.UNLOCK_SKILL:
      return {
        ...state,
        userStats: {
          ...state.userStats,
          unlockedSkills: [...state.userStats.unlockedSkills, action.payload.skillId],
          skillPoints: state.userStats.skillPoints - action.payload.cost,
        }
      };

    case ActionTypes.AWARD_CLASS_XP:
      const newClassXP = state.userStats.classXP + action.payload.xp;
      const classXPRequired = calculateClassXPRequired(state.userStats.classLevel + 1);
      let newClassLevel = state.userStats.classLevel;
      let remainingXP = newClassXP;
      let skillPointsAwarded = 0;
      
      // Check for class level up
      while (remainingXP >= classXPRequired && newClassLevel < 100) {
        remainingXP -= classXPRequired;
        newClassLevel++;
        skillPointsAwarded += Math.floor(newClassLevel / 5) + 1;
      }
      
      return {
        ...state,
        userStats: {
          ...state.userStats,
          classXP: remainingXP,
          classLevel: newClassLevel,
          skillPoints: state.userStats.skillPoints + skillPointsAwarded,
        }
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
        restDays,
        bodyWeights
      ] = await Promise.all([
        StorageManager.loadWorkoutHistory(),
        StorageManager.loadExerciseHistory(),
        StorageManager.loadOneRepMaxes(),
        StorageManager.loadSettings(),
        StorageManager.loadUserStats(),
        StorageManager.loadWorkoutTemplates(),
        StorageManager.loadRestDays(),
        StorageManager.loadBodyWeights()
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
          restDays,
          bodyWeights
        }
      });

      // Check if demo mode is enabled and load demo data (only on startup)
      if (settings?.demoMode && !state.isDemo) {
        console.log('Demo mode enabled on startup, loading demo data...');
        dispatch({ 
          type: ActionTypes.SET_DEMO_MODE, 
          payload: { isDemo: true } 
        });
        await loadDemoData();
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      // Initialize base templates for new users
      await initializeBaseTemplates();
    } catch (error) {
      console.error('Error loading app data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
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

  // WoW-style exponential XP curve calculation
  const calculateLevelRequirement = (level) => {
    // WoW-style exponential curve: each level requires more XP than the previous
    // Formula: XP = baseXP * (level - 1)^1.5
    const baseXP = 100;
    return Math.floor(baseXP * Math.pow(level - 1, 1.5));
  };

  const calculateTotalXPForLevel = (level) => {
    // Calculate total XP needed to reach a specific level
    let totalXP = 0;
    for (let i = 1; i <= level; i++) {
      totalXP += calculateLevelRequirement(i);
    }
    return totalXP;
  };

  // Experience calculation function with enhanced rewards and class bonuses
  const calculateExperience = (workout) => {
    let experience = 0;
    
    // Base experience for completing a workout
    experience += 100; // Increased base XP
    
    // Bonus for workout duration (more time = more exp)
    if (workout.duration) {
      experience += Math.floor(workout.duration / 3); // More XP per minute
    }
    
    // Bonus for number of exercises
    if (workout.exercises) {
      experience += workout.exercises.length * 15; // More XP per exercise
    }
    
    // Bonus for high workout rating
    if (workout.ratings && workout.ratings.workoutRating) {
      if (workout.ratings.workoutRating >= 9) experience += 50;
      else if (workout.ratings.workoutRating >= 8) experience += 35;
      else if (workout.ratings.workoutRating >= 7) experience += 25;
      else if (workout.ratings.workoutRating >= 6) experience += 15;
      else if (workout.ratings.workoutRating >= 5) experience += 10;
    }
    
    // Bonus for streak (exponential growth)
    if (state.userStats.streaks?.current > 0) {
      const streakBonus = Math.min(state.userStats.streaks.current * 10, 100); // Max 100 exp for streak
      experience += streakBonus;
    }
    
    // Template completion bonus
    if (workout.templateId) {
      experience += 50; // Bonus for using and completing a template
    }
    
    // Exercise variety bonus
    if (workout.exercises) {
      const uniqueExercises = new Set(workout.exercises.map(ex => ex.name)).size;
      if (uniqueExercises >= 5) experience += 25; // Bonus for variety
    }
    
    // Apply class bonuses if class is selected
    if (state.userStats.selectedClass) {
      const classData = FITNESS_CLASSES[state.userStats.selectedClass];
      experience = applyClassBonuses(experience, workout, classData, state.userStats);
    }
    
    console.log('calculateExperience - workout:', workout);
    console.log('calculateExperience - calculated experience:', experience);
    
    return Math.floor(experience);
  };

  // Level calculation function with exponential curve
  const calculateLevel = (totalExperience) => {
    let level = 1;
    let requiredXP = 0;
    
    // Find the highest level that can be achieved with current XP
    while (requiredXP <= totalExperience) {
      level++;
      requiredXP = calculateTotalXPForLevel(level);
    }
    
    // Return the level that was just exceeded
    level = Math.max(1, level - 1);
    
    console.log('calculateLevel - totalExperience:', totalExperience, 'calculated level:', level);
    return level;
  };

  // Calculate XP progress to next level
  const calculateXPProgress = (totalExperience) => {
    const currentLevel = calculateLevel(totalExperience);
    const xpForCurrentLevel = calculateTotalXPForLevel(currentLevel);
    const xpForNextLevel = calculateTotalXPForLevel(currentLevel + 1);
    const xpInCurrentLevel = totalExperience - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    
    return {
      currentLevel,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercentage: (xpInCurrentLevel / xpNeededForNextLevel) * 100
    };
  };

  // Class system helper functions
  const calculateClassXPRequired = (level) => {
    return Math.floor(200 * Math.pow(level - 1, 1.2)); // Slightly easier than main level
  };

  const calculateClassXP = (workout, userStats) => {
    if (!userStats.selectedClass) return 0;
    
    const classData = FITNESS_CLASSES[userStats.selectedClass];
    let classXP = 50; // Base class XP
    
    // Check for preferred exercises
    const hasPreferredExercises = workout.exercises?.some(ex => 
      classData.preferredExercises.includes(ex.name.toLowerCase().replace(/\s+/g, '_'))
    );
    
    if (hasPreferredExercises) {
      classXP *= 1.5; // 50% bonus for preferred exercises
    }
    
    // Apply skill bonuses
    const activeSkills = getActiveSkillBonuses(userStats.unlockedSkills);
    activeSkills.forEach(skill => {
      if (skill.type === 'classXP') {
        classXP *= skill.multiplier;
      }
    });
    
    return Math.floor(classXP);
  };

  const applyClassBonuses = (baseXP, workout, classData, userStats) => {
    let multiplier = 1.0;
    
    // Check workout type bonuses
    const exerciseTypes = workout.exercises?.map(ex => ex.category) || [];
    
    if (exerciseTypes.includes('chest') || exerciseTypes.includes('back') || exerciseTypes.includes('legs')) {
      if (classData.bonuses.compoundLiftXP) {
        multiplier *= classData.bonuses.compoundLiftXP;
      }
    }
    
    if (exerciseTypes.length >= 5 && classData.bonuses.varietyXP) {
      multiplier *= classData.bonuses.varietyXP;
    }
    
    if (workout.exercises?.some(ex => ex.category === 'cardio') && classData.bonuses.cardioXP) {
      multiplier *= classData.bonuses.cardioXP;
    }
    
    return baseXP * multiplier;
  };

  const getActiveSkillBonuses = (unlockedSkills) => {
    // Return array of active skill effects
    return unlockedSkills.map(skillId => {
      // This would lookup actual skill effects from SKILL_TREES
      return { type: 'classXP', multiplier: 1.1 }; // Example
    });
  };

  // Award XP for achievements
  const awardAchievementXP = async (achievementId, xpAmount) => {
    try {
      const newTotalExperience = state.userStats.totalExperience + xpAmount;
      const newLevel = calculateLevel(newTotalExperience);
      
      const updatedStats = {
        ...state.userStats,
        totalExperience: newTotalExperience,
        level: newLevel
      };
      
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: updatedStats });
      await StorageManager.saveUserStats(updatedStats);
      
      console.log(`Awarded ${xpAmount} XP for achievement: ${achievementId}`);
      
    } catch (error) {
      console.error('Error awarding achievement XP:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Quest system
  const generateDailyQuests = () => {
    const quests = [
      {
        id: 'daily_workout',
        title: 'Daily Workout',
        description: 'Complete a workout today',
        type: 'daily',
        xpReward: 75,
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        id: 'daily_duration',
        title: 'Endurance Training',
        description: 'Complete a workout lasting at least 45 minutes',
        type: 'daily',
        xpReward: 100,
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        id: 'daily_rating',
        title: 'Quality Focus',
        description: 'Rate a workout 8 or higher',
        type: 'daily',
        xpReward: 50,
        progress: 0,
        maxProgress: 1,
        completed: false
      }
    ];
    
    return quests;
  };

  const generateWeeklyQuests = () => {
    const quests = [
      {
        id: 'weekly_workouts',
        title: 'Weekly Warrior',
        description: 'Complete 4 workouts this week',
        type: 'weekly',
        xpReward: 200,
        progress: 0,
        maxProgress: 4,
        completed: false
      },
      {
        id: 'weekly_duration',
        title: 'Time Master',
        description: 'Log at least 3 hours of workouts this week',
        type: 'weekly',
        xpReward: 300,
        progress: 0,
        maxProgress: 180, // 3 hours in minutes
        completed: false
      },
      {
        id: 'weekly_streak',
        title: 'Consistency King',
        description: 'Maintain a 3-day workout streak',
        type: 'weekly',
        xpReward: 250,
        progress: 0,
        maxProgress: 3,
        completed: false
      }
    ];
    
    return quests;
  };

  const awardQuestXP = async (questId, xpAmount) => {
    try {
      const newTotalExperience = state.userStats.totalExperience + xpAmount;
      const newLevel = calculateLevel(newTotalExperience);
      
      const updatedStats = {
        ...state.userStats,
        totalExperience: newTotalExperience,
        level: newLevel
      };
      
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: updatedStats });
      await StorageManager.saveUserStats(updatedStats);
      
      console.log(`Awarded ${xpAmount} XP for quest: ${questId}`);
      
    } catch (error) {
      console.error('Error awarding quest XP:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Action creators
  const addWorkout = async (workout) => {
    try {
      dispatch({ type: ActionTypes.ADD_WORKOUT, payload: workout });
      
      // Save to storage
      const newWorkoutHistory = [workout, ...state.workoutHistory];
      await StorageManager.saveWorkoutHistory(newWorkoutHistory);
      
      // Calculate experience and level with new system
      const experienceGained = calculateExperience(workout);
      const newTotalExperience = state.userStats.totalExperience + experienceGained;
      const newLevel = calculateLevel(newTotalExperience);
      const xpProgress = calculateXPProgress(newTotalExperience);
      
      // Calculate class XP
      const classXP = calculateClassXP(workout, state.userStats);
      
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
      
      // Award class XP if class is selected
      if (classXP > 0) {
        dispatch({ type: ActionTypes.AWARD_CLASS_XP, payload: { xp: classXP } });
        await StorageManager.saveUserStats({
          ...updatedStats,
          classXP: state.userStats.classXP + classXP
        });
      }
      
      console.log('Workout added with experience:', experienceGained, 'Class XP:', classXP, 'New level:', newLevel);
      
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

  // Body weight management functions
  const addBodyWeight = async (weight, date, notes = '') => {
    try {
      const bodyWeightEntry = {
        id: Date.now().toString(),
        weight: parseFloat(weight),
        date,
        notes,
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: ActionTypes.ADD_BODY_WEIGHT, payload: bodyWeightEntry });
      const updatedBodyWeights = [...state.bodyWeights, bodyWeightEntry].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      await StorageManager.saveBodyWeights(updatedBodyWeights);
      
      return bodyWeightEntry;
    } catch (error) {
      console.error('Error adding body weight:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      return null;
    }
  };

  const updateBodyWeight = async (entryId, updates) => {
    try {
      const updatedEntry = {
        ...state.bodyWeights.find(e => e.id === entryId),
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: ActionTypes.UPDATE_BODY_WEIGHT, payload: updatedEntry });
      const updatedBodyWeights = state.bodyWeights.map(e =>
        e.id === entryId ? updatedEntry : e
      );
      await StorageManager.saveBodyWeights(updatedBodyWeights);
      
    } catch (error) {
      console.error('Error updating body weight:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const removeBodyWeight = async (entryId) => {
    try {
      dispatch({ type: ActionTypes.REMOVE_BODY_WEIGHT, payload: entryId });
      const updatedBodyWeights = state.bodyWeights.filter(e => e.id !== entryId);
      await StorageManager.saveBodyWeights(updatedBodyWeights);
      
    } catch (error) {
      console.error('Error removing body weight:', error);
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

  // Demo mode functions
  const setDemoMode = async (isDemo) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      if (isDemo) {
        // Backup current user data before switching to demo
        await StorageManager.backupUserData();
        // Load demo data
        await loadDemoData();
      } else {
        // First update the settings to prevent reload loop
        const newSettings = { ...state.settings, demoMode: false };
        await StorageManager.saveSettings(newSettings);
        
        // Update demo mode state
        dispatch({ 
          type: ActionTypes.SET_DEMO_MODE, 
          payload: { isDemo: false } 
        });
        
        // Restore user data from backup
        await StorageManager.restoreUserData();
        
        // Reload the restored data
        await loadAllData();
      }

      if (isDemo) {
        // Update demo mode setting for enabling demo mode
        dispatch({ 
          type: ActionTypes.SET_DEMO_MODE, 
          payload: { isDemo } 
        });
        
        // Save demo mode setting
        const newSettings = { ...state.settings, demoMode: isDemo };
        await StorageManager.saveSettings(newSettings);
      }
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error('Error setting demo mode:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const loadDemoData = async () => {
    try {
      // Reset to dummy data
      await StorageManager.resetToDummyData();
      
      // Load the dummy data
      const demoData = {
        workoutHistory: await StorageManager.loadWorkoutHistory(),
        exerciseHistory: await StorageManager.loadExerciseHistory(),
        oneRepMaxes: await StorageManager.loadOneRepMaxes(),
        userStats: await StorageManager.loadUserStats(),
        workoutTemplates: await StorageManager.loadWorkoutTemplates(),
        restDays: await StorageManager.loadRestDays(),
        bodyWeights: await StorageManager.loadBodyWeights()
      };
      
      dispatch({ 
        type: ActionTypes.LOAD_DEMO_DATA, 
        payload: demoData 
      });
      
    } catch (error) {
      console.error('Error loading demo data:', error);
      throw error;
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
    updateRestDay,
    // Body weight actions
    addBodyWeight,
    updateBodyWeight,
    removeBodyWeight,
    // Demo mode actions
    setDemoMode,
    loadDemoData,
    // Gamification actions
    awardAchievementXP,
    generateDailyQuests,
    generateWeeklyQuests,
    awardQuestXP,
    // Class system actions
    selectClass: (classKey) => dispatch({ type: ActionTypes.SELECT_CLASS, payload: { classKey } }),
    unlockSkill: (skillId, cost = 1) => {
      if (state.userStats.skillPoints >= cost) {
        dispatch({ type: ActionTypes.UNLOCK_SKILL, payload: { skillId, cost } });
      }
    },
    awardClassXP: (xp) => dispatch({ type: ActionTypes.AWARD_CLASS_XP, payload: { xp } }),
    calculateClassXPRequired,
    calculateClassXP,
    applyClassBonuses,
    getActiveSkillBonuses
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