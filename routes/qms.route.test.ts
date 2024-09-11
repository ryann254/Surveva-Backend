import request from 'supertest';
import httpStatus from 'http-status';
import app from '../app';
import {
  reqCreatePollForQMSLayer1,
  reqCreatePollForQMSLayer2,
  additionalTestPolls,
  reqCreatePollForQMSLayer3,
  reqCreatePollForQMSLayer4a,
  reqCreatePollForQMSLayer4b,
} from './poll.test.data';
import QMS from '../mongodb/models/qms';
import User from '../mongodb/models/user';
import mongoose from 'mongoose';
import { config } from '../config';
import { reqNewUserQMS, reqLoginUserQMS } from './auth.test.data';

let user;
let accessToken: string;
let categoriesData: Record<string, any>[] = [];
let categoryMap: Map<string, string>;
let reverseCategoryMap: Map<string, string>;
let updatedAdditionalPolls: any[] = [];

jest.setTimeout(100000);

describe('QMS integration tests', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoDBUriTestDB);

    // Create a new user then login using their credentials.
    user = await User.create(reqNewUserQMS);
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(reqLoginUserQMS);
    accessToken = loginResponse.body.tokens.access.token;

    // Create categories
    const categories = [
      'Media and Entertainment',
      'Politics',
      'Sports',
      'Science and Technology',
      'Business',
      'Health and Food',
    ];

    await Promise.all(
      categories.map(async (category) => {
        const res = await request(app)
          .post('/api/v1/category')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: category });

        categoriesData.push(res.body);
      })
    );
    // Map categories to their IDs
    categoryMap = new Map(categoriesData.map((cat) => [cat.name, cat._id]));

    // Create a reverse categoryMap (ID to name)
    reverseCategoryMap = new Map(categoriesData.map((cat) => [cat._id.toString(), cat.name]));

    // Update additionalTestPolls with category IDs
    updatedAdditionalPolls = additionalTestPolls.map((poll) => ({
        ...poll,
        category: categoryMap.get(poll.category) || poll.category,
    }));

    // Populate QMS with updated test polls
    await QMS.insertMany(updatedAdditionalPolls);
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

  describe('POST /api/v1/poll (QMS integration)', () => {
    test('Layer 1: should return polls with same category and language', async () => {
      const response = await request(app)
        .post('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreatePollForQMSLayer1)
        .expect(httpStatus.CREATED);

      expect(response.body).toHaveLength(4);
      expect(reverseCategoryMap.get(response.body[0].category.toString())).toEqual(
        'Science and Technology'
      );
      expect(response.body[0].language).toEqual(updatedAdditionalPolls[0].language);
    });

    test("Layer 2: should return polls matching user's preferred categories and language", async () => {
      // Set user preferences
      Object.assign(user, {categories: [categoryMap.get('Politics')]})
      await user.save();
      
      const res = await request(app)
      .post('/api/v1/poll')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(reqCreatePollForQMSLayer2)
      .expect(httpStatus.CREATED);

      expect(res.body).toHaveLength(5);
      expect(user?.categories[0].toString()).toEqual(res.body[0].category.toString());
      expect(user?.language).toEqual(res.body[0].language);
    });

    test('Layer 3: should return polls matching the language of the posted poll', async () => {
      // Set a non-existing category to skip layer 2 results
      Object.assign(user, {categories: ['66b494e38ca16b2917fa431e']})
      await user.save();
      
      const res = await request(app)
        .post('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreatePollForQMSLayer3)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveLength(6);
      expect(res.body[0].language).toBe('english');
    });

    test('Layer 4a: should return polls with same category but different language', async () => {
      // Set a non-existing category to skip layer 2 results
      Object.assign(user, {categories: ['66b494e38ca16b2917fa431e']})
      await user.save();

      const res = await request(app)
        .post('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreatePollForQMSLayer4a)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveLength(7);
      expect(reverseCategoryMap.get(res.body[0].category.toString())).toEqual('Media and Entertainment');
      expect(res.body[0].language).not.toBe('Spanish');
    });

    test('should return 400 if request body is empty', async () => {
      await request(app)
        .post('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if accessToken is missing', async () => {
      await request(app)
        .post('/api/v1/poll')
        .send(reqCreatePollForQMSLayer1)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
