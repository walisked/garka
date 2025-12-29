import express, { Router } from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import agentRoutes from './agentRoutes.js';
import dealInitiatorRoutes from './dealInitiatorRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import verificationRoutes from './verificationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import { handleMonnifyWebhook } from '../controllers/paymentController.js';
import notificationRoutes from './notificationRoutes.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);

// Protected routes
router.use('/admin', protect, adminRoutes);
router.use('/agent', protect, agentRoutes);
router.use('/deal-initiator', protect, dealInitiatorRoutes);
router.use('/verification', protect, verificationRoutes);
router.use('/payment', protect, paymentRoutes);
router.use('/notifications', protect, notificationRoutes);

// Public webhook endpoint for Monnify (should be reachable without auth)
router.post('/payment/monnify/webhook', express.raw({ type: 'application/json' }), async (req, res) => await handleMonnifyWebhook(req, res));

// Health check
router.get('/health', (req, res) => {
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
});

// API documentation
router.get('/docs', (req, res) => {
	res.json({
		message: 'Land Verification Platform API',
		version: '1.0.0',
		endpoints: {
			auth: '/api/auth',
			admin: '/api/admin',
			agent: '/api/agent',
			dealInitiator: '/api/deal-initiator',
			properties: '/api/properties',
			verification: '/api/verification',
			payment: '/api/payment',
			notifications: '/api/notifications'
		}
	});
});

export default router;
