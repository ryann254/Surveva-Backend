import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { createPoll, updatePoll } from '../services/poll.service';

// TODO: Add better request data validation - Remove all `throw new Error...`
export const createPollController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');

  const poll = await createPoll(req.body);
  return res.status(httpStatus.CREATED).json(poll);
};
export const updatePollController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');
  if (!req.params.pollId) throw new Error('Poll not found');

  const poll = await updatePoll(req.params.pollId, req.body);
  return res.status(httpStatus.OK).json(poll);
};
export const getAllPollsController = async (req: Request, res: Response) => {
  return res.status(httpStatus.OK).json([{ pollId: 1, title: 'Poll 1' }]);
};
export const getPollController = async (req: Request, res: Response) => {};
export const deletePollController = async (req: Request, res: Response) => {};
