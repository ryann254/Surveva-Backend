import mongoose, { Document } from 'mongoose';
import { z } from 'zod';

const CategorySchema = new mongoose.Schema<ICategoryDoc>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
});

export const CategoryObject = z.object({
  name: z.string().min(3),
});

export type ICategorySchema = z.infer<typeof CategoryObject>;

export interface ICategoryDoc extends ICategorySchema, Document {}

const Category = mongoose.model<ICategoryDoc>('Category', CategorySchema);

export default Category;
