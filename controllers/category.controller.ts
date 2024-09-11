import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { CategoryObject } from '../mongodb/models/category';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '../services/category.service';
import catchAsync from '../utils/catchAsync';
import { ApiError } from '../errors';
import { catchZodError } from '../utils/catchZodError';

export const createCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    if (!Object.keys(req.body).length)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    
    const parsedCategory = catchZodError(() => CategoryObject.parse(req.body), res);
    const category = await createCategory(parsedCategory);

    return res.status(httpStatus.CREATED).json(category);
  }
);

export const getAllCategoriesController = catchAsync(
  async (req: Request, res: Response) => {
    const categories = await getAllCategories();
    return res.status(httpStatus.OK).json(categories);
  }
);

export const updateCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    if (!Object.keys(req.body).length)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    if (!req.params.categoryId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');

    const parsedCategory = catchZodError(() => CategoryObject.parse(req.body), res);
    const category = await updateCategory(
      req.params.categoryId,
      parsedCategory
    );

    return res.status(httpStatus.OK).json(category);
  }
);

export const deleteCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.categoryId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');

    const category = await deleteCategory(req.params.categoryId);

    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }

    return res.status(httpStatus.OK).json({
      message: 'Deleted category successfully',
    });
  }
);
