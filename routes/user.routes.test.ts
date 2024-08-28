import request from 'supertest';
import app from '../app';
import { reqCreateUser, reqUpdateUser } from './user.test.data';
import { reqLoginUser, reqNewUser } from './auth.test.data';
import mongoose from 'mongoose';
import { config } from '../config';
import User from '../mongodb/models/user';

require('dotenv').config();

let accessToken = '';
let refreshToken = '';
let userId = '';
// Simulate trying to update another user's profile.
let differentUserId = '';

jest.setTimeout(100000);

describe('Create, Update, Read and Delete Users', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoDBUriTestDB);

    // Create a new user then login using their credentials.
    const user = await User.create(reqNewUser);
    userId = user._id as string;
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(reqLoginUser);
    accessToken = loginResponse.body.tokens.access.token;
    refreshToken = loginResponse.body.tokens.refresh.token;
  });

  afterAll(async () => {
    // Log out and delete the user created in the beforeAll
    await request(app).post('/api/v1/auth/logout').send({
      refreshToken,
    });
    // Delete all the data in collections
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
    await mongoose.disconnect();
  });

  describe('Unauthorized access', () => {
    test('should return an unauthorized access status and error', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', 'Bearer token')
        .send(reqCreateUser);
      console.log(response.status);
      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized user');
    });
  });

  describe('POST /api/v1/user', () => {
    test('should create and save user details to db', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreateUser);

      differentUserId = response.body._id;
      const mockUserResponse = {
        _id: response.body._id,
        ...reqCreateUser,
      };

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUserResponse);
    });

    test('should return a bad request status and error message', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        'User was not created, kindly check the details and try again'
      );
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
      expect(response.body.email).not.toEqual(reqNewUser.email);
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
});
