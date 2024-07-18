import { Request, Response } from 'express';
import { ApiError } from '../errors';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { UserObject } from '../mongodb/models/user';
import { createUser } from '../services/user.service';

export const registerController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    const parsedUser = UserObject.parse(req.body);
    const user = await createUser(parsedUser);
  }
);

export const loginController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const loginWithGoogleController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const loginWithFacebookController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const logoutController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const refreshTokensController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const resetPasswordController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const sendVerificationEmailController = catchAsync(
  async (req: Request, res: Response) => {}
);

export const verifyEmailController = catchAsync(
  async (req: Request, res: Response) => {}
);
