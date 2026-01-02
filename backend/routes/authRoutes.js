import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, changePassword, logout, inviteAccount, activateInvite } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
import { authLimiter } from '../middleware/rateLimiter.js';

router.post('/login', authLimiter, loginUser);

// Admin invite endpoint
router.post('/invite', protect, requireAdmin, inviteAccount);
// Activation for invited users
router.post('/activate', activateInvite);

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
