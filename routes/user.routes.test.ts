import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import { reqCreateUser, reqUpdateUser } from './user.test.data';
import { reqLoginUser } from './auth.test.data';

require('dotenv').config();

let accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmIzMTk3NWVlM2RmMzFlMDVlMmFiOWQiLCJpYXQiOjE3MjQzMzkyMjcsImV4cCI6MTcyNDM0NjQyNywidHlwZSI6ImFjY2VzcyJ9.rTcDHMciOlqWnzOa0iybw-9pcOkJ4JZb7iEq2mcQAaI';
let refreshToken = '';
let userId = '';
describe('POST /api/v1/user', () => {
  // beforeAll(async () => {
  //   console.log('here');
  //   const response = await request(app)
  //     .post('/api/v1/auth/login')
  //     .send(reqLoginUser);

  //   accessToken = response.body.data.tokens.access.token;
  //   refreshToken = response.body.data.tokens.refresh.token;
  // });

  // afterAll(async () => {
  //   await request(app).post('/api/v1/auth/logout').send({ refreshToken });

  //   accessToken = '';
  //   refreshToken = '';
  // });

  describe('given required user details(username, email, role, dob, location, language, gender and categories)', () => {
    test('Should create and save user details to db', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreateUser)
        .expect('Content-Type', /json/)
        .expect(201);

      userId = response.body._id;
      const mockUserResponse = {
        _id: userId,
        ...reqCreateUser,
      };

      expect(response.body).toEqual(mockUserResponse);
    });
  });

  describe('when missing required user details', () => {
    // Should respond with a 400 status code
    // Should respond with a json object containing the error message
    // Should specify json in the content type header
  });
});
