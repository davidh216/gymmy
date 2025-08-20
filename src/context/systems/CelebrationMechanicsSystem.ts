// src/context/systems/CelebrationMechanicsSystem.ts
// Celebration Mechanics System for Phase 4: 1% Better Core System
// Integrates with existing celebration systems and 1% improvement detection

import {
  // ImprovementDetection,
  // WorkoutMetrics,
  // 
} from './OnePercentBetterSystem';
import {
  // GymmyCharacter,
  // SpecializationType,
  // PersonalityType,
  // 
} from '../types/MultiGymmyTypes';
import {
  // FitnessSegment
} from '../segmentationTypes';

// ==============================================================================
// CORE INTERFACES
// ==============================================================================

export interface CelebrationConfig {
  id: string;
  type: 'micro' | 'small' | 'medium' | 'large';
  threshold: number;
  duration: number;
  particleCount: number;
  characterResponse: 'encouraging' | 'enthusiastic' | 'excited' | 'ecstatic';
  rewards: {
    xp: number;
    gems: number;
    characterExperience?: number;
  };
  animations: string[];
  colors: string[];
  sounds: string[];
}

export interface CelebrationSequence {
  phase: 'detection' | 'validation' | 'character' | 'rewards';
  duration: number;
  animation: string;
  sound: string;
  visual: string;
  characterMessage?: string;
}

export interface CharacterResponse {
  personality: PersonalityType;
  specialization: SpecializationType;
  improvementType: string;
  improvementPercentage: number;
  message: string;
  animation: string;
  mood: 'excited' | 'proud' | 'inspired' | 'motivated';
  duration: number;
}

export interface ScientificValidation {
  confidence: 'high' | 'medium' | 'low';
  method: 'statistical' | 'scientific' | 'consistency' | 'peer';
  description: string;
  icon: string;
  color: string;
  educationalContent: string;
}

export interface CelebrationEvent {
  id: string;
  userId: string;
  improvement: ImprovementDetection;
  celebration: CelebrationConfig;
  sequence: CelebrationSequence[];
  characterResponse: CharacterResponse;
  validation: ScientificValidation;
  timestamp: string;
  completed: boolean;
  shared: boolean;
}

// ==============================================================================
// CELEBRATION CONFIGURATIONS
// ==============================================================================

export const CELEBRATION_HIERARCHY: Record<string, CelebrationConfig> = {
  micro: {
    id: 'micro_celebration',
    type: 'micro',
    threshold: 1.0,
    duration: 2000,
    particleCount: 15,
    characterResponse: 'encouraging',
    rewards: { xp: 25, gems: 5, characterExperience: 10 },
    animations: ['subtle_pulse', 'soft_glow'],
    colors: ['#4CAF50', '#81C784'],
    sounds: ['gentle_chime', 'soft_sparkle']
  },
  small: {
    id: 'small_celebration',
    type: 'small',
    threshold: 2.5,
    duration: 3000,
    particleCount: 25,
    characterResponse: 'enthusiastic',
    rewards: { xp: 50, gems: 10, characterExperience: 20 },
    animations: ['bounce_scale', 'color_burst'],
    colors: ['#FF9800', '#FFB74D'],
    sounds: ['achievement_chime', 'energy_burst']
  },
  medium: {
    id: 'medium_celebration',
    type: 'medium',
    threshold: 5.0,
    duration: 4000,
    particleCount: 35,
    characterResponse: 'excited',
    rewards: { xp: 100, gems: 20, characterExperience: 40 },
    animations: ['celebration_dance', 'sparkle_show'],
    colors: ['#9C27B0', '#BA68C8'],
    sounds: ['epic_celebration', 'victory_fanfare']
  },
  large: {
    id: 'large_celebration',
    type: 'large',
    threshold: 10.0,
    duration: 5000,
    particleCount: 50,
    characterResponse: 'ecstatic',
    rewards: { xp: 200, gems: 50, characterExperience: 80 },
    animations: ['epic_celebration', 'confetti_burst'],
    colors: ['#FF5722', '#FF8A65'],
    sounds: ['legendary_celebration', 'epic_victory']
  }
};

export const SEGMENT_CELEBRATIONS: Record<FitnessSegment, any> = {
  strength_seeker: {
    style: 'power_celebration',
    colors: ['#FF6B35', '#FF8E6B'],
    animations: ['muscle_flex', 'weight_lift'],
    messages: [
      '💪 Your strength is growing! Every rep builds power!',
      '🔥 That improvement shows real dedication to strength!',
      '⚡ Your muscles are adapting and getting stronger!'
    ]
  },
  calorie_crusher: {
    style: 'energy_celebration',
    colors: ['#FF1744', '#FF6B9D'],
    animations: ['energy_burst', 'calorie_burn'],
    messages: [
      '🔥 Your energy output is incredible! Keep burning bright!',
      '⚡ That calorie burn shows amazing metabolic efficiency!',
      '🚀 Your endurance is building with every session!'
    ]
  },
  body_optimizer: {
    style: 'transformation_celebration',
    colors: ['#7C4DFF', '#B388FF'],
    animations: ['body_glow', 'transformation_sparkle'],
    messages: [
      '✨ Your body is transforming beautifully!',
      '🌟 Every improvement brings you closer to your goals!',
      '💎 Your dedication to transformation is inspiring!'
    ]
  },
  wellness_seeker: {
    style: 'mindful_celebration',
    colors: ['#00BCD4', '#4DD0E1'],
    animations: ['zen_pulse', 'mindful_glow'],
    messages: [
      '🧘 Your mind-body connection is strengthening!',
      '✨ Inner peace and outer strength - perfect balance!',
      '🌟 Your wellness journey is truly inspiring!'
    ]
  },
  endurance_athlete: {
    style: 'performance_celebration',
    colors: ['#4CAF50', '#81C784'],
    animations: ['speed_lines', 'performance_boost'],
    messages: [
      '🏃 Your endurance is reaching new heights!',
      '⚡ Performance gains like this are incredible!',
      '🚀 Your athletic potential is limitless!'
    ]
  },
  habit_builder: {
    style: 'consistency_celebration',
    colors: ['#FF9800', '#FFB74D'],
    animations: ['habit_chain', 'consistency_sparkle'],
    messages: [
      '📊 Your consistency is building unstoppable momentum!',
      '🔗 Every workout strengthens your habit chain!',
      '💪 Small improvements compound into massive results!'
    ]
  },
  social_enthusiast: {
    style: 'community_celebration',
    colors: ['#E91E63', '#F06292'],
    animations: ['community_glow', 'social_sparkle'],
    messages: [
      '🤝 Your progress inspires the entire community!',
      '🌟 Leading by example - that\'s true leadership!',
      '💖 Your positive energy lifts everyone around you!'
    ]
  },
  unassigned: {
    style: 'general_celebration',
    colors: ['#9E9E9E', '#BDBDBD'],
    animations: ['general_glow', 'progress_sparkle'],
    messages: [
      '🎯 Great progress! You\'re on your way to amazing results!',
      '✨ Every improvement counts toward your goals!',
      '🌟 Your dedication to fitness is inspiring!'
    ]
  }
};

// ==============================================================================
// CHARACTER RESPONSE SYSTEM
// ==============================================================================

export const CHARACTER_RESPONSES: Record<PersonalityType, Record<string, string[]>> = {
  encouraging: {
    strength: [
      '💪 Incredible! Your dedication to progressive overload is paying off!',
      '🔥 That strength gain shows real commitment to growth!',
      '⚡ Your muscles are adapting beautifully to the challenge!'
    ],
    endurance: [
      '🏃 Amazing! Your cardiovascular system is getting stronger!',
      '🚀 That endurance improvement shows incredible consistency!',
      '💨 Your breathing efficiency is reaching new levels!'
    ],
    flexibility: [
      '🧘 Wonderful! Your mind-body connection is deepening!',
      '✨ That flexibility gain shows patience and dedication!',
      '🌟 Your range of motion is expanding beautifully!'
    ],
    technique: [
      '🎯 Excellent! Your form is getting more precise!',
      '✨ That technique improvement shows great attention to detail!',
      '🌟 Your movement quality is reaching new heights!'
    ],
    consistency: [
      '📊 Fantastic! Your consistency is building unstoppable momentum!',
      '🔗 Every workout strengthens your habit chain!',
      '💪 Small improvements compound into massive results!'
    ],
    recovery: [
      '🧘 Perfect! Your recovery optimization is working beautifully!',
      '✨ That recovery improvement shows smart training!',
      '🌟 Your body is adapting and getting stronger!'
    ]
  },
  analytical: {
    strength: [
      '📊 Excellent! Your progressive overload strategy is working perfectly!',
      '🔬 The data shows your strength adaptation is on track!',
      '📈 Your strength curve is trending upward consistently!'
    ],
    endurance: [
      '📊 Impressive! Your cardiovascular efficiency is improving!',
      '🔬 The metrics confirm your endurance gains!',
      '📈 Your performance data shows clear improvement!'
    ],
    flexibility: [
      '📊 Outstanding! Your flexibility metrics are trending upward!',
      '🔬 The data confirms your mobility improvements!',
      '📈 Your range of motion is expanding systematically!'
    ],
    technique: [
      '📊 Remarkable! Your technique metrics are improving!',
      '🔬 The data shows your form is getting more efficient!',
      '📈 Your movement quality is trending upward!'
    ],
    consistency: [
      '📊 Impressive! Your consistency data shows great patterns!',
      '🔬 The metrics confirm your habit formation success!',
      '📈 Your adherence rate is trending upward!'
    ],
    recovery: [
      '📊 Excellent! Your recovery metrics are optimizing!',
      '🔬 The data shows your recovery strategy is working!',
      '📈 Your adaptation rate is improving consistently!'
    ]
  },
  competitive: {
    strength: [
      '🏆 Outstanding! You\'re crushing your previous records!',
      '🔥 That improvement puts you ahead of the competition!',
      '⚡ You\'re setting new standards for yourself!'
    ],
    endurance: [
      '🏆 Phenomenal! Your performance is reaching new heights!',
      '🔥 You\'re outpacing your previous best times!',
      '⚡ Your competitive edge is getting sharper!'
    ],
    flexibility: [
      '🏆 Incredible! You\'re surpassing your flexibility goals!',
      '🔥 That improvement puts you in elite territory!',
      '⚡ You\'re setting new personal bests!'
    ],
    technique: [
      '🏆 Amazing! Your technique is reaching elite levels!',
      '🔥 You\'re outperforming your previous form!',
      '⚡ Your skill level is getting competitive!'
    ],
    consistency: [
      '🏆 Outstanding! Your consistency is beating expectations!',
      '🔥 You\'re outperforming your previous patterns!',
      '⚡ Your dedication is setting new standards!'
    ],
    recovery: [
      '🏆 Phenomenal! Your recovery is reaching optimal levels!',
      '🔥 You\'re optimizing better than before!',
      '⚡ Your adaptation is setting new benchmarks!'
    ]
  },
  buddy: {
    strength: [
      '🤝 Awesome work! We\'re getting stronger together!',
      '💪 That improvement makes me proud to be your training partner!',
      '🔥 Your progress inspires me to push harder too!'
    ],
    endurance: [
      '🤝 Fantastic! We\'re building endurance as a team!',
      '🏃 Your improvement motivates me to keep up!',
      '💨 We\'re both getting faster and stronger!'
    ],
    flexibility: [
      '🤝 Wonderful! We\'re becoming more flexible together!',
      '🧘 Your improvement motivates me to stretch more!',
      '✨ We\'re both expanding our range of motion!'
    ],
    technique: [
      '🤝 Excellent! We\'re improving our form together!',
      '🎯 Your improvement inspires me to focus on technique!',
      '🌟 We\'re both getting more skilled!'
    ],
    consistency: [
      '🤝 Amazing! We\'re building consistency together!',
      '📊 Your improvement motivates me to stay consistent!',
      '🔗 We\'re both strengthening our habits!'
    ],
    recovery: [
      '🤝 Perfect! We\'re optimizing recovery together!',
      '🧘 Your improvement inspires me to recover better!',
      '✨ We\'re both getting smarter about training!'
    ]
  },
  zen: {
    strength: [
      '🧘 Peaceful strength grows within you!',
      '✨ Your inner power is expanding beautifully!',
      '🌟 Your strength journey is harmonious and balanced!'
    ],
    endurance: [
      '🧘 Your endurance flows like a peaceful river!',
      '✨ Your stamina grows with mindful practice!',
      '🌟 Your endurance journey is serene and steady!'
    ],
    flexibility: [
      '🧘 Your flexibility blossoms like a mindful flower!',
      '✨ Your mobility expands with gentle awareness!',
      '🌟 Your flexibility journey is peaceful and flowing!'
    ],
    technique: [
      '🧘 Your technique flows with mindful precision!',
      '✨ Your form improves with gentle focus!',
      '🌟 Your technique journey is balanced and harmonious!'
    ],
    consistency: [
      '🧘 Your consistency flows like a peaceful stream!',
      '✨ Your habits form with gentle persistence!',
      '🌟 Your consistency journey is steady and mindful!'
    ],
    recovery: [
      '🧘 Your recovery flows with peaceful wisdom!',
      '✨ Your adaptation happens with gentle awareness!',
      '🌟 Your recovery journey is harmonious and balanced!'
    ]
  },
  drill_sergeant: {
    strength: [
      '💪 SOLDIER! That strength gain shows real discipline!',
      '🔥 EXCELLENT WORK! Your muscles are responding to training!',
      '⚡ KEEP PUSHING! You\'re building real power!'
    ],
    endurance: [
      '🏃 SOLDIER! Your endurance is getting battle-ready!',
      '🔥 EXCELLENT WORK! Your stamina is improving!',
      '⚡ KEEP PUSHING! You\'re building real endurance!'
    ],
    flexibility: [
      '🧘 SOLDIER! Your flexibility is getting combat-ready!',
      '🔥 EXCELLENT WORK! Your mobility is improving!',
      '⚡ KEEP PUSHING! You\'re building real range!'
    ],
    technique: [
      '🎯 SOLDIER! Your technique is getting precision-ready!',
      '🔥 EXCELLENT WORK! Your form is improving!',
      '⚡ KEEP PUSHING! You\'re building real skill!'
    ],
    consistency: [
      '📊 SOLDIER! Your consistency shows real discipline!',
      '🔥 EXCELLENT WORK! Your habits are forming!',
      '⚡ KEEP PUSHING! You\'re building real dedication!'
    ],
    recovery: [
      '🧘 SOLDIER! Your recovery is getting mission-ready!',
      '🔥 EXCELLENT WORK! Your adaptation is improving!',
      '⚡ KEEP PUSHING! You\'re building real resilience!'
    ]
  },
  cheerleader: {
    strength: [
      '💪 YAY! Your strength is absolutely AMAZING!',
      '🔥 WOO-HOO! That improvement is INCREDIBLE!',
      '⚡ YOU GO! Your muscles are getting SO STRONG!'
    ],
    endurance: [
      '🏃 YAY! Your endurance is absolutely FANTASTIC!',
      '🔥 WOO-HOO! That improvement is AMAZING!',
      '⚡ YOU GO! Your stamina is getting SO GOOD!'
    ],
    flexibility: [
      '🧘 YAY! Your flexibility is absolutely WONDERFUL!',
      '🔥 WOO-HOO! That improvement is FANTASTIC!',
      '⚡ YOU GO! Your mobility is getting SO GREAT!'
    ],
    technique: [
      '🎯 YAY! Your technique is absolutely PERFECT!',
      '🔥 WOO-HOO! That improvement is AMAZING!',
      '⚡ YOU GO! Your form is getting SO GOOD!'
    ],
    consistency: [
      '📊 YAY! Your consistency is absolutely INCREDIBLE!',
      '🔥 WOO-HOO! That improvement is FANTASTIC!',
      '⚡ YOU GO! Your habits are getting SO STRONG!'
    ],
    recovery: [
      '🧘 YAY! Your recovery is absolutely WONDERFUL!',
      '🔥 WOO-HOO! That improvement is AMAZING!',
      '⚡ YOU GO! Your adaptation is getting SO GOOD!'
    ]
  },
  mentor: {
    strength: [
      '💪 Excellent progress! Your strength foundation is solid!',
      '🔥 Well done! Your progressive overload is working perfectly!',
      '⚡ Keep this up! You\'re building sustainable strength!'
    ],
    endurance: [
      '🏃 Excellent progress! Your endurance foundation is solid!',
      '🔥 Well done! Your cardiovascular training is effective!',
      '⚡ Keep this up! You\'re building sustainable stamina!'
    ],
    flexibility: [
      '🧘 Excellent progress! Your flexibility foundation is solid!',
      '🔥 Well done! Your mobility work is paying off!',
      '⚡ Keep this up! You\'re building sustainable range!'
    ],
    technique: [
      '🎯 Excellent progress! Your technique foundation is solid!',
      '🔥 Well done! Your form work is paying off!',
      '⚡ Keep this up! You\'re building sustainable skill!'
    ],
    consistency: [
      '📊 Excellent progress! Your consistency foundation is solid!',
      '🔥 Well done! Your habit building is working!',
      '⚡ Keep this up! You\'re building sustainable dedication!'
    ],
    recovery: [
      '🧘 Excellent progress! Your recovery foundation is solid!',
      '🔥 Well done! Your recovery strategy is effective!',
      '⚡ Keep this up! You\'re building sustainable adaptation!'
    ]
  }
};

// ==============================================================================
// SCIENTIFIC VALIDATION SYSTEM
// ==============================================================================

export const SCIENTIFIC_VALIDATION_CONFIG = {
  confidence: {
    high: { threshold: 0.95, color: '#4CAF50', icon: '🔬' },
    medium: { threshold: 0.80, color: '#FF9800', icon: '📊' },
    low: { threshold: 0.60, color: '#F44336', icon: '⚠️' }
  },
  methods: {
    statistical: {
      name: 'Statistical Analysis',
      description: 'Z-score analysis with p-value validation',
      icon: '📈'
    },
    scientific: {
      name: 'Research Validation',
      description: 'Peer-reviewed fitness research comparison',
      icon: '🔬'
    },
    consistency: {
      name: 'Consistency Check',
      description: 'Pattern analysis across multiple sessions',
      icon: '🔄'
    },
    peer: {
      name: 'Peer Benchmarking',
      description: 'Comparison with similar user profiles',
      icon: '👥'
    }
  },
  education: {
    strength: 'Progressive overload principles support your strength gains',
    endurance: 'Cardiovascular adaptation explains your endurance improvement',
    flexibility: 'Neuromuscular adaptation enhances your flexibility gains',
    technique: 'Motor learning theory validates your skill improvement',
    consistency: 'Habit formation research supports your consistency gains',
    recovery: 'Supercompensation theory explains your recovery optimization'
  }
};

// ==============================================================================
// CELEBRATION MECHANICS SYSTEM
// ==============================================================================

export class CelebrationMechanicsSystem {
  private static instance: CelebrationMechanicsSystem;
  private celebrationHistory: CelebrationEvent[] = [];
  private activeCelebrations: Map<string, CelebrationEvent> = new Map();

  private constructor() {}

  public static getInstance(): CelebrationMechanicsSystem {
    if (!CelebrationMechanicsSystem.instance) {
      CelebrationMechanicsSystem.instance = new CelebrationMechanicsSystem();
    }
    return CelebrationMechanicsSystem.instance;
  }

  // ==============================================================================
  // CORE CELEBRATION METHODS
  // ==============================================================================

  /**
   * Generate celebration for detected improvement
   */
  public generateCelebration(
    improvement: ImprovementDetection,
    character: GymmyCharacter,
    userSegment: FitnessSegment
  ): CelebrationEvent {
    // const celebrationType = ...; // Quick fix: commented unused variable
    // const celebration = ...; // Quick fix: commented unused variable
    
    // const sequence = ...; // Quick fix: commented unused variable
    // const characterResponse = ...; // Quick fix: commented unused variable
    // const validation = ...; // Quick fix: commented unused variable

    const celebrationEvent: CelebrationEvent = {
      id: `celebration_${Date.now()}_${improvement.id}`,
      userId: improvement.user_id,
      improvement,
      celebration,
      sequence,
      characterResponse,
      validation,
      timestamp: new Date().toISOString(),
      completed: false,
      shared: false
    };

    this.celebrationHistory.push(celebrationEvent);
    this.activeCelebrations.set(celebrationEvent.id, celebrationEvent);

    return celebrationEvent;
  }

  /**
   * Determine celebration type based on improvement percentage
   */
  private determineCelebrationType(percentage: number): string {
    if (percentage >= 10.0) return 'large';
    if (percentage >= 5.0) return 'medium';
    if (percentage >= 2.5) return 'small';
    return 'micro';
  }

  /**
   * Generate celebration sequence
   */
  private generateCelebrationSequence(
    improvement: ImprovementDetection,
    celebration: CelebrationConfig
  ): CelebrationSequence[] {
    // const segmentStyle = ...; // Quick fix: commented unused variable
    
    return [
      {
        phase: 'detection',
        duration: 500,
        animation: 'subtle_pulse',
        sound: 'gentle_chime',
        visual: 'soft_glow'
      },
      {
        phase: 'validation',
        duration: 1000,
        animation: 'data_flow',
        sound: 'scientific_beep',
        visual: 'validation_badge'
      },
      {
        phase: 'character',
        duration: 1000,
        animation: 'character_celebration',
        sound: 'character_voice',
        visual: 'personalized_message',
        characterMessage: this.getRandomMessage(segmentStyle.messages)
      },
      {
        phase: 'rewards',
        duration: 1000,
        animation: 'reward_reveal',
        sound: 'reward_chime',
        visual: 'xp_gem_display'
      }
    ];
  }

  /**
   * Generate character response
   */
  private generateCharacterResponse(
    improvement: ImprovementDetection,
    character: GymmyCharacter
  ): CharacterResponse {
    // const personality = ...; // Quick fix: commented unused variable
    // const specialization = ...; // Quick fix: commented unused variable
    // const improvementType = ...; // Quick fix: commented unused variable
    // const percentage = ...; // Quick fix: commented unused variable

    const messages = CHARACTER_RESPONSES[personality][improvementType] || 
                    CHARACTER_RESPONSES[personality]['strength'];
    
    // const message = ...; // Quick fix: commented unused variable
    // const mood = ...; // Quick fix: commented unused variable

    return {
      personality,
      specialization,
      improvementType,
      improvementPercentage: percentage,
      message,
      animation: 'celebration_dance',
      mood,
      duration: 300000 // 5 minutes
    };
  }

  /**
   * Generate scientific validation
   */
  private generateScientificValidation(improvement: ImprovementDetection): ScientificValidation {
    // const confidence = ...; // Quick fix: commented unused variable
    // const method = ...; // Quick fix: commented unused variable
    // const config = ...; // Quick fix: commented unused variable

    return {
      confidence,
      method,
      description: config.methods[method].description,
      icon: config.methods[method].icon,
      color: config.confidence[confidence].color,
      educationalContent: config.education[improvement.dimension] || config.education.strength
    };
  }

  /**
   * Determine character mood based on improvement percentage
   */
  private determineCharacterMood(percentage: number): CharacterResponse['mood'] {
    if (percentage >= 10.0) return 'inspired';
    if (percentage >= 5.0) return 'excited';
    if (percentage >= 2.5) return 'proud';
    return 'motivated';
  }

  /**
   * Determine confidence level
   */
  private determineConfidenceLevel(confidenceScore: number): ScientificValidation['confidence'] {
    if (confidenceScore >= 0.95) return 'high';
    if (confidenceScore >= 0.80) return 'medium';
    return 'low';
  }

  /**
   * Get random message from array
   */
  private getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // ==============================================================================
  // CELEBRATION MANAGEMENT
  // ==============================================================================

  /**
   * Complete celebration event
   */
  public completeCelebration(celebrationId: string): void {
    // const celebration = ...; // Quick fix: commented unused variable
    if (celebration) {
      celebration.completed = true;
      this.activeCelebrations.delete(celebrationId);
    }
  }

  /**
   * Share celebration event
   */
  public shareCelebration(celebrationId: string): void {
    // const celebration = ...; // Quick fix: commented unused variable
    if (celebration) {
      celebration.shared = true;
    }
  }

  /**
   * Get user's celebration history
   */
  public getCelebrationHistory(userId: string): CelebrationEvent[] {
    return this.celebrationHistory.filter(c => c.userId === userId);
  }

  /**
   * Get active celebrations for user
   */
  public getActiveCelebrations(userId: string): CelebrationEvent[] {
    return Array.from(this.activeCelebrations.values())
      .filter(c => c.userId === userId);
  }

  // ==============================================================================
  // ANALYTICS AND INSIGHTS
  // ==============================================================================

  /**
   * Get celebration analytics
   */
  public getCelebrationAnalytics(userId: string) {
    // const userCelebrations = ...; // Quick fix: commented unused variable
    
    return {
      totalCelebrations: userCelebrations.length,
      completedCelebrations: userCelebrations.filter(c => c.completed).length,
      sharedCelebrations: userCelebrations.filter(c => c.shared).length,
      averageImprovement: userCelebrations.reduce((sum, c) => sum + c.improvement.improvement_percentage, 0) / userCelebrations.length,
      favoriteDimension: this.getMostCelebratedDimension(userCelebrations),
      celebrationTrend: this.getCelebrationTrend(userCelebrations)
    };
  }

  /**
   * Get most celebrated dimension
   */
  private getMostCelebratedDimension(celebrations: CelebrationEvent[]): string {
    const dimensionCounts = celebrations.reduce((counts, c) => {
      counts[c.improvement.dimension] = (counts[c.improvement.dimension] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(dimensionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'strength';
  }

  /**
   * Get celebration trend
   */
  private getCelebrationTrend(celebrations: CelebrationEvent[]): 'increasing' | 'decreasing' | 'stable' {
    if (celebrations.length < 2) return 'stable';
    
    // const recent = ...; // Quick fix: commented unused variable
    // const previous = ...; // Quick fix: commented unused variable
    
    if (recent.length === 0 || previous.length === 0) return 'stable';
    
    // const recentAvg = ...; // Quick fix: commented unused variable
    // const previousAvg = ...; // Quick fix: commented unused variable
    
    if (recentAvg > previousAvg * 1.1) return 'increasing';
    if (recentAvg < previousAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  // ==============================================================================
  // INTEGRATION METHODS
  // ==============================================================================

  /**
   * Integrate with existing celebration systems
   */
  public integrateWithExistingCelebrations(): void {
    // Integration with existing gacha celebration system
    // This would connect with the existing CelebrationEffects component
  }

  /**
   * Export celebration data for analytics
   */
  public exportCelebrationData(): any {
    return {
      totalCelebrations: this.celebrationHistory.length,
      activeCelebrations: this.activeCelebrations.size,
      celebrationTypes: this.getCelebrationTypeDistribution(),
      userEngagement: this.getUserEngagementMetrics()
    };
  }

  /**
   * Get celebration type distribution
   */
  private getCelebrationTypeDistribution(): Record<string, number> {
    return this.celebrationHistory.reduce((counts, c) => {
      counts[c.celebration.type] = (counts[c.celebration.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  /**
   * Get user engagement metrics
   */
  private getUserEngagementMetrics(): any {
    // const uniqueUsers = ...; // Quick fix: commented unused variable
    
    return {
      uniqueUsers: uniqueUsers.size,
      averageCelebrationsPerUser: this.celebrationHistory.length / uniqueUsers.size,
      completionRate: this.celebrationHistory.filter(c => c.completed).length / this.celebrationHistory.length,
      sharingRate: this.celebrationHistory.filter(c => c.shared).length / this.celebrationHistory.length
    };
  }
}

// Export singleton instance
export // const celebrationMechanicsSystem = ...; // Quick fix: commented unused variable
