import User from '../models/User.js';
import Agent from '../models/Agent.js';
import Transaction from '../models/Transaction.js';
import * as commissionService from '../services/commission.js';
import { success, failure } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import * as notificationService from '../services/notification.js';

export const verifyAgentDocuments = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const agent = await Agent.findById(req.params.agentId).populate('user');
    if (!agent) return failure(res, 'Agent not found', 404);

    agent.status = status;
    agent.adminNotes = adminNotes;
    agent.verifiedBy = req.user.id;
    agent.verifiedAt = new Date();
    await agent.save();

    if (status === 'APPROVED') {
      await User.findByIdAndUpdate(agent.user._id, { role: 'AGENT', isActive: true });

      await notificationService.createNotification({
        user: agent.user._id,
        title: 'Agent Account Approved',
        message: 'Your agent account has been approved. You can now list properties.',
        type: 'ACCOUNT_APPROVAL'
      });
    }

    logger.info(`Agent ${req.params.agentId} ${status} by admin ${req.user.email}`);

    return success(res, { agent }, `Agent ${status.toLowerCase()} successfully`);
  } catch (error) {
    logger.error(`Verify agent error: ${error.message}`);
    return failure(res, 'Failed to verify agent', 500);
  }
};

export const processPayout = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const tx = await Transaction.findById(transactionId);
    if (!tx) return failure(res, 'Transaction not found', 404);

    if (!tx.type || !tx.type.startsWith('PAYOUT')) {
      return failure(res, 'Transaction is not a payout', 400);
    }

    const env = (await import('../config/env.js')).default;
    const provider = env.DEFAULT_PAYOUT_PROVIDER || 'STRIPE';

    const result = await commissionService.processPayout(transactionId, provider);

    return success(res, { transaction: result }, 'Payout processed');
  } catch (error) {
    logger.error(`Process payout error: ${error.message}`);
    return failure(res, 'Failed to process payout', 500);
  }
};

// Admin ops status / monitoring endpoint
export const getOpsStatus = async (req, res) => {
  try {
    const TransactionModel = (await import('../models/Transaction.js')).default;
    const VerificationModel = (await import('../models/VerificationRequest.js')).default;

    const hours = parseInt(req.query.hours, 10) || 24;
    const cutoff = new Date(Date.now() - hours * 3600 * 1000);

    const stuckPayouts = await TransactionModel.countDocuments({ type: /PAYOUT/, status: 'PENDING', createdAt: { $lt: cutoff } });
    const stuckHeldVerifications = await VerificationModel.countDocuments({ escrowStatus: 'HELD', paidAt: { $lt: cutoff } });

    return success(res, { counts: { stuckPayouts, stuckHeldVerifications } }, 'Ops status');
  } catch (error) {
    logger.error(`Get ops status error: ${error.message}`);
    return failure(res, 'Failed to get ops status', 500);
  }
};
