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
- [License](#license)

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
