// server/src/utils/logger.ts
// Logging utility for Gymmy's Phase 4 Backend
// Provides comprehensive logging with different levels and formats

import winston from 'winston';
import { config } from '@/config/environment';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'gymmy-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Add request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Performance logging
export const performanceLogger = (operation: string, duration: number, metadata?: any) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    ...metadata
  };
  
  if (duration > 1000) {
    logger.warn('Slow Operation', logData);
  } else if (duration > 500) {
    logger.info('Performance', logData);
  } else {
    logger.debug('Performance', logData);
  }
};

// ML-specific logging
export const mlLogger = {
  modelLoad: (modelName: string, duration: number) => {
    logger.info('ML Model Loaded', { modelName, duration: `${duration}ms` });
  },
  
  prediction: (modelName: string, duration: number, accuracy: number, confidence: number) => {
    logger.info('ML Prediction', {
      modelName,
      duration: `${duration}ms`,
      accuracy: `${(accuracy * 100).toFixed(2)}%`,
      confidence: `${(confidence * 100).toFixed(2)}%`
    });
  },
  
  improvementDetected: (userId: string, dimension: string, improvement: number, confidence: number) => {
    logger.info('Improvement Detected', {
      userId,
      dimension,
      improvement: `${(improvement * 100).toFixed(2)}%`,
      confidence: `${(confidence * 100).toFixed(2)}%`
    });
  },
  
  baselineUpdate: (userId: string, dimension: string, oldValue: number, newValue: number) => {
    logger.info('Baseline Updated', {
      userId,
      dimension,
      oldValue,
      newValue,
      change: `${(((newValue - oldValue) / oldValue) * 100).toFixed(2)}%`
    });
  },
  
  error: (operation: string, error: Error, metadata?: any) => {
    logger.error('ML Error', {
      operation,
      error: error.message,
      stack: error.stack,
      ...metadata
    });
  }
};

// Database logging
export const dbLogger = {
  query: (query: string, duration: number, params?: any[]) => {
    logger.debug('Database Query', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      params: params ? params.length : 0
    });
  },
  
  connection: (action: string, duration?: number) => {
    logger.info('Database Connection', { action, duration: duration ? `${duration}ms` : undefined });
  },
  
  error: (operation: string, error: Error) => {
    logger.error('Database Error', {
      operation,
      error: error.message,
      stack: error.stack
    });
  }
};

// Cache logging
export const cacheLogger = {
  hit: (key: string, duration: number) => {
    logger.debug('Cache Hit', { key, duration: `${duration}ms` });
  },
  
  miss: (key: string) => {
    logger.debug('Cache Miss', { key });
  },
  
  set: (key: string, ttl: number) => {
    logger.debug('Cache Set', { key, ttl: `${ttl}s` });
  },
  
  error: (operation: string, error: Error) => {
    logger.error('Cache Error', {
      operation,
      error: error.message
    });
  }
};

// API logging
export const apiLogger = {
  request: (endpoint: string, method: string, userId?: string) => {
    logger.info('API Request', { endpoint, method, userId });
  },
  
  response: (endpoint: string, statusCode: number, duration: number) => {
    const logData = { endpoint, statusCode, duration: `${duration}ms` };
    
    if (statusCode >= 400) {
      logger.warn('API Response', logData);
    } else {
      logger.info('API Response', logData);
    }
  },
  
  error: (endpoint: string, error: Error, userId?: string) => {
    logger.error('API Error', {
      endpoint,
      error: error.message,
      userId
    });
  }
};

// Security logging
export const securityLogger = {
  authentication: (userId: string, success: boolean, ip: string) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication', { userId, success, ip });
  },
  
  authorization: (userId: string, resource: string, allowed: boolean) => {
    const level = allowed ? 'info' : 'warn';
    logger[level]('Authorization', { userId, resource, allowed });
  },
  
  rateLimit: (ip: string, endpoint: string, limit: number) => {
    logger.warn('Rate Limit Exceeded', { ip, endpoint, limit });
  },
  
  suspicious: (ip: string, action: string, details: any) => {
    logger.warn('Suspicious Activity', { ip, action, details });
  }
};

// System monitoring logging
export const systemLogger = {
  startup: (version: string, environment: string) => {
    logger.info('System Startup', { version, environment });
  },
  
  shutdown: (reason: string) => {
    logger.info('System Shutdown', { reason });
  },
  
  health: (status: string, metrics: any) => {
    logger.info('System Health', { status, metrics });
  },
  
  performance: (metric: string, value: number, unit: string) => {
    logger.info('System Performance', { metric, value, unit });
  },
  
  memory: (used: number, total: number, percentage: number) => {
    const level = percentage > 80 ? 'warn' : 'info';
    logger[level]('Memory Usage', {
      used: `${used}MB`,
      total: `${total}MB`,
      percentage: `${percentage.toFixed(1)}%`
    });
  },
  
  cpu: (usage: number) => {
    const level = usage > 80 ? 'warn' : 'info';
    logger[level]('CPU Usage', { usage: `${usage.toFixed(1)}%` });
  }
};

export { logger };
