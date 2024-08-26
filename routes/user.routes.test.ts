import request from 'supertest';
import app from '../app';
import { reqCreateUser, reqUpdateUser } from './user.test.data';
import { reqLoginUser } from './auth.test.data';

require('dotenv').config();

let accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmIzMTk3NWVlM2RmMzFlMDVlMmFiOWQiLCJpYXQiOjE3MjQ2ODUyNzcsImV4cCI6MTcyNDY5MjQ3NywidHlwZSI6ImFjY2VzcyJ9.bvje-VD3lZmUCRjPP1XZydhY1i2R9-bV4jBvyHqGhi8';
let refreshToken = '';
let userId = '';

describe('POST /api/v1/user', () => {
  describe('given required user details(username, email, role, dob, location, language, gender and categories)', () => {
    test('Should create and save user details to db', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreateUser);
      console.log(response.headers['content-type'], 'here');

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
