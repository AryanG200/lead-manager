const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../server');
const User = require('../models/User');

const request = supertest(app);

describe('Authentication API Suite', () => {
  const timestamp = Date.now();
  const testEmail = `auth_test_${timestamp}@example.com`;
  const testPassword = 'Password123!';
  let authToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up created test user
    await User.deleteMany({ email: { $regex: 'auth_test_' } });
    await mongoose.disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with HTTP 201 and return JWT token', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'Screening Candidate',
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.user.password).toBeUndefined(); // Never expose password
      authToken = res.body.token;
    });

    it('should reject registration if email is already registered with HTTP 400', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: testEmail,
          password: 'AnotherPassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with invalid email format with HTTP 400', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'Invalid Email User',
          email: 'invalid-email-format',
          password: testPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with password shorter than 6 characters with HTTP 400', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'Short Pass User',
          email: `short_${timestamp}@example.com`,
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration if required fields are missing with HTTP 400', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user with valid credentials and return JWT with HTTP 200', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });

    it('should reject login with wrong password with HTTP 401', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'IncorrectPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login for non-existent email with HTTP 401', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({
          email: `nonexistent_${timestamp}@example.com`,
          password: testPassword,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current authenticated user profile with valid Bearer token with HTTP 200', async () => {
      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject requests with no authentication token with HTTP 401', async () => {
      const res = await request.get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no authentication token/i);
    });

    it('should reject requests with invalid or forged token with HTTP 401', async () => {
      const res = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer forged_invalid_jwt_token_123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
