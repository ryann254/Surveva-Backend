import mongoose from 'mongoose';

import { config, logger } from './config';
import app from './app';

const PORT = 5000 || process.env.PORT;

mongoose.set('strictQuery', config.nodeEnv === 'development' ? true : false);
// Connect to MongoDB and run server.
mongoose
  .connect(config.nodeEnv === 'development' ? config.mongoDBUri : config.mongoDBUriProd)
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

// Incase of any unexpected error, log it and exit the process.
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
