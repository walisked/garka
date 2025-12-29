import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { failure } from '../utils/response.js';
import env from '../config/env.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return failure(res, 'Not authorized, no token', 401);
    }
    
    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Check if token is revoked
    const RevokedToken = (await import('../models/RevokedToken.js')).default;
    const revoked = await RevokedToken.findOne({ token });
    if (revoked) return failure(res, 'Token revoked', 401);

    // Get user from token
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('profile');
    
    if (!user) {
      return failure(res, 'User not found', 401);
    }
    
    // Check if user is active
    if (!user.isActive) {
      return failure(res, 'Account deactivated', 401);
    }
    
    // Add user to request
    req.user = user;
    req.userRole = user.role;
    
    logger.info(`Authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    logger.error(`Auth error: ${error.message}`);
    
    if (error.name === 'JsonWebTokenError') {
      return failure(res, 'Invalid token', 401);
    }
    
    if (error.name === 'TokenExpiredError') {
      return failure(res, 'Token expired', 401);
    }
    
    return failure(res, 'Authentication failed', 401);
  }
};

// Optional authentication (for public routes that might have auth)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        req.userRole = user.role;
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without auth
    next();
  }
};
