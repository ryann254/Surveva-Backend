import mongoose, { Document } from 'mongoose';

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

// Data sctructure expected from the frontend
export interface IPollData {
  question: string;
  answers: string[];
  category: mongoose.Types.ObjectId;
  language: string;
  servedAt?: Date;
  paid?: string;
  responses?: IResponse[];
}

// TODO: Change the `origin and gender` fieldsS to an enum; It can either be DSA or QMS
export interface IResponse {
  answer: string;
  origin: string;
  geography: string;
  age: Date;
  gender: string;
}

export interface IQMSSchema {
  question: string;
  answers: string[];
  category: mongoose.Types.ObjectId;
  language: string;
  servedAt: Date;
  paid: string;
  responses: IResponse[];
}

export interface IQMSDoc extends IQMSSchema, Document {}

const QMS = mongoose.model<IQMSDoc>('QMS', QMSSchema);

export default QMS;
