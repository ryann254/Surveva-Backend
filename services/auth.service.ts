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

interface Message {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

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
  userBody: IUserSchema
): Promise<IUserDoc> => {
  const user = await getUserByEmail(userBody.email);

  if (user) {
    return user;
  }

  return User.create(userBody);
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

export const transport = nodemailer.createTransport({
  host: config.smptHost,
  port: config.smptPassword,
  auth: {
    user: config.smptUsername,
    pass: config.smptPassword,
  },
});

if (config.nodeEnv !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch((err) => logger.warn('Unable to connect to email server.', err));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  const msg: Message = {
    from: config.emailFrom,
    to,
    subject,
    text,
    html,
  };
  await transport.sendMail(msg);
};

/**
 * Send verification email after registration.
 * @param {string} to
 * @param {string} token
 * @param {string} name
 */
export const sendVerificationEmail = async (
  to: string,
  token: string,
  name: string
) => {
  const subject = 'Verify your Surveva Account';
  const text = `Dear ${name},
  Thank you for registering with Surveva! To complete the verification process and start enjoying our app's features, please follow the instructions below.
  Please copy the verification token below and paste it into the Surveva app then click verify email: ${token}.
  If you did not create an account, then ignore this email.`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Verify Your Surveva Account</title>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
  .email-container {
    max-width: 600px;
    margin: auto;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  h4 {
    color: #000;
    margin-bottom: 15px;
  }
  p {
    color: #333;
    font-size: 15px;
    line-height: 1.6;
  }
  .token-copy-area {
    background-color: #ffebcd;
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
    display: inline-block;
  }
</style>
</head>
<body>
<div class="email-container">
  <h4><strong>Dear ${name},</strong></h4>
  <p>Thank you for registering with Surveva! To complete the verification process and start enjoying our survey/poll collection features, please follow the instructions below.</p>
  <p>Please copy the verification token below and paste it into the Surveva app:</p>
  <p class="token-copy-area">${token}</p>
  <p>If you did not initiate this registration, kindly disregard this email.</p>
  <p>Best regards,<br>The Surveva Team</p>
</div>
</body>
</html>
`;

  await sendEmail(to, subject, text, html);
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise<IUserDoc | null>}
 */
export const verifyEmail = async (
  verifyEmailToken: string
): Promise<IUserDoc | null> => {
  const verifyEmailTokenDoc = await verifyToken(
    verifyEmailToken,
    TokenTypes.VERIFY_EMAIL
  );
  const user = await getUserById(
    new mongoose.Types.ObjectId(verifyEmailTokenDoc.user)
  );

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  await Token.deleteMany({ user: user._id, type: TokenTypes.VERIFY_EMAIL });
  Object.assign(user, { emailVerified: true });
  await user.save();
  return user;
};
