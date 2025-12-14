import * as verificationService from '../services/verification.js';
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
    const approved = await verificationService.approveVerification(
      req.params.id,
      req.body.adminNote
    );
    return success(res, { verification: approved }, 'Verification approved');
  } catch (error) {
    return failure(res, 'Failed to approve verification', 500);
  }
};
