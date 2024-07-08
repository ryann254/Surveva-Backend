import { Router } from 'express';
import {
  createPollController,
  deletePollController,
  getAllPollsController,
  getPollController,
  updatePollController,
} from '../controllers/poll.controller';

const router = Router();

router.route('/').get(getAllPollsController).post(createPollController);
router
  .route('/:pollId')
  .get(getPollController)
  .patch(updatePollController)
  .delete(deletePollController);

export default router;
