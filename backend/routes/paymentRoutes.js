import { Router, json, raw } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPaymentIntent, handleWebhook, getPaymentStatus } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-intent', protect, createPaymentIntent);
// Stripe webhook requires raw body
router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => await handleWebhook(req, res));
router.get('/:verificationId/status', protect, getPaymentStatus);

export default router;
