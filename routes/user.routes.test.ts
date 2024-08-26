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

jest.setTimeout(100000);

describe('POST /api/v1/user', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoDBUriTestDB);

    // Create a new user then login using their credentials.
    await User.create(reqNewUser);
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(reqLoginUser);
    accessToken = loginResponse.body.tokens.access.token;
    refreshToken = loginResponse.body.tokens.refresh.token;
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
  });

  afterAll(async () => {
    // Log out and delete the user created in the beforeAll
    await request(app).post('/api/v1/auth/logout').send({
      refreshToken,
    });
    await User.deleteOne({ email: reqNewUser.email });
    await mongoose.disconnect();
  });

  describe('given required user details(username, email, role, dob, location, language, gender and categories)', () => {
    test('Should create and save user details to db', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreateUser);

      userId = response.body._id;
      const mockUserResponse = {
        _id: userId,
        ...reqCreateUser,
      };

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUserResponse);
    });
  });

  describe('when missing required user details', () => {
    // Should respond with a 400 status code
    // Should respond with a json object containing the error message
    // Should specify json in the content type header
  });
});
