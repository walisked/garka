import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
    
    // Disallow public registration for agent or deal initiator roles
    if (role && (role === 'AGENT' || role === 'DEAL_INITIATOR')) {
      return failure(res, 'Registration as AGENT or DEAL_INITIATOR is not allowed', 403);
    }

    // Only allow public registration as USER
    const userRole = 'USER';

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
      role: userRole
    });

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

    // If account is an agent or deal initiator, ensure it was invited and activated by admin
    if ((user.role === 'AGENT' || user.role === 'DEAL_INITIATOR') && (!user.invited || !user.isActivated)) {
      return failure(res, 'Account not activated. Please activate via invite link.', 403);
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

// Admin invites an Agent or Deal Initiator
export const inviteAccount = async (req, res) => {
  try {
    const { officialEmail, role, fullName } = req.body;

    if (!officialEmail || !role) {
      return failure(res, 'officialEmail and role are required', 400);
    }

    if (!['AGENT', 'DEAL_INITIATOR'].includes(role)) {
      return failure(res, 'Invalid role for invite', 400);
    }

    // Ensure user does not already exist
    const existing = await User.findOne({ email: officialEmail });
    if (existing) {
      return failure(res, 'User with this email already exists', 400);
    }

    const activationToken = crypto.randomBytes(20).toString('hex');
    const activationExpires = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    const invitedUser = await User.create({
      fullName: fullName || '',
      email: officialEmail,
      role,
      invited: true,
      invitedBy: req.user.id,
      activationToken,
      activationExpires,
      isActivated: false,
      isActive: true
    });

    // Send notification to admin or indicate email-sending (stub for now)
    await notificationService.createNotification({
      user: req.user.id,
      title: 'Invitation created',
      message: `Invitation created for ${officialEmail}`
    });

    // Return activation token for admin/testing (in production we'd email it instead)
    return success(res, { activationToken }, 'Invitation created');
  } catch (error) {
    logger.error(`Invite account error: ${error.message}`);
    return failure(res, 'Failed to invite account', 500);
  }
};

// Activate invited account (set password and complete profile)
export const activateInvite = async (req, res) => {
  try {
    const { token, password, fullName, phone } = req.body;

    if (!token || !password) {
      return failure(res, 'Token and password are required', 400);
    }

    const user = await User.findOne({ activationToken: token, activationExpires: { $gt: Date.now() } });
    if (!user) {
      return failure(res, 'Invalid or expired activation token', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    user.isActivated = true;
    user.activationToken = undefined;
    user.activationExpires = undefined;

    await user.save();

    // Create role-specific profile
    if (user.role === 'AGENT') {
      await Agent.create({ user: user._id, status: 'PENDING_VERIFICATION' });
    }

    if (user.role === 'DEAL_INITIATOR') {
      await DealInitiator.create({ user: user._id, status: 'PENDING_VERIFICATION' });
    }

    // Generate token
    const tokenJwt = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRE }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return success(res, { user: userResponse, token: tokenJwt }, 'Account activated successfully');
  } catch (error) {
    logger.error(`Activate invite error: ${error.message}`);
    return failure(res, 'Activation failed', 500);
  }
};

// Logout (adds token to revoked tokens for server-side invalidation)
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return failure(res, 'No token provided', 400);

    const jwtDecode = await import('jsonwebtoken');
    const decoded = jwtDecode.decode(token, { complete: false }) || {};
    const exp = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 3600 * 1000);

    const RevokedToken = (await import('../models/RevokedToken.js')).default;

    await RevokedToken.create({ token, expiresAt: exp });

    return success(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return failure(res, 'Logout failed', 500);
  }
};
