import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  createPoll,
  deletePoll,
  getAllPolls,
  getPollById,
  searchPolls,
  updatePoll,
} from '../services/poll.service';
import { sendAmplitudeAnalytics } from '../utils/handleAmplitudeAnalytics';
import { QMSObject } from '../mongodb/models/qms';

// TODO: Add better request data validation - Remove all `throw new Error...`
export const createPollController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');

  const parsedPoll = QMSObject.parse(req.body);
  const poll = await createPoll(parsedPoll);
  // Send `poll_created` analytic to Amplitude
  if (poll) {
    sendAmplitudeAnalytics('poll_created');
  }

  return res.status(httpStatus.CREATED).json(poll);
};

export const searchPollsController = async (req: Request, res: Response) => {
  if (!req.params.searchTerm) throw new Error('Search term is empty');

  const polls = await searchPolls(req.params.searchTerm);
  return res.status(httpStatus.OK).json(polls);
};

export const updatePollController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');
  if (!req.params.pollId) throw new Error('Poll not found');

  const parsedPoll = QMSObject.partial().parse(req.body);
  const poll = await updatePoll(req.params.pollId, parsedPoll);
  return res.status(httpStatus.OK).json(poll);
};

export const getAllPollsController = async (req: Request, res: Response) => {
  const polls = await getAllPolls();
  return res.status(httpStatus.OK).json(polls);
};

export const getPollController = async (req: Request, res: Response) => {
  if (!req.params.pollId) throw new Error('Poll not found');

  const poll = await getPollById(req.params.pollId);
  return res.status(httpStatus.OK).json(poll);
};

export const deletePollController = async (req: Request, res: Response) => {
  if (!req.params.pollId) throw new Error('Poll not found');

  await deletePoll(req.params.pollId);
  return res
    .status(httpStatus.OK)
    .json({ message: 'Poll deleted successfully' });
};
