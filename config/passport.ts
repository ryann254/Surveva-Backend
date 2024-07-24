import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from './config';
import { IPayload } from '../mongodb/models/token';
import { TokenTypes } from './enums';
import { ApiError } from '../errors';
import httpStatus from 'http-status';
import { getUserById } from '../services/user.service';
import mongoose from 'mongoose';

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async (payload: IPayload, done) => {
    try {
      if (payload.type !== TokenTypes.ACCESS) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
      }

      const user = await getUserById(new mongoose.Types.ObjectId(payload.sub));
      if (!user) {
        done(null, false);
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);

export default jwtStrategy;
