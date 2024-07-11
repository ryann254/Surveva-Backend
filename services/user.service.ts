import mongoose from 'mongoose';
import User, { IUserDoc, IUserSchema } from '../mongodb/models/user';

/**
 * Create user
 * @param {IUserData} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: IUserSchema): Promise<IUserDoc> =>
  User.create(userBody);

/**
 * Get user by id.
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<IUserDoc | null>}
 */
export const getUserById = async (
  userId: mongoose.Types.ObjectId
): Promise<IUserDoc | null> => User.findById(userId);

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

  if (!user) throw new Error('User not found');

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
