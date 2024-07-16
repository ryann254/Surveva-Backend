import { Router } from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from '../controllers/category.controller';

const router = Router();

router
  .route('/')
  .get(getAllCategoriesController)
  .post(createCategoryController);
router
  .route('/:categoryId')
  .patch(updateCategoryController)
  .delete(deleteCategoryController);

export default router;
