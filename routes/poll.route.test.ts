import request from 'supertest';
import app from '../app';
import {
  reqCreatePoll,
  reqUpdatePoll,
  reqCreatePollHarmful,
  reqUpdatePollActionTypeVoted,
  reqUpdatePollActionTypeCommented,
  reqUpdatePollActionTypeLiked,
  reqSearchPoll,
} from './poll.test.data';
import { reqNewUserPoll, reqLoginUserPoll } from './auth.test.data';
import mongoose from 'mongoose';
import { config, logger } from '../config';
import User, { IUserDoc } from '../mongodb/models/user';
import QMS from '../mongodb/models/qms';
import Category from '../mongodb/models/category';

let accessToken = '';
let pollId = '';
let user: IUserDoc | null = null;

jest.setTimeout(100000);

describe('Create, Update, Read and Delete Polls', () => {

  beforeAll(async () => {
    user = await User.create(reqNewUserPoll);
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

    // Insert all categories at once
    await Category.insertMany(categories.map(name => ({ name })));

    // Create a test poll
    reqCreatePoll.owner = user?._id as string;
    await request(app).post('/api/v1/poll').set('Authorization', `Bearer ${accessToken}`).send(reqCreatePoll)
  });

  afterAll(async () => {
  // Delete all the data in collections
  await Promise.all(
    Object.values(mongoose.connection.collections).map(async (collection) =>
      collection.deleteMany({})
    )
  );
});

  describe('POST /api/v1/poll', () => {
    test('should create and save poll details to db', async () => {
      const response = await request(app)
        .post('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreatePoll);

      pollId = response.body[0]._id;

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(201);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].question).toEqual(reqCreatePoll.question);
    });

    test('should return a bad request status and content is harmful message', async () => {
      // Add the current user as the poll owner
      reqCreatePollHarmful.owner = user?._id as string;

      const response = await request(app)
        .post('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqCreatePollHarmful);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        'The content you have posted is potentially harmful. Edit it and try again'
      );
    });

    test('should return a bad request status and error message', async () => {
      const response = await request(app)
        .post('/api/v1/poll')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          question: 'Who is the first president of Venuzuela?',
        });

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/required/i);
    });
  });

  describe('GET /api/v1/poll', () => {
    test('should return all polls', async () => {
      const response = await request(app)
        .get(`/api/v1/poll?page=1&categoryIndex=0&dsaLayer=layer 1`)
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.docs.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/poll/:pollId', () => {
    test('should return a specific poll', async () => {
      const response = await request(app)
        .get(`/api/v1/poll/${pollId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toEqual(pollId.toString());
    });

    test('should return a poll that matches the search query', async () => {
      const searchQuery = "Who's the best written character in Demon Slayer?"
      await QMS.create(reqSearchPoll);

      const response = await request(app).get(`/api/v1/poll/search/${searchQuery}`).set('Authorization', `Bearer ${accessToken}`)
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
      expect(response.body[0].question).toEqual(searchQuery)
    })

    test('should return a not found request status and error message', async () => {
      const response = await request(app)
        .get(`/api/v1/poll/666161869d833b40c6a14111`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/i);
    });
  });

  describe('PATCH /api/v1/poll/:pollId', () => {
    test('should update poll details', async () => {
      reqUpdatePoll.owner = user?._id as string;
      const response = await request(app)
        .patch(`/api/v1/poll/${pollId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePoll);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.question).toEqual(reqUpdatePoll.question);
    });

    test('should update popularityCount and create a new response', async () => {
      const poll = await request(app).post('/api/v1/poll').set('Authorization', `Bearer ${accessToken}`).send(reqCreatePoll)
      await request(app)
        .patch(`/api/v1/poll/${pollId}?actionType=clicked`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePoll);

      const response = await request(app)
        .patch(`/api/v1/poll/${pollId}?actionType=voted`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePollActionTypeVoted);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.poll.popularityCount).toEqual(11);
      expect(response.body.poll.responses.length).toBeGreaterThan(0);
      expect(response.body.resetCategoryIndex).toBe(false);
    });

    test('should update popularityCount and likes', async () => {
      await request(app)
        .patch(`/api/v1/poll/${pollId}?actionType=clicked`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePoll);

      const responseLiked = await request(app)
        .patch(`/api/v1/poll/${pollId}?actionType=liked`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePollActionTypeLiked);

      expect(responseLiked.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(responseLiked.status).toBe(200);
      expect(responseLiked.body.poll.popularityCount).toEqual(23);
      expect(responseLiked.body.poll.likes).toEqual(1);
    });

    test('should update popularityCount and comments', async () => {
      const poll = await request(app).post('/api/v1/poll').set('Authorization', `Bearer ${accessToken}`).send(reqCreatePoll)
      await request(app)
        .patch(`/api/v1/poll/${pollId}?actionType=clicked`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePoll);

      const responseCommented = await request(app)
        .patch(`/api/v1/poll/${pollId}?actionType=commented`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePollActionTypeCommented);

      expect(responseCommented.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(responseCommented.status).toBe(200);
      expect(responseCommented.body.poll.popularityCount).toEqual(37);
      expect(responseCommented.body.poll.comments.length).toEqual(1);
    });

    test('should return a not found request status and error message', async () => {
      const response = await request(app)
        .patch(`/api/v1/poll/666161869d833b40c6a14051`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(reqUpdatePoll);
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/does not exist/i);
    });
  });

  describe('DELETE /api/v1/poll/:pollId', () => {
    test('should delete a poll', async () => {
      const poll = await request(app).post('/api/v1/poll').set('Authorization', `Bearer ${accessToken}`).send(reqCreatePoll)
      const response = await request(app)
        .delete(`/api/v1/poll/${pollId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toEqual('Poll deleted successfully');
    });

    test('should return a not found request status and error message', async () => {
      const response = await request(app)
        .delete(`/api/v1/poll/666161869d833b40c6a14051`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/i);
    });
  });
});
