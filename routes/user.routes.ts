import { Router } from 'express';
import {
  createUserController,
  deleteUserController,
  getUserController,
  updateUserController,
} from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.route('/').post(authMiddleware(['manageUsers']), createUserController);
router
  .route('/:userId')
  .get(authMiddleware(['manageUsers']), getUserController)
  .patch(authMiddleware(['manageUsers']), updateUserController)
  .delete(authMiddleware(['manageUsers']), deleteUserController);

export default router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               profilePic:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               language:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               categories:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *             example:
 *               username: "Roronoa Zoro"
 *               email: "roronoazoro@example.com"
 *               password: "Zoro123!"
 *               profilePic: "https://example.com/zoro.jpg"
 *               dob: "1990-01-01"
 *               language: "Japanese"
 *               gender: "male"
 *               categories: ["666161869d833b40c6a14051", "668cdfd8f33970c10a6b344e"]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
