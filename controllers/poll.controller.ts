import { Request, Response } from 'express';
import httpStatus from 'http-status';

export const createPollController = async (req: Request, res: Response) => {};
export const updatePollController = async (req: Request, res: Response) => {};
export const getAllPollsController = async (req: Request, res: Response) => {
  return res.status(httpStatus.OK).json([{ pollId: 1, title: 'Poll 1' }]);
};
export const getPollController = async (req: Request, res: Response) => {};
export const deletePollController = async (req: Request, res: Response) => {};
