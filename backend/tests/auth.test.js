const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const User = require('../models/User.js');

const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');

if (!global.__MONGODB_AVAILABLE__) {
  console.warn('Skipping authentication tests: MongoDB not available');
  test.skip('Skipping authentication tests: MongoDB not available', () => {});
} else {
  describe('Authentication API', () => {
  let testUser;
  
  beforeAll(async () => {});
  
  afterAll(async () => {});
  
  beforeEach(async () => {
    await User.deleteMany({});
    
    testUser = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123'
    };
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(testUser.email);
    });
    
    it('should not register duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
  });
}
// Tests use the shared Jest setup (mongodb-memory-server) and CommonJS imports above
