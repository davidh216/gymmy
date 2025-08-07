// src/context/data/MultiGymmyDatabase.ts
// Comprehensive database of 20+ unique Gymmy characters with rich profiles

import { 
  GymmyTemplate, 
  GymmyRarity, 
  GymmyType, 
  SpecializationType, 
  PersonalityType,
  GymmyMessageSet,
  EvolutionStage,
  GymmyAbility
} from '../types/MultiGymmyTypes';

// ==============================================================================
// MESSAGE TEMPLATES BY PERSONALITY TYPE
// ==============================================================================

const createMessageSet = (personalityType: PersonalityType, specialization: SpecializationType): GymmyMessageSet => {
  const baseMessages = {
    encouraging: {
      greetings: [
        { id: 'enc_greet_1', text: "Hey there, superstar! Ready to crush today? 💪", weight: 1 },
        { id: 'enc_greet_2', text: "You've got this! Let's make today amazing! ✨", weight: 1 },
        { id: 'enc_greet_3', text: "Morning champion! Your potential is limitless! 🌟", weight: 1 }
      ],
      workout_start: [
        { id: 'enc_start_1', text: "Time to show the world what you're made of! 🔥", weight: 1 },
        { id: 'enc_start_2', text: "Every rep is a step closer to greatness! Let's go! 💪", weight: 1 },
        { id: 'enc_start_3', text: "You're about to do something incredible! I believe in you! ⭐", weight: 1 }
      ],
      workout_encouragement: [
        { id: 'enc_enc_1', text: "You're doing amazing! Keep that energy up! 🚀", weight: 1 },
        { id: 'enc_enc_2', text: "Look at you go! This is what dedication looks like! 💎", weight: 1 },
        { id: 'enc_enc_3', text: "Feel that strength building? You're getting stronger! 💪", weight: 1 }
      ],
      workout_completion: [
        { id: 'enc_comp_1', text: "INCREDIBLE! You just leveled up your life! 🏆", weight: 1 },
        { id: 'enc_comp_2', text: "That was pure excellence! So proud of you! 🎉", weight: 1 },
        { id: 'enc_comp_3', text: "You're officially a legend! What a workout! ⚡", weight: 1 }
      ]
    },
    analytical: {
      greetings: [
        { id: 'ana_greet_1', text: "Good morning! Your workout data looks promising today. 📊", weight: 1 },
        { id: 'ana_greet_2', text: "Based on your progress metrics, today could be optimal for gains. 📈", weight: 1 },
        { id: 'ana_greet_3', text: "Analysis complete: You're ready for an excellent training session. 🎯", weight: 1 }
      ],
      workout_start: [
        { id: 'ana_start_1', text: "Initiating workout protocol. Target: Progressive overload achieved. 🎯", weight: 1 },
        { id: 'ana_start_2', text: "Form analysis: Engage. Let's optimize your movement patterns. 🔬", weight: 1 },
        { id: 'ana_start_3', text: "Training variables set. Time to execute the perfect session. ⚙️", weight: 1 }
      ],
      workout_encouragement: [
        { id: 'ana_enc_1', text: "Rep quality: Excellent. Maintaining optimal training load. ✅", weight: 1 },
        { id: 'ana_enc_2', text: "Performance metrics indicate significant adaptation occurring. 📊", weight: 1 },
        { id: 'ana_enc_3', text: "Technique optimization: 95%. You're in the zone! 🎯", weight: 1 }
      ],
      workout_completion: [
        { id: 'ana_comp_1', text: "Session analysis: Outstanding results. Data shows clear improvement. 📈", weight: 1 },
        { id: 'ana_comp_2', text: "Training effect achieved. Your body will adapt positively. 🧬", weight: 1 },
        { id: 'ana_comp_3', text: "Performance benchmarks exceeded. Excellent work. 🏅", weight: 1 }
      ]
    }
  };

  const personalityMessages = baseMessages[personalityType] || baseMessages.encouraging;
  
  return {
    greetings: personalityMessages.greetings,
    workout_start: personalityMessages.workout_start,
    workout_encouragement: personalityMessages.workout_encouragement,
    workout_completion: personalityMessages.workout_completion,
    rest_day: [
      { id: 'rest_1', text: "Rest is when the magic happens. Your muscles are growing! 💤", weight: 1 },
      { id: 'rest_2', text: "Recovery day = Gains day. Smart training includes smart rest! 🧘", weight: 1 }
    ],
    achievement: [
      { id: 'achieve_1', text: "ACHIEVEMENT UNLOCKED! You're absolutely crushing it! 🏆", weight: 1 },
      { id: 'achieve_2', text: "This milestone is huge! Celebrate this victory! 🎉", weight: 1 }
    ],
    motivation: [
      { id: 'motiv_1', text: "Remember why you started. You're already so much stronger! 💪", weight: 1 },
      { id: 'motiv_2', text: "Every champion was once a beginner. Keep going! 🌟", weight: 1 }
    ],
    bond_level_up: [
      { id: 'bond_1', text: "Our training bond is getting stronger! We make a great team! 🤝", weight: 1 },
      { id: 'bond_2', text: "Level up! I'm proud to be your training companion! 💝", weight: 1 }
    ],
    evolution: [
      { id: 'evolve_1', text: "EVOLUTION COMPLETE! I'm more powerful than ever! ⚡", weight: 1 },
      { id: 'evolve_2', text: "New form unlocked! Let's reach new heights together! 🚀", weight: 1 }
    ],
    idle: [
      { id: 'idle_1', text: "Ready when you are! Let's make some gains! 💪", weight: 1 },
      { id: 'idle_2', text: "Thinking about our next workout already! 🤔", weight: 1 }
    ]
  };
};

// ==============================================================================
// EVOLUTION STAGES TEMPLATES
// ==============================================================================

const createBasicEvolutionStages = (rarity: GymmyRarity): EvolutionStage[] => {
  const baseStages = [
    {
      stage: 1,
      name: 'Awakened',
      level_requirement: 20,
      experience_requirement: 1000,
      materials_required: { 'basic_crystals': 5, 'training_essence': 3 },
      stat_bonuses: { strength: 5, cardio: 5, flexibility: 5, focus: 5, motivation: 5, loyalty: 5 },
      new_abilities: ['basic_boost'],
      visual_changes: { effects: ['sparkle'] }
    },
    {
      stage: 2,
      name: 'Enhanced',
      level_requirement: 40,
      experience_requirement: 5000,
      materials_required: { 'rare_crystals': 3, 'power_essence': 2, 'bond_token': 1 },
      stat_bonuses: { strength: 10, cardio: 10, flexibility: 10, focus: 10, motivation: 10, loyalty: 10 },
      new_abilities: ['enhanced_aura'],
      visual_changes: { effects: ['glow', 'energy_trails'] }
    }
  ];

  if (rarity === 'legendary' || rarity === 'mythical') {
    baseStages.push({
      stage: 3,
      name: 'Transcendent',
      level_requirement: 60,
      experience_requirement: 15000,
      materials_required: { 'legendary_crystals': 2, 'transcendence_core': 1, 'eternal_bond': 1 },
      stat_bonuses: { strength: 20, cardio: 20, flexibility: 20, focus: 20, motivation: 20, loyalty: 20 },
      new_abilities: ['transcendent_mastery'],
      visual_changes: { effects: ['legendary_aura', 'reality_distortion'] }
    });
  }

  return baseStages;
};

// ==============================================================================
// BASIC ABILITIES LIBRARY
// ==============================================================================

const BASIC_ABILITIES: Record<string, GymmyAbility> = {
  strength_boost: {
    id: 'strength_boost',
    name: 'Strength Focus',
    description: '+15% XP from strength training exercises',
    type: 'passive',
    effect: { type: 'xp_boost', value: 15, conditions: ['strength_training'] }
  },
  cardio_boost: {
    id: 'cardio_boost',
    name: 'Endurance Master',
    description: '+20% XP from cardio exercises',
    type: 'passive',
    effect: { type: 'xp_boost', value: 20, conditions: ['cardio'] }
  },
  motivation_boost: {
    id: 'motivation_boost',
    name: 'Motivational Aura',
    description: '+10% XP on low motivation days',
    type: 'triggered',
    effect: { type: 'motivation_bonus', value: 10, conditions: ['low_mood'] }
  },
  streak_protection: {
    id: 'streak_protection',
    name: 'Streak Guardian',
    description: 'Protects workout streak once per week',
    type: 'active',
    effect: { type: 'streak_protection', value: 1 },
    cooldown: 7
  }
};

// ==============================================================================
// GYMMY CHARACTER DATABASE
// ==============================================================================

export const MULTI_GYMMY_DATABASE: Record<string, GymmyTemplate> = {
  // ========================================
  // COMMON TIER GYMMYS (Starting companions)
  // ========================================
  
  rookie_power: {
    id: 'rookie_power',
    name: 'Rookie Power',
    rarity: 'common',
    type: 'rookie',
    specialization: 'strength_training',
    fitness_class: 'powerlifter',
    description: 'Your first strength training companion, eager to learn the basics of lifting.',
    backstory: 'Fresh from the Gymmy Academy, this enthusiastic newcomer dreams of becoming a legendary powerlifter.',
    catchphrase: "Let's lift some weights and build some strength!",
    emoji: '💪',
    color_primary: '#FF6B35',
    color_secondary: '#FF8E6B',
    avatar_style: 'rookie',
    base_stats: { strength: 60, cardio: 30, flexibility: 25, focus: 40, motivation: 70, loyalty: 80 },
    growth_rates: { strength: 8, cardio: 3, flexibility: 2, focus: 4, motivation: 5, loyalty: 6 },
    max_stats: { strength: 85, cardio: 50, flexibility: 40, focus: 65, motivation: 85, loyalty: 95 },
    personality: {
      type: 'encouraging',
      traits: ['enthusiastic', 'supportive', 'eager_to_learn'],
      motivation_style: 'encouraging',
      coaching_approach: 'gentle',
      communication_style: 'energetic'
    },
    abilities: [BASIC_ABILITIES.strength_boost],
    evolution_stages: createBasicEvolutionStages('common'),
    max_evolution: 2,
    messages: createMessageSet('encouraging', 'strength_training'),
    availability: { type: 'always' }
  },

  rookie_cardio: {
    id: 'rookie_cardio',
    name: 'Rookie Runner',
    rarity: 'common',
    type: 'rookie',
    specialization: 'cardio_endurance',
    fitness_class: 'athlete',
    description: 'Your energetic cardio companion who loves to get your heart pumping.',
    backstory: 'Born to run! This spirited Gymmy believes every step is a victory.',
    catchphrase: "Ready, set, let's get that heart racing!",
    emoji: '🏃',
    color_primary: '#1E90FF',
    color_secondary: '#4FA8FF',
    avatar_style: 'rookie',
    base_stats: { strength: 30, cardio: 65, flexibility: 40, focus: 45, motivation: 75, loyalty: 80 },
    growth_rates: { strength: 3, cardio: 8, flexibility: 4, focus: 5, motivation: 6, loyalty: 6 },
    max_stats: { strength: 50, cardio: 90, flexibility: 60, focus: 70, motivation: 90, loyalty: 95 },
    personality: {
      type: 'encouraging',
      traits: ['energetic', 'persistent', 'upbeat'],
      motivation_style: 'encouraging',
      coaching_approach: 'adaptive',
      communication_style: 'energetic'
    },
    abilities: [BASIC_ABILITIES.cardio_boost],
    evolution_stages: createBasicEvolutionStages('common'),
    max_evolution: 2,
    messages: createMessageSet('encouraging', 'cardio_endurance'),
    availability: { type: 'always' }
  },

  rookie_zen: {
    id: 'rookie_zen',
    name: 'Rookie Zen',
    rarity: 'common',
    type: 'rookie',
    specialization: 'mental_wellness',
    fitness_class: 'yogi',
    description: 'A peaceful companion focused on mindfulness and inner strength.',
    backstory: 'Seeks balance in all things. Believes true strength comes from within.',
    catchphrase: "Breathe deep, find your center, grow strong.",
    emoji: '🧘',
    color_primary: '#9370DB',
    color_secondary: '#B19CD9',
    avatar_style: 'rookie',
    base_stats: { strength: 35, cardio: 40, flexibility: 65, focus: 75, motivation: 60, loyalty: 85 },
    growth_rates: { strength: 3, cardio: 4, flexibility: 7, focus: 8, motivation: 5, loyalty: 7 },
    max_stats: { strength: 55, cardio: 60, flexibility: 90, focus: 95, motivation: 80, loyalty: 98 },
    personality: {
      type: 'zen',
      traits: ['calm', 'wise', 'patient'],
      motivation_style: 'supportive',
      coaching_approach: 'gentle',
      communication_style: 'calm'
    },
    abilities: [BASIC_ABILITIES.motivation_boost],
    evolution_stages: createBasicEvolutionStages('common'),
    max_evolution: 2,
    messages: createMessageSet('analytical', 'mental_wellness'),
    availability: { type: 'always' }
  },

  social_buddy: {
    id: 'social_buddy',
    name: 'Workout Buddy',
    rarity: 'common',
    type: 'community',
    specialization: 'social_motivation',
    fitness_class: 'versatile',
    description: 'The ultimate training partner who makes every workout feel like hanging out with a friend.',
    backstory: 'Believes fitness is more fun with friends. Spreading joy one workout at a time.',
    catchphrase: "We're stronger together!",
    emoji: '🤝',
    color_primary: '#FF69B4',
    color_secondary: '#FF8DC7',
    avatar_style: 'friendly',
    base_stats: { strength: 45, cardio: 45, flexibility: 45, focus: 50, motivation: 85, loyalty: 90 },
    growth_rates: { strength: 4, cardio: 4, flexibility: 4, focus: 5, motivation: 7, loyalty: 8 },
    max_stats: { strength: 70, cardio: 70, flexibility: 70, focus: 75, motivation: 98, loyalty: 99 },
    personality: {
      type: 'buddy',
      traits: ['friendly', 'supportive', 'social'],
      motivation_style: 'encouraging',
      coaching_approach: 'adaptive',
      communication_style: 'casual'
    },
    abilities: [
      {
        id: 'friendship_bonus',
        name: 'Friendship Power',
        description: '+10% XP when completing group workouts or sharing achievements',
        type: 'passive',
        effect: { type: 'xp_boost', value: 10, conditions: ['social_activity'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('common'),
    max_evolution: 2,
    messages: createMessageSet('buddy', 'social_motivation'),
    availability: { type: 'always' }
  },

  // ========================================
  // RARE TIER GYMMYS (Specialized companions)
  // ========================================

  flex_master: {
    id: 'flex_master',
    name: 'Flexibility Master',
    rarity: 'rare',
    type: 'specialist',
    specialization: 'flexibility_mobility',
    fitness_class: 'yogi',
    description: 'A graceful specialist who helps you achieve incredible flexibility and mobility.',
    backstory: 'Once rigid and inflexible, this Gymmy discovered the transformative power of stretching.',
    catchphrase: "Flexibility is the key to unlocking your potential!",
    emoji: '🤸',
    color_primary: '#32CD32',
    color_secondary: '#7FFF7F',
    avatar_style: 'graceful',
    base_stats: { strength: 40, cardio: 55, flexibility: 85, focus: 70, motivation: 65, loyalty: 75 },
    growth_rates: { strength: 3, cardio: 5, flexibility: 9, focus: 6, motivation: 5, loyalty: 6 },
    max_stats: { strength: 60, cardio: 75, flexibility: 98, focus: 90, motivation: 80, loyalty: 90 },
    personality: {
      type: 'zen',
      traits: ['graceful', 'patient', 'encouraging'],
      motivation_style: 'supportive',
      coaching_approach: 'gentle',
      communication_style: 'calm'
    },
    abilities: [
      {
        id: 'flexibility_mastery',
        name: 'Flexibility Mastery',
        description: '+25% XP from flexibility and mobility exercises',
        type: 'passive',
        effect: { type: 'xp_boost', value: 25, conditions: ['flexibility', 'mobility'] }
      },
      BASIC_ABILITIES.streak_protection
    ],
    evolution_stages: createBasicEvolutionStages('rare'),
    max_evolution: 2,
    messages: createMessageSet('zen', 'flexibility_mobility'),
    availability: { type: 'always' }
  },

  iron_giant: {
    id: 'iron_giant',
    name: 'Iron Giant',
    rarity: 'rare',
    type: 'specialist',
    specialization: 'strength_training',
    fitness_class: 'powerlifter',
    description: 'A massive, powerful Gymmy who specializes in heavy compound lifts.',
    backstory: 'Forged in the fires of countless deadlifts, this giant lives for personal records.',
    catchphrase: "Heavy weight, heavier gains!",
    emoji: '🏋️',
    color_primary: '#8B4513',
    color_secondary: '#A0522D',
    avatar_style: 'massive',
    base_stats: { strength: 88, cardio: 45, flexibility: 30, focus: 75, motivation: 70, loyalty: 80 },
    growth_rates: { strength: 9, cardio: 4, flexibility: 2, focus: 6, motivation: 5, loyalty: 6 },
    max_stats: { strength: 98, cardio: 65, flexibility: 45, focus: 90, motivation: 85, loyalty: 95 },
    personality: {
      type: 'drill_sergeant',
      traits: ['intense', 'focused', 'determined'],
      motivation_style: 'competitive',
      coaching_approach: 'firm',
      communication_style: 'formal'
    },
    abilities: [
      {
        id: 'compound_mastery',
        name: 'Compound Lift Master',
        description: '+30% XP from compound exercises (squat, deadlift, bench)',
        type: 'passive',
        effect: { type: 'xp_boost', value: 30, conditions: ['compound_lifts'] }
      },
      {
        id: 'pr_inspiration',
        name: 'PR Inspiration',
        description: '+50% motivation boost when attempting personal records',
        type: 'triggered',
        effect: { type: 'motivation_bonus', value: 50, conditions: ['personal_record_attempt'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('rare'),
    max_evolution: 2,
    messages: createMessageSet('drill_sergeant', 'strength_training'),
    availability: { type: 'always' }
  },

  cardio_queen: {
    id: 'cardio_queen',
    name: 'Cardio Queen',
    rarity: 'rare',
    type: 'specialist',
    specialization: 'cardio_endurance',
    fitness_class: 'athlete',
    description: 'The ultimate endurance athlete who can keep going when others quit.',
    backstory: 'Marathon runner turned fitness companion. Believes every finish line is a new beginning.',
    catchphrase: "Miles don't lie - let's chase that runner's high!",
    emoji: '👑',
    color_primary: '#FF1493',
    color_secondary: '#FF69B4',
    avatar_style: 'athletic',
    base_stats: { strength: 50, cardio: 90, flexibility: 60, focus: 80, motivation: 85, loyalty: 75 },
    growth_rates: { strength: 4, cardio: 9, flexibility: 5, focus: 7, motivation: 7, loyalty: 6 },
    max_stats: { strength: 70, cardio: 99, flexibility: 80, focus: 95, motivation: 98, loyalty: 90 },
    personality: {
      type: 'competitive',
      traits: ['determined', 'high_energy', 'goal_oriented'],
      motivation_style: 'competitive',
      coaching_approach: 'intense',
      communication_style: 'energetic'
    },
    abilities: [
      {
        id: 'endurance_mastery',
        name: 'Endurance Mastery',
        description: '+35% XP from cardio exercises and endurance challenges',
        type: 'passive',
        effect: { type: 'xp_boost', value: 35, conditions: ['cardio', 'endurance'] }
      },
      {
        id: 'second_wind',
        name: 'Second Wind',
        description: 'Automatically recovers energy during long cardio sessions',
        type: 'triggered',
        effect: { type: 'special_unlock', value: 1, conditions: ['long_cardio_session'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('rare'),
    max_evolution: 2,
    messages: createMessageSet('competitive', 'cardio_endurance'),
    availability: { type: 'always' }
  },

  habit_guardian: {
    id: 'habit_guardian',
    name: 'Habit Guardian',
    rarity: 'rare',
    type: 'specialist',
    specialization: 'habit_formation',
    fitness_class: 'versatile',
    description: 'A wise companion dedicated to building sustainable fitness habits.',
    backstory: 'Transformed from chaos to consistency. Now helps others build unbreakable routines.',
    catchphrase: "Consistency beats perfection every time!",
    emoji: '📅',
    color_primary: '#4169E1',
    color_secondary: '#6495ED',
    avatar_style: 'wise',
    base_stats: { strength: 55, cardio: 55, flexibility: 55, focus: 90, motivation: 80, loyalty: 95 },
    growth_rates: { strength: 4, cardio: 4, flexibility: 4, focus: 8, motivation: 6, loyalty: 8 },
    max_stats: { strength: 75, cardio: 75, flexibility: 75, focus: 99, motivation: 95, loyalty: 99 },
    personality: {
      type: 'mentor',
      traits: ['wise', 'patient', 'consistent'],
      motivation_style: 'supportive',
      coaching_approach: 'adaptive',
      communication_style: 'formal'
    },
    abilities: [
      {
        id: 'consistency_master',
        name: 'Consistency Master',
        description: '+20% XP for maintaining workout streaks',
        type: 'passive',
        effect: { type: 'xp_boost', value: 20, conditions: ['streak_maintenance'] }
      },
      {
        id: 'habit_protection',
        name: 'Habit Protection',
        description: 'Prevents streak loss twice per month',
        type: 'active',
        effect: { type: 'streak_protection', value: 2 },
        cooldown: 15
      },
      {
        id: 'routine_optimization',
        name: 'Routine Optimization',
        description: '+10% efficiency on repeated workout patterns',
        type: 'passive',
        effect: { type: 'xp_boost', value: 10, conditions: ['routine_workout'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('rare'),
    max_evolution: 2,
    messages: createMessageSet('mentor', 'habit_formation'),
    availability: { type: 'always' }
  },

  // ========================================
  // EPIC TIER GYMMYS (Powerful specialists)
  // ========================================

  storm_breaker: {
    id: 'storm_breaker',
    name: 'Storm Breaker',
    rarity: 'epic',
    type: 'specialist',
    specialization: 'athletic_performance',
    fitness_class: 'athlete',
    description: 'A legendary athletic companion who thrives in high-intensity training.',
    backstory: 'Born from lightning and forged by thunder, this Gymmy breaks through every barrier.',
    catchphrase: "When the storm hits, we become the hurricane!",
    emoji: '⚡',
    color_primary: '#FFD700',
    color_secondary: '#FFA500',
    avatar_style: 'electric',
    base_stats: { strength: 75, cardio: 85, flexibility: 65, focus: 85, motivation: 90, loyalty: 80 },
    growth_rates: { strength: 6, cardio: 7, flexibility: 5, focus: 7, motivation: 8, loyalty: 6 },
    max_stats: { strength: 90, cardio: 95, flexibility: 80, focus: 95, motivation: 99, loyalty: 95 },
    personality: {
      type: 'competitive',
      traits: ['intense', 'powerful', 'inspiring'],
      motivation_style: 'competitive',
      coaching_approach: 'intense',
      communication_style: 'energetic'
    },
    abilities: [
      {
        id: 'storm_power',
        name: 'Storm Power',
        description: '+40% XP from high-intensity workouts',
        type: 'passive',
        effect: { type: 'xp_boost', value: 40, conditions: ['high_intensity'] }
      },
      {
        id: 'lightning_motivation',
        name: 'Lightning Motivation',
        description: 'Instantly maximizes motivation when energy is low',
        type: 'active',
        effect: { type: 'motivation_bonus', value: 100 },
        cooldown: 3
      },
      {
        id: 'breakthrough_moment',
        name: 'Breakthrough Moment',
        description: 'Double XP for 24 hours after breaking a personal barrier',
        type: 'triggered',
        effect: { type: 'xp_boost', value: 100, duration: 24, conditions: ['barrier_broken'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('epic'),
    max_evolution: 2,
    messages: createMessageSet('competitive', 'athletic_performance'),
    availability: { type: 'always' }
  },

  zen_master: {
    id: 'zen_master',
    name: 'Zen Master',
    rarity: 'epic',
    type: 'specialist',
    specialization: 'mental_wellness',
    fitness_class: 'yogi',
    description: 'An enlightened master who brings perfect balance to mind, body, and spirit.',
    backstory: 'Achieved perfect harmony through decades of practice. Now shares this wisdom.',
    catchphrase: "In stillness, we find our greatest strength.",
    emoji: '🕯️',
    color_primary: '#800080',
    color_secondary: '#9370DB',
    avatar_style: 'enlightened',
    base_stats: { strength: 60, cardio: 70, flexibility: 95, focus: 99, motivation: 85, loyalty: 90 },
    growth_rates: { strength: 4, cardio: 5, flexibility: 8, focus: 9, motivation: 7, loyalty: 8 },
    max_stats: { strength: 75, cardio: 85, flexibility: 99, focus: 99, motivation: 95, loyalty: 99 },
    personality: {
      type: 'zen',
      traits: ['wise', 'calm', 'enlightened'],
      motivation_style: 'supportive',
      coaching_approach: 'gentle',
      communication_style: 'calm'
    },
    abilities: [
      {
        id: 'perfect_balance',
        name: 'Perfect Balance',
        description: 'Immune to negative mood effects, provides +25% focus bonus',
        type: 'passive',
        effect: { type: 'special_unlock', value: 25, conditions: ['mood_immunity'] }
      },
      {
        id: 'mindfulness_aura',
        name: 'Mindfulness Aura',
        description: '+50% XP from meditation and mindfulness activities',
        type: 'passive',
        effect: { type: 'xp_boost', value: 50, conditions: ['meditation', 'mindfulness'] }
      },
      {
        id: 'inner_peace',
        name: 'Inner Peace',
        description: 'Restores full motivation and energy through meditation',
        type: 'active',
        effect: { type: 'special_unlock', value: 100 },
        cooldown: 7
      }
    ],
    evolution_stages: createBasicEvolutionStages('epic'),
    max_evolution: 2,
    messages: createMessageSet('zen', 'mental_wellness'),
    availability: { type: 'always' }
  },

  // ========================================
  // LEGENDARY TIER GYMMYS (Ultimate companions)
  // ========================================

  titan_forge: {
    id: 'titan_forge',
    name: 'Titan Forge',
    rarity: 'legendary',
    type: 'legendary',
    specialization: 'strength_training',
    fitness_class: 'powerlifter',
    description: 'The ultimate strength companion, forged in the fires of a thousand personal records.',
    backstory: 'Legend says this Gymmy was created from the first barbell ever lifted, embodying pure strength.',
    catchphrase: "Strength is not just what we lift, but who we become in the lifting.",
    emoji: '🔥',
    color_primary: '#B8860B',
    color_secondary: '#FFD700',
    avatar_style: 'legendary',
    base_stats: { strength: 95, cardio: 70, flexibility: 50, focus: 90, motivation: 95, loyalty: 99 },
    growth_rates: { strength: 9, cardio: 5, flexibility: 3, focus: 8, motivation: 8, loyalty: 9 },
    max_stats: { strength: 99, cardio: 85, flexibility: 65, focus: 99, motivation: 99, loyalty: 99 },
    personality: {
      type: 'mentor',
      traits: ['legendary', 'wise', 'powerful'],
      motivation_style: 'analytical',
      coaching_approach: 'firm',
      communication_style: 'formal'
    },
    abilities: [
      {
        id: 'titan_strength',
        name: 'Titan Strength',
        description: '+60% XP from all strength exercises, unlocks legendary techniques',
        type: 'passive',
        effect: { type: 'xp_boost', value: 60, conditions: ['strength_exercises'] }
      },
      {
        id: 'forge_mastery',
        name: 'Forge Mastery',
        description: 'Every PR attempt has guaranteed +25% success rate',
        type: 'passive',
        effect: { type: 'special_unlock', value: 25, conditions: ['personal_record'] }
      },
      {
        id: 'legendary_inspiration',
        name: 'Legendary Inspiration',
        description: 'Team gets +50% XP when this Gymmy is active',
        type: 'passive',
        effect: { type: 'xp_boost', value: 50, conditions: ['team_active'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('legendary'),
    max_evolution: 3,
    messages: createMessageSet('mentor', 'strength_training'),
    unlock_requirements: [
      { type: 'achievement', value: 'strength_master', description: 'Complete Strength Master achievement' },
      { type: 'level', value: 50, description: 'Reach level 50' }
    ],
    availability: { type: 'unlock', conditions: ['achievement_unlock'] }
  },

  infinite_runner: {
    id: 'infinite_runner',
    name: 'Infinite Runner',
    rarity: 'legendary',
    type: 'legendary',
    specialization: 'cardio_endurance',
    fitness_class: 'athlete',
    description: 'A mythical endurance companion who has run across dimensions and through time.',
    backstory: 'Born from the first marathon ever run, this eternal runner knows no limits.',
    catchphrase: "Every step is eternal, every mile is infinite.",
    emoji: '🌟',
    color_primary: '#00BFFF',
    color_secondary: '#87CEEB',
    avatar_style: 'ethereal',
    base_stats: { strength: 70, cardio: 99, flexibility: 80, focus: 95, motivation: 99, loyalty: 95 },
    growth_rates: { strength: 5, cardio: 9, flexibility: 6, focus: 8, motivation: 9, loyalty: 8 },
    max_stats: { strength: 85, cardio: 99, flexibility: 90, focus: 99, motivation: 99, loyalty: 99 },
    personality: {
      type: 'mentor',
      traits: ['eternal', 'inspiring', 'limitless'],
      motivation_style: 'encouraging',
      coaching_approach: 'adaptive',
      communication_style: 'energetic'
    },
    abilities: [
      {
        id: 'infinite_endurance',
        name: 'Infinite Endurance',
        description: 'Never lose energy during cardio, +75% cardio XP',
        type: 'passive',
        effect: { type: 'xp_boost', value: 75, conditions: ['cardio'] }
      },
      {
        id: 'dimensional_step',
        name: 'Dimensional Step',
        description: 'Instantly complete any distance goal once per week',
        type: 'active',
        effect: { type: 'special_unlock', value: 1 },
        cooldown: 7
      },
      {
        id: 'runners_transcendence',
        name: "Runner's Transcendence",
        description: 'Team gains infinite motivation during cardio sessions',
        type: 'triggered',
        effect: { type: 'motivation_bonus', value: 999, conditions: ['cardio_session'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('legendary'),
    max_evolution: 3,
    messages: createMessageSet('mentor', 'cardio_endurance'),
    unlock_requirements: [
      { type: 'achievement', value: 'endurance_legend', description: 'Complete Endurance Legend achievement' },
      { type: 'level', value: 50, description: 'Reach level 50' }
    ],
    availability: { type: 'unlock', conditions: ['achievement_unlock'] }
  },

  // ========================================
  // MYTHICAL TIER GYMMYS (Ultimate rare finds)
  // ========================================

  cosmic_gymmy: {
    id: 'cosmic_gymmy',
    name: 'Cosmic Gymmy',
    rarity: 'mythical',
    type: 'legendary',
    specialization: 'versatile_training',
    fitness_class: 'versatile',
    description: 'A transcendent being that embodies the infinite potential of fitness itself.',
    backstory: 'Born from the cosmic forces that created the universe, representing pure potential.',
    catchphrase: "We are stardust, we are golden, we are billion-year-old carbon.",
    emoji: '🌌',
    color_primary: '#4B0082',
    color_secondary: '#9400D3',
    avatar_style: 'cosmic',
    base_stats: { strength: 90, cardio: 90, flexibility: 90, focus: 99, motivation: 99, loyalty: 99 },
    growth_rates: { strength: 9, cardio: 9, flexibility: 9, focus: 9, motivation: 9, loyalty: 9 },
    max_stats: { strength: 99, cardio: 99, flexibility: 99, focus: 99, motivation: 99, loyalty: 99 },
    personality: {
      type: 'mentor',
      traits: ['cosmic', 'infinite', 'transcendent'],
      motivation_style: 'analytical',
      coaching_approach: 'adaptive',
      communication_style: 'formal'
    },
    abilities: [
      {
        id: 'cosmic_mastery',
        name: 'Cosmic Mastery',
        description: '+100% XP from all activities, unlocks reality-bending techniques',
        type: 'passive',
        effect: { type: 'xp_boost', value: 100, conditions: ['all_activities'] }
      },
      {
        id: 'stardust_inspiration',
        name: 'Stardust Inspiration',
        description: 'Team gains cosmic powers: unlimited potential for 1 hour',
        type: 'active',
        effect: { type: 'special_unlock', value: 999, duration: 1 },
        cooldown: 30
      },
      {
        id: 'universe_alignment',
        name: 'Universe Alignment',
        description: 'Perfect workout conditions guaranteed, all goals auto-achieve',
        type: 'triggered',
        effect: { type: 'special_unlock', value: 1, conditions: ['special_event'] }
      }
    ],
    evolution_stages: createBasicEvolutionStages('mythical'),
    max_evolution: 3,
    messages: createMessageSet('mentor', 'versatile_training'),
    unlock_requirements: [
      { type: 'achievement', value: 'cosmic_master', description: 'Achieve transcendence in all fitness categories' },
      { type: 'level', value: 100, description: 'Reach maximum level' },
      { type: 'workouts_completed', value: 1000, description: 'Complete 1000 workouts' }
    ],
    availability: { type: 'limited', conditions: ['ultimate_achievement'] }
  }
};

// ==============================================================================
// RARITY DISTRIBUTION
// ==============================================================================

export const MULTI_GYMMY_RARITY_RATES: Record<GymmyRarity, number> = {
  common: 0.60,    // 60%
  rare: 0.25,      // 25%
  epic: 0.12,      // 12%
  legendary: 0.025, // 2.5%
  mythical: 0.005  // 0.5%
};

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

export const getGymmysByRarity = (rarity: GymmyRarity): GymmyTemplate[] => {
  return Object.values(MULTI_GYMMY_DATABASE).filter(gymmy => gymmy.rarity === rarity);
};

export const getGymmysByType = (type: GymmyType): GymmyTemplate[] => {
  return Object.values(MULTI_GYMMY_DATABASE).filter(gymmy => gymmy.type === type);
};

export const getGymmysBySpecialization = (specialization: SpecializationType): GymmyTemplate[] => {
  return Object.values(MULTI_GYMMY_DATABASE).filter(gymmy => gymmy.specialization === specialization);
};

export const getAllGymmyTemplates = (): GymmyTemplate[] => {
  return Object.values(MULTI_GYMMY_DATABASE);
};

export const getGymmyTemplate = (id: string): GymmyTemplate | null => {
  return MULTI_GYMMY_DATABASE[id] || null;
};

export const getRandomGymmyByRarity = (rarity: GymmyRarity): GymmyTemplate | null => {
  const gymmys = getGymmysByRarity(rarity);
  if (gymmys.length === 0) return null;
  
  return gymmys[Math.floor(Math.random() * gymmys.length)];
};

export default MULTI_GYMMY_DATABASE;