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

export const createCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');

    const parsedCategory = CategoryObject.parse(req.body);
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
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    if (!req.params.categoryId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');

    const parsedCategory = CategoryObject.partial().parse(req.body);
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

    await deleteCategory(req.params.categoryId);

    return res.status(httpStatus.OK).json({
      message: 'Deleted category successfully',
    });
  }
);
