// server/src/middleware/auth.ts
// Authentication middleware for Gymmy's Phase 4 Backend
// Provides JWT token validation and user authorization

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { logger, securityLogger } from '@/utils/logger';
import { databaseManager } from '@/config/database';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Authenticate user using JWT token
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authorization header must start with Bearer'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    
    // Check if user exists in database
    const user = await getUserFromDatabase(decoded.id);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'User not found'
      });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(401).json({
        success: false,
        error: 'Account deactivated',
        message: 'User account is not active'
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
      permissions: user.permissions || []
    };

    // Log successful authentication
    securityLogger.authentication(user.id, true, req.ip);

    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Token has expired'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: 'Internal server error during authentication'
      });
    }
  }
};

/**
 * Require specific role for access
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated'
      });
      return;
    }

    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      securityLogger.authorization(req.user.id, 'role-based-access', false);
      
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required role: ${requiredRoles.join(' or ')}, User role: ${userRole}`
      });
      return;
    }

    securityLogger.authorization(req.user.id, 'role-based-access', true);
    next();
  };
};

/**
 * Require specific permission for access
 */
export const requirePermission = (permissions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      securityLogger.authorization(req.user.id, 'permission-based-access', false);
      
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required permissions: ${requiredPermissions.join(' or ')}, User permissions: ${userPermissions.join(', ')}`
      });
      return;
    }

    securityLogger.authorization(req.user.id, 'permission-based-access', true);
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    
    // Check if user exists in database
    const user = await getUserFromDatabase(decoded.id);
    
    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'user',
        permissions: user.permissions || []
      };
    }

    next();

  } catch (error) {
    // Token is invalid, but continue without authentication
    logger.debug('Optional authentication failed:', error);
    next();
  }
};

/**
 * Verify user owns the resource or has admin access
 */
export const verifyResourceOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated'
      });
      return;
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      res.status(400).json({
        success: false,
        error: 'Missing resource identifier',
        message: `Resource user ID field '${resourceUserIdField}' is required`
      });
      return;
    }

    // Allow access if user owns the resource or is admin
    if (req.user.id === resourceUserId || req.user.role === 'admin') {
      securityLogger.authorization(req.user.id, 'resource-ownership', true);
      next();
    } else {
      securityLogger.authorization(req.user.id, 'resource-ownership', false);
      
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }
  };
};

/**
 * Rate limiting for authentication attempts
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip;
    const now = Date.now();
    
    const userAttempts = attempts.get(ip);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset attempts for this IP
      attempts.set(ip, { count: 1, resetTime: now + windowMs });
      next();
    } else if (userAttempts.count >= maxAttempts) {
      securityLogger.rateLimit(ip, 'authentication', maxAttempts);
      
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts',
        message: `Maximum ${maxAttempts} attempts allowed per ${windowMs / 1000 / 60} minutes`
      });
    } else {
      // Increment attempt count
      userAttempts.count++;
      next();
    }
  };
};

/**
 * Get user from database
 */
async function getUserFromDatabase(userId: string): Promise<any> {
  try {
    const query = `
      SELECT id, email, username, role, permissions, is_active, last_login
      FROM users 
      WHERE id = $1
    `;
    
    const results = await databaseManager.executeQuery(query, [userId]);
    
    if (results.length === 0) {
      return null;
    }

    const user = results[0];
    
    // Update last login
    await databaseManager.executeQuery(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );

    return user;

  } catch (error) {
    logger.error('Error fetching user from database:', error);
    return null;
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: {
  id: string;
  email: string;
  username: string;
  role: string;
  permissions: string[];
}): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, config.JWT_SECRET);
}

/**
 * Verify API key for service-to-service communication
 */
export const verifyApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers[config.API_KEY_HEADER.toLowerCase()] as string;
  
  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'API key required',
      message: `Missing ${config.API_KEY_HEADER} header`
    });
    return;
  }

  // In a real implementation, you would validate against a database of API keys
  // For now, we'll use a simple environment variable check
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    securityLogger.suspicious(req.ip, 'invalid-api-key', { apiKey: apiKey.substring(0, 8) + '...' });
    
    res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
    return;
  }

  next();
};

/**
 * Admin-only access middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Service account access middleware
 */
export const requireServiceAccount = requireRole(['admin', 'service']);

/**
 * User or admin access middleware
 */
export const requireUserOrAdmin = requireRole(['user', 'admin']);
