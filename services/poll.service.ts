import Poll, { IPollData, IPollDoc } from '../mongodb/models/poll';

/**
 * Create a poll
 * @param {IPollData} pollBody
 * @returns a Promise<IPollDoc>
 */
export const createPoll = async (pollBody: IPollData): Promise<IPollDoc> =>
  Poll.create(pollBody);
