import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '../services/user.service';
import {
  deleteAmplitudeAnalytics,
  sendAmplitudeAnalytics,
} from '../utils/handleAmplitudeAnalytics';
import { UserObject } from '../mongodb/models/user';
import { ApiError } from '../errors';
import catchAsync from '../utils/catchAsync';

export const createUserController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body) throw new Error('Request body is empty');

    const parsedUser = UserObject.parse(req.body);
    const user = await createUser(parsedUser);
    // Send `user_created` analytic to Amplitude
    if (user) {
      sendAmplitudeAnalytics('user_created');
    }

    return res.status(httpStatus.CREATED).json(user);
  }
);

export const updateUserController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      return new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    if (!req.params.userId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');

    const parsedUser = UserObject.partial().parse(req.body);
    const user = await updateUser(req.params.userId, parsedUser);
    return res.status(httpStatus.OK).json(user);
  }
);

export const getUserController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.userId) throw new Error('User not found');

    const user = await getUserById(req.params.userId);
    return res.status(httpStatus.OK).json(user);
  }
);

export const deleteUserController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.userId) throw new Error('User not found');

    await deleteUser(req.params.userId);
    // Delete user analytics from Amplitude
    deleteAmplitudeAnalytics([req.params.userId]);
    return res
      .status(httpStatus.OK)
      .json({ message: 'User deleted successfully' });
  }
);
