import mongoose, { Document } from 'mongoose';

const CategorySchema = new mongoose.Schema<ICategoryDoc>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

export interface ICategorySchema {
  name: string;
}

export interface ICategoryDoc extends ICategorySchema, Document {}

const Category = mongoose.model<ICategoryDoc>('Category', CategorySchema);

export default Category;
