import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import DealInitiator from '../models/DealInitiator.js';
import LandProperty from '../models/LandProperty.js';
import VerificationRequest from '../models/VerificationRequest.js';
import Transaction from '../models/Transaction.js';
import CommissionConfig from '../models/CommissionConfig.js';
import jwt from 'jsonwebtoken';

const requiredEnv = process.env.MONNIFY_CONTRACT_CODE && process.env.MONNIFY_API_KEY && process.env.MONNIFY_API_SECRET;

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__) || !requiredEnv) {
  console.warn('Skipping Monnify E2E tests: missing env or MongoDB');
  test.skip('Skipping Monnify E2E tests: missing env or MongoDB', () => {});
} else {
  describe('Monnify E2E: initiate -> webhook -> claim -> approve -> commissions', () => {
    let buyer, admin, agentUser, agent, dInitiatorUser, dInitiator, property, verification, buyerToken, adminToken, dealToken;

    beforeEach(async () => {
      await User.deleteMany({});
      await Agent.deleteMany({});
      await DealInitiator.deleteMany({});
      await LandProperty.deleteMany({});
      await VerificationRequest.deleteMany({});
      await Transaction.deleteMany({});
      await CommissionConfig.deleteMany({});

      buyer = await User.create({ fullName: 'Buyer E2E', email: 'buyer.e2e@mail.test', phone: '900', password: 'pass', role: 'USER' });
      buyerToken = jwt.sign({ id: buyer._id, role: buyer.role }, process.env.JWT_SECRET);

      admin = await User.create({ fullName: 'Admin E2E', email: 'admin.e2e@mail.test', phone: '901', password: 'pass', role: 'ADMIN' });
      adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

      agentUser = await User.create({ fullName: 'Agent E2E', email: 'agent.e2e@mail.test', phone: '902', password: 'pass', role: 'AGENT', invited: true, isActivated: true });
      agent = await Agent.create({ user: agentUser._id, status: 'APPROVED' });

      dInitiatorUser = await User.create({ fullName: 'DI E2E', email: 'di.e2e@mail.test', phone: '903', password: 'pass', role: 'DEAL_INITIATOR', invited: true, isActivated: true });
      dInitiator = await DealInitiator.create({ user: dInitiatorUser._id, status: 'APPROVED' });
      dealToken = jwt.sign({ id: dInitiatorUser._id, role: dInitiatorUser.role }, process.env.JWT_SECRET);

      property = await LandProperty.create({ agentId: agent._id, title: 'E2E Land', landSize: '600sqm', location: { state: 'Lagos', city: 'Ikeja', address: 'E2E address' }, price: 1000000 });

      verification = await VerificationRequest.create({ propertyId: property._id, buyerId: buyer._id, agentId: agent._id, termsAccepted: true, verificationFee: 10000 });

      // create active commission config
      await CommissionConfig.create({ platformPercentage: 10, adminPercentage: 5, agentPercentage: 40, dealInitiatorPercentage: 45, minimumVerificationFee: 1000, createdBy: admin._id });
    });

    it('full flow works', async () => {
      // Initiate payment
      const initRes = await request(app)
        .post('/api/payment/monnify/initiate')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ verificationId: verification._id.toString(), amount: verification.verificationFee });

      expect(initRes.statusCode).toBe(200);
      const tx = await Transaction.findOne({ provider: 'MONNIFY', metadata: { verificationId: verification._id } });
      expect(tx).toBeTruthy();

      // Simulate Monnify webhook
      const payload = {
        eventType: 'TRANSACTION_SUCCESSFUL',
        data: {
          paymentReference: tx.providerReference,
          status: 'SUCCESS'
        }
      };

      const raw = JSON.stringify(payload);
      const crypto = await import('crypto');
      const sig = crypto.createHmac(process.env.MONNIFY_WEBHOOK_ALGO || 'sha512', process.env.MONNIFY_API_SECRET).update(raw).digest('hex');

      const webhookRes = await request(app)
        .post('/api/payment/monnify/webhook')
        .send(raw)
        .set('Content-Type', 'application/json')
        .set('x-monnify-signature', sig);

      expect(webhookRes.statusCode).toBe(200);

      const updatedVerification = await VerificationRequest.findById(verification._id);
      expect(updatedVerification.paymentStatus).toBe('paid');

      // Deal initiator claims
      const claimRes = await request(app)
        .post(`/api/deal-initiator/claim/${verification._id}`)
        .set('Authorization', `Bearer ${dealToken}`)
        .send({});

      expect(claimRes.statusCode).toBe(200);

      const claimed = await VerificationRequest.findById(verification._id);
      expect(claimed.requestStatus).toBe('claimed');

      // Admin approve
      const approveRes = await request(app)
        .patch(`/api/verification/${verification._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminNote: 'E2E approve' });

      expect(approveRes.statusCode).toBe(200);

      // Commission transactions created
      const txs = await Transaction.find({ 'metadata.verificationId': verification._id });
      const payout = txs.find(t => t.type && t.type.startsWith('PAYOUT'));
      expect(payout).toBeTruthy();
    }, 20000);
  });
}
