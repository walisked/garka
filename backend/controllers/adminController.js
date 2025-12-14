import User from '../models/User.js';
import Agent from '../models/Agent.js';
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
