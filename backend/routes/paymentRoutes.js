import { Router, json, raw } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPaymentIntent, handleWebhook, getPaymentStatus, createMonnifyPayment, handleMonnifyWebhook } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-intent', protect, createPaymentIntent);
// Stripe webhook requires raw body
router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => await handleWebhook(req, res));
router.get('/:verificationId/status', protect, getPaymentStatus);

// Monnify endpoints
router.post('/monnify/initiate', protect, createMonnifyPayment);
import { webhookLimiter } from '../middleware/rateLimiter.js';

router.post('/monnify/webhook', raw({ type: 'application/json' }), webhookLimiter, async (req, res) => await handleMonnifyWebhook(req, res));

export default router;
