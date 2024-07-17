import express from 'express';

import httpStatus from 'http-status';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes';
import mongoose from 'mongoose';
import {
  config,
  logger,
  errorHandler as errorLogger,
  successHandler,
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

// DO NOT REMOVE: Used to ping if the server is still up and running.
app.get('/', (req, res) => {
  return res.status(httpStatus.OK).send('Hello From Surveva Backend!');
});

app.use('/api/v1', routes);

const PORT = 5000 || process.env.PORT;

mongoose.set('strictQuery', config.nodeEnv === 'development' ? true : false);
// Connect to MongoDB and run server.
mongoose
  .connect(config.mongoDBUri)
  .then(async () => {
    logger.info('Connected to MongoDB');
    // Text index the `question` field in the Polls collection to allow for text searching later on.
    const db = mongoose.connection.db;
    const pollsCollection = db.collection('polls');
    await pollsCollection.createIndex({ question: 'text' });
    logger.info('Indexed pollsCollection');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Error connecting to MongoDB', err);
  });

// convert error to ApiError, if needed
app.use(errorConverter);

app.use(errorHandler);

let server: any;
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
