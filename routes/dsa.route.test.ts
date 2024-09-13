import request from 'supertest';
import httpStatus from 'http-status';
import app from '../app';
import {
  dsaLayer1Polls,
} from './poll.test.data';
import QMS from '../mongodb/models/qms';
import ServedPoll from '../mongodb/models/served_poll';
import User from '../mongodb/models/user';
import mongoose from 'mongoose';
import { config } from '../config';
import { reqNewUserDSA, reqNewUserDSA2, reqLoginUserDSA,  } from './auth.test.data';
import { DSALayers } from '../config';

let user;
let user2;
let accessToken: string;
let categoriesData: Record<string, any>[] = [];
let categoryMap: Map<string, string>;
let updatedAdditionalPolls: any[] = [];

jest.setTimeout(100000);

describe('DSA integration tests', () => {
  beforeAll(async () => {
    const mongoUri = config.nodeEnv === 'development' ? config.mongoDBUriTestDB : config.mongoDBUriProdTestDB;
    await mongoose.connect(mongoUri);

    // Create a new user then login using their credentials.
    user = await User.create(reqNewUserDSA);
    user2 = await User.create(reqNewUserDSA2);
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(reqLoginUserDSA);
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

    const qmsPolls = dsaLayer1Polls.slice(0, 6)
    // Update qmsPolls with category IDs
     const updatedQMSPolls = qmsPolls.map((poll) => ({
        ...poll,
        category: categoryMap.get(poll.category) || poll.category,
        owner: user._id,
    }));

    // Populate QMS with updated test polls
    await QMS.insertMany(updatedQMSPolls);
    
    // Populate ServedPoll with some test polls
    const servedPolls = dsaLayer1Polls.slice(6);
    const updatedServedPolls = servedPolls.map((poll) => ({
        ...poll,
        category: categoryMap.get(poll.category) || poll.category,
        owner: user2._id,
    }));
    await ServedPoll.insertMany(updatedServedPolls);
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

  describe('GET /api/v1/poll (Discovery Section Algorithm)', () => {
    test('Layer 1: should return polls matching user\'s preferred categories and language', async () => {
      // Set user preferences
      Object.assign(user, {
        categories: [categoryMap.get('Science and Technology'), categoryMap.get('Media and Entertainment')],
        language: 'English',
      });
      await user.save();
      
      const response = await request(app)
        .get('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ dsaLayer: DSALayers.LAYER_1, page: 1, categoryIndex: 0 })
        .expect(httpStatus.OK);

      expect(response.body.docs).toHaveLength(10);
      expect(response.body.docs[0].category.toString()).toBe(user.categories[0].toString());
      expect(response.body.categoryIndexInt).toBe(1);
      expect(response.body.docs[0].language).toBe(user.language);
    });

    test('Layer 2: should return trending polls in user\'s geographical region', async () => {
      // Set user preferences to non-existing category to trigger Layer 2
      Object.assign(user, {
        categories: [categoryMap.get('Health and Food'), categoryMap.get('Business')],
        language: 'English',
      });
      await user.save();
      
      const response = await request(app)
      .get('/api/v1/poll')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ dsaLayer: DSALayers.LAYER_1, page: 1, categoryIndex: 0 })
      .expect(httpStatus.OK);
      
      expect(response.body.docs).toHaveLength(6);
      expect(response.body.docs[0].owner.location.country).toBe(user.location.country);
    });

    test('should return 401 if accessToken is missing', async () => {
      await request(app)
        .get('/api/v1/poll')
        .query({ dsaLayer: DSALayers.LAYER_1, page: 1, categoryIndex: 0 })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if dsaLayer is missing', async () => {
      await request(app)
        .get('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, categoryIndex: 0 })
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
