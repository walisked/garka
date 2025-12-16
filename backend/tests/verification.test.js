const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const User = require('../models/User.js');
const Agent = require('../models/Agent.js');
const LandProperty = require('../models/LandProperty.js');
const VerificationRequest = require('../models/VerificationRequest.js');

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');

if (!global.__MONGODB_AVAILABLE__) {
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
    userToken = userRes.body.data.token;

    // Create agency user
    const agentRes = await request(app).post('/api/auth/register').send({
      fullName: 'Agent', email: 'agent@example.com', phone: '0800000001', password: 'pass123', role: 'AGENT'
    });

    // Approve agent via direct DB manipulation for test
    const agentUser = await User.findOne({ email: 'agent@example.com' });
    await Agent.create({ user: agentUser._id, status: 'APPROVED' });

    // Create a property belonging to the agent
    const agent = await Agent.findOne({ user: agentUser._id });
    const property = await LandProperty.create({
      title: 'Test Plot', agent: agent._id, listedBy: agentUser._id, landSize: '100sqm', price: 1000000, location: { state: 'Lagos', city: 'Ikeja' }, propertyType: 'RESIDENTIAL'
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
