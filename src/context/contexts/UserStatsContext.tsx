// src/context/contexts/UserStatsContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import StorageManager from '../../utils/StorageManager';
import {
  // calculateLevel,
  // calculateTotalExperience,
  // 
} from '../utils/UserStatsUtils';
import {
  // UserStats,
  // FitnessClassKey
} from '../types';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'milestone';
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  reward: {
    xp: number;
    gems?: number;
    items?: string[];
  };
}

interface UserStatsState {
  userStats: UserStats;
  achievements: Achievement[];
  quests: Quest[];
  loading: boolean;
  error: string | null;
}

interface UserStatsContextValue {
  // State
  userStats: UserStats;
  achievements: Achievement[];
  quests: Quest[];
  loading: boolean;
  error: string | null;

  // User Stats Actions
  updateUserStats: (updates: Partial<UserStats>) => Promise<void>;
  addExperience: (xp: number, source: string) => Promise<void>;
  selectClass: (classKey: FitnessClassKey) => Promise<void>;
  updateBodyWeight: (weight: number) => Promise<void>;
  updateGoal: (goalId: string, updates: any) => Promise<void>;

  // Achievement Actions
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateAchievementProgress: (
    achievementId: string,
    progress: number
  ) => Promise<void>;

  // Quest Actions
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  generateDailyQuests: () => Promise<void>;

  // Utility Actions
  resetUserStats: () => Promise<void>;
  loadDemoStats: () => Promise<void>;
}

type UserStatsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_STATS'; payload: UserStats }
  | { type: 'UPDATE_USER_STATS'; payload: Partial<UserStats> }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | {
      type: 'UPDATE_ACHIEVEMENT';
      payload: { id: string; updates: Partial<Achievement> };
    }
  | { type: 'SET_QUESTS'; payload: Quest[] }
  | { type: 'UPDATE_QUEST'; payload: { id: string; updates: Partial<Quest> } };

const initialUserStats: UserStats = {
  level: 1,
  experience: 0,
  selectedClass: 'hybrid',
  totalWorkouts: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalLifted: 0,
  bodyWeight: 0,
  bodyWeightHistory: [],
  personalBests: {},
  muscleGroupProgress: {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
    core: 0,
  },
  weeklyGoals: {
    workouts: 3,
    totalVolume: 5000,
    cardioMinutes: 150,
  },
  weeklyProgress: {
    workouts: 0,
    totalVolume: 0,
    cardioMinutes: 0,
  },
  preferences: {
    units: 'lbs',
    notifications: true,
    theme: 'light',
  },
  gems: 100,
  unlockedCharacters: [],
  collectionProgress: {
    totalCharacters: 0,
    uniqueCharacters: 0,
    favoriteCharacters: [],
  },
  onboardingCompleted: false,
  segmentProfile: null,
  personalizedGoals: [],
  lastActive: new Date().toISOString(),
};

const initialUserStatsState: UserStatsState = {
  userStats: initialUserStats,
  achievements: [],
  quests: [],
  loading: false,
  error: null,
};

const userStatsReducer = (
  state: UserStatsState,
  action: UserStatsAction,
): UserStatsState => {
  switch (action.type) {
  case 'SET_LOADING':
    return { ...state, loading: action.payload };
  case 'SET_ERROR':
    return { ...state, error: action.payload };
  case 'SET_USER_STATS':
    return { ...state, userStats: action.payload };
  case 'UPDATE_USER_STATS':
    return { ...state, userStats: { ...state.userStats, ...action.payload } };
  case 'SET_ACHIEVEMENTS':
    return { ...state, achievements: action.payload };
  case 'UPDATE_ACHIEVEMENT':
    return {
      ...state,
      achievements: state.achievements.map(achievement =>
        achievement.id === action.payload.id
          ? { ...achievement, ...action.payload.updates }
          : achievement,
      ),
    };
  case 'SET_QUESTS':
    return { ...state, quests: action.payload };
  case 'UPDATE_QUEST':
    return {
      ...state,
      quests: state.quests.map(quest =>
        quest.id === action.payload.id
          ? { ...quest, ...action.payload.updates }
          : quest,
      ),
    };
  default:
    return state;
  }
};

const UserStatsContext = createContext<UserStatsContextValue | undefined>(
  undefined,
);

interface UserStatsProviderProps {
  children: ReactNode;
}

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(userStatsReducer, initialUserStatsState);

  // Load user stats data on mount
  React.useEffect(() => {
    const loadUserStatsData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [userStats, achievements, quests] = await Promise.all([
          StorageManager.getUserStats(),
          StorageManager.getAchievements(),
          StorageManager.getQuests(),
        ]);

        dispatch({
          type: 'SET_USER_STATS',
          payload: userStats || initialUserStats,
        });
        dispatch({ type: 'SET_ACHIEVEMENTS', payload: achievements || [] });
        dispatch({ type: 'SET_QUESTS', payload: quests || [] });
      } catch (error) {
        console.error('Error loading user stats data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user stats' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUserStatsData();
  }, []);

  const updateUserStats = useCallback(
    async (updates: Partial<UserStats>) => {
      try {
        dispatch({ type: 'UPDATE_USER_STATS', payload: updates });
        // const newStats = ...; // Quick fix: commented unused variable
        await StorageManager.saveUserStats(newStats);
      } catch (error) {
        console.error('Error updating user stats:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update user stats' });
      }
    },
    [state.userStats],
  );

  const addExperience = useCallback(
    async (xp: number, source: string) => {
      try {
        // const currentStats = ...; // Quick fix: commented unused variable
        // const newExperience = ...; // Quick fix: commented unused variable
        // const newLevel = ...; // Quick fix: commented unused variable
        // const leveledUp = ...; // Quick fix: commented unused variable

        const updates: Partial<UserStats> = {
          experience: newExperience,
          level: newLevel,
          lastActive: new Date().toISOString(),
        };

        dispatch({ type: 'UPDATE_USER_STATS', payload: updates });

        if (leveledUp) {
          // Could trigger level up achievements here
          console.log(`Level up! Now level ${newLevel}`);
        }

        await StorageManager.saveUserStats({ ...currentStats, ...updates });
      } catch (error) {
        console.error('Error adding experience:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to add experience' });
      }
    },
    [state.userStats],
  );

  const selectClass = useCallback(
    async (classKey: FitnessClassKey) => {
      try {
        const updates: Partial<UserStats> = {
          selectedClass: classKey,
          lastActive: new Date().toISOString(),
        };

        dispatch({ type: 'UPDATE_USER_STATS', payload: updates });
        await StorageManager.saveUserStats({ ...state.userStats, ...updates });
      } catch (error) {
        console.error('Error selecting class:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to select class' });
      }
    },
    [state.userStats],
  );

  const updateBodyWeight = useCallback(
    async (weight: number) => {
      try {
        // const currentStats = ...; // Quick fix: commented unused variable
        // const weightHistory = ...; // Quick fix: commented unused variable

        // Add new weight entry
        weightHistory.push({
          weight,
          date: new Date().toISOString().split('T')[0],
        });

        // Keep only last 365 entries
        if (weightHistory.length > 365) {
          weightHistory.splice(0, weightHistory.length - 365);
        }

        const updates: Partial<UserStats> = {
          bodyWeight: weight,
          bodyWeightHistory: weightHistory,
          lastActive: new Date().toISOString(),
        };

        dispatch({ type: 'UPDATE_USER_STATS', payload: updates });
        await StorageManager.saveUserStats({ ...currentStats, ...updates });
      } catch (error) {
        console.error('Error updating body weight:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update body weight',
        });
      }
    },
    [state.userStats],
  );

  const updateGoal = useCallback(
    async (goalId: string, updates: any) => {
      try {
        // const currentStats = ...; // Quick fix: commented unused variable
        const personalizedGoals =
          currentStats.personalizedGoals?.map(goal =>
            goal.id === goalId ? { ...goal, ...updates } : goal,
          ) || [];

        const statsUpdates: Partial<UserStats> = {
          personalizedGoals,
          lastActive: new Date().toISOString(),
        };

        dispatch({ type: 'UPDATE_USER_STATS', payload: statsUpdates });
        await StorageManager.saveUserStats({
          ...currentStats,
          ...statsUpdates,
        });
      } catch (error) {
        console.error('Error updating goal:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update goal' });
      }
    },
    [state.userStats],
  );

  const unlockAchievement = useCallback(
    async (achievementId: string) => {
      try {
        const updates = {
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };

        dispatch({
          type: 'UPDATE_ACHIEVEMENT',
          payload: { id: achievementId, updates },
        });
        await StorageManager.saveAchievements(state.achievements);
      } catch (error) {
        console.error('Error unlocking achievement:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to unlock achievement',
        });
      }
    },
    [state.achievements],
  );

  const updateAchievementProgress = useCallback(
    async (achievementId: string, progress: number) => {
      try {
        const achievement = state.achievements.find(
          a => a.id === achievementId,
        );
        if (!achievement) return;

        const updates: Partial<Achievement> = { progress };

        if (
          achievement.target &&
          progress >= achievement.target &&
          !achievement.unlocked
        ) {
          updates.unlocked = true;
          updates.unlockedAt = new Date().toISOString();
        }

        dispatch({
          type: 'UPDATE_ACHIEVEMENT',
          payload: { id: achievementId, updates },
        });
        await StorageManager.saveAchievements(state.achievements);
      } catch (error) {
        console.error('Error updating achievement progress:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update achievement progress',
        });
      }
    },
    [state.achievements],
  );

  const updateQuestProgress = useCallback(
    async (questId: string, progress: number) => {
      try {
        // const quest = ...; // Quick fix: commented unused variable
        if (!quest || quest.completed) return;

        const updates: Partial<Quest> = { progress };

        if (progress >= quest.target) {
          updates.completed = true;
          updates.completedAt = new Date().toISOString();

          // Award quest rewards
          if (quest.reward.xp > 0) {
            addExperience(quest.reward.xp, `Quest: ${quest.title}`);
          }

          if (quest.reward.gems && quest.reward.gems > 0) {
            updateUserStats({
              gems: (state.userStats.gems || 0) + quest.reward.gems,
            });
          }
        }

        dispatch({ type: 'UPDATE_QUEST', payload: { id: questId, updates } });
        await StorageManager.saveQuests(state.quests);
      } catch (error) {
        console.error('Error updating quest progress:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to update quest progress',
        });
      }
    },
    [state.quests, addExperience, updateUserStats, state.userStats.gems],
  );

  const completeQuest = useCallback(
    async (questId: string) => {
      try {
        // const quest = ...; // Quick fix: commented unused variable
        if (!quest || quest.completed) return;

        await updateQuestProgress(questId, quest.target);
      } catch (error) {
        console.error('Error completing quest:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to complete quest' });
      }
    },
    [updateQuestProgress, state.quests],
  );

  const generateDailyQuests = useCallback(async () => {
    try {
      // Remove completed daily quests from yesterday
      // const today = ...; // Quick fix: commented unused variable
      const activeQuests = state.quests.filter(
        quest =>
          quest.type !== 'daily' ||
          !quest.completed ||
          new Date(quest.completedAt || '').toDateString() === today,
      );

      // Add new daily quests if needed
      const dailyQuests = activeQuests.filter(
        q => q.type === 'daily' && !q.completed,
      );

      if (dailyQuests.length < 3) {
        const newDailyQuests: Quest[] = [
          {
            id: `daily-workout-${Date.now()}`,
            title: 'Complete a Workout',
            description: 'Complete any workout to earn XP and gems',
            type: 'daily',
            progress: 0,
            target: 1,
            completed: false,
            reward: { xp: 50, gems: 10 },
          },
          {
            id: `daily-exercises-${Date.now()}`,
            title: 'Complete 5 Exercises',
            description:
              'Complete 5 different exercises in your workouts today',
            type: 'daily',
            progress: 0,
            target: 5,
            completed: false,
            reward: { xp: 75, gems: 15 },
          },
          {
            id: `daily-sets-${Date.now()}`,
            title: 'Complete 15 Sets',
            description: 'Complete 15 total sets across all exercises today',
            type: 'daily',
            progress: 0,
            target: 15,
            completed: false,
            reward: { xp: 100, gems: 20 },
          },
        ];

        const updatedQuests = [
          ...activeQuests,
          ...newDailyQuests.slice(0, 3 - dailyQuests.length),
        ];
        dispatch({ type: 'SET_QUESTS', payload: updatedQuests });
        await StorageManager.saveQuests(updatedQuests);
      }
    } catch (error) {
      console.error('Error generating daily quests:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to generate daily quests',
      });
    }
  }, [state.quests]);

  const resetUserStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_USER_STATS', payload: initialUserStats });
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: [] });
      dispatch({ type: 'SET_QUESTS', payload: [] });

      await Promise.all([
        StorageManager.clearUserStats(),
        StorageManager.clearAchievements(),
        StorageManager.clearQuests(),
      ]);
    } catch (error) {
      console.error('Error resetting user stats:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset user stats' });
    }
  }, []);

  const loadDemoStats = useCallback(async () => {
    try {
      const demoStats: UserStats = {
        ...initialUserStats,
        level: 15,
        experience: 3420,
        totalWorkouts: 47,
        currentStreak: 5,
        longestStreak: 12,
        totalLifted: 125000,
        bodyWeight: 180,
        selectedClass: 'powerlifter',
        gems: 1250,
      };

      dispatch({ type: 'SET_USER_STATS', payload: demoStats });
      await StorageManager.saveUserStats(demoStats);
    } catch (error) {
      console.error('Error loading demo stats:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load demo stats' });
    }
  }, []);

  const value: UserStatsContextValue = {
    // State
    userStats: state.userStats,
    achievements: state.achievements,
    quests: state.quests,
    loading: state.loading,
    error: state.error,

    // User Stats Actions
    updateUserStats,
    addExperience,
    selectClass,
    updateBodyWeight,
    updateGoal,

    // Achievement Actions
    unlockAchievement,
    updateAchievementProgress,

    // Quest Actions
    updateQuestProgress,
    completeQuest,
    generateDailyQuests,

    // Utility Actions
    resetUserStats,
    loadDemoStats,
  };

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = (): UserStatsContextValue => {
  // const context = ...; // Quick fix: commented unused variable
  if (!context) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};

export default UserStatsContext;
