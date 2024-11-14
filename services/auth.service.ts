import httpStatus from 'http-status';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { ApiError } from '../errors';
import User, {
  ITokenUser,
  IUserDoc,
  IUserSchema,
  IUserWithTokens,
} from '../mongodb/models/user';
import { getUserByEmail, getUserById } from './user.service';
import Token from '../mongodb/models/token';
import { config, logger, TokenTypes } from '../config';
import {
  generateAuthTokens,
  generateToken,
  saveToken,
  verifyToken,
} from './token.service';

/**
 * Login with username and password
 * @param {string} email
 * @param {password} password
 * @returns {Promise<IUserDoc>}
 */
export const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<IUserDoc> => {
  const user = await getUserByEmail(email);

  if (!user)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect email or password');

  if (user && !user.password)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please login with Google or Facebook'
    );

  if (!(await user.isPasswordMatch(password)))
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect email or password');

  return user;
};

/**
 * Login with Google
 * @param {IUserSchema} userBody
 * @returns {Promise<IUserDoc>}
 */
export const loginUserWithGoogleOrFacebook = async (
  email: string
): Promise<IUserDoc> => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: TokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid refresh token');

  await refreshTokenDoc.deleteOne();
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 */
export const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string
) => {
  const resetPasswordTokenDoc = await verifyToken(
    resetPasswordToken,
    TokenTypes.RESET_PASSWORD
  );
  const user = await getUserById(
    new mongoose.Types.ObjectId(resetPasswordTokenDoc.user)
  );

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  Object.assign(user, { password: newPassword });
  await user.save();
  await Token.deleteMany({ user: user._id, type: TokenTypes.RESET_PASSWORD });
};
