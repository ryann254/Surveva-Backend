import express from 'express';
import httpStatus from 'http-status';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';

import routes from './routes';
import {
  config,
  errorHandler as errorLogger,
  successHandler,
  jwtStrategy,
} from './config';
import { ApiError, errorHandler } from './errors';
import { errorConverter } from './errors/error';

const app = express();

if (config.nodeEnv !== 'test') {
  app.use(errorLogger);
  app.use(successHandler);
}

// Set security HTTP headers
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// DO NOT REMOVE: Used to ping if the server is still up and running.
app.get('/', (req, res) => {
  return res.status(httpStatus.OK).send('Hello From Surveva Backend!');
});

app.use('/api/v1', routes);

// convert error to ApiError, if needed
app.use(errorConverter);

app.use(errorHandler);

export default app;
