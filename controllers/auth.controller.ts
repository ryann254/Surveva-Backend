import { Request, Response } from 'express';
import { ApiError } from '../errors';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { ITokenUser, UserObject } from '../mongodb/models/user';
import { createUser, getUserByEmail, getUserById } from '../services/user.service';
import {
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerificationCode,
  generateVerifyEmailToken,
  refreshAuthTokens,
} from '../services/token.service';
import {
  loginUserWithEmailAndPassword,
  loginUserWithGoogleOrFacebook,
  logout,
  resetPassword,
} from '../services/auth.service';
import { logger, TokenTypes } from '../config';
import { sendVerificationCode, sendVerificationEmail, verifyEmail } from '../services/email.service';
import { catchZodError } from '../utils/catchZodError';

export const registerController = catchAsync(
  async (req: Request, res: Response) => {
    if (!Object.keys(req.body).length)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    
    const parsedUser = catchZodError(() => UserObject.parse(req.body), res);
    const user = await createUser(parsedUser);
    const tokens = await generateAuthTokens(user as ITokenUser);

    return res.status(httpStatus.CREATED).json({ user, tokens });
  }
);

export const loginController = catchAsync(
  async (req: Request, res: Response) => {
    if (!Object.keys(req.body).length)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');

    const { email, password } = req.body;
    const user = await loginUserWithEmailAndPassword(email, password);
    const tokens = await generateAuthTokens(user as ITokenUser);

    return res.status(httpStatus.OK).json({ user, tokens });
  }
);

export const loginWithGoogleOrFacebookController = catchAsync(
  async (req: Request, res: Response) => {
    if (!Object.keys(req.body.email).length)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required');

    const user = await loginUserWithGoogleOrFacebook(req.body.email);
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

    const user = await getUserByEmail(req.body.email);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    const resetPasswordToken = await generateResetPasswordToken(user);
    const verificationCode = await generateVerificationCode();
    await sendVerificationCode(user.email, verificationCode, user.username);

    return res.status(httpStatus.OK).json({ resetPasswordToken, verificationCode });
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
    if (!Object.keys(req.body).length)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    const user: ITokenUser = req.body;
    const verifyEmailToken = await generateVerifyEmailToken(user);
    await sendVerificationEmail(user.email, verifyEmailToken, user.username);

    return res.status(httpStatus.OK).json({
      message: 'Verification email sent',
      token: verifyEmailToken,
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
