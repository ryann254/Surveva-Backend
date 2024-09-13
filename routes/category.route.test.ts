import request from 'supertest';
import app from '../app';
import { reqCreateCategory, reqUpdateCategory } from './category.test.data';
import { reqNewUserCategory, reqLoginUserCategory } from './auth.test.data';
import mongoose from 'mongoose';
import { config, logger } from '../config';
import User from '../mongodb/models/user';

let accessToken = '';
let categoryId = '';

jest.setTimeout(100000);

describe('Create, Update, Read and Delete Categories', () => {
  beforeAll(async () => {
    const mongoUri = config.nodeEnv === 'development' ? config.mongoDBUriTestDB : config.mongoDBUriProdTestDB;
    await mongoose.connect(mongoUri);

     // Add retry logic for MongoDB connection
     const maxRetries = 3;
     const retryInterval = 2000; // 2 seconds
 
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         await mongoose.connect(mongoUri);
         if (mongoose.connection.readyState === 1) {
           logger.info('MongoDB connection successful');
           break;
         }
       } catch (error) {
         console.error(`Attempt ${attempt}: MongoDB connection failed`);
         if (attempt === maxRetries) {
           throw new Error('Failed to connect to MongoDB after multiple attempts');
         }
         await new Promise(resolve => setTimeout(resolve, retryInterval));
       }
     }

    // Create a new user then login using their credentials.
    await User.create(reqNewUserCategory);
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(reqLoginUserCategory);
    accessToken = loginResponse.body.tokens.access.token;
  });

  afterAll(async () => {
    // Delete all the data in collections
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
    // Close the mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('Unauthorized access', () => {
    test('should return an unauthorized access status and error', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .set('Authorization', 'Bearer token')
        .send(reqCreateCategory);
      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Please authenticate');
    });
  });

  describe('POST /api/v1/category', () => {
    test('should create and save category details to db', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreateCategory);

      categoryId = response.body._id;

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(201);
      expect(response.body.name).toEqual(reqCreateCategory.name);
    });

    test('should return a bad request status and error message', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({people: 'Nami'});
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
    });
  });

  describe('GET /api/v1/category', () => {
    test('should return a categories', async () => {
      const response = await request(app)
        .get(`/api/v1/category`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/v1/category', () => {
    test('should update category details', async () => {
      const response = await request(app)
        .patch(`/api/v1/category/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdateCategory);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.name).toEqual(reqUpdateCategory.name);
    });

    test('should return a not found request status and error message', async () => {
      const response = await request(app)
        .patch(`/api/v1/category/666161869d833b40c6a14051`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdateCategory);
        
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/does not exist/i);
    });
  });

  describe('DELETE /api/v1/category', () => {
    test('should delete a category', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Deleted category successfully');
    });

    test('should return a not found request status and error message', async () => {
      const response = await request(app)
        .delete(`/api/v1/category/666161869d833b40c6a14051`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Category not found');
    });
  });
});
