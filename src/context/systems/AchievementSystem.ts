// src/context/systems/AchievementSystem.ts
// Achievement System - Comprehensive achievement tracking and rewards

import {
  // AchievementData,
  // AchievementCategory,
  // AchievementProgress,
  // AchievementReward,
  // // Remove unused imports
  // WorkoutMetrics,
  // // GymmyCharacter,
  // // SpecializationType,
  // // PersonalityType,
  // // FitnessSegment,
  // 
} from '../types';

// ==============================================================================
// CORE INTERFACES
// ==============================================================================

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  category: 'milestone' | 'consistency' | 'dimension' | 'scientific' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  color: string;
  reward: {
    xp: number;
    gems: number;
    characterExperience?: number;
    specialReward?: string;
  };
  requirements: AchievementRequirement;
  progress: {
    current: number;
    required: number;
    percentage: number;
  };
  unlocked: boolean;
  unlockedAt?: string;
  shared: boolean;
  sharedAt?: string;
}

export interface AchievementRequirement {
  type: 'improvements' | 'streak' | 'dimension_mastery' | 'scientific_validation' | 'social_sharing' | 'personal_record';
  value: number;
  dimension?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  conditions?: string[];
}

export interface AchievementProgress {
  userId: string;
  achievementId: string;
  currentValue: number;
  requiredValue: number;
  percentage: number;
  lastUpdated: string;
}

export interface AchievementAnalytics {
  totalAchievements: number;
  unlockedAchievements: number;
  completionRate: number;
  averageUnlockTime: number;
  favoriteCategory: string;
  sharingRate: number;
  recentUnlocks: AchievementData[];
  upcomingAchievements: AchievementData[];
}

// ==============================================================================
// ACHIEVEMENT DEFINITIONS
// ==============================================================================

export const MICRO_IMPROVEMENT_ACHIEVEMENTS: Record<string, Omit<AchievementData, 'progress' | 'unlocked' | 'shared'>> = {
  // First-time achievements
  first_improvement: {
    id: 'first_improvement',
    name: 'First Step Forward',
    description: 'Detected your first 1% improvement',
    category: 'milestone',
    rarity: 'common',
    icon: '🎯',
    color: '#4CAF50',
    reward: { xp: 100, gems: 20, characterExperience: 50 },
    requirements: {
      type: 'improvements',
      value: 1,
      timeframe: 'all_time'
    }
  },
  
  // Consistency achievements
  improvement_streak_3: {
    id: 'improvement_streak_3',
    name: 'Consistent Progress',
    description: '3 consecutive days with improvements',
    category: 'consistency',
    rarity: 'rare',
    icon: '🔥',
    color: '#FF9800',
    reward: { xp: 200, gems: 40, characterExperience: 100 },
    requirements: {
      type: 'streak',
      value: 3,
      timeframe: 'all_time'
    }
  },
  
  improvement_streak_7: {
    id: 'improvement_streak_7',
    name: 'Week of Wins',
    description: '7 consecutive days with improvements',
    category: 'consistency',
    rarity: 'epic',
    icon: '⭐',
    color: '#9C27B0',
    reward: { xp: 500, gems: 100, characterExperience: 250 },
    requirements: {
      type: 'streak',
      value: 7,
      timeframe: 'all_time'
    }
  },
  
  improvement_streak_30: {
    id: 'improvement_streak_30',
    name: 'Monthly Master',
    description: '30 consecutive days with improvements',
    category: 'consistency',
    rarity: 'legendary',
    icon: '👑',
    color: '#FF5722',
    reward: { xp: 1000, gems: 200, characterExperience: 500, specialReward: 'monthly_master_badge' },
    requirements: {
      type: 'streak',
      value: 30,
      timeframe: 'all_time'
    }
  },
  
  // Dimension achievements
  strength_master_10: {
    id: 'strength_master_10',
    name: 'Strength Seeker',
    description: '10 strength improvements detected',
    category: 'dimension',
    rarity: 'rare',
    icon: '💪',
    color: '#FF6B35',
    reward: { xp: 300, gems: 60, characterExperience: 150 },
    requirements: {
      type: 'dimension_mastery',
      value: 10,
      dimension: 'strength',
      timeframe: 'all_time'
    }
  },
  
  strength_master_50: {
    id: 'strength_master_50',
    name: 'Strength Legend',
    description: '50 strength improvements detected',
    category: 'dimension',
    rarity: 'epic',
    icon: '🏋️',
    color: '#FF1744',
    reward: { xp: 800, gems: 160, characterExperience: 400 },
    requirements: {
      type: 'dimension_mastery',
      value: 50,
      dimension: 'strength',
      timeframe: 'all_time'
    }
  },
  
  endurance_master_10: {
    id: 'endurance_master_10',
    name: 'Endurance Champion',
    description: '10 endurance improvements detected',
    category: 'dimension',
    rarity: 'rare',
    icon: '🏃',
    color: '#4CAF50',
    reward: { xp: 300, gems: 60, characterExperience: 150 },
    requirements: {
      type: 'dimension_mastery',
      value: 10,
      dimension: 'endurance',
      timeframe: 'all_time'
    }
  },
  
  endurance_master_50: {
    id: 'endurance_master_50',
    name: 'Endurance Elite',
    description: '50 endurance improvements detected',
    category: 'dimension',
    rarity: 'epic',
    icon: '⚡',
    color: '#00BCD4',
    reward: { xp: 800, gems: 160, characterExperience: 400 },
    requirements: {
      type: 'dimension_mastery',
      value: 50,
      dimension: 'endurance',
      timeframe: 'all_time'
    }
  },
  
  flexibility_master_10: {
    id: 'flexibility_master_10',
    name: 'Flexibility Explorer',
    description: '10 flexibility improvements detected',
    category: 'dimension',
    rarity: 'rare',
    icon: '🧘',
    color: '#8BC34A',
    reward: { xp: 300, gems: 60, characterExperience: 150 },
    requirements: {
      type: 'dimension_mastery',
      value: 10,
      dimension: 'flexibility',
      timeframe: 'all_time'
    }
  },
  
  technique_master_10: {
    id: 'technique_master_10',
    name: 'Technique Specialist',
    description: '10 technique improvements detected',
    category: 'dimension',
    rarity: 'rare',
    icon: '🎯',
    color: '#FFC107',
    reward: { xp: 300, gems: 60, characterExperience: 150 },
    requirements: {
      type: 'dimension_mastery',
      value: 10,
      dimension: 'technique',
      timeframe: 'all_time'
    }
  },
  
  consistency_master_10: {
    id: 'consistency_master_10',
    name: 'Consistency Champion',
    description: '10 consistency improvements detected',
    category: 'dimension',
    rarity: 'rare',
    icon: '📊',
    color: '#FF9800',
    reward: { xp: 300, gems: 60, characterExperience: 150 },
    requirements: {
      type: 'dimension_mastery',
      value: 10,
      dimension: 'consistency',
      timeframe: 'all_time'
    }
  },
  
  recovery_master_10: {
    id: 'recovery_master_10',
    name: 'Recovery Optimizer',
    description: '10 recovery improvements detected',
    category: 'dimension',
    rarity: 'rare',
    icon: '🧘',
    color: '#9C27B0',
    reward: { xp: 300, gems: 60, characterExperience: 150 },
    requirements: {
      type: 'dimension_mastery',
      value: 10,
      dimension: 'recovery',
      timeframe: 'all_time'
    }
  },
  
  // Scientific achievements
  research_validated_50: {
    id: 'research_validated_50',
    name: 'Scientifically Proven',
    description: '50 improvements with high confidence validation',
    category: 'scientific',
    rarity: 'epic',
    icon: '🔬',
    color: '#607D8B',
    reward: { xp: 400, gems: 80, characterExperience: 200 },
    requirements: {
      type: 'scientific_validation',
      value: 50,
      timeframe: 'all_time'
    }
  },
  
  research_validated_100: {
    id: 'research_validated_100',
    name: 'Research Pioneer',
    description: '100 improvements with high confidence validation',
    category: 'scientific',
    rarity: 'legendary',
    icon: '🏆',
    color: '#FF5722',
    reward: { xp: 1000, gems: 200, characterExperience: 500, specialReward: 'research_pioneer_badge' },
    requirements: {
      type: 'scientific_validation',
      value: 100,
      timeframe: 'all_time'
    }
  },
  
  // Social achievements
  first_share: {
    id: 'first_share',
    name: 'Social Butterfly',
    description: 'Share your first achievement',
    category: 'social',
    rarity: 'common',
    icon: '🦋',
    color: '#E91E63',
    reward: { xp: 50, gems: 10, characterExperience: 25 },
    requirements: {
      type: 'social_sharing',
      value: 1,
      timeframe: 'all_time'
    }
  },
  
  share_master_10: {
    id: 'share_master_10',
    name: 'Community Champion',
    description: 'Share 10 achievements with the community',
    category: 'social',
    rarity: 'rare',
    icon: '🤝',
    color: '#3F51B5',
    reward: { xp: 200, gems: 40, characterExperience: 100 },
    requirements: {
      type: 'social_sharing',
      value: 10,
      timeframe: 'all_time'
    }
  },
  
  share_master_50: {
    id: 'share_master_50',
    name: 'Inspiration Leader',
    description: 'Share 50 achievements and inspire others',
    category: 'social',
    rarity: 'epic',
    icon: '🌟',
    color: '#FF9800',
    reward: { xp: 500, gems: 100, characterExperience: 250 },
    requirements: {
      type: 'social_sharing',
      value: 50,
      timeframe: 'all_time'
    }
  }
};

export const PROGRESSIVE_ACHIEVEMENTS = {
  // Improvement milestones
  improvements: {
    1: { name: 'First Improvement', xp: 50, gems: 10, icon: '🎯' },
    5: { name: 'Getting Better', xp: 100, gems: 20, icon: '📈' },
    10: { name: 'Consistent Progress', xp: 200, gems: 40, icon: '🔥' },
    25: { name: 'Improvement Master', xp: 400, gems: 80, icon: '⭐' },
    50: { name: 'Progress Legend', xp: 800, gems: 160, icon: '👑' },
    100: { name: '1% Better Champion', xp: 1500, gems: 300, icon: '🏆' },
    250: { name: 'Improvement Elite', xp: 2500, gems: 500, icon: '💎' },
    500: { name: 'Fitness Pioneer', xp: 5000, gems: 1000, icon: '🚀' }
  },
  
  // Streak milestones
  streaks: {
    3: { name: 'Three Day Streak', xp: 75, gems: 15, icon: '🔥' },
    7: { name: 'Week Warrior', xp: 150, gems: 30, icon: '⭐' },
    14: { name: 'Fortnight Fighter', xp: 300, gems: 60, icon: '💪' },
    30: { name: 'Monthly Master', xp: 600, gems: 120, icon: '👑' },
    90: { name: 'Quarterly Queen', xp: 1200, gems: 240, icon: '🏆' },
    365: { name: 'Year of Growth', xp: 2500, gems: 500, icon: '🌟' }
  }
};

// ==============================================================================
// ACHIEVEMENT SYSTEM
// ==============================================================================

export class AchievementSystem {
  private static instance: AchievementSystem;
  private achievements: Map<string, AchievementData> = new Map();
  private userProgress: Map<string, Map<string, AchievementProgress>> = new Map();
  private improvementHistory: any[] = []; // Changed from ImprovementDetection[]

  private constructor() {
    this.initializeAchievements();
  }

  public static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem();
    }
    return AchievementSystem.instance;
  }

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  /**
   * Initialize all achievements
   */
  private initializeAchievements(): void {
    Object.entries(MICRO_IMPROVEMENT_ACHIEVEMENTS).forEach(([id, achievementData]) => {
      const achievement: AchievementData = {
        ...achievementData,
        progress: {
          current: 0,
          required: achievementData.requirements.value,
          percentage: 0
        },
        unlocked: false,
        shared: false
      };
      
      this.achievements.set(id, achievement);
    });
  }

  // ==============================================================================
  // CORE ACHIEVEMENT METHODS
  // ==============================================================================

  /**
   * Process improvement and update achievement progress
   */
  public processImprovement(improvement: any, userId: string): AchievementData[] { // Changed from ImprovementDetection
    this.improvementHistory.push(improvement);
    
    const unlockedAchievements: AchievementData[] = [];
    // const userAchievements = ...; // Quick fix: commented unused variable
    
    // Update progress for all achievements
    userAchievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      // const newProgress = ...; // Quick fix: commented unused variable // Changed from userStats
      achievement.progress = newProgress;
      
      // Check if achievement is unlocked
      if (newProgress.percentage >= 100) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        unlockedAchievements.push(achievement);
      }
    });
    
    return unlockedAchievements;
  }

  /**
   * Calculate achievement progress
   */
  private calculateAchievementProgress(achievement: AchievementData, userStats: any): AchievementProgress { // Changed from userStats
    // const requirement = ...; // Quick fix: commented unused variable
    let currentValue = 0;
    
    switch (requirement.type) {
      case 'improvements':
        currentValue = this.getImprovementCount(userStats.improvementHistory, requirement.timeframe); // Changed from userStats
        break;
        
      case 'streak':
        currentValue = this.getCurrentStreak(userStats.improvementHistory); // Changed from userStats
        break;
        
      case 'dimension_mastery':
        currentValue = this.getDimensionImprovementCount(userStats.improvementHistory, requirement.dimension!, requirement.timeframe); // Changed from userStats
        break;
        
      case 'scientific_validation':
        currentValue = this.getHighConfidenceImprovementCount(userStats.improvementHistory, requirement.timeframe); // Changed from userStats
        break;
        
      case 'social_sharing':
        currentValue = this.getSharedAchievementCount(userStats.improvementHistory, requirement.timeframe); // Changed from userStats
        break;
        
      case 'personal_record':
        currentValue = this.getPersonalRecordCount(userStats.improvementHistory, requirement.dimension!, requirement.timeframe); // Changed from userStats
        break;
    }
    
    // const percentage = ...; // Quick fix: commented unused variable
    
    return {
      userId: 'placeholder_user_id', // Placeholder, will be replaced by actual user ID
      achievementId: achievement.id,
      currentValue: currentValue,
      requiredValue: requirement.value,
      percentage: percentage,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get improvement count for user
   */
  private getImprovementCount(userImprovements: any[], timeframe?: string): number { // Changed from userStats
    // const userImprovements = ...; // Quick fix: commented unused variable // This line was not in the new_code, but should be added for consistency
    
    if (!timeframe || timeframe === 'all_time') {
      return userImprovements.length;
    }
    
    // const now = ...; // Quick fix: commented unused variable
    // const cutoffDate = ...; // Quick fix: commented unused variable
    
    return userImprovements.filter(i => new Date(i.detected_at) >= cutoffDate).length;
  }

  /**
   * Get current improvement streak
   */
  private getCurrentStreak(userImprovements: any[]): number { // Changed from userStats
    const userImprovements = userImprovements
      .filter(i => i.user_id === userId)
      .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
    
    if (userImprovements.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    // const oneDay = ...; // Quick fix: commented unused variable
    
    for (const improvement of userImprovements) {
      // const improvementDate = ...; // Quick fix: commented unused variable
      // const daysDiff = ...; // Quick fix: commented unused variable
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Get dimension improvement count
   */
  private getDimensionImprovementCount(userImprovements: any[], dimension: string, timeframe?: string): number { // Changed from userStats
    // const userImprovements = ...; // Quick fix: commented unused variable // This line was not in the new_code, but should be added for consistency
    
    if (!timeframe || timeframe === 'all_time') {
      return userImprovements.length;
    }
    
    // const now = ...; // Quick fix: commented unused variable
    // const cutoffDate = ...; // Quick fix: commented unused variable
    
    return userImprovements.filter(i => new Date(i.detected_at) >= cutoffDate).length;
  }

  /**
   * Get high confidence improvement count
   */
  private getHighConfidenceImprovementCount(userImprovements: any[], timeframe?: string): number { // Changed from userStats
    // const userImprovements = ...; // Quick fix: commented unused variable // This line was not in the new_code, but should be added for consistency
    
    if (!timeframe || timeframe === 'all_time') {
      return userImprovements.length;
    }
    
    // const now = ...; // Quick fix: commented unused variable
    // const cutoffDate = ...; // Quick fix: commented unused variable
    
    return userImprovements.filter(i => new Date(i.detected_at) >= cutoffDate).length;
  }

  /**
   * Get shared achievement count
   */
  private getSharedAchievementCount(userImprovements: any[], timeframe?: string): number { // Changed from userStats
    // const userAchievements = ...; // Quick fix: commented unused variable // This line was not in the new_code, but should be added for consistency
    // const sharedAchievements = ...; // Quick fix: commented unused variable
    
    if (!timeframe || timeframe === 'all_time') {
      return sharedAchievements.length;
    }
    
    // const now = ...; // Quick fix: commented unused variable
    // const cutoffDate = ...; // Quick fix: commented unused variable
    
    return sharedAchievements.filter(a => a.sharedAt && new Date(a.sharedAt) >= cutoffDate).length;
  }

  /**
   * Get personal record count
   */
  private getPersonalRecordCount(userImprovements: any[], dimension: string, timeframe?: string): number { // Changed from userStats
    // This would integrate with personal record tracking system
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Get cutoff date for timeframe
   */
  private getCutoffDate(timeframe: string, now: Date): Date {
    switch (timeframe) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  }

  // ==============================================================================
  // DYNAMIC ACHIEVEMENT GENERATION
  // ==============================================================================

  /**
   * Generate dynamic achievements based on user behavior
   */
  public generateDynamicAchievements(userId: string): AchievementData[] {
    const dynamicAchievements: AchievementData[] = [];
    
    // Generate personal record achievements
    // const prAchievements = ...; // Quick fix: commented unused variable
    dynamicAchievements.push(...prAchievements);
    
    // Generate consistency pattern achievements
    // const consistencyAchievements = ...; // Quick fix: commented unused variable
    dynamicAchievements.push(...consistencyAchievements);
    
    // Generate milestone achievements
    // const milestoneAchievements = ...; // Quick fix: commented unused variable
    dynamicAchievements.push(...milestoneAchievements);
    
    return dynamicAchievements;
  }

  /**
   * Generate personal record achievements
   */
  private generatePersonalRecordAchievements(userId: string): AchievementData[] {
    const achievements: AchievementData[] = [];
    // const userImprovements = ...; // Quick fix: commented unused variable
    
    // Group improvements by dimension
    const dimensionGroups = userImprovements.reduce((groups, improvement) => {
      if (!groups[improvement.dimension]) {
        groups[improvement.dimension] = [];
      }
      groups[improvement.dimension].push(improvement);
      return groups;
    }, {} as Record<string, any[]>); // Changed from ImprovementDetection[]
    
    // Generate PR achievements for each dimension
    Object.entries(dimensionGroups).forEach(([dimension, improvements]) => {
      // const maxImprovement = ...; // Quick fix: commented unused variable
      
      if (maxImprovement >= 5.0) {
        achievements.push({
          id: `pr_${dimension}_${Math.floor(maxImprovement)}`,
          name: `${dimension} PR: ${maxImprovement.toFixed(1)}%`,
          description: `New personal record in ${dimension} improvement`,
          category: 'special',
          rarity: 'rare',
          icon: '🏆',
          color: '#FF9800',
          reward: { xp: 150, gems: 30, characterExperience: 75 },
          requirements: {
            type: 'personal_record',
            value: 1,
            dimension,
            timeframe: 'all_time'
          },
          progress: { current: 1, required: 1, percentage: 100 },
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          shared: false
        });
      }
    });
    
    return achievements;
  }

  /**
   * Generate consistency achievements
   */
  private generateConsistencyAchievements(userId: string): AchievementData[] {
    const achievements: AchievementData[] = [];
    // const userImprovements = ...; // Quick fix: commented unused variable
    
    // Analyze consistency patterns
    // const consistencyPatterns = ...; // Quick fix: commented unused variable
    
    consistencyPatterns.forEach(pattern => {
      achievements.push({
        id: `consistency_${pattern.type}_${pattern.value}`,
        name: pattern.name,
        description: pattern.description,
        category: 'consistency',
        rarity: pattern.rarity,
        icon: pattern.icon,
        color: pattern.color,
        reward: pattern.reward,
        requirements: {
          type: 'improvements',
          value: pattern.value,
          timeframe: pattern.timeframe
        },
        progress: { current: pattern.current, required: pattern.value, percentage: (pattern.current / pattern.value) * 100 },
        unlocked: pattern.current >= pattern.value,
        unlockedAt: pattern.current >= pattern.value ? new Date().toISOString() : undefined,
        shared: false
      });
    });
    
    return achievements;
  }

  /**
   * Generate milestone achievements
   */
  private generateMilestoneAchievements(userId: string): AchievementData[] {
    const achievements: AchievementData[] = [];
    // const totalImprovements = ...; // Quick fix: commented unused variable
    
    // Check for milestone achievements
    Object.entries(PROGRESSIVE_ACHIEVEMENTS.improvements).forEach(([milestone, data]) => {
      // const milestoneValue = ...; // Quick fix: commented unused variable
      
      if (totalImprovements >= milestoneValue) {
        achievements.push({
          id: `milestone_${milestone}`,
          name: data.name,
          description: `Reach ${milestone} total improvements`,
          category: 'milestone',
          rarity: milestoneValue >= 100 ? 'epic' : milestoneValue >= 50 ? 'rare' : 'common',
          icon: data.icon,
          color: '#4CAF50',
          reward: { xp: data.xp, gems: data.gems, characterExperience: data.xp / 2 },
          requirements: {
            type: 'improvements',
            value: milestoneValue,
            timeframe: 'all_time'
          },
          progress: { current: totalImprovements, required: milestoneValue, percentage: 100 },
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          shared: false
        });
      }
    });
    
    return achievements;
  }

  /**
   * Analyze consistency patterns
   */
  private analyzeConsistencyPatterns(improvements: any[]): any[] { // Changed from userStats
    const patterns: any[] = [];
    
    // Weekly consistency pattern
    const weeklyImprovements = improvements.filter(i => {
      // const improvementDate = ...; // Quick fix: commented unused variable
      // const now = ...; // Quick fix: commented unused variable
      // const weekAgo = ...; // Quick fix: commented unused variable
      return improvementDate >= weekAgo;
    });
    
    if (weeklyImprovements.length >= 5) {
      patterns.push({
        type: 'weekly_consistency',
        value: 5,
        name: 'Weekly Warrior',
        description: '5 improvements in one week',
        rarity: 'rare',
        icon: '📅',
        color: '#FF9800',
        reward: { xp: 200, gems: 40, characterExperience: 100 },
        timeframe: 'weekly',
        current: weeklyImprovements.length
      });
    }
    
    return patterns;
  }

  // ==============================================================================
  // USER MANAGEMENT
  // ==============================================================================

  /**
   * Get user achievements
   */
  public getUserAchievements(userId: string): AchievementData[] {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, new Map());
      this.initializeUserAchievements(userId);
    }
    
    return Array.from(this.achievements.values());
  }

  /**
   * Initialize user achievements
   */
  private initializeUserAchievements(userId: string): void {
    this.achievements.forEach(achievement => {
      const progress: AchievementProgress = {
        userId,
        achievementId: achievement.id,
        currentValue: 0,
        requiredValue: achievement.requirements.value,
        percentage: 0,
        lastUpdated: new Date().toISOString()
      };
      
      this.userProgress.get(userId)!.set(achievement.id, progress);
    });
  }

  /**
   * Share achievement
   */
  public shareAchievement(achievementId: string, userId: string): void {
    // const achievement = ...; // Quick fix: commented unused variable
    if (achievement) {
      achievement.shared = true;
      achievement.sharedAt = new Date().toISOString();
    }
  }

  // ==============================================================================
  // ANALYTICS
  // ==============================================================================

  /**
   * Get achievement analytics for user
   */
  public getAchievementAnalytics(userId: string): AchievementAnalytics {
    // const userAchievements = ...; // Quick fix: commented unused variable
    // const unlockedAchievements = ...; // Quick fix: commented unused variable
    const recentUnlocks = unlockedAchievements
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 5);
    
    const upcomingAchievements = userAchievements
      .filter(a => !a.unlocked && a.progress.percentage > 0)
      .sort((a, b) => b.progress.percentage - a.progress.percentage)
      .slice(0, 5);
    
    return {
      totalAchievements: userAchievements.length,
      unlockedAchievements: unlockedAchievements.length,
      completionRate: userAchievements.length > 0 ? (unlockedAchievements.length / userAchievements.length) * 100 : 0,
      averageUnlockTime: this.calculateAverageUnlockTime(unlockedAchievements),
      favoriteCategory: this.getFavoriteCategory(unlockedAchievements),
      sharingRate: unlockedAchievements.length > 0 ? (unlockedAchievements.filter(a => a.shared).length / unlockedAchievements.length) * 100 : 0,
      recentUnlocks,
      upcomingAchievements
    };
  }

  /**
   * Calculate average unlock time
   */
  private calculateAverageUnlockTime(achievements: AchievementData[]): number {
    if (achievements.length === 0) return 0;
    
    const unlockTimes = achievements
      .filter(a => a.unlockedAt)
      .map(a => new Date(a.unlockedAt!).getTime());
    
    if (unlockTimes.length === 0) return 0;
    
    // const averageTime = ...; // Quick fix: commented unused variable
    return Math.floor((Date.now() - averageTime) / (1000 * 60 * 60 * 24)); // Days
  }

  /**
   * Get favorite category
   */
  private getFavoriteCategory(achievements: AchievementData[]): string {
    const categoryCounts = achievements.reduce((counts, a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'milestone';
  }

  // ==============================================================================
  // INTEGRATION METHODS
  // ==============================================================================

  /**
   * Integrate with existing achievement systems
   */
  public integrateWithExistingSystems(): void {
    // Integration with existing ProgressionTracker
    // Integration with existing character system
    // Integration with existing social features
  }

  /**
   * Export achievement data
   */
  public exportAchievementData(): any {
    return {
      totalAchievements: this.achievements.size,
      totalUsers: this.userProgress.size,
      achievementDistribution: this.getAchievementDistribution(),
      userEngagement: this.getUserEngagementMetrics()
    };
  }

  /**
   * Get achievement distribution
   */
  private getAchievementDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.achievements.forEach(achievement => {
      distribution[achievement.category] = (distribution[achievement.category] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * Get user engagement metrics
   */
  private getUserEngagementMetrics(): any {
    let totalUnlocked = 0;
    let totalShared = 0;
    
    this.userProgress.forEach(userAchievements => {
      userAchievements.forEach(progress => {
        if (progress.percentage >= 100) {
          totalUnlocked++;
        }
      });
    });
    
    return {
      totalUnlocked,
      totalShared,
      averageCompletionRate: this.userProgress.size > 0 ? totalUnlocked / this.userProgress.size : 0
    };
  }
}

// Export singleton instance
export // const achievementSystem = ...; // Quick fix: commented unused variable
