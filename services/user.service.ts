import mongoose from 'mongoose';
import User, { IUserDoc, IUserSchema } from '../mongodb/models/user';
import httpStatus from 'http-status';
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
