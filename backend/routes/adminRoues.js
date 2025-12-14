import express from 'express';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifyAgentDocuments } from '../controllers/adminController.js';

const router = express.Router();

router.patch('/verify-agent/:agentId', protect, requireAdmin, verifyAgentDocuments);

export default router;
