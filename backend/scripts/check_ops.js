#!/usr/bin/env node

import mongoose from 'mongoose';
import env from '../config/env.js';
import Transaction from '../models/Transaction.js';
import VerificationRequest from '../models/VerificationRequest.js';

// Configurable thresholds via env
const PENDING_PAYOUT_THRESHOLD = parseInt(process.env.OPS_PENDING_PAYOUT_THRESHOLD, 10) || 5;
const HELD_VERIFICATION_THRESHOLD = parseInt(process.env.OPS_HELD_VERIFICATION_THRESHOLD, 10) || 10;
const PENDING_AGE_HOURS = parseInt(process.env.OPS_PENDING_AGE_HOURS, 10) || 24;

const mongoUri = process.env.MONGODB_URI || env.MONGODB_URI || 'mongodb://localhost:27017/garka_test';

const run = async () => {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  const cutoff = new Date(Date.now() - PENDING_AGE_HOURS * 3600 * 1000);

  // Find payouts pending older than cutoff
  const stuckPayouts = await Transaction.find({ type: /PAYOUT/, status: 'PENDING', createdAt: { $lt: cutoff } });

  // Find verifications with escrow held older than cutoff
  const stuckHeld = await VerificationRequest.find({ escrowStatus: 'HELD', paidAt: { $lt: cutoff } });

  const result = {
    counts: {
      stuckPayouts: stuckPayouts.length,
      stuckHeldVerifications: stuckHeld.length
    },
    thresholds: {
      pendingPayoutThreshold: PENDING_PAYOUT_THRESHOLD,
      heldVerificationThreshold: HELD_VERIFICATION_THRESHOLD
    }
  };

  console.log(JSON.stringify(result, null, 2));

  let exitCode = 0;
  if (stuckPayouts.length >= PENDING_PAYOUT_THRESHOLD) exitCode = 2;
  if (stuckHeld.length >= HELD_VERIFICATION_THRESHOLD) exitCode = 3;

  await mongoose.disconnect();
  process.exit(exitCode);
};

run().catch(err => {
  console.error('Ops check failed', err);
  process.exit(1);
});
