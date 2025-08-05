// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageManager from '../utils/StorageManager';

// ==============================================================================
// GAME DATA - Moved here to avoid circular dependencies
// ==============================================================================

// Class system data
const FITNESS_CLASSES = {
  powerlifter: {
    name: "POWERLIFTER",
    subtitle: "The Iron Warrior",
    emoji: "🏋️‍♂️",
    quote: "Strength is earned, not given.",
    description: "Master of raw strength. Dominates the big three: squat, bench, deadlift.",
    philosophy: "STRENGTH ABOVE ALL",
    color: "#8B0000",
    bgGradient: ["#8B0000", "#4A0000"],
    bonuses: {
      compoundLiftXP: 2.0,
      strengthTrainingXP: 1.5,
      maxWeightBonus: 1.25,
      powerMoveXP: 1.8
    },
    preferredExercises: ["squat", "deadlift", "bench_press", "overhead_press"],
    skillTree: "strength_mastery",
    stats: { power: 10, technique: 6, endurance: 4, flexibility: 2, mental: 8 }
  },
  bodybuilder: {
    name: "BODYBUILDER",
    subtitle: "The Sculptor",
    emoji: "💪",
    quote: "Perfection through precision.",
    description: "Artist of aesthetics. Masters isolation and perfect form.",
    philosophy: "AESTHETICS THROUGH PRECISION",
    color: "#FFD700",
    bgGradient: ["#FFD700", "#B8860B"],
    bonuses: {
      isolationXP: 1.8,
      volumeBonus: 1.4,
      varietyXP: 1.6,
      aestheticXP: 2.0
    },
    preferredExercises: ["cable_fly", "lateral_raise", "bicep_curl", "tricep_extension"],
    skillTree: "aesthetic_mastery",
    stats: { power: 6, technique: 10, endurance: 5, flexibility: 4, mental: 5 }
  },
  athlete: {
    name: "ATHLETE",
    subtitle: "The Competitor",
    emoji: "🏃‍♂️",
    quote: "Train like you compete.",
    description: "Peak performance through functional movement and conditioning.",
    philosophy: "PERFORMANCE IS EVERYTHING",
    color: "#1E90FF",
    bgGradient: ["#1E90FF", "#0047AB"],
    bonuses: {
      cardioXP: 2.0,
      functionalXP: 1.7,
      recoveryBonus: 1.3,
      explosiveXP: 1.9
    },
    preferredExercises: ["burpees", "box_jumps", "battle_ropes", "sprints"],
    skillTree: "performance_mastery",
    stats: { power: 7, technique: 7, endurance: 10, flexibility: 6, mental: 7 }
  },
  yogi: {
    name: "YOGI",
    subtitle: "The Harmonizer",
    emoji: "🧘‍♀️",
    quote: "Strength through serenity.",
    description: "Balance of mind, body, and spirit through flow and control.",
    philosophy: "MIND BODY SPIRIT UNITY",
    color: "#9370DB",
    bgGradient: ["#9370DB", "#4B0082"],
    bonuses: {
      flexibilityXP: 2.2,
      mindfulnessXP: 1.8,
      recoveryXP: 1.5,
      balanceXP: 2.0
    },
    preferredExercises: ["yoga_flow", "meditation", "stretching", "balance_poses"],
    skillTree: "harmony_mastery",
    stats: { power: 3, technique: 8, endurance: 6, flexibility: 10, mental: 10 }
  },
  hybrid: {
    name: "HYBRID",
    subtitle: "The Adaptor",
    emoji: "⚡",
    quote: "Adaptability is the ultimate strength.",
    description: "Master of all trades. Adapts to any challenge with versatility.",
    philosophy: "INFINITE POSSIBILITIES",
    color: "#FF6347",
    bgGradient: ["#FF6347", "#B22222"],
    bonuses: {
      varietyXP: 1.5,
      adaptabilityXP: 1.4,
      allAroundBonus: 1.2,
      masteryXP: 1.3
    },
    preferredExercises: [],
    skillTree: "versatility_mastery",
    stats: { power: 7, technique: 7, endurance: 7, flexibility: 7, mental: 7 }
  }
};

// Character templates for gacha system
const CHARACTER_TEMPLATES = {
  legendary: [
    {
      id: 'leg_titan',
      name: 'The Iron Titan',
      rarity: 'legendary',
      class: 'powerlifter',
      description: 'A legendary warrior who can deadlift mountains',
      base_stats: { strength: 95, cardio: 60, flexibility: 40, focus: 90 },
      personality: { motivation: 'competitive', style: 'intense', time: 'morning' },
      special_ability: 'Titan Strength: +50% XP from compound lifts',
      artwork: '🏔️💪',
      rarity_color: '#FFD700',
    },
    {
      id: 'leg_zen_master',
      name: 'Master Zenith',
      rarity: 'legendary',
      class: 'yogi',
      description: 'Achieved perfect balance between mind, body, and spirit',
      base_stats: { strength: 50, cardio: 70, flexibility: 98, focus: 99 },
      personality: { motivation: 'personal', style: 'chill', time: 'evening' },
      special_ability: 'Perfect Balance: Immune to mood penalties',
      artwork: '🧘‍♂️✨',
      rarity_color: '#FFD700',
    },
  ],
  epic: [
    {
      id: 'epic_beast',
      name: 'Cardio Beast',
      rarity: 'epic',
      class: 'athlete',
      description: 'Never gets tired, always ready for the next mile',
      base_stats: { strength: 70, cardio: 92, flexibility: 65, focus: 75 },
      personality: { motivation: 'competitive', style: 'intense', time: 'morning' },
      special_ability: 'Endless Endurance: +25% cardio XP, slower energy drain',
      artwork: '🏃‍♂️💨',
      rarity_color: '#9932CC',
    },
    {
      id: 'epic_sculptor',
      name: 'The Sculptor',
      rarity: 'epic',
      class: 'bodybuilder',
      description: 'Perfection through precision, every rep counts',
      base_stats: { strength: 85, cardio: 60, flexibility: 70, focus: 88 },
      personality: { motivation: 'personal', style: 'moderate', time: 'afternoon' },
      special_ability: 'Perfect Form: +30% XP from isolation exercises',
      artwork: '🎨💪',
      rarity_color: '#9932CC',
    },
  ],
  rare: [
    {
      id: 'rare_warrior',
      name: 'Gym Warrior',
      rarity: 'rare',
      class: 'hybrid',
      description: 'Reliable training partner who adapts to any workout',
      base_stats: { strength: 75, cardio: 75, flexibility: 75, focus: 75 },
      personality: { motivation: 'social', style: 'moderate', time: 'flexible' },
      special_ability: 'Adaptation: Gains bonus XP from variety workouts',
      artwork: '⚔️🏋️',
      rarity_color: '#4169E1',
    },
    {
      id: 'rare_coach',
      name: 'Motivational Coach',
      rarity: 'rare',
      class: 'hybrid',
      description: 'Always knows exactly what to say to keep you going',
      base_stats: { strength: 65, cardio: 70, flexibility: 60, focus: 85 },
      personality: { motivation: 'social', style: 'moderate', time: 'flexible' },
      special_ability: 'Motivation Boost: +20% XP on low mood days',
      artwork: '📣💪',
      rarity_color: '#4169E1',
    },
  ],
  common: [
    {
      id: 'com_buddy',
      name: 'Workout Buddy',
      rarity: 'common',
      class: 'beginner',
      description: 'Just happy to be here and sweat together',
      base_stats: { strength: 50, cardio: 50, flexibility: 50, focus: 50 },
      personality: { motivation: 'social', style: 'chill', time: 'flexible' },
      special_ability: 'Friendship: Small XP bonus from social workouts',
      artwork: '😊🏃',
      rarity_color: '#808080',
    },
    {
      id: 'com_newbie',
      name: 'Eager Newbie',
      rarity: 'common',
      class: 'beginner',
      description: 'New to fitness but full of enthusiasm',
      base_stats: { strength: 30, cardio: 40, flexibility: 60, focus: 70 },
      personality: { motivation: 'personal', style: 'chill', time: 'morning' },
      special_ability: 'Beginner Gains: Extra XP for first 10 workouts',
      artwork: '🌟💪',
      rarity_color: '#808080',
    },
  ]
};

// Gacha rates (RARE setup as requested!)
const GACHA_RATES = {
  legendary: 0.005,  // 0.5%
  epic: 0.02,        // 2%
  rare: 0.10,        // 10% 
  common: 0.875      // 87.5%
};

// Currency rewards for different actions
const CURRENCY_REWARDS = {
  workout_basic: { gems: 15, coins: 25 },
  workout_verified: { gems: 35, coins: 50, crystals: 1 },
  workout_liked: { gems: 5, coins: 10 },
  daily_login: { coins: 20 },
  streak_bonus: { gems: 10, coins: 30 },
  first_workout_day: { gems: 25, coins: 50 },
  perfect_form: { gems: 50, coins: 100, crystals: 3 },
  social_interaction: { coins: 5 },
};

// ==============================================================================
// ACTION TYPES
// ==============================================================================

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
};

// ==============================================================================
// INITIAL STATE
// ==============================================================================

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
  
  // Social verification system
  social: {
    workout_posts: [],     // User's workout verification posts
    likes_given: [],       // Posts this user has liked
    reports_made: [],      // Reports for fake workouts
    trust_score: 100,      // Reputation system (0-200)
  },
  
  workoutTemplates: [],
  restDays: [],
  bodyWeights: []
};

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

// Calculate class XP required for next level
const calculateClassXPRequired = (level) => {
  return Math.floor(200 * Math.pow(level - 1, 1.2));
};

// Generate character from template
const generateCharacter = (rarity) => {
  const templates = CHARACTER_TEMPLATES[rarity];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    ...template,
    instance_id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pulled_at: new Date().toISOString(),
    level: 1,
    experience: 0,
    current_stats: { ...template.base_stats },
    condition: {
      energy: 100,
      stamina: 100,
      mood: 80,
      hunger: 60,
      rest: 90,
    },
    last_interaction: new Date().toISOString(),
  };
};

// Perform gacha pull
const performGachaPull = (pullType = 'single') => {
  const numPulls = pullType === 'single' ? 1 : 10;
  const results = [];
  
  for (let i = 0; i < numPulls; i++) {
    const roll = Math.random();
    let rarity;
    
    if (roll < GACHA_RATES.legendary) {
      rarity = 'legendary';
    } else if (roll < GACHA_RATES.legendary + GACHA_RATES.epic) {
      rarity = 'epic';
    } else if (roll < GACHA_RATES.legendary + GACHA_RATES.epic + GACHA_RATES.rare) {
      rarity = 'rare';
    } else {
      rarity = 'common';
    }
    
    const newCharacter = generateCharacter(rarity);
    results.push(newCharacter);
  }
  
  return results;
};

// Calculate pull costs
const getPullCosts = () => ({
  single: { gems: 160, coins: 0 },
  ten_pull: { gems: 1600, coins: 0 },
  coin_pull: { gems: 0, coins: 2000 },
});

// ==============================================================================
// REDUCER
// ==============================================================================

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

    case ActionTypes.UPDATE_USER_STATS:
      const updatedUserStats = {
        ...state.userStats,
        ...action.payload
      };
      return {
        ...state,
        userStats: updatedUserStats
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
          }
        }
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
          }
        }
      };

    case ActionTypes.GACHA_PULL:
      const newCharacter = action.payload.character;
      const pullCost = action.payload.cost;
      
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
            ...state.gacha.pull_history.slice(0, 49)
          ]
        },
        userStats: {
          ...state.userStats,
          currencies: {
            ...state.userStats.currencies,
            gems: state.userStats.currencies.gems - pullCost.gems,
            coins: state.userStats.currencies.coins - pullCost.coins,
          }
        }
      };

    case ActionTypes.SET_ACTIVE_CHARACTER:
      return {
        ...state,
        characters: {
          ...state.characters,
          active_character: action.payload.characterId,
        }
      };

    case ActionTypes.POST_WORKOUT_VERIFICATION:
      const post = action.payload;
      return {
        ...state,
        social: {
          ...state.social,
          workout_posts: [post, ...state.social.workout_posts],
        },
        userStats: {
          ...state.userStats,
          total_workouts_verified: state.userStats.total_workouts_verified + 1,
        }
      };

    case ActionTypes.LIKE_WORKOUT_POST:
      return {
        ...state,
        social: {
          ...state.social,
          likes_given: [...state.social.likes_given, action.payload.postId],
        }
      };

    case ActionTypes.RECEIVE_LIKE:
      return {
        ...state,
        userStats: {
          ...state.userStats,
          total_likes_received: state.userStats.total_likes_received + 1,
        }
      };

    case ActionTypes.UPDATE_CHARACTER:
      return {
        ...state,
        characters: {
          ...state.characters,
          collection: state.characters.collection.map(char => 
            char.instance_id === action.payload.characterId 
              ? { ...char, ...action.payload.updates }
              : char
          ),
        }
      };

    // Demo mode cases
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

    case ActionTypes.CLEAR_ALL_DATA:
      return {
        ...initialState,
        loading: false
      };

    // Add other existing cases here...
    default:
      return state;
  }
};

// ==============================================================================
// CONTEXT AND PROVIDER
// ==============================================================================

const AppContext = createContext();

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

      // Ensure userStats has all required properties
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
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // ==============================================================================
  // XP AND LEVEL CALCULATION FUNCTIONS
  // ==============================================================================

  // WoW-style exponential XP curve calculation
  const calculateLevelRequirement = (level) => {
    const baseXP = 100;
    return Math.floor(baseXP * Math.pow(level - 1, 1.5));
  };

  const calculateTotalXPForLevel = (level) => {
    let totalXP = 0;
    for (let i = 1; i <= level; i++) {
      totalXP += calculateLevelRequirement(i);
    }
    return totalXP;
  };

  const calculateLevel = (totalExperience) => {
    let level = 1;
    let requiredXP = 0;
    
    while (requiredXP <= totalExperience) {
      level++;
      requiredXP = calculateTotalXPForLevel(level);
    }
    
    return Math.max(1, level - 1);
  };

  // Enhanced XP calculation with class bonuses
  const calculateExperience = (workout) => {
    let experience = 0;
    
    // Base experience
    experience += 100;
    
    // Duration bonus
    if (workout.duration) {
      experience += Math.floor(workout.duration / 3);
    }
    
    // Exercise bonus
    if (workout.exercises) {
      experience += workout.exercises.length * 15;
    }
    
    // Rating bonus
    if (workout.ratings && workout.ratings.workoutRating) {
      if (workout.ratings.workoutRating >= 9) experience += 50;
      else if (workout.ratings.workoutRating >= 8) experience += 35;
      else if (workout.ratings.workoutRating >= 7) experience += 25;
      else if (workout.ratings.workoutRating >= 6) experience += 15;
      else if (workout.ratings.workoutRating >= 5) experience += 10;
    }
    
    // Streak bonus
    if (state.userStats.streaks?.current > 0) {
      const streakBonus = Math.min(state.userStats.streaks.current * 10, 100);
      experience += streakBonus;
    }
    
    // Template completion bonus
    if (workout.templateId) {
      experience += 50;
    }
    
    // Exercise variety bonus
    if (workout.exercises) {
      const uniqueExercises = new Set(workout.exercises.map(ex => ex.name)).size;
      if (uniqueExercises >= 5) experience += 25;
    }
    
    // Apply class bonuses if class is selected
    if (state.userStats.selectedClass) {
      const classData = FITNESS_CLASSES[state.userStats.selectedClass];
      experience = applyClassBonuses(experience, workout, classData, state.userStats);
    }
    
    return Math.floor(experience);
  };

  const calculateClassXP = (workout, userStats) => {
    if (!userStats.selectedClass) return 0;
    
    const classData = FITNESS_CLASSES[userStats.selectedClass];
    let classXP = 50;
    
    // Check for preferred exercises
    const hasPreferredExercises = workout.exercises?.some(ex => 
      classData.preferredExercises.includes(ex.name.toLowerCase().replace(/\s+/g, '_'))
    );
    
    if (hasPreferredExercises) {
      classXP *= 1.5;
    }
    
    return Math.floor(classXP);
  };

  const applyClassBonuses = (baseXP, workout, classData, userStats) => {
    let multiplier = 1.0;
    
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

  // ==============================================================================
  // GACHA SYSTEM FUNCTIONS
  // ==============================================================================

  const pullGacha = (pullType = 'single') => {
    const costs = getPullCosts();
    const cost = costs[pullType];
    
    // Check if user has enough currency
    if (state.userStats.currencies.gems < cost.gems || state.userStats.currencies.coins < cost.coins) {
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
          cost: pullType === 'single' ? cost : { gems: cost.gems / 10, coins: cost.coins / 10 } 
        }
      });
    });
    
    return results;
  };

  const awardCurrency = (rewards) => {
    dispatch({ type: ActionTypes.AWARD_CURRENCY, payload: rewards });
  };

  const setActiveCharacter = (characterId) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_CHARACTER, payload: { characterId } });
  };

  // ==============================================================================
  // SOCIAL VERIFICATION FUNCTIONS
  // ==============================================================================

  const createWorkoutPost = (workout, photo, caption) => {
    return {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'current_user',
      workout_id: workout.id,
      photo_url: photo,
      caption: caption || '',
      timestamp: new Date().toISOString(),
      likes: [],
      reports: [],
      verified: true,
      workout_summary: {
        exercises: workout.exercises?.length || 0,
        duration: workout.duration || 0,
        rating: workout.ratings?.workoutRating || 0,
        class_bonus: workout.class_bonus || 0,
      }
    };
  };

  const postWorkoutVerification = (workout, photo, caption) => {
    const post = createWorkoutPost(workout, photo, caption);
    dispatch({ type: ActionTypes.POST_WORKOUT_VERIFICATION, payload: post });
    
    // Award verification bonus
    awardCurrency(CURRENCY_REWARDS.workout_verified);
    
    return post;
  };

  const likePost = (postId) => {
    dispatch({ type: ActionTypes.LIKE_WORKOUT_POST, payload: { postId } });
    awardCurrency(CURRENCY_REWARDS.social_interaction);
  };

  // ==============================================================================
  // MAIN WORKOUT FUNCTIONS
  // ==============================================================================

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
      
      // Calculate class XP
      const classXP = calculateClassXP(workout, state.userStats);
      
      // Award base workout currency
      const currencyReward = workout.verification_photo 
        ? CURRENCY_REWARDS.workout_verified 
        : CURRENCY_REWARDS.workout_basic;
      
      // Add streak bonus
      if (state.userStats.streaks?.current > 0) {
        currencyReward.gems += CURRENCY_REWARDS.streak_bonus.gems * Math.min(state.userStats.streaks.current, 7);
      }
      
      // Update user stats
      const updatedStats = {
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
          gems: state.userStats.currencies.gems + currencyReward.gems,
          coins: state.userStats.currencies.coins + currencyReward.coins,
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
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  // Character workout interaction
  const workoutWithCharacter = (character, workout) => {
    const xpGained = Math.floor((workout.exercises?.length || 1) * 20);
    const newLevel = Math.floor((character.experience + xpGained) / 1000) + 1;
    
    const energyDrain = Math.min(30, (workout.duration || 30) / 2);
    const moodBoost = Math.min(20, (workout.ratings?.workoutRating || 5) * 2);
    
    return {
      ...character,
      experience: character.experience + xpGained,
      level: Math.max(character.level, newLevel),
      condition: {
        energy: Math.max(10, character.condition.energy - energyDrain),
        stamina: Math.min(100, character.condition.stamina + 5),
        mood: Math.min(100, character.condition.mood + moodBoost),
        hunger: Math.min(100, character.condition.hunger + 15),
        rest: Math.max(0, character.condition.rest - 10),
      }
    };
  };

  // ==============================================================================
  // OTHER EXISTING FUNCTIONS (simplified for space)
  // ==============================================================================

  const updateWorkout = async (updatedWorkout) => {
    try {
      dispatch({ type: ActionTypes.UPDATE_WORKOUT, payload: updatedWorkout });
      
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
      dispatch({ type: ActionTypes.REMOVE_WORKOUT, payload: workoutId });
      
      const updatedHistory = state.workoutHistory.filter(workout => workout.id !== workoutId);
      await StorageManager.saveWorkoutHistory(updatedHistory);
      
    } catch (error) {
      console.error('Error removing workout:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const updateUserStats = async (newStats) => {
    try {
      dispatch({ type: ActionTypes.UPDATE_USER_STATS, payload: newStats });
      await StorageManager.saveUserStats(newStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const selectClass = (classKey) => {
    dispatch({ type: ActionTypes.SELECT_CLASS, payload: { classKey } });
  };

  const unlockSkill = (skillId, cost = 1) => {
    if (state.userStats.skillPoints >= cost) {
      dispatch({ type: ActionTypes.UNLOCK_SKILL, payload: { skillId, cost } });
    }
  };

  const awardClassXP = (xp) => {
    dispatch({ type: ActionTypes.AWARD_CLASS_XP, payload: { xp } });
  };

  // Demo mode functions
  const setDemoMode = async (isDemo) => {
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
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const loadDemoData = async () => {
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

  const value = {
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
    calculateClassXPRequired,
    
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

// ==============================================================================
// EXPORTS FOR OTHER COMPONENTS
// ==============================================================================

export { FITNESS_CLASSES, CHARACTER_TEMPLATES, GACHA_RATES, CURRENCY_REWARDS };