// server/src/config/environment.ts
// Environment configuration for Gymmy's Phase 4 Backend

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  VERSION: process.env.VERSION || '1.0.0',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/gymmy',
  DATABASE_POOL_SIZE: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  DATABASE_TIMEOUT: parseInt(process.env.DATABASE_TIMEOUT || '30000', 10),
  
  // Redis Configuration
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
  
  // ML Model Configuration
  ML_MODEL_PATH: process.env.ML_MODEL_PATH || './models',
  ML_CACHE_ENABLED: process.env.ML_CACHE_ENABLED === 'true',
  ML_BATCH_SIZE: parseInt(process.env.ML_BATCH_SIZE || '100', 10),
  ML_PROCESSING_TIMEOUT: parseInt(process.env.ML_PROCESSING_TIMEOUT || '5000', 10),
  
  // Performance Configuration
  MAX_CONCURRENT_REQUESTS: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '1000', 10),
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  MEMORY_LIMIT: parseInt(process.env.MEMORY_LIMIT || '512', 10), // MB
  
  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'gymmy-phase4-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  API_KEY_HEADER: process.env.API_KEY_HEADER || 'X-API-Key',
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/gymmy.log',
  
  // Monitoring Configuration
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090', 10),
  
  // Queue Configuration
  QUEUE_REDIS_URL: process.env.QUEUE_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379',
  QUEUE_CONCURRENCY: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  
  // External Services
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  
  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Feature Flags
  ENABLE_REAL_TIME_PROCESSING: process.env.ENABLE_REAL_TIME_PROCESSING === 'true',
  ENABLE_BATCH_PROCESSING: process.env.ENABLE_BATCH_PROCESSING === 'true',
  ENABLE_ML_PREDICTIONS: process.env.ENABLE_ML_PREDICTIONS === 'true',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  
  // ML Model Settings
  ML_ACCURACY_THRESHOLD: parseFloat(process.env.ML_ACCURACY_THRESHOLD || '0.95'),
  ML_CONFIDENCE_THRESHOLD: parseFloat(process.env.ML_CONFIDENCE_THRESHOLD || '0.8'),
  ML_PROCESSING_TIME_LIMIT: parseInt(process.env.ML_PROCESSING_TIME_LIMIT || '1000', 10),
  
  // Improvement Detection Settings
  IMPROVEMENT_THRESHOLD: parseFloat(process.env.IMPROVEMENT_THRESHOLD || '0.01'), // 1%
  BASELINE_CALCULATION_PERIOD: parseInt(process.env.BASELINE_CALCULATION_PERIOD || '30', 10), // days
  MIN_DATA_POINTS: parseInt(process.env.MIN_DATA_POINTS || '10', 10),
  
  // Analytics Settings
  ANALYTICS_RETENTION_DAYS: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365', 10),
  ANALYTICS_BATCH_SIZE: parseInt(process.env.ANALYTICS_BATCH_SIZE || '1000', 10),
  
  // Cache Settings
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600', 10), // seconds
  CACHE_MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  
  // Health Check Settings
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10), // 30 seconds
  HEALTH_CHECK_TIMEOUT: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10), // 5 seconds
} as const;

export type Config = typeof config;
