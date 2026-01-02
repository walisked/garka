import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import {
  requestVerification,
  approveVerification,
  getVerification
} from '../controllers/verificationController.js';

const router = Router();

router.post('/', protect, requestVerification);
router.get('/:id', protect, getVerification);
router.patch('/:id/approve', protect, requireAdmin, approveVerification);

export default router;
