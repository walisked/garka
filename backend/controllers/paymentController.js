import * as paymentService from '../services/payment.js';
import VerificationRequest from '../models/VerificationRequest.js';
import { success, failure } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const createPaymentIntent = async (req, res) => {
  try {
    const { verificationId, amount } = req.body;
    
    if (!verificationId || !amount) {
      return failure(res, 'Verification ID and amount are required', 400);
    }
    
    const verification = await VerificationRequest.findById(verificationId);
    if (!verification) {
      return failure(res, 'Verification request not found', 404);
    }
    
    if (verification.buyer.toString() !== req.user.id.toString()) {
      return failure(res, 'Not authorized to pay for this verification', 403);
    }
    
    const paymentIntent = await paymentService.createPaymentIntent(
      amount,
      'usd',
      { verificationId, userId: req.user.id }
    );
    
    // Update verification with payment intent
    verification.paymentIntentId = paymentIntent.paymentIntentId;
    await verification.save();
    
    return success(res, paymentIntent, 'Payment intent created');
  } catch (error) {
    logger.error(`Create payment intent controller error: ${error.message}`);
    return failure(res, 'Failed to create payment intent', 500);
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return failure(res, 'No signature provided', 400);
    }
    
    const result = await paymentService.handleStripeWebhook(
      signature,
      req.rawBody || req.body
    );
    
    return success(res, result, 'Webhook processed successfully');
  } catch (error) {
    logger.error(`Webhook controller error: ${error.message}`);
    return failure(res, 'Webhook processing failed', 400);
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { verificationId } = req.params;
    
    const verification = await VerificationRequest.findById(verificationId)
      .select('paymentStatus paymentIntentId verificationFee');
    
    if (!verification) {
      return failure(res, 'Verification not found', 404);
    }
    
    if (verification.buyer.toString() !== req.user.id.toString() &&
        verification.agent.toString() !== req.user.id.toString()) {
      return failure(res, 'Not authorized', 403);
    }
    
    return success(res, {
      paymentStatus: verification.paymentStatus,
      paymentIntentId: verification.paymentIntentId,
      amount: verification.verificationFee
    }, 'Payment status retrieved');
  } catch (error) {
    logger.error(`Get payment status error: ${error.message}`);
    return failure(res, 'Failed to get payment status', 500);
  }
};

