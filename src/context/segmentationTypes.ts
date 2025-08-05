// src/context/segmentationTypes.ts

export type FitnessSegment = 
  | 'strength_seeker'
  | 'calorie_crusher' 
  | 'body_optimizer'
  | 'wellness_seeker'
  | 'endurance_athlete'
  | 'habit_builder'
  | 'social_enthusiast'
  | 'unassigned';

export interface SegmentProfile {
  primarySegment: FitnessSegment;
  secondarySegment?: FitnessSegment;
  segmentStrength: number; // 0-100, confidence in classification
  segmentHistory: SegmentTransition[];
  lastSegmentUpdate: string;
  onboardingCompleted: boolean;
}

export interface SegmentTransition {
  fromSegment: FitnessSegment | null;
  toSegment: FitnessSegment;
  transitionDate: string;
  reason: 'onboarding' | 'survey_retake' | 'behavior_analysis' | 'manual_change';
  confidence: number;
}

export interface SurveyResponse {
  questionId: string;
  questionText: string;
  selectedOption: string;
  optionValue: number;
  segmentWeights: Record<FitnessSegment, number>;
  timestamp: string;
}

export interface OnboardingSurvey {
  id: string;
  responses: SurveyResponse[];
  calculatedSegments: Record<FitnessSegment, number>;
  recommendedSegment: FitnessSegment;
  confidence: number;
  completedAt: string;
  version: string; // For A/B testing different survey versions
}

export interface SegmentPreferences {
  // Goal preferences
  preferredMetrics: string[];
  goalTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  difficultyPreference: 'easy' | 'moderate' | 'challenging' | 'adaptive';
  
  // Motivation preferences  
  celebrationStyle: 'minimal' | 'moderate' | 'enthusiastic';
  reminderFrequency: 'never' | 'weekly' | 'daily' | 'frequent';
  socialSharing: boolean;
  
  // UI preferences
  dashboardFocus: 'progress' | 'goals' | 'social' | 'analytics';
  chartTypes: string[];
  gymmyPersonality: 'encouraging' | 'coaching' | 'analytical' | 'buddy';
}

export interface SegmentMetrics {
  // Engagement metrics per segment
  dailyActiveRate: number;
  weeklyRetentionRate: number;
  goalCompletionRate: number;
  featureUsageRates: Record<string, number>;
  satisfactionScore: number;
  
  // Progression metrics
  averageProgressRate: number;
  milestoneHitRate: number;
  consistencyScore: number;
  
  // Last updated
  lastCalculated: string;
}

// Extended user stats to include segmentation
export interface EnhancedUserStats {
  // Existing user stats
  level: number;
  experience: number;
  selectedClass: string;
  classLevel: number;
  classExperience: number;
  currencies: {
    gems: number;
  };
  characterCollection: string[];
  achievements: string[];
  quests: string[];
  
  // NEW: Segmentation data
  segmentProfile: SegmentProfile;
  surveyHistory: OnboardingSurvey[];
  segmentPreferences: SegmentPreferences;
  segmentMetrics: SegmentMetrics;
  
  // NEW: Personalization data
  personalizedGoals: PersonalizedGoal[];
  adaptiveSettings: AdaptiveSettings;
}

export interface PersonalizedGoal {
  id: string;
  segment: FitnessSegment;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  priority: 'high' | 'medium' | 'low';
  category: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isActive: boolean;
}

export interface AdaptiveSettings {
  // Dynamic difficulty adjustment
  currentDifficulty: number; // 0-100
  difficultyAdjustmentRate: number;
  lastDifficultyUpdate: string;
  
  // Goal generation settings
  goalGenerationFrequency: 'daily' | 'weekly' | 'biweekly';
  maxActiveGoals: number;
  goalComplexityPreference: number;
  
  // Motivation system settings
  motivationLevel: number; // 0-100
  lastMotivationUpdate: string;
  responsiveToStreaks: boolean;
  responsiveToFailures: boolean;
}

// Segment-specific constants and configurations
export const SEGMENT_CONFIGS: Record<FitnessSegment, SegmentConfig> = {
  strength_seeker: {
    name: 'Strength Seeker',
    description: 'Focused on building strength and hitting PRs',
    primaryMetrics: ['weight_lifted', 'one_rep_max', 'total_volume'],
    preferredExercises: ['squat', 'deadlift', 'bench_press', 'overhead_press'],
    gymmyPersonality: 'coaching',
    defaultGoals: ['increase_squat_5lbs', 'hit_new_bench_pr', 'improve_deadlift_form'],
    motivationTriggers: ['pr_achieved', 'weight_increased', 'form_improved'],
    celebrationStyle: 'enthusiastic',
    colorScheme: '#FF6B35', // Orange/red for power
  },
  calorie_crusher: {
    name: 'Calorie Crusher',
    description: 'Focused on burning calories and metabolic health',
    primaryMetrics: ['calories_burned', 'active_minutes', 'heart_rate_zones'],
    preferredExercises: ['running', 'cycling', 'hiit', 'circuit_training'],
    gymmyPersonality: 'encouraging',
    defaultGoals: ['burn_400_calories', 'complete_30min_cardio', 'hit_target_heart_rate'],
    motivationTriggers: ['calorie_milestone', 'cardio_improvement', 'energy_boost'],
    celebrationStyle: 'enthusiastic',
    colorScheme: '#FF1744', // Bright red for energy
  },
  body_optimizer: {
    name: 'Body Optimizer',
    description: 'Focused on body composition and aesthetic goals',
    primaryMetrics: ['body_weight', 'body_measurements', 'progress_photos'],
    preferredExercises: ['full_body_workouts', 'compound_movements', 'accessory_work'],
    gymmyPersonality: 'analytical',
    defaultGoals: ['lose_1lb_per_week', 'reduce_waist_measurement', 'gain_lean_muscle'],
    motivationTriggers: ['measurement_improvement', 'photo_progress', 'consistency_streak'],
    celebrationStyle: 'moderate',
    colorScheme: '#7C4DFF', // Purple for transformation
  },
  wellness_seeker: {
    name: 'Wellness Seeker',
    description: 'Focused on flexibility, mindfulness, and overall well-being',
    primaryMetrics: ['flexibility_improvements', 'stress_levels', 'sleep_quality'],
    preferredExercises: ['yoga', 'stretching', 'meditation', 'walking'],
    gymmyPersonality: 'buddy',
    defaultGoals: ['10min_daily_meditation', 'improve_shoulder_flexibility', 'better_sleep'],
    motivationTriggers: ['flexibility_gain', 'stress_reduction', 'mindful_moments'],
    celebrationStyle: 'minimal',
    colorScheme: '#00BCD4', // Teal for calm
  },
  endurance_athlete: {
    name: 'Endurance Athlete',
    description: 'Focused on athletic performance and endurance',
    primaryMetrics: ['pace_improvements', 'distance_completed', 'race_times'],
    preferredExercises: ['running', 'cycling', 'swimming', 'interval_training'],
    gymmyPersonality: 'coaching',
    defaultGoals: ['improve_5k_time', 'increase_weekly_mileage', 'complete_long_run'],
    motivationTriggers: ['pace_improvement', 'distance_milestone', 'race_pr'],
    celebrationStyle: 'moderate',
    colorScheme: '#4CAF50', // Green for endurance
  },
  habit_builder: {
    name: 'Habit Builder',
    description: 'Focused on consistency and building sustainable routines',
    primaryMetrics: ['workout_consistency', 'habit_streaks', 'weekly_frequency'],
    preferredExercises: ['any_movement', 'bodyweight_exercises', 'short_workouts'],
    gymmyPersonality: 'encouraging',
    defaultGoals: ['workout_3_times_weekly', 'maintain_streak', 'complete_planned_sessions'],
    motivationTriggers: ['consistency_milestone', 'streak_achievement', 'habit_formation'],
    celebrationStyle: 'enthusiastic',
    colorScheme: '#FF9800', // Orange for energy and consistency
  },
  social_enthusiast: {
    name: 'Social Enthusiast',
    description: 'Motivated by community and shared fitness experiences',
    primaryMetrics: ['group_workouts', 'community_engagement', 'social_sharing'],
    preferredExercises: ['group_fitness', 'partner_workouts', 'team_sports'],
    gymmyPersonality: 'buddy',
    defaultGoals: ['attend_group_class', 'encourage_friends', 'share_achievements'],
    motivationTriggers: ['social_interaction', 'community_support', 'shared_goals'],
    celebrationStyle: 'enthusiastic',
    colorScheme: '#E91E63', // Pink for social connection
  },
  unassigned: {
    name: 'Getting to Know You',
    description: 'Learning about your fitness preferences',
    primaryMetrics: ['general_activity', 'exploration_rate'],
    preferredExercises: ['varied'],
    gymmyPersonality: 'encouraging',
    defaultGoals: ['complete_onboarding', 'try_different_workouts', 'discover_preferences'],
    motivationTriggers: ['exploration', 'trying_new_things'],
    celebrationStyle: 'moderate',
    colorScheme: '#9E9E9E', // Gray for unassigned
  }
};

export interface SegmentConfig {
  name: string;
  description: string;
  primaryMetrics: string[];
  preferredExercises: string[];
  gymmyPersonality: 'encouraging' | 'coaching' | 'analytical' | 'buddy';
  defaultGoals: string[];
  motivationTriggers: string[];
  celebrationStyle: 'minimal' | 'moderate' | 'enthusiastic';
  colorScheme: string;
}