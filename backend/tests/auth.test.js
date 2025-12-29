const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const User = require('../models/User.js');

const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');

if (!(process.env.MONGODB_URI_TEST || global.__MONGODB_AVAILABLE__)) {
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

    it('should not allow registering as AGENT via public register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'agent@public.com', role: 'AGENT' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin invite & activation flow', () => {
    it('admin can invite agent and invited user can activate', async () => {
      const jwt = require('jsonwebtoken');
      // create admin user directly
      const admin = await User.create({ fullName: 'Admin', email: 'admin@garka.com', phone: '000', password: 'pass', role: 'ADMIN' });
      const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

      // invite
      const inviteRes = await request(app)
        .post('/api/auth/invite')
        .set('Authorization', `Bearer ${token}`)
        .send({ officialEmail: 'invitee@garka.com', role: 'AGENT' });

      expect(inviteRes.statusCode).toBe(200);
      expect(inviteRes.body.success).toBe(true);
      expect(inviteRes.body.data).toHaveProperty('activationToken');

      const activationToken = inviteRes.body.data.activationToken;

      // activate
      const activateRes = await request(app)
        .post('/api/auth/activate')
        .send({ token: activationToken, password: 'newpassword', fullName: 'Invited Agent', phone: '111' });

      expect(activateRes.statusCode).toBe(200);
      expect(activateRes.body.success).toBe(true);
      expect(activateRes.body.data).toHaveProperty('token');

      // login as activated user
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invitee@garka.com', password: 'newpassword' });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
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

    it('logout should blacklist token', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const login = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
      const token = login.body.data.token;

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(200);

      // subsequent access should be unauthorized
      const me = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(me.statusCode).toBe(401);
    });
  });
  });
}
// Tests use the shared Jest setup (mongodb-memory-server) and CommonJS imports above
