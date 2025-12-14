import { Router } from 'express';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/pay', protect, async (req, res) => {
  const tx = await Transaction.create({
    user: req.user.id,
    amount: req.body.amount,
    status: 'SUCCESS'
  });
  res.json(tx);
});

export default router;
