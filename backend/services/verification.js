import VerificationRequest from '../models/VerificationRequest.js';
import * as commissionService from './commission.js';
import { logger } from '../utils/logger.js';

export const requestVerification = async (payload) => {
  // Normalize payload fields (frontend sends buyer as buyerId etc.)
  const doc = {
    propertyId: payload.propertyId || payload.property,
    buyerId: payload.buyerId || payload.buyer,
    agentId: payload.agentId || payload.agent,
    verificationFee: payload.verificationFee || payload.verificationFee || 0,
    termsAccepted: payload.termsAccepted === undefined ? true : payload.termsAccepted
  };
  return await VerificationRequest.create(doc);
};

export const approveVerification = async (id, adminNote) => {
  const verification = await VerificationRequest.findById(id);
  if (!verification) throw new Error('Verification request not found');

  verification.adminNote = adminNote;
  verification.adminApproved = true;
  verification.approvedAt = new Date();

  // If paid and already claimed, finalize and distribute commissions
  if (verification.paymentStatus === 'paid' && verification.claimedBy && verification.escrowStatus === 'HELD') {
    verification.requestStatus = 'completed';
    verification.completedAt = new Date();
    await verification.save();

    try {
      const result = await commissionService.distributeCommission(verification);

      // Optionally process payouts automatically if configured
      const env = (await import('../config/env.js')).default;
      if (env.MONNIFY_AUTO_PAYOUT) {
        const payoutTxIds = (result.transactions || []).slice().map(id => id.toString());
        for (const txId of payoutTxIds) {
          const tx = await commissionService.processPayout(txId, env.DEFAULT_PAYOUT_PROVIDER);
        }
        verification.escrowStatus = 'RELEASED';
        await verification.save();
      }

      return { verification, commission: result };
    } catch (err) {
      logger.error(`Commission distribution failed: ${err.message}`);
      // continue but surface the error up
      return { verification, commissionError: err.message };
    }
  }

  await verification.save();
  return { verification };
};
