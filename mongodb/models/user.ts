import mongoose, { Document, Types } from 'mongoose';
import { z } from 'zod';
import { Gender, Roles, gender, roles, platform, Platform } from '../../config';

const UserSchema = new mongoose.Schema<IUserDoc>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            'Password must contain atleast one letter and one number'
          );
        }
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (
          !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            value
          )
        ) {
          throw new Error('Invalid email');
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: Roles.USER,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    location: {
      country: {
        type: String,
        required: true,
        trim: true,
      },
      continent: {
        type: String,
        required: true,
        trim: true,
      },
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: gender,
      default: Gender.MALE,
    },
    platform: {
      type: String,
      enum: platform,
      default: Platform.ANDROID,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const UserObject = z.object({
  username: z.string().min(3),
  password: z.string().min(8).optional(),
  email: z.string().email(),
  role: z.nativeEnum(Roles),
  profilePic: z.string(),
  dob: z.union([z.date(), z.string()]),
  location: z.object({
    country: z.string(),
    continent: z.string(),
  }),
  emailVerified: z.boolean().optional(),
  language: z.string(),
  gender: z.nativeEnum(Gender),
  platform: z.nativeEnum(Platform),
  categories: z.array(
    z.union([z.instanceof(mongoose.Types.ObjectId), z.string()])
  ),
});

export type IUserSchema = z.infer<typeof UserObject>;

export interface IUserDoc extends IUserSchema, Document {}

const User = mongoose.model<IUserDoc>('User', UserSchema);

export default User;
