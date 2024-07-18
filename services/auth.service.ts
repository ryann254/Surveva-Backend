import httpStatus from 'http-status';
import { ApiError } from '../errors';
import { IUserDoc } from '../mongodb/models/user';
import { getUserByEmail } from './user.service';

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
