import httpStatus from 'http-status';
import { Response } from 'express';
import { ApiError } from '../errors';

export const throwZodError = (error: any, res: Response) => {
  // Catch and extract zod errors for missing fields
  try {
    const errorObj = JSON.parse(error);

    return res.status(httpStatus.BAD_REQUEST).send({
      message: `${errorObj[0].path[0]} is required.`,
    });
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};
