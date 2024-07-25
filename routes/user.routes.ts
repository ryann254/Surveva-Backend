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
