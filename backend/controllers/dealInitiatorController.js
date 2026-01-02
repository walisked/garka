import VerificationRequest from '../models/VerificationRequest.js';
import { success, failure } from '../utils/response.js';

export const claimDeal = async (req, res) => {
  try {
    const verification = await VerificationRequest.findById(req.params.verificationId);
    if (!verification) return failure(res, 'Verification not found', 404);

    if (verification.claimedBy) return failure(res, 'Verification already claimed', 400);

    const modelName = req.user.role === 'DEAL_INITIATOR' ? 'DealInitiator' : 'Agent';

    verification.claimedBy = req.user.id;
    verification.claimedByModel = modelName;
    verification.claimedAt = new Date();
    verification.requestStatus = 'claimed';

    await verification.save();

    return success(res, { verification }, 'Claim successful');
  } catch (error) {
    return failure(res, 'Claim failed', 500);
  }
};
