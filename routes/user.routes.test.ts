import request from 'supertest';
import app from '../app';
import { reqCreateUser, reqUpdateUser } from './user.test.data';
import { reqLoginUser2, reqNewUser2 } from './auth.test.data';
import mongoose from 'mongoose';
import { config, logger } from '../config';
import User from '../mongodb/models/user';
import QMS from '../mongodb/models/qms'; // Add this import if not already present

let accessToken = '';
let userId = '';
let user;
// Simulate trying to update another user's profile.
let differentUserId = '';

jest.setTimeout(100000);

describe('Create, Update, Read and Delete Users', () => {
  beforeAll(async () => {
    // Create a new user then login using their credentials.
    user = await User.create(reqNewUser2);
    userId = user._id as string;
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(reqLoginUser2);
    accessToken = loginResponse.body.tokens.access.token;
  });

  afterAll(async () => {
    // Delete all the data in collections
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
  });

  describe('Unauthorized access', () => {
    test('should return an unauthorized access status and error', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', 'Bearer token')
        .send(reqCreateUser);
      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Please authenticate');
    });
  });

  describe('POST /api/v1/user', () => {
    test('should create and save user details to db', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreateUser);

      differentUserId = response.body._id;

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(201);
      expect(response.body.email).toEqual(reqCreateUser.email);
    });

    test('should return a bad request status and error message', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({email: 'test@test.com'});
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
    });
  });

  describe('GET /api/v1/user', () => {
    test('should return a user', async () => {
      const response = await request(app)
        .get(`/api/v1/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.email).toEqual(reqNewUser2.email);
    });

    test('should return not found request status and error message', async () => {
      const response = await request(app)
        .get(`/api/v1/user/666161869d833b40c6a14051`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('User not found');
    });
  });

  describe('PATCH /api/v1/user', () => {
    test('should update user details', async () => {
      const response = await request(app)
        .patch(`/api/v1/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdateUser);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.email).not.toEqual(reqNewUser2.email);
    });

    test('should return a forbidden request status and error message', async () => {
      const response = await request(app)
        .patch(`/api/v1/user/${differentUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdateUser);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(403);
      expect(response.body.message).toEqual(
        "You're Not allowed to perform this action"
      );
    });
  });

  describe('DELETE /api/v1/user', () => {
    test('should return a forbidden request status and error message', async () => {
      const response = await request(app)
        .delete(`/api/v1/user/${differentUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(403);
      expect(response.body.message).toEqual(
        "You're Not allowed to perform this action"
      );
    });

    // Delete the user last as deleting the user will also delete the accessToken.
    test('should delete a user', async () => {
      const response = await request(app)
        .delete(`/api/v1/user/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('User deleted successfully');

      // Verify that the user is deleted
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();

      // Verify that all QMS documents are deleted
      const qmsCount = await QMS.countDocuments();
      expect(qmsCount).toBe(0);
    });
  });
});
