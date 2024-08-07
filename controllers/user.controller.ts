import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  createUser,
  deleteUser,
  deleteUserPolls,
  getUserById,
  updateUser,
  verifyAccountOwnership,
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
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');

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

    const accountBelongsToUser = await verifyAccountOwnership(req);

    if (accountBelongsToUser) {
      const parsedUser = UserObject.partial().parse(req.body);
      const user = await updateUser(req.params.userId, parsedUser);
      return res.status(httpStatus.OK).json(user);
    }
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: "You're Not allowed to perform this action" });
  }
);

export const getUserController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.userId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');

    const user = await getUserById(req.params.userId);
    return res.status(httpStatus.OK).json(user);
  }
);

export const deleteUserController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.userId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');

    const accountBelongsToUser = await verifyAccountOwnership(req);
    if (accountBelongsToUser) {
      // Delete all polls associated with the user.
      await deleteUserPolls(req.params.userId);
      await deleteUser(req.params.userId);
      // Delete user analytics from Amplitude
      await deleteAmplitudeAnalytics([req.params.userId]);
      return res
        .status(httpStatus.OK)
        .json({ message: 'User deleted successfully' });
    }
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: "You're Not allowed to perform this action" });
  }
);
