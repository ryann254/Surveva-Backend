import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { IUserDoc } from '../mongodb/models/user';
import { ApiError } from '../errors';
import httpStatus from 'http-status';
import { roleRights } from '../config/enums';

const verifyCallback =
  (req: Request, resolve: any, reject: any, requiredRights: string[]) =>
  async (err: Error, user: IUserDoc, info: string) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
      );
    }

    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      if (!userRights || !userRights.length)
        return reject(
          new ApiError(httpStatus.FORBIDDEN, 'Action is forbidden')
        );

      const hasRequiredRights = requiredRights.every((requiredRight: string) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(
          new ApiError(httpStatus.FORBIDDEN, 'Action is forbidden')
        );
      }
    }
    resolve();
  };

const authMiddleware =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) =>
    new Promise<void>((resolve, reject) => {
      passport.authenticate(
        'jwt',
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));

export default authMiddleware;
