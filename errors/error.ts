import mongoose from 'mongoose';
import ApiError from './apiError';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { config, logger } from '../config';

// const errorConverter = (error: any): ApiError => {
//   if (!(error instanceof ApiError)) {
//     const statusCode =
//       error.statusCode ||
//       (error instanceof mongoose.Error
//         ? httpStatus.BAD_REQUEST
//         : httpStatus.INTERNAL_SERVER_ERROR);
//     const message = error.message || httpStatus[statusCode];
//     error = new ApiError(statusCode, message, false, error.stack);
//   }
//   return error;
// };

export const errorConverter = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      (error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR);
    const message: string = error.message || `${httpStatus[statusCode]}`;
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { statusCode, message } = err;
  if (config.nodeEnv === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal Server Error';
  }

  res.locals['errorMessage'] = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  if (config.nodeEnv === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};