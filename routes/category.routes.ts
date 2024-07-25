import { Router } from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from '../controllers/category.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router
  .route('/')

  .get(authMiddleware(['manageCategories']), getAllCategoriesController)
  .post(authMiddleware(['manageCategories']), createCategoryController);
router
  .route('/:categoryId')
  .patch(authMiddleware(['manageCategories']), updateCategoryController)
  .delete(authMiddleware(['manageCategories']), deleteCategoryController);

export default router;
