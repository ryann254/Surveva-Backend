import mongoose, { Document } from 'mongoose';

const PollSchema = new mongoose.Schema<IPollDoc>(
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

// TODO: Change the `origin` field to an enum; It can either be DSA or QMS
export interface IResponse {
  answer: string;
  origin: string;
  geography: string;
  age: Date;
  gender: string;
}

export interface IPollSchema {
  question: string;
  answers: string[];
  category: mongoose.Types.ObjectId;
  language: string;
  servedAt: Date;
  paid: string;
  responses: IResponse[];
}

export interface IPollDoc extends IPollSchema, Document {}

const Poll = mongoose.model<IPollDoc>('Poll', PollSchema);

export default Poll;
