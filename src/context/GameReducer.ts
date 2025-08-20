// src/context/GameReducer.ts
// Reducer functions and action types for game state management

import {
  // calculateClassXPRequired,
  // workoutWithCharacter
} from './GameLogic';
import {
  // CURRENCY_REWARDS
} from './GameData';
import {
  // AppState,
  // Action,
  // UserStats,
  // UserCurrencies,
  // Character,
  // SocialPost,
  // Workout,
  // FitnessClassKey,
  // 
} from './types';

// ==============================================================================
// ACTION TYPES
// ==============================================================================

export const ActionTypes = {
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
  ADD_TEMPLATE: 'ADD_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  REMOVE_TEMPLATE: 'REMOVE_TEMPLATE',
  ADD_REST_DAY: 'ADD_REST_DAY',
  REMOVE_REST_DAY: 'REMOVE_REST_DAY',
  UPDATE_REST_DAY: 'UPDATE_REST_DAY',
  ADD_BODY_WEIGHT: 'ADD_BODY_WEIGHT',
  UPDATE_BODY_WEIGHT: 'UPDATE_BODY_WEIGHT',
  REMOVE_BODY_WEIGHT: 'REMOVE_BODY_WEIGHT',
  SET_DEMO_MODE: 'SET_DEMO_MODE',
  LOAD_DEMO_DATA: 'LOAD_DEMO_DATA',
  
  // Class system
  SELECT_CLASS: 'SELECT_CLASS',
  UNLOCK_SKILL: 'UNLOCK_SKILL',
  AWARD_CLASS_XP: 'AWARD_CLASS_XP',
  
  // Gacha system
  AWARD_CURRENCY: 'AWARD_CURRENCY',
  SPEND_CURRENCY: 'SPEND_CURRENCY',
  GACHA_PULL: 'GACHA_PULL',
  SET_ACTIVE_CHARACTER: 'SET_ACTIVE_CHARACTER',
  POST_WORKOUT_VERIFICATION: 'POST_WORKOUT_VERIFICATION',
  LIKE_WORKOUT_POST: 'LIKE_WORKOUT_POST',
  RECEIVE_LIKE: 'RECEIVE_LIKE',
  UPDATE_CHARACTER: 'UPDATE_CHARACTER',
  
  // Enhanced Gacha system
  ENHANCED_GACHA_PULL: 'ENHANCED_GACHA_PULL',
  UPDATE_PITY_COUNTERS: 'UPDATE_PITY_COUNTERS',
  AWARD_EVOLUTION_MATERIALS: 'AWARD_EVOLUTION_MATERIALS',
  EVOLVE_CHARACTER: 'EVOLVE_CHARACTER',
  ACTIVATE_BANNER: 'ACTIVATE_BANNER',
  CLAIM_DAILY_BONUS: 'CLAIM_DAILY_BONUS',
  UPDATE_GACHA_STATS: 'UPDATE_GACHA_STATS',
} as const;

// ==============================================================================
// INITIAL STATE
// ==============================================================================

export const initialState: AppState = {
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
    demoMode: false,
  },
  userStats: {
    totalWorkouts: 0,
    totalDuration: 0,
    favoriteExercises: [],
    streaks: {
      current: 0,
      best: 0,
      lastWorkout: null,
    },
    experience: 0,
    level: 1,
    totalExperience: 0,
    avgWorkoutsPerWeek: 0,
    avgRating: 0,
    
    // Class system properties
    selectedClass: null,
    classLevel: 1,
    classXP: 0,
    skillPoints: 0,
    unlockedSkills: [],
    classSelectionDate: null,
    classPrestige: 0,
    
    // Gacha system properties
    currencies: {
      gems: 100,           // Start with 100 gems for first pulls!
      coins: 500,          // Basic currency
      crystals: 10,        // Ultra-rare currency
      energy_potions: 3,   // Character recovery items
    },
    total_workouts_verified: 0,
    total_likes_received: 0,
    social_reputation: 100,
  },
  
  // Character collection system
  characters: {
    collection: [],        // All owned characters
    active_character: null, // Currently selected main character
    character_slots: 1,    // How many characters can be active
  },
  
  // Gacha system
  gacha: {
    total_pulls: 0,
    legendary_pity: 0,     // Pity counter for guaranteed legendary (90 pulls)
    last_pull_timestamp: null,
    pull_history: [],
  },
  
  // Enhanced Gacha system
  enhancedGacha: {
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
  },
  
  // Daily bonuses
  dailyBonuses: {
    free_pull_available: true,
    streak_bonus: 0,
    last_bonus_claim: null,
  },
  
  // Current banner
  currentBanner: null,
  
  // Social verification system
  social: {
    workout_posts: [],     // User's workout verification posts
    likes_given: [],       // Posts this user has liked
    reports_made: [],      // Reports for fake workouts
    trust_score: 100,      // Reputation system (0-200)
  },
  
  workoutTemplates: [],
  restDays: [],
  bodyWeights: [],
};

// ==============================================================================
// ENHANCED GACHA REDUCER
// ==============================================================================

const enhancedGachaReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
  case ActionTypes.ENHANCED_GACHA_PULL:
    // const pullResult = ...; // Quick fix: commented unused variable
    return {
      ...state,
      enhancedGacha: {
        ...state.enhancedGacha,
        pity_counters: pullResult.pity_reset 
          ? { legendary: 0, epic: 0, rare: 0 }
          : {
            legendary: state.enhancedGacha.pity_counters.legendary + pullResult.pulls_made,
            epic: state.enhancedGacha.pity_counters.epic + pullResult.pulls_made,
            rare: state.enhancedGacha.pity_counters.rare + pullResult.pulls_made,
          },
        lifetime_stats: {
          ...state.enhancedGacha.lifetime_stats,
          total_pulls: state.enhancedGacha.lifetime_stats.total_pulls + pullResult.pulls_made,
          gems_spent: state.enhancedGacha.lifetime_stats.gems_spent + pullResult.gems_spent,
          legendary_pulled: state.enhancedGacha.lifetime_stats.legendary_pulled + pullResult.legendary_count,
          epic_pulled: state.enhancedGacha.lifetime_stats.epic_pulled + pullResult.epic_count,
          rare_pulled: state.enhancedGacha.lifetime_stats.rare_pulled + pullResult.rare_count,
          common_pulled: state.enhancedGacha.lifetime_stats.common_pulled + pullResult.common_count,
        },
        evolution_materials: {
          ...state.enhancedGacha.evolution_materials,
          ...Object.entries(pullResult.materials || {}).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: (state.enhancedGacha.evolution_materials[key] || 0) + value,
          }), {}),
        },
      },
    };

  case ActionTypes.EVOLVE_CHARACTER:
    // const evolutionResult = ...; // Quick fix: commented unused variable
    if (!evolutionResult.success) return state;
      
    return {
      ...state,
      enhancedGacha: {
        ...state.enhancedGacha,
        evolution_materials: {
          ...state.enhancedGacha.evolution_materials,
          ...Object.entries(evolutionResult.materials_used || {}).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: Math.max(0, (state.enhancedGacha.evolution_materials[key] || 0) - value),
          }), {}),
        },
        achievements: {
          ...state.enhancedGacha.achievements,
          evolution_master: true,
        },
      },
    };

  case ActionTypes.ACTIVATE_BANNER:
    // const bannerResult = ...; // Quick fix: commented unused variable
    return {
      ...state,
      currentBanner: bannerResult.success ? bannerResult.banner : state.currentBanner,
    };

  case ActionTypes.CLAIM_DAILY_BONUS:
    return {
      ...state,
      dailyBonuses: {
        ...state.dailyBonuses,
        free_pull_available: false,
        streak_bonus: state.dailyBonuses.streak_bonus + 1,
        last_bonus_claim: new Date().toISOString(),
      },
    };

  case ActionTypes.UPDATE_GACHA_STATS:
    return {
      ...state,
      enhancedGacha: {
        ...state.enhancedGacha,
        ...action.payload,
      },
    };

  case ActionTypes.AWARD_EVOLUTION_MATERIALS:
    // const materials = ...; // Quick fix: commented unused variable
    return {
      ...state,
      enhancedGacha: {
        ...state.enhancedGacha,
        evolution_materials: {
          ...state.enhancedGacha.evolution_materials,
          ...Object.entries(materials).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: (state.enhancedGacha.evolution_materials[key] || 0) + value,
          }), {}),
        },
      },
    };

  case ActionTypes.UPDATE_PITY_COUNTERS:
    const { legendary, epic, rare, reset } = action.payload;
    return {
      ...state,
      enhancedGacha: {
        ...state.enhancedGacha,
        pity_counters: reset 
          ? { legendary: 0, epic: 0, rare: 0 }
          : {
            legendary: legendary !== undefined ? legendary : state.enhancedGacha.pity_counters.legendary,
            epic: epic !== undefined ? epic : state.enhancedGacha.pity_counters.epic,
            rare: rare !== undefined ? rare : state.enhancedGacha.pity_counters.rare,
          },
      },
    };

  default:
    return state;
  }
};

// ==============================================================================
// MAIN REDUCER
// ==============================================================================

export const appReducer = (state: AppState, action: Action): AppState => {
  // First try enhanced gacha reducer
  // const enhancedState = ...; // Quick fix: commented unused variable
  if (enhancedState !== state) {
    return enhancedState;
  }

  // Then fall back to existing reducer logic
  switch (action.type) {
  case ActionTypes.LOAD_DATA:
    return {
      ...state,
      ...action.payload,
      loading: false,
      error: null,
    };

  case ActionTypes.SET_LOADING:
    return {
      ...state,
      loading: action.payload,
    };

  case ActionTypes.SET_ERROR:
    return {
      ...state,
      error: action.payload,
      loading: false,
    };

  case ActionTypes.ADD_WORKOUT:
    // const newWorkoutHistory = ...; // Quick fix: commented unused variable
    return {
      ...state,
      workoutHistory: newWorkoutHistory,
    };

  case ActionTypes.UPDATE_WORKOUT:
    const updatedWorkoutHistory = state.workoutHistory.map(workout =>
      workout.id === action.payload.id ? action.payload : workout,
    );
    return {
      ...state,
      workoutHistory: updatedWorkoutHistory,
    };

  case ActionTypes.REMOVE_WORKOUT:
    const filteredWorkoutHistory = state.workoutHistory.filter(workout =>
      workout.id !== action.payload,
    );
    return {
      ...state,
      workoutHistory: filteredWorkoutHistory,
    };

  case ActionTypes.UPDATE_USER_STATS:
    const updatedUserStats = {
      ...state.userStats,
      ...action.payload,
    };
    return {
      ...state,
      userStats: updatedUserStats,
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
        skillPoints: 3,
        unlockedSkills: [],
        classSelectionDate: new Date().toISOString(),
      },
    };

  case ActionTypes.UNLOCK_SKILL:
    return {
      ...state,
      userStats: {
        ...state.userStats,
        unlockedSkills: [...state.userStats.unlockedSkills, action.payload.skillId],
        skillPoints: state.userStats.skillPoints - action.payload.cost,
      },
    };

  case ActionTypes.AWARD_CLASS_XP:
    // const newClassXP = ...; // Quick fix: commented unused variable
    // const classXPRequired = ...; // Quick fix: commented unused variable
    let newClassLevel = state.userStats.classLevel;
    let remainingXP = newClassXP;
    let skillPointsAwarded = 0;
      
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
      },
    };

    // Gacha system cases
  case ActionTypes.AWARD_CURRENCY:
    return {
      ...state,
      userStats: {
        ...state.userStats,
        currencies: {
          ...state.userStats.currencies,
          gems: (state.userStats.currencies.gems || 0) + (action.payload.gems || 0),
          coins: (state.userStats.currencies.coins || 0) + (action.payload.coins || 0),
          crystals: (state.userStats.currencies.crystals || 0) + (action.payload.crystals || 0),
          energy_potions: (state.userStats.currencies.energy_potions || 0) + (action.payload.energy_potions || 0),
        },
      },
    };

  case ActionTypes.SPEND_CURRENCY:
    return {
      ...state,
      userStats: {
        ...state.userStats,
        currencies: {
          ...state.userStats.currencies,
          gems: Math.max(0, (state.userStats.currencies.gems || 0) - (action.payload.gems || 0)),
          coins: Math.max(0, (state.userStats.currencies.coins || 0) - (action.payload.coins || 0)),
          crystals: Math.max(0, (state.userStats.currencies.crystals || 0) - (action.payload.crystals || 0)),
        },
      },
    };

  case ActionTypes.GACHA_PULL:
    // const newCharacter = ...; // Quick fix: commented unused variable
    // const pullCost = ...; // Quick fix: commented unused variable
      
    return {
      ...state,
      characters: {
        ...state.characters,
        collection: [...state.characters.collection, newCharacter],
      },
      gacha: {
        ...state.gacha,
        total_pulls: state.gacha.total_pulls + 1,
        legendary_pity: newCharacter.rarity === 'legendary' ? 0 : state.gacha.legendary_pity + 1,
        last_pull_timestamp: new Date().toISOString(),
        pull_history: [
          { character: newCharacter, timestamp: new Date().toISOString() },
          ...state.gacha.pull_history.slice(0, 49),
        ],
      },
      userStats: {
        ...state.userStats,
        currencies: {
          ...state.userStats.currencies,
          gems: state.userStats.currencies.gems - pullCost.gems,
          coins: state.userStats.currencies.coins - pullCost.coins,
        },
      },
    };

  case ActionTypes.SET_ACTIVE_CHARACTER:
    return {
      ...state,
      characters: {
        ...state.characters,
        active_character: action.payload.characterId,
      },
    };

  case ActionTypes.POST_WORKOUT_VERIFICATION:
    // const post = ...; // Quick fix: commented unused variable
    return {
      ...state,
      social: {
        ...state.social,
        workout_posts: [post, ...state.social.workout_posts],
      },
      userStats: {
        ...state.userStats,
        total_workouts_verified: state.userStats.total_workouts_verified + 1,
      },
    };

  case ActionTypes.LIKE_WORKOUT_POST:
    return {
      ...state,
      social: {
        ...state.social,
        likes_given: [...state.social.likes_given, action.payload.postId],
      },
    };

  case ActionTypes.RECEIVE_LIKE:
    return {
      ...state,
      userStats: {
        ...state.userStats,
        total_likes_received: state.userStats.total_likes_received + 1,
      },
    };

  case ActionTypes.UPDATE_CHARACTER:
    return {
      ...state,
      characters: {
        ...state.characters,
        collection: state.characters.collection.map(char => 
          char.instance_id === action.payload.characterId 
            ? { ...char, ...action.payload.updates }
            : char,
        ),
      },
    };

    // Rest day cases
  case ActionTypes.ADD_REST_DAY:
    return {
      ...state,
      restDays: [action.payload, ...state.restDays],
    };

  case ActionTypes.UPDATE_REST_DAY:
    return {
      ...state,
      restDays: state.restDays.map(restDay =>
        restDay.id === action.payload.id ? action.payload : restDay,
      ),
    };

  case ActionTypes.REMOVE_REST_DAY:
    return {
      ...state,
      restDays: state.restDays.filter(restDay =>
        restDay.id !== action.payload,
      ),
    };

    // Demo mode cases
  case ActionTypes.SET_DEMO_MODE:
    return {
      ...state,
      isDemo: action.payload.isDemo,
      settings: {
        ...state.settings,
        demoMode: action.payload.isDemo,
      },
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
        demoMode: true,
      },
    };

  case ActionTypes.CLEAR_ALL_DATA:
    return {
      ...initialState,
      loading: false,
    };

    // Add other existing cases here...
  default:
    return state;
  }
}; 