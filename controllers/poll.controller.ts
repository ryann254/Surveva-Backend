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

// TODO: Add better request data validation - Remove all `throw new Error...`
export const createPollController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');

  const poll = await createPoll(req.body);
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

  const poll = await updatePoll(req.params.pollId, req.body);
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
