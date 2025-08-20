// server/src/routes/analytics.ts
// Analytics API Routes for Gymmy's Phase 4: 1% Better Core System
// Provides comprehensive reporting and insights for improvement analytics

import { Router, Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { AnalyticsService } from '@/services/AnalyticsService';
import { MLService } from '@/services/MLService';
import { logger } from '@/utils/logger';
import { authenticateUser } from '@/middleware/auth';
import { rateLimiter } from '@/middleware/rateLimiter';
import { validateRequest } from '@/middleware/validation';

const router = Router();

// ==============================================================================
// ANALYTICS ENDPOINTS
// ==============================================================================

/**
 * @route GET /api/analytics/user/:userId
 * @desc Get comprehensive analytics for a user
 * @access Private
 */
router.get('/user/:userId',
  authenticateUser,
  rateLimiter('user-analytics', 50, 15 * 60 * 1000), // 50 requests per 15 minutes
  [
    param('userId').isUUID(),
    query('period').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'all_time']),
    query('dimensions').optional().isArray(),
    query('include_trends').optional().isBoolean(),
    query('include_predictions').optional().isBoolean(),
    query('include_comparisons').optional().isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { 
        period = 'monthly', 
        dimensions, 
        include_trends = true, 
        include_predictions = true,
        include_comparisons = false 
      } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const analytics = await analyticsService.getUserAnalytics(
        userId,
        {
          period: period as string,
          dimensions: dimensions as string[],
          includeTrends: include_trends === 'true',
          includePredictions: include_predictions === 'true',
          includeComparisons: include_comparisons === 'true'
        }
      );

      res.status(200).json({
        success: true,
        data: {
          analytics,
          user_id: userId,
          period,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get user analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/improvements/user/:userId
 * @desc Get improvement analytics for a user
 * @access Private
 */
router.get('/improvements/user/:userId',
  authenticateUser,
  rateLimiter('improvement-analytics', 100, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('period').optional().isIn(['week', 'month', 'quarter', 'year', 'all_time']),
    query('dimension').optional().isString(),
    query('group_by').optional().isIn(['day', 'week', 'month', 'dimension']),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { period = 'month', dimension, group_by = 'week' } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const improvementAnalytics = await analyticsService.getImprovementAnalytics(
        userId,
        {
          period: period as string,
          dimension: dimension as string,
          groupBy: group_by as string
        }
      );

      res.status(200).json({
        success: true,
        data: {
          improvement_analytics: improvementAnalytics,
          user_id: userId,
          period,
          group_by,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get improvement analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve improvement analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/trends/user/:userId
 * @desc Get trend analysis for a user
 * @access Private
 */
router.get('/trends/user/:userId',
  authenticateUser,
  rateLimiter('trend-analytics', 50, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('period').optional().isIn(['month', 'quarter', 'year', 'all_time']),
    query('dimensions').optional().isArray(),
    query('trend_type').optional().isIn(['linear', 'exponential', 'seasonal', 'all']),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { period = 'month', dimensions, trend_type = 'all' } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const trends = await analyticsService.getTrendAnalysis(
        userId,
        {
          period: period as string,
          dimensions: dimensions as string[],
          trendType: trend_type as string
        }
      );

      res.status(200).json({
        success: true,
        data: {
          trends,
          user_id: userId,
          period,
          trend_type,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get trend analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve trend analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/predictions/user/:userId
 * @desc Get predictive analytics for a user
 * @access Private
 */
router.get('/predictions/user/:userId',
  authenticateUser,
  rateLimiter('prediction-analytics', 30, 15 * 60 * 1000), // 30 requests per 15 minutes
  [
    param('userId').isUUID(),
    query('timeframe').optional().isIn(['1_week', '2_weeks', '1_month', '3_months', '6_months']),
    query('dimensions').optional().isArray(),
    query('confidence_level').optional().isFloat({ min: 0.5, max: 0.99 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { timeframe = '1_month', dimensions, confidence_level = 0.8 } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const mlService = MLService.getInstance();
      const predictions = await mlService.generatePredictions(
        userId,
        {} as any, // Mock workout data for predictions
        {
          timeframe: timeframe as string,
          dimensions: dimensions as string[],
          confidenceLevel: parseFloat(confidence_level as string)
        }
      );

      res.status(200).json({
        success: true,
        data: {
          predictions,
          user_id: userId,
          timeframe,
          confidence_level: parseFloat(confidence_level as string),
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get predictions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve predictions',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/performance/user/:userId
 * @desc Get performance analytics for a user
 * @access Private
 */
router.get('/performance/user/:userId',
  authenticateUser,
  rateLimiter('performance-analytics', 100, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('period').optional().isIn(['week', 'month', 'quarter', 'year', 'all_time']),
    query('metrics').optional().isArray(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { period = 'month', metrics } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const performanceAnalytics = await analyticsService.getPerformanceAnalytics(
        userId,
        {
          period: period as string,
          metrics: metrics as string[]
        }
      );

      res.status(200).json({
        success: true,
        data: {
          performance_analytics: performanceAnalytics,
          user_id: userId,
          period,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get performance analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve performance analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/comparison/user/:userId
 * @desc Get comparison analytics for a user
 * @access Private
 */
router.get('/comparison/user/:userId',
  authenticateUser,
  rateLimiter('comparison-analytics', 50, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('comparison_type').optional().isIn(['self', 'peer', 'benchmark']),
    query('period').optional().isIn(['month', 'quarter', 'year']),
    query('dimensions').optional().isArray(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { comparison_type = 'self', period = 'month', dimensions } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const comparisonAnalytics = await analyticsService.getComparisonAnalytics(
        userId,
        {
          comparisonType: comparison_type as string,
          period: period as string,
          dimensions: dimensions as string[]
        }
      );

      res.status(200).json({
        success: true,
        data: {
          comparison_analytics: comparisonAnalytics,
          user_id: userId,
          comparison_type,
          period,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get comparison analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve comparison analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/insights/user/:userId
 * @desc Get AI-powered insights for a user
 * @access Private
 */
router.get('/insights/user/:userId',
  authenticateUser,
  rateLimiter('insights-analytics', 20, 15 * 60 * 1000), // 20 requests per 15 minutes
  [
    param('userId').isUUID(),
    query('insight_type').optional().isIn(['improvement', 'performance', 'trend', 'recommendation', 'all']),
    query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { insight_type = 'all', period = 'month' } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const insights = await analyticsService.generateInsights(
        userId,
        {
          insightType: insight_type as string,
          period: period as string
        }
      );

      res.status(200).json({
        success: true,
        data: {
          insights,
          user_id: userId,
          insight_type,
          period,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get insights error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve insights',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/dashboard/user/:userId
 * @desc Get dashboard analytics for a user
 * @access Private
 */
router.get('/dashboard/user/:userId',
  authenticateUser,
  rateLimiter('dashboard-analytics', 100, 15 * 60 * 1000),
  [
    param('userId').isUUID(),
    query('widgets').optional().isArray(),
    query('refresh_cache').optional().isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { widgets, refresh_cache = false } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const dashboardData = await analyticsService.getDashboardData(
        userId,
        {
          widgets: widgets as string[],
          refreshCache: refresh_cache === 'true'
        }
      );

      res.status(200).json({
        success: true,
        data: {
          dashboard: dashboardData,
          user_id: userId,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve dashboard analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/export/user/:userId
 * @desc Export analytics data for a user
 * @access Private
 */
router.get('/export/user/:userId',
  authenticateUser,
  rateLimiter('export-analytics', 10, 60 * 60 * 1000), // 10 requests per hour
  [
    param('userId').isUUID(),
    query('format').optional().isIn(['json', 'csv', 'pdf']),
    query('period').optional().isIn(['month', 'quarter', 'year', 'all_time']),
    query('include_data').optional().isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { format = 'json', period = 'month', include_data = true } = req.query;

      // Verify user can access this data
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const exportData = await analyticsService.exportAnalytics(
        userId,
        {
          format: format as string,
          period: period as string,
          includeData: include_data === 'true'
        }
      );

      // Set appropriate headers for file download
      const filename = `gymmy_analytics_${userId}_${period}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 
                              format === 'csv' ? 'text/csv' : 'application/pdf');

      res.status(200).json({
        success: true,
        data: exportData,
        filename,
        user_id: userId,
        format,
        period,
        generated_at: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /api/analytics/system/overview
 * @desc Get system-wide analytics overview (Admin only)
 * @access Admin
 */
router.get('/system/overview',
  authenticateUser,
  rateLimiter('system-analytics', 20, 15 * 60 * 1000),
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter']),
    query('include_ml_metrics').optional().isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { period = 'day', include_ml_metrics = true } = req.query;

      // Verify admin access
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          timestamp: new Date().toISOString()
        });
      }

      const analyticsService = AnalyticsService.getInstance();
      const systemOverview = await analyticsService.getSystemOverview({
        period: period as string,
        includeMLMetrics: include_ml_metrics === 'true'
      });

      res.status(200).json({
        success: true,
        data: {
          system_overview: systemOverview,
          period,
          generated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get system overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system overview',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;
