// src/context/systems/ImprovementDatabaseSchema.ts
// Database schema for 1% Better system - Improvement tracking and analytics
// Defines tables, indexes, and relationships for scalable improvement data storage

// ==============================================================================
// DATABASE SCHEMA DEFINITIONS
// ==============================================================================

export interface DatabaseSchema {
  tables: TableDefinition[];
  indexes: IndexDefinition[];
  relationships: RelationshipDefinition[];
  constraints: ConstraintDefinition[];
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  primaryKey: string[];
  description: string;
}

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  nullable: boolean;
  defaultValue?: any;
  description: string;
  constraints?: string[];
}

export type ColumnType = 
  | 'VARCHAR(255)' | 'VARCHAR(500)' | 'VARCHAR(1000)' | 'TEXT'
  | 'INTEGER' | 'BIGINT' | 'SMALLINT'
  | 'DECIMAL(10,2)' | 'DECIMAL(10,4)' | 'FLOAT' | 'DOUBLE'
  | 'BOOLEAN' | 'JSON' | 'JSONB'
  | 'TIMESTAMP' | 'DATE' | 'TIME'
  | 'UUID';

export interface IndexDefinition {
  name: string;
  table: string;
  columns: string[];
  type: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
  unique: boolean;
  description: string;
}

export interface RelationshipDefinition {
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
  onDelete: 'CASCADE' | 'SET_NULL' | 'RESTRICT';
  description: string;
}

export interface ConstraintDefinition {
  name: string;
  table: string;
  type: 'CHECK' | 'UNIQUE' | 'FOREIGN_KEY' | 'NOT_NULL';
  definition: string;
  description: string;
}

// ==============================================================================
// SCHEMA IMPLEMENTATION
// ==============================================================================

export const ImprovementDatabaseSchema: DatabaseSchema = {
  tables: [
    // Core improvement tracking table
    {
      name: 'improvements',
      description: 'Stores detected improvements with validation and context data',
      primaryKey: ['id'],
      columns: [
        {
          name: 'id',
          type: 'UUID',
          nullable: false,
          description: 'Unique improvement identifier',
          constraints: ['PRIMARY KEY'],
        },
        {
          name: 'user_id',
          type: 'VARCHAR(255)',
          nullable: false,
          description: 'User who achieved the improvement',
        },
        {
          name: 'dimension',
          type: 'VARCHAR(100)',
          nullable: false,
          description: 'Improvement dimension (strength, endurance, etc.)',
        },
        {
          name: 'detected_at',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'When the improvement was detected',
        },
        {
          name: 'baseline_value',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Baseline performance value',
        },
        {
          name: 'current_value',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Current performance value',
        },
        {
          name: 'improvement_percentage',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Percentage improvement achieved',
        },
        {
          name: 'improvement_magnitude',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Magnitude of improvement (micro, small, medium, large)',
        },
        {
          name: 'confidence_score',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Confidence in the improvement detection (0-1)',
        },
        {
          name: 'statistical_significance',
          type: 'DECIMAL(10,6)',
          nullable: false,
          description: 'Statistical significance (p-value)',
        },
        {
          name: 'validation_method',
          type: 'VARCHAR(100)',
          nullable: false,
          description: 'Method used for validation',
        },
        {
          name: 'validation_status',
          type: 'VARCHAR(50)',
          nullable: false,
          defaultValue: 'pending',
          description: 'Current validation status',
        },
        {
          name: 'workout_context',
          type: 'JSONB',
          nullable: true,
          description: 'Workout context data',
        },
        {
          name: 'character_context',
          type: 'JSONB',
          nullable: true,
          description: 'Character context data',
        },
        {
          name: 'environmental_factors',
          type: 'JSONB',
          nullable: true,
          description: 'Environmental factors data',
        },
        {
          name: 'celebration_triggered',
          type: 'BOOLEAN',
          nullable: false,
          defaultValue: false,
          description: 'Whether celebration was triggered',
        },
        {
          name: 'rewards_granted',
          type: 'JSONB',
          nullable: true,
          description: 'Rewards granted for the improvement',
        },
        {
          name: 'character_experience_bonus',
          type: 'INTEGER',
          nullable: false,
          defaultValue: 0,
          description: 'Experience bonus granted to characters',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record creation timestamp',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record last update timestamp',
        },
      ],
    },

    // User baselines table
    {
      name: 'user_baselines',
      description: 'Stores calculated baselines for each user and dimension',
      primaryKey: ['id'],
      columns: [
        {
          name: 'id',
          type: 'UUID',
          nullable: false,
          description: 'Unique baseline identifier',
          constraints: ['PRIMARY KEY'],
        },
        {
          name: 'user_id',
          type: 'VARCHAR(255)',
          nullable: false,
          description: 'User identifier',
        },
        {
          name: 'dimension',
          type: 'VARCHAR(100)',
          nullable: false,
          description: 'Improvement dimension',
        },
        {
          name: 'calculated_at',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'When baseline was calculated',
        },
        {
          name: 'data_points',
          type: 'INTEGER',
          nullable: false,
          description: 'Number of data points used',
        },
        {
          name: 'confidence_interval',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Confidence interval used',
        },
        {
          name: 'mean',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Mean baseline value',
        },
        {
          name: 'median',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Median baseline value',
        },
        {
          name: 'standard_deviation',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Standard deviation',
        },
        {
          name: 'variance',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Variance',
        },
        {
          name: 'trend_direction',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Trend direction (improving, declining, stable)',
        },
        {
          name: 'trend_strength',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Strength of the trend (0-1)',
        },
        {
          name: 'seasonal_factors',
          type: 'JSONB',
          nullable: true,
          description: 'Seasonal adjustment factors',
        },
        {
          name: 'minimum_data_points',
          type: 'INTEGER',
          nullable: false,
          description: 'Minimum data points required',
        },
        {
          name: 'data_quality_score',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Quality score of the data (0-1)',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record creation timestamp',
        },
      ],
    },

    // Workout metrics table
    {
      name: 'workout_metrics',
      description: 'Stores processed workout data for improvement analysis',
      primaryKey: ['id'],
      columns: [
        {
          name: 'id',
          type: 'UUID',
          nullable: false,
          description: 'Unique workout metrics identifier',
          constraints: ['PRIMARY KEY'],
        },
        {
          name: 'workout_id',
          type: 'VARCHAR(255)',
          nullable: false,
          description: 'Original workout identifier',
        },
        {
          name: 'user_id',
          type: 'VARCHAR(255)',
          nullable: false,
          description: 'User identifier',
        },
        {
          name: 'timestamp',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Workout timestamp',
        },
        {
          name: 'duration',
          type: 'INTEGER',
          nullable: false,
          description: 'Workout duration in minutes',
        },
        {
          name: 'category',
          type: 'VARCHAR(100)',
          nullable: false,
          description: 'Workout category',
        },
        {
          name: 'difficulty',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Workout difficulty level',
        },
        {
          name: 'total_volume',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Total workout volume',
        },
        {
          name: 'total_reps',
          type: 'INTEGER',
          nullable: false,
          description: 'Total repetitions',
        },
        {
          name: 'total_sets',
          type: 'INTEGER',
          nullable: false,
          description: 'Total sets',
        },
        {
          name: 'average_weight',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Average weight used',
        },
        {
          name: 'max_weight',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Maximum weight used',
        },
        {
          name: 'cardio_data',
          type: 'JSONB',
          nullable: true,
          description: 'Cardio-specific data',
        },
        {
          name: 'perceived_exertion',
          type: 'INTEGER',
          nullable: true,
          description: 'Perceived exertion level (1-10)',
        },
        {
          name: 'energy_level',
          type: 'INTEGER',
          nullable: true,
          description: 'Energy level (1-10)',
        },
        {
          name: 'motivation_level',
          type: 'INTEGER',
          nullable: true,
          description: 'Motivation level (1-10)',
        },
        {
          name: 'sleep_hours',
          type: 'DECIMAL(4,1)',
          nullable: true,
          description: 'Hours of sleep',
        },
        {
          name: 'stress_level',
          type: 'INTEGER',
          nullable: true,
          description: 'Stress level (1-10)',
        },
        {
          name: 'nutrition_quality',
          type: 'INTEGER',
          nullable: true,
          description: 'Nutrition quality (1-10)',
        },
        {
          name: 'recovery_days',
          type: 'INTEGER',
          nullable: true,
          description: 'Days since last workout',
        },
        {
          name: 'data_quality_score',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Quality score of the data (0-1)',
        },
        {
          name: 'processed_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'When data was processed',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record creation timestamp',
        },
      ],
    },

    // Exercise metrics table
    {
      name: 'exercise_metrics',
      description: 'Stores individual exercise metrics within workouts',
      primaryKey: ['id'],
      columns: [
        {
          name: 'id',
          type: 'UUID',
          nullable: false,
          description: 'Unique exercise metrics identifier',
          constraints: ['PRIMARY KEY'],
        },
        {
          name: 'workout_metrics_id',
          type: 'UUID',
          nullable: false,
          description: 'Reference to workout metrics',
        },
        {
          name: 'name',
          type: 'VARCHAR(255)',
          nullable: false,
          description: 'Exercise name',
        },
        {
          name: 'category',
          type: 'VARCHAR(100)',
          nullable: false,
          description: 'Exercise category',
        },
        {
          name: 'muscle_groups',
          type: 'JSONB',
          nullable: true,
          description: 'Target muscle groups',
        },
        {
          name: 'total_volume',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Total exercise volume',
        },
        {
          name: 'max_weight',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Maximum weight used',
        },
        {
          name: 'max_reps',
          type: 'INTEGER',
          nullable: false,
          description: 'Maximum repetitions',
        },
        {
          name: 'form_quality',
          type: 'INTEGER',
          nullable: false,
          description: 'Form quality score (1-10)',
        },
        {
          name: 'technique_notes',
          type: 'JSONB',
          nullable: true,
          description: 'Technique notes and observations',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record creation timestamp',
        },
      ],
    },

    // Set metrics table
    {
      name: 'set_metrics',
      description: 'Stores individual set metrics within exercises',
      primaryKey: ['id'],
      columns: [
        {
          name: 'id',
          type: 'UUID',
          nullable: false,
          description: 'Unique set metrics identifier',
          constraints: ['PRIMARY KEY'],
        },
        {
          name: 'exercise_metrics_id',
          type: 'UUID',
          nullable: false,
          description: 'Reference to exercise metrics',
        },
        {
          name: 'set_number',
          type: 'INTEGER',
          nullable: false,
          description: 'Set number within exercise',
        },
        {
          name: 'weight',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Weight used',
        },
        {
          name: 'reps',
          type: 'INTEGER',
          nullable: false,
          description: 'Repetitions performed',
        },
        {
          name: 'rest_time',
          type: 'INTEGER',
          nullable: false,
          description: 'Rest time in seconds',
        },
        {
          name: 'rpe',
          type: 'INTEGER',
          nullable: false,
          description: 'Rate of perceived exertion (1-10)',
        },
        {
          name: 'form_quality',
          type: 'INTEGER',
          nullable: false,
          description: 'Form quality score (1-10)',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record creation timestamp',
        },
      ],
    },

    // Analytics table
    {
      name: 'improvement_analytics',
      description: 'Stores aggregated analytics data for users',
      primaryKey: ['id'],
      columns: [
        {
          name: 'id',
          type: 'UUID',
          nullable: false,
          description: 'Unique analytics identifier',
          constraints: ['PRIMARY KEY'],
        },
        {
          name: 'user_id',
          type: 'VARCHAR(255)',
          nullable: false,
          description: 'User identifier',
        },
        {
          name: 'period',
          type: 'VARCHAR(50)',
          nullable: false,
          description: 'Analytics period (daily, weekly, monthly, all_time)',
        },
        {
          name: 'total_improvements',
          type: 'INTEGER',
          nullable: false,
          description: 'Total improvements detected',
        },
        {
          name: 'improvements_by_dimension',
          type: 'JSONB',
          nullable: false,
          description: 'Improvements grouped by dimension',
        },
        {
          name: 'average_improvement_percentage',
          type: 'DECIMAL(10,4)',
          nullable: false,
          description: 'Average improvement percentage',
        },
        {
          name: 'largest_improvement',
          type: 'JSONB',
          nullable: true,
          description: 'Largest improvement details',
        },
        {
          name: 'detection_accuracy',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Detection accuracy (0-1)',
        },
        {
          name: 'false_positives',
          type: 'INTEGER',
          nullable: false,
          description: 'Number of false positives',
        },
        {
          name: 'false_negatives',
          type: 'INTEGER',
          nullable: false,
          description: 'Number of false negatives',
        },
        {
          name: 'validation_success_rate',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Validation success rate (0-1)',
        },
        {
          name: 'average_processing_time',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Average processing time in milliseconds',
        },
        {
          name: 'memory_usage',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Memory usage in MB',
        },
        {
          name: 'system_performance_score',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Overall system performance score (0-1)',
        },
        {
          name: 'calculated_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'When analytics were calculated',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record creation timestamp',
        },
      ],
    },

    // System performance table
    {
      name: 'system_performance',
      description: 'Stores system performance metrics over time',
      primaryKey: ['id'],
      columns: [
        {
          name: 'id',
          type: 'UUID',
          nullable: false,
          description: 'Unique performance record identifier',
          constraints: ['PRIMARY KEY'],
        },
        {
          name: 'timestamp',
          type: 'TIMESTAMP',
          nullable: false,
          description: 'Performance measurement timestamp',
        },
        {
          name: 'average_processing_time',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Average processing time in milliseconds',
        },
        {
          name: 'memory_usage',
          type: 'DECIMAL(10,2)',
          nullable: false,
          description: 'Memory usage in MB',
        },
        {
          name: 'accuracy_score',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Detection accuracy score (0-1)',
        },
        {
          name: 'error_rate',
          type: 'DECIMAL(5,4)',
          nullable: false,
          description: 'Error rate (0-1)',
        },
        {
          name: 'active_requests',
          type: 'INTEGER',
          nullable: false,
          description: 'Number of active requests',
        },
        {
          name: 'queue_size',
          type: 'INTEGER',
          nullable: false,
          description: 'Processing queue size',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Record creation timestamp',
        },
      ],
    },
  ],

  indexes: [
    // Improvements table indexes
    {
      name: 'idx_improvements_user_id',
      table: 'improvements',
      columns: ['user_id'],
      type: 'BTREE',
      unique: false,
      description: 'Index on user_id for fast user lookups',
    },
    {
      name: 'idx_improvements_dimension',
      table: 'improvements',
      columns: ['dimension'],
      type: 'BTREE',
      unique: false,
      description: 'Index on dimension for fast dimension filtering',
    },
    {
      name: 'idx_improvements_detected_at',
      table: 'improvements',
      columns: ['detected_at'],
      type: 'BTREE',
      unique: false,
      description: 'Index on detected_at for time-based queries',
    },
    {
      name: 'idx_improvements_user_dimension',
      table: 'improvements',
      columns: ['user_id', 'dimension'],
      type: 'BTREE',
      unique: false,
      description: 'Composite index for user and dimension queries',
    },
    {
      name: 'idx_improvements_validation_status',
      table: 'improvements',
      columns: ['validation_status'],
      type: 'BTREE',
      unique: false,
      description: 'Index on validation status for filtering',
    },

    // User baselines table indexes
    {
      name: 'idx_user_baselines_user_id',
      table: 'user_baselines',
      columns: ['user_id'],
      type: 'BTREE',
      unique: false,
      description: 'Index on user_id for fast user lookups',
    },
    {
      name: 'idx_user_baselines_dimension',
      table: 'user_baselines',
      columns: ['dimension'],
      type: 'BTREE',
      unique: false,
      description: 'Index on dimension for fast dimension filtering',
    },
    {
      name: 'idx_user_baselines_user_dimension',
      table: 'user_baselines',
      columns: ['user_id', 'dimension'],
      type: 'BTREE',
      unique: true,
      description: 'Unique composite index for user and dimension',
    },
    {
      name: 'idx_user_baselines_calculated_at',
      table: 'user_baselines',
      columns: ['calculated_at'],
      type: 'BTREE',
      unique: false,
      description: 'Index on calculated_at for time-based queries',
    },

    // Workout metrics table indexes
    {
      name: 'idx_workout_metrics_user_id',
      table: 'workout_metrics',
      columns: ['user_id'],
      type: 'BTREE',
      unique: false,
      description: 'Index on user_id for fast user lookups',
    },
    {
      name: 'idx_workout_metrics_timestamp',
      table: 'workout_metrics',
      columns: ['timestamp'],
      type: 'BTREE',
      unique: false,
      description: 'Index on timestamp for time-based queries',
    },
    {
      name: 'idx_workout_metrics_workout_id',
      table: 'workout_metrics',
      columns: ['workout_id'],
      type: 'BTREE',
      unique: true,
      description: 'Unique index on workout_id',
    },
    {
      name: 'idx_workout_metrics_user_timestamp',
      table: 'workout_metrics',
      columns: ['user_id', 'timestamp'],
      type: 'BTREE',
      unique: false,
      description: 'Composite index for user and timestamp queries',
    },

    // Exercise metrics table indexes
    {
      name: 'idx_exercise_metrics_workout_id',
      table: 'exercise_metrics',
      columns: ['workout_metrics_id'],
      type: 'BTREE',
      unique: false,
      description: 'Index on workout_metrics_id for joins',
    },
    {
      name: 'idx_exercise_metrics_name',
      table: 'exercise_metrics',
      columns: ['name'],
      type: 'BTREE',
      unique: false,
      description: 'Index on exercise name for filtering',
    },
    {
      name: 'idx_exercise_metrics_category',
      table: 'exercise_metrics',
      columns: ['category'],
      type: 'BTREE',
      unique: false,
      description: 'Index on exercise category for filtering',
    },

    // Set metrics table indexes
    {
      name: 'idx_set_metrics_exercise_id',
      table: 'set_metrics',
      columns: ['exercise_metrics_id'],
      type: 'BTREE',
      unique: false,
      description: 'Index on exercise_metrics_id for joins',
    },
    {
      name: 'idx_set_metrics_set_number',
      table: 'set_metrics',
      columns: ['set_number'],
      type: 'BTREE',
      unique: false,
      description: 'Index on set number for ordering',
    },

    // Analytics table indexes
    {
      name: 'idx_analytics_user_id',
      table: 'improvement_analytics',
      columns: ['user_id'],
      type: 'BTREE',
      unique: false,
      description: 'Index on user_id for fast user lookups',
    },
    {
      name: 'idx_analytics_period',
      table: 'improvement_analytics',
      columns: ['period'],
      type: 'BTREE',
      unique: false,
      description: 'Index on period for filtering',
    },
    {
      name: 'idx_analytics_user_period',
      table: 'improvement_analytics',
      columns: ['user_id', 'period'],
      type: 'BTREE',
      unique: false,
      description: 'Composite index for user and period queries',
    },

    // System performance table indexes
    {
      name: 'idx_performance_timestamp',
      table: 'system_performance',
      columns: ['timestamp'],
      type: 'BTREE',
      unique: false,
      description: 'Index on timestamp for time-based queries',
    },
  ],

  relationships: [
    {
      name: 'workout_metrics_to_exercise_metrics',
      fromTable: 'workout_metrics',
      fromColumn: 'id',
      toTable: 'exercise_metrics',
      toColumn: 'workout_metrics_id',
      type: 'ONE_TO_MANY',
      onDelete: 'CASCADE',
      description: 'Workout metrics to exercise metrics relationship',
    },
    {
      name: 'exercise_metrics_to_set_metrics',
      fromTable: 'exercise_metrics',
      fromColumn: 'id',
      toTable: 'set_metrics',
      toColumn: 'exercise_metrics_id',
      type: 'ONE_TO_MANY',
      onDelete: 'CASCADE',
      description: 'Exercise metrics to set metrics relationship',
    },
    {
      name: 'improvements_to_workout_metrics',
      fromTable: 'improvements',
      fromColumn: 'workout_context->workout_id',
      toTable: 'workout_metrics',
      toColumn: 'workout_id',
      type: 'MANY_TO_ONE',
      onDelete: 'SET_NULL',
      description: 'Improvements to workout metrics relationship',
    },
  ],

  constraints: [
    {
      name: 'chk_improvement_percentage_positive',
      table: 'improvements',
      type: 'CHECK',
      definition: 'improvement_percentage >= 0',
      description: 'Ensure improvement percentage is non-negative',
    },
    {
      name: 'chk_confidence_score_range',
      table: 'improvements',
      type: 'CHECK',
      definition: 'confidence_score >= 0 AND confidence_score <= 1',
      description: 'Ensure confidence score is between 0 and 1',
    },
    {
      name: 'chk_validation_status_values',
      table: 'improvements',
      type: 'CHECK',
      definition: "validation_status IN ('pending', 'validated', 'rejected', 'needs_review')",
      description: 'Ensure validation status has valid values',
    },
    {
      name: 'chk_improvement_magnitude_values',
      table: 'improvements',
      type: 'CHECK',
      definition: "improvement_magnitude IN ('micro', 'small', 'medium', 'large')",
      description: 'Ensure improvement magnitude has valid values',
    },
    {
      name: 'chk_baseline_data_points_positive',
      table: 'user_baselines',
      type: 'CHECK',
      definition: 'data_points > 0',
      description: 'Ensure data points is positive',
    },
    {
      name: 'chk_baseline_confidence_interval_range',
      table: 'user_baselines',
      type: 'CHECK',
      definition: 'confidence_interval > 0 AND confidence_interval <= 1',
      description: 'Ensure confidence interval is between 0 and 1',
    },
    {
      name: 'chk_workout_duration_positive',
      table: 'workout_metrics',
      type: 'CHECK',
      definition: 'duration > 0',
      description: 'Ensure workout duration is positive',
    },
    {
      name: 'chk_exercise_form_quality_range',
      table: 'exercise_metrics',
      type: 'CHECK',
      definition: 'form_quality >= 1 AND form_quality <= 10',
      description: 'Ensure form quality is between 1 and 10',
    },
    {
      name: 'chk_set_rpe_range',
      table: 'set_metrics',
      type: 'CHECK',
      definition: 'rpe >= 1 AND rpe <= 10',
      description: 'Ensure RPE is between 1 and 10',
    },
    {
      name: 'chk_set_form_quality_range',
      table: 'set_metrics',
      type: 'CHECK',
      definition: 'form_quality >= 1 AND form_quality <= 10',
      description: 'Ensure set form quality is between 1 and 10',
    },
    {
      name: 'chk_analytics_period_values',
      table: 'improvement_analytics',
      type: 'CHECK',
      definition: "period IN ('daily', 'weekly', 'monthly', 'all_time')",
      description: 'Ensure analytics period has valid values',
    },
  ],
};

// ==============================================================================
// DATABASE UTILITIES
// ==============================================================================

export class DatabaseSchemaManager {
  private static instance: DatabaseSchemaManager;
  private schema: DatabaseSchema;

  private constructor() {
    this.schema = ImprovementDatabaseSchema;
  }

  public static getInstance(): DatabaseSchemaManager {
    if (!DatabaseSchemaManager.instance) {
      DatabaseSchemaManager.instance = new DatabaseSchemaManager();
    }
    return DatabaseSchemaManager.instance;
  }

  public getSchema(): DatabaseSchema {
    return this.schema;
  }

  public generateCreateTableSQL(): string[] {
    return this.schema.tables.map(table => this.generateTableSQL(table));
  }

  public generateCreateIndexSQL(): string[] {
    return this.schema.indexes.map(index => this.generateIndexSQL(index));
  }

  public generateCreateConstraintSQL(): string[] {
    return this.schema.constraints.map(constraint => this.generateConstraintSQL(constraint));
  }

  private generateTableSQL(table: TableDefinition): string {
    const columns = table.columns.map(col => {
      let sql = `${col.name} ${col.type}`;
      if (!col.nullable) sql += ' NOT NULL';
      if (col.defaultValue !== undefined) {
        if (typeof col.defaultValue === 'string') {
          sql += ` DEFAULT '${col.defaultValue}'`;
        } else {
          sql += ` DEFAULT ${col.defaultValue}`;
        }
      }
      return sql;
    }).join(',\n  ');

    return `CREATE TABLE ${table.name} (
  ${columns},
  PRIMARY KEY (${table.primaryKey.join(', ')})
);`;
  }

  private generateIndexSQL(index: IndexDefinition): string {
    // const unique = ...; // Quick fix: commented unused variable
    return `CREATE ${unique}INDEX ${index.name} ON ${index.table} USING ${index.type} (${index.columns.join(', ')});`;
  }

  private generateConstraintSQL(constraint: ConstraintDefinition): string {
    return `ALTER TABLE ${constraint.table} ADD CONSTRAINT ${constraint.name} ${constraint.type} (${constraint.definition});`;
  }
}
