// src/context/contexts/GachaContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import StorageManager from '../../utils/StorageManager';
import { Character, UserCurrencies, SocialPost } from '../types';
import {
  performGachaPull,
  workoutWithCharacter,
  createWorkoutPost,
} from '../GameLogic';
import { EnhancedGachaManager } from '../EnhancedGachaManager';
import { EnhancedGachaState } from '../EnhancedGachaSystem';

interface Banner {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  featured: Character[];
  rateUp: {
    character: Character;
    multiplier: number;
  }[];
  active: boolean;
}

interface DailyBonuses {
  lastClaimedDate: string;
  streak: number;
  maxStreak: number;
  bonuses: {
    day: number;
    gems: number;
    items: string[];
    claimed: boolean;
  }[];
}

interface GachaState {
  characterCollection: Character[];
  socialPosts: SocialPost[];
  userCurrencies: UserCurrencies;
  dailyBonuses: DailyBonuses;
  currentBanner: Banner | null;
  enhancedGacha: EnhancedGachaState;
  loading: boolean;
  error: string | null;
}

interface GachaContextValue {
  // State
  characterCollection: Character[];
  socialPosts: SocialPost[];
  userCurrencies: UserCurrencies;
  dailyBonuses: DailyBonuses;
  currentBanner: Banner | null;
  enhancedGacha: EnhancedGachaState;
  loading: boolean;
  error: string | null;

  // Gacha Actions
  performPull: (pullType: 'single' | 'ten_pull') => Promise<Character[]>;
  performEnhancedPull: (pullType: 'single' | 'ten_pull') => Promise<any>;
  evolveCharacter: (characterId: string) => Promise<void>;

  // Character Actions
  addCharacter: (character: Character) => Promise<void>;
  updateCharacter: (
    characterId: string,
    updates: Partial<Character>
  ) => Promise<void>;
  favoriteCharacter: (characterId: string, favorite: boolean) => Promise<void>;

  // Currency Actions
  updateCurrencies: (updates: Partial<UserCurrencies>) => Promise<void>;
  spendGems: (amount: number, reason: string) => Promise<boolean>;
  earnGems: (amount: number, reason: string) => Promise<void>;

  // Social Actions
  createPost: (
    content: string,
    workout: any,
    character?: Character
  ) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  // Banner Actions
  activateBanner: (bannerId: string) => Promise<void>;
  getAvailableBanners: () => Banner[];

  // Daily Bonus Actions
  claimDailyBonus: () => Promise<void>;
  resetDailyBonuses: () => Promise<void>;

  // Enhanced Gacha System
  gachaManager: EnhancedGachaManager;
  canPerformPull: (pullType: 'single' | 'ten_pull') => boolean;
  getPullCost: (pullType: 'single' | 'ten_pull') => number;
  getGachaOverview: () => any;
  getPityInsights: () => any;

  // Utility Actions
  clearGachaData: () => Promise<void>;
  loadDemoData: () => Promise<void>;
}

type GachaAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHARACTERS'; payload: Character[] }
  | { type: 'ADD_CHARACTER'; payload: Character }
  | {
      type: 'UPDATE_CHARACTER';
      payload: { id: string; updates: Partial<Character> };
    }
  | { type: 'SET_SOCIAL_POSTS'; payload: SocialPost[] }
  | { type: 'ADD_SOCIAL_POST'; payload: SocialPost }
  | {
      type: 'UPDATE_SOCIAL_POST';
      payload: { id: string; updates: Partial<SocialPost> };
    }
  | { type: 'DELETE_SOCIAL_POST'; payload: string }
  | { type: 'SET_CURRENCIES'; payload: UserCurrencies }
  | { type: 'UPDATE_CURRENCIES'; payload: Partial<UserCurrencies> }
  | { type: 'SET_DAILY_BONUSES'; payload: DailyBonuses }
  | { type: 'UPDATE_DAILY_BONUSES'; payload: Partial<DailyBonuses> }
  | { type: 'SET_CURRENT_BANNER'; payload: Banner | null }
  | { type: 'SET_ENHANCED_GACHA'; payload: EnhancedGachaState }
  | { type: 'UPDATE_ENHANCED_GACHA'; payload: Partial<EnhancedGachaState> };

const initialDailyBonuses: DailyBonuses = {
  lastClaimedDate: '',
  streak: 0,
  maxStreak: 0,
  bonuses: Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    gems: (index + 1) * 10,
    items: index === 6 ? ['rare_character'] : [],
    claimed: false,
  })),
};

const initialEnhancedGachaState: EnhancedGachaState = {
  pity_counters: {
    legendary: 0,
    epic: 0,
    rare: 0,
  },
  lifetime_stats: {
    total_pulls: 0,
    gems_spent: 0,
    legendary_pulled: 0,
    epic_pulled: 0,
    rare_pulled: 0,
    common_pulled: 0,
  },
  evolution_materials: {},
  achievements: {
    evolution_master: false,
  },
};

const initialGachaState: GachaState = {
  characterCollection: [],
  socialPosts: [],
  userCurrencies: {
    gems: 100,
    coins: 0,
    energyPoints: 100,
    premiumCurrency: 0,
  },
  dailyBonuses: initialDailyBonuses,
  currentBanner: null,
  enhancedGacha: initialEnhancedGachaState,
  loading: false,
  error: null,
};

const gachaReducer = (state: GachaState, action: GachaAction): GachaState => {
  switch (action.type) {
  case 'SET_LOADING':
    return { ...state, loading: action.payload };
  case 'SET_ERROR':
    return { ...state, error: action.payload };
  case 'SET_CHARACTERS':
    return { ...state, characterCollection: action.payload };
  case 'ADD_CHARACTER':
    return {
      ...state,
      characterCollection: [...state.characterCollection, action.payload],
    };
  case 'UPDATE_CHARACTER':
    return {
      ...state,
      characterCollection: state.characterCollection.map(char =>
        char.id === action.payload.id
          ? { ...char, ...action.payload.updates }
          : char,
      ),
    };
  case 'SET_SOCIAL_POSTS':
    return { ...state, socialPosts: action.payload };
  case 'ADD_SOCIAL_POST':
    return { ...state, socialPosts: [action.payload, ...state.socialPosts] };
  case 'UPDATE_SOCIAL_POST':
    return {
      ...state,
      socialPosts: state.socialPosts.map(post =>
        post.id === action.payload.id
          ? { ...post, ...action.payload.updates }
          : post,
      ),
    };
  case 'DELETE_SOCIAL_POST':
    return {
      ...state,
      socialPosts: state.socialPosts.filter(
        post => post.id !== action.payload,
      ),
    };
  case 'SET_CURRENCIES':
    return { ...state, userCurrencies: action.payload };
  case 'UPDATE_CURRENCIES':
    return {
      ...state,
      userCurrencies: { ...state.userCurrencies, ...action.payload },
    };
  case 'SET_DAILY_BONUSES':
    return { ...state, dailyBonuses: action.payload };
  case 'UPDATE_DAILY_BONUSES':
    return {
      ...state,
      dailyBonuses: { ...state.dailyBonuses, ...action.payload },
    };
  case 'SET_CURRENT_BANNER':
    return { ...state, currentBanner: action.payload };
  case 'SET_ENHANCED_GACHA':
    return { ...state, enhancedGacha: action.payload };
  case 'UPDATE_ENHANCED_GACHA':
    return {
      ...state,
      enhancedGacha: { ...state.enhancedGacha, ...action.payload },
    };
  default:
    return state;
  }
};

const GachaContext = createContext<GachaContextValue | undefined>(undefined);

interface GachaProviderProps {
  children: ReactNode;
}

export const GachaProvider: React.FC<GachaProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gachaReducer, initialGachaState);
  const gachaManager = React.useMemo(() => new EnhancedGachaManager(), []);

  // Load gacha data on mount
  React.useEffect(() => {
    const loadGachaData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [characters, posts, currencies, dailyBonuses, enhancedGacha] =
          await Promise.all([
            StorageManager.getCharacterCollection(),
            StorageManager.getSocialPosts(),
            StorageManager.getUserCurrencies(),
            StorageManager.getDailyBonuses(),
            StorageManager.getEnhancedGachaState(),
          ]);

        dispatch({ type: 'SET_CHARACTERS', payload: characters || [] });
        dispatch({ type: 'SET_SOCIAL_POSTS', payload: posts || [] });
        dispatch({
          type: 'SET_CURRENCIES',
          payload: currencies || initialGachaState.userCurrencies,
        });
        dispatch({
          type: 'SET_DAILY_BONUSES',
          payload: dailyBonuses || initialDailyBonuses,
        });
        dispatch({
          type: 'SET_ENHANCED_GACHA',
          payload: enhancedGacha || initialEnhancedGachaState,
        });
      } catch (error) {
        console.error('Error loading gacha data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load gacha data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadGachaData();
  }, []);

  const performPull = useCallback(
    async (pullType: 'single' | 'ten_pull'): Promise<Character[]> => {
      try {
        const pullCount = pullType === 'single' ? 1 : 10;
        const cost = pullType === 'single' ? 10 : 90;

        if (state.userCurrencies.gems < cost) {
          throw new Error('Insufficient gems');
        }

        const results: Character[] = [];
        for (let i = 0; i < pullCount; i++) {
          const character = performGachaPull(
            state.characterCollection,
            state.currentBanner,
          );
          results.push(character);
          dispatch({ type: 'ADD_CHARACTER', payload: character });
        }

        // Deduct gems
        dispatch({
          type: 'UPDATE_CURRENCIES',
          payload: { gems: state.userCurrencies.gems - cost },
        });

        // Save updated data
        await Promise.all([
          StorageManager.saveCharacterCollection(state.characterCollection),
          StorageManager.saveUserCurrencies(state.userCurrencies),
        ]);

        return results;
      } catch (error) {
        console.error('Error performing pull:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to perform pull' });
        throw error;
      }
    },
    [state.userCurrencies.gems, state.characterCollection, state.currentBanner],
  );

  const performEnhancedPull = useCallback(
    async (pullType: 'single' | 'ten_pull') => {
      try {
        return await gachaManager.performPull(pullType, state.enhancedGacha);
      } catch (error) {
        console.error('Error performing enhanced pull:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to perform enhanced pull',
        });
        throw error;
      }
    },
    [gachaManager, state.enhancedGacha],
  );

  const evolveCharacter = useCallback(
    async (characterId: string) => {
      try {
        const character = state.characterCollection.find(
          c => c.id === characterId,
        );
        if (!character) throw new Error('Character not found');

        // Evolution logic would go here
        const evolvedCharacter = { ...character, level: character.level + 1 };

        dispatch({
          type: 'UPDATE_CHARACTER',
          payload: { id: characterId, updates: evolvedCharacter },
        });
        await StorageManager.saveCharacterCollection(state.characterCollection);
      } catch (error) {
        console.error('Error evolving character:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to evolve character' });
      }
    },
    [state.characterCollection],
  );

  const addCharacter = useCallback(
    async (character: Character) => {
      try {
        dispatch({ type: 'ADD_CHARACTER', payload: character });
        await StorageManager.saveCharacterCollection([
          ...state.characterCollection,
          character,
        ]);
      } catch (error) {
        console.error('Error adding character:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to add character' });
      }
    },
    [state.characterCollection],
  );

  const updateCharacter = useCallback(
    async (characterId: string, updates: Partial<Character>) => {
      try {
        dispatch({
          type: 'UPDATE_CHARACTER',
          payload: { id: characterId, updates },
        });
        await StorageManager.saveCharacterCollection(state.characterCollection);
      } catch (error) {
        console.error('Error updating character:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update character' });
      }
    },
    [state.characterCollection],
  );

  const favoriteCharacter = useCallback(
    async (characterId: string, favorite: boolean) => {
      try {
        await updateCharacter(characterId, { isFavorite: favorite });
      } catch (error) {
        console.error('Error favoriting character:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to favorite character',
        });
      }
    },
    [updateCharacter],
  );

  const updateCurrencies = useCallback(
    async (updates: Partial<UserCurrencies>) => {
      try {
        dispatch({ type: 'UPDATE_CURRENCIES', payload: updates });
        const newCurrencies = { ...state.userCurrencies, ...updates };
        await StorageManager.saveUserCurrencies(newCurrencies);
      } catch (error) {
        console.error('Error updating currencies:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update currencies' });
      }
    },
    [state.userCurrencies],
  );

  const spendGems = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      try {
        if (state.userCurrencies.gems < amount) {
          return false;
        }

        await updateCurrencies({ gems: state.userCurrencies.gems - amount });
        console.log(`Spent ${amount} gems for: ${reason}`);
        return true;
      } catch (error) {
        console.error('Error spending gems:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to spend gems' });
        return false;
      }
    },
    [state.userCurrencies.gems, updateCurrencies],
  );

  const earnGems = useCallback(
    async (amount: number, reason: string) => {
      try {
        await updateCurrencies({ gems: state.userCurrencies.gems + amount });
        console.log(`Earned ${amount} gems from: ${reason}`);
      } catch (error) {
        console.error('Error earning gems:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to earn gems' });
      }
    },
    [state.userCurrencies.gems, updateCurrencies],
  );

  const createPost = useCallback(
    async (content: string, workout: any, character?: Character) => {
      try {
        const post = createWorkoutPost(content, workout, character);
        dispatch({ type: 'ADD_SOCIAL_POST', payload: post });
        await StorageManager.saveSocialPost(post);
      } catch (error) {
        console.error('Error creating post:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to create post' });
      }
    },
    [],
  );

  const likePost = useCallback(
    async (postId: string) => {
      try {
        const post = state.socialPosts.find(p => p.id === postId);
        if (!post) return;

        const updates = {
          likes: post.likes + 1,
          likedByUser: true,
        };

        dispatch({
          type: 'UPDATE_SOCIAL_POST',
          payload: { id: postId, updates },
        });
        await StorageManager.saveSocialPosts(state.socialPosts);
      } catch (error) {
        console.error('Error liking post:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to like post' });
      }
    },
    [state.socialPosts],
  );

  const deletePost = useCallback(async (postId: string) => {
    try {
      dispatch({ type: 'DELETE_SOCIAL_POST', payload: postId });
      await StorageManager.deleteSocialPost(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete post' });
    }
  }, []);

  const activateBanner = useCallback(async (bannerId: string) => {
    try {
      // Banner activation logic would go here
      console.log(`Activating banner: ${bannerId}`);
    } catch (error) {
      console.error('Error activating banner:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to activate banner' });
    }
  }, []);

  const getAvailableBanners = useCallback((): Banner[] => {
    // Return available banners - this would typically come from a server
    return [];
  }, []);

  const claimDailyBonus = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const { dailyBonuses } = state;

      if (dailyBonuses.lastClaimedDate === today) {
        throw new Error('Daily bonus already claimed today');
      }

      const nextDay = dailyBonuses.streak + 1;
      const bonus = dailyBonuses.bonuses.find(b => b.day === nextDay);

      if (!bonus) {
        throw new Error('No bonus available');
      }

      // Award bonus
      await earnGems(bonus.gems, 'Daily bonus');

      const updates = {
        lastClaimedDate: today,
        streak: nextDay > 7 ? 1 : nextDay,
        maxStreak: Math.max(dailyBonuses.maxStreak, nextDay),
      };

      dispatch({ type: 'UPDATE_DAILY_BONUSES', payload: updates });
      await StorageManager.saveDailyBonuses({ ...dailyBonuses, ...updates });
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to claim daily bonus' });
    }
  }, [state.dailyBonuses, earnGems]);

  const resetDailyBonuses = useCallback(async () => {
    try {
      dispatch({ type: 'SET_DAILY_BONUSES', payload: initialDailyBonuses });
      await StorageManager.saveDailyBonuses(initialDailyBonuses);
    } catch (error) {
      console.error('Error resetting daily bonuses:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset daily bonuses' });
    }
  }, []);

  const canPerformPull = useCallback(
    (pullType: 'single' | 'ten_pull'): boolean => {
      const cost = pullType === 'single' ? 10 : 90;
      return state.userCurrencies.gems >= cost;
    },
    [state.userCurrencies.gems],
  );

  const getPullCost = useCallback((pullType: 'single' | 'ten_pull'): number => {
    return pullType === 'single' ? 10 : 90;
  }, []);

  const getGachaOverview = useCallback(() => {
    return gachaManager.getGachaOverview(state.enhancedGacha);
  }, [gachaManager, state.enhancedGacha]);

  const getPityInsights = useCallback(() => {
    return gachaManager.getPityInsights(state.enhancedGacha);
  }, [gachaManager, state.enhancedGacha]);

  const clearGachaData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CHARACTERS', payload: [] });
      dispatch({ type: 'SET_SOCIAL_POSTS', payload: [] });
      dispatch({
        type: 'SET_CURRENCIES',
        payload: initialGachaState.userCurrencies,
      });
      dispatch({ type: 'SET_DAILY_BONUSES', payload: initialDailyBonuses });
      dispatch({
        type: 'SET_ENHANCED_GACHA',
        payload: initialEnhancedGachaState,
      });

      await Promise.all([
        StorageManager.clearCharacterCollection(),
        StorageManager.clearSocialPosts(),
        StorageManager.clearUserCurrencies(),
        StorageManager.clearDailyBonuses(),
        StorageManager.clearEnhancedGachaState(),
      ]);
    } catch (error) {
      console.error('Error clearing gacha data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear gacha data' });
    }
  }, []);

  const loadDemoData = useCallback(async () => {
    try {
      // Load demo characters, currencies, etc.
      const demoCurrencies: UserCurrencies = {
        gems: 1000,
        coins: 50000,
        energyPoints: 100,
        premiumCurrency: 25,
      };

      dispatch({ type: 'SET_CURRENCIES', payload: demoCurrencies });
      await StorageManager.saveUserCurrencies(demoCurrencies);
    } catch (error) {
      console.error('Error loading demo data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load demo data' });
    }
  }, []);

  const value: GachaContextValue = {
    // State
    characterCollection: state.characterCollection,
    socialPosts: state.socialPosts,
    userCurrencies: state.userCurrencies,
    dailyBonuses: state.dailyBonuses,
    currentBanner: state.currentBanner,
    enhancedGacha: state.enhancedGacha,
    loading: state.loading,
    error: state.error,

    // Gacha Actions
    performPull,
    performEnhancedPull,
    evolveCharacter,

    // Character Actions
    addCharacter,
    updateCharacter,
    favoriteCharacter,

    // Currency Actions
    updateCurrencies,
    spendGems,
    earnGems,

    // Social Actions
    createPost,
    likePost,
    deletePost,

    // Banner Actions
    activateBanner,
    getAvailableBanners,

    // Daily Bonus Actions
    claimDailyBonus,
    resetDailyBonuses,

    // Enhanced Gacha System
    gachaManager,
    canPerformPull,
    getPullCost,
    getGachaOverview,
    getPityInsights,

    // Utility Actions
    clearGachaData,
    loadDemoData,
  };

  return (
    <GachaContext.Provider value={value}>{children}</GachaContext.Provider>
  );
};

export const useGacha = (): GachaContextValue => {
  const context = useContext(GachaContext);
  if (!context) {
    throw new Error('useGacha must be used within a GachaProvider');
  }
  return context;
};

export default GachaContext;
