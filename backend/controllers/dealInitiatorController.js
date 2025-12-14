import VerificationRequest from '../models/VerificationRequest.js';
import { success, failure } from '../utils/response.js';

export const claimDeal = async (req, res) => {
  try {
    const deal = await VerificationRequest.findByIdAndUpdate(
      req.params.verificationId,
      { dealInitiator: req.user.id, status: 'CLAIMED' },
      { new: true }
    );

    if (!deal) return failure(res, 'Verification not found', 404);

    return success(res, { verification: deal }, 'Claim successful');
  } catch (error) {
    return failure(res, 'Claim failed', 500);
  }
};
