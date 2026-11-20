const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Lead = require('../models/Lead');

const request = supertest(app);

describe('Lead Management & Dashboard API Suite', () => {
  const timestamp = Date.now();
  let user1Token = '';
  let user2Token = '';
  let user1LeadId = '';
  let user1Lead2Id = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Register User 1
    const u1 = await request.post('/api/auth/register').send({
      name: 'Primary Agent',
      email: `agent1_${timestamp}@example.com`,
      password: 'Password123!',
    });
    user1Token = u1.body.token;

    // Register User 2 (for multi-tenant isolation tests)
    const u2 = await request.post('/api/auth/register').send({
      name: 'Secondary Agent',
      email: `agent2_${timestamp}@example.com`,
      password: 'Password123!',
    });
    user2Token = u2.body.token;
  });

  afterAll(async () => {
    // Clean up created test data
    await Lead.deleteMany({ email: { $regex: 'testlead_' } });
    await User.deleteMany({ email: { $regex: `_${timestamp}@example.com` } });
    await mongoose.disconnect();
  });

  describe('POST /api/leads', () => {
    it('should create a lead with valid inputs with HTTP 201', async () => {
      const res = await request
        .post('/api/leads')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Robert Stark',
          email: `testlead_robert_${timestamp}@starkcorp.com`,
          phone: '+1 555-0143',
          company: 'Stark Enterprises',
          source: 'LinkedIn',
          status: 'New',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.lead).toBeDefined();
      expect(res.body.lead.name).toBe('Robert Stark');
      expect(res.body.lead.status).toBe('New');
      user1LeadId = res.body.lead._id;
    });

    it('should create a second lead with different status with HTTP 201', async () => {
      const res = await request
        .post('/api/leads')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Elena Rostova',
          email: `testlead_elena_${timestamp}@rostova.org`,
          phone: '+1 555-0199',
          company: 'Rostova Capital',
          source: 'Website',
          status: 'Qualified',
        });

      expect(res.status).toBe(201);
      user1Lead2Id = res.body.lead._id;
    });

    it('should reject lead creation if required fields are missing with HTTP 400', async () => {
      const res = await request
        .post('/api/leads')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: '',
          company: 'No Name Corp',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject lead creation if email format is invalid with HTTP 400', async () => {
      const res = await request
        .post('/api/leads')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'John Doe',
          email: 'not-an-email',
          phone: '+1 555-0100',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject lead creation if phone format is invalid with HTTP 400', async () => {
      const res = await request
        .post('/api/leads')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '12',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/leads (Search, Filter, Pagination)', () => {
    it('should fetch user leads with pagination metadata with HTTP 200', async () => {
      const res = await request
        .get('/api/leads')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(res.body.leads)).toBe(true);
    });

    it('should search leads by name accurately', async () => {
      const res = await request
        .get('/api/leads?search=Robert')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.leads[0].name).toBe('Robert Stark');
    });

    it('should filter leads by status accurately', async () => {
      const res = await request
        .get('/api/leads?status=Qualified')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.leads[0].status).toBe('Qualified');
      expect(res.body.leads[0].name).toBe('Elena Rostova');
    });
  });

  describe('GET /api/leads/:id', () => {
    it('should retrieve a single lead by ID with HTTP 200', async () => {
      const res = await request
        .get(`/api/leads/${user1LeadId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.lead._id).toBe(user1LeadId);
    });

    it('should return HTTP 400 for invalid MongoDB ObjectId', async () => {
      const res = await request
        .get('/api/leads/invalid-id-format')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/leads/:id', () => {
    it('should update lead details and change status with HTTP 200', async () => {
      const res = await request
        .put(`/api/leads/${user1LeadId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          status: 'Contacted',
          company: 'Stark Industries Global',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.lead.status).toBe('Contacted');
      expect(res.body.lead.company).toBe('Stark Industries Global');
    });
  });

  describe('User-Specific Lead Access & Multi-tenant Isolation', () => {
    it('User 2 should have 0 leads in their directory (clean isolation)', async () => {
      const res = await request
        .get('/api/leads')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.leads.length).toBe(0);
    });

    it('User 2 should be rejected with HTTP 404 when attempting to view User 1 lead', async () => {
      const res = await request
        .get(`/api/leads/${user1LeadId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('User 2 should be rejected with HTTP 404 when attempting to update User 1 lead', async () => {
      const res = await request
        .put(`/api/leads/${user1LeadId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Tampered Name' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('User 2 should be rejected with HTTP 404 when attempting to delete User 1 lead', async () => {
      const res = await request
        .delete(`/api/leads/${user1LeadId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return accurate live database statistics for user with HTTP 200', async () => {
      const res = await request
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.totalLeads).toBe(2);
      expect(res.body.stats.contactedLeads).toBe(1);
      expect(res.body.stats.qualifiedLeads).toBe(1);
      expect(res.body.statusDistribution).toBeDefined();
      expect(res.body.recentLeads.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    it('should delete lead by owner with HTTP 200 and remove it from database', async () => {
      const res = await request
        .delete(`/api/leads/${user1Lead2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify lead is gone
      const checkRes = await request
        .get(`/api/leads/${user1Lead2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(checkRes.status).toBe(404);
    });
  });
});
