import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import jwt from 'jsonwebtoken';

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
  console.warn('Skipping admin payout tests: MongoDB not available');
  test.skip('Skipping admin payout tests: MongoDB not available', () => {});
} else {
  describe('Admin payout API', () => {
    let admin, adminToken, payoutTx;

    beforeEach(async () => {
      await User.deleteMany({});
      await Transaction.deleteMany({});

      admin = await User.create({ fullName: 'Admin', email: 'admin.pay@mail.test', phone: '0809999888', password: 'pass', role: 'ADMIN' });
      adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

      payoutTx = await Transaction.create({ type: 'PAYOUT_AGENT', amount: 1000, status: 'PENDING', recipient: admin._id, metadata: { test: true } });
    });

    it('processes payout successfully by admin', async () => {
      const res = await request(app)
        .post(`/api/admin/payout/${payoutTx._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(200);

      const updated = await Transaction.findById(payoutTx._id);
      expect(updated.status).toBe('COMPLETED');
      expect(updated.provider).toBeTruthy();
      expect(updated.providerReference).toBeTruthy();
    });
  });
}
