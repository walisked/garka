import { failure } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Single role check
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Role check failed: No user in request');
      return failure(res, 'Authentication required', 401);
    }
    
    if (req.user.role !== role) {
      logger.warn(`Role check failed: ${req.user.email} attempted ${role} route`);
      return failure(res, `Access denied. Requires ${role} role`, 403);
    }
    
    next();
  };
};

// Multiple roles check
export const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return failure(res, 'Authentication required', 401);
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Role check failed: ${req.user.email} (${req.user.role}) not in ${roles}`);
      return failure(res, 'Access denied. Insufficient permissions', 403);
    }
    
    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole('ADMIN');

// Agent-only middleware
export const requireAgent = requireRole('AGENT');

// Deal Initiator-only middleware
export const requireDealInitiator = requireRole('DEAL_INITIATOR');

// User-only middleware
export const requireUser = requireRole('USER');

// Admin or Agent middleware
export const requireAdminOrAgent = requireAnyRole(['ADMIN', 'AGENT']);

// Admin or Deal Initiator middleware
export const requireAdminOrDealInitiator = requireAnyRole(['ADMIN', 'DEAL_INITIATOR']);
