import VerificationRequest from '../models/VerificationRequest.js';
import LandProperty from '../models/LandProperty.js';
import { logger } from '../utils/logger.js';

export const expireReservations = async () => {
  try {
    const now = new Date();
    const expired = await VerificationRequest.find({
      reservedUntil: { $lte: now },
      paymentStatus: 'paid',
      adminApproved: false
    });

    for (const v of expired) {
      v.paymentStatus = 'expired';
      v.reservedUntil = null;
      v.requestStatus = 'submitted';
      await v.save();

      try {
        const prop = await LandProperty.findById(v.propertyId);
        if (prop) {
          prop.status = 'available';
          prop.reservedUntil = null;
          await prop.save();
        }
      } catch (e) {
        logger.warn(`Failed to clear property reservation for verification ${v._id}: ${e.message}`);
      }
    }

    if (expired.length) logger.info(`Expired ${expired.length} reservations`);
  } catch (err) {
    logger.error(`Reservation expiration job failed: ${err.message}`);
  }
};

export const startReservationCleaner = (intervalMs = 60 * 1000) => {
  // Run immediately and then start interval
  expireReservations();
  return setInterval(expireReservations, intervalMs);
};