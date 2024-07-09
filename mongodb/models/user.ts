import mongoose, { Document, Types } from 'mongoose';
import { Gender, Roles, gender, roles } from '../../config';

const UserSchema = new mongoose.Schema<IUserDoc>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
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

export interface IUserData {
  username: string;
  password: string;
  email: string;
  role: string;
  profilePic: string;
  dob: Date;
  location: {
    country: string;
    continent: string;
  };
  language: string;
  gender: string;
  categories: Types.DocumentArray<mongoose.Types.ObjectId>;
}

export interface IUserSchema extends IUserData {
  emailVerified: boolean;
}

export interface IUserDoc extends IUserSchema, Document {}

const User = mongoose.model<IUserDoc>('User', UserSchema);

export default User;
