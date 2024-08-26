import request from 'supertest';
import app from '../app';
import { reqCreateUser, reqUpdateUser } from './user.test.data';
import { reqLoginUser } from './auth.test.data';

require('dotenv').config();

let accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmIzMTk3NWVlM2RmMzFlMDVlMmFiOWQiLCJpYXQiOjE3MjQ2ODkzMjMsImV4cCI6MTcyNDY5NjUyMywidHlwZSI6ImFjY2VzcyJ9.WfGMWFjsEGR85dc8-AJiFtaIHQsmK0xlNCa0pJU8_sY';
let refreshToken = '';
let userId = '';

jest.setTimeout(20000);

describe('POST /api/v1/user', () => {
  describe('given required user details(username, email, role, dob, location, language, gender and categories)', () => {
    test('Should create and save user details to db', async () => {
      const response = await request(app)
        .post('/api/v1/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreateUser);
      console.log(response.status, 'status');
      console.log(response.body, 'body');

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
