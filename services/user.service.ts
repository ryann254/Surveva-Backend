import mongoose from 'mongoose';
import User, {
  ITokenUser,
  IUserDoc,
  IUserSchema,
} from '../mongodb/models/user';
import httpStatus from 'http-status';
import { Request } from 'express';
import { ApiError } from '../errors';
import QMS from '../mongodb/models/qms';
import { logger } from '../config';
import ServedPoll from '../mongodb/models/served_poll';
import { verifyToken } from './token.service';
import Token from '../mongodb/models/token';

/**
 * Create user
 * @param {IUserData} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: IUserSchema): Promise<IUserDoc> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Get user by id.
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserById = async (
  userId: mongoose.Types.ObjectId
): Promise<IUserDoc | null> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserByEmail = async (email: string) => User.findOne({ email });

/**
 * Update user
 * @param {mongoose.Types.ObjectId} userId
 * @param {Partial<IUserData>} userBody
 * @returns {Promise<IUserDoc>}
 */
export const updateUser = async (
  userId: mongoose.Types.ObjectId,
  userBody: Partial<IUserSchema>
) => {
  const user = await getUserById(userId);

  if (!user)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User with id: ${userId} does not exist`
    );

  Object.assign(user, userBody);
  await user.save();
  return user;
};

/**
 * Delete all polls associated with a user
 * @param {mongoose.Types.ObjectId} userId
 */
export const deleteUserPolls = async (userId: mongoose.Types.ObjectId) => {
  const qmsResults = await QMS.deleteMany({ owner: userId });
  const servedPollResults = await ServedPoll.deleteMany({ owner: userId });
  logger.info(
    `${qmsResults.deletedCount} document(s) were deleted from the QMS collection.`
  );
  logger.info(
    `${servedPollResults.deletedCount} document(s) were deleted from the Served Poll collection.`
  );
};

/**
 * Delete user
 * @param {mongoose.Types.ObjectId} userId
 */
export const deleteUser = async (userId: mongoose.Types.ObjectId) => {
  // Revoke user tokens
  await Token.deleteMany({ user: userId });
  const user = await User.findOneAndDelete({ _id: userId });

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
};

/**
 * Verify the account belongs to a user
 * @param {Request} req
 * @returns {boolean}
 */
export const verifyAccountOwnership = async (
  req: Request
): Promise<boolean> => {
  // Admins have rights to update all polls.
  if (req.user.role === 'admin') return true;

  // Check if the account the user is logged in with is the same as the one he/she is trying to update
  return req.params.userId === req.user._id.toString();
};
