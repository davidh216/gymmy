// src/context/systems/ProgressionTracker.ts
// Comprehensive progression tracking and achievement system

import {
  GymmyCharacter,
  EvolutionMaterials
} from '../types/MultiGymmyTypes';

import {
  ExperienceGain,
  LevelUpResult,
  EvolutionResult,
  CharacterGrowthSystem
} from './CharacterGrowthSystem';

// ==============================================================================
// PROGRESSION TRACKING INTERFACES
// ==============================================================================

export interface ProgressionSession {
  id: string;
  timestamp: string;
  duration: number;
  activity_type: string;
  characters_involved: string[];
  experience_gains: ExperienceGain[];
  level_ups: LevelUpResult[];
  evolutions: EvolutionResult[];
  achievements_unlocked: Achievement[];
  session_rating: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'experience' | 'evolution' | 'collection' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  unlock_date: string;
  rewards?: EvolutionMaterials;
  progress_tracking?: {
    current: number;
    required: number;
    description: string;
  };
}

export interface ProgressionStats {
  // Overall Progression
  total_experience_gained: number;
  total_levels_gained: number;
  total_evolutions_completed: number;
  active_days: number;
  
  // Character Statistics
  characters_owned: number;
  max_character_level: number;
  average_character_level: number;
  fully_evolved_characters: number;
  
  // Activity Tracking
  workout_sessions_completed: number;
  total_workout_duration: number;
  favorite_activity: string;
  consistency_streak: number;
  longest_streak: number;
  
  // Achievement Progress
  achievements_unlocked: number;
  achievement_score: number;
  completion_percentage: number;
  
  // Growth Rates
  daily_experience_average: number;
  weekly_level_ups: number;
  monthly_evolutions: number;
}

export interface ProgressionMilestone {
  id: string;
  name: string;
  description: string;
  category: string;
  requirement_type: 'cumulative' | 'streak' | 'single_session' | 'collection';
  requirement_value: number;
  current_progress: number;
  is_completed: boolean;
  completion_date?: string;
  reward: EvolutionMaterials;
  next_milestone?: ProgressionMilestone;
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  summary: {
    sessions_completed: number;
    total_experience: number;
    levels_gained: number;
    evolutions_completed: number;
    new_achievements: number;
  };
  character_highlights: CharacterHighlight[];
  recommendations: ProgressionRecommendation[];
  next_week_goals: Goal[];
}

export interface CharacterHighlight {
  character_id: string;
  character_name: string;
  highlight_type: 'level_up' | 'evolution' | 'milestone' | 'achievement';
  description: string;
  impact_rating: number;
}

export interface ProgressionRecommendation {
  type: 'character_focus' | 'activity_suggestion' | 'evolution_opportunity' | 'achievement_target';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expected_benefit: string;
  time_investment: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  target_date: string;
  progress_tracking: {
    current: number;
    target: number;
    unit: string;
  };
  associated_characters?: string[];
  reward?: EvolutionMaterials;
}

// ==============================================================================
// PROGRESSION TRACKER SYSTEM
// ==============================================================================

export class ProgressionTracker {
  private static instance: ProgressionTracker;
  
  private sessions: ProgressionSession[] = [];
  private achievements: Achievement[] = [];
  private milestones: ProgressionMilestone[] = [];
  private goals: Goal[] = [];
  private characterStats: Map<string, any> = new Map();

  constructor() {
    this.initializeAchievements();
    this.initializeMilestones();
  }

  public static getInstance(): ProgressionTracker {
    if (!ProgressionTracker.instance) {
      ProgressionTracker.instance = new ProgressionTracker();
    }
    return ProgressionTracker.instance;
  }

  // ==============================================================================
  // SESSION TRACKING
  // ==============================================================================

  public startSession(activityType: string, charactersInvolved: string[]): string {
    const sessionId = this.generateSessionId();
    const session: ProgressionSession = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      duration: 0,
      activity_type: activityType,
      characters_involved: charactersInvolved,
      experience_gains: [],
      level_ups: [],
      evolutions: [],
      achievements_unlocked: [],
      session_rating: 0
    };
    
    this.sessions.push(session);
    return sessionId;
  }

  public endSession(
    sessionId: string,
    experienceGains: ExperienceGain[],
    levelUps: LevelUpResult[],
    evolutions: EvolutionResult[],
    duration: number,
    sessionRating: number = 0
  ): ProgressionSession {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    session.duration = duration;
    session.experience_gains = experienceGains;
    session.level_ups = levelUps;
    session.evolutions = evolutions;
    session.session_rating = sessionRating;

    // Check for achievements
    session.achievements_unlocked = this.checkAchievements(session);
    this.achievements.push(...session.achievements_unlocked);

    // Update character stats
    this.updateCharacterStats(session);

    // Update milestones
    this.updateMilestones(session);

    return session;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==============================================================================
  // ACHIEVEMENT SYSTEM
  // ==============================================================================

  private checkAchievements(session: ProgressionSession): Achievement[] {
    const newAchievements: Achievement[] = [];
    const allAchievements = this.getAllPossibleAchievements();

    allAchievements.forEach(achievement => {
      if (this.isAchievementCompleted(achievement.id)) return;

      if (this.checkAchievementCondition(achievement, session)) {
        achievement.unlock_date = new Date().toISOString();
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  private checkAchievementCondition(achievement: Achievement, session: ProgressionSession): boolean {
    const totalStats = this.calculateTotalStats();

    switch (achievement.id) {
      case 'first_steps':
        return session.experience_gains.length > 0;
      
      case 'level_up_master':
        return session.level_ups.length >= 3;
      
      case 'evolution_pioneer':
        return session.evolutions.length > 0;
      
      case 'experience_hoarder':
        return session.experience_gains.reduce((sum, gain) => sum + gain.total_exp, 0) >= 1000;
      
      case 'dedication_streak':
        return this.calculateCurrentStreak() >= 7;
      
      case 'marathon_trainer':
        return session.duration >= 120; // 2 hours
      
      case 'team_builder':
        return session.characters_involved.length >= 4;
      
      case 'perfectionist':
        return session.session_rating >= 95;
      
      case 'character_collector':
        return totalStats.characters_owned >= 10;
      
      case 'evolution_master':
        return totalStats.total_evolutions_completed >= 25;
      
      default:
        return false;
    }
  }

  private isAchievementCompleted(achievementId: string): boolean {
    return this.achievements.some(a => a.id === achievementId);
  }

  // ==============================================================================
  // MILESTONE TRACKING
  // ==============================================================================

  private updateMilestones(session: ProgressionSession): void {
    this.milestones.forEach(milestone => {
      if (milestone.is_completed) return;

      const progress = this.calculateMilestoneProgress(milestone);
      milestone.current_progress = progress;

      if (progress >= milestone.requirement_value) {
        milestone.is_completed = true;
        milestone.completion_date = new Date().toISOString();

        // Create achievement for milestone completion
        const milestoneAchievement: Achievement = {
          id: `milestone_${milestone.id}`,
          name: `${milestone.name} Completed`,
          description: milestone.description,
          category: 'milestone',
          rarity: 'rare',
          icon: '🏆',
          unlock_date: new Date().toISOString(),
          rewards: milestone.reward
        };

        session.achievements_unlocked.push(milestoneAchievement);
      }
    });
  }

  private calculateMilestoneProgress(milestone: ProgressionMilestone): number {
    const stats = this.calculateTotalStats();

    switch (milestone.id) {
      case 'experience_milestone_1000':
        return stats.total_experience_gained;
      
      case 'level_milestone_100':
        return stats.total_levels_gained;
      
      case 'evolution_milestone_10':
        return stats.total_evolutions_completed;
      
      case 'session_milestone_50':
        return stats.workout_sessions_completed;
      
      case 'streak_milestone_30':
        return stats.longest_streak;
      
      default:
        return 0;
    }
  }

  // ==============================================================================
  // STATISTICS AND ANALYTICS
  // ==============================================================================

  public calculateTotalStats(): ProgressionStats {
    const totalExperience = this.sessions.reduce((sum, session) => 
      sum + session.experience_gains.reduce((expSum, gain) => expSum + gain.total_exp, 0), 0
    );

    const totalLevelUps = this.sessions.reduce((sum, session) => sum + session.level_ups.length, 0);
    const totalEvolutions = this.sessions.reduce((sum, session) => sum + session.evolutions.length, 0);

    const activeDays = new Set(this.sessions.map(s => s.timestamp.split('T')[0])).size;
    const totalSessions = this.sessions.length;
    const totalDuration = this.sessions.reduce((sum, session) => sum + session.duration, 0);

    const characterLevels = Array.from(this.characterStats.values()).map(stats => stats.current_level || 1);
    const maxLevel = characterLevels.length > 0 ? Math.max(...characterLevels) : 1;
    const avgLevel = characterLevels.length > 0 ? characterLevels.reduce((sum, level) => sum + level, 0) / characterLevels.length : 1;

    return {
      total_experience_gained: totalExperience,
      total_levels_gained: totalLevelUps,
      total_evolutions_completed: totalEvolutions,
      active_days: activeDays,
      
      characters_owned: this.characterStats.size,
      max_character_level: maxLevel,
      average_character_level: Math.round(avgLevel),
      fully_evolved_characters: Array.from(this.characterStats.values()).filter(stats => stats.evolution_stage >= 3).length,
      
      workout_sessions_completed: totalSessions,
      total_workout_duration: totalDuration,
      favorite_activity: this.calculateFavoriteActivity(),
      consistency_streak: this.calculateCurrentStreak(),
      longest_streak: this.calculateLongestStreak(),
      
      achievements_unlocked: this.achievements.length,
      achievement_score: this.calculateAchievementScore(),
      completion_percentage: this.calculateCompletionPercentage(),
      
      daily_experience_average: activeDays > 0 ? totalExperience / activeDays : 0,
      weekly_level_ups: this.calculateWeeklyAverage('level_ups'),
      monthly_evolutions: this.calculateMonthlyAverage('evolutions')
    };
  }

  private calculateFavoriteActivity(): string {
    const activityCount: Record<string, number> = {};
    
    this.sessions.forEach(session => {
      activityCount[session.activity_type] = (activityCount[session.activity_type] || 0) + 1;
    });

    return Object.keys(activityCount).reduce((a, b) => 
      activityCount[a] > activityCount[b] ? a : b, 'workout'
    );
  }

  private calculateCurrentStreak(): number {
    if (this.sessions.length === 0) return 0;

    const sortedSessions = [...this.sessions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const uniqueDays = Array.from(new Set(sortedSessions.map(s => s.timestamp.split('T')[0]))).sort().reverse();
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date();

    for (let i = 0; i < uniqueDays.length; i++) {
      const sessionDate = uniqueDays[i];
      const expectedDate = checkDate.toISOString().split('T')[0];
      
      if (sessionDate === expectedDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (sessionDate === today) {
        // Today's session counts
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(): number {
    if (this.sessions.length === 0) return 0;

    const uniqueDays = Array.from(new Set(this.sessions.map(s => s.timestamp.split('T')[0]))).sort();
    
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDate = new Date(uniqueDays[i - 1]);
      const currDate = new Date(uniqueDays[i]);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  private calculateAchievementScore(): number {
    const rarityScores = { common: 10, rare: 25, epic: 50, legendary: 100 };
    return this.achievements.reduce((score, achievement) => 
      score + rarityScores[achievement.rarity], 0
    );
  }

  private calculateCompletionPercentage(): number {
    const totalPossibleAchievements = this.getAllPossibleAchievements().length;
    const completedMilestones = this.milestones.filter(m => m.is_completed).length;
    const totalMilestones = this.milestones.length;

    const achievementCompletion = (this.achievements.length / totalPossibleAchievements) * 60; // 60% weight
    const milestoneCompletion = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 40 : 0; // 40% weight

    return Math.min(100, achievementCompletion + milestoneCompletion);
  }

  private calculateWeeklyAverage(metric: 'level_ups' | 'evolutions'): number {
    const weeksActive = Math.max(1, this.calculateTotalStats().active_days / 7);
    const totalCount = metric === 'level_ups' ? 
      this.calculateTotalStats().total_levels_gained : 
      this.calculateTotalStats().total_evolutions_completed;
    
    return Math.round(totalCount / weeksActive);
  }

  private calculateMonthlyAverage(metric: 'level_ups' | 'evolutions'): number {
    const monthsActive = Math.max(1, this.calculateTotalStats().active_days / 30);
    const totalCount = metric === 'level_ups' ? 
      this.calculateTotalStats().total_levels_gained : 
      this.calculateTotalStats().total_evolutions_completed;
    
    return Math.round(totalCount / monthsActive);
  }

  private updateCharacterStats(session: ProgressionSession): void {
    session.characters_involved.forEach(characterId => {
      const stats = this.characterStats.get(characterId) || {
        sessions_participated: 0,
        total_experience: 0,
        level_ups: 0,
        evolutions: 0,
        current_level: 1,
        evolution_stage: 0
      };

      stats.sessions_participated++;
      
      // Update from session data
      session.experience_gains
        .filter(gain => gain.source.type === 'workout')
        .forEach(gain => stats.total_experience += gain.total_exp);
      
      session.level_ups
        .filter(levelUp => levelUp.character_id === characterId)
        .forEach(levelUp => {
          stats.level_ups++;
          stats.current_level = levelUp.new_level;
        });

      session.evolutions
        .filter(evolution => evolution.character_id === characterId)
        .forEach(evolution => {
          stats.evolutions++;
          stats.evolution_stage = evolution.new_stage;
        });

      this.characterStats.set(characterId, stats);
    });
  }

  // ==============================================================================
  // WEEKLY REPORTING
  // ==============================================================================

  public generateWeeklyReport(): WeeklyReport {
    const weekEnd = new Date();
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklySessions = this.sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const summary = {
      sessions_completed: weeklySessions.length,
      total_experience: weeklySessions.reduce((sum, session) => 
        sum + session.experience_gains.reduce((expSum, gain) => expSum + gain.total_exp, 0), 0
      ),
      levels_gained: weeklySessions.reduce((sum, session) => sum + session.level_ups.length, 0),
      evolutions_completed: weeklySessions.reduce((sum, session) => sum + session.evolutions.length, 0),
      new_achievements: weeklySessions.reduce((sum, session) => sum + session.achievements_unlocked.length, 0)
    };

    const highlights = this.generateCharacterHighlights(weeklySessions);
    const recommendations = this.generateRecommendations();
    const goals = this.generateNextWeekGoals();

    return {
      week_start: weekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0],
      summary,
      character_highlights: highlights,
      recommendations,
      next_week_goals: goals
    };
  }

  private generateCharacterHighlights(sessions: ProgressionSession[]): CharacterHighlight[] {
    const highlights: CharacterHighlight[] = [];
    
    // Find characters with significant progress
    const characterProgress: Record<string, any> = {};
    
    sessions.forEach(session => {
      session.level_ups.forEach(levelUp => {
        if (!characterProgress[levelUp.character_id]) {
          characterProgress[levelUp.character_id] = { level_ups: 0, evolutions: 0 };
        }
        characterProgress[levelUp.character_id].level_ups += levelUp.new_level - levelUp.old_level;
      });

      session.evolutions.forEach(evolution => {
        if (!characterProgress[evolution.character_id]) {
          characterProgress[evolution.character_id] = { level_ups: 0, evolutions: 0 };
        }
        characterProgress[evolution.character_id].evolutions++;
      });
    });

    // Generate highlights for top performers
    Object.keys(characterProgress)
      .sort((a, b) => {
        const aScore = characterProgress[a].level_ups + characterProgress[a].evolutions * 5;
        const bScore = characterProgress[b].level_ups + characterProgress[b].evolutions * 5;
        return bScore - aScore;
      })
      .slice(0, 3)
      .forEach(characterId => {
        const progress = characterProgress[characterId];
        const character = this.characterStats.get(characterId);
        
        if (progress.evolutions > 0) {
          highlights.push({
            character_id: characterId,
            character_name: `Character ${characterId}`,
            highlight_type: 'evolution',
            description: `Completed ${progress.evolutions} evolution(s) this week!`,
            impact_rating: 95
          });
        } else if (progress.level_ups >= 5) {
          highlights.push({
            character_id: characterId,
            character_name: `Character ${characterId}`,
            highlight_type: 'level_up',
            description: `Gained ${progress.level_ups} levels this week`,
            impact_rating: 75
          });
        }
      });

    return highlights;
  }

  private generateRecommendations(): ProgressionRecommendation[] {
    const recommendations: ProgressionRecommendation[] = [];
    const stats = this.calculateTotalStats();

    // Low activity recommendation
    if (stats.workout_sessions_completed < 3) {
      recommendations.push({
        type: 'activity_suggestion',
        priority: 'high',
        title: 'Increase Training Frequency',
        description: 'Try to complete at least 3-4 training sessions per week for optimal character growth.',
        expected_benefit: 'Faster character progression and better consistency',
        time_investment: '30-45 minutes per session'
      });
    }

    // Evolution opportunity
    const evolutionOpportunities = Array.from(this.characterStats.entries())
      .filter(([_, stats]) => stats.current_level >= 20 && stats.evolution_stage < 3)
      .length;

    if (evolutionOpportunities > 0) {
      recommendations.push({
        type: 'evolution_opportunity',
        priority: 'medium',
        title: 'Evolution Opportunities Available',
        description: `You have ${evolutionOpportunities} character(s) ready for evolution.`,
        expected_benefit: 'Significant stat boosts and new abilities',
        time_investment: 'Collect required materials'
      });
    }

    // Achievement targeting
    const unlockedAchievements = this.getAllPossibleAchievements().length - this.achievements.length;
    if (unlockedAchievements > 0) {
      recommendations.push({
        type: 'achievement_target',
        priority: 'low',
        title: 'Achievement Progress',
        description: `${unlockedAchievements} achievements remaining to unlock.`,
        expected_benefit: 'Bonus rewards and progression tracking',
        time_investment: 'Varies by achievement'
      });
    }

    return recommendations;
  }

  private generateNextWeekGoals(): Goal[] {
    const stats = this.calculateTotalStats();
    const goals: Goal[] = [];

    // Experience goal
    goals.push({
      id: 'weekly_experience',
      name: 'Experience Target',
      description: 'Gain experience through consistent training',
      target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress_tracking: {
        current: 0,
        target: Math.max(2000, stats.daily_experience_average * 7),
        unit: 'EXP'
      }
    });

    // Session goal
    goals.push({
      id: 'weekly_sessions',
      name: 'Training Sessions',
      description: 'Complete regular training sessions',
      target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress_tracking: {
        current: 0,
        target: Math.max(4, Math.round(stats.workout_sessions_completed / Math.max(1, stats.active_days) * 7)),
        unit: 'sessions'
      }
    });

    return goals;
  }

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  private initializeAchievements(): void {
    // Achievements will be checked dynamically, this is just for reference
  }

  private initializeMilestones(): void {
    this.milestones = [
      {
        id: 'experience_milestone_1000',
        name: 'Experience Seeker',
        description: 'Gain 1,000 total experience points',
        category: 'experience',
        requirement_type: 'cumulative',
        requirement_value: 1000,
        current_progress: 0,
        is_completed: false,
        reward: { basic_crystals: 20, training_essence: 10, bond_token: 5 }
      },
      {
        id: 'level_milestone_100',
        name: 'Level Master',
        description: 'Achieve 100 total level ups',
        category: 'progression',
        requirement_type: 'cumulative',
        requirement_value: 100,
        current_progress: 0,
        is_completed: false,
        reward: { rare_crystals: 15, power_essence: 8, bond_token: 10 }
      },
      {
        id: 'evolution_milestone_10',
        name: 'Evolution Expert',
        description: 'Complete 10 character evolutions',
        category: 'evolution',
        requirement_type: 'cumulative',
        requirement_value: 10,
        current_progress: 0,
        is_completed: false,
        reward: { epic_crystals: 5, legendary_crystals: 2, transcendence_core: 1 }
      }
    ];
  }

  private getAllPossibleAchievements(): Achievement[] {
    return [
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first training session',
        category: 'milestone',
        rarity: 'common',
        icon: '👶',
        unlock_date: '',
        rewards: { basic_crystals: 5, bond_token: 1 }
      },
      {
        id: 'level_up_master',
        name: 'Level Up Master',
        description: 'Level up 3 characters in a single session',
        category: 'experience',
        rarity: 'rare',
        icon: '📈',
        unlock_date: '',
        rewards: { training_essence: 10, bond_token: 3 }
      },
      {
        id: 'evolution_pioneer',
        name: 'Evolution Pioneer',
        description: 'Complete your first character evolution',
        category: 'evolution',
        rarity: 'epic',
        icon: '🦋',
        unlock_date: '',
        rewards: { rare_crystals: 5, power_essence: 3 }
      },
      {
        id: 'experience_hoarder',
        name: 'Experience Hoarder',
        description: 'Gain 1,000+ experience in a single session',
        category: 'experience',
        rarity: 'rare',
        icon: '💰',
        unlock_date: '',
        rewards: { basic_crystals: 25, training_essence: 15 }
      },
      {
        id: 'dedication_streak',
        name: 'Dedication Streak',
        description: 'Train for 7 consecutive days',
        category: 'special',
        rarity: 'epic',
        icon: '🔥',
        unlock_date: '',
        rewards: { rare_crystals: 8, bond_token: 5 }
      },
      {
        id: 'marathon_trainer',
        name: 'Marathon Trainer',
        description: 'Complete a 2+ hour training session',
        category: 'special',
        rarity: 'rare',
        icon: '⏱️',
        unlock_date: '',
        rewards: { power_essence: 5, bond_token: 3 }
      },
      {
        id: 'team_builder',
        name: 'Team Builder',
        description: 'Train with 4+ characters simultaneously',
        category: 'collection',
        rarity: 'rare',
        icon: '👥',
        unlock_date: '',
        rewards: { training_essence: 12, bond_token: 4 }
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve a 95+ session rating',
        category: 'special',
        rarity: 'legendary',
        icon: '⭐',
        unlock_date: '',
        rewards: { epic_crystals: 3, legendary_crystals: 1 }
      },
      {
        id: 'character_collector',
        name: 'Character Collector',
        description: 'Own 10 or more characters',
        category: 'collection',
        rarity: 'epic',
        icon: '📚',
        unlock_date: '',
        rewards: { rare_crystals: 10, epic_crystals: 2 }
      },
      {
        id: 'evolution_master',
        name: 'Evolution Master',
        description: 'Complete 25 character evolutions',
        category: 'evolution',
        rarity: 'legendary',
        icon: '👑',
        unlock_date: '',
        rewards: { legendary_crystals: 5, transcendence_core: 2, divine_essence: 1 }
      }
    ];
  }

  // ==============================================================================
  // DATA MANAGEMENT
  // ==============================================================================

  public exportProgressionData(): any {
    return {
      sessions: this.sessions,
      achievements: this.achievements,
      milestones: this.milestones,
      goals: this.goals,
      characterStats: Array.from(this.characterStats.entries())
    };
  }

  public importProgressionData(data: any): void {
    if (data.sessions) this.sessions = data.sessions;
    if (data.achievements) this.achievements = data.achievements;
    if (data.milestones) this.milestones = data.milestones;
    if (data.goals) this.goals = data.goals;
    if (data.characterStats) this.characterStats = new Map(data.characterStats);
  }

  public clearProgressionData(): void {
    this.sessions = [];
    this.achievements = [];
    this.milestones = [];
    this.goals = [];
    this.characterStats.clear();
    
    // Reinitialize
    this.initializeMilestones();
  }
}

// ==============================================================================
// EXPORT SINGLETON INSTANCE
// ==============================================================================

export const progressionTracker = ProgressionTracker.getInstance();
export default progressionTracker;