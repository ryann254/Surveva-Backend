import express from 'express';
import dotenv from 'dotenv';
import httpStatus from 'http-status';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes';

dotenv.config();

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
