import { Request, Response } from 'express';
import morgan from 'morgan';
import config from './config';
import logger from './logger';

morgan.token(
  'message',
  (_req: Request, res: Response) => res.locals['errorMessage'] || ''
);

const getIPFormat = () =>
  config.nodeEnv === 'production' ? ':remote-addr - ' : '';
const successResponseFormat = `${getIPFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIPFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (_req: Request, res: Response) => res.statusCode >= 400,
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (_req: Request, res: Response) => res.statusCode < 400,
  stream: {
    write: (message: string) => logger.error(message.trim()),
  },
});

export { successHandler, errorHandler };
