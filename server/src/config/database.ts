// server/src/config/database.ts
// Database configuration and connection management

import { Pool, PoolClient } from 'pg';
import { config } from './environment';
import { logger } from '@/utils/logger';

class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: config.DATABASE_POOL_SIZE,
      idleTimeoutMillis: config.DATABASE_TIMEOUT,
      connectionTimeoutMillis: config.DATABASE_TIMEOUT,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    this.setupEventHandlers();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', (client: PoolClient) => {
      logger.info('New database client connected');
    });

    this.pool.on('error', (err: Error, client: PoolClient) => {
      logger.error('Unexpected error on idle client', err);
    });

    this.pool.on('acquire', (client: PoolClient) => {
      logger.debug('Client acquired from pool');
    });

    this.pool.on('release', (client: PoolClient) => {
      logger.debug('Client released back to pool');
    });
  }

  public async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      logger.info('Database connected successfully');
      
      // Initialize database schema
      await this.initializeSchema();
      
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  public getPool(): Pool {
    return this.pool;
  }

  public isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  private async initializeSchema(): Promise<void> {
    try {
      const client = await this.pool.connect();
      
      // Create tables if they don't exist
      await this.createTables(client);
      
      client.release();
      logger.info('Database schema initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize database schema:', error);
      throw error;
    }
  }

  private async createTables(client: PoolClient): Promise<void> {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Workout sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_date TIMESTAMP WITH TIME ZONE NOT NULL,
        duration_minutes INTEGER,
        total_volume DECIMAL(10,2),
        total_sets INTEGER,
        total_reps INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Exercises table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        muscle_groups TEXT[],
        equipment VARCHAR(100),
        difficulty_level VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Workout exercises table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
        exercise_id UUID REFERENCES exercises(id),
        exercise_name VARCHAR(255) NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER,
        weight DECIMAL(8,2),
        duration_seconds INTEGER,
        distance_meters DECIMAL(8,2),
        rest_seconds INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // User baselines table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_baselines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        dimension_id VARCHAR(100) NOT NULL,
        dimension_name VARCHAR(255) NOT NULL,
        baseline_value DECIMAL(10,4) NOT NULL,
        standard_deviation DECIMAL(10,4),
        sample_size INTEGER NOT NULL,
        calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true,
        UNIQUE(user_id, dimension_id)
      )
    `);

    // Improvements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS improvements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
        dimension_id VARCHAR(100) NOT NULL,
        dimension_name VARCHAR(255) NOT NULL,
        improvement_percentage DECIMAL(8,4) NOT NULL,
        confidence_score DECIMAL(5,4) NOT NULL,
        statistical_significance DECIMAL(8,6),
        p_value DECIMAL(8,6),
        z_score DECIMAL(8,4),
        effect_size DECIMAL(8,4),
        validation_method VARCHAR(50) NOT NULL,
        ml_prediction JSONB,
        scientific_validation JSONB,
        detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_celebrated BOOLEAN DEFAULT false
      )
    `);

    // Analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        metric_name VARCHAR(255) NOT NULL,
        metric_value DECIMAL(10,4) NOT NULL,
        period_start TIMESTAMP WITH TIME ZONE NOT NULL,
        period_end TIMESTAMP WITH TIME ZONE NOT NULL,
        data_points INTEGER NOT NULL,
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // ML model performance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ml_model_performance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        model_name VARCHAR(255) NOT NULL,
        model_version VARCHAR(50) NOT NULL,
        accuracy DECIMAL(5,4) NOT NULL,
        precision DECIMAL(5,4),
        recall DECIMAL(5,4),
        f1_score DECIMAL(5,4),
        processing_time_ms INTEGER,
        memory_usage_mb INTEGER,
        false_positive_rate DECIMAL(5,4),
        false_negative_rate DECIMAL(5,4),
        tested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // System performance metrics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_performance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(255) NOT NULL,
        metric_value DECIMAL(10,4) NOT NULL,
        unit VARCHAR(50),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        tags JSONB
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, session_date);
      CREATE INDEX IF NOT EXISTS idx_workout_exercises_session ON workout_exercises(workout_session_id);
      CREATE INDEX IF NOT EXISTS idx_user_baselines_user_dimension ON user_baselines(user_id, dimension_id);
      CREATE INDEX IF NOT EXISTS idx_improvements_user_date ON improvements(user_id, detected_at);
      CREATE INDEX IF NOT EXISTS idx_improvements_dimension ON improvements(dimension_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_user_period ON analytics(user_id, period_start, period_end);
      CREATE INDEX IF NOT EXISTS idx_system_performance_timestamp ON system_performance(timestamp);
    `);
  }

  public async executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
    try {
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }

  public async executeTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Export connection function for server startup
export const connectDatabase = async (): Promise<void> => {
  await databaseManager.connect();
};
