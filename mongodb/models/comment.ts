import mongoose, { Document } from 'mongoose';
import { z } from 'zod';

const CommentSchema = new mongoose.Schema<ICommentDoc>({
  comment: {
    type: String,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export const CommentObject = z.object({
  comment: z.string(),
  author: z.union([z.instanceof(mongoose.Types.ObjectId), z.string()]),
});

export type ICommentSchema = z.infer<typeof CommentObject>;

export interface ICommentDoc extends ICommentSchema, Document {}

const Comment = mongoose.model<ICommentDoc>('Comment', CommentSchema);

export default Comment;
