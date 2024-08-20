import mongoose, { Document } from 'mongoose';
import { z } from 'zod';
import { Gender, Origin } from '../../config';

const QMSSchema = new mongoose.Schema<IQMSDoc>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answers: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isCreatedByAdmin: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    servedAt: {
      type: Date,
      trim: true,
    },
    paid: {
      type: String,
      trim: true,
    },
    responses: [
      {
        type: {
          answer: String,
          origin: String,
          geography: String,
          age: Date,
          gender: String,
        },
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    popularityCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const openAIResponseObject = z.object({
  category: z.string(),
  language: z.string(),
});

export const openAITranslationResponseObject = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  translatedQuestion: z.string(),
  translatedAnswers: z.array(z.string()),
});

export const QMSObject = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  owner: z.union([z.instanceof(mongoose.Types.ObjectId), z.string()]),
  isCreatedByAdmin: z.boolean(),
  category: z
    .union([z.instanceof(mongoose.Types.ObjectId), z.string()])
    .optional(),
  language: z.string(),
  servedAt: z.union([z.date(), z.string()]).optional(),
  paid: z.string().optional(),
  responses: z
    .array(
      z.object({
        answer: z.string(),
        origin: z.nativeEnum(Origin),
        geography: z.string(),
        age: z.union([z.date(), z.string()]),
        gender: z.nativeEnum(Gender),
      })
    )
    .optional(),
  likes: z.number().optional(),
  comments: z
    .array(z.union([z.instanceof(mongoose.Types.ObjectId), z.string()]))
    .optional(),
  popularityCount: z.number().optional(),
});

export type IQMSSchema = z.infer<typeof QMSObject>;

export interface IQMSDoc extends IQMSSchema, Document {}

const QMS = mongoose.model<IQMSDoc>('QMS', QMSSchema);

export default QMS;
