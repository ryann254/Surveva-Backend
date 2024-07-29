import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Request } from 'express';
import QMS, { IQMSDoc, IQMSSchema } from '../mongodb/models/qms';
import httpStatus from 'http-status';
import { ApiError } from '../errors';
import OpenAI from 'openai';
import { config, logger } from '../config';
import Category from '../mongodb/models/category';
import { getAllCategories } from './category.service';
import { stringToObject } from '../utils/stringToObject';

/**
 * Create a poll
 * @param {IPollData} pollBody
 * @returns {Promise<IQMSDoc>}
 */
export const createPoll = async (pollBody: IQMSSchema): Promise<IQMSDoc> =>
  QMS.create(pollBody);

/**
 * Get all polls
 * @returns {Promise<IQMSDoc[]>}
 */
export const getAllPolls = async (): Promise<IQMSDoc[]> => QMS.find({});

/**
 * Get poll by Id
 * @param {mongoose.Types.ObjectId} pollId
 * @returns {Promise<IQMSDoc | null>}
 */
export const getPollById = async (
  pollId: mongoose.Types.ObjectId
): Promise<IQMSDoc | null> => QMS.findById(pollId);

/**
 * Search polls
 * @param {string} searchTerm
 * @returns {Promise<IQMSDoc[]>}
 */
export const searchPolls = async (searchTerm: string): Promise<IQMSDoc[]> => {
  const results = await QMS.aggregate([
    {
      $match: {
        $expr: {
          $regexMatch: { input: '$question', regex: searchTerm, options: 'i' },
        },
      },
    },
    { $limit: 10 },
  ]).exec();
  return results;
};

/**
 * Update a poll
 * @param {mongoose.Types.ObjectId} pollId
 * @param {Partial<IPollData>} pollBody
 * @returns {Promise<IQMSDoc>}
 */
export const updatePoll = async (
  pollId: mongoose.Types.ObjectId,
  pollBody: IQMSSchema
): Promise<IQMSDoc> => {
  const poll = await getPollById(pollId);

  if (!poll)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Poll with id: ${pollId} does not exist`
    );

  Object.assign(poll, pollBody);
  await poll.save();
  return poll;
};

/**
 * Delete poll
 * @param {mongoose.Types.ObjectId} pollId
 */
export const deletePoll = async (pollId: mongoose.Types.ObjectId) =>
  QMS.findOneAndDelete({ _id: pollId });

/**
 * Verify the poll belongs to a user
 * @param {Request} req
 * @returns {boolean}
 */
export const verifyPollOwnership = async (req: Request): Promise<boolean> => {
  // Admins have rights to update all polls.
  if (req.user.role === 'admin') return true;

  const pollDoc = await getPollById(req.params.pollId);
  if (!pollDoc) throw new ApiError(httpStatus.BAD_REQUEST, 'Poll Not found');

  return pollDoc.owner.toString() === req.user._id.toString();
};

/**
 * Checks if content is harmful using Open Ai's API
 * @param {string} question
 * @returns {boolean}
 */
export const checkForModeration = async (question: string) => {
  const openai = new OpenAI({ apiKey: config.openAiApiSecretKey });
  const moderation = await openai.moderations.create({
    input: question,
  });

  return moderation.results[0].flagged;
};

/**
 * Check for category and language using Open Ai's API
 * @param {IQMSSchema} parsedPoll
 */
export const checkForCategoryAndLanguageOpenAI = async (
  parsedPoll: IQMSSchema
): Promise<IQMSSchema> => {
  const openai = new OpenAI({
    apiKey: config.openAiApiSecretKey,
  });

  const categories = await getAllCategories();
  let numberOfRetries = 0;
  const prompt = `Here are some categories: ${categories.map(
    (category) => category.name
  )}. Based on the categories provided, what category does the following text belong to(only return the categories provided, if there's no match return the closest matching category), and what language is it written in: ${
    parsedPoll.question
  }. Structure the response as follows: {categoroy: category_name, language: language_name}`;

  const languageAndCategory = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompt,
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  const response = languageAndCategory.choices[0].message.content;
  const result = stringToObject(response);

  // If OpenAI starts to hallucinate(give wrong answers), retry one time.
  if (!result && numberOfRetries < 1) {
    logger.info('Retrying Category and Language dection through OpenAI...');
    numberOfRetries++;
    checkForCategoryAndLanguageOpenAI(parsedPoll);
  }

  // If the category and language are found update the parsedPoll object.
  if (result) {
    const categoryId = categories.find(
      (category) => category.name === result.category
    )?.id;
    parsedPoll.category = categoryId;
    parsedPoll.language = result.language;
  }
  return parsedPoll;
};
