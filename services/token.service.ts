import moment, { Moment } from 'moment';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Token, {
  AccessAndRefreshTokens,
  ITokenDoc,
} from './../mongodb/models/token';
import { ITokenUser, IUserDoc, IUserSchema } from '../mongodb/models/user';
import { config, TokenTypes } from '../config';

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
