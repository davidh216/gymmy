// src/context/AppContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import StorageManager from '../utils/StorageManager';

// Import from new modular files
import { 
  FITNESS_CLASSES, 
  CHARACTER_TEMPLATES, 
  GACHA_RATES, 
  CURRENCY_REWARDS,
  getPullCosts 
} from './GameData';

import {
  calculateExperience,
  calculateClassXP,
  calculateLevel,
  performGachaPull,
  workoutWithCharacter,
  createWorkoutPost
} from './GameLogic';

import { 
  ActionTypes, 
  initialState, 
  appReducer 
} from './GameReducer';

import {
  ContextValue,
  AppState,
  Workout,
  UserStats,
  Character,
  SocialPost,
  FitnessClassKey,
  UserCurrencies
} from './types';

// ==============================================================================
// CONTEXT AND PROVIDER
// ==============================================================================

const AppContext = createContext<ContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on app start
  useEffect(() => {
    loadAllData();
  }, []);

  // ==============================================================================
  // MEMOIZED SELECTORS - Performance Optimizations
  // ==============================================================================

  // Memoized workout statistics
  const workoutStats = useMemo(() => {
    const totalWorkouts = state.workoutHistory.length;
    const totalDuration = state.workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalHours = totalDuration / 60;
    
    // Calculate average rating
    const workoutsWithRatings = state.workoutHistory.filter(w => w.ratings?.workoutRating);
    const avgRating = workoutsWithRatings.length > 0 
      ? workoutsWithRatings.reduce((sum, w) => sum + (w.ratings?.workoutRating || 0), 0) / workoutsWithRatings.length
      : 0;

    // Calculate streaks
    const sortedWorkouts = [...state.workoutHistory].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastWorkoutDate = null;
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].startTime);
      const workoutDay = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
      
      if (lastWorkoutDate === null) {
        lastWorkoutDate = workoutDay;
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((lastWorkoutDate - workoutDay) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          tempStreak++;
          currentStreak = tempStreak;
        } else if (daysDiff === 0) {
          // Same day workout, don't break streak
        } else {
          tempStreak = 1;
        }
        lastWorkoutDate = workoutDay;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Calculate weekly consistency
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
    const recentWorkouts = state.workoutHistory.filter(w => new Date(w.startTime) >= fourWeeksAgo);
    const weeklyConsistency = recentWorkouts.length / 4;

    // Calculate favorite exercises
    const exerciseCount: Record<string, number> = {};
    state.workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
      });
    });
    
    const favoriteExercises = Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    return {
      totalWorkouts,
      totalDuration,
      totalHours,
      avgRating,
      currentStreak,
      longestStreak,
      weeklyConsistency,
      favoriteExercises,
      workoutsWithRatings: workoutsWithRatings.length
    };
  }, [state.workoutHistory]);

  // Memoized achievement calculations
  const achievements = useMemo(() => {
    const { totalWorkouts, totalHours, avgRating, currentStreak, longestStreak, weeklyConsistency } = workoutStats;
    
    // Define all achievements
    const allAchievements = [
      // Workout Count Achievements
      {
        id: 'first_workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: 'fitness-outline',
        color: '#10b981',
        condition: totalWorkouts >= 1,
        progress: Math.min(totalWorkouts, 1),
        maxProgress: 1,
        category: 'milestone',
        xpReward: 50
      },
      {
        id: 'workout_5',
        title: 'Getting Started',
        description: 'Complete 5 workouts',
        icon: 'fitness',
        color: '#10b981',
        condition: totalWorkouts >= 5,
        progress: Math.min(totalWorkouts, 5),
        maxProgress: 5,
        category: 'milestone',
        xpReward: 100
      },
      {
        id: 'workout_25',
        title: 'Dedicated Athlete',
        description: 'Complete 25 workouts',
        icon: 'trophy-outline',
        color: '#f59e0b',
        condition: totalWorkouts >= 25,
        progress: Math.min(totalWorkouts, 25),
        maxProgress: 25,
        category: 'milestone',
        xpReward: 250
      },
      {
        id: 'workout_50',
        title: 'Fitness Enthusiast',
        description: 'Complete 50 workouts',
        icon: 'trophy',
        color: '#f59e0b',
        condition: totalWorkouts >= 50,
        progress: Math.min(totalWorkouts, 50),
        maxProgress: 50,
        category: 'milestone',
        xpReward: 500
      },
      {
        id: 'workout_100',
        title: 'Century Club',
        description: 'Complete 100 workouts',
        icon: 'diamond-outline',
        color: '#8b5cf6',
        condition: totalWorkouts >= 100,
        progress: Math.min(totalWorkouts, 100),
        maxProgress: 100,
        category: 'milestone',
        xpReward: 1000
      },
      // Duration Achievements
      {
        id: 'duration_10',
        title: 'Time Warrior',
        description: 'Complete 10 hours of workouts',
        icon: 'time-outline',
        color: '#10b981',
        condition: totalHours >= 10,
        progress: Math.min(totalHours, 10),
        maxProgress: 10,
        category: 'duration',
        xpReward: 150
      },
      {
        id: 'duration_50',
        title: 'Endurance Master',
        description: 'Complete 50 hours of workouts',
        icon: 'time',
        color: '#f59e0b',
        condition: totalHours >= 50,
        progress: Math.min(totalHours, 50),
        maxProgress: 50,
        category: 'duration',
        xpReward: 750
      },
      // Rating Achievements
      {
        id: 'rating_8',
        title: 'Quality Over Quantity',
        description: 'Maintain an average rating of 8+',
        icon: 'star-outline',
        color: '#f59e0b',
        condition: avgRating >= 8,
        progress: Math.min(avgRating, 8),
        maxProgress: 8,
        category: 'quality',
        xpReward: 300
      },
      // Streak Achievements
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        icon: 'flame-outline',
        color: '#f59e0b',
        condition: currentStreak >= 7,
        progress: Math.min(currentStreak, 7),
        maxProgress: 7,
        category: 'consistency',
        xpReward: 200
      },
      {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day workout streak',
        icon: 'flame',
        color: '#ef4444',
        condition: currentStreak >= 30,
        progress: Math.min(currentStreak, 30),
        maxProgress: 30,
        category: 'consistency',
        xpReward: 1000
      },
      {
        id: 'best_streak_14',
        title: 'Streak Champion',
        description: 'Achieve a 14-day streak (anytime)',
        icon: 'trophy-outline',
        color: '#f59e0b',
        condition: longestStreak >= 14,
        progress: Math.min(longestStreak, 14),
        maxProgress: 14,
        category: 'consistency',
        xpReward: 400
      },
      // Consistency Achievements
      {
        id: 'weekly_consistency',
        title: 'Consistent Athlete',
        description: 'Average 3+ workouts per week for 4 weeks',
        icon: 'calendar-outline',
        color: '#10b981',
        condition: weeklyConsistency >= 3,
        progress: Math.min(weeklyConsistency, 3),
        maxProgress: 3,
        category: 'consistency',
        xpReward: 300
      }
    ];

    return allAchievements;
  }, [workoutStats]);

  // Memoized recent workouts (last 5)
  const recentWorkouts = useMemo(() => {
    return [...state.workoutHistory]
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 5);
  }, [state.workoutHistory]);

  // Memoized monthly statistics
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const thisMonthWorkouts = state.workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate >= currentMonth && workoutDate < nextMonth;
    });

    const thisMonthDuration = thisMonthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const thisMonthRatings = thisMonthWorkouts
      .filter(w => w.ratings?.workoutRating)
      .map(w => w.ratings.workoutRating);
    
    const thisMonthAvgRating = thisMonthRatings.length > 0 
      ? thisMonthRatings.reduce((sum, rating) => sum + rating, 0) / thisMonthRatings.length
      : 0;

    return {
      count: thisMonthWorkouts.length,
      duration: thisMonthDuration,
      avgRating: thisMonthAvgRating
    };
  }, [state.workoutHistory]);

  // Memoized character collection stats
  const characterStats = useMemo(() => {
    const collection = state.characters.collection;
    const totalCharacters = collection.length;
    
    const rarityCounts = collection.reduce((acc, char) => {
      acc[char.rarity] = (acc[char.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completionPercentage = (totalCharacters / 50) * 100; // Assuming 50 total characters

    return {
      totalCharacters,
      rarityCounts,
      completionPercentage,
      activeCharacter: state.characters.active_character
    };
  }, [state.characters]);

  // Memoized gacha stats
  const gachaStats = useMemo(() => {
    const { total_pulls, legendary_pity } = state.gacha;
    const { gems, coins } = state.userStats.currencies;
    
    return {
      totalPulls: total_pulls,
      legendaryPity: legendary_pity,
      availableGems: gems,
      availableCoins: coins,
      canPullSingle: gems >= 10,
      canPullTen: gems >= 90
    };
  }, [state.gacha, state.userStats.currencies]);

  // ==============================================================================
  // LOAD DATA FUNCTION
  // ==============================================================================

  const loadAllData = async (): Promise<void> => {
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

      // Ensure userStats has all required properties
      const validatedUserStats: UserStats = {
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
        avgRating: userStats?.avgRating || 0,
        
        // Class system properties
        selectedClass: userStats?.selectedClass || null,
        classLevel: userStats?.classLevel || 1,
        classXP: userStats?.classXP || 0,
        skillPoints: userStats?.skillPoints || 0,
        unlockedSkills: userStats?.unlockedSkills || [],
        classSelectionDate: userStats?.classSelectionDate || null,
        classPrestige: userStats?.classPrestige || 0,
        
        // Gacha system properties
        currencies: {
          gems: userStats?.currencies?.gems || 100,
          coins: userStats?.currencies?.coins || 500,
          crystals: userStats?.currencies?.crystals || 10,
          energy_potions: userStats?.currencies?.energy_potions || 3,
        },
        total_workouts_verified: userStats?.total_workouts_verified || 0,
        total_likes_received: userStats?.total_likes_received || 0,
        social_reputation: userStats?.social_reputation || 100,
      };

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
          bodyWeights,
          // Initialize gacha system data
          characters: {
            collection: userStats?.characters?.collection || [],
            active_character: userStats?.characters?.active_character || null,
            character_slots: userStats?.characters?.character_slots || 1,
          },
          gacha: {
            total_pulls: userStats?.gacha?.total_pulls || 0,
            legendary_pity: userStats?.gacha?.legendary_pity || 0,
            last_pull_timestamp: userStats?.gacha?.last_pull_timestamp || null,
            pull_history: userStats?.gacha?.pull_history || [],
          },
          social: {
            workout_posts: userStats?.social?.workout_posts || [],
            likes_given: userStats?.social?.likes_given || [],
            reports_made: userStats?.social?.reports_made || [],
            trust_score: userStats?.social?.trust_score || 100,
          }
        }
      });

      // Check if demo mode is enabled
      if (settings?.demoMode && !state.isDemo) {
        console.log('Demo mode enabled on startup, loading demo data...');
        dispatch({ 
          type: ActionTypes.SET_DEMO_MODE, 
          payload: { isDemo: true } 
        });
        await loadDemoData();
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

    } catch (error) {
      console.error('Error loading app data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error instanceof Error ? error.message : 'Unknown error' });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // ==============================================================================
  // GACHA SYSTEM FUNCTIONS
  // ==============================================================================

  const pullGacha = (pullType: 'single' | 'ten_pull' = 'single'): Character[] => {
    const costs = getPullCosts();
    const cost = costs[pullType];
    
    // Check if user has enough currency
    if (state.userStats.currencies.gems < (cost.gems || 0) || state.userStats.currencies.coins < (cost.coins || 0)) {
      throw new Error('Insufficient currency for gacha pull');
    }
    
    // Perform the pull
    const results = performGachaPull(pullType);
    
    // Apply each result
    results.forEach(character => {
      dispatch({
        type: ActionTypes.GACHA_PULL,
        payload: { 
          character, 
          cost: pullType === 'single' ? cost : { gems: (cost.gems || 0) / 10, coins: (cost.coins || 0) / 10 } 
        }
      });
    });
    
    return results;
  };

  const awardCurrency = (rewards: Partial<UserCurrencies>): void => {
    dispatch({ type: ActionTypes.AWARD_CURRENCY, payload: rewards });
  };

  const setActiveCharacter = (characterId: string): void => {
    dispatch({ type: ActionTypes.SET_ACTIVE_CHARACTER, payload: { characterId } });
  };

  // ==============================================================================
  // SOCIAL VERIFICATION FUNCTIONS
  // ==============================================================================

  const postWorkoutVerification = (workout: Workout, photo: string, caption?: string): SocialPost => {
    const post = createWorkoutPost(workout, photo, caption);
    dispatch({ type: ActionTypes.POST_WORKOUT_VERIFICATION, payload: post });
    
    // Award verification bonus
    awardCurrency(CURRENCY_REWARDS.workout_verified);
    
    return post;
  };

  const likePost = (postId: string): void => {
    dispatch({ type: ActionTypes.LIKE_WORKOUT_POST, payload: { postId } });
    awardCurrency(CURRENCY_REWARDS.social_interaction);
  };

  // ==============================================================================
  // MAIN WORKOUT FUNCTIONS
  // ==============================================================================

  const addWorkout = async (workout: Workout): Promise<void> => {
    try {
      dispatch({ type: ActionTypes.ADD_WORKOUT, payload: workout });
      
      // Save to storage
      const newWorkoutHistory = [workout, ...state.workoutHistory];
      await StorageManager.saveWorkoutHistory(newWorkoutHistory);
      
      // Calculate experience and level
      const experienceGained = calculateExperience(workout, state.userStats);
      const newTotalExperience = state.userStats.totalExperience + experienceGained;
      const newLevel = calculateLevel(newTotalExperience);
      
      // Calculate class XP
      const classXP = calculateClassXP(workout, state.userStats);
      
      // Award base workout currency
      const currencyReward = workout.verification_photo 
        ? CURRENCY_REWARDS.workout_verified 
        : CURRENCY_REWARDS.workout_basic;
      
      // Add streak bonus
      if (state.userStats.streaks?.current > 0) {
        currencyReward.gems = (currencyReward.gems || 0) + (CURRENCY_REWARDS.streak_bonus.gems || 0) * Math.min(state.userStats.streaks.current, 7);
      }
      
      // Update user stats
      const updatedStats: UserStats = {
        ...state.userStats,
        totalWorkouts: state.userStats.totalWorkouts + 1,
        totalDuration: state.userStats.totalDuration + (workout.duration || 0),
        experience: state.userStats.experience + experienceGained,
        level: newLevel,
        totalExperience: newTotalExperience,
        streaks: {
          current: (state.userStats.streaks?.current || 0) + 1,
          best: Math.max(state.userStats.streaks?.best || 0, (state.userStats.streaks?.current || 0) + 1),
          lastWorkout: workout.endTime
        },
        currencies: {
          ...state.userStats.currencies,
          gems: state.userStats.currencies.gems + (currencyReward.gems || 0),
          coins: state.userStats.currencies.coins + (currencyReward.coins || 0),
          crystals: state.userStats.currencies.crystals + (currencyReward.crystals || 0),
        }
      };
      
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: updatedStats });
      await StorageManager.saveUserStats(updatedStats);
      
      // Award class XP if class is selected
      if (classXP > 0) {
        dispatch({ type: ActionTypes.AWARD_CLASS_XP, payload: { xp: classXP } });
      }
      
      // If user has active character, let them participate
      if (state.characters.active_character) {
        const character = state.characters.collection.find(c => 
          c.instance_id === state.characters.active_character
        );
        if (character) {
          const updatedCharacter = workoutWithCharacter(character, workout);
          dispatch({
            type: ActionTypes.UPDATE_CHARACTER,
            payload: { characterId: character.instance_id, updates: updatedCharacter }
          });
        }
      }
      
      console.log('Workout added:', { experienceGained, classXP, newLevel, currencyReward });
      
    } catch (error) {
      console.error('Error adding workout:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // ==============================================================================
  // OTHER EXISTING FUNCTIONS
  // ==============================================================================

  const updateWorkout = async (updatedWorkout: Workout): Promise<void> => {
    try {
      dispatch({ type: ActionTypes.UPDATE_WORKOUT, payload: updatedWorkout });
      
      const updatedHistory = state.workoutHistory.map(workout =>
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      );
      await StorageManager.saveWorkoutHistory(updatedHistory);
      
    } catch (error) {
      console.error('Error updating workout:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const removeWorkout = async (workoutId: string): Promise<void> => {
    try {
      dispatch({ type: ActionTypes.REMOVE_WORKOUT, payload: workoutId });
      
      const updatedHistory = state.workoutHistory.filter(workout => workout.id !== workoutId);
      await StorageManager.saveWorkoutHistory(updatedHistory);
      
    } catch (error) {
      console.error('Error removing workout:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const updateUserStats = async (newStats: Partial<UserStats>): Promise<void> => {
    try {
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: newStats });
      await StorageManager.saveUserStats({ ...state.userStats, ...newStats });
    } catch (error) {
      console.error('Error updating user stats:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const selectClass = (classKey: FitnessClassKey): void => {
    dispatch({ type: ActionTypes.SELECT_CLASS, payload: { classKey } });
  };

  const unlockSkill = (skillId: string, cost: number = 1): void => {
    if (state.userStats.skillPoints >= cost) {
      dispatch({ type: ActionTypes.UNLOCK_SKILL, payload: { skillId, cost } });
    }
  };

  const awardClassXP = (xp: number): void => {
    dispatch({ type: ActionTypes.AWARD_CLASS_XP, payload: { xp } });
  };

  // Demo mode functions
  const setDemoMode = async (isDemo: boolean): Promise<void> => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      if (isDemo) {
        await StorageManager.backupUserData();
        await loadDemoData();
      } else {
        const newSettings = { ...state.settings, demoMode: false };
        await StorageManager.saveSettings(newSettings);
        
        dispatch({ 
          type: ActionTypes.SET_DEMO_MODE, 
          payload: { isDemo: false } 
        });
        
        await StorageManager.restoreUserData();
        await loadAllData();
      }

      if (isDemo) {
        dispatch({ 
          type: ActionTypes.SET_DEMO_MODE, 
          payload: { isDemo } 
        });
        
        const newSettings = { ...state.settings, demoMode: isDemo };
        await StorageManager.saveSettings(newSettings);
      }
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error('Error setting demo mode:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error instanceof Error ? error.message : 'Unknown error' });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const loadDemoData = async (): Promise<void> => {
    try {
      await StorageManager.resetToDummyData();
      
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

  // ==============================================================================
  // CONTEXT VALUE
  // ==============================================================================

  const value: ContextValue = {
    // State
    ...state,
    
    // Workout functions
    addWorkout,
    updateWorkout,
    removeWorkout,
    updateUserStats,
    
    // Class system functions
    selectClass,
    unlockSkill,
    awardClassXP,
    calculateClassXPRequired: (level: number) => Math.floor(200 * Math.pow(level - 1, 1.2)),
    
    // Gacha system functions
    pullGacha,
    awardCurrency,
    setActiveCharacter,
    postWorkoutVerification,
    likePost,
    
    // Demo functions
    setDemoMode,
    loadDemoData,
    loadAllData,
    
    // Constants for UI
    FITNESS_CLASSES,
    CHARACTER_TEMPLATES,
    GACHA_RATES,
    CURRENCY_REWARDS,
    getPullCosts,

    // Memoized data for UI
    workoutStats,
    achievements,
    recentWorkouts,
    monthlyStats,
    characterStats,
    gachaStats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = (): ContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

// ==============================================================================
// EXPORTS FOR OTHER COMPONENTS
// ==============================================================================

export { FITNESS_CLASSES, CHARACTER_TEMPLATES, GACHA_RATES, CURRENCY_REWARDS }; 