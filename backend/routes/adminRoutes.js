import express from 'express';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { verifyAgentDocuments } from '../controllers/adminController.js';

const router = express.Router();

router.patch('/verify-agent/:agentId', requireAdmin, verifyAgentDocuments);

export default router;
