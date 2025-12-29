import env from '../config/env.js';

import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const BASE_URL = env.MONNIFY_SANDBOX ? 'https://sandbox.monnify.co' : 'https://api.monnify.com';

const getAuthHeader = () => {
  if (!env.MONNIFY_API_KEY || !env.MONNIFY_API_SECRET) return null;
  const token = Buffer.from(`${env.MONNIFY_API_KEY}:${env.MONNIFY_API_SECRET}`).toString('base64');
  return `Basic ${token}`;
};

export const initializeTransaction = async ({ amount, customerName, customerEmail, paymentReference, redirectUrl }) => {
  try {
    const auth = getAuthHeader();
    const payload = {
      amount: Math.round(amount),
      customerName,
      customerEmail,
      paymentReference,
      contractCode: env.MONNIFY_CONTRACT_CODE,
      redirectUrl
    };

    if (!auth) {
      logger.warn('Monnify credentials not configured; returning mock response');
      return {
        checkoutUrl: `https://sandbox.monnify.co/checkout?paymentReference=${paymentReference}`,
        paymentReference
      };
    }

    const res = await fetch(`${BASE_URL}/api/v2/transactions/init-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error(`Monnify initialize error: ${error.message}`);
    throw error;
  }
};

export const verifyTransaction = async (paymentReference) => {
  try {
    const auth = getAuthHeader();
    if (!auth) return { status: 'UNKNOWN' };
    const res = await fetch(`${BASE_URL}/api/v2/transactions/${paymentReference}`, {
      headers: { Authorization: auth }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    logger.error(`Monnify verify error: ${error.message}`);
    throw error;
  }
};

export const createPaymentReference = () => {
  return `MON_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

export const verifyWebhookSignature = (signatureHeader, rawBody) => {
  try {
    // Read secrets directly from process.env to pick up runtime overrides in tests
    const secret = process.env.MONNIFY_WEBHOOK_SECRET || process.env.MONNIFY_API_SECRET;
    const algo = process.env.MONNIFY_WEBHOOK_ALGO || 'sha512';

    if (!secret) {
      logger.warn('No Monnify webhook secret configured; skipping signature verification');
      return true;
    }

    const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody));
    const computed = crypto.createHmac(algo, secret).update(payload).digest('hex');

    // Use timingSafeEqual for comparison
    const a = Buffer.from(computed);
    const b = Buffer.from((signatureHeader || '').toString());

    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (error) {
    logger.error(`Error verifying Monnify signature: ${error.message}`);
    return false;
  }
};