import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Request } from 'express';
import QMS, {
  IQMSDoc,
  IQMSSchema,
  openAIResponseObject,
} from '../mongodb/models/qms';
import httpStatus from 'http-status';
import { ApiError } from '../errors';
import OpenAI from 'openai';
import { zodFunction } from 'openai/helpers/zod';
import { config, logger } from '../config';
import { getAllCategories } from './category.service';
import { jsonToObject, stringToObject } from '../utils/stringToObject';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ServedPoll, { ServedPollObject } from '../mongodb/models/served_poll';

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
 * Check for category and language using Gemini 1.5 Flash API
 * @param {IQMSSchema} parsedPoll
 */
export const checkForCategoryAndLanguageGeminiFlash = async (
  parsedPoll: IQMSSchema
): Promise<IQMSSchema> => {
  const geminiAi = new GoogleGenerativeAI(config.geminiAiApiSecretKey);
  const model = geminiAi.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const categories = await getAllCategories();
  let numberOfRetries = 0;
  const prompt = `Here are some categories: ${categories.map(
    (category) => category.name
  )}. Based on the categories provided, what category does the following text belong to(only return the categories provided, if there's no match return the closest matching category), and what language is it written in: ${
    parsedPoll.question
  }. Provide a response in a structured JSON format that matches the following model: '{"category": "category_name", "language": "language_name"}'`;
  const modelResult = await model.generateContent(prompt);
  const response = await modelResult.response;
  logger.info(`Open Ai response: ${response.text()}`);
  const result = jsonToObject(response.text());

  // If OpenAI starts to hallucinate(give wrong answers), retry one time.
  if (!result && numberOfRetries < 1) {
    logger.info('Retrying Category and Language dection through Gemini Ai...');
    numberOfRetries++;
    checkForCategoryAndLanguageGeminiFlash(parsedPoll);
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

/**
 * Check for category and language using Open Ai's API
 * @param {IQMSSchema} parsedPoll
 */
let numberOfRetries = 0;
export const checkForCategoryAndLanguageOpenAI = async (
  parsedPoll: IQMSSchema
): Promise<IQMSSchema> => {
  const openai = new OpenAI({
    apiKey: config.openAiApiSecretKey,
  });

  const categories = await getAllCategories();
  const prompt = `Here are some categories: ${categories.map(
    (category) => category.name
  )}. Based on the categories provided, what category does the following text belong to(only return the categories provided, if there's no match return the closest matching category), and what language is it written in: ${
    parsedPoll.question
  }. Structure the response as follows: {category: category_name, language: language_name}`;

  try {
    const languageAndCategory = await openai.beta.chat.completions.parse({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. You help users query for the data they are looking for by calling the query function.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools: [zodFunction({ name: 'query', parameters: openAIResponseObject })],
    });

    const response =
      languageAndCategory.choices[0].message.tool_calls[0].function
        .parsed_arguments;
    logger.info(`Open Ai response: ${JSON.stringify(response)}`);
    const parsedResult = openAIResponseObject.parse(response);

    const categoryId = categories.find(
      (category) => category.name === parsedResult.category
    )?.id;

    // If there no matching category ids, it means the AI hallucinated and gave a new category. Retry the request.
    if (!categoryId && numberOfRetries < 1) {
      numberOfRetries += 1;
      logger.info('Retrying category and language detection request...');
      checkForCategoryAndLanguageOpenAI(parsedPoll);
    }

    parsedPoll.category = categoryId || '';
    parsedPoll.language = parsedResult.language;
    return parsedPoll;
  } catch (error) {
    logger.error('Failed to get category and language from open ai', error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Kindly try submitting your question again'
    );
  }
};

/**
 * Serve poll -> When a poll reaches the required number of responses, move it to the Served Poll collection.
 * @param {string} pollId
 */
export const servePoll = async (pollId: mongoose.Types.ObjectId) => {
  try {
    const poll = await getPollById(pollId);
    const parsedPoll = ServedPollObject.parse(poll);

    await ServedPoll.create(parsedPoll);
    await QMS.findByIdAndDelete({ _id: pollId });
  } catch (error) {
    logger.error(`Unable to serve poll. Error: ${error}`);
  }
};

/**
 * Check for the number of responses a poll should get
 * @param {IQMSSchema} parsedPoll
 * @param {string} pollId
 */
export const checkForNumberOfResponses = async (
  parsedPoll: IQMSSchema,
  pollId: mongoose.Types.ObjectId
) => {
  // TODO: Add a service to verify the transaction Id from Google/Apple payments to know how much a user paid and hence how many responses their poll should get.
  if (parsedPoll.paid?.length) {
    if (parsedPoll.responses && parsedPoll?.responses?.length === 40) {
      await servePoll(pollId);
    }
  } else {
    if (parsedPoll.responses && parsedPoll?.responses?.length === 10) {
      await servePoll(pollId);
    }
  }
};
