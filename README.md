# Surveva Backend

By following the guidelines and commands listed below, you can configure and run the Surveva Backend locally.
This backend comes with many built-in features such as authentication using Google/Facebook and JWT, error handling, API documentation, and pagination. 

## Quick Start

To run this project first, clone the repo:

```bash
git clone https://github.com/ryann254/Surveva-Backend.git
cd Surveva-Backend
```

Install the dependencies:

```bash
npm install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Table of Contents

- [Commands](#commands)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Logging](#logging)
- [Proprietary Notice](#proprietary-notice)

## Commands

Running locally:

```bash
npm run dev
```

Running in production:

```bash
npm run build
npm run start
```

Commiting changes

```bash
npm commit -m "feat" => for new features
npm commit -m "fix" => for bug fixes
```

## Project Structure

```
.
├── config                            # All config files(logger, morgan, roles)
├── controllers                       # All controllers(category, user, poll)
├── errors                            # Custom error handlers
├── middlewares                       # Custom middleware(auth middleware)
├── mongodb/models                    # All mongodb models(category, user, poll)
├── routes                            # All route files
├── services                          # All service files 
├── utils                             # Utility functions
├── index.ts
├── app.ts
├── package-lock.json                         
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:5000/api/v1/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/social` - social login(google & facebook)\
`POST /v1/auth/logout` - logout\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password\
`POST /v1/auth/send-verification-email` - send verification email\
`POST /v1/auth/verify-email` - verify-email\

**User routes**:\
`POST /v1/user` - create a user\
`GET /v1/user/:userId` - get user\
`PATCH /v1/user/:userId` - update user\
`DELETE /v1/user/:userId` - delete user

**Poll routes**:\
`POST /v1/poll` - create a poll\
`GET /v1/poll` - get all polls\
`GET /v1/poll/:searchTerm` - search polls\
`GET /v1/poll/:pollId` - get a poll\
`PATCH /v1/poll/:pollId` - update a poll\
`DELETE /v1/poll/:pollId` - delete a poll\

**Category routes**:\
`POST /v1/category` - create a category\
`GET /v1/poll` - get all categories\
`PATCH /v1/poll/:pollId` - update a category\
`DELETE /v1/poll/:pollId` - delete a category\

## Error Handling

The app has a centralized error-handling mechanism.

The controllers are wrapped inside the catchAsync utility wrapper, which catches the errors and forwards them to the error handling middleware (by calling `next(error)`). Here's an example:

```javascript
import catchAsync from '../utils/catchAsync';

const controller = catchAsync(async (req, res) => {
  //This error will be forwarded to the error-handling middleware
  throw new Error('Something wrong happened');
});
```

The error-handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```javascript
import httpStatus from 'http-status';
import { ApiError } from '../errors';
import { User } from '../mongodb/models/user';

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
};
```

## Validation

Request data is validated using [Zod](https://zod.dev/). Check the [documentation](https://zod.dev/) for more details on how to use Zod validation objects.

The validation happens directly in the controllers by using the Schema.parse() method. For example when creating a User Schema:

```javascript
export const UserObject = z.object({
  username: z.string().min(3),
  password: z.string().min(8).optional(),
  email: z.string().email(),
  role: z.nativeEnum(Roles),
  profilePic: z.string(),
  ...etc
  ),
});
```

Then, you can use the UserObject schema to validate request data to verify the data has all the required fields:

```javascript
const parsedUser = UserObject.parse(req.body);
```

## Authentication

To require authentication for certain routes, you can use the `auth` middleware.

```javascript
import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import { createPollController } from '../controllers/poll.controller';


const router = express.Router();

router.route('/').post(authMiddleware(), createPollController);
```

These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

## Authorization

The `auth` middleware can also be used to require certain rights/permissions to access a route.

```javascript
import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import { createPollController } from '../controllers/poll.controller';

const router = express.Router();

router.route('/').post(authMiddleware(['managePolls']), createPollController);
```

In the example above, an authenticated user can access this route only if that user has the `managePolls` permission.

The permissions are role-based. You can view the permissions/rights of each role in the `config/enum.ts` file.

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

## Logging

Import the logger from `config/logger.ts`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```javascript
import { logger } from '../config';

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.
It is up to the server (or process manager) to actually read them from the console and store them in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).

## Proprietary Notice

© [2024] [Surveva]. All Rights Reserved.

This software is proprietary and confidential information of [Surveva]. Unauthorized copying, distribution, or modification of this software is strictly prohibited and may result in legal action.
