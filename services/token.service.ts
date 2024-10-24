import moment, { Moment } from 'moment';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Token, {
  AccessAndRefreshTokens,
  ITokenDoc,
} from './../mongodb/models/token';
import {
  ITokenUser,
  IUserDoc,
  IUserSchema,
  IUserWithTokens,
} from '../mongodb/models/user';
import { config, logger, TokenTypes } from '../config';
import { ApiError } from '../errors';
import httpStatus from 'http-status';
import { getUserByEmail, getUserById } from './user.service';
import crypto from 'crypto';

/**
 * Generate token
 * @param {mongoose.Types.UserObject} userId
 * @param {Moment} expires
 * @param {string} type
 * @returns {string}
 */
export const generateToken = (
  userId: mongoose.Types.ObjectId,
  expires: Moment,
  type: string
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, config.jwtSecret);
};

/**
 * Verify token and return token doc
 * @param {string} refreshToken
 * @param {string} type
 * @returns {Promise<ITokenDoc>}
 */
export const verifyToken = async (token: string, type: string) => {
  const payload = jwt.verify(token, config.jwtSecret);

  if (typeof payload.sub !== 'string')
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bad user');

  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });

  if (!tokenDoc) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token');
  return tokenDoc;
};

/**
 * Save a token
 * @param {string} token
 * @param {mongoose.Types.ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} blacklisted
 * @returns {Promise<ITokenDoc>}
 */
export const saveToken = async (
  token: string,
  userId: mongoose.Types.ObjectId,
  expires: Moment,
  type: string,
  blacklisted: boolean = false
): Promise<ITokenDoc> => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {IUserSchema} user
 * @returns {Promise<AccessAndRefreshTokens>}
 */
export const generateAuthTokens = async (
  user: ITokenUser
): Promise<AccessAndRefreshTokens> => {
  const accessTokenExpires = moment().add(
    config.jwtAccessExpirationMinutes,
    'minutes'
  );
  const accessToken = generateToken(
    user._id,
    accessTokenExpires,
    TokenTypes.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwtRefreshExpirationDays,
    'days'
  );
  const refreshToken = generateToken(
    user._id,
    refreshTokenExpires,
    TokenTypes.REFRESH
  );

  await saveToken(
    refreshToken,
    user._id,
    refreshTokenExpires,
    TokenTypes.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<IUserWithTokens>}
 */
export const refreshAuthTokens = async (
  refreshToken: string
): Promise<IUserWithTokens> => {
  const refreshTokenDoc = await verifyToken(refreshToken, TokenTypes.REFRESH);
  const user = await getUserById(
    new mongoose.Types.ObjectId(refreshTokenDoc.user)
  );

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  await refreshTokenDoc.deleteOne();
  const tokens = await generateAuthTokens(user as ITokenUser);
  return { user, tokens };
};

/**
 * Generate verification code
 * @returns {Promise<string>}
 */
export const generateVerificationCode = async (): Promise<string> => {
  // Generate a cryptographically secure random number between 1000 and 9999
  const code = crypto.randomInt(1000, 10000).toString().padStart(4, '0');
  return code;
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
export const generateResetPasswordToken = async (
  email: string
): Promise<string> => {
  const user = await getUserByEmail(email);

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const expires = moment().add(
    config.jwtResetPasswordExpirationMinutes,
    'minutes'
  );
  const resetPasswordToken = generateToken(
    user._id as mongoose.Types.ObjectId,
    expires,
    TokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user._id as mongoose.Types.ObjectId,
    expires,
    TokenTypes.RESET_PASSWORD
  );

  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {ITokenUser} user
 * @returns {Promise<string>}
 */
export const generateVerifyEmailToken = async (
  user: ITokenUser
): Promise<string> => {
  const expires = moment().add(
    config.jwtVerifyEmailExpirationMinutes,
    'minutes'
  );
  const verifyEmailToken = generateToken(
    user._id,
    expires,
    TokenTypes.VERIFY_EMAIL
  );
  await saveToken(verifyEmailToken, user._id, expires, TokenTypes.VERIFY_EMAIL);

  return verifyEmailToken;
};
