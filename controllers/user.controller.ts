import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '../services/user.service';

export const createUserController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');

  const user = await createUser(req.body);
  return res.status(httpStatus.CREATED).json(user);
};

export const updateUserController = async (req: Request, res: Response) => {
  if (!req.body) throw new Error('Request body is empty');
  if (!req.params.userId) throw new Error('User not found');

  const user = await updateUser(req.params.userId, req.body);
  return res.status(httpStatus.OK).json(user);
};

export const getUserController = async (req: Request, res: Response) => {
  if (!req.params.userId) throw new Error('User not found');

  const user = await getUserById(req.params.userId);
  return res.status(httpStatus.OK).json(user);
};

export const deleteUserController = async (req: Request, res: Response) => {
  if (!req.params.userId) throw new Error('User not found');

  await deleteUser(req.params.userId);
  return res
    .status(httpStatus.OK)
    .json({ message: 'User deleted successfully' });
};
