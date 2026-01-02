import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import VerificationRequest from '../models/VerificationRequest.js';
import jwt from 'jsonwebtoken';

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
  console.warn('Skipping admin ops tests: MongoDB not available');
  test.skip('Skipping admin ops tests: MongoDB not available', () => {});
} else {
  describe('Admin ops API', () => {
    let admin, adminToken;

    beforeEach(async () => {
      await User.deleteMany({});
      await Transaction.deleteMany({});
      await VerificationRequest.deleteMany({});

      admin = await User.create({ fullName: 'AdminOps', email: 'admin.ops@mail.test', phone: '0809988776', password: 'pass', role: 'ADMIN' });
      adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

      // create a stuck payout
      const old = new Date(Date.now() - 48 * 3600 * 1000);
      await Transaction.create({ type: 'PAYOUT_AGENT', amount: 1000, status: 'PENDING', createdAt: old, metadata: {} });
      await VerificationRequest.create({ propertyId: '000000000000000000000000', buyerId: admin._id, agentId: '000000000000000000000001', verificationFee: 1000, escrowStatus: 'HELD', paidAt: old, termsAccepted: true });
    });

    it('returns ops status counts', async () => {
      const res = await request(app)
        .get('/api/admin/ops/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.counts.stuckPayouts).toBeGreaterThanOrEqual(1);
      expect(res.body.data.counts.stuckHeldVerifications).toBeGreaterThanOrEqual(1);
    });
  });
}
