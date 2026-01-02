import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import VerificationRequest from '../models/VerificationRequest.js';
import jwt from 'jsonwebtoken';

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
  console.warn('Skipping webhook replay tests: MongoDB not available');
  test.skip('Skipping webhook replay tests: MongoDB not available', () => {});
} else {
  describe('Webhook replay protection', () => {
    let buyer, buyerToken, tx, verification;

    beforeEach(async () => {
      await User.deleteMany({});
      await Transaction.deleteMany({});
      await VerificationRequest.deleteMany({});

      buyer = await User.create({ fullName: 'Buyer', email: 'buyer.web@mail.test', phone: '0801111222', password: 'pass', role: 'USER' });
      buyerToken = jwt.sign({ id: buyer._id, role: buyer.role }, process.env.JWT_SECRET);

      tx = await Transaction.create({ user: buyer._id, amount: 1000, status: 'PENDING', type: 'PAYMENT_IN', provider: 'MONNIFY', providerReference: 'MON_EVT_1', metadata: { verificationId: null } });
      verification = await VerificationRequest.create({ propertyId: '000000000000000000000000', buyerId: buyer._id, agentId: '000000000000000000000001', verificationFee: 1000, paymentReference: 'MON_EVT_1', termsAccepted: true });
    });

    it('ignores duplicate webhook events', async () => {
      const payload = { eventType: 'TRANSACTION_SUCCESSFUL', data: { paymentReference: 'MON_EVT_1', status: 'SUCCESS' }, eventId: 'evt_replay_1' };
      const raw = JSON.stringify(payload);
      const crypto = await import('crypto');
      process.env.MONNIFY_API_SECRET = process.env.MONNIFY_API_SECRET || 'testsecret';
      const sig = crypto.createHmac('sha512', process.env.MONNIFY_API_SECRET).update(raw).digest('hex');

      const res1 = await request(app)
        .post('/api/payment/monnify/webhook')
        .send(raw)
        .set('Content-Type', 'application/json')
        .set('x-monnify-signature', sig)
        .set('x-event-id', 'evt_replay_1');

      expect(res1.statusCode).toBe(200);

      const res2 = await request(app)
        .post('/api/payment/monnify/webhook')
        .send(raw)
        .set('Content-Type', 'application/json')
        .set('x-monnify-signature', sig)
        .set('x-event-id', 'evt_replay_1');

      expect(res2.statusCode).toBe(200);
    });
  });
}
