import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import DealInitiator from '../models/DealInitiator.js';
import { logger } from '../utils/logger.js';
import { success, failure } from '../utils/response.js';
import env from '../config/env.js';
import * as notificationService from '../services/notification.js';

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    
    // Validate role
    const allowedRoles = ['USER', 'AGENT', 'DEAL_INITIATOR'];
    if (role && !allowedRoles.includes(role)) {
      return failure(res, 'Invalid role specified', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      return failure(res, 'User with this email or phone already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'USER'
    });

    // Create role-specific profile if needed
    if (role === 'AGENT') {
      await Agent.create({
        user: user._id,
        status: 'PENDING_VERIFICATION'
      });
      
      // Notify admin about new agent registration
      await notificationService.notifyAdmins({
        title: 'New Agent Registration',
        message: `${fullName} has registered as an agent and awaits verification.`,
        type: 'AGENT_REGISTRATION',
        data: { userId: user._id }
      });
    }

    if (role === 'DEAL_INITIATOR') {
      await DealInitiator.create({
        user: user._id,
        status: 'PENDING_VERIFICATION'
      });
      
      // Notify admin about new deal initiator
      await notificationService.notifyAdmins({
        title: 'New Deal Initiator Registration',
        message: `${fullName} has registered as a deal initiator and awaits verification.`,
        type: 'DEAL_INITIATOR_REGISTRATION',
        data: { userId: user._id }
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRE }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info(`New user registered: ${email} (${user.role})`);

    return success(res, {
      user: userResponse,
      token
    }, 'Registration successful');

  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return failure(res, 'Registration failed', 500);
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return failure(res, 'Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return failure(res, 'Account is deactivated. Please contact admin.', 403);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return failure(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRE }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email} (${user.role})`);

    return success(res, {
      user: userResponse,
      token
    }, 'Login successful');

  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return failure(res, 'Login failed', 500);
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'profile',
        populate: {
          path: 'user',
          select: 'fullName email phone'
        }
      });
    
    if (!user) {
      return failure(res, 'User not found', 404);
    }
    
    return success(res, { user }, 'Profile retrieved');
    
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    return failure(res, 'Failed to get profile', 500);
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const updates = {};
    
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    return success(res, { user }, 'Profile updated successfully');
    
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    return failure(res, 'Failed to update profile', 500);
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return failure(res, 'Current password is incorrect', 400);
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    logger.info(`Password changed for user: ${user.email}`);
    
    return success(res, null, 'Password changed successfully');
    
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    return failure(res, 'Failed to change password', 500);
  }
};

// Logout (client-side token invalidation)
export const logout = (req, res) => {
  // Note: For complete logout with token blacklisting, implement Redis
  return success(res, null, 'Logged out successfully');
};
