import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  const notes = await Notification.find({ user: req.user.id });
  res.json(notes);
});

export default router;
