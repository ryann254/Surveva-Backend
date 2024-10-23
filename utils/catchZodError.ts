import { ZodError } from 'zod';
import httpStatus from "http-status";
import { ApiError } from "../errors";
import { Response } from 'express';

export const catchZodError = (functionToRun: () => any, res: Response) => {
    try {
        return functionToRun();
    } catch (error) {
        if (error instanceof ZodError) {
            const firstError = error.errors[0];
            console.error(firstError);
            return res.status(httpStatus.BAD_REQUEST).send({
                message: `${firstError.path.join('.')} is required.`,
            });
        }
        throw new ApiError(httpStatus.BAD_REQUEST, String(error));
    }
}