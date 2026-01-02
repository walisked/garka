import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import DealInitiator from '../models/DealInitiator.js';
import LandProperty from '../models/LandProperty.js';
import VerificationRequest from '../models/VerificationRequest.js';
import Transaction from '../models/Transaction.js';
import jwt from 'jsonwebtoken';

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
  console.warn('Skipping verification tests: MongoDB not available');
  test.skip('Skipping verification tests: MongoDB not available', () => {});
} else {
  describe('Verification claim and admin approval', () => {
    let buyer, agentUser, agent, dInitiatorUser, dInitiator, property, verification, buyerToken, adminToken, dealToken;

    beforeEach(async () => {
      await User.deleteMany({});
      await Agent.deleteMany({});
      await DealInitiator.deleteMany({});
      await LandProperty.deleteMany({});
      await VerificationRequest.deleteMany({});
      await Transaction.deleteMany({});

      buyer = await User.create({ fullName: 'Buyer', email: 'buyer2@mail.test', phone: '1112', password: 'pass', role: 'USER' });
      buyerToken = jwt.sign({ id: buyer._id, role: buyer.role }, process.env.JWT_SECRET);

      const admin = await User.create({ fullName: 'Admin', email: 'admin@garka.com', phone: '000', password: 'pass', role: 'ADMIN' });
      adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

      agentUser = await User.create({ fullName: 'Agent', email: 'agent2@mail.test', phone: '2222', password: 'pass', role: 'AGENT', invited: true, isActivated: true });
      agent = await Agent.create({ user: agentUser._id, status: 'APPROVED' });

      dInitiatorUser = await User.create({ fullName: 'Dealy', email: 'deally@mail.test', phone: '333', password: 'pass', role: 'DEAL_INITIATOR', invited: true, isActivated: true });
      dInitiator = await DealInitiator.create({ user: dInitiatorUser._id, status: 'APPROVED' });
      dealToken = jwt.sign({ id: dInitiatorUser._id, role: dInitiatorUser.role }, process.env.JWT_SECRET);

      property = await LandProperty.create({ agentId: agent._id, title: 'Test Land 2', landSize: '600sqm', location: { state: 'Lagos', city: 'Ikeja', address: 'Test address 2' }, price: 2000000, landUseType: 'Residential' });

      verification = await VerificationRequest.create({ propertyId: property._id, buyerId: buyer._id, agentId: agent._id, termsAccepted: true, verificationFee: 10000 });
    });

    it('deal initiator or agent can claim verification', async () => {
      const res = await request(app)
        .post(`/api/deal-initiator/claim/${verification._id}`)
        .set('Authorization', `Bearer ${dealToken}`)
        .send({});

      expect(res.statusCode).toBe(200);
      const updated = await VerificationRequest.findById(verification._id);
      expect(updated.claimedBy.toString()).toBe(dInitiatorUser._id.toString());
      expect(updated.requestStatus).toBe('claimed');
    });

    it('admin approval after paid+claimed triggers commission transactions', async () => {
      // Mark payment as done, escrow held, and claimed
      verification.paymentStatus = 'paid';
      verification.paymentReference = 'MON_TEST_REF';
      verification.escrowStatus = 'HELD';
      verification.claimedBy = dInitiatorUser._id;
      verification.claimedByModel = 'DealInitiator';
      verification.claimedAt = new Date();
      await verification.save();

      const res = await request(app)
        .patch(`/api/verification/${verification._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminNote: 'OK' });

      expect(res.statusCode).toBe(200);
      const txs = await Transaction.find({ 'metadata.verificationId': verification._id });
      expect(txs.length).toBeGreaterThan(0);
      // check at least one payout created
      const payout = txs.find(t => t.type && t.type.startsWith('PAYOUT'));
      expect(payout).toBeTruthy();
    });

    it('auto payout processes payouts and releases escrow when enabled', async () => {
      // Enable auto payout
      process.env.MONNIFY_AUTO_PAYOUT = 'true';

      verification.paymentStatus = 'paid';
      verification.paymentReference = 'MON_TEST_REF_AUTO';
      verification.escrowStatus = 'HELD';
      verification.claimedBy = dInitiatorUser._id;
      verification.claimedByModel = 'DealInitiator';
      verification.claimedAt = new Date();
      await verification.save();

      const res = await request(app)
        .patch(`/api/verification/${verification._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminNote: 'Auto payout' });

      expect(res.statusCode).toBe(200);

      const txs = await Transaction.find({ 'metadata.verificationId': verification._id });
      const payouts = txs.filter(t => t.type && t.type.startsWith('PAYOUT'));
      expect(payouts.length).toBeGreaterThan(0);

      // payouts should be COMPLETED by processPayout
      const completed = payouts.every(p => p.status === 'COMPLETED');
      expect(completed).toBe(true);

      const updatedVerification = await VerificationRequest.findById(verification._id);
      expect(updatedVerification.escrowStatus).toBe('RELEASED');

      // clean up env
      delete process.env.MONNIFY_AUTO_PAYOUT;
    });
  });
}
