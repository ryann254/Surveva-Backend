import { Router } from 'express';
import {
  forgotPasswordController,
  loginController,
  loginWithGoogleOrFacebookController,
  logoutController,
  refreshTokensController,
  registerController,
  resetPasswordController,
  sendVerificationEmailController,
  verifyEmailController,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/social', loginWithGoogleOrFacebookController);
router.post('/refresh-tokens', refreshTokensController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/send-verification-email', sendVerificationEmailController);
router.post('/verify-email', verifyEmailController);
router.post('/logout', logoutController);

export default router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register as user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - role
 *               - dob
 *               - location
 *               - language
 *               - gender
 *               - categories
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *               profilePic:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   continent:
 *                     type: string
 *               emailVerified:
 *                 type: boolean
 *               language:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               platform:
 *                 type: string
 *                 enum: [android, ios, web]
 *               categories:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *             example:
 *               username: "Roronoa Zoro"
 *               email: "roronoazoro@example.com"
 *               password: "Zoro123!"
 *               role: "user"
 *               profilePic: "https://example.com/zoro.jpg"
 *               dob: "1990-01-01"
 *               location:
 *                 country: "Japan"
 *                 continent: "Asia"
 *               emailVerified: false
 *               language: "Japanese"
 *               gender: "male"
 *               platform: "android"
 *               categories: ["666161869d833b40c6a14051", "668cdfd8f33970c10a6b344e"]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: roronoazoro@example.com
 *               password: Zoro@123
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */

/**
 * @swagger
 * /auth/social:
 *   post:
 *     summary: Login using Google or Facebook
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - role
 *               - dob
 *               - location
 *               - language
 *               - gender
 *               - categories
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *               profilePic:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   continent:
 *                     type: string
 *               emailVerified:
 *                 type: boolean
 *               language:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               platform:
 *                 type: string
 *                 enum: [android, ios, web]
 *               categories:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *             example:
 *               username: "Roronoa Zoro"
 *               email: "roronoazoro@example.com"
 *               password: "Zoro123!"
 *               role: "user"
 *               profilePic: "https://example.com/zoro.jpg"
 *               dob: "1990-01-01"
 *               location:
 *                 country: "Japan"
 *                 continent: "Asia"
 *               emailVerified: false
 *               language: "Japanese"
 *               gender: "male"
 *               platform: "android"
 *               categories: ["666161869d833b40c6a14051", "668cdfd8f33970c10a6b344e"]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWithTokens'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: An email will be sent to reset password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: fake@example.com
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               password: password1
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Password reset failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Password reset failed
 */

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send verification email
 *     description: An email will be sent to verify email.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: verify email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verify email token
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: verify email failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: verify email failed
 */
