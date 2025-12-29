import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import LandProperty from '../models/LandProperty.js';
import VerificationRequest from '../models/VerificationRequest.js';
import Transaction from '../models/Transaction.js';
import jwt from 'jsonwebtoken';

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
  console.warn('Skipping Monnify payment tests: MongoDB not available');
  test.skip('Skipping Monnify payment tests: MongoDB not available', () => {});
} else {
  describe('Monnify payment flow', () => {
    let buyer, agentUser, agent, property, verification, buyerToken;

    beforeEach(async () => {
    await User.deleteMany({});
    await Agent.deleteMany({});
    await LandProperty.deleteMany({});
    await VerificationRequest.deleteMany({});
    await Transaction.deleteMany({});

    buyer = await User.create({ fullName: 'Buyer', email: 'buyer@mail.test', phone: '111', password: 'pass', role: 'USER' });
    buyerToken = jwt.sign({ id: buyer._id, role: buyer.role }, process.env.JWT_SECRET);

    agentUser = await User.create({ fullName: 'Agent', email: 'agent@mail.test', phone: '222', password: 'pass', role: 'AGENT', invited: true, isActivated: true });
    agent = await Agent.create({ user: agentUser._id, status: 'APPROVED' });

    property = await LandProperty.create({ agentId: agent._id, title: 'Test Land', landSize: '600sqm', location: { state: 'Lagos', city: 'Ikeja', address: 'Test address' }, price: 1000000, landUseType: 'Residential' });

    verification = await VerificationRequest.create({ propertyId: property._id, buyerId: buyer._id, agentId: agent._id, termsAccepted: true, verificationFee: 5000 });
  });

  it('initiates monnify payment and creates transaction', async () => {
    const res = await request(app)
      .post('/api/payment/monnify/initiate')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ verificationId: verification._id.toString(), amount: 5000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const tx = await Transaction.findOne({ provider: 'MONNIFY' });
    expect(tx).toBeTruthy();
    expect(tx.status).toBe('PENDING');
    expect(tx.metadata.verificationId.toString()).toBe(verification._id.toString());
  });

  it('processes monnify webhook (success) with signature', async () => {
    // set secret for signature computation
    process.env.MONNIFY_API_SECRET = process.env.MONNIFY_API_SECRET || 'test_webhook_secret';

    // create a tx first
    const tx = await Transaction.create({ user: buyer._id, amount: 5000, status: 'PENDING', type: 'PAYMENT_IN', provider: 'MONNIFY', providerReference: 'MON_TREF_123', metadata: { verificationId: verification._id } });
    verification.paymentReference = 'MON_TREF_123';
    await verification.save();

    const payload = {
      eventType: 'TRANSACTION_SUCCESSFUL',
      data: {
        paymentReference: 'MON_TREF_123',
        status: 'SUCCESS'
      }
    };

    const raw = JSON.stringify(payload);
    const crypto = await import('crypto');
    const sig = crypto.createHmac('sha512', process.env.MONNIFY_API_SECRET).update(raw).digest('hex');

    const res = await request(app)
      .post('/api/payment/monnify/webhook')
      .send(raw)
      .set('Content-Type', 'application/json')
      .set('x-monnify-signature', sig)
      .set('x-event-id', 'evt_1');

    expect(res.statusCode).toBe(200);
    const updatedTx = await Transaction.findById(tx._id);
    expect(updatedTx.status).toBe('SUCCESS');

    const updatedVerification = await VerificationRequest.findById(verification._id);
    expect(updatedVerification.paymentStatus).toBe('paid');
    expect(updatedVerification.paidAt).toBeTruthy();

    // Replay the same event - should be ignored
    const res2 = await request(app)
      .post('/api/payment/monnify/webhook')
      .send(raw)
      .set('Content-Type', 'application/json')
      .set('x-monnify-signature', sig)
      .set('x-event-id', 'evt_1');

    expect(res2.statusCode).toBe(200);
  });

  it('rejects monnify webhook with invalid signature', async () => {
    process.env.MONNIFY_API_SECRET = process.env.MONNIFY_API_SECRET || 'test_webhook_secret';

    const tx = await Transaction.create({ user: buyer._id, amount: 5000, status: 'PENDING', type: 'PAYMENT_IN', provider: 'MONNIFY', providerReference: 'MON_BAD_123', metadata: { verificationId: verification._id } });
    verification.paymentReference = 'MON_BAD_123';
    await verification.save();

    const payload = {
      eventType: 'TRANSACTION_SUCCESSFUL',
      data: {
        paymentReference: 'MON_BAD_123',
        status: 'SUCCESS'
      }
    };

    const raw = JSON.stringify(payload);

    const res = await request(app)
      .post('/api/payment/monnify/webhook')
      .send(raw)
      .set('Content-Type', 'application/json')
      .set('x-monnify-signature', 'invalidsig');

    expect(res.statusCode).toBe(401);
  });
});
}