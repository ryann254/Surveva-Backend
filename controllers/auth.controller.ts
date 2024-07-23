import { Request, Response } from 'express';
import { ApiError } from '../errors';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { ITokenUser, UserObject } from '../mongodb/models/user';
import { createUser } from '../services/user.service';
import {
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  refreshAuthTokens,
} from '../services/token.service';
import {
  loginUserWithEmailAndPassword,
  loginUserWithGoogleOrFacebook,
  logout,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from '../services/auth.service';
import { logger } from '../config';

export const registerController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    const parsedUser = UserObject.parse(req.body);
    const user = await createUser(parsedUser);
    const tokens = await generateAuthTokens(user as ITokenUser);

    return res.status(httpStatus.CREATED).json({ user, tokens });
  }
);

export const loginController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');

    const { email, password } = req.body;
    const user = await loginUserWithEmailAndPassword(email, password);
    const tokens = await generateAuthTokens(user as ITokenUser);

    return res.status(httpStatus.OK).json({ user, tokens });
  }
);

export const loginWithGoogleOrFacebookController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    const parsedUser = UserObject.parse(req.body);
    const user = await loginUserWithGoogleOrFacebook(parsedUser);
    const tokens = await generateAuthTokens(user as ITokenUser);

    return res.status(httpStatus.OK).json({ user, tokens });
  }
);

export const logoutController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body.refreshToken)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');

    await logout(req.body.refreshToken);
    return res.status(httpStatus.NO_CONTENT).send();
  }
);

export const refreshTokensController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body.refreshToken)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');

    const userWithTokens = await refreshAuthTokens(req.body.refreshToken);
    return res.status(httpStatus.OK).json(userWithTokens);
  }
);

// When the frontend receives the resetPasswordToken, push to the reset password page.
export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body.email)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Email is required to reset password'
      );

    const resetPasswordToken = await generateResetPasswordToken(req.body.email);

    return res.status(httpStatus.OK).json({ resetPasswordToken });
  }
);

export const resetPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.query['token'])
      throw new ApiError(httpStatus.BAD_REQUEST, 'Token is required');
    if (!req.body.password)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');

    await resetPassword(req.query['token'], req.body.password);
    res.status(httpStatus.OK).json({ message: 'Password reset successfully' });
  }
);

// TODO: Instead of using a token to verify the email, use six generated numbers.
export const sendVerificationEmailController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    const user: ITokenUser = req.body;
    const verifyEmailToken = await generateVerifyEmailToken(user);
    await sendVerificationEmail(user.email, verifyEmailToken, user.username);

    return res.status(httpStatus.OK).json({
      message: 'Verification email sent',
    });
  }
);

export const verifyEmailController = catchAsync(
  async (req: Request, res: Response) => {
    await verifyEmail(req.query['token']);
    return res.status(httpStatus.OK).json({
      message: 'Email verified successfully',
    });
  }
);
