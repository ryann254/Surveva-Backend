import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Request } from 'express';
import QMS, { IQMSDoc, IQMSSchema } from '../mongodb/models/qms';
import httpStatus from 'http-status';
import { ApiError } from '../errors';
import { config } from '../config';

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
  pollBody: Partial<IQMSSchema>
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
  // Get the user's id from the Bearer token.
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const payload = jwt.verify(token, config.jwtSecret);

  const pollDoc = await getPollById(req.params.pollId);
  if (!pollDoc) throw new ApiError(httpStatus.BAD_REQUEST, 'Poll Not found');

  return pollDoc.owner.toString() === payload.sub;
};
