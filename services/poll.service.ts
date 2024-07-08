import mongoose from 'mongoose';
import Poll, { IPollData, IPollDoc } from '../mongodb/models/poll';
import { get } from 'http';

/**
 * Create a poll
 * @param {IPollData} pollBody
 * @returns a Promise<IPollDoc>
 */
export const createPoll = async (pollBody: IPollData): Promise<IPollDoc> =>
  Poll.create(pollBody);

/**
 * Get a poll by Id
 * @param {mongoose.Types.ObjectId} pollId
 * @returns a Promise<IPollDoc | null>
 */
export const getPollById = async (
  pollId: mongoose.Types.ObjectId
): Promise<IPollDoc | null> => Poll.findById(pollId);

/**
 * Update a poll
 * @param {mongoose.Types.ObjectId} pollId
 * @param {Partial<IPollData>} pollBody
 * @returns a Promise<IPollDoc>
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
