import { Router } from 'express';
import {
  createPollController,
  deletePollController,
  getAllPollsController,
  getPollController,
  searchPollsController,
  updatePollController,
} from '../controllers/poll.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router
  .route('/')
  .get(authMiddleware(['managePolls']), getAllPollsController)
  .post(authMiddleware(['managePolls']), createPollController);
router
  .route('/search')
  .get(authMiddleware(['managePolls']), searchPollsController);
router
  .route('/:pollId')
  .get(authMiddleware(['managePolls']), getPollController)
  .patch(authMiddleware(['managePolls']), updatePollController)
  .delete(authMiddleware(['managePolls']), deletePollController);

export default router;

/**
 * @swagger
 * tags:
 *   name: Polls
 *   description: Poll management and retrieval
 */

/**
 * @swagger
 * /poll:
 *   post:
 *     summary: Create a new poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answers
 *               - owner
 *             properties:
 *               question:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *               owner:
 *                 type: string
 *               isCreatedByAdmin:
 *                 type: boolean
 *               category:
 *                 type: string
 *               language:
 *                 type: string
 *               servedAt:
 *                 type: string
 *                 format: date-time
 *               paid:
 *                 type: string
 *               responses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                     origin:
 *                       type: string
 *                     geography:
 *                       type: string
 *                     age:
 *                       type: string
 *                       format: date-time
 *                     gender:
 *                       type: string
 *             example:
 *               question: "What's your favorite anime?"
 *               answers: ["Demon Slayer", "One Piece", "HxH"]
 *               owner: "66b491c03859de743ba8bdcc"
 *               isCreatedByAdmin: true
 *               category: "66b491c03859de743ba8bdcc"
 *               language: "English"
 *               servedAt: "2024-03-24"
 *               paid: "66b494e38ca16b2917fa431e"
 *               responses: [{answer: "Demon Slayer", origin: "qms", geography: "Africa", age: "1997-03-23", gender: "male"}]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 poll:
 *                   $ref: '#/components/schemas/Poll'
 *       "400":
 *         description: Bad request
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all polls
 *     description: Retrieve a list of all available polls.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter polls by category name
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter polls by language
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter polls by location
 *       - in: query
 *         name: paid
 *         schema:
 *           type: string
 *         description: Filter polls by paid/unpaid
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Poll'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /poll/{searchTerm}:
 *   get:
 *     summary: Search polls
 *     description: Retrieve a list of polls that match the search term.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: question
 *         schema:
 *           type: string
 *         description: Filter polls by question
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Poll'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /poll/{id}:
 *   get:
 *     summary: Get a poll
 *     description: Logged in users can fetch polls they own.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Poll id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Poll'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a poll
 *     description: Logged in users can only update polls they own. Only admins can update any poll.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Poll id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answers
 *               - owner
 *             properties:
 *               question:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *               owner:
 *                 type: string
 *               isCreatedByAdmin:
 *                 type: boolean
 *               category:
 *                 type: string
 *               language:
 *                 type: string
 *               servedAt:
 *                 type: string
 *                 format: date-time
 *               paid:
 *                 type: string
 *               responses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                     origin:
 *                       type: string
 *                     geography:
 *                       type: string
 *                     age:
 *                       type: string
 *                       format: date-time
 *                     gender:
 *                       type: string
 *             example:
 *               question: "What's your favorite anime?"
 *               answers: ["Demon Slayer", "One Piece", "HxH"]
 *               owner: "66b491c03859de743ba8bdcc"
 *               isCreatedByAdmin: true
 *               category: "66b491c03859de743ba8bdcc"
 *               language: "English"
 *               servedAt: "2024-03-24"
 *               paid: "66b494e38ca16b2917fa431e"
 *               responses: [{answer: "Demon Slayer", origin: "qms", geography: "Africa", age: "1997-03-23", gender: "male"}]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Poll'
 *       "400":
 *         description: Bad Request
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a poll
 *     description: Logged in users can delete polls they own. Only admins can delete any poll.
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Poll id
 *     responses:
 *       "204":
 *         description: No Content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
