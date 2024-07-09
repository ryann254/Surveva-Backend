import mongoose from 'mongoose';
import Poll, { IPollData, IPollDoc } from '../mongodb/models/poll';
import { get } from 'http';

/**
 * Create a poll
 * @param {IPollData} pollBody
 * @returns {Promise<IPollDoc>}
 */
export const createPoll = async (pollBody: IPollData): Promise<IPollDoc> =>
  Poll.create(pollBody);

/**
 * Get all polls
 * @returns {Promise<IPollDoc[]>}
 */
export const getAllPolls = async (): Promise<IPollDoc[]> => Poll.find({});

/**
 * Get poll by Id
 * @param {mongoose.Types.ObjectId} pollId
 * @returns {Promise<IPollDoc | null>}
 */
export const getPollById = async (
  pollId: mongoose.Types.ObjectId
): Promise<IPollDoc | null> => Poll.findById(pollId);

/**
 * Search polls
 * @param {string} searchTerm
 * @returns {Promise<IPollDoc[]>}
 */
export const searchPolls = async (searchTerm: string): Promise<IPollDoc[]> => {
  const results = await Poll.aggregate([
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
 * @returns {Promise<IPollDoc>}
 */
export const updatePoll = async (
  pollId: mongoose.Types.ObjectId,
  pollBody: Partial<IPollData>
): Promise<IPollDoc> => {
  const poll = await getPollById(pollId);

  if (!poll) throw new Error('Poll not found');

  Object.assign(poll, pollBody);
  await poll.save();
  return poll;
};

/**
 * Delete poll
 * @param {mongoose.Types.ObjectId} pollId
 */
export const deletePoll = async (pollId: mongoose.Types.ObjectId) =>
  Poll.findOneAndDelete({ _id: pollId });
