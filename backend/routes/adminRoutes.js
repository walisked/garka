import express from 'express';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { verifyAgentDocuments, processPayout, getOpsStatus } from '../controllers/adminController.js';

const router = express.Router();

router.patch('/verify-agent/:agentId', requireAdmin, verifyAgentDocuments);
router.post('/payout/:transactionId', requireAdmin, processPayout);
router.get('/payouts', requireAdmin, async (req, res) => {
  try {
    const Transaction = (await import('../models/Transaction.js')).default;
    const payouts = await Transaction.find({ type: /PAYOUT/ }).limit(100);
    return res.status(200).json({ success: true, payouts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/ops/status', requireAdmin, getOpsStatus);

export default router;
