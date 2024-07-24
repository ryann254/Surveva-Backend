import mongoose, { Document } from 'mongoose';
import { z } from 'zod';
import { JwtPayload } from 'jsonwebtoken';
import { tokenTypes, TokenTypes } from '../../config';

const TokenSchema = new mongoose.Schema<ITokenDoc>(
  {
    token: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: tokenTypes,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const tokenObject = z.object({
  token: z.string(),
  user: z.union([z.instanceof(mongoose.Types.ObjectId), z.string()]),
  type: z.nativeEnum(TokenTypes),
  expires: z.date(),
  blacklisted: z.boolean(),
});

export interface IPayload extends JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  type: string;
}

export interface TokenPayload {
  token: string;
  expires: Date;
}

export interface AccessAndRefreshTokens {
  access: TokenPayload;
  refresh: TokenPayload;
}

export type ITokenSchema = z.infer<typeof tokenObject>;

export interface ITokenDoc extends ITokenSchema, Document {}

const Token = mongoose.model<ITokenDoc>('Token', TokenSchema);

export default Token;
