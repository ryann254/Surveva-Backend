import request from 'supertest';
import app from '../app';
import { reqLoginUser, reqNewUser } from './auth.test.data';
import mongoose from 'mongoose';
import { config } from '../config';

jest.setTimeout(100000);

let refreshToken = '';
describe('Authentication Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoDBUriTestDB);
  });

  afterAll(async () => {
    // Delete all the data in collections
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
    await mongoose.disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(reqNewUser);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(reqNewUser.email);
    });

    test('should return a bad request for duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(reqNewUser);
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(reqNewUser);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email already taken/i);
    });

    test('should return a bad request for missing user details', async () => {
      reqNewUser.role = '';
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(reqNewUser);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login a user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(reqLoginUser);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(reqLoginUser.email);

      refreshToken = response.body.tokens.refresh.token;
    });

    test('should return unauthorized for incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ ...reqLoginUser, email: 'test@test.com' });

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/incorrect email or password/i);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    test('should logout a user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      // No content-type check for 204 status as there's no content
      expect(response.status).toBe(204);
    });

    test('should return not found for invalid refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/logout').send({
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmNmMjJmMTVlZTA3MmZmZmYyYTQyNjQiLCJpYXQiOjE3MjUzNTA5NjIsImV4cCI6MTcyNTM1ODE2MiwidHlwZSI6ImFjY2VzcyJ9.YsiPHvIj37BG1qppq-4uCkaFSM2ceX93-hOUQDpkUB8',
      });

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid refresh token/i);
    });
  });

  describe('POST /api/v1/auth/refresh-tokens', () => {
    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(reqLoginUser);
      refreshToken = loginResponse.body.tokens.refresh.token;
    });

    test('should refresh tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({ refreshToken });

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });

    test('should return expired status for expired refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmNmMjJmMTVlZTA3MmZmZmYyYTQyNjQiLCJpYXQiOjE3MjUzNTA5NjIsImV4cCI6MTcyNTM1ODE2MiwidHlwZSI6ImFjY2VzcyJ9.YsiPHvIj37BG1qppq-4uCkaFSM2ceX93-hOUQDpkUB8',
        });

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/jwt expired/i);
    });

    test('should return invalid status for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-tokens')
        .send({
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmNmMjJmMTVlZTA3MmZmZmYyYTQyNjQiLCJpYXQiOjE3MjUzNTA5NjIsImV4cCI6MTcyNTM1ODE2MiwidHlwZSI6ImFjY2VzcyJ9.YsiPHvIj37BG1qppq-4uCkaFSM2ceX93',
        });

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid signature/i);
    });
  });

  // Additional tests for other auth routes can be added here
  // Such as forgot-password, reset-password, send-verification-email, verify-email

  describe('POST /api/v1/auth/forgot-password', () => {
    test('should send reset password email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: reqNewUser.email });
      console.log(response.status, response.body);
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resetPasswordToken');
    });

    test('should return not found for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/User not found/i);
    });
  });

  // TODO: reset-password, send-verification-email, and verify-email routes might require more complex setup to test properly, as they involve tokens that are typically sent via email(Cypress/Playwright tests).
});
