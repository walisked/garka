import VerificationRequest from '../models/VerificationRequest.js';

export const requestVerification = async (payload) => {
  return await VerificationRequest.create(payload);
};

export const approveVerification = async (id, adminNote) => {
  return await VerificationRequest.findByIdAndUpdate(
    id,
    { status: 'APPROVED', adminNote },
    { new: true }
  );
};
