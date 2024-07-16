import express from 'express';

import httpStatus from 'http-status';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes';
import mongoose from 'mongoose';
import { config } from './config';

const app = express();

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

// Connect to MongoDB and run server.
mongoose
  .connect(config.mongoDBUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Text index the `question` field in the Polls collection to allow for text searching later on.
    const db = mongoose.connection.db;
    const pollsCollection = db.collection('polls');
    await pollsCollection.createIndex({ question: 'text' });
    console.log('Indexed pollsCollection');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });
