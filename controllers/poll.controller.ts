import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  checkForCategoryAndLanguageOpenAI,
  checkForModeration,
  createPoll,
  deletePoll,
  getAllPolls,
  getPollById,
  searchPolls,
  updatePoll,
  verifyPollOwnership,
} from '../services/poll.service';
import { sendAmplitudeAnalytics } from '../utils/handleAmplitudeAnalytics';
import { QMSObject } from '../mongodb/models/qms';
import catchAsync from '../utils/catchAsync';
import { ApiError } from '../errors';
import { logger, TokenTypes } from '../config';
import { verifyToken } from '../services/token.service';
import mongoose from 'mongoose';

export const createPollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');

    const parsedPoll = QMSObject.parse(req.body);
    // Check for moderation using the open ai api
    const contentIsHarmful = await checkForModeration(parsedPoll.question);

    if (!contentIsHarmful) {
      // Check for category and language from the open ai api
      const updatedPoll = await checkForCategoryAndLanguageOpenAI(parsedPoll);
      const poll = await createPoll(updatedPoll);
      // Send `poll_created` analytic to Amplitude
      if (poll) {
        sendAmplitudeAnalytics('poll_created');
      }

      return res.status(httpStatus.CREATED).json(poll);
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message:
        'The content you have posted is potentially harmful. Edit it and try again',
    });
  }
);

export const searchPollsController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.searchTerm)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Search term is empty');

    const polls = await searchPolls(req.params.searchTerm);
    return res.status(httpStatus.OK).json(polls);
  }
);

export const updatePollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.body)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Request body is empty');
    if (!req.params.pollId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Poll ID is required');

    // Use the user's id to make sure the poll belongs to the user.
    const pollBelongsToUser = await verifyPollOwnership(req);

    if (pollBelongsToUser && req.body.question) {
      const parsedPoll = QMSObject.parse(req.body);
      // Check for moderation using the open ai api
      const contentIsHarmful = await checkForModeration(
        parsedPoll.question || ''
      );

      if (!contentIsHarmful) {
        // Check for category and language from the open ai api
        const updatedPoll = await checkForCategoryAndLanguageOpenAI(parsedPoll);
        const poll = await updatePoll(req.params.pollId, updatedPoll);
        return res.status(httpStatus.OK).json(poll);
      }
      return res.status(httpStatus.BAD_REQUEST).json({
        message:
          'The content you have posted is potentially harmful. Edit it and try again',
      });
    }
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: "You're Not allowed to perform this action" });
  }
);

export const getAllPollsController = catchAsync(
  async (req: Request, res: Response) => {
    const polls = await getAllPolls();
    return res.status(httpStatus.OK).json(polls);
  }
);

export const getPollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.pollId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Poll ID is required');

    const poll = await getPollById(req.params.pollId);
    return res.status(httpStatus.OK).json(poll);
  }
);

export const deletePollController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.params.pollId)
      throw new ApiError(httpStatus.BAD_REQUEST, 'Poll ID is required');

    // Use the user's id to make sure the poll belongs to the user.
    const pollBelongsToUser = await verifyPollOwnership(req);

    if (pollBelongsToUser) {
      await deletePoll(req.params.pollId);
      return res
        .status(httpStatus.OK)
        .json({ message: 'Poll deleted successfully' });
    }
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: "You're Not allowed to perform this action" });
  }
);
