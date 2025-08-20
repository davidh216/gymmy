// server/src/index.ts
// Main server entry point for Gymmy's Phase 4: 1% Better Core System
// ML-powered improvement detection and analytics backend

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import configurations
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { performanceMonitor } from '@/middleware/performanceMonitor';

// Import database connections
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { connectQueue } from '@/config/queue';

// Import API routes
import improvementRoutes from '@/routes/improvements';
import analyticsRoutes from '@/routes/analytics';
import mlRoutes from '@/routes/ml';
import healthRoutes from '@/routes/health';
import userRoutes from '@/routes/users';

// Import services
import { MLService } from '@/services/MLService';
import { ImprovementService } from '@/services/ImprovementService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';

// Load environment variables
dotenv.config();

class GymmyServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.port = config.PORT || 3001;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeServices();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression
    this.app.use(compression());

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
    this.app.use(requestLogger);
    this.app.use(performanceMonitor);
  }

  private initializeRoutes(): void {
    // Health check route
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: config.VERSION || '1.0.0',
        environment: config.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/improvements', improvementRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/ml', mlRoutes);
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/users', userRoutes);

    // API documentation
    this.app.use('/api-docs', (req, res) => {
      res.json({
        message: 'Gymmy Phase 4 API Documentation',
        version: '1.0.0',
        endpoints: {
          improvements: '/api/improvements',
          analytics: '/api/analytics',
          ml: '/api/ml',
          health: '/api/health',
          users: '/api/users'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeServices(): void {
    // Initialize core services
    MLService.getInstance();
    ImprovementService.getInstance();
    AnalyticsService.getInstance();
    PerformanceMonitor.getInstance();

    logger.info('All services initialized successfully');
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Handle real-time improvement updates
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      // Handle workout data streaming
      socket.on('workout-data', async (data) => {
        try {
          const improvementService = ImprovementService.getInstance();
          const result = await improvementService.processWorkoutData(data);
          
          // Emit improvement detection results
          socket.emit('improvement-detected', result);
        } catch (error) {
          logger.error('Error processing workout data:', error);
          socket.emit('error', { message: 'Failed to process workout data' });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    logger.info('Socket.IO initialized successfully');
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to databases
      await connectDatabase();
      await connectRedis();
      await connectQueue();

      // Start server
      this.server.listen(this.port, () => {
        logger.info(`🚀 Gymmy Phase 4 Backend Server running on port ${this.port}`);
        logger.info(`📊 Environment: ${config.NODE_ENV}`);
        logger.info(`🔗 API Documentation: http://localhost:${this.port}/api-docs`);
        logger.info(`🏥 Health Check: http://localhost:${this.port}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Received shutdown signal, starting graceful shutdown...');
    
    this.server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }
}

// Start the server
const server = new GymmyServer();
server.start().catch((error) => {
  logger.error('Failed to start Gymmy server:', error);
  process.exit(1);
});

export default GymmyServer;
