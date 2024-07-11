import mongoose, { Document } from 'mongoose';
import { z } from 'zod';
import { Gender } from '../../config';
import { Origin } from '../../config/rolesAndGender';

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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
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
  },
  {
    timestamps: true,
  }
);

export const QMSObject = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  category: z.union([z.instanceof(mongoose.Types.ObjectId), z.string()]),
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
});

export type IQMSSchema = z.infer<typeof QMSObject>;

export interface IQMSDoc extends IQMSSchema, Document {}

const QMS = mongoose.model<IQMSDoc>('QMS', QMSSchema);

export default QMS;
