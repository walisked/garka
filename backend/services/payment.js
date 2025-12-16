import Stripe from 'stripe';
import Transaction from '../models/Transaction.js';
import VerificationRequest from '../models/VerificationRequest.js';
import { logger } from '../utils/logger.js';
import env from '../config/env.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    };
  } catch (error) {
    logger.error(`Create payment intent error: ${error.message}`);
    throw error;
  }
};

export const handleStripeWebhook = async (signature, rawBody) => {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
        
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
        
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
    
    return { success: true, event: event.type };
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    throw error;
  }
};

async function handlePaymentSuccess(paymentIntent) {
  const { verificationId } = paymentIntent.metadata;
  
  if (!verificationId) {
    logger.warn('Payment succeeded but no verificationId in metadata');
    return;
  }
  
  // Update verification request
  const verification = await VerificationRequest.findById(verificationId);
  if (verification) {
    verification.paymentStatus = 'PAID';
    verification.paymentIntentId = paymentIntent.id;
    verification.paidAt = new Date();
    await verification.save();
    
    // Create transaction record
    await Transaction.create({
      type: 'PAYMENT_IN',
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'COMPLETED',
      provider: 'STRIPE',
      providerReference: paymentIntent.id,
      metadata: {
        verificationId,
        customerId: paymentIntent.customer,
        description: paymentIntent.description
      }
    });
    
    logger.info(`Payment successful for verification ${verificationId}`);
  }
}

async function handlePaymentFailure(paymentIntent) {
  const { verificationId } = paymentIntent.metadata;
  
  if (verificationId) {
    const verification = await VerificationRequest.findById(verificationId);
    if (verification) {
      verification.paymentStatus = 'FAILED';
      await verification.save();
      
      logger.warn(`Payment failed for verification ${verificationId}`);
    }
  }
}

async function handleRefund(charge) {
  // Handle refund logic
  logger.info(`Refund processed for charge ${charge.id}`);
}

