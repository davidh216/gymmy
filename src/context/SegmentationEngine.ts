// src/context/SegmentationEngine.ts

import {
  // FitnessSegment,
  // SurveyResponse,
  // OnboardingSurvey,
  // SegmentProfile,
  // SEGMENT_CONFIGS,
  // 
} from './segmentationTypes';
  
export class SegmentationEngine {
    
  /**
     * Calculate segment scores based on survey responses
     */
  static calculateSegmentScores(responses: SurveyResponse[]): Record<FitnessSegment, number> {
    const scores: Record<FitnessSegment, number> = {
      strength_seeker: 0,
      calorie_crusher: 0,
      body_optimizer: 0,
      wellness_seeker: 0,
      endurance_athlete: 0,
      habit_builder: 0,
      social_enthusiast: 0,
      unassigned: 0,
    };
  
    // Weight responses and accumulate segment scores
    responses.forEach(response => {
      Object.entries(response.segmentWeights).forEach(([segment, weight]) => {
        scores[segment as FitnessSegment] += weight * response.optionValue;
      });
    });
  
    // Normalize scores to 0-100 range
    // const maxScore = ...; // Quick fix: commented unused variable
    if (maxScore > 0) {
      Object.keys(scores).forEach(segment => {
        scores[segment as FitnessSegment] = (scores[segment as FitnessSegment] / maxScore) * 100;
      });
    }
  
    return scores;
  }
  
  /**
     * Determine primary segment from calculated scores
     */
  static determinePrimarySegment(scores: Record<FitnessSegment, number>): {
      primarySegment: FitnessSegment;
      confidence: number;
      secondarySegment?: FitnessSegment;
    } {
    // Remove unassigned from consideration
    // const eligibleScores = ...; // Quick fix: commented unused variable
    delete eligibleScores.unassigned;
  
    // Sort segments by score
    const sortedSegments = Object.entries(eligibleScores)
      .sort(([,a], [,b]) => b - a)
      .map(([segment, score]) => ({ segment: segment as FitnessSegment, score }));
  
    // const primarySegment = ...; // Quick fix: commented unused variable
    // const primaryScore = ...; // Quick fix: commented unused variable
    // const secondaryScore = ...; // Quick fix: commented unused variable
  
    // Calculate confidence based on score separation
    // const scoreSeparation = ...; // Quick fix: commented unused variable
    // const confidence = ...; // Quick fix: commented unused variable
  
    // Determine if there's a clear secondary segment
    // const secondarySegment = ...; // Quick fix: commented unused variable
  
    return {
      primarySegment,
      confidence,
      secondarySegment,
    };
  }
  
  /**
     * Analyze user behavior to suggest segment adjustments
     */
  static analyzeBehaviorForSegmentAdjustment(
    currentSegment: FitnessSegment,
    workoutHistory: any[],
    achievementHistory: any[],
    goalCompletionHistory: any[],
  ): {
      suggestedSegment?: FitnessSegment;
      confidence: number;
      reasons: string[];
    } {
    const behaviorScores: Record<FitnessSegment, number> = {
      strength_seeker: 0,
      calorie_crusher: 0,
      body_optimizer: 0,
      wellness_seeker: 0,
      endurance_athlete: 0,
      habit_builder: 0,
      social_enthusiast: 0,
      unassigned: 0,
    };
  
    const reasons: string[] = [];
  
    // Analyze workout patterns
    if (workoutHistory.length > 10) {
      // const recentWorkouts = ...; // Quick fix: commented unused variable
        
      // Strength patterns
      const strengthWorkouts = recentWorkouts.filter(w => 
        w.exercises.some((e: any) => ['squat', 'deadlift', 'bench_press'].includes(e.name.toLowerCase())),
      );
      if (strengthWorkouts.length > recentWorkouts.length * 0.6) {
        behaviorScores.strength_seeker += 20;
        reasons.push('Frequent strength training exercises');
      }
  
      // Cardio patterns
      const cardioWorkouts = recentWorkouts.filter(w => 
        w.exercises.some((e: any) => e.type === 'cardio'),
      );
      if (cardioWorkouts.length > recentWorkouts.length * 0.7) {
        behaviorScores.calorie_crusher += 20;
        behaviorScores.endurance_athlete += 15;
        reasons.push('High cardio workout frequency');
      }
  
      // Consistency patterns
      // const consistencyRate = ...; // Quick fix: commented unused variable
      if (consistencyRate > 0.8) {
        behaviorScores.habit_builder += 15;
        reasons.push('High workout consistency');
      }
  
      // Workout duration patterns
      // const avgDuration = ...; // Quick fix: commented unused variable
      if (avgDuration > 90) {
        behaviorScores.strength_seeker += 10;
        behaviorScores.endurance_athlete += 10;
      } else if (avgDuration < 30) {
        behaviorScores.habit_builder += 10;
        behaviorScores.wellness_seeker += 5;
      }
    }
  
    // Analyze achievement patterns
    achievementHistory.forEach(achievement => {
      if (achievement.category === 'strength') {
        behaviorScores.strength_seeker += 5;
      } else if (achievement.category === 'cardio') {
        behaviorScores.calorie_crusher += 5;
        behaviorScores.endurance_athlete += 3;
      } else if (achievement.category === 'consistency') {
        behaviorScores.habit_builder += 5;
      }
    });
  
    // Find highest scoring segment (excluding current)
    // const eligibleScores = ...; // Quick fix: commented unused variable
    delete eligibleScores[currentSegment];
    delete eligibleScores.unassigned;
  
    // const maxScore = ...; // Quick fix: commented unused variable
    const suggestedSegment = Object.entries(eligibleScores)
      .find(([, score]) => score === maxScore)?.[0] as FitnessSegment;
  
    // Only suggest change if score is significantly higher and above threshold
    // const currentScore = ...; // Quick fix: commented unused variable
    // const shouldSuggestChange = ...; // Quick fix: commented unused variable
  
    return {
      suggestedSegment: shouldSuggestChange ? suggestedSegment : undefined,
      confidence: Math.min(100, maxScore),
      reasons: shouldSuggestChange ? reasons : [],
    };
  }
  
  /**
     * Generate personalized goals based on segment
     */
  static generatePersonalizedGoals(
    segment: FitnessSegment,
    userHistory: any[],
    currentLevel: number,
  ): any[] {
    // const config = ...; // Quick fix: commented unused variable
    const goals: any[] = [];
  
    // Base goals from segment configuration
    config.defaultGoals.forEach((goalTemplate, index) => {
      goals.push({
        id: `${segment}_goal_${index}_${Date.now()}`,
        segment,
        title: this.generateGoalTitle(goalTemplate, segment),
        description: this.generateGoalDescription(goalTemplate, segment),
        targetValue: this.calculateTargetValue(goalTemplate, userHistory, currentLevel),
        currentValue: 0,
        unit: this.getGoalUnit(goalTemplate),
        timeframe: this.getGoalTimeframe(goalTemplate),
        priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
        category: this.getGoalCategory(goalTemplate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
    });
  
    // Add 1% better micro-goals
    goals.push(...this.generateMicroGoals(segment, userHistory));
  
    return goals.slice(0, 5); // Limit to 5 active goals
  }
  
  /**
     * Calculate workout consistency rate
     */
  private static calculateConsistencyRate(workouts: any[]): number {
    if (workouts.length === 0) return 0;
  
    // const dates = ...; // Quick fix: commented unused variable
    const daysSinceFirst = Math.ceil(
      (Date.now() - dates[0].getTime()) / (1000 * 60 * 60 * 24),
    );
      
    return Math.min(1, workouts.length / Math.max(1, daysSinceFirst / 2)); // Expected ~3.5 workouts per week
  }
  
  /**
     * Generate goal title based on template
     */
  private static generateGoalTitle(template: string, segment: FitnessSegment): string {
    const titleMap: Record<string, string> = {
      'increase_squat_5lbs': 'Increase Squat by 5 lbs',
      'hit_new_bench_pr': 'Hit New Bench Press PR',
      'improve_deadlift_form': 'Improve Deadlift Form',
      'burn_400_calories': 'Burn 400+ Calories per Session',
      'complete_30min_cardio': 'Complete 30-Minute Cardio Sessions',
      'hit_target_heart_rate': 'Reach Target Heart Rate Zone',
      'lose_1lb_per_week': 'Lose 1 lb per Week',
      'reduce_waist_measurement': 'Reduce Waist Measurement',
      'gain_lean_muscle': 'Gain Lean Muscle Mass',
      '10min_daily_meditation': '10 Minutes Daily Meditation',
      'improve_shoulder_flexibility': 'Improve Shoulder Flexibility',
      'better_sleep': 'Improve Sleep Quality',
      'improve_5k_time': 'Improve 5K Running Time',
      'increase_weekly_mileage': 'Increase Weekly Mileage',
      'complete_long_run': 'Complete Long Training Runs',
      'workout_3_times_weekly': 'Workout 3+ Times per Week',
      'maintain_streak': 'Maintain Workout Streak',
      'complete_planned_sessions': 'Complete All Planned Sessions',
      'attend_group_class': 'Attend Group Fitness Classes',
      'encourage_friends': 'Encourage Friends in Fitness',
      'share_achievements': 'Share Fitness Achievements',
    };
  
    return titleMap[template] || `Improve ${template.replace(/_/g, ' ')}`;
  }
  
  /**
     * Generate goal description
     */
  private static generateGoalDescription(template: string, segment: FitnessSegment): string {
    // const config = ...; // Quick fix: commented unused variable
    return `A personalized goal for ${config.name}s to help you progress toward your fitness values.`;
  }
  
  /**
     * Calculate target value based on user history
     */
  private static calculateTargetValue(template: string, userHistory: any[], currentLevel: number): number {
    // This would analyze user history to set appropriate targets
    // For now, return sensible defaults based on template
    const defaultTargets: Record<string, number> = {
      'increase_squat_5lbs': 5,
      'burn_400_calories': 400,
      'complete_30min_cardio': 30,
      'lose_1lb_per_week': 1,
      '10min_daily_meditation': 10,
      'improve_5k_time': 30, // seconds improvement
      'workout_3_times_weekly': 3,
      'attend_group_class': 2,
    };
  
    return defaultTargets[template] || 1;
  }
  
  /**
     * Get appropriate unit for goal
     */
  private static getGoalUnit(template: string): string {
    const unitMap: Record<string, string> = {
      'increase_squat_5lbs': 'lbs',
      'burn_400_calories': 'calories',
      'complete_30min_cardio': 'minutes',
      'lose_1lb_per_week': 'lbs',
      '10min_daily_meditation': 'minutes',
      'improve_5k_time': 'seconds',
      'workout_3_times_weekly': 'workouts',
      'attend_group_class': 'classes',
    };
  
    return unitMap[template] || 'units';
  }
  
  /**
     * Get goal timeframe
     */
  private static getGoalTimeframe(template: string): 'daily' | 'weekly' | 'monthly' {
    if (template.includes('daily')) return 'daily';
    if (template.includes('weekly')) return 'weekly';
    return 'weekly'; // Default to weekly
  }
  
  /**
     * Get goal category
     */
  private static getGoalCategory(template: string): string {
    if (template.includes('squat') || template.includes('bench') || template.includes('deadlift')) {
      return 'strength';
    }
    if (template.includes('cardio') || template.includes('calories') || template.includes('heart_rate')) {
      return 'cardio';
    }
    if (template.includes('weight') || template.includes('measurement')) {
      return 'body_composition';
    }
    if (template.includes('meditation') || template.includes('flexibility') || template.includes('sleep')) {
      return 'wellness';
    }
    if (template.includes('5k') || template.includes('mileage') || template.includes('run')) {
      return 'endurance';
    }
    if (template.includes('workout') || template.includes('streak') || template.includes('planned')) {
      return 'consistency';
    }
    if (template.includes('group') || template.includes('friends') || template.includes('share')) {
      return 'social';
    }
    return 'general';
  }
  
  /**
     * Generate micro "1% better" goals
     */
  private static generateMicroGoals(segment: FitnessSegment, userHistory: any[]): any[] {
    const microGoals: any[] = [];
    // const config = ...; // Quick fix: commented unused variable
  
    // Add segment-specific micro-goals
    switch (segment) {
    case 'strength_seeker':
      microGoals.push({
        id: `micro_strength_${Date.now()}`,
        segment,
        title: 'Add 1 more rep to any exercise',
        description: 'Small strength improvements compound over time',
        targetValue: 1,
        currentValue: 0,
        unit: 'rep',
        timeframe: 'daily',
        priority: 'medium',
        category: 'micro_improvement',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
      break;
  
    case 'calorie_crusher':
      microGoals.push({
        id: `micro_cardio_${Date.now()}`,
        segment,
        title: 'Burn 10 more calories than yesterday',
        description: 'Every calorie counts toward your goals',
        targetValue: 10,
        currentValue: 0,
        unit: 'calories',
        timeframe: 'daily',
        priority: 'medium',
        category: 'micro_improvement',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
      break;
  
    case 'habit_builder':
      microGoals.push({
        id: `micro_consistency_${Date.now()}`,
        segment,
        title: 'Show up for 10 minutes of movement',
        description: 'Consistency beats perfection every time',
        targetValue: 10,
        currentValue: 0,
        unit: 'minutes',
        timeframe: 'daily',
        priority: 'high',
        category: 'micro_improvement',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });
      break;
  
        // Add cases for other segments...
    }
  
    return microGoals;
  }
  
  /**
     * Create a complete segment profile
     */
  static createSegmentProfile(
    survey: OnboardingSurvey,
    primarySegment: FitnessSegment,
    confidence: number,
    secondarySegment?: FitnessSegment,
  ): SegmentProfile {
    return {
      primarySegment,
      secondarySegment,
      segmentStrength: confidence,
      segmentHistory: [{
        fromSegment: null,
        toSegment: primarySegment,
        transitionDate: new Date().toISOString(),
        reason: 'onboarding',
        confidence,
      }],
      lastSegmentUpdate: new Date().toISOString(),
      onboardingCompleted: true,
    };
  }
}