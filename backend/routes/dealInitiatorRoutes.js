import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireDealInitiator } from '../middleware/roleMiddleware.js';
import { claimDeal } from '../controllers/dealInitiatorController.js';

const router = Router();

router.post('/claim/:verificationId', protect, requireDealInitiator, claimDeal);

export default router;
