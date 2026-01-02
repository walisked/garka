import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import LandProperty from '../models/LandProperty.js';
import VerificationRequest from '../models/VerificationRequest.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
  console.warn('Skipping verification tests: MongoDB not available');
  test.skip('Skipping verification tests: MongoDB not available', () => {});
} else {
  describe('Verification Workflow API', () => {
  let userToken, initiatorToken, propertyId, verificationId;
  
  beforeAll(async () => {
    // Create a user and get token
    const userRes = await request(app).post('/api/auth/register').send({
      fullName: 'Buyer', email: 'buyer@example.com', phone: '0800000000', password: 'pass123'
    });
    // debug
    console.log('userRes', JSON.stringify(userRes.body));
    userToken = userRes.body.data.token;

    // Attempt to create agency user via public register (may be blocked by invite-only flow)
    await request(app).post('/api/auth/register').send({
      fullName: 'Agent', email: 'agent@example.com', phone: '0800000001', password: 'pass123', role: 'AGENT'
    });

    // Ensure agent user exists (create directly if invite flow blocks public registration)
    let agentUser = await User.findOne({ email: 'agent@example.com' });
    if (!agentUser) {
      agentUser = await User.create({ fullName: 'Agent', email: 'agent@example.com', phone: '0800000001', password: 'pass123', role: 'AGENT', invited: true, isActivated: true });
    }

    // Approve agent via direct DB manipulation for test
    await Agent.create({ user: agentUser._id, status: 'APPROVED' });

    // Create a property belonging to the agent
    const agent = await Agent.findOne({ user: agentUser._id });
    const property = await LandProperty.create({
      title: 'Test Plot', agentId: agent._id, listedBy: agentUser._id, landSize: '100sqm', price: 1000000, location: { state: 'Lagos', city: 'Ikeja' }, landUseType: 'Residential'
    });
    propertyId = property._id;
  });
  
  afterAll(async () => {});
  
  it('should create verification request', async () => {
    const res = await request(app)
      .post('/api/verification')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ property: propertyId, termsAccepted: true, verificationFee: 5000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    verificationId = res.body.data.verification._id;
  });
  });
}
  // Tests use the shared Jest setup (mongodb-memory-server) and CommonJS imports above
