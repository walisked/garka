import * as paymentService from '../services/payment.js';
import * as monnifyService from '../services/monnify.js';
import VerificationRequest from '../models/VerificationRequest.js';
import Transaction from '../models/Transaction.js';
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

export const createMonnifyPayment = async (req, res) => {
  try {
    const { verificationId, amount, redirectUrl } = req.body;

    if (!verificationId || !amount) {
      return failure(res, 'Verification ID and amount are required', 400);
    }

    const verification = await VerificationRequest.findById(verificationId);
    if (!verification) {
      return failure(res, 'Verification request not found', 404);
    }

    if (verification.buyerId.toString() !== req.user.id.toString()) {
      return failure(res, 'Not authorized to pay for this verification', 403);
    }

    const paymentReference = monnifyService.createPaymentReference();

    // Create transaction record
    const tx = await Transaction.create({
      user: req.user.id,
      amount,
      status: 'PENDING',
      type: 'PAYMENT_IN',
      provider: 'MONNIFY',
      providerReference: paymentReference,
      metadata: { verificationId }
    });

    // Initialize Monnify transaction (returns checkout URL or mock)
    const init = await monnifyService.initializeTransaction({
      amount,
      customerName: req.user.fullName || req.user.email,
      customerEmail: req.user.email,
      paymentReference,
      redirectUrl: redirectUrl || ''
    });

    // Save reference on verification
    verification.paymentReference = paymentReference;
    verification.verificationFee = amount;
    await verification.save();

    return success(res, { tx, init }, 'Monnify payment initialized');
  } catch (error) {
    logger.error(`Create Monnify payment error: ${error.message}`);
    return failure(res, 'Failed to create Monnify payment', 500);
  }
};

export const handleMonnifyWebhook = async (req, res) => {
  try {
    // Verify signature
    const signatureHeader = req.headers['x-monnify-signature'] || req.headers['x-monify-signature'] || req.headers['x-monnify-signature-key'];
    const rawBody = req.rawBody || req.body; // prefer raw buffer captured by body parser

    const verified = await monnifyService.verifyWebhookSignature(signatureHeader, rawBody);

    if (!verified) {
      logger.warn('Invalid Monnify webhook signature');
      return failure(res, 'Invalid signature', 401);
    }

    const payload = Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString()) : req.body;

    // Monnify webhook will include event data - adapt as per Monnify docs
    const { eventType, data } = payload;
    const headerEventId = req.headers['x-event-id'] || req.headers['x-webhook-id'];
    const eventId = payload.eventId || headerEventId;

    if (!data) {
      return failure(res, 'No webhook data', 400);
    }

    const paymentReference = data.paymentReference || data.transactionReference;

    if (!paymentReference) {
      logger.warn('Webhook without payment reference');
      return failure(res, 'Missing payment reference', 400);
    }

    // Replay protection: ensure eventId is unique
    const WebhookEvent = (await import('../models/WebhookEvent.js')).default;
    if (eventId) {
      const existing = await WebhookEvent.findOne({ provider: 'MONNIFY', eventId });
      if (existing) {
        logger.info(`Duplicate webhook event ignored: ${eventId}`);
        return success(res, null, 'Duplicate event ignored');
      }

      // persist event so duplicates are ignored in future
      await WebhookEvent.create({ provider: 'MONNIFY', eventId, payload });
    }

    // Reject events older than allowed window if timestamp present
    try {
      const env = (await import('../config/env.js')).default;
      const maxAge = env.MONNIFY_WEBHOOK_MAX_AGE_SECONDS || 86400;
      const eventTimeStr = data.transactionDate || data.transactionTime || payload.timestamp || data.timestamp;
      if (eventTimeStr) {
        const eventTime = new Date(eventTimeStr);
        if (!isNaN(eventTime.getTime())) {
          const age = (Date.now() - eventTime.getTime()) / 1000;
          if (age > maxAge) {
            logger.warn(`Webhook event too old (${age}s), ignoring`);
            return success(res, null, 'Event too old');
          }
        }
      }
    } catch (e) {
      logger.warn(`Failed to parse webhook timestamp: ${e.message}`);
    }
    // Find transaction and verification
    const tx = await Transaction.findOne({ provider: 'MONNIFY', providerReference: paymentReference });
    const verification = await VerificationRequest.findOne({ paymentReference });

    if (eventType === 'TRANSACTION_SUCCESSFUL' || data.status === 'SUCCESS') {
      if (tx) {
        tx.status = 'SUCCESS';
        tx.processedAt = new Date();
        await tx.save();
      }

      if (verification) {
        verification.paymentStatus = 'paid';
        verification.paymentProviderReference = paymentReference;
        verification.paidAt = new Date();
        // Mark escrow as held until admin releases/payout
        verification.escrowStatus = 'HELD';
        await verification.save();
      }

      return success(res, null, 'Payment processed');
    }

    if (eventType === 'TRANSACTION_FAILED' || data.status === 'FAILED') {
      if (tx) {
        tx.status = 'FAILED';
        await tx.save();
      }

      if (verification) {
        verification.paymentStatus = 'failed';
        await verification.save();
      }

      return success(res, null, 'Payment failed processed');
    }

    return success(res, null, 'Webhook received');
  } catch (error) {
    logger.error(`Monnify webhook error: ${error.message}`);
    return failure(res, 'Webhook processing failed', 500);
  }
};

