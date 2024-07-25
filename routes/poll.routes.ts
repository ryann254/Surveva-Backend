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
  .route('/:searchTerm')
  .get(authMiddleware(['managePolls']), searchPollsController);
router
  .route('/:pollId')
  .get(authMiddleware(['managePolls']), getPollController)
  .patch(authMiddleware(['managePolls']), updatePollController)
  .delete(authMiddleware(['managePolls']), deletePollController);

export default router;
