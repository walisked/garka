import * as verificationService from '../services/verification.js';
import VerificationRequest from '../models/VerificationRequest.js';
import { success, failure } from '../utils/response.js';

export const requestVerification = async (req, res) => {
  try {
    const record = await verificationService.requestVerification({
      ...req.body,
      buyer: req.user.id
    });
    return success(res, { verification: record }, 'Verification requested');
  } catch (error) {
    return failure(res, 'Failed to request verification', 500);
  }
};

export const approveVerification = async (req, res) => {
  try {
    const result = await verificationService.approveVerification(
      req.params.id,
      req.body.adminNote
    );

    // result may contain commission distribution details
    return success(res, { result }, 'Verification approved');
  } catch (error) {
    return failure(res, 'Failed to approve verification', 500);
  }
};

export const getVerification = async (req, res) => {
  try {
    const verification = await VerificationRequest.findById(req.params.id)
      .populate('propertyId')
      .populate('agentId')
      .populate({ path: 'dealInitiatorId', populate: { path: 'user', select: 'fullName email phone' } })
      .populate({ path: 'buyerId', select: 'fullName email phone' });

    if (!verification) return failure(res, 'Verification not found', 404);

    // Determine if we can reveal real location
    let canRevealLocation = false;
    if (verification.paymentStatus === 'paid' && verification.claimedBy && verification.adminApproved) {
      canRevealLocation = true;
    }

    const property = verification.propertyId ? { ...verification.propertyId.toObject() } : null;
    if (!canRevealLocation && property && property.location) {
      // hide detailed address until unlocked
      property.location = { state: property.location.state, city: property.location.city, address: 'Hidden until verification complete' };
    }

    // Deal Initiator details visibility: buyers can see DI contact before payment; agents can see when claiming
    let dealInitiatorInfo = null;
    if (verification.dealInitiatorId) {
      dealInitiatorInfo = verification.dealInitiatorId.user ? {
        fullName: verification.dealInitiatorId.user.fullName,
        email: verification.dealInitiatorId.user.email,
        phone: verification.dealInitiatorId.user.phone,
        rank: verification.dealInitiatorId.rank || null
      } : null;
    }

    return success(res, { verification: { ...verification.toObject(), property, dealInitiatorInfo } });
  } catch (error) {
    return failure(res, 'Failed to get verification', 500);
  }
};
