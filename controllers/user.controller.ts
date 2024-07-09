import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { createUser } from '../services/user.service';

export const createUserController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');

  const user = await createUser(req.body);
  return res.status(httpStatus.CREATED).json(user);
};

export const updateUserController = async (req: Request, res: Response) => {};

export const getUserController = async (req: Request, res: Response) => {};

export const deleteUserController = async (req: Request, res: Response) => {};
