import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireDealInitiator, requireAnyRole } from '../middleware/roleMiddleware.js';
import { claimDeal } from '../controllers/dealInitiatorController.js';

const router = Router();

// Allow both DEAL_INITIATOR and AGENT to claim
router.post('/claim/:verificationId', protect, requireAnyRole(['DEAL_INITIATOR', 'AGENT']), claimDeal);

export default router;
