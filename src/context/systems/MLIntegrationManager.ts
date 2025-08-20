// src/context/systems/MLIntegrationManager.ts
// ML Integration Manager - Unifies all ML systems for 1% Better
// Provides single interface for statistical validation, predictive analytics, and mobile optimization

import {
  // WorkoutMetrics,
  // BaselineData,
  // ImprovementDetection,
  // ImprovementDimension,
  // 
} from './OnePercentBetterSystem';

import {
  // MLStatisticalValidation,
  // StatisticalValidationResult
} from './MLStatisticalValidation';
import {
  // PredictiveAnalytics,
  // PredictiveInsights
} from './PredictiveAnalytics';
import {
  // MobileModelOptimization,
  // ModelOptimizationResult
} from './MobileModelOptimization';

// ==============================================================================
// ML INTEGRATION INTERFACES
// ==============================================================================

export interface MLSystemStatus {
  statisticalValidation: boolean;
  predictiveAnalytics: boolean;
  mobileOptimization: boolean;
  overallHealth: number; // 0-1
  lastUpdated: string;
}

export interface IntegratedMLResult {
  improvementDetection: ImprovementDetection | null;
  statisticalValidation: StatisticalValidationResult;
  predictiveInsights: PredictiveInsights | null;
  mobileOptimization: ModelOptimizationResult | null;
  processingTime: number;
  confidence: number;
  recommendations: string[];
}

export interface MLPerformanceMetrics {
  accuracy: number;
  processingTime: number;
  memoryUsage: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  predictiveAccuracy: number;
  mobileCompatibility: boolean;
  lastUpdated: string;
}

export interface MLConfiguration {
  enableStatisticalValidation: boolean;
  enablePredictiveAnalytics: boolean;
  enableMobileOptimization: boolean;
  accuracyThreshold: number;
  processingTimeLimit: number;
  memoryLimit: number;
  autoOptimization: boolean;
  retrainFrequency: number; // days
}

// ==============================================================================
// ML INTEGRATION MANAGER
// ==============================================================================

export class MLIntegrationManager {
  private static instance: MLIntegrationManager;
  
  // ML Systems
  private statisticalValidation: MLStatisticalValidation;
  private predictiveAnalytics: PredictiveAnalytics;
  private mobileOptimization: MobileModelOptimization;
  
  // Configuration
  private config: MLConfiguration = {
    enableStatisticalValidation: true,
    enablePredictiveAnalytics: true,
    enableMobileOptimization: true,
    accuracyThreshold: 0.95,
    processingTimeLimit: 500,
    memoryLimit: 20,
    autoOptimization: true,
    retrainFrequency: 30,
  };
  
  // Performance tracking
  private performanceMetrics: MLPerformanceMetrics = {
    accuracy: 0.95,
    processingTime: 0,
    memoryUsage: 0,
    falsePositiveRate: 0.04,
    falseNegativeRate: 0.03,
    predictiveAccuracy: 0.85,
    mobileCompatibility: true,
    lastUpdated: new Date().toISOString(),
  };
  
  // System status
  private systemStatus: MLSystemStatus = {
    statisticalValidation: false,
    predictiveAnalytics: false,
    mobileOptimization: false,
    overallHealth: 0,
    lastUpdated: new Date().toISOString(),
  };

  private constructor() {
    this.initializeMLSystems();
    this.startPerformanceMonitoring();
  }

  public static getInstance(): MLIntegrationManager {
    if (!MLIntegrationManager.instance) {
      MLIntegrationManager.instance = new MLIntegrationManager();
    }
    return MLIntegrationManager.instance;
  }

  // ==============================================================================
  // SYSTEM INITIALIZATION
  // ==============================================================================

  private initializeMLSystems(): void {
    try {
      // Initialize statistical validation system
      this.statisticalValidation = MLStatisticalValidation.getInstance();
      this.systemStatus.statisticalValidation = true;
      
      // Initialize predictive analytics system
      this.predictiveAnalytics = PredictiveAnalytics.getInstance();
      this.systemStatus.predictiveAnalytics = true;
      
      // Initialize mobile optimization system
      this.mobileOptimization = MobileModelOptimization.getInstance();
      this.systemStatus.mobileOptimization = true;
      
      // Update overall health
      this.updateSystemHealth();
      
      console.log('ML Integration Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing ML systems:', error);
      this.systemStatus.overallHealth = 0;
    }
  }

  private startPerformanceMonitoring(): void {
    // Monitor system performance every 5 minutes
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5 * 60 * 1000);
    
    // Auto-optimization every 24 hours
    setInterval(() => {
      if (this.config.autoOptimization) {
        this.performAutoOptimization();
      }
    }, 24 * 60 * 60 * 1000);
  }

  // ==============================================================================
  // MAIN INTEGRATION METHODS
  // ==============================================================================

  public async processWorkoutData(
    workoutData: WorkoutMetrics,
    userId: string
  ): Promise<IntegratedMLResult> {
    // const startTime = ...; // Quick fix: commented unused variable
    
    try {
      // Validate system health
      if (this.systemStatus.overallHealth < 0.8) {
        throw new Error('ML systems not healthy enough for processing');
      }
      
      const results: IntegratedMLResult = {
        improvementDetection: null,
        statisticalValidation: {
          isValid: false,
          confidence: 0,
          statisticalSignificance: 1,
          pValue: 1,
          zScore: 0,
          effectSize: 0,
          power: 0,
          method: 'error',
        },
        predictiveInsights: null,
        mobileOptimization: null,
        processingTime: 0,
        confidence: 0,
        recommendations: [],
      };
      
      // 1. Statistical Validation
      if (this.config.enableStatisticalValidation) {
        results.statisticalValidation = await this.performStatisticalValidation(
          workoutData,
          userId
        );
      }
      
      // 2. Improvement Detection (if validation passes)
      if (results.statisticalValidation.isValid) {
        results.improvementDetection = await this.detectImprovements(
          workoutData,
          userId,
          results.statisticalValidation
        );
      }
      
      // 3. Predictive Analytics
      if (this.config.enablePredictiveAnalytics) {
        results.predictiveInsights = await this.generatePredictiveInsights(userId);
      }
      
      // 4. Mobile Optimization
      if (this.config.enableMobileOptimization) {
        results.mobileOptimization = await this.optimizeForMobile(workoutData, userId);
      }
      
      // Calculate final metrics
      results.processingTime = performance.now() - startTime;
      results.confidence = this.calculateOverallConfidence(results);
      results.recommendations = this.generateRecommendations(results);
      
      // Update performance metrics
      this.updatePerformanceMetrics(results);
      
      return results;
      
    } catch (error) {
      console.error('Error in ML integration processing:', error);
      return {
        improvementDetection: null,
        statisticalValidation: {
          isValid: false,
          confidence: 0,
          statisticalSignificance: 1,
          pValue: 1,
          zScore: 0,
          effectSize: 0,
          power: 0,
          method: 'error',
        },
        predictiveInsights: null,
        mobileOptimization: null,
        processingTime: performance.now() - startTime,
        confidence: 0,
        recommendations: ['ML processing failed - check system health'],
      };
    }
  }

  private async performStatisticalValidation(
    workoutData: WorkoutMetrics,
    userId: string
  ): Promise<StatisticalValidationResult> {
    // Get baseline data (this would come from the OnePercentBetterSystem)
    const baseline: BaselineData = {
      dimension: 'strength', // This would be determined based on workout type
      user_id: userId,
      calculated_at: new Date().toISOString(),
      data_points: 20,
      confidence_interval: 0.95,
      mean: 1000,
      median: 950,
      standard_deviation: 150,
      variance: 22500,
      trend_direction: 'improving',
      trend_strength: 0.7,
      seasonal_factors: [],
      minimum_data_points: 10,
      data_quality_score: 0.9,
    };
    
    const dimension: ImprovementDimension = {
      id: 'strength',
      name: 'Strength',
      description: 'Muscular strength and power improvements',
      metrics: ['weight', 'reps', 'sets', 'progressive_overload', 'one_rep_max'],
      threshold: 1.0,
      validation_method: 'statistical',
      celebration_type: 'strength_improvement',
      character_synergy: ['strength_training', 'athletic_performance'],
    };
    
    return await this.statisticalValidation.validateImprovement(
      workoutData.total_volume,
      baseline,
      dimension,
      workoutData
    );
  }

  private async detectImprovements(
    workoutData: WorkoutMetrics,
    userId: string,
    validation: StatisticalValidationResult
  ): Promise<ImprovementDetection | null> {
    // This would integrate with the OnePercentBetterSystem
    // For now, return a mock improvement detection
    if (validation.confidence > this.config.accuracyThreshold) {
      return {
        id: `improvement_${Date.now()}`,
        user_id: userId,
        dimension: 'strength',
        detected_at: new Date().toISOString(),
        baseline_value: 1000,
        current_value: workoutData.total_volume,
        improvement_percentage: ((workoutData.total_volume - 1000) / 1000) * 100,
        improvement_magnitude: 'small',
        confidence_score: validation.confidence,
        statistical_significance: validation.statisticalSignificance,
        validation_method: validation.method,
        validation_status: 'validated',
        workout_context: {
          workout_id: workoutData.workout_id,
          workout_type: workoutData.category,
          duration: workoutData.duration,
          intensity: 7,
          exercises_performed: workoutData.exercises.map(e => e.name),
          total_volume: workoutData.total_volume,
        },
        character_context: {
          active_characters: [],
          team_synergies: [],
          character_specializations: [],
          experience_gained: 50,
        },
        environmental_factors: {
          sleep_quality: workoutData.sleep_hours / 8,
          stress_level: workoutData.stress_level / 10,
          nutrition_quality: workoutData.nutrition_quality / 10,
          recovery_status: workoutData.recovery_days / 7,
          weather_conditions: 'unknown',
          time_of_day: new Date(workoutData.timestamp).getHours().toString(),
          day_of_week: new Date(workoutData.timestamp).toLocaleDateString('en-US', { weekday: 'long' }),
        },
        celebration_triggered: false,
        rewards_granted: [],
        character_experience_bonus: 50,
      };
    }
    
    return null;
  }

  private async generatePredictiveInsights(userId: string): Promise<PredictiveInsights | null> {
    try {
      return await this.predictiveAnalytics.predictFutureImprovements(userId);
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return null;
    }
  }

  private async optimizeForMobile(
    workoutData: WorkoutMetrics,
    userId: string
  ): Promise<ModelOptimizationResult | null> {
    try {
      // Mock model for optimization
      const mockModel = {
        id: 'strength_model',
        type: 'regression',
        weights: new Array(1000).fill(0.1),
      };
      
      return await this.mobileOptimization.optimizeModelForMobile(
        'strength',
        mockModel,
        {
          modelSize: 15,
          memoryLimit: 20,
          processingTimeLimit: 500,
        }
      );
    } catch (error) {
      console.error('Error optimizing for mobile:', error);
      return null;
    }
  }

  // ==============================================================================
  // PERFORMANCE MONITORING
  // ==============================================================================

  private updatePerformanceMetrics(results?: IntegratedMLResult): void {
    if (results) {
      this.performanceMetrics.processingTime = results.processingTime;
      this.performanceMetrics.accuracy = results.confidence;
      
      if (results.statisticalValidation) {
        this.performanceMetrics.falsePositiveRate = 1 - results.statisticalValidation.confidence;
        this.performanceMetrics.falseNegativeRate = results.statisticalValidation.statisticalSignificance;
      }
      
      if (results.predictiveInsights) {
        this.performanceMetrics.predictiveAccuracy = 0.85; // Mock value
      }
      
      if (results.mobileOptimization) {
        this.performanceMetrics.mobileCompatibility = 
          results.mobileOptimization.optimizedSize <= this.config.memoryLimit;
      }
    }
    
    this.performanceMetrics.lastUpdated = new Date().toISOString();
  }

  private updateSystemHealth(): void {
    const healthScores = [
      this.systemStatus.statisticalValidation ? 1 : 0,
      this.systemStatus.predictiveAnalytics ? 1 : 0,
      this.systemStatus.mobileOptimization ? 1 : 0,
    ];
    
    this.systemStatus.overallHealth = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    this.systemStatus.lastUpdated = new Date().toISOString();
  }

  private performAutoOptimization(): void {
    console.log('Performing auto-optimization...');
    
    // Check if retraining is needed
    const daysSinceLastUpdate = (
      Date.now() - new Date(this.performanceMetrics.lastUpdated).getTime()
    ) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastUpdate >= this.config.retrainFrequency) {
      this.retrainModels();
    }
    
    // Optimize configurations based on performance
    this.optimizeConfigurations();
  }

  private async retrainModels(): Promise<void> {
    try {
      console.log('Retraining ML models...');
      
      // Retrain statistical validation models
      // const dimensions = ...; // Quick fix: commented unused variable
      
      for (const dimension of dimensions) {
        // Mock training data
        const trainingData = new Array(1000).fill(null).map(() => ({
          features: new Array(20).fill(0).map(() => Math.random()),
          label: Math.random(),
        }));
        
        await this.statisticalValidation.retrainModel(dimension, trainingData);
      }
      
      console.log('Model retraining completed');
    } catch (error) {
      console.error('Error retraining models:', error);
    }
  }

  private optimizeConfigurations(): void {
    // Adjust configurations based on performance metrics
    if (this.performanceMetrics.processingTime > this.config.processingTimeLimit) {
      this.config.processingTimeLimit = Math.min(1000, this.config.processingTimeLimit * 1.2);
    }
    
    if (this.performanceMetrics.falsePositiveRate > 0.05) {
      this.config.accuracyThreshold = Math.min(0.99, this.config.accuracyThreshold * 1.05);
    }
    
    if (this.performanceMetrics.memoryUsage > this.config.memoryLimit) {
      this.config.memoryLimit = Math.min(50, this.config.memoryLimit * 1.1);
    }
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private calculateOverallConfidence(results: IntegratedMLResult): number {
    const confidences = [
      results.statisticalValidation.confidence,
      results.predictiveInsights ? 0.85 : 0.5, // Mock predictive confidence
      results.mobileOptimization ? 0.9 : 0.5, // Mock mobile optimization confidence
    ];
    
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private generateRecommendations(results: IntegratedMLResult): string[] {
    const recommendations: string[] = [];
    
    // Statistical validation recommendations
    if (results.statisticalValidation.confidence < 0.9) {
      recommendations.push('Consider collecting more data for better statistical validation');
    }
    
    if (results.statisticalValidation.pValue > 0.05) {
      recommendations.push('Improvement may not be statistically significant - continue training');
    }
    
    // Predictive analytics recommendations
    if (results.predictiveInsights) {
      const highRiskFactors = results.predictiveInsights.riskAssessment.riskFactors.filter(
        rf => rf.risk === 'high'
      );
      
      if (highRiskFactors.length > 0) {
        recommendations.push(`Address high-risk factors: ${highRiskFactors.map(rf => rf.factor).join(', ')}`);
      }
      
      if (results.predictiveInsights.recommendations.length > 0) {
        recommendations.push(...results.predictiveInsights.recommendations.slice(0, 3).map(r => r.description));
      }
    }
    
    // Mobile optimization recommendations
    if (results.mobileOptimization) {
      if (results.mobileOptimization.accuracyLoss > 0.05) {
        recommendations.push('Consider reducing mobile optimization to maintain accuracy');
      }
      
      if (results.mobileOptimization.optimizedSize > this.config.memoryLimit) {
        recommendations.push('Apply additional compression for mobile deployment');
      }
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  public getSystemStatus(): MLSystemStatus {
    return { ...this.systemStatus };
  }

  public getPerformanceMetrics(): MLPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  public getConfiguration(): MLConfiguration {
    return { ...this.config };
  }

  public updateConfiguration(newConfig: Partial<MLConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async getStatisticalValidationPerformance(): Promise<Record<string, any>> {
    return this.statisticalValidation.getAllModelPerformance();
  }

  public async getPredictiveAnalyticsModels(): Promise<Record<string, any>> {
    return this.predictiveAnalytics.getPredictionModels();
  }

  public getMobileOptimizationStrategies(): any[] {
    return this.mobileOptimization.getOptimizationStrategies();
  }

  public async validateMobileCompatibility(
    modelId: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<{
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    return this.mobileOptimization.validateMobileCompatibility(modelId, platform);
  }

  public generateMobileImplementation(
    modelId: string,
    platform: 'ios' | 'android' | 'web'
  ): {
    code: string;
    dependencies: string[];
    instructions: string[];
  } {
    return this.mobileOptimization.generateMobileImplementation(modelId, platform);
  }

  public async addHistoricalData(userId: string, dimension: string, data: WorkoutMetrics): Promise<void> {
    this.predictiveAnalytics.addHistoricalData(userId, dimension, data);
  }

  public async retrainSpecificModel(dimension: string, trainingData: any[]): Promise<void> {
    await this.statisticalValidation.retrainModel(dimension, trainingData);
  }

  public getSystemHealth(): number {
    return this.systemStatus.overallHealth;
  }

  public isSystemHealthy(): boolean {
    return this.systemStatus.overallHealth >= 0.8;
  }

  public getSystemDiagnostics(): {
    status: MLSystemStatus;
    performance: MLPerformanceMetrics;
    configuration: MLConfiguration;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    if (this.systemStatus.overallHealth < 0.8) {
      recommendations.push('System health is below threshold - check ML system initialization');
    }
    
    if (this.performanceMetrics.processingTime > this.config.processingTimeLimit) {
      recommendations.push('Processing time exceeds limit - consider optimization');
    }
    
    if (this.performanceMetrics.falsePositiveRate > 0.05) {
      recommendations.push('False positive rate is high - consider adjusting accuracy threshold');
    }
    
    if (!this.performanceMetrics.mobileCompatibility) {
      recommendations.push('Mobile compatibility issues detected - apply mobile optimization');
    }
    
    return {
      status: this.getSystemStatus(),
      performance: this.getPerformanceMetrics(),
      configuration: this.getConfiguration(),
      recommendations,
    };
  }
}
