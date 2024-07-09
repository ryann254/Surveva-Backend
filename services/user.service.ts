import User, { IUserData, IUserDoc } from '../mongodb/models/user';

/**
 * Create user
 * @param {IUserData} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: IUserData): Promise<IUserDoc> =>
  User.create(userBody);
