import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import {
  requestVerification,
  approveVerification
} from '../controllers/verificationController.js';

const router = Router();

router.post('/', protect, requestVerification);
router.patch('/:id/approve', protect, requireAdmin, approveVerification);

export default router;
