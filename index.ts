import express from 'express';
import dotenv from 'dotenv';
import httpStatus from 'http-status';

dotenv.config();

const app = express();

// DO NOT REMOVE: Used to ping if the server is still up and running.
app.get('/', (req, res) => {
  return res.status(httpStatus.OK).send('Hello From Surveva Backend!');
});

const PORT = 5000 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
