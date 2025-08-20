// server/src/routes/improvements.ts
// Improvement Detection API Routes for Gymmy's Phase 4: 1% Better Core System
// Provides RESTful endpoints for ML-powered improvement detection

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { MLService } from '@/services/MLService';
import { ImprovementService } from '@/services/ImprovementService';
import { logger } from '@/utils/logger';
import { authenticateUser } from '@/middleware/auth';
import { rateLimiter } from '@/middleware/rateLimiter';
import { validateRequest } from '@/middleware/validation';

const router = Router();

// ==============================================================================
// IMPROVEMENT DETECTION ENDPOINTS
// ==============================================================================

/**
 * @route POST /api/improvements/detect
 * @desc Detect improvements from workout data using ML
 * @access Private
 */
router.post('/detect',
  authenticateUser,
  rateLimiter('improvement-detection', 100, 15 * 60 * 1000), // 100 requests per 15 minutes
  [
    body('workout_data').isObject().notEmpty(),
    body('workout_data.workout_id').isString().notEmpty(),
    body('workout_data.session_date').isISO8601(),
    body('workout_data.exercises').isArray().notEmpty(),
    body('options.enable_real_time').optional().isBoolean(),
    body('options.include_predictions').optional().isBoolean(),
    body('options.validation_method').optional().isIn(['statistical', 'scientific', 'peer', 'consistency']),
    body('options.confidence_threshold').optional().isFloat({ min: 0, max: 1 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { workout_data, options = {} } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Improvement detection request from user ${userId}`);

      const mlService = MLService.getInstance();
      const result = await mlService.processWorkoutData(workout_data, userId, options);

      // Emit real-time update if enabled
      if (options.enable_real_time && req.app.get('io')) {
        req.app.get('io').to(`user-${userId}`).emit('improvement-detected', {
          improvements: result.improvements,
          processingTime: result.processingTime,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        data: {
          improvements: result.improvements,
          predictions: result.predictions,
          processing_metadata: {
            request_id: result.requestId,
            processing_time: result.processingTime,
            confidence: result.confidence,
            data_quality: result.metadata.dataQuality,
            model_accuracy: result.metadata.modelAccuracy,
            cache_hit: result.metadata.cacheHit,
          }
        },
        message: `Detected ${result.improvements.length} improvements`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Improvement detection error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to detect improvements',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/improvements/user/:userId
 * @desc Get user's improvement history
 * @access Private
 */
router.get('/user/:userId',
  authenticateUser,
  rateLimiter('improvement-history', 200, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('dimension').optional().isString(),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { dimension, start_date, end_date, limit = 50, offset = 0 } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const improvementService = ImprovementService.getInstance();
      const improvements = await improvementService.getUserImprovements(
        userId,
        {
          dimension: dimension as string,
          startDate: start_date ? new Date(start_date as string) : undefined,
          endDate: end_date ? new Date(end_date as string) : undefined,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      );

      res.status(200).json({
        success: true,
        data: {
          improvements,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: improvements.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get user improvements error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve improvements',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route POST /api/improvements/baselines/calculate
 * @desc Calculate or update user baselines
 * @access Private
 */
router.post('/baselines/calculate',
  authenticateUser,
  rateLimiter('baseline-calculation', 10, 60 * 60 * 1000), // 10 requests per hour
  [
    body('user_id').isUUID(),
    body('dimension_ids').optional().isArray(),
    body('time_period').optional().isIn(['week', 'month', 'quarter', 'year']),
    body('force_recalculation').optional().isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { user_id, dimension_ids, time_period = 'month', force_recalculation = false } = req.body;

      // Verify user can access this data
      if (req.user?.id !== user_id && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const improvementService = ImprovementService.getInstance();
      const baselines = await improvementService.calculateUserBaselines(
        user_id,
        {
          dimensionIds: dimension_ids,
          timePeriod: time_period,
          forceRecalculation: force_recalculation
        }
      );

      res.status(200).json({
        success: true,
        data: {
          baselines,
          calculation_metadata: {
            user_id,
            time_period,
            dimensions_calculated: Object.keys(baselines).length,
            calculation_time: new Date().toISOString()
          }
        },
        message: `Calculated baselines for ${Object.keys(baselines).length} dimensions`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Baseline calculation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate baselines',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/improvements/baselines/user/:userId
 * @desc Get user's current baselines
 * @access Private
 */
router.get('/baselines/user/:userId',
  authenticateUser,
  rateLimiter('baseline-retrieval', 100, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('dimension_ids').optional().isArray(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { dimension_ids } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const mlService = MLService.getInstance();
      const baselines: any = {};

      const dimensions = dimension_ids ? 
        (dimension_ids as string[]).map(id => ({ id, name: id })) :
        mlService.getImprovementDimensions();

      for (const dimension of dimensions) {
        const baseline = await mlService.getUserBaseline(userId, dimension.id);
        if (baseline) {
          baselines[dimension.id] = baseline;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          baselines,
          user_id: userId,
          total_dimensions: Object.keys(baselines).length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get user baselines error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve baselines',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/improvements/dimensions
 * @desc Get available improvement dimensions
 * @access Public
 */
router.get('/dimensions',
  rateLimiter('dimensions', 1000, 15 * 60 * 1000),
  async (req: Request, res: Response) => {
    try {
      const mlService = MLService.getInstance();
      const dimensions = mlService.getImprovementDimensions();

      res.status(200).json({
        success: true,
        data: {
          dimensions,
          total_dimensions: dimensions.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get dimensions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dimensions',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route POST /api/improvements/batch
 * @desc Process multiple workout sessions for improvement detection
 * @access Private
 */
router.post('/batch',
  authenticateUser,
  rateLimiter('batch-processing', 20, 60 * 60 * 1000), // 20 requests per hour
  [
    body('workout_sessions').isArray({ min: 1, max: 100 }),
    body('workout_sessions.*.workout_id').isString().notEmpty(),
    body('workout_sessions.*.user_id').isUUID(),
    body('workout_sessions.*.session_date').isISO8601(),
    body('options.enable_parallel').optional().isBoolean(),
    body('options.include_predictions').optional().isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { workout_sessions, options = {} } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required',
          timestamp: new Date().toISOString()
        });
      }

      // Verify all sessions belong to the authenticated user
      const unauthorizedSessions = workout_sessions.filter((session: any) => session.user_id !== userId);
      if (unauthorizedSessions.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to some workout sessions',
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Batch improvement detection request from user ${userId} for ${workout_sessions.length} sessions`);

      const mlService = MLService.getInstance();
      const results = [];

      if (options.enable_parallel) {
        // Process in parallel
        const promises = workout_sessions.map(async (session: any) => {
          try {
            return await mlService.processWorkoutData(session, userId, options);
          } catch (error) {
            logger.error(`Error processing session ${session.workout_id}:`, error);
            return { error: error instanceof Error ? error.message : 'Unknown error', session_id: session.workout_id };
          }
        });

        const batchResults = await Promise.allSettled(promises);
        results.push(...batchResults.map((result, index) => ({
          session_id: workout_sessions[index].workout_id,
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        })));
      } else {
        // Process sequentially
        for (const session of workout_sessions) {
          try {
            const result = await mlService.processWorkoutData(session, userId, options);
            results.push({
              session_id: session.workout_id,
              success: true,
              data: result,
              error: null
            });
          } catch (error) {
            logger.error(`Error processing session ${session.workout_id}:`, error);
            results.push({
              session_id: session.workout_id,
              success: false,
              data: null,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }

      const successfulResults = results.filter(r => r.success);
      const failedResults = results.filter(r => !r.success);

      res.status(200).json({
        success: true,
        data: {
          results,
          summary: {
            total_sessions: workout_sessions.length,
            successful: successfulResults.length,
            failed: failedResults.length,
            total_improvements: successfulResults.reduce((sum, r) => sum + (r.data?.improvements?.length || 0), 0)
          }
        },
        message: `Processed ${workout_sessions.length} sessions: ${successfulResults.length} successful, ${failedResults.length} failed`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Batch improvement detection error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process batch',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/improvements/stats/user/:userId
 * @desc Get improvement statistics for a user
 * @access Private
 */
router.get('/stats/user/:userId',
  authenticateUser,
  rateLimiter('improvement-stats', 100, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('period').optional().isIn(['week', 'month', 'quarter', 'year', 'all_time']),
    query('dimension').optional().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { period = 'month', dimension } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const improvementService = ImprovementService.getInstance();
      const stats = await improvementService.getUserImprovementStats(
        userId,
        {
          period: period as string,
          dimension: dimension as string
        }
      );

      res.status(200).json({
        success: true,
        data: {
          stats,
          user_id: userId,
          period,
          dimension
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get improvement stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve improvement statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;
