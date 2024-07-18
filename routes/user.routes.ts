import { Router } from 'express';
import {
  createUserController,
  deleteUserController,
  getUserController,
  updateUserController,
} from '../controllers/user.controller';

const router = Router();

router.route('/').post(createUserController);
router
  .route('/:userId')
  .get(getUserController)
  .patch(updateUserController)
  .delete(deleteUserController);

export default router;
