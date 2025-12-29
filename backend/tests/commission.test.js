import CommissionConfig from '../models/CommissionConfig.js';
import * as commissionService from '../services/commission.js';
import VerificationRequest from '../models/VerificationRequest.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
  console.warn('Skipping commission tests: MongoDB not available');
  test.skip('Skipping commission tests: MongoDB not available', () => {});
} else {
  describe('Commission distribution', () => {
    beforeEach(async () => {
      await CommissionConfig.deleteMany({});
      await VerificationRequest.deleteMany({});
      await Transaction.deleteMany({});
    });

    it('calculates and creates commission transactions', async () => {
      // create active config
      const config = await CommissionConfig.create({ platformPercentage: 10, adminPercentage: 5, agentPercentage: 40, dealInitiatorPercentage: 45, minimumVerificationFee: 1000, createdBy: global.__TEST_USER__ || '000000000000000000000000' });

      const verification = await VerificationRequest.create({ verificationFee: 20000, agentId: mongoose.Types.ObjectId(), dealInitiatorId: mongoose.Types.ObjectId(), propertyId: mongoose.Types.ObjectId(), buyerId: mongoose.Types.ObjectId(), termsAccepted: true });

      const result = await commissionService.distributeCommission(verification);

      expect(result).toBeTruthy();
      expect(result.transactions.length).toBeGreaterThanOrEqual(4);

      const txs = await Transaction.find({ 'metadata.verificationId': verification._id });
      expect(txs.length).toBeGreaterThanOrEqual(4);

      const platformTx = txs.find(t => t.type === 'COMMISSION_PLATFORM');
      expect(platformTx).toBeTruthy();
      // platform 10% of 20000 = 2000
      expect(platformTx.amount).toBeCloseTo(2000);

      const agentPayout = txs.find(t => t.type === 'PAYOUT_AGENT');
      expect(agentPayout).toBeTruthy();
      // agent 40% of 20000 = 8000
      expect(agentPayout.amount).toBeCloseTo(8000);
    });
  });
}
