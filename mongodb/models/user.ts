import mongoose, { Document, Model } from 'mongoose';
import { z } from 'zod';
import brcypt from 'bcryptjs';
import { Gender, Roles, gender, roles, platform, Platform } from '../../config';
import { AccessAndRefreshTokens } from './token';

const UserSchema = new mongoose.Schema<IUserDoc, IUserModel>(
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
      // Once the role is created, it cannot be changed.
      immutable: true,
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

/**
 * Check if email is taken
 * @param {string} email
 * @param {mongoose.Types.ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
UserSchema.static(
  'isEmailTaken',
  async function (
    email: string,
    excludedUserId: mongoose.Types.ObjectId
  ): Promise<boolean> {
    const user = await this.findOne({ email, _id: { $ne: excludedUserId } });
    return !!user;
  }
);

/**
 * Check if password matches the user's password.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
UserSchema.method(
  'isPasswordMatch',
  async function (password: string): Promise<boolean> {
    const user = this;
    return brcypt.compare(password, user.password);
  }
);

/**
 * Encrypt the password before storing in the database
 */
UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await brcypt.hash(user.password as string, 8);
  }
  next();
});

export const UserObject = z.object({
  username: z.string().min(3),
  password: z.string().min(8).optional(),
  email: z.string().email(),
  role: z.nativeEnum(Roles),
  profilePic: z.string().optional(),
  dob: z.union([z.date(), z.string()]),
  location: z.object({
    country: z.string(),
    continent: z.string(),
  }),
  emailVerified: z.boolean().optional(),
  language: z.string(),
  gender: z.nativeEnum(Gender),
  platform: z.nativeEnum(Platform).optional(),
  categories: z.array(
    z.union([z.instanceof(mongoose.Types.ObjectId), z.string()])
  ),
});

export type IUserSchema = z.infer<typeof UserObject>;

// Used to generate tokens for a user
export interface ITokenUser extends IUserSchema {
  _id: mongoose.Types.ObjectId;
}

export interface IUserDoc extends IUserSchema, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(
    email: string,
    excludedUserId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
}

export interface IUserWithTokens {
  user: IUserDoc;
  tokens: AccessAndRefreshTokens;
}

const User = mongoose.model<IUserDoc, IUserModel>('User', UserSchema);

export default User;
