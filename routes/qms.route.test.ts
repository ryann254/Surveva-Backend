import request from 'supertest';
import httpStatus from 'http-status';
import app from '../app';
import {
  reqCreatePollForQMSLayer1,
  additionalTestPolls,
} from './poll.test.data';
import QMS from '../mongodb/models/qms';
import User from '../mongodb/models/user';
import mongoose from 'mongoose';
import { config } from '../config';
import { reqNewUserQMS, reqLoginUserPoll } from './auth.test.data';

let user;
let accessToken: string;
let categoriesData: Record<string, any>[] = [];
let categoryMap: Map<string, string>;

jest.setTimeout(100000);

describe('QMS integration tests', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoDBUriTestDB);

    // Create a new user then login using their credentials.
    user = await User.create(reqNewUserQMS);
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(reqLoginUserPoll);
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

        categoriesData.push(res);
      })
    );
    // Map categories to their IDs
    categoryMap = new Map(categoriesData.map((cat) => [cat.category, cat.id]));

    // Update additionalTestPolls with category IDs
    const updatedAdditionalPolls = additionalTestPolls.map((poll) => ({
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
      console.log(response.body);

      expect(response.body).toHaveLength(5);
      expect(response.body[0].category).toEqual(
        additionalTestPolls[0].category
      );
      expect(response.body[0].language).toBe('English');
    });

    // test("Layer 2: should return polls matching user's preferred categories and language", async () => {
    //   // Set user preferences
    //   await User.findByIdAndUpdate(user._id, {
    //     categories: ['Technology', 'Science'],
    //     language: 'English',
    //   });

    //   // Populate QMS with some test polls
    //   await QMS.insertMany([
    //     { ...reqCreatePollForQMS, category: 'Technology', language: 'English' },
    //     { ...reqCreatePollForQMS, category: 'Science', language: 'English' },
    //     { ...reqCreatePollForQMS, category: 'Sports', language: 'English' },
    //   ]);

    //   const res = await request(app)
    //     .post('/v1/polls')
    //     .set('Authorization', `Bearer ${access}`)
    //     .send({ ...reqCreatePollForQMS, category: '', language: 'English' })
    //     .expect(httpStatus.CREATED);

    //   expect(res.body).toHaveLength(2);
    //   expect(['Technology', 'Science']).toContain(res.body[0].category);
    //   expect(res.body[0].language).toBe('English');
    // });

    // test('Layer 3: should return polls matching the language of the posted poll', async () => {
    //   // Populate QMS with some test polls
    //   await QMS.insertMany([
    //     { ...reqCreatePollForQMS, category: 'Technology', language: 'Spanish' },
    //     { ...reqCreatePollForQMS, category: 'Science', language: 'Spanish' },
    //     { ...reqCreatePollForQMS, category: 'Sports', language: 'English' },
    //   ]);

    //   const res = await request(app)
    //     .post('/v1/polls')
    //     .set('Authorization', `Bearer ${access}`)
    //     .send({
    //       ...reqCreatePollForQMS,
    //       category: 'Politics',
    //       language: 'Spanish',
    //     })
    //     .expect(httpStatus.CREATED);

    //   expect(res.body.length).toBeGreaterThanOrEqual(2);
    //   expect(res.body[0].language).toBe('Spanish');
    // });

    // test('Layer 4a: should return polls with same category but different language', async () => {
    //   // Populate QMS with some test polls
    //   await QMS.insertMany([
    //     { ...reqCreatePollForQMS, category: 'Technology', language: 'Spanish' },
    //     { ...reqCreatePollForQMS, category: 'Technology', language: 'French' },
    //     { ...reqCreatePollForQMS, category: 'Sports', language: 'English' },
    //   ]);

    //   const res = await request(app)
    //     .post('/v1/polls')
    //     .set('Authorization', `Bearer ${access}`)
    //     .send({
    //       ...reqCreatePollForQMS,
    //       category: 'Technology',
    //       language: 'English',
    //     })
    //     .expect(httpStatus.CREATED);

    //   expect(res.body.length).toBeGreaterThanOrEqual(2);
    //   expect(res.body[0].category).toBe('Technology');
    //   expect(res.body[0].language).toBe('English'); // Assuming translation happened
    // });

    // test("Layer 4b: should return random polls when other layers don't provide enough", async () => {
    //   // Populate QMS with some test polls
    //   await QMS.insertMany(additionalTestPolls);

    //   const res = await request(app)
    //     .post('/v1/polls')
    //     .set('Authorization', `Bearer ${access}`)
    //     .send({
    //       ...reqCreatePollForQMS,
    //       category: 'UnknownCategory',
    //       language: 'UnknownLanguage',
    //     })
    //     .expect(httpStatus.CREATED);

    //   expect(res.body.length).toBeLessThanOrEqual(10);
    //   expect(res.body.length).toBeGreaterThan(0);
    // });

    // test('should return 400 if request body is empty', async () => {
    //   await request(app)
    //     .post('/v1/polls')
    //     .set('Authorization', `Bearer ${accessToken}`)
    //     .send({})
    //     .expect(httpStatus.BAD_REQUEST);
    // });

    // test('should return 401 if accessToken is missing', async () => {
    //   await request(app)
    //     .post('/v1/polls')
    //     .send(reqCreatePollForQMS)
    //     .expect(httpStatus.UNAUTHORIZED);
    // });
  });
});
