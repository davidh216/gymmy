// src/context/systems/PullAnalytics.ts
// Advanced pull analytics and user engagement tracking system

import {
  GymmyRarity,
  GymmyCharacter,
  EvolutionMaterials,
} from '../types/MultiGymmyTypes';

import {
  PullResult,
  PullHistory,
  GachaAnalytics,
  BannerAnalytics,
} from '../systems/AdvancedGachaSystem';

// ==============================================================================
// ANALYTICS INTERFACES
// ==============================================================================

export interface DetailedPullAnalytics {
  // Basic Statistics
  basic_stats: BasicPullStats;
  
  // Time-based Analysis
  temporal_analysis: TemporalAnalysis;
  
  // Behavioral Patterns
  behavioral_patterns: BehaviorPattern[];
  
  // Predictive Insights
  predictions: PredictiveInsights;
  
  // Recommendation Engine
  recommendations: UserRecommendation[];
  
  // Performance Metrics
  performance_metrics: PerformanceMetrics;
}

export interface BasicPullStats {
  total_pulls: number;
  total_gems_spent: number;
  average_gems_per_pull: number;
  
  // Rarity Distribution
  rarity_breakdown: Record<GymmyRarity, {
    count: number;
    percentage: number;
    gems_spent: number;
    average_gems_per_character: number;
  }>;
  
  // Efficiency Metrics
  gems_per_legendary: number;
  pulls_per_legendary: number;
  efficiency_rating: 'S' | 'A' | 'B' | 'C' | 'D';
  
  // Luck Factor
  luck_score: number; // -100 (very unlucky) to +100 (very lucky)
  luck_rating: 'Blessed' | 'Lucky' | 'Average' | 'Unlucky' | 'Cursed';
}

export interface TemporalAnalysis {
  // Activity Patterns
  most_active_hour: number;
  most_active_day: string;
  pull_frequency: 'Heavy' | 'Regular' | 'Casual' | 'Sporadic';
  
  // Session Analysis
  average_session_duration: number;
  average_pulls_per_session: number;
  longest_session: {
    duration: number;
    pulls: number;
    date: string;
  };
  
  // Streaks and Patterns
  longest_dry_streak: number;
  current_dry_streak: number;
  hot_streaks: number;
  
  // Monthly Breakdown
  monthly_activity: MonthlyActivity[];
}

export interface MonthlyActivity {
  month: string;
  pulls: number;
  gems_spent: number;
  characters_obtained: Record<GymmyRarity, number>;
  efficiency_score: number;
}

export interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  evidence: string[];
  implications: string[];
}

export interface PredictiveInsights {
  // Next Pull Predictions
  next_legendary_prediction: {
    estimated_pulls: number;
    confidence: number;
    factors: string[];
  };
  
  // Spending Predictions
  monthly_spending_prediction: {
    estimated_gems: number;
    estimated_cost: number;
    confidence: number;
  };
  
  // Behavior Predictions
  retention_prediction: {
    likelihood_to_continue: number;
    risk_factors: string[];
    positive_indicators: string[];
  };
}

export interface UserRecommendation {
  type: 'banner' | 'timing' | 'strategy' | 'budget';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  potential_benefit: string;
}

export interface PerformanceMetrics {
  // Comparison to Average
  vs_average: {
    pulls_efficiency: number; // % above/below average
    luck_factor: number;
    spending_efficiency: number;
  };
  
  // Personal Bests
  best_session: {
    date: string;
    pulls: number;
    legendaries_obtained: number;
  };
  
  best_streak: {
    start_date: string;
    duration: number;
    characters_obtained: number;
  };
  
  // Achievements
  milestones_reached: Milestone[];
  upcoming_milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requirement: number;
  current_progress: number;
  reward?: EvolutionMaterials;
  estimated_completion?: string;
}

// ==============================================================================
// PULL ANALYTICS ENGINE
// ==============================================================================

export class PullAnalyticsEngine {
  private static instance: PullAnalyticsEngine;
  
  private pullHistory: PullResult[] = [];
  private userPatterns: Map<string, any> = new Map();
  private benchmarkData: any = null;

  constructor() {
    this.initializeBenchmarkData();
  }

  public static getInstance(): PullAnalyticsEngine {
    if (!PullAnalyticsEngine.instance) {
      PullAnalyticsEngine.instance = new PullAnalyticsEngine();
    }
    return PullAnalyticsEngine.instance;
  }

  // ==============================================================================
  // DATA INGESTION
  // ==============================================================================

  public addPullResult(result: PullResult): void {
    this.pullHistory.push(result);
    this.updateUserPatterns(result);
  }

  public addBulkHistory(results: PullResult[]): void {
    this.pullHistory.push(...results);
    results.forEach(result => this.updateUserPatterns(result));
  }

  private updateUserPatterns(result: PullResult): void {
    const hour = new Date(result.timestamp).getHours();
    const day = new Date(result.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Update hour patterns
    const hourPattern = this.userPatterns.get('hour_activity') || {};
    hourPattern[hour] = (hourPattern[hour] || 0) + result.characters.length;
    this.userPatterns.set('hour_activity', hourPattern);
    
    // Update day patterns
    const dayPattern = this.userPatterns.get('day_activity') || {};
    dayPattern[day] = (dayPattern[day] || 0) + result.characters.length;
    this.userPatterns.set('day_activity', dayPattern);
    
    // Update pull type preferences
    const pullTypePattern = this.userPatterns.get('pull_type_preference') || {};
    pullTypePattern[result.pull_type] = (pullTypePattern[result.pull_type] || 0) + 1;
    this.userPatterns.set('pull_type_preference', pullTypePattern);
  }

  // ==============================================================================
  // ANALYTICS GENERATION
  // ==============================================================================

  public generateDetailedAnalytics(): DetailedPullAnalytics {
    return {
      basic_stats: this.calculateBasicStats(),
      temporal_analysis: this.performTemporalAnalysis(),
      behavioral_patterns: this.identifyBehaviorPatterns(),
      predictions: this.generatePredictions(),
      recommendations: this.generateRecommendations(),
      performance_metrics: this.calculatePerformanceMetrics(),
    };
  }

  private calculateBasicStats(): BasicPullStats {
    const totalPulls = this.pullHistory.reduce((sum, r) => sum + r.characters.length, 0);
    const totalGems = this.pullHistory.reduce((sum, r) => sum + r.gems_spent, 0);
    
    // Calculate rarity breakdown
    const rarityCount: Record<GymmyRarity, number> = {
      common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0,
    };
    
    const rarityGems: Record<GymmyRarity, number> = {
      common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0,
    };

    this.pullHistory.forEach(result => {
      result.characters.forEach(char => {
        rarityCount[char.rarity]++;
        rarityGems[char.rarity] += result.gems_spent / result.characters.length;
      });
    });

    const rarityBreakdown = Object.keys(rarityCount).reduce((acc, rarity) => {
      const r = rarity as GymmyRarity;
      const count = rarityCount[r];
      acc[r] = {
        count,
        percentage: totalPulls > 0 ? (count / totalPulls) * 100 : 0,
        gems_spent: rarityGems[r],
        average_gems_per_character: count > 0 ? rarityGems[r] / count : 0,
      };
      return acc;
    }, {} as any);

    // Calculate luck score
    const expectedRates = { common: 0.60, rare: 0.25, epic: 0.12, legendary: 0.025, mythical: 0.005 };
    const luckScore = this.calculateLuckScore(rarityBreakdown, expectedRates, totalPulls);
    
    // Calculate efficiency
    const legendaryCount = rarityCount.legendary + rarityCount.mythical;
    const gemsPerLegendary = legendaryCount > 0 ? totalGems / legendaryCount : 0;
    const pullsPerLegendary = legendaryCount > 0 ? totalPulls / legendaryCount : 0;
    
    const efficiency = this.calculateEfficiencyRating(gemsPerLegendary);

    return {
      total_pulls: totalPulls,
      total_gems_spent: totalGems,
      average_gems_per_pull: totalPulls > 0 ? totalGems / totalPulls : 0,
      rarity_breakdown: rarityBreakdown,
      gems_per_legendary: gemsPerLegendary,
      pulls_per_legendary: pullsPerLegendary,
      efficiency_rating: efficiency,
      luck_score: luckScore,
      luck_rating: this.getLuckRating(luckScore),
    };
  }

  private calculateLuckScore(
    breakdown: any,
    expected: Record<GymmyRarity, number>,
    totalPulls: number,
  ): number {
    if (totalPulls === 0) return 0;

    let luckScore = 0;
    let weightedSum = 0;
    
    Object.keys(expected).forEach(rarity => {
      const r = rarity as GymmyRarity;
      const actualRate = breakdown[r].percentage / 100;
      const expectedRate = expected[r];
      const weight = this.getRarityWeight(r);
      
      const deviation = (actualRate - expectedRate) / expectedRate;
      luckScore += deviation * weight;
      weightedSum += weight;
    });
    
    // Normalize to -100 to +100 scale
    const normalizedScore = (luckScore / weightedSum) * 100;
    return Math.max(-100, Math.min(100, normalizedScore));
  }

  private getRarityWeight(rarity: GymmyRarity): number {
    const weights = { common: 1, rare: 5, epic: 15, legendary: 50, mythical: 100 };
    return weights[rarity];
  }

  private getLuckRating(score: number): 'Blessed' | 'Lucky' | 'Average' | 'Unlucky' | 'Cursed' {
    if (score >= 50) return 'Blessed';
    if (score >= 15) return 'Lucky';
    if (score >= -15) return 'Average';
    if (score >= -50) return 'Unlucky';
    return 'Cursed';
  }

  private calculateEfficiencyRating(gemsPerLegendary: number): 'S' | 'A' | 'B' | 'C' | 'D' {
    if (gemsPerLegendary === 0) return 'S'; // No spending but got legendary
    if (gemsPerLegendary <= 3000) return 'S'; // Excellent
    if (gemsPerLegendary <= 5000) return 'A'; // Very good
    if (gemsPerLegendary <= 8000) return 'B'; // Good
    if (gemsPerLegendary <= 12000) return 'C'; // Average
    return 'D'; // Below average
  }

  private performTemporalAnalysis(): TemporalAnalysis {
    const hourActivity = this.userPatterns.get('hour_activity') || {};
    const dayActivity = this.userPatterns.get('day_activity') || {};
    
    // Find most active times
    const mostActiveHour = Object.keys(hourActivity).reduce((a, b) => 
      hourActivity[a] > hourActivity[b] ? a : b, '0',
    );
    
    const mostActiveDay = Object.keys(dayActivity).reduce((a, b) => 
      dayActivity[a] > dayActivity[b] ? a : b, 'Monday',
    );

    // Calculate session metrics
    const sessions = this.calculateSessions();
    const avgSessionDuration = sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0;
    
    const avgPullsPerSession = sessions.length > 0 ?
      sessions.reduce((sum, s) => sum + s.pulls, 0) / sessions.length : 0;

    // Find longest session
    const longestSession = sessions.reduce((longest, current) => 
      current.duration > longest.duration ? current : longest, 
    { duration: 0, pulls: 0, date: new Date().toISOString() },
    );

    // Calculate streaks
    const streaks = this.calculateStreaks();

    return {
      most_active_hour: parseInt(mostActiveHour),
      most_active_day: mostActiveDay,
      pull_frequency: this.categorizePullFrequency(),
      average_session_duration: avgSessionDuration,
      average_pulls_per_session: avgPullsPerSession,
      longest_session: longestSession,
      longest_dry_streak: streaks.longestDry,
      current_dry_streak: streaks.currentDry,
      hot_streaks: streaks.hotStreaks,
      monthly_activity: this.calculateMonthlyActivity(),
    };
  }

  private calculateSessions(): {duration: number, pulls: number, date: string}[] {
    const sessions = [];
    let currentSession = null;
    const SESSION_GAP_HOURS = 2; // If gap > 2 hours, it's a new session
    
    this.pullHistory.forEach(result => {
      const resultTime = new Date(result.timestamp);
      
      if (!currentSession || 
          (resultTime.getTime() - new Date(currentSession.lastPull).getTime()) > SESSION_GAP_HOURS * 60 * 60 * 1000) {
        // Start new session
        if (currentSession) sessions.push(currentSession);
        currentSession = {
          duration: 0,
          pulls: result.characters.length,
          date: result.timestamp,
          lastPull: result.timestamp,
        };
      } else {
        // Continue current session
        currentSession.duration = resultTime.getTime() - new Date(currentSession.date).getTime();
        currentSession.pulls += result.characters.length;
        currentSession.lastPull = result.timestamp;
      }
    });
    
    if (currentSession) sessions.push(currentSession);
    return sessions;
  }

  private calculateStreaks(): {longestDry: number, currentDry: number, hotStreaks: number} {
    let longestDry = 0;
    let currentDry = 0;
    let hotStreaks = 0;
    let currentHot = 0;
    
    this.pullHistory.forEach(result => {
      const hasLegendaryOrBetter = result.characters.some(c => 
        c.rarity === 'legendary' || c.rarity === 'mythical',
      );
      
      if (hasLegendaryOrBetter) {
        longestDry = Math.max(longestDry, currentDry);
        currentDry = 0;
        currentHot++;
        if (currentHot >= 3) hotStreaks++; // 3+ legendaries in a row
      } else {
        currentDry += result.characters.length;
        currentHot = 0;
      }
    });
    
    return { longestDry, currentDry, hotStreaks };
  }

  private categorizePullFrequency(): 'Heavy' | 'Regular' | 'Casual' | 'Sporadic' {
    const totalPulls = this.pullHistory.reduce((sum, r) => sum + r.characters.length, 0);
    const daysActive = new Set(this.pullHistory.map(r => r.timestamp.split('T')[0])).size;
    
    if (daysActive === 0) return 'Sporadic';
    
    const pullsPerDay = totalPulls / daysActive;
    
    if (pullsPerDay >= 20) return 'Heavy';
    if (pullsPerDay >= 10) return 'Regular';
    if (pullsPerDay >= 3) return 'Casual';
    return 'Sporadic';
  }

  private calculateMonthlyActivity(): MonthlyActivity[] {
    const monthlyData: Record<string, MonthlyActivity> = {};
    
    this.pullHistory.forEach(result => {
      const month = new Date(result.timestamp).toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          pulls: 0,
          gems_spent: 0,
          characters_obtained: { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 },
          efficiency_score: 0,
        };
      }
      
      monthlyData[month].pulls += result.characters.length;
      monthlyData[month].gems_spent += result.gems_spent;
      
      result.characters.forEach(char => {
        monthlyData[month].characters_obtained[char.rarity]++;
      });
    });
    
    // Calculate efficiency scores
    Object.values(monthlyData).forEach(month => {
      const legendaries = month.characters_obtained.legendary + month.characters_obtained.mythical;
      if (legendaries > 0) {
        month.efficiency_score = (legendaries / month.gems_spent) * 10000; // Normalized score
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  private identifyBehaviorPatterns(): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Pattern: Pull type preference
    const pullTypePrefs = this.userPatterns.get('pull_type_preference') || {};
    const totalSessions = Object.values(pullTypePrefs).reduce((sum: number, count) => sum + (count as number), 0);
    
    if (pullTypePrefs.ten_pull / totalSessions > 0.7) {
      patterns.push({
        id: 'bulk_puller',
        name: 'Bulk Puller',
        description: 'Prefers 10-pulls over single pulls',
        confidence: 85,
        evidence: ['70%+ of pulls are 10-pulls', 'Consistent bulk pulling behavior'],
        implications: ['Values efficiency', 'Plans spending carefully', 'May respond well to bulk discounts'],
      });
    }
    
    // Pattern: Time-based pulling
    const hourActivity = this.userPatterns.get('hour_activity') || {};
    const peakHours = Object.keys(hourActivity).filter(hour => 
      hourActivity[hour] > Object.values(hourActivity).reduce((sum: number, count) => sum + (count as number), 0) / Object.keys(hourActivity).length * 1.5,
    );
    
    if (peakHours.length <= 2) {
      patterns.push({
        id: 'scheduled_puller',
        name: 'Scheduled Puller',
        description: 'Pulls at consistent times',
        confidence: 75,
        evidence: [`Primary activity during ${peakHours.join(' and ')} hour(s)`],
        implications: ['Habitual user', 'May respond to time-based promotions', 'Values routine'],
      });
    }
    
    // Pattern: Luck sensitivity
    const basicStats = this.calculateBasicStats();
    if (basicStats.luck_score < -30) {
      patterns.push({
        id: 'unlucky_streak',
        name: 'Unlucky Streak',
        description: 'Experiencing below-average luck',
        confidence: 90,
        evidence: ['Luck score below -30', 'Below expected legendary rate'],
        implications: ['May be frustrated', 'At risk of churning', 'Needs encouragement'],
      });
    }
    
    return patterns;
  }

  private generatePredictions(): PredictiveInsights {
    const basicStats = this.calculateBasicStats();
    
    // Predict next legendary
    const averagePullsToLegendary = basicStats.pulls_per_legendary || 90;
    const currentStreak = this.calculateStreaks().currentDry;
    const pitySoftStart = 75; // Soft pity starts around pull 75
    
    let estimatedPulls = Math.max(1, averagePullsToLegendary - currentStreak);
    let confidence = 50;
    
    if (currentStreak >= pitySoftStart) {
      estimatedPulls = Math.max(1, 90 - currentStreak);
      confidence = 85;
    }
    
    // Monthly spending prediction
    const monthlyActivity = this.calculateMonthlyActivity();
    const recentActivity = monthlyActivity.slice(-3); // Last 3 months
    const avgMonthlyGems = recentActivity.length > 0 ? 
      recentActivity.reduce((sum, month) => sum + month.gems_spent, 0) / recentActivity.length : 0;

    return {
      next_legendary_prediction: {
        estimated_pulls: estimatedPulls,
        confidence,
        factors: currentStreak >= pitySoftStart ? ['Soft pity active'] : ['Historical average', 'Current streak'],
      },
      monthly_spending_prediction: {
        estimated_gems: Math.round(avgMonthlyGems),
        estimated_cost: Math.round(avgMonthlyGems * 0.01), // Assuming 100 gems = $1
        confidence: recentActivity.length >= 3 ? 80 : 40,
      },
      retention_prediction: {
        likelihood_to_continue: this.calculateRetentionLikelihood(),
        risk_factors: this.identifyRiskFactors(),
        positive_indicators: this.identifyPositiveIndicators(),
      },
    };
  }

  private calculateRetentionLikelihood(): number {
    const basicStats = this.calculateBasicStats();
    const patterns = this.identifyBehaviorPatterns();
    
    let likelihood = 70; // Base likelihood
    
    // Adjust based on luck
    if (basicStats.luck_score > 20) likelihood += 15;
    else if (basicStats.luck_score < -20) likelihood -= 20;
    
    // Adjust based on spending efficiency
    if (basicStats.efficiency_rating === 'S' || basicStats.efficiency_rating === 'A') likelihood += 10;
    else if (basicStats.efficiency_rating === 'D') likelihood -= 15;
    
    // Adjust based on patterns
    const hasRiskPatterns = patterns.some(p => p.id === 'unlucky_streak');
    if (hasRiskPatterns) likelihood -= 25;
    
    return Math.max(0, Math.min(100, likelihood));
  }

  private identifyRiskFactors(): string[] {
    const factors = [];
    const basicStats = this.calculateBasicStats();
    
    if (basicStats.luck_score < -30) factors.push('Extended unlucky streak');
    if (basicStats.efficiency_rating === 'D') factors.push('Poor spending efficiency');
    
    const temporalAnalysis = this.performTemporalAnalysis();
    if (temporalAnalysis.current_dry_streak > 100) factors.push('Long dry streak without legendary');
    
    return factors;
  }

  private identifyPositiveIndicators(): string[] {
    const indicators = [];
    const basicStats = this.calculateBasicStats();
    
    if (basicStats.luck_score > 20) indicators.push('Above average luck');
    if (basicStats.efficiency_rating === 'S' || basicStats.efficiency_rating === 'A') {
      indicators.push('Excellent spending efficiency');
    }
    
    const temporalAnalysis = this.performTemporalAnalysis();
    if (temporalAnalysis.hot_streaks > 2) indicators.push('Multiple lucky streaks experienced');
    
    return indicators;
  }

  private generateRecommendations(): UserRecommendation[] {
    const recommendations = [];
    const basicStats = this.calculateBasicStats();
    const patterns = this.identifyBehaviorPatterns();
    
    // Luck-based recommendations
    if (basicStats.luck_score < -20) {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        title: 'Consider Guaranteed Banners',
        description: 'Focus on banners with guaranteed legendary characters to break your unlucky streak.',
        rationale: 'Your current luck score indicates below-average results',
        potential_benefit: 'Guaranteed progress toward collection goals',
      });
    }
    
    // Efficiency recommendations
    if (basicStats.efficiency_rating === 'C' || basicStats.efficiency_rating === 'D') {
      recommendations.push({
        type: 'strategy',
        priority: 'medium',
        title: 'Try 10-Pull Strategy',
        description: 'Switch to 10-pulls for better value and guaranteed rare characters.',
        rationale: 'Your gems-per-legendary ratio suggests room for improvement',
        potential_benefit: 'Better value and guaranteed minimum rarity per pull session',
      });
    }
    
    // Pattern-based recommendations
    const bulkPullerPattern = patterns.find(p => p.id === 'bulk_puller');
    if (bulkPullerPattern) {
      recommendations.push({
        type: 'banner',
        priority: 'medium',
        title: 'Watch for Step-Up Banners',
        description: 'Step-up banners offer excellent value for bulk pullers like you.',
        rationale: 'Your pulling pattern shows preference for bulk purchases',
        potential_benefit: 'Discounted pulls with escalating rewards',
      });
    }
    
    return recommendations;
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    const basicStats = this.calculateBasicStats();
    
    // Find best session
    const sessions = this.calculateSessions();
    const bestSession = sessions.reduce((best, current) => {
      const currentLegendaries = this.getLegendariesInTimeRange(current.date, new Date(new Date(current.date).getTime() + current.duration).toISOString());
      const bestLegendaries = best.legendaries_obtained || 0;
      
      return currentLegendaries > bestLegendaries ? 
        { ...current, legendaries_obtained: currentLegendaries } : 
        { ...best, legendaries_obtained: bestLegendaries };
    }, { date: new Date().toISOString(), pulls: 0, legendaries_obtained: 0 });

    return {
      vs_average: {
        pulls_efficiency: this.compareToAverage('efficiency'),
        luck_factor: basicStats.luck_score,
        spending_efficiency: this.compareToAverage('spending'),
      },
      best_session: bestSession,
      best_streak: {
        start_date: new Date().toISOString(),
        duration: 0,
        characters_obtained: 0,
      },
      milestones_reached: this.getReachedMilestones(),
      upcoming_milestones: this.getUpcomingMilestones(),
    };
  }

  private getLegendariesInTimeRange(start: string, end: string): number {
    return this.pullHistory
      .filter(r => r.timestamp >= start && r.timestamp <= end)
      .reduce((count, r) => count + r.characters.filter(c => c.rarity === 'legendary' || c.rarity === 'mythical').length, 0);
  }

  private compareToAverage(metric: string): number {
    // This would compare against global averages
    // For now, return a placeholder
    return Math.random() * 40 - 20; // -20% to +20%
  }

  private getReachedMilestones(): Milestone[] {
    const milestones = [];
    const basicStats = this.calculateBasicStats();
    
    if (basicStats.total_pulls >= 100) {
      milestones.push({
        id: 'pulls_100',
        name: 'Centurion',
        description: 'Complete 100 pulls',
        requirement: 100,
        current_progress: basicStats.total_pulls,
      });
    }
    
    return milestones;
  }

  private getUpcomingMilestones(): Milestone[] {
    const milestones = [];
    const basicStats = this.calculateBasicStats();
    
    if (basicStats.total_pulls < 500) {
      milestones.push({
        id: 'pulls_500',
        name: 'Dedicated Summoner',
        description: 'Complete 500 pulls',
        requirement: 500,
        current_progress: basicStats.total_pulls,
        reward: { legendary_crystals: 5, transcendence_core: 1 } as EvolutionMaterials,
        estimated_completion: this.estimateMilestoneCompletion(500, basicStats.total_pulls),
      });
    }
    
    return milestones;
  }

  private estimateMilestoneCompletion(target: number, current: number): string {
    const remaining = target - current;
    const dailyRate = this.calculateDailyPullRate();
    
    if (dailyRate <= 0) return 'Unknown';
    
    const daysToComplete = Math.ceil(remaining / dailyRate);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);
    
    return completionDate.toISOString().split('T')[0];
  }

  private calculateDailyPullRate(): number {
    if (this.pullHistory.length < 2) return 0;
    
    const firstPull = new Date(this.pullHistory[0].timestamp);
    const lastPull = new Date(this.pullHistory[this.pullHistory.length - 1].timestamp);
    const daysDiff = (lastPull.getTime() - firstPull.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 0) return 0;
    
    const totalPulls = this.pullHistory.reduce((sum, r) => sum + r.characters.length, 0);
    return totalPulls / daysDiff;
  }

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================

  private initializeBenchmarkData(): void {
    // In a real implementation, this would load from a database or API
    this.benchmarkData = {
      average_pulls_per_legendary: 90,
      average_gems_per_legendary: 14400,
      average_luck_score: 0,
      median_session_duration: 15, // minutes
      average_pulls_per_session: 8,
    };
  }

  // ==============================================================================
  // DATA EXPORT/IMPORT
  // ==============================================================================

  public exportAnalyticsData(): any {
    return {
      pullHistory: this.pullHistory,
      userPatterns: Array.from(this.userPatterns.entries()),
      benchmarkData: this.benchmarkData,
    };
  }

  public importAnalyticsData(data: any): void {
    if (data.pullHistory) this.pullHistory = data.pullHistory;
    if (data.userPatterns) this.userPatterns = new Map(data.userPatterns);
    if (data.benchmarkData) this.benchmarkData = data.benchmarkData;
  }

  public clearAnalyticsData(): void {
    this.pullHistory = [];
    this.userPatterns.clear();
  }
}

// ==============================================================================
// EXPORT SINGLETON INSTANCE
// ==============================================================================

export const pullAnalyticsEngine = PullAnalyticsEngine.getInstance();
export default pullAnalyticsEngine;