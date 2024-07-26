import mongoose from 'mongoose';
import User, {
  ITokenUser,
  IUserDoc,
  IUserSchema,
} from '../mongodb/models/user';
import httpStatus from 'http-status';
import { Request } from 'express';
import { ApiError } from '../errors';

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
): Promise<IUserDoc | null> => User.findById(userId);

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
      httpStatus.BAD_REQUEST,
      `User with id: ${userId} does not exist`
    );

  Object.assign(user, userBody);
  await user.save();
  return user;
};

/**
 * Delete user
 * @param {mongoose.Types.ObjectId} userId
 */
export const deleteUser = async (userId: mongoose.Types.ObjectId) =>
  User.findOneAndDelete({ _id: userId });

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
