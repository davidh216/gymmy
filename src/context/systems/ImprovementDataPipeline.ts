// src/context/systems/ImprovementDataPipeline.ts
// Real-time data processing pipeline for 1% Better system
// Handles workout data ingestion, processing, and improvement detection

import {
  // WorkoutMetrics,
  // ExerciseMetrics,
  // SetMetrics,
  // ImprovementDetection,
  // BaselineData,
  // 
} from './OnePercentBetterSystem';

// ==============================================================================
// PIPELINE INTERFACES
// ==============================================================================

export interface DataPipelineConfig {
  // Processing settings
  batchSize: number;
  processingInterval: number; // milliseconds
  maxConcurrentProcessors: number;
  
  // Validation settings
  minDataQualityScore: number;
  outlierThreshold: number;
  confidenceInterval: number;
  
  // Performance settings
  maxProcessingTime: number; // milliseconds
  memoryLimit: number; // MB
  cacheSize: number;
  
  // Integration settings
  enableRealTimeProcessing: boolean;
  enableBatchProcessing: boolean;
  enableHistoricalAnalysis: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  processor: (data: any) => Promise<any>;
  validator: (data: any) => boolean;
  errorHandler: (error: Error, data: any) => void;
}

export interface ProcessingResult {
  success: boolean;
  data: any;
  processingTime: number;
  errors: Error[];
  warnings: string[];
  metadata: ProcessingMetadata;
}

export interface ProcessingMetadata {
  timestamp: string;
  stage: string;
  dataSize: number;
  qualityScore: number;
  confidence: number;
}

export interface DataQualityMetrics {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  timeliness: number; // 0-1
  validity: number; // 0-1
  overall: number; // 0-1
}

export interface PipelineMetrics {
  totalProcessed: number;
  successfulProcessed: number;
  failedProcessed: number;
  averageProcessingTime: number;
  averageDataQuality: number;
  lastProcessed: string;
  errors: PipelineError[];
}

export interface PipelineError {
  id: string;
  timestamp: string;
  stage: string;
  error: Error;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

// ==============================================================================
// DATA PROCESSING PIPELINE
// ==============================================================================

export class ImprovementDataPipeline {
  private static instance: ImprovementDataPipeline;
  
  // Pipeline configuration
  private config: DataPipelineConfig;
  
  // Pipeline stages
  private stages: Map<string, PipelineStage> = new Map();
  
  // Processing queues
  private realTimeQueue: WorkoutMetrics[] = [];
  private batchQueue: WorkoutMetrics[] = [];
  private historicalQueue: WorkoutMetrics[] = [];
  
  // Processing state
  private isProcessing: boolean = false;
  private processingMetrics: PipelineMetrics;
  
  // Performance monitoring
  private performanceMetrics: {
    processingTimes: number[];
    memoryUsage: number[];
    qualityScores: number[];
    errorRates: number[];
  };

  private constructor() {
    this.initializeConfiguration();
    this.initializeStages();
    this.initializeMetrics();
    this.startProcessing();
  }

  public static getInstance(): ImprovementDataPipeline {
    if (!ImprovementDataPipeline.instance) {
      ImprovementDataPipeline.instance = new ImprovementDataPipeline();
    }
    return ImprovementDataPipeline.instance;
  }

  // ==============================================================================
  // PIPELINE INITIALIZATION
  // ==============================================================================

  private initializeConfiguration(): void {
    this.config = {
      batchSize: 100,
      processingInterval: 5000, // 5 seconds
      maxConcurrentProcessors: 4,
      minDataQualityScore: 0.7,
      outlierThreshold: 3.0, // Standard deviations
      confidenceInterval: 0.95,
      maxProcessingTime: 1000, // 1 second
      memoryLimit: 50, // 50MB
      cacheSize: 1000,
      enableRealTimeProcessing: true,
      enableBatchProcessing: true,
      enableHistoricalAnalysis: true,
    };
  }

  private initializeStages(): void {
    const stages: PipelineStage[] = [
      {
        id: 'data_ingestion',
        name: 'Data Ingestion',
        description: 'Ingest and validate raw workout data',
        processor: this.processDataIngestion.bind(this),
        validator: this.validateDataIngestion.bind(this),
        errorHandler: this.handleDataIngestionError.bind(this),
      },
      {
        id: 'data_cleaning',
        name: 'Data Cleaning',
        description: 'Clean and normalize workout data',
        processor: this.processDataCleaning.bind(this),
        validator: this.validateDataCleaning.bind(this),
        errorHandler: this.handleDataCleaningError.bind(this),
      },
      {
        id: 'feature_extraction',
        name: 'Feature Extraction',
        description: 'Extract relevant features for improvement detection',
        processor: this.processFeatureExtraction.bind(this),
        validator: this.validateFeatureExtraction.bind(this),
        errorHandler: this.handleFeatureExtractionError.bind(this),
      },
      {
        id: 'outlier_detection',
        name: 'Outlier Detection',
        description: 'Detect and handle outliers in workout data',
        processor: this.processOutlierDetection.bind(this),
        validator: this.validateOutlierDetection.bind(this),
        errorHandler: this.handleOutlierDetectionError.bind(this),
      },
      {
        id: 'baseline_calculation',
        name: 'Baseline Calculation',
        description: 'Calculate or update user baselines',
        processor: this.processBaselineCalculation.bind(this),
        validator: this.validateBaselineCalculation.bind(this),
        errorHandler: this.handleBaselineCalculationError.bind(this),
      },
      {
        id: 'improvement_detection',
        name: 'Improvement Detection',
        description: 'Detect improvements using statistical analysis',
        processor: this.processImprovementDetection.bind(this),
        validator: this.validateImprovementDetection.bind(this),
        errorHandler: this.handleImprovementDetectionError.bind(this),
      },
      {
        id: 'validation',
        name: 'Validation',
        description: 'Validate detected improvements',
        processor: this.processValidation.bind(this),
        validator: this.validateValidation.bind(this),
        errorHandler: this.handleValidationError.bind(this),
      },
      {
        id: 'integration',
        name: 'System Integration',
        description: 'Integrate improvements with existing systems',
        processor: this.processIntegration.bind(this),
        validator: this.validateIntegration.bind(this),
        errorHandler: this.handleIntegrationError.bind(this),
      },
    ];

    stages.forEach(stage => {
      this.stages.set(stage.id, stage);
    });
  }

  private initializeMetrics(): void {
    this.processingMetrics = {
      totalProcessed: 0,
      successfulProcessed: 0,
      failedProcessed: 0,
      averageProcessingTime: 0,
      averageDataQuality: 0,
      lastProcessed: new Date().toISOString(),
      errors: [],
    };

    this.performanceMetrics = {
      processingTimes: [],
      memoryUsage: [],
      qualityScores: [],
      errorRates: [],
    };
  }

  private startProcessing(): void {
    if (this.config.enableRealTimeProcessing) {
      setInterval(() => {
        this.processRealTimeQueue();
      }, this.config.processingInterval);
    }

    if (this.config.enableBatchProcessing) {
      setInterval(() => {
        this.processBatchQueue();
      }, this.config.processingInterval * 10);
    }
  }

  // ==============================================================================
  // DATA INGESTION
  // ==============================================================================

  public async ingestWorkoutData(workoutData: any): Promise<ProcessingResult> {
    // const startTime = ...; // Quick fix: commented unused variable
    
    try {
      // Validate input data
      // const validatedData = ...; // Quick fix: commented unused variable
      if (!validatedData.isValid) {
        throw new Error(`Invalid input data: ${validatedData.errors.join(', ')}`);
      }

      // Convert to WorkoutMetrics format
      // const workoutMetrics = ...; // Quick fix: commented unused variable
      
      // Add to appropriate queue
      if (this.config.enableRealTimeProcessing) {
        this.realTimeQueue.push(workoutMetrics);
      } else {
        this.batchQueue.push(workoutMetrics);
      }

      // const processingTime = ...; // Quick fix: commented unused variable
      
      return {
        success: true,
        data: workoutMetrics,
        processingTime,
        errors: [],
        warnings: [],
        metadata: {
          timestamp: new Date().toISOString(),
          stage: 'ingestion',
          dataSize: JSON.stringify(workoutMetrics).length,
          qualityScore: this.calculateDataQuality(workoutMetrics),
          confidence: 0.9,
        },
      };
    } catch (error) {
      // const processingTime = ...; // Quick fix: commented unused variable
      
      return {
        success: false,
        data: null,
        processingTime,
        errors: [error as Error],
        warnings: [],
        metadata: {
          timestamp: new Date().toISOString(),
          stage: 'ingestion',
          dataSize: 0,
          qualityScore: 0,
          confidence: 0,
        },
      };
    }
  }

  private validateInputData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    // const requiredFields = ...; // Quick fix: commented unused variable
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check data types
    if (data.exercises && !Array.isArray(data.exercises)) {
      errors.push('Exercises must be an array');
    }

    // Check timestamp format
    if (data.timestamp && isNaN(Date.parse(data.timestamp))) {
      errors.push('Invalid timestamp format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private convertToWorkoutMetrics(data: any): WorkoutMetrics {
    return {
      workout_id: data.workout_id,
      user_id: data.user_id,
      timestamp: data.timestamp,
      duration: data.duration || 0,
      category: data.category || 'general',
      difficulty: data.difficulty || 'medium',
      exercises: this.convertExercises(data.exercises || []),
      total_volume: this.calculateTotalVolume(data.exercises || []),
      total_reps: this.calculateTotalReps(data.exercises || []),
      total_sets: this.calculateTotalSets(data.exercises || []),
      average_weight: this.calculateAverageWeight(data.exercises || []),
      max_weight: this.calculateMaxWeight(data.exercises || []),
      cardio_data: data.cardio_data,
      perceived_exertion: data.perceived_exertion || 5,
      energy_level: data.energy_level || 5,
      motivation_level: data.motivation_level || 5,
      sleep_hours: data.sleep_hours || 7,
      stress_level: data.stress_level || 5,
      nutrition_quality: data.nutrition_quality || 5,
      recovery_days: data.recovery_days || 1,
    };
  }

  private convertExercises(exercises: any[]): ExerciseMetrics[] {
    return exercises.map(exercise => ({
      name: exercise.name,
      category: exercise.category || 'strength',
      muscle_groups: exercise.muscle_groups || [],
      sets: this.convertSets(exercise.sets || []),
      total_volume: this.calculateExerciseVolume(exercise.sets || []),
      max_weight: this.calculateMaxWeight(exercise.sets || []),
      max_reps: this.calculateMaxReps(exercise.sets || []),
      form_quality: exercise.form_quality || 7,
      technique_notes: exercise.technique_notes || [],
    }));
  }

  private convertSets(sets: any[]): SetMetrics[] {
    return sets.map((set, index) => ({
      set_number: index + 1,
      weight: set.weight || 0,
      reps: set.reps || 0,
      rest_time: set.rest_time || 0,
      rpe: set.rpe || 5,
      form_quality: set.form_quality || 7,
    }));
  }

  // ==============================================================================
  // PIPELINE STAGES
  // ==============================================================================

  private async processRealTimeQueue(): Promise<void> {
    if (this.isProcessing || this.realTimeQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    // const startTime = ...; // Quick fix: commented unused variable

    try {
      // const batch = ...; // Quick fix: commented unused variable
      
      for (const workoutData of batch) {
        await this.processWorkoutData(workoutData);
      }

      // const processingTime = ...; // Quick fix: commented unused variable
      this.recordPerformanceMetric(processingTime);
      
      this.processingMetrics.totalProcessed += batch.length;
      this.processingMetrics.successfulProcessed += batch.length;
      this.processingMetrics.lastProcessed = new Date().toISOString();
    } catch (error) {
      console.error('Error processing real-time queue:', error);
      this.processingMetrics.failedProcessed += this.realTimeQueue.length;
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBatchQueue(): Promise<void> {
    if (this.batchQueue.length === 0) {
      return;
    }

    // const batch = ...; // Quick fix: commented unused variable
    
    for (const workoutData of batch) {
      await this.processWorkoutData(workoutData);
    }
  }

  private async processWorkoutData(workoutData: WorkoutMetrics): Promise<void> {
    let currentData = workoutData;

    // Process through each pipeline stage
    for (const [stageId, stage] of this.stages) {
      try {
        // const startTime = ...; // Quick fix: commented unused variable
        
        // Process data through stage
        currentData = await stage.processor(currentData);
        
        // Validate stage output
        if (!stage.validator(currentData)) {
          throw new Error(`Validation failed for stage: ${stageId}`);
        }

        // const processingTime = ...; // Quick fix: commented unused variable
        
        // Check processing time limits
        if (processingTime > this.config.maxProcessingTime) {
          console.warn(`Stage ${stageId} exceeded processing time limit: ${processingTime}ms`);
        }

      } catch (error) {
        stage.errorHandler(error as Error, currentData);
        throw error;
      }
    }
  }

  // ==============================================================================
  // PIPELINE STAGE PROCESSORS
  // ==============================================================================

  private async processDataIngestion(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Validate data completeness and format
    // const qualityScore = ...; // Quick fix: commented unused variable
    
    if (qualityScore < this.config.minDataQualityScore) {
      throw new Error(`Data quality too low: ${qualityScore}`);
    }

    return data;
  }

  private async processDataCleaning(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Clean and normalize data
    // const cleanedData = ...; // Quick fix: commented unused variable

    // Normalize exercise names
    cleanedData.exercises = data.exercises.map(exercise => ({
      ...exercise,
      name: this.normalizeExerciseName(exercise.name),
      category: this.normalizeExerciseCategory(exercise.category),
    }));

    // Normalize numeric values
    cleanedData.exercises = cleanedData.exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({
        ...set,
        weight: Math.max(0, set.weight || 0),
        reps: Math.max(0, set.reps || 0),
        rest_time: Math.max(0, set.rest_time || 0),
        rpe: Math.min(10, Math.max(1, set.rpe || 5)),
        form_quality: Math.min(10, Math.max(1, set.form_quality || 7)),
      })),
    }));

    return cleanedData;
  }

  private async processFeatureExtraction(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Extract additional features for improvement detection
    // const enhancedData = ...; // Quick fix: commented unused variable

    // Calculate derived metrics
    enhancedData.total_volume = this.calculateTotalVolume(data.exercises);
    enhancedData.total_reps = this.calculateTotalReps(data.exercises);
    enhancedData.total_sets = this.calculateTotalSets(data.exercises);
    enhancedData.average_weight = this.calculateAverageWeight(data.exercises);
    enhancedData.max_weight = this.calculateMaxWeight(data.exercises);

    // Calculate exercise-specific features
    enhancedData.exercises = data.exercises.map(exercise => ({
      ...exercise,
      total_volume: this.calculateExerciseVolume(exercise.sets),
      max_weight: this.calculateMaxWeight(exercise.sets),
      max_reps: this.calculateMaxReps(exercise.sets),
      average_weight: this.calculateAverageWeight(exercise.sets),
      average_reps: this.calculateAverageReps(exercise.sets),
      intensity_score: this.calculateIntensityScore(exercise.sets),
    }));

    return enhancedData;
  }

  private async processOutlierDetection(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Detect and handle outliers
    // const cleanedData = ...; // Quick fix: commented unused variable

    // Detect outliers in exercise data
    cleanedData.exercises = data.exercises.map(exercise => ({
      ...exercise,
      sets: this.removeOutlierSets(exercise.sets),
    }));

    return cleanedData;
  }

  private async processBaselineCalculation(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Calculate or update user baselines
    // This would integrate with the OnePercentBetterSystem
    return data;
  }

  private async processImprovementDetection(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Detect improvements using the OnePercentBetterSystem
    // This would call the improvement detection algorithms
    return data;
  }

  private async processValidation(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Validate detected improvements
    return data;
  }

  private async processIntegration(data: WorkoutMetrics): Promise<WorkoutMetrics> {
    // Integrate with existing systems
    return data;
  }

  // ==============================================================================
  // VALIDATION METHODS
  // ==============================================================================

  private validateDataIngestion(data: WorkoutMetrics): boolean {
    return data.workout_id && data.user_id && data.timestamp && data.exercises.length > 0;
  }

  private validateDataCleaning(data: WorkoutMetrics): boolean {
    return data.exercises.every(exercise => 
      exercise.name && exercise.sets.every(set => 
        set.weight >= 0 && set.reps >= 0 && set.rpe >= 1 && set.rpe <= 10
      )
    );
  }

  private validateFeatureExtraction(data: WorkoutMetrics): boolean {
    return data.total_volume >= 0 && data.total_reps >= 0 && data.total_sets >= 0;
  }

  private validateOutlierDetection(data: WorkoutMetrics): boolean {
    return data.exercises.every(exercise => exercise.sets.length > 0);
  }

  private validateBaselineCalculation(data: WorkoutMetrics): boolean {
    return true; // Always valid after baseline calculation
  }

  private validateImprovementDetection(data: WorkoutMetrics): boolean {
    return true; // Always valid after improvement detection
  }

  private validateValidation(data: WorkoutMetrics): boolean {
    return true; // Always valid after validation
  }

  private validateIntegration(data: WorkoutMetrics): boolean {
    return true; // Always valid after integration
  }

  // ==============================================================================
  // ERROR HANDLERS
  // ==============================================================================

  private handleDataIngestionError(error: Error, data: any): void {
    console.error('Data ingestion error:', error);
    this.recordError('data_ingestion', error, data);
  }

  private handleDataCleaningError(error: Error, data: any): void {
    console.error('Data cleaning error:', error);
    this.recordError('data_cleaning', error, data);
  }

  private handleFeatureExtractionError(error: Error, data: any): void {
    console.error('Feature extraction error:', error);
    this.recordError('feature_extraction', error, data);
  }

  private handleOutlierDetectionError(error: Error, data: any): void {
    console.error('Outlier detection error:', error);
    this.recordError('outlier_detection', error, data);
  }

  private handleBaselineCalculationError(error: Error, data: any): void {
    console.error('Baseline calculation error:', error);
    this.recordError('baseline_calculation', error, data);
  }

  private handleImprovementDetectionError(error: Error, data: any): void {
    console.error('Improvement detection error:', error);
    this.recordError('improvement_detection', error, data);
  }

  private handleValidationError(error: Error, data: any): void {
    console.error('Validation error:', error);
    this.recordError('validation', error, data);
  }

  private handleIntegrationError(error: Error, data: any): void {
    console.error('Integration error:', error);
    this.recordError('integration', error, data);
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  private calculateDataQuality(data: WorkoutMetrics): number {
    const metrics: DataQualityMetrics = {
      completeness: this.calculateCompleteness(data),
      accuracy: this.calculateAccuracy(data),
      consistency: this.calculateConsistency(data),
      timeliness: this.calculateTimeliness(data),
      validity: this.calculateValidity(data),
      overall: 0,
    };

    metrics.overall = (
      metrics.completeness * 0.3 +
      metrics.accuracy * 0.25 +
      metrics.consistency * 0.2 +
      metrics.timeliness * 0.15 +
      metrics.validity * 0.1
    );

    return metrics.overall;
  }

  private calculateCompleteness(data: WorkoutMetrics): number {
    const requiredFields = [
      data.workout_id, data.user_id, data.timestamp, data.exercises,
      data.duration, data.category, data.difficulty
    ];
    
    // const completedFields = ...; // Quick fix: commented unused variable
    return completedFields / requiredFields.length;
  }

  private calculateAccuracy(data: WorkoutMetrics): number {
    // Check for reasonable values
    const accuracyChecks = [
      data.duration > 0 && data.duration < 480, // 0-8 hours
      data.exercises.length > 0 && data.exercises.length < 50,
      data.exercises.every(ex => ex.sets.length > 0 && ex.sets.length < 20),
      data.exercises.every(ex => ex.sets.every(set => set.weight >= 0 && set.reps >= 0)),
    ];

    // const passedChecks = ...; // Quick fix: commented unused variable
    return passedChecks / accuracyChecks.length;
  }

  private calculateConsistency(data: WorkoutMetrics): number {
    // Check for consistency in exercise data
    const consistencyChecks = [
      data.exercises.every(ex => ex.sets.every(set => set.set_number > 0)),
      data.exercises.every(ex => ex.sets.every(set => set.rpe >= 1 && set.rpe <= 10)),
      data.exercises.every(ex => ex.sets.every(set => set.form_quality >= 1 && set.form_quality <= 10)),
    ];

    // const passedChecks = ...; // Quick fix: commented unused variable
    return passedChecks / consistencyChecks.length;
  }

  private calculateTimeliness(data: WorkoutMetrics): number {
    // const now = ...; // Quick fix: commented unused variable
    // const workoutTime = ...; // Quick fix: commented unused variable
    // const timeDiff = ...; // Quick fix: commented unused variable
    // const hoursDiff = ...; // Quick fix: commented unused variable

    // Consider data timely if within 24 hours
    return Math.max(0, 1 - (hoursDiff / 24));
  }

  private calculateValidity(data: WorkoutMetrics): number {
    // Check for valid data types and formats
    const validityChecks = [
      typeof data.workout_id === 'string',
      typeof data.user_id === 'string',
      !isNaN(Date.parse(data.timestamp)),
      Array.isArray(data.exercises),
      typeof data.duration === 'number',
      typeof data.category === 'string',
      ['easy', 'medium', 'hard', 'extreme'].includes(data.difficulty),
    ];

    // const passedChecks = ...; // Quick fix: commented unused variable
    return passedChecks / validityChecks.length;
  }

  private normalizeExerciseName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '_');
  }

  private normalizeExerciseCategory(category: string): string {
    // const normalized = ...; // Quick fix: commented unused variable
    // const categories = ...; // Quick fix: commented unused variable
    return categories.includes(normalized) ? normalized : 'strength';
  }

  private removeOutlierSets(sets: SetMetrics[]): SetMetrics[] {
    if (sets.length < 3) return sets;

    // Calculate z-scores for weight and reps
    // const weights = ...; // Quick fix: commented unused variable
    // const reps = ...; // Quick fix: commented unused variable

    // const weightMean = ...; // Quick fix: commented unused variable
    // const weightStd = ...; // Quick fix: commented unused variable

    // const repsMean = ...; // Quick fix: commented unused variable
    // const repsStd = ...; // Quick fix: commented unused variable

    return sets.filter(set => {
      // const weightZScore = ...; // Quick fix: commented unused variable
      // const repsZScore = ...; // Quick fix: commented unused variable
      
      return weightZScore <= this.config.outlierThreshold && repsZScore <= this.config.outlierThreshold;
    });
  }

  // ==============================================================================
  // CALCULATION METHODS
  // ==============================================================================

  private calculateTotalVolume(exercises: ExerciseMetrics[]): number {
    return exercises.reduce((sum, exercise) => sum + exercise.total_volume, 0);
  }

  private calculateTotalReps(exercises: ExerciseMetrics[]): number {
    return exercises.reduce((sum, exercise) => 
      sum + exercise.sets.reduce((setSum, set) => setSum + set.reps, 0), 0
    );
  }

  private calculateTotalSets(exercises: ExerciseMetrics[]): number {
    return exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  }

  private calculateAverageWeight(exercises: ExerciseMetrics[]): number {
    const allWeights = exercises.flatMap(exercise => 
      exercise.sets.map(set => set.weight)
    ).filter(weight => weight > 0);

    if (allWeights.length === 0) return 0;
    return allWeights.reduce((sum, weight) => sum + weight, 0) / allWeights.length;
  }

  private calculateMaxWeight(exercises: ExerciseMetrics[]): number {
    return Math.max(...exercises.flatMap(exercise => 
      exercise.sets.map(set => set.weight)
    ), 0);
  }

  private calculateExerciseVolume(sets: SetMetrics[]): number {
    return sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  }

  private calculateMaxReps(sets: SetMetrics[]): number {
    return Math.max(...sets.map(set => set.reps), 0);
  }

  private calculateAverageReps(sets: SetMetrics[]): number {
    if (sets.length === 0) return 0;
    return sets.reduce((sum, set) => sum + set.reps, 0) / sets.length;
  }

  private calculateIntensityScore(sets: SetMetrics[]): number {
    if (sets.length === 0) return 0;
    
    // const totalVolume = ...; // Quick fix: commented unused variable
    // const averageRPE = ...; // Quick fix: commented unused variable
    
    return (totalVolume * averageRPE) / 100;
  }

  // ==============================================================================
  // PERFORMANCE MONITORING
  // ==============================================================================

  private recordPerformanceMetric(processingTime: number): void {
    this.performanceMetrics.processingTimes.push(processingTime);
    
    if (this.performanceMetrics.processingTimes.length > 100) {
      this.performanceMetrics.processingTimes.shift();
    }
  }

  private recordError(stage: string, error: Error, data: any): void {
    const pipelineError: PipelineError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      stage,
      error,
      data,
      severity: 'medium',
      resolved: false,
    };

    this.processingMetrics.errors.push(pipelineError);
    
    if (this.processingMetrics.errors.length > 100) {
      this.processingMetrics.errors.shift();
    }
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  public getPipelineMetrics(): PipelineMetrics {
    return { ...this.processingMetrics };
  }

  public getPerformanceMetrics(): {
    averageProcessingTime: number;
    averageMemoryUsage: number;
    averageQualityScore: number;
    errorRate: number;
  } {
    const averageProcessingTime = this.performanceMetrics.processingTimes.length > 0
      ? this.performanceMetrics.processingTimes.reduce((sum, time) => sum + time, 0) / 
        this.performanceMetrics.processingTimes.length
      : 0;

    const averageMemoryUsage = this.performanceMetrics.memoryUsage.length > 0
      ? this.performanceMetrics.memoryUsage.reduce((sum, usage) => sum + usage, 0) / 
        this.performanceMetrics.memoryUsage.length
      : 0;

    const averageQualityScore = this.performanceMetrics.qualityScores.length > 0
      ? this.performanceMetrics.qualityScores.reduce((sum, score) => sum + score, 0) / 
        this.performanceMetrics.qualityScores.length
      : 0;

    const errorRate = this.processingMetrics.totalProcessed > 0
      ? this.processingMetrics.failedProcessed / this.processingMetrics.totalProcessed
      : 0;

    return {
      averageProcessingTime,
      averageMemoryUsage,
      averageQualityScore,
      errorRate,
    };
  }

  public updateConfiguration(newConfig: Partial<DataPipelineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfiguration(): DataPipelineConfig {
    return { ...this.config };
  }
}
