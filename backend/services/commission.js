import CommissionConfig from '../models/CommissionConfig.js';
import Transaction from '../models/Transaction.js';
import { logger } from '../utils/logger.js';

export const calculateCommission = async (amount, type = 'VERIFICATION') => {
  try {
    const config = await CommissionConfig.getActiveConfig();

    if (!config) {
      throw new Error('No active commission configuration found');
    }

    const commissions = config.calculateCommissions(amount);

    return {
      ...commissions,
      configId: config._id,
      breakdown: {
        platform: {
          percentage: config.platformPercentage,
          amount: commissions.platformFee
        },
        admin: {
          percentage: config.adminPercentage,
          amount: commissions.adminFee
        },
        agent: {
          percentage: config.agentPercentage,
          amount: commissions.agentFee
        },
        dealInitiator: {
          percentage: config.dealInitiatorPercentage,
          amount: commissions.dealInitiatorFee
        }
      }
    };
  } catch (error) {
    logger.error(`Calculate commission error: ${error.message}`);
    throw error;
  }
};

export const distributeCommission = async (verificationRequest) => {
  try {
    const commission = await calculateCommission(verificationRequest.verificationFee);

    // Create transaction records
    const transactions = [];

    // Platform fee transaction
    transactions.push(
      Transaction.create({
        type: 'COMMISSION_PLATFORM',
        amount: commission.platformFee,
        status: 'PENDING',
        metadata: {
          verificationId: verificationRequest._id,
          configId: commission.configId
        }
      })
    );

    // Admin fee transaction
    transactions.push(
      Transaction.create({
        type: 'COMMISSION_ADMIN',
        amount: commission.adminFee,
        status: 'PENDING',
        metadata: {
          verificationId: verificationRequest._id,
          configId: commission.configId
        }
      })
    );

    // Agent payout transaction
    transactions.push(
      Transaction.create({
        type: 'PAYOUT_AGENT',
        amount: commission.agentFee,
        status: 'PENDING',
        recipient: verificationRequest.agent,
        metadata: {
          verificationId: verificationRequest._id,
          configId: commission.configId
        }
      })
    );

    // Deal initiator payout transaction
    transactions.push(
      Transaction.create({
        type: 'PAYOUT_DEAL_INITIATOR',
        amount: commission.dealInitiatorFee,
        status: 'PENDING',
        recipient: verificationRequest.dealInitiator,
        metadata: {
          verificationId: verificationRequest._id,
          configId: commission.configId
        }
      })
    );

    const createdTxs = await Promise.all(transactions);

    return {
      commission,
      transactions: createdTxs.map(t => t._id)
    };
  } catch (error) {
    logger.error(`Distribute commission error: ${error.message}`);
    throw error;
  }
};

export const calculateCommissionSimple = (amount) => {
  return {
    platform: amount * 0.1,
    admin: amount * 0.05,
    crm: amount * 0.1,
    net: amount * 0.75
  };
}

export const processPayout = async (transactionId, provider = 'STRIPE') => {
  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Simulate payout for now
    transaction.status = 'COMPLETED';
    transaction.processedAt = new Date();
    transaction.provider = provider;
    transaction.providerReference = `payout_${Date.now()}`;

    await transaction.save();

    logger.info(`Payout processed for transaction ${transactionId} via ${provider}`);

    return transaction;
  } catch (error) {
    logger.error(`Process payout error: ${error.message}`);
    throw error;
  }
};
