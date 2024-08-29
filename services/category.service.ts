import mongoose from 'mongoose';
import { ICategoryDoc, ICategorySchema } from '../mongodb/models/category';
import Category from '../mongodb/models/category';
import { ApiError } from '../errors';
import httpStatus from 'http-status';

/**
 * Create category
 * @param {ICategorySchema} categoryBody
 * @returns {Promise<ICategoryDoc>}
 */
export const createCategory = async (
  categoryBody: ICategorySchema
): Promise<ICategoryDoc> => Category.create(categoryBody);

/**
 * Get all categories
 * @returns {Promise<ICategoryDoc[]>}
 */
export const getAllCategories = async (): Promise<ICategoryDoc[]> =>
  Category.find({});

/**
 * Update category
 * @param {mongoose.Types.ObjectId} categoryId
 * @param {Partial<ICategorySchema>} categoryBody
 * @returns {Promise<ICategoryDoc>}
 */
export const updateCategory = async (
  categoryId: mongoose.Types.ObjectId,
  categoryBody: Partial<ICategorySchema>
) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Category with id: ${categoryId} does not exist`
    );
  }

  Object.assign(category, categoryBody);
  await category.save();
  return category;
};

/**
 * Delete category
 * @param {mongoose.Types.ObjectId} categoryId
 */
export const deleteCategory = async (categoryId: mongoose.Types.ObjectId) =>
  Category.findOneAndDelete({ _id: categoryId });
